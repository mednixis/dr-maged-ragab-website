/**
 * POST /api/booking
 *
 * Takes the slot and files the request in one database transaction (the
 * book_website_slot function — see src/migrations/002), then emails the clinic.
 *
 * The request is saved FIRST and the email sent after. If the email fails the
 * booking is still kept and the request still succeeds: losing a patient's
 * appointment because a mail provider hiccuped would be the worse failure.
 * Check the booking_requests table, not the inbox, if a booking is ever in
 * doubt.
 *
 * Required environment variables (Vercel → Settings → Environment Variables):
 *   SUPABASE_URL              https://oxmqwuewdrqnltwbfllq.supabase.co
 *   SUPABASE_SERVICE_ROLE_KEY service_role key — SERVER ONLY, never in the browser
 *                             (SUPABASE_SERVICE_KEY is accepted too)
 *   CLINIC_KFS_ID             clinics.id for Kafr El Sheikh
 *   CLINIC_MVD_ID             clinics.id for Mivida
 *   RESEND_API_KEY            from resend.com
 *   BOOKING_TO                drmagedragabclinics@gmail.com
 *   BOOKING_FROM             "حجوزات الموقع <bookings@drmagedragab.com>"
 *                             (the domain must be verified in Resend)
 */

/* The display names must match what booking_requests already stores, or the
   admin dashboard will group website bookings separately from phone ones. */
const CLINICS = {
  kfs: { id: process.env.CLINIC_KFS_ID, name: 'Kafr El Sheikh Clinic',
         ar: 'عيادة كفر الشيخ', en: 'Kafr El Sheikh Clinic' },
  mvd: { id: process.env.CLINIC_MVD_ID, name: 'Mivida Clinic',
         ar: 'عيادة ميفيدا', en: 'Mivida Clinic' },
  // No slot: a coordinator arranges the visit on WhatsApp. The name and
  // patient_type match what the admin platform already stores for these.
  intl: { intl: true, name: 'International / Online',
          ar: 'مريض دولي', en: 'International patient' },
};

const VISITS = {
  new:       { ar: 'مريض جديد', en: 'New patient' },
  follow_up: { ar: 'متابعة',    en: 'Follow-up' },
};

// International patients choose how they want to be seen.
const MODES = {
  zoom:   { ar: 'استشارة أونلاين عبر Zoom', en: 'Online consultation (Zoom)' },
  clinic: { ar: 'زيارة في العيادة',          en: 'Clinic visit' },
};

const OPEN_FROM = 15 * 60;        // 15:00, in minutes
const OPEN_TO   = 20 * 60 + 45;   // 20:45
const LEAD_MINUTES = 60;          // must match api/availability.js

/* Cairo's day, not UTC's — and Egypt observes DST, so never hardcode +3. */
function cairoNow() {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Africa/Cairo', year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  }).formatToParts(new Date());
  const p = {};
  for (const x of parts) if (x.type !== 'literal') p[x.type] = x.value;
  return { date: `${p.year}-${p.month}-${p.day}`, minutes: (+p.hour) * 60 + (+p.minute) };
}

function bad(res, status, code, ar, en) {
  return res.status(status).json({ ok: false, code, message: { ar, en } });
}

/* A reference the patient can quote on the phone. Derived from the request's
   own uuid so it is stable and unique — not invented client-side. */
function ref(dateStr, uuid) {
  const tail = String(uuid || '').replace(/-/g, '').slice(-4).toUpperCase();
  return `MR-${dateStr.slice(5, 7)}${dateStr.slice(8, 10)}-${tail || '0000'}`;
}

