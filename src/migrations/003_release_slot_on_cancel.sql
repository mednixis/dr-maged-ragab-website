-- 003 — cancelling anywhere in the admin platform reopens the slot
--
-- A slot can be tied up by two different rows at two different stages:
--
--   booking_requests (pending)  → slot is 'held'
--   bookings (confirmed)        → slot is 'closed', closed_by_booking_id set
--
-- 002 already released the first case. This adds the second, plus soft deletes
-- and hard deletes, so that whichever way a booking is cancelled in the
-- dashboard, the time goes back on the website within the minute. Nobody
-- should ever have to open Supabase to free a slot.
--
-- Run once. Re-running is safe.

-- ---------------------------------------------------------------------------
-- One place that decides how a slot is freed.

create or replace function public.reopen_slot(p_slot_id uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  if p_slot_id is null then return; end if;
  update appointment_slots
     set status = 'open',
         closed_by_booking_id = null
   where id = p_slot_id
     -- never reopen something staff blocked deliberately: 'blocked' means the
     -- clinic is shut for that time, and a cancellation does not change that.
     and status in ('held', 'closed');
end $$;


-- ---------------------------------------------------------------------------
-- 1. A confirmed booking is cancelled in the dashboard.
--
-- bookings.status is an enum, so compare as text — that works whatever the
-- enum's labels are, and keeps working if a label is added later.

create or replace function public.bookings_release_slot()
returns trigger language plpgsql as $$
begin
  if new.status::text in ('cancelled', 'canceled', 'no_show')
     and coalesce(old.status::text, '') is distinct from new.status::text then
    perform public.reopen_slot(new.slot_id);
  end if;
  return new;
end $$;

drop trigger if exists bookings_release_slot on public.bookings;
create trigger bookings_release_slot
  after update of status on public.bookings
  for each row execute function public.bookings_release_slot();


-- ---------------------------------------------------------------------------
-- 2. A booking row is deleted outright.

create or replace function public.bookings_release_slot_del()
returns trigger language plpgsql as $$
begin
  perform public.reopen_slot(old.slot_id);
  return old;
end $$;

drop trigger if exists bookings_release_slot_del on public.bookings;
create trigger bookings_release_slot_del
  after delete on public.bookings
  for each row execute function public.bookings_release_slot_del();


-- ---------------------------------------------------------------------------
-- 3. A website request is cancelled, soft-deleted, or deleted.
--
-- This replaces the narrower version from 002: that one only handled 'held'
-- slots and left closed_by_booking_id alone.

create or replace function public.release_slot_on_cancel()
returns trigger language plpgsql as $$
begin
  if tg_op = 'DELETE' then
    perform public.reopen_slot(old.slot_id);
    return old;
  end if;

  if (new.status in ('cancelled', 'canceled', 'no_show')
      and coalesce(old.status, '') is distinct from new.status)
     or (new.deleted_at is not null and old.deleted_at is null) then
    perform public.reopen_slot(new.slot_id);
  end if;
  return new;
end $$;

drop trigger if exists booking_requests_release_slot on public.booking_requests;
create trigger booking_requests_release_slot
  after update on public.booking_requests
  for each row execute function public.release_slot_on_cancel();

drop trigger if exists booking_requests_release_slot_del on public.booking_requests;
create trigger booking_requests_release_slot_del
  after delete on public.booking_requests
  for each row execute function public.release_slot_on_cancel();


-- ---------------------------------------------------------------------------
-- 4. Check what is currently tied up with nothing live behind it.
--
-- Run this now and then. Any row it returns is a slot held or closed by a
-- booking that has since been cancelled — it should be empty.

select a.slot_date, a.start_time, a.status
from appointment_slots a
where a.status in ('held', 'closed')
  and a.slot_date >= current_date
  and not exists (
    select 1 from booking_requests r
    where r.slot_id = a.id and r.deleted_at is null
      and r.status not in ('cancelled', 'canceled', 'no_show'))
  and not exists (
    select 1 from bookings b
    where b.slot_id = a.id
      and b.status::text not in ('cancelled', 'canceled', 'no_show'))
order by a.slot_date, a.start_time;
