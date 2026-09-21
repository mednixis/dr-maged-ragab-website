# drmagedragab.com

Bilingual website for Prof. Dr. Maged M. Ragab — Professor of Urology and Andrology,
Tanta University Hospital.

Static site. No framework, no npm, no build step on the host. Every page is real
HTML at a real URL, so search engines index all of it.

---

## Quick start

```bash
git clone <your-repo-url>
cd drmagedragab
python3 -m http.server 8000     # then open http://localhost:8000
```

That's it — the committed HTML *is* the site.

---

## 1. Deploy

The generated output is committed, so all three of these work with zero configuration.

### Vercel (recommended)

```bash
npm i -g vercel
vercel --prod
```

`vercel.json` is already set up: clean URLs, trailing slashes, `/` → `/ar/`,
one-year immutable caching on `/assets/*`, and security headers.

### Netlify

```bash
npm i -g netlify-cli
netlify deploy --prod
```

`netlify.toml` carries the same configuration.

### GitHub Pages

Settings → Pages → Deploy from branch → `main` / root. `.nojekyll` is present so
GitHub serves the files as-is.

### Custom domain

Point `drmagedragab.com` and `www.drmagedragab.com` at the host, then pick one as
canonical and 301 the other to it. `SITE` in `src/build.py` must match the one you
choose — it generates every canonical and hreflang tag.

---

## 2. Structure

```
├── index.html              redirect → /ar/
├── 404.html
├── ar/                     Arabic (RTL) — 7 pages
│   ├── index.html          home
│   ├── about/              academic profile
│   ├── services/           47 services in 8 categories
│   ├── procedures/         8 procedures + surgical logbook
│   ├── clinics/            locations, hours, contact
│   ├── faq/
│   └── booking/            3-step appointment flow
├── en/                     English (LTR) — the same 7 pages
├── assets/
│   ├── styles.css          design system (~24 KB)
│   ├── app.js              booking + menu + jump list (~10 KB)
│   ├── logo.svg
│   ├── portrait.jpg
│   └── hero.jpg
├── sitemap.xml             28 URLs with hreflang pairs
├── robots.txt
├── api/                    serverless functions — see §6
│   ├── booking.js          POST — validate, save to Supabase, email the clinic
│   └── availability.js     GET  — open slots, read from appointment_slots
└── src/                    the generator — see §3
    ├── data.json           ALL site content, bilingual
    ├── build.py
    ├── migrations/         SQL to run in Supabase — see §6
    └── parts/              page templates
```

---

## 3. Editing content

**Do not edit the HTML in `ar/` or `en/` — it is generated and will be overwritten.**

All content lives in `src/data.json`:

| Key | Holds |
|---|---|
| `SERVICES` | 8 categories, 47 services |
| `PROCEDURES` | 8 procedures; a trailing `1` marks a "Signature" one |
| `CONDITIONS` | the common-conditions chips |
| `LOGBOOK` | operations with counts, from the eLogbook |
| `TIMELINE`, `CVBLOCKS` | academic profile |
| `CLINICS` | names, areas, days, hours, and `wd` (weekday numbers, 0 = Sunday) |
| `FAQ` | questions and answers |

Every entry is `[Arabic, English]`. Page-level copy (headings, intros, buttons)
lives in `src/parts/*.html` as `data-ar` / `data-en` attribute pairs.

Phone numbers, WhatsApp numbers and map links are in `CONTACT` at the top of
`src/build.py`.

Then rebuild:

```bash
pip3 install beautifulsoup4
python3 src/build.py
git add -A && git commit -m "content update" && git push
```

The build resolves the language pairs, writes the text into both language trees,
and regenerates the sitemap.

---

## 4. How the two languages work

Each language is a separate set of real HTML files with the text baked in — not a
runtime toggle. That matters: Google indexes `/en/services/` and `/ar/services/`
as distinct pages, each with its own title, description and canonical.

Every page carries `hreflang` links to its counterpart plus `x-default` → Arabic.
The header's language button is a plain `<a>` to the same page in the other
language, so you never lose your place when switching.

### RTL

Layout uses **CSS logical properties** throughout — `margin-inline`,
`padding-inline-start`, `border-inline-start`, `inset-inline`. Setting `dir` on
`<html>` mirrors the entire layout with no per-language CSS.

**Keep this discipline.** Do not introduce `left` / `right` or `margin-left` — it
will look correct in one language and break in the other.

Two things don't mirror automatically and are handled explicitly:

- Arrow icons — `html[lang="en"] .arw { transform: scaleX(-1) }`
- Latin numerals inside Arabic text — wrapped in `dir="ltr"`, otherwise `25+`
  renders as `+25`

---

## 5. Design system

Tokens are in `:root` in `assets/styles.css`. Nothing is hard-coded outside it.