function esc(s) {
  return String(s == null ? '' : s).replace(/[&<>"]/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return bad(res, 405, 'method_not_allowed', 'طريقة غير مسموح بها.', 'Method not allowed.');
  }

  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
  const { clinic, date, time, visit, mode, name, phone, notes, locale, company, country, dates } = body;

  // Honeypot — a real patient never fills this; bots usually do. Accept the
  // request, save nothing, hand back a plausible reference.
  if (company) {
    return res.status(200).json({ ok: true, ref: ref(String(date || '2026-01-01'), 'deadbeef') });
  }

  const c = CLINICS[clinic];
  if (!c) return bad(res, 400, 'bad_clinic', 'العيادة غير صحيحة.', 'Unknown clinic.');
  const v = VISITS[visit];
  if (!v) {
    return bad(res, 400, 'bad_visit', 'من فضلك اختر نوع الزيارة.', 'Please choose new patient or follow-up.');
  }
  if (c.intl) {
    const md = MODES[mode];
    if (!md) {
      return bad(res, 400, 'bad_mode',
        'من فضلك اختر الاستشارة أونلاين أو الزيارة في العيادة.',
        'Please choose an online consultation or a clinic visit.');
    }
    return international(req, res, { c, v, md, visit, name, phone, notes, country, dates });
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(date))) {
    return bad(res, 400, 'bad_date', 'التاريخ غير صحيح.', 'Invalid date.');
  }
  if (!/^\d{2}:\d{2}$/.test(String(time))) {
    return bad(res, 400, 'bad_time', 'الموعد غير صحيح.', 'Invalid time.');
  }

  // The time must be a real 15-minute slot inside the public window. The
  // database decides whether it is free; this only rejects nonsense early.
  const [hh, mm] = String(time).split(':').map(Number);
  const mins = hh * 60 + mm;
  if (mm % 15 !== 0 || mins < OPEN_FROM || mins > OPEN_TO) {
    return bad(res, 400, 'bad_time', 'الموعد غير صحيح.', 'Invalid time slot.');
  }
  if (!String(name || '').trim() || String(name).trim().length < 3) {
    return bad(res, 400, 'bad_name', 'من فضلك اكتب اسمك الكامل.', 'Please enter your full name.');
  }
  if (!/^01\d{9}$/.test(String(phone || '').trim())) {
    return bad(res, 400, 'bad_phone',
      'الرقم يجب أن يبدأ بـ 01 ويتكوّن من 11 رقمًا.',
      'The number must start with 01 and be 11 digits.');
  }

  const now = cairoNow();
  if (date < now.date) {
    return bad(res, 400, 'past_date', 'لا يمكن الحجز في يوم مضى.', 'That date has already passed.');
  }
  if (date === now.date && mins < now.minutes + LEAD_MINUTES) {
    return bad(res, 400, 'past_time',
      'هذا الموعد فات بالفعل. من فضلك اختر موعدًا لاحقًا.',
      'That time has already passed. Please choose a later one.');
  }

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ||
                      process.env.SUPABASE_SERVICE_KEY;
  if (!SUPABASE_URL || !SERVICE_KEY || !c.id) {
    console.error('booking: Supabase or clinic id environment variables are missing');
    return bad(res, 500, 'not_configured',
      'الحجز الإلكتروني غير متاح حاليًا. من فضلك راسلنا على واتساب.',
      'Online booking is unavailable right now. Please message us on WhatsApp.');
  }

  const patientName = String(name).trim();
  const patientPhone = String(phone).trim();
  let saved;

  try {
    let r = await fetch(`${SUPABASE_URL}/rest/v1/rpc/book_website_slot`, {
      method: 'POST',
      headers: {
        apikey: SERVICE_KEY,
        Authorization: `Bearer ${SERVICE_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        p_clinic_id: c.id,
        p_clinic: c.name,
        p_slot_date: date,
        p_start_time: time,
        p_name: patientName,
        p_phone: patientPhone,
        p_concern: String(notes || '').trim() || null,
        p_visit_type: visit,
      }),
    });

    let text = await r.text();

    if (!r.ok && /PGRST202|p_visit_type/.test(text)) {
      // Migration 004 not run yet — the function has no p_visit_type. Book
      // anyway, and carry the visit type in the concern so staff still see it.
      console.warn('booking: book_website_slot has no p_visit_type — run migration 004');
      const concern = [`[${v.en}]`, String(notes || '').trim()].filter(Boolean).join(' ');
      r = await fetch(`${SUPABASE_URL}/rest/v1/rpc/book_website_slot`, {
        method: 'POST',
        headers: {
          apikey: SERVICE_KEY,
          Authorization: `Bearer ${SERVICE_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          p_clinic_id: c.id, p_clinic: c.name, p_slot_date: date, p_start_time: time,
          p_name: patientName, p_phone: patientPhone, p_concern: concern,
        }),
      });
      text = await r.text();
    }

    if (!r.ok) {
      // The function raises slot_unavailable when the slot is gone — either
      // another patient took it a moment ago, or staff closed it.
      if (text.includes('slot_unavailable')) {
        return bad(res, 409, 'slot_taken',
          'هذا الموعد حُجز للتو. من فضلك اختر موعدًا آخر.',
          'That slot was just taken. Please choose another time.');
      }
      console.error('booking: rpc failed', r.status, text);
      return bad(res, 502, 'save_failed',
        'تعذّر حفظ الحجز. من فضلك راسلنا على واتساب.',
        'We could not save the booking. Please message us on WhatsApp.');
    }

    const rows = JSON.parse(text);
    saved = Array.isArray(rows) ? rows[0] : rows;
    if (!saved || !saved.request_id) {
      console.error('booking: rpc returned nothing usable', text);
      return bad(res, 502, 'save_failed',
        'تعذّر حفظ الحجز. من فضلك راسلنا على واتساب.',
        'We could not save the booking. Please message us on WhatsApp.');
    }
  } catch (err) {
    console.error('booking: rpc threw', err);
    return bad(res, 502, 'save_failed',
      'تعذّر حفظ الحجز. من فضلك راسلنا على واتساب.',
      'We could not save the booking. Please message us on WhatsApp.');
  }

  const reference = ref(date, saved.request_id);

  // ---- notify the clinic. Never fail the request because of this. ----
  try {
    const key = process.env.RESEND_API_KEY;
    const to = process.env.BOOKING_TO;
    const from = process.env.BOOKING_FROM;
    if (key && to && from) {
      const pretty = new Date(`${date}T00:00:00Z`).toLocaleDateString('en-GB', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC',
      });
      const wa = 'https://wa.me/2' + patientPhone.replace(/^0/, '');
      const html = `
<div style="font-family:system-ui,-apple-system,Segoe UI,sans-serif;max-width:560px;color:#17181A">
  <p style="font-size:12px;letter-spacing:2px;color:#5E6670;margin:0 0 6px">طلب حجز من الموقع · NEW WEBSITE REQUEST</p>
  <h2 style="margin:0 0 18px;font-size:22px">${esc(patientName)}</h2>
  <table style="width:100%;border-collapse:collapse;font-size:15px">
    <tr><td style="padding:8px 0;color:#5E6670;width:150px">العيادة / Clinic</td>
        <td style="padding:8px 0;font-weight:700">${esc(c.ar)} — ${esc(c.en)}</td></tr>
    <tr><td style="padding:8px 0;color:#5E6670">نوع الزيارة / Visit</td>
        <td style="padding:8px 0;font-weight:700">${esc(v.ar)} — ${esc(v.en)}</td></tr>
    <tr><td style="padding:8px 0;color:#5E6670">الموعد / When</td>
        <td style="padding:8px 0;font-weight:700">${esc(pretty)} — ${esc(saved.booking_slot || time)}</td></tr>
    <tr><td style="padding:8px 0;color:#5E6670">الموبايل / Phone</td>
        <td style="padding:8px 0;font-weight:700"><a href="tel:+2${esc(patientPhone)}" style="color:#1B5FD9">${esc(patientPhone)}</a>
        &nbsp;·&nbsp;<a href="${esc(wa)}" style="color:#1B5FD9">WhatsApp</a></td></tr>
    <tr><td style="padding:8px 0;color:#5E6670">رقم الطلب / Ref</td>
        <td style="padding:8px 0;font-weight:700">${esc(reference)}</td></tr>
    <tr><td style="padding:8px 0;color:#5E6670;vertical-align:top">سبب الزيارة / Concern</td>
        <td style="padding:8px 0">${esc(String(notes || '').trim() || '—')}</td></tr>
  </table>
  <p style="margin:22px 0 0;padding:14px 16px;background:#EEF2FB;border-radius:4px;font-size:14px;line-height:1.7">
    الموعد محجوز مؤقتًا في النظام (held) في انتظار التأكيد.<br>
    The slot is held in the system, pending confirmation. The request is in
    Pending Confirmations.
  </p>
</div>`;
      const mail = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from, to: [to],
          subject: `حجز من الموقع — ${v.ar} — ${patientName} — ${date} ${saved.booking_slot || time} (${c.en})`,
          html,
        }),
      });
      if (!mail.ok) console.error('booking: email failed', mail.status, await mail.text());
    } else {
      console.warn('booking: email not configured — request saved, no notification sent');
    }
  } catch (err) {
    console.error('booking: email threw', err);
  }

  void locale;
  return res.status(201).json({ ok: true, ref: reference, id: saved.request_id });
};


