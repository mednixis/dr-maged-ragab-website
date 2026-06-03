# drmagedragab.com Production Build Order

## 1. Owner Accounts

Create these accounts with the owner or Mednixis email, not a developer email.

- Domain/DNS: Cloudflare or Vercel
- Hosting: Vercel
- Database/Auth/Storage: Supabase
- Payment gateway: Paymob or PayTabs Egypt
- Messaging: WhatsApp Business API provider and SMS provider
- Email: Google Workspace or Microsoft 365

Recommended owner emails:

- owner@drmagedragab.com
- admin@mednixis.com

## 2. Domain

Primary domain:

- drmagedragab.com

Recommended additional domains:

- drmagedragab.net
- drmagedragabclinic.com

Public routes:

- www.drmagedragab.com: public website
- admin.drmagedragab.com: backend and CRM dashboard
- api.drmagedragab.com: backend API
- files.drmagedragab.com: protected medical file delivery if needed

## 3. Full Access Roles

Owner / Super Admin:

- Domain
- Hosting
- Supabase database
- Supabase Auth
- Storage
- Payment gateway
- Users and permissions
- Backups
- Audit logs

Mednixis Admin:

- Website content
- Backend
- CRM
- Bookings
- Payments
- Reports
- Surgeries
- User roles except owner removal

Secretary:

- Bookings
- CRM
- Patient communication
- Clinic schedules
- Surgery sheet
- Attendance marking
- Follow-up tasks

Doctor View:

- Reports
- Approvals
- Patient notes
- Surgery notes
- Follow-up review

Content Editor:

- Website text
- Arabic/English content
- Photos
- Articles
- Media
- Services
- Locations

## 4. Website CMS

The admin dashboard needs a Content section for:

- Homepage images
- Doctor biography
- Services
- Conditions
- Procedures
- Articles
- Media/videos
- Clinic locations
- Contact numbers
- Testimonials
- Arabic/English text

## 5. Booking Backend

Required behavior:

- Patient selects clinic/date/slot.
- Booking is created as pending.
- Secretary/admin reviews it.
- On confirmation, the backend closes the exact slot.
- Closed slots disappear from patient booking.
- Google Calendar event is created after confirmation only.
- CRM sends location/date/time message.

Critical database function:

- confirm_booking_and_close_slot()

This is included in database-schema.sql.

## 6. CRM Automation

After booking confirmation:

- Send selected clinic location and Google Maps link.
- Send appointment date and time.
- Send preparation instructions.
- Send payment note.

End of each clinic day:

- Find all patients marked attended.
- Send review/follow-up message.
- Create CRM task if the patient replies with a concern.

## 7. Surgery Backend

Surgeries section must include:

- Surgery type
- Patient name
- Age
- Phone number
- Date
- Time
- Place
- Recovery time
- Follow-up consultation date
- Notes
- Status

Automations:

- Recovery time creates follow-up reminders.
- Secretary receives follow-up tasks.
- Patient receives recovery message.
- Doctor view shows post-op notes.

## 8. Secure Payment

Local patients:

- Payment in clinic only.
- No online payment button.

International Zoom:

- Full consultation fee: $50 or 2500 EGP
- Required 50% deposit: $25 or 1250 EGP
- Pay Now button sends patient to secure hosted payment page.
- Payment gateway webhook updates payment status.
- Admin confirms after deposit status is paid.

Recommended gateways:

- Paymob Egypt
- PayTabs Egypt

## 9. Security

Required:

- HTTPS SSL
- Admin login
- Two-factor authentication for owner/admin
- Role-based permissions
- Supabase Row Level Security
- Private medical report storage
- Payment webhook signature verification
- Audit log for every sensitive change
- Daily database backups

## 10. Deployment Order

1. Buy drmagedragab.com.
2. Create owner email.
3. Create Cloudflare/Vercel/Supabase/payment accounts with owner email.
4. Deploy public website.
5. Add domain DNS records.
6. Create Supabase project.
7. Run database-schema.sql.
8. Run supabase-rls-policies.sql.
9. Connect admin login to Supabase Auth.
10. Connect booking form to database.
11. Connect slot locking.
12. Connect CRM messaging.
13. Connect payment gateway.
14. Connect content editor.
15. Connect surgery sheet/calendar.
16. Enable backups, audit logs, and 2FA.

