-- 004 — new patient vs follow-up, and local vs international
--
-- The website now asks every patient whether this is their first visit or a
-- follow-up. booking_requests had nowhere to keep that, so this adds
-- visit_type ('new' | 'follow_up'), and teaches book_website_slot() to write
-- it — along with patient_type = 'local' for clinic bookings, matching the
-- values the admin platform already uses ('local' / 'international').
--
-- International requests don't take a slot; api/booking.js inserts them
-- straight into booking_requests with clinic 'International / Online' and
-- patient_type 'international'.
--
-- Run after 003. Re-running is safe.

alter table public.booking_requests
  add column if not exists visit_type text;

alter table public.booking_requests
  drop constraint if exists booking_requests_visit_type_check;
alter table public.booking_requests
  add constraint booking_requests_visit_type_check
  check (visit_type is null or visit_type in ('new', 'follow_up'));

-- The old 8-argument version must go, or PostgREST can't tell the two apart.
drop function if exists public.book_website_slot(uuid, text, date, time, text, text, text, text);

create or replace function public.book_website_slot(
  p_clinic_id  uuid,
  p_clinic     text,
  p_slot_date  date,
  p_start_time time,
  p_name       text,
  p_phone      text,
  p_concern    text default null,
  p_email      text default null,
  p_visit_type text default null
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

  v_txt := to_char(p_start_time, 'FMHH12:MI AM');

  insert into booking_requests
    (patient_name, phone, whatsapp, email, clinic, booking_date, booking_slot,
     concern, slot_id, booking_type, referral_source, patient_type, visit_type)
  values
    (p_name, p_phone, p_phone, p_email, p_clinic,
     to_char(p_slot_date, 'YYYY-MM-DD'), v_txt,
     nullif(btrim(coalesce(p_concern, '')), ''), v_slot, 'standard', 'website',
     'local', p_visit_type)
  returning id into v_req;

  update appointment_slots
     set status = 'held'
   where id = v_slot;

  return query select v_req, v_slot, v_txt;
end;
$$;

revoke all on function public.book_website_slot from public, anon, authenticated;
grant execute on function public.book_website_slot to service_role;