/* ---------------------------------------------------------------------------
   International patients. No slot is taken: the request lands in
   booking_requests (Pending Confirmations) with clinic "International /
   Online" and patient_type "international", and a coordinator arranges the
   date on WhatsApp. */
async function international(req, res, { c, v, md, visit, name, phone, notes, country, dates }) {
  const patientName = String(name || '').trim();
  const patientPhone = String(phone || '').replace(/[\s\-().]/g, '');
  const patientCountry = String(country || '').trim().slice(0, 80);
  const preferred = String(dates || '').trim().slice(0, 200);
  const concern = String(notes || '').trim().slice(0, 2000);

  if (patientName.length < 3) {
    return bad(res, 400, 'bad_name', 'من فضلك اكتب اسمك الكامل.', 'Please enter your full name.');
  }
  if (!/^\+?\d{8,15}$/.test(patientPhone)) {
    return bad(res, 400, 'bad_phone',
      'اكتب رقم واتساب كاملًا مع كود الدولة.',
      'Enter your full WhatsApp number with country code.');
  }
  if (patientCountry.length < 2) {
    return bad(res, 400, 'bad_country', 'من فضلك اكتب بلد الإقامة.', 'Please enter your country of residence.');
  }
  const intlNumber = patientPhone.startsWith('+') ? patientPhone : '+' + patientPhone;

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ||
                      process.env.SUPABASE_SERVICE_KEY;
  if (!SUPABASE_URL || !SERVICE_KEY) {
    console.error('booking: Supabase environment variables are missing');
    return bad(res, 500, 'not_configured',
      'الحجز الإلكتروني غير متاح حاليًا. من فضلك راسلنا على واتساب.',
      'Online booking is unavailable right now. Please message us on WhatsApp.');
  }

  const today = cairoNow().date;
  const staffNotes = [
    `International patient — ${v.en}`,
    `Consultation: ${md.en}`,
    `Country: ${patientCountry}`,
    preferred ? `Preferred dates: ${preferred}` : '',
  ].filter(Boolean).join('\n');

  const row = {
    patient_name: patientName,
    phone: intlNumber,
    whatsapp: intlNumber,
    clinic: c.name,
    patient_type: 'international',
    visit_type: visit,
    concern: concern || null,
    notes: staffNotes,
    booking_type: 'standard',
    referral_source: 'website',
  };

  async function insert(r0) {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/booking_requests`, {
      method: 'POST',
      headers: {
        apikey: SERVICE_KEY,
        Authorization: `Bearer ${SERVICE_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'return=representation',
      },
      body: JSON.stringify(r0),
    });
    return { r, text: await r.text() };
  }

  let saved;
  try {
    let { r, text } = await insert(row);
    if (!r.ok && /visit_type/.test(text)) {
      // Migration 004 not run yet — save without the column.
      console.warn('booking: booking_requests has no visit_type — run migration 004');
      const { visit_type, ...rest } = row;
      ({ r, text } = await insert(rest));
    }
    if (!r.ok) {
      console.error('booking: international insert failed', r.status, text);
      return bad(res, 502, 'save_failed',
        'تعذّر حفظ الطلب. من فضلك راسلنا على واتساب.',
        'We could not save your request. Please message us on WhatsApp.');
    }
    const rows = JSON.parse(text);
    saved = Array.isArray(rows) ? rows[0] : rows;
    if (!saved || !saved.id) throw new Error('insert returned nothing usable: ' + text);
  } catch (err) {
    console.error('booking: international insert threw', err);
    return bad(res, 502, 'save_failed',
      'تعذّر حفظ الطلب. من فضلك راسلنا على واتساب.',
      'We could not save your request. Please message us on WhatsApp.');
  }

  const reference = ref(today, saved.id).replace(/^MR-/, 'MR-INT-');

  try {
    const key = process.env.RESEND_API_KEY;
    const to = process.env.BOOKING_TO;
    const from = process.env.BOOKING_FROM;
    if (key && to && from) {
      const wa = 'https://wa.me/' + intlNumber.replace(/^\+/, '');
      const html = `
<div style="font-family:system-ui,-apple-system,Segoe UI,sans-serif;max-width:560px;color:#17181A">
  <p style="font-size:12px;letter-spacing:2px;color:#5E6670;margin:0 0 6px">مريض دولي · INTERNATIONAL PATIENT REQUEST</p>
  <h2 style="margin:0 0 18px;font-size:22px">${esc(patientName)}</h2>
  <table style="width:100%;border-collapse:collapse;font-size:15px">
    <tr><td style="padding:8px 0;color:#5E6670;width:150px">نوع الزيارة / Visit</td>
        <td style="padding:8px 0;font-weight:700">${esc(v.ar)} — ${esc(v.en)}</td></tr>
    <tr><td style="padding:8px 0;color:#5E6670">الاستشارة / Consultation</td>
        <td style="padding:8px 0;font-weight:700">${esc(md.ar)} — ${esc(md.en)}</td></tr>
    <tr><td style="padding:8px 0;color:#5E6670">البلد / Country</td>
        <td style="padding:8px 0;font-weight:700">${esc(patientCountry)}</td></tr>
    <tr><td style="padding:8px 0;color:#5E6670">التواريخ / Dates</td>
        <td style="padding:8px 0">${esc(preferred || '—')}</td></tr>
    <tr><td style="padding:8px 0;color:#5E6670">واتساب / WhatsApp</td>
        <td style="padding:8px 0;font-weight:700"><a href="${esc(wa)}" style="color:#1B5FD9">${esc(intlNumber)}</a></td></tr>
    <tr><td style="padding:8px 0;color:#5E6670">رقم الطلب / Ref</td>
        <td style="padding:8px 0;font-weight:700">${esc(reference)}</td></tr>
    <tr><td style="padding:8px 0;color:#5E6670;vertical-align:top">سبب الزيارة / Concern</td>
        <td style="padding:8px 0">${esc(concern || '—')}</td></tr>
  </table>
  <p style="margin:22px 0 0;padding:14px 16px;background:#EEF2FB;border-radius:4px;font-size:14px;line-height:1.7">
    لا يوجد موعد محجوز — تواصل مع المريض عبر واتساب لترتيب الزيارة.<br>
    No slot is held — contact the patient on WhatsApp to arrange the visit${md === MODES.zoom ? ' and send the Zoom link' : ''}.
    The request is in Pending Confirmations.
  </p>
</div>`;
      const mail = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from, to: [to],
          subject: `مريض دولي — ${md.en} — ${v.ar} — ${patientName} — ${patientCountry}`,
          html,
        }),
      });
      if (!mail.ok) console.error('booking: email failed', mail.status, await mail.text());
    }
  } catch (err) {
    console.error('booking: email threw', err);
  }

  return res.status(201).json({ ok: true, ref: reference, id: saved.id });
}
