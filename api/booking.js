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
  const { clinic, date, time, name, phone, notes, locale, company } = body;

  // Honeypot — a real patient never fills this; bots usually do. Accept the
  // request, save nothing, hand back a plausible reference.
  if (company) {
    return res.status(200).json({ ok: true, ref: ref(String(date || '2026-01-01'), 'deadbeef') });
  }

  const c = CLINICS[clinic];
  if (!c) return bad(res, 400, 'bad_clinic', 'العيادة غير صحيحة.', 'Unknown clinic.');
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
    const r = await fetch(`${SUPABASE_URL}/rest/v1/rpc/book_website_slot`, {
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
      }),
    });

    const text = await r.text();

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
          subject: `حجز من الموقع — ${patientName} — ${date} ${saved.booking_slot || time} (${c.en})`,
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
