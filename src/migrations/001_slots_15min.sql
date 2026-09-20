-- 001 — move the schedule to 15-minute slots, 11:00–23:00
--
-- Run in Supabase → SQL Editor ONE SECTION AT A TIME, reading each result
-- before moving to the next. Do not paste the whole file and press Run.
-- Sections 1 and 2 only look; nothing changes until section 3.
--
-- clinic_schedules is the single definition of when each clinic works —
-- weekday, hours and slot_minutes — and the admin platform's slot generator
-- reads it. So changing that table is what makes future generation produce
-- 15-minute slots; section 4 then rebuilds the slots that already exist.
--
-- Nothing here is hardcoded about which clinic opens when. It all comes from
-- clinic_schedules.


-- ============================================================ 1. LOOK FIRST

select l.name_en, s.weekday, s.start_time, s.end_time, s.slot_minutes, s.active
from clinic_schedules s
join clinic_locations l on l.id = s.clinic_id
order by l.name_en, s.weekday;
-- weekday: 0 = Sunday … 6 = Saturday

-- What exists now, by slot length:
select l.name_en,
       extract(epoch from (a.end_time - a.start_time)) / 60 as minutes,
       a.status, count(*) as slots,
       min(a.slot_date) as first_day, max(a.slot_date) as last_day
from appointment_slots a
join clinic_locations l on l.id = a.clinic_id
group by 1, 2, 3
order by 1, 2, 3;

-- Future slots that will be PRESERVED — staff put these here:
select l.name_en, a.slot_date, a.start_time, a.status, a.blocked_reason
from appointment_slots a
join clinic_locations l on l.id = a.clinic_id
where a.slot_date >= current_date and a.status <> 'open'
order by a.slot_date, a.start_time;


-- ========================================================= 2. SAFETY CHECK
-- Must return ZERO rows before the unique index in section 5 can be created.

select clinic_id, slot_date, start_time, count(*)
from appointment_slots
group by 1, 2, 3
having count(*) > 1;


-- ====================================================== 3. THE REAL FIX
-- One statement. From here on, anything the admin platform generates comes
-- out at 15 minutes, 11:00–23:00, for every active clinic schedule.

update clinic_schedules
   set slot_minutes = 15,
       start_time   = time '11:00',
       end_time     = time '23:00'
 where active;

-- Confirm:
select l.name_en, s.weekday, s.start_time, s.end_time, s.slot_minutes
from clinic_schedules s
join clinic_locations l on l.id = s.clinic_id
order by l.name_en, s.weekday;


-- ============================================================== 4. THE LOCK
-- Two things at once. It stops two patients taking the same slot at the same
-- instant — and, because it exists before section 5 runs, it makes a faulty
-- rebuild fail loudly and roll back instead of quietly writing duplicates.
-- Section 2 must have returned zero rows first.

create unique index if not exists appointment_slots_unique_slot
  on public.appointment_slots (clinic_id, slot_date, start_time);


-- ========================================== 5. REBUILD THE EXISTING SLOTS
-- Section 3 only governs what gets generated next. The slots already sitting
-- in appointment_slots are still 20-minute rows, so rebuild them here.
--
-- One transaction: it all lands, or none of it does.
-- Adjust the horizon on the next line if you generate further ahead.

begin;

create temporary table _cfg on commit drop as select date '2027-03-31' as horizon;

-- 5a. Clear future OPEN slots only. Held, blocked and closed slots survive,
--     and so does anything a booking or request already points at.
delete from appointment_slots s
using _cfg c
where s.slot_date >= current_date
  and s.status = 'open'
  and s.closed_by_booking_id is null
  and not exists (select 1 from booking_requests r where r.slot_id = s.id)
  and not exists (select 1 from bookings b where b.slot_id = s.id);

-- 5b. Rebuild from clinic_schedules.
insert into appointment_slots (clinic_id, slot_date, start_time, end_time, status)
select g.clinic_id, g.slot_date, g.start_time, g.end_time, 'open'
from (
  select
    s.clinic_id,
    d::date as slot_date,
    (s.start_time + make_interval(mins => n * s.slot_minutes))::time       as start_time,
    (s.start_time + make_interval(mins => (n + 1) * s.slot_minutes))::time as end_time
  from clinic_schedules s
  cross join _cfg c
  cross join generate_series(current_date, c.horizon, interval '1 day') d
  cross join generate_series(0, 287) n
  where s.active
    and extract(dow from d)::int = s.weekday
    -- Count in MINUTES, never by adding intervals to a time. time + interval
    -- wraps silently past midnight: 11:00 + 13h is 00:00, which is still
    -- "<= 23:00", so the loop runs on round the clock and fills the whole day.
    and (n + 1) * s.slot_minutes
        <= extract(epoch from (s.end_time - s.start_time)) / 60
) g
-- never duplicate a slot that already exists at that exact time
where not exists (
  select 1 from appointment_slots x
  where x.clinic_id = g.clinic_id and x.slot_date = g.slot_date
    and x.start_time = g.start_time
)
-- never lay a new slot across one staff deliberately held, blocked or closed
and not exists (
  select 1 from appointment_slots x
  where x.clinic_id = g.clinic_id and x.slot_date = g.slot_date
    and x.status <> 'open'
    and x.start_time < g.end_time
    and x.end_time   > g.start_time
);

commit;


-- ================================================================ 6. VERIFY

-- Expect 48 slots per clinic day, 11:00 through 22:45.
select l.name_en, a.slot_date, count(*) as slots,
       min(a.start_time) as opens, max(a.start_time) as last_slot
from appointment_slots a
join clinic_locations l on l.id = a.clinic_id
where a.slot_date between current_date and current_date + 21
group by 1, 2
order by 2, 1;

-- What the website will actually offer — its 15:00–20:45 window, 24 slots:
select l.name_en, a.slot_date, count(*) as bookable_online
from appointment_slots a
join clinic_locations l on l.id = a.clinic_id
where a.status = 'open'
  and a.start_time between time '15:00' and time '20:45'
  and a.slot_date between current_date and current_date + 21
group by 1, 2
order by 2, 1;
