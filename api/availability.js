/**
 * GET /api/availability?clinic=kfs&from=2026-09-20&to=2026-10-20
 *
 * Reads appointment_slots — the same table the admin platform uses — so a slot
 * the receptionist closes stops being offered here within the minute, and the
 * website never invents a schedule of its own.
 *
 * Returns only what is open inside the public window (15:00–20:45). The clinic
 * works 11:00–23:00; the extra hours are for staff, not the website.
 *
 * Response: { ok:true, days: { "2026-09-22": ["15:00","15:15", …], … } }
 *
 * Nothing patient-identifying is ever returned here — this response is public.
 */

const OPEN_FROM = '15:00';   // first slot offered online
const OPEN_TO   = '20:45';   // last slot offered online (ends 21:00)

/* Don't offer a slot that starts within the next hour — a patient needs time to
   actually get to the clinic, and the receptionist needs warning. Set to 0 to
   allow booking right up to the minute. */
const LEAD_MINUTES = 60;

/* The clinic's day is a day in Cairo, not in UTC, and Vercel's functions run in
   UTC. Egypt also observes DST, so the offset is not a constant — let the
   timezone database do it. */
function cairoNow() {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Africa/Cairo', year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  }).formatToParts(new Date());
  const p = {};
  for (const x of parts) if (x.type !== 'literal') p[x.type] = x.value;
  return { date: `${p.year}-${p.month}-${p.day}`, minutes: (+p.hour) * 60 + (+p.minute) };
}

const CLINIC_ID = {
  kfs: process.env.CLINIC_KFS_ID,
  mvd: process.env.CLINIC_MVD_ID,
};

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ ok: false, code: 'method_not_allowed' });
  }

  const q = req.query || {};
  const clinic = String(q.clinic || '');
  const from = String(q.from || '');
  const to = String(q.to || '');
  const day = /^\d{4}-\d{2}-\d{2}$/;

  if (!Object.prototype.hasOwnProperty.call(CLINIC_ID, clinic) ||
      !day.test(from) || !day.test(to)) {
    return res.status(400).json({ ok: false, code: 'bad_query' });
  }

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ||
                      process.env.SUPABASE_SERVICE_KEY;
  const clinicId = CLINIC_ID[clinic];

  if (!SUPABASE_URL || !SERVICE_KEY || !clinicId) {
    // Not configured. Say so rather than showing a schedule we cannot stand
    // behind — the page then tells the patient to use WhatsApp.
    return res.status(200).json({ ok: true, days: {}, configured: false });
  }

  const url =
    `${SUPABASE_URL}/rest/v1/appointment_slots` +
    `?select=slot_date,start_time` +
    `&clinic_id=eq.${encodeURIComponent(clinicId)}` +
    `&status=eq.open` +
    `&slot_date=gte.${from}&slot_date=lte.${to}` +
    `&start_time=gte.${OPEN_FROM}&start_time=lte.${OPEN_TO}` +
    `&order=slot_date.asc,start_time.asc` +
    `&limit=5000`;

  try {
    const r = await fetch(url, {
      headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` },
    });
    if (!r.ok) {
      console.error('availability: read failed', r.status, await r.text());
      return res.status(200).json({ ok: true, days: {}, degraded: true });
    }
    const rows = await r.json();
    const now = cairoNow();
    const days = {};
    for (const row of rows) {
      const d = String(row.slot_date).slice(0, 10);
      const t = String(row.start_time).slice(0, 5);   // "15:15:00" → "15:15"
      if (d < now.date) continue;                     // yesterday, in Cairo terms
      if (d === now.date) {
        const mins = (+t.slice(0, 2)) * 60 + (+t.slice(3, 5));
        if (mins < now.minutes + LEAD_MINUTES) continue;   // already gone today
      }
      (days[d] || (days[d] = [])).push(t);
    }
    // Short edge cache: fast pages, without letting a slot the receptionist
    // just closed linger long enough for someone to pick it.
    res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate=60');
    return res.status(200).json({ ok: true, days });
  } catch (err) {
    console.error('availability: threw', err);
    return res.status(200).json({ ok: true, days: {}, degraded: true });
  }
};
