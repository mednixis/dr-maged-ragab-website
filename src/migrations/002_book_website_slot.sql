-- 002 — one transaction that takes a slot and files the request
--
-- The website cannot do this as two REST calls. Between "is 4:00 PM free?" and
-- "mark 4:00 PM taken" there is a gap, and on a busy evening two patients will
-- land in it. This function closes the gap: it locks the slot row, writes the
-- request, and flips the slot, all or nothing.
--
-- Run after 001. Re-running is safe — it replaces the function.

create or replace function public.book_website_slot(
  p_clinic_id  uuid,
  p_clinic     text,          -- the clinic's display name, as booking_requests stores it
  p_slot_date  date,
  p_start_time time,
  p_name       text,
  p_phone      text,
  p_concern    text default null,
  p_email      text default null
)
returns table (request_id uuid, slot_id uuid, booking_slot text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_slot uuid;
  v_req  uuid;
  v_txt  text;
begin
  -- Take the slot first, with a row lock. Anyone else asking for this exact
  -- slot waits here, then finds it is no longer 'open' and is turned away.
  select id into v_slot
  from appointment_slots
  where clinic_id  = p_clinic_id
    and slot_date  = p_slot_date
    and start_time = p_start_time
    and status     = 'open'
  for update;

  if v_slot is null then
    raise exception 'slot_unavailable' using errcode = 'P0001';
  end if;

  -- Match the text format the platform already uses: "3:15 PM", no leading zero.
  v_txt := to_char(p_start_time, 'FMHH12:MI AM');

  insert into booking_requests
    (patient_name, phone, whatsapp, email, clinic, booking_date, booking_slot,
     concern, slot_id, booking_type, referral_source)
  values
    (p_name, p_phone, p_phone, p_email, p_clinic,
     to_char(p_slot_date, 'YYYY-MM-DD'), v_txt,
     nullif(btrim(coalesce(p_concern, '')), ''), v_slot, 'standard', 'website')
  returning id into v_req;

  -- 'held' rather than 'blocked': this is a patient holding a time pending
  -- confirmation, not staff closing the clinic. closed_by_booking_id is left
  -- alone — it points at the bookings table, and no booking exists yet. The
  -- link back lives on booking_requests.slot_id.
  update appointment_slots
     set status = 'held'
   where id = v_slot;

  return query select v_req, v_slot, v_txt;
end;
$$;

-- Only the service_role key may call this. The anon key — the one a browser
-- could ever hold — must not be able to write bookings directly.
revoke all on function public.book_website_slot from public, anon, authenticated;
grant execute on function public.book_website_slot to service_role;


-- ---------------------------------------------------------------------------
-- Releasing a slot when a request is cancelled.
--
-- If staff cancel a website request, the slot should go back to 'open' so
-- somebody else can have it. This trigger does that automatically.

create or replace function public.release_slot_on_cancel()
returns trigger language plpgsql as $$
begin
  if new.status = 'cancelled' and coalesce(old.status, '') <> 'cancelled'
     and new.slot_id is not null then
    update appointment_slots
       set status = 'open'
     where id = new.slot_id and status = 'held';
  end if;
  return new;
end $$;

drop trigger if exists booking_requests_release_slot on public.booking_requests;
create trigger booking_requests_release_slot
  after update of status on public.booking_requests
  for each row execute function public.release_slot_on_cancel();