```
--bone   #F5F3EF   page ground
--rule   #D7D2C8   hairlines
--ink    #17181A   text, dark bands
--body   #4C525B   body copy
--muted  #5E6670   captions
--signal #1B5FD9   interaction ONLY
```

Two rules:

1. `--signal` is never decorative — booking buttons and links only.
2. `--signal` is never text on `--ink` (3:1, fails). Dark surfaces use
   `--signal-lift` `#8FB3F5` (8.3:1) or bone.

**Type** — Arabic: Almarai (300/400/700/800 — no other weights exist).
English display: Newsreader. English body: Archivo. Numerals in both: Newsreader
with `tabular-nums`.

---

## 6. The booking backend

The booking form is wired into the **existing admin platform's database** —
Supabase project `oxmqwuewdrqnltwbfllq` — not a separate one. A website booking
lands in `booking_requests` with `status = 'pending'` and appears in Pending
Confirmations alongside phone bookings, and it holds a real slot in
`appointment_slots`, so the receptionist sees it immediately.

| Route | Does |
|---|---|
| `GET /api/availability` | reads `appointment_slots` — what is genuinely open |
| `POST /api/booking` | calls `book_website_slot()`, then emails the clinic |

### a) The two grids must match

The backend now runs **15-minute slots, 11:00–23:00**. The website offers only
**15:00–20:45** of that — twenty-four slots ending at 21:00. The extra hours
exist for staff to place patients by phone; the website simply doesn't show them.

This matters more than it looks. When the two grids differ — 20-minute slots in
the database, 15 on the website — there is no correct way to map one onto the
other, and every mapping either blocks free times or offers taken ones. Keep
them the same length. If you change the slot length, change both.

### b) Run the migrations

Supabase → SQL Editor, in order:

1. `src/migrations/001_slots_15min.sql` — **run it one section at a time**, not
   as one paste. Sections 1 and 2 only look. Section 3 sets
   `clinic_schedules.slot_minutes = 15` and the hours to 11:00–23:00, which is
   what makes the platform's own generator produce 15-minute slots from then
   on. Section 4 adds the unique index. Section 5 rebuilds the slots that
   already exist; `held`, `blocked` and `closed` ones are preserved, as is
   anything a booking or request points at, and the past is untouched.
2. `src/migrations/002_book_website_slot.sql` — the booking function.
3. `src/migrations/003_release_slot_on_cancel.sql` — cancelling anywhere in the
   dashboard puts the time back on the website. Covers a pending request, a
   confirmed booking, a soft delete and a hard delete; deliberately leaves
   `blocked` slots blocked. Nobody should need Supabase to free a slot.

### c) Set the environment variables

Vercel → Project → Settings → Environment Variables, for Production, Preview
and Development.

| Name | Value |
|---|---|
| `SUPABASE_URL` | `https://oxmqwuewdrqnltwbfllq.supabase.co` |
| `SUPABASE_SERVICE_KEY` | the **service_role** key |
| `CLINIC_KFS_ID` | `clinics.id` for Kafr El Sheikh |
| `CLINIC_MVD_ID` | `clinics.id` for Mivida |
| `RESEND_API_KEY` | from resend.com |
| `BOOKING_TO` | `drmagedragabclinics@gmail.com` |
| `BOOKING_FROM` | `حجوزات الموقع <bookings@drmagedragab.com>` |

**The service_role key bypasses every row-level security rule in the database.**
It belongs only in this panel — never in the repo, never in `assets/*`, never in
a screenshot. Rotate it in Supabase if it is ever exposed.

Redeploy after adding variables. Vercel does not apply them to a deployment that
already exists.

### d) Verify the sending domain

Resend → Domains → add `drmagedragab.com` → add the DKIM and SPF records at your
DNS host. Until it verifies, mail from `bookings@drmagedragab.com` is rejected.
Use `onboarding@resend.dev` as `BOOKING_FROM` to test before DNS is ready.

### e) How a booking actually works

`book_website_slot()` does the whole thing in one transaction:

1. locks the slot row (`for update`) and checks it is still `open`
2. inserts into `booking_requests` — `booking_slot` as `"3:15 PM"` text and
   `booking_date` as `"YYYY-MM-DD"`, matching what the platform already stores,
   with `slot_id`, `booking_type = 'standard'`, `referral_source = 'website'`
   and the patient's optional reason in `concern`
3. flips the slot to `held`

That has to be one transaction. Between "is 4:00 free?" and "mark 4:00 taken"
there is a gap, and on a busy evening two patients will land in it. A second
patient hitting the same slot gets a clean 409 and is sent back a step with the
slot already struck out.

`closed_by_booking_id` is deliberately left null — it points at the `bookings`
table, and no confirmed booking exists yet. The link back is
`booking_requests.slot_id`.

### f) Behaviour worth knowing

