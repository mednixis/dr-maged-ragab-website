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
└── src/                    the generator — see §3
    ├── data.json           ALL site content, bilingual
    ├── build.py
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

## 6. The booking form is not connected yet

Everything else on the site is production-ready. The booking flow works end to end
in the browser but **sends nothing anywhere**. Two things to wire up:

### a) Submit

`assets/app.js`, in the `#step2` submit handler — look for the `TODO`. Validation
already passes before that point (name ≥ 3 chars, phone `/^01\d{9}$/`, checkbox).
POST to your endpoint, then call `setStep(3)` on success and show an error on
failure.

Since `app.js` is generated, put the change in the generator too, or stop
regenerating it.

### b) Availability — read this before launch

`taken()` in `app.js` is **fake**. It returns a deterministic pattern so the demo
looks plausible.

Replace it with a real query, and note:

- There are **24 slots per day** (15-minute intervals, 3:00–8:45 PM) per clinic.
- Availability must be fetched on load **and** re-fetched whenever the clinic or
  day changes. Without that, two patients can hold the same slot.
- Enforce uniqueness on `(clinic, date, time)` **server-side**. Disabling a button
  in the browser is a convenience, not a lock.

---

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
