-- Supabase Row Level Security foundation for drmagedragab.com
-- Run after database-schema.sql.

alter table admin_profiles enable row level security;
alter table patients enable row level security;
alter table bookings enable row level security;
alter table appointment_slots enable row level security;
alter table payments enable row level security;
alter table medical_reports enable row level security;
alter table crm_leads enable row level security;
alter table crm_activities enable row level security;
alter table message_jobs enable row level security;
alter table surgeries enable row level security;
alter table surgery_followups enable row level security;
alter table content_pages enable row level security;
alter table media_assets enable row level security;
alter table audit_logs enable row level security;

create or replace function current_admin_role()
returns user_role
language sql
stable
as $$
  select role
  from admin_profiles
  where auth_user_id = auth.uid()
    and active = true
  limit 1
$$;

create or replace function is_admin()
returns boolean
language sql
stable
as $$
  select current_admin_role() in ('owner', 'mednixis_admin')
$$;

create or replace function can_manage_bookings()
returns boolean
language sql
stable
as $$
  select current_admin_role() in ('owner', 'mednixis_admin', 'secretary')
$$;

create or replace function can_view_medical()
returns boolean
language sql
stable
as $$
  select current_admin_role() in ('owner', 'mednixis_admin', 'doctor')
$$;

create or replace function can_edit_content()
returns boolean
language sql
stable
as $$
  select current_admin_role() in ('owner', 'mednixis_admin', 'content_editor')
$$;

-- Admin profiles
create policy "admins can view active profiles"
on admin_profiles for select
using (current_admin_role() is not null);

create policy "owner can manage profiles"
on admin_profiles for all
using (current_admin_role() = 'owner')
with check (current_admin_role() = 'owner');

-- Patients, bookings, CRM
create policy "booking team can manage patients"
on patients for all
using (can_manage_bookings() or can_view_medical())
with check (can_manage_bookings());

create policy "booking team can manage bookings"
on bookings for all
using (can_manage_bookings() or can_view_medical())
with check (can_manage_bookings());

create policy "booking team can manage slots"
on appointment_slots for all
using (can_manage_bookings())
with check (can_manage_bookings());

create policy "admins can manage payments"
on payments for all
using (is_admin() or current_admin_role() = 'secretary')
with check (is_admin() or current_admin_role() = 'secretary');

create policy "medical users can view reports"
on medical_reports for select
using (can_view_medical() or can_manage_bookings());

create policy "booking team can upload reports"
on medical_reports for insert
with check (can_manage_bookings());

create policy "crm team can manage leads"
on crm_leads for all
using (can_manage_bookings() or is_admin())
with check (can_manage_bookings() or is_admin());

create policy "crm team can manage activities"
on crm_activities for all
using (can_manage_bookings() or is_admin())
with check (can_manage_bookings() or is_admin());

create policy "admins can manage message jobs"
on message_jobs for all
using (is_admin() or current_admin_role() = 'secretary')
with check (is_admin() or current_admin_role() = 'secretary');

-- Surgeries
create policy "surgery team can manage surgeries"
on surgeries for all
using (is_admin() or current_admin_role() in ('secretary', 'doctor'))
with check (is_admin() or current_admin_role() in ('secretary', 'doctor'));

create policy "surgery team can manage followups"
on surgery_followups for all
using (is_admin() or current_admin_role() in ('secretary', 'doctor'))
with check (is_admin() or current_admin_role() in ('secretary', 'doctor'));

-- Website CMS
create policy "content editors can manage pages"
on content_pages for all
using (can_edit_content())
with check (can_edit_content());

create policy "content editors can manage media"
on media_assets for all
using (can_edit_content())
with check (can_edit_content());

-- Audit
create policy "admins can view audit logs"
on audit_logs for select
using (is_admin());

create policy "system can insert audit logs"
on audit_logs for insert
with check (current_admin_role() is not null);

