-- Dr. Maged Ragab Website + Backend + CRM database foundation
-- Target: PostgreSQL / Supabase
-- Purpose: real admin login roles, website content editing, bookings, slot locking,
-- CRM automation, payments, reports, surgeries, follow-ups, and audit logs.

create extension if not exists pgcrypto;

create type user_role as enum ('owner', 'mednixis_admin', 'secretary', 'doctor', 'content_editor');
create type patient_type as enum ('local', 'international');
create type booking_status as enum ('pending', 'deposit_review', 'confirmed', 'attended', 'cancelled', 'no_show');
create type slot_status as enum ('open', 'held', 'closed', 'blocked');
create type payment_status as enum ('not_required', 'pending', 'paid', 'failed', 'refunded', 'pay_at_clinic');
create type message_status as enum ('queued', 'sent', 'failed', 'cancelled');
create type surgery_status as enum ('planning', 'scheduled', 'completed', 'cancelled', 'follow_up_due');

create table admin_profiles (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique,
  full_name text not null,
  email text not null unique,
  phone text,
  role user_role not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table clinic_locations (
  id uuid primary key default gen_random_uuid(),
  name_en text not null,
  name_ar text not null,
  address_en text not null,
  address_ar text not null,
  google_maps_url text,
  phone text,
  whatsapp text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table clinic_schedules (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid references clinic_locations(id) on delete cascade,
  weekday int not null check (weekday between 0 and 6),
  start_time time not null,
  end_time time not null,
  slot_minutes int not null default 20,
  active boolean not null default true,
  unique (clinic_id, weekday, start_time, end_time)
);

create table appointment_slots (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid references clinic_locations(id) on delete restrict,
  slot_date date not null,
  start_time time not null,
  end_time time not null,
  status slot_status not null default 'open',
  closed_by_booking_id uuid,
  blocked_reason text,
  created_at timestamptz not null default now(),
  unique (clinic_id, slot_date, start_time)
);

create table patients (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  phone text,
  whatsapp text,
  email text,
  country text,
  age int,
  gender text,
  preferred_language text not null default 'Arabic',
  main_concern text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table bookings (
  id uuid primary key default gen_random_uuid(),
  public_code text not null unique,
  patient_id uuid references patients(id) on delete restrict,
  patient_type patient_type not null,
  clinic_id uuid references clinic_locations(id) on delete restrict,
  slot_id uuid references appointment_slots(id) on delete restrict,
  pathway text not null,
  status booking_status not null default 'pending',
  payment_status payment_status not null default 'pending',
  deposit_amount numeric(10,2),
  deposit_currency text,
  notes text,
  confirmed_by uuid references admin_profiles(id),
  confirmed_at timestamptz,
  attended_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table payments (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid references bookings(id) on delete cascade,
  amount numeric(10,2) not null,
  currency text not null,
  status payment_status not null,
  provider text,
  provider_reference text,
  paid_at timestamptz,
  created_at timestamptz not null default now()
);

create table medical_reports (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid references patients(id) on delete cascade,
  booking_id uuid references bookings(id) on delete set null,
  file_name text not null,
  storage_path text not null,
  mime_type text,
  review_status text not null default 'awaiting_review',
  reviewed_by uuid references admin_profiles(id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

create table crm_leads (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid references patients(id) on delete set null,
  booking_id uuid references bookings(id) on delete set null,
  source text,
  campaign text,
  stage text not null default 'new_lead',
  next_action text,
  next_action_at timestamptz,
  owner_id uuid references admin_profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table crm_activities (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references crm_leads(id) on delete cascade,
  patient_id uuid references patients(id) on delete cascade,
  activity_type text not null,
  body text,
  due_at timestamptz,
  completed_at timestamptz,
  created_by uuid references admin_profiles(id),
  created_at timestamptz not null default now()
);

create table message_jobs (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid references patients(id) on delete cascade,
  booking_id uuid references bookings(id) on delete set null,
  channel text not null check (channel in ('whatsapp', 'sms', 'email')),
  template_key text not null,
  payload jsonb not null default '{}'::jsonb,
  status message_status not null default 'queued',
  scheduled_for timestamptz not null default now(),
  sent_at timestamptz,
  created_at timestamptz not null default now()
);

create table surgeries (
  id uuid primary key default gen_random_uuid(),
  surgery_code text not null unique,
  patient_id uuid references patients(id) on delete restrict,
  surgery_type text not null,
  patient_age int,
  patient_phone text,
  place text not null,
  surgery_date date,
  surgery_time time,
  recovery_time text,
  status surgery_status not null default 'planning',
  follow_up_consultation_at timestamptz,
  notes text,
  created_by uuid references admin_profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table surgery_followups (
  id uuid primary key default gen_random_uuid(),
  surgery_id uuid references surgeries(id) on delete cascade,
  patient_id uuid references patients(id) on delete cascade,
  follow_up_type text not null,
  due_at timestamptz not null,
  status text not null default 'pending',
  completed_at timestamptz,
  notes text,
  created_at timestamptz not null default now()
);

create table content_pages (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title_en text not null,
  title_ar text not null,
  body_en text,
  body_ar text,
  status text not null default 'draft',
  updated_by uuid references admin_profiles(id),
  updated_at timestamptz not null default now()
);

create table media_assets (
  id uuid primary key default gen_random_uuid(),
  title text,
  alt_text_en text,
  alt_text_ar text,
  storage_path text not null,
  used_on_page text,
  uploaded_by uuid references admin_profiles(id),
  created_at timestamptz not null default now()
);

create table audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references admin_profiles(id),
  action text not null,
  entity_table text not null,
  entity_id uuid,
  before_data jsonb,
  after_data jsonb,
  created_at timestamptz not null default now()
);

-- Slot-locking function:
-- confirms booking and closes the exact clinic/date/time slot in one transaction.
create or replace function confirm_booking_and_close_slot(
  p_booking_id uuid,
  p_admin_id uuid
) returns void
language plpgsql
as $$
declare
  v_slot_id uuid;
begin
  select slot_id into v_slot_id
  from bookings
  where id = p_booking_id
  for update;

  if v_slot_id is null then
    raise exception 'Booking has no slot';
  end if;

  update appointment_slots
  set status = 'closed',
      closed_by_booking_id = p_booking_id
  where id = v_slot_id
    and status in ('open', 'held');

  if not found then
    raise exception 'Slot is already closed or blocked';
  end if;

  update bookings
  set status = 'confirmed',
      confirmed_by = p_admin_id,
      confirmed_at = now(),
      updated_at = now()
  where id = p_booking_id;

  insert into message_jobs (patient_id, booking_id, channel, template_key, payload)
  select patient_id, id, 'whatsapp', 'booking_confirmed_location',
         jsonb_build_object('booking_code', public_code, 'pathway', pathway)
  from bookings
  where id = p_booking_id;
end;
$$;

-- End-of-day review automation seed:
-- a scheduled job should call this after each clinic day.
create or replace function queue_daily_review_messages(p_for_date date)
returns int
language plpgsql
as $$
declare
  v_count int;
begin
  insert into message_jobs (patient_id, booking_id, channel, template_key, scheduled_for)
  select patient_id, id, 'whatsapp', 'daily_review_request', now()
  from bookings
  where status = 'attended'
    and attended_at::date = p_for_date;

  get diagnostics v_count = row_count;
  return v_count;
end;
$$;

-- Helpful indexes
create index idx_slots_lookup on appointment_slots (clinic_id, slot_date, start_time, status);
create index idx_bookings_status on bookings (status, created_at);
create index idx_crm_stage on crm_leads (stage, next_action_at);
create index idx_message_jobs_queue on message_jobs (status, scheduled_for);
create index idx_surgeries_calendar on surgeries (surgery_date, surgery_time, status);