- **The request is saved before the email is sent.** If Resend is down the
  booking is still recorded and the patient still gets a reference; the failure
  is logged, not surfaced. Check the table, not the inbox, if a booking is ever
  in doubt.
- **The reference number comes from the server**, derived from the request's
  uuid — `MR-0920-4F2A`. The browser never invents one.
- **Slots in the past are never offered.** Availability and booking both work
  in Cairo time (via the timezone database, so Egypt's DST is handled — never
  hardcode +3), and neither offers a slot starting within the next
  `LEAD_MINUTES`, currently 60. That constant is in both `api/availability.js`
  and `api/booking.js` and the two must match. Set it to 0 to allow booking up
  to the minute.
- **If there are no open slots the page says so** and points at WhatsApp and
  the phone, rather than showing an empty grid. Same if the API can't be
  reached. This is what patients see if slot generation ever falls behind, so
  keep slots generated well ahead.
- The form carries a hidden honeypot (`#bkCompany`). Bots fill it; the server
  saves nothing and returns a plausible reference. Leave it in place.
- Cancelling a request frees its slot automatically, via the trigger in 002.
- The day chips and the times both come from `appointment_slots`. Nothing about
  the schedule is hardcoded in `app.js` except the 15:00–20:45 public window.

### g) Where the schedule is defined

`clinic_schedules` — one row per clinic per weekday, with `start_time`,
`end_time` and `slot_minutes`. The admin platform's slot generator reads it, so
it is the only place the schedule should ever be changed. Migration 001 sets it
to 15 minutes, 11:00–23:00.

To change the clinic's hours or days later, edit that table and regenerate —
don't hand-write slots, and don't change the interval in one place only.

### h) How a website booking gets confirmed

`book_website_slot()` leaves the slot `held` and the request `pending`. Staff
then convert the request into a `bookings` row and call the platform's existing
`confirm_booking_and_close_slot()`, which accepts `('open', 'held')`, sets the
slot to `closed`, stamps `closed_by_booking_id`, marks the booking confirmed and
queues a `message_jobs` row — so the patient's WhatsApp confirmation is already
automatic.

**The conversion must copy `booking_requests.slot_id` onto `bookings.slot_id`.**
If it doesn't, `confirm_booking_and_close_slot()` raises `Booking has no slot`
and staff cannot confirm. That code lives in the admin platform. Test one
booking end to end after deploying.

Cancelling a request releases its slot automatically (the trigger in 002).
A `held` slot on a `pending` request that nobody ever actions stays held — worth
a nightly sweep releasing holds for dates now in the past.

### i) Netlify

The API is written for Vercel's function runtime. On Netlify both files need
moving to `netlify/functions/` and the handler signature changing. Deploy to
Vercel unless there's a reason not to.

## 7. Decisions to keep

These were deliberate fixes to measured problems on the previous site. Reversing
them will cost bookings.

- **Booking is 3 steps, not 5.**
- **Reason for visit is optional.** It used to be required, which for an andrology
  practice is the single largest drop-off point. The page says so out loud — that
  sentence is a conversion argument, not filler.
- **Times are tappable chips, not a `<select>`.** Booked slots are shown struck
  through rather than hidden, so patients can see the clinic is busy.
- **Each clinic's days and hours appear before you choose it**, so nobody picks the
  wrong branch and backtracks.
- **The booking summary stays visible** through the whole flow.
- **WhatsApp and phone are reachable from every booking step.** The old site had no
  phone number anywhere on `/booking`.
- **Fee, confirmation time and privacy are stated explicitly.** The old site
  answered none of the three.
- **Mobile has a sticky Book / WhatsApp / Call bar.** On the old site the booking
  button was hidden entirely below 768px and the phone number sat ~2,400px down a
  6,069px page.

---

## 8. Accessibility

Real `<button>`, `<a href>` and `<label for>` throughout — no click handlers on
divs. `aria-pressed` on selectable chips, `aria-invalid` plus inline errors on
fields, `aria-label` on icon-only controls, visible `:focus-visible` rings, 44px
minimum touch targets, `prefers-reduced-motion` respected, text contrast ≥ 4.5:1
(≥ 3:1 for large text).

---

## 9. Performance

Roughly 600 KB total, against 7.85 MB for the previous homepage alone — the old
`Maged photo.png` was 6.1 MB on its own.

**Before launch:** the source photograph is only 1086 × 723 (0.79 MP). The images
here are upscaled from it — sharpened interpolation, not real detail. Get the
original camera file from the event photographer, or shoot a studio portrait.
Then serve WebP/AVIF with `srcset`.

---

## 10. Known open item

The homepage and About page state **10,000+ surgeries**, carried over from the
previous site at the clinic's instruction. The Procedures page shows the eLogbook
extract — 789 operations, 2006–2017 — framed explicitly as a documented sample
from an earlier period, not a career total. Both are deliberate. Reconcile them if
an updated logbook becomes available.
