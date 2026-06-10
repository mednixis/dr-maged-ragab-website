"use client";
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase.js";

const KAFR_DAYS   = [0,1,2,6];
const MIVIDA_DAYS = [3,4];
const DAYS   = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const COUNTRIES = [
  "Egypt","Saudi Arabia","UAE","Kuwait","Qatar","Bahrain","Oman","Jordan","Lebanon","Libya",
  "Sudan","Iraq","Syria","Yemen","Morocco","Tunisia","Algeria","Palestine","USA","UK",
  "Canada","Germany","France","Italy","Spain","Australia","Netherlands","Belgium","Sweden","Switzerland"
];

function getAllowedDays(name) {
  const n = (name||"").toLowerCase();
  if (n.includes("kafr")||n.includes("sheikh")) return KAFR_DAYS;
  if (n.includes("mivida")) return MIVIDA_DAYS;
  return [0,1,2,3,4,5,6];
}

function getDaysInMonth(y,m) { return new Date(y,m+1,0).getDate(); }

export default function BookingFlow({ clinics }) {
  const today = new Date(); today.setHours(0,0,0,0);

  // ALL hooks at top - no conditionals before hooks
  const [patientType, setPatientType] = useState("");
  const [step,        setStep]        = useState(1);
  const [clinicId,    setClinicId]    = useState("");
  const [year,        setYear]        = useState(today.getFullYear());
  const [month,       setMonth]       = useState(today.getMonth());
  const [selDate,     setSelDate]     = useState("");
  const [slots,       setSlots]       = useState([]);
  const [selSlot,     setSelSlot]     = useState(null);
  const [loading,     setLoading]     = useState(false);
  const [submitting,  setSubmitting]  = useState(false);
  const [localForm,   setLocalForm]   = useState({ name:"", phone:"", whatsapp:"", email:"", notes:"" });
  const [intlForm,    setIntlForm]    = useState({ name:"", phone:"", whatsapp:"", email:"", country:"Egypt", notes:"" });
  const [intlDone,    setIntlDone]    = useState(false);

  const clinic      = clinics.find(c => c.id === clinicId);
  const allowedDays = getAllowedDays(clinic?.name_en || "");
  const daysInMonth = getDaysInMonth(year, month);
  const firstDow    = new Date(year, month, 1).getDay();
  const todayStr    = today.toISOString().split("T")[0];

  useEffect(() => {
    if (!selDate || !clinicId) return;
    setLoading(true);
    setSelSlot(null);
    supabase.from("appointment_slots")
      .select("id, start_time, end_time, status")
      .eq("clinic_id", clinicId).eq("slot_date", selDate).eq("status","open")
      .order("start_time")
      .then(({ data }) => { setSlots(data||[]); setLoading(false); });
  }, [selDate, clinicId]);

  // ── LOCAL SUBMIT ──
  async function handleLocalSubmit(e) {
    e.preventDefault();
    if (!selSlot) return;
    setSubmitting(true);
    await supabase.from("appointment_slots").update({ status:"held" }).eq("id", selSlot.id);
    await supabase.from("booking_requests").insert({
      patient_name: localForm.name,
      phone:        localForm.phone,
      whatsapp:     localForm.whatsapp,
      email:        localForm.email,
      clinic:       clinic?.name_en,
      booking_date: selDate,
      booking_slot: `${selSlot.start_time?.slice(0,5)} – ${selSlot.end_time?.slice(0,5)}`,
      patient_type: "local",
      notes:        localForm.notes,
      status:       "pending",
      slot_id:      selSlot.id,
    });
    setSubmitting(false);
    setStep(5);
  }

  // ── INTERNATIONAL SUBMIT ──
  async function handleIntlSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    await supabase.from("booking_requests").insert({
      patient_name: intlForm.name,
      phone:        intlForm.phone,
      whatsapp:     intlForm.whatsapp,
      email:        intlForm.email,
      clinic:       "International / Online",
      booking_date: null,
      booking_slot: "Online Zoom Consultation",
      patient_type: "international",
      notes:        `Country: ${intlForm.country}. ${intlForm.notes}`,
      status:       "pending",
    });
    setSubmitting(false);
    setIntlDone(true);
  }

  // ── STEP 0: Choose patient type ──
  if (!patientType) return (
    <div style={{ textAlign:"center", padding:"40px 20px" }}>
      <h2 style={{ color:"var(--navy)", marginBottom:"8px" }}>
        <span className="en">How would you like to consult?</span>
        <span className="ar">كيف تريد الاستشارة؟</span>
      </h2>
      <p style={{ color:"var(--muted)", marginBottom:"32px", fontSize:"15px" }}>
        <span className="en">Choose your patient type to get started.</span>
        <span className="ar">اختر نوع المريض للبدء.</span>
      </p>
      <div className="choice-grid" style={{ maxWidth:"500px", margin:"0 auto" }}>
        <button className="choice-card" onClick={() => setPatientType("local")}
          style={{ padding:"28px 20px", cursor:"pointer", textAlign:"center" }}>
          <div style={{ fontSize:"36px", marginBottom:"12px" }}>🏥</div>
          <strong style={{ display:"block", color:"var(--navy)", fontSize:"16px", marginBottom:"6px" }}>
            <span className="en">Local Patient</span><span className="ar">مريض محلي</span>
          </strong>
          <span style={{ color:"var(--muted)", fontSize:"13px" }}>
            <span className="en">Book a clinic appointment in Egypt</span>
            <span className="ar">احجز موعداً في إحدى العيادات</span>
          </span>
        </button>
        <button className="choice-card" onClick={() => setPatientType("international")}
          style={{ padding:"28px 20px", cursor:"pointer", textAlign:"center" }}>
          <div style={{ fontSize:"36px", marginBottom:"12px" }}>🌍</div>
          <strong style={{ display:"block", color:"var(--navy)", fontSize:"16px", marginBottom:"6px" }}>
            <span className="en">International Patient</span><span className="ar">مريض دولي</span>
          </strong>
          <span style={{ color:"var(--muted)", fontSize:"13px" }}>
            <span className="en">Online Zoom consultation from anywhere</span>
            <span className="ar">استشارة عبر Zoom من أي مكان</span>
          </span>
        </button>
      </div>
    </div>
  );

  // ── INTERNATIONAL FLOW ──
  if (patientType === "international") {
    if (intlDone) return (
      <div style={{ textAlign:"center", padding:"40px 20px" }}>
        <div style={{ fontSize:"48px", marginBottom:"16px" }}>✅</div>
        <h2 style={{ color:"var(--navy)" }}>
          <span className="en">Request Received!</span><span className="ar">تم استلام طلبك!</span>
        </h2>
        <p style={{ color:"var(--muted)" }}>
          <span className="en">We will contact you within 24 hours to schedule your online consultation.</span>
          <span className="ar">سنتواصل معك خلال 24 ساعة لتحديد موعد استشارتك الإلكترونية.</span>
        </p>
      </div>
    );
    return (
      <div style={{ maxWidth:"600px", margin:"0 auto" }}>
        <button onClick={() => setPatientType("")}
          style={{ background:"none", border:"none", color:"var(--gold)", cursor:"pointer", fontSize:"14px", marginBottom:"20px", padding:0 }}>
          ← <span className="en">Back</span><span className="ar">رجوع</span>
        </button>
        <h2 style={{ color:"var(--navy)", marginBottom:"8px" }}>
          <span className="en">International Consultation Request</span>
          <span className="ar">طلب استشارة دولية</span>
        </h2>
        <p style={{ color:"var(--muted)", marginBottom:"24px", fontSize:"14px" }}>
          <span className="en">Fill in your details and we will arrange a Zoom consultation with Professor Ragab.</span>
          <span className="ar">أدخل بياناتك وسنرتب لك استشارة عبر Zoom مع الأستاذ الدكتور ماجد رجب.</span>
        </p>
        <form className="booking-form" onSubmit={handleIntlSubmit}>
          <label>
            <span>Full Name / الاسم الكامل <span style={{color:"#e53e3e"}}>*</span></span>
            <input required value={intlForm.name} onChange={e=>setIntlForm(p=>({...p,name:e.target.value}))} placeholder="Your full name" />
          </label>
          <label>
            <span>Phone / الهاتف <span style={{color:"#e53e3e"}}>*</span></span>
            <input required value={intlForm.phone} onChange={e=>setIntlForm(p=>({...p,phone:e.target.value}))} placeholder="+20xxxxxxxxx" />
          </label>
          <label>
            <span>WhatsApp <span style={{color:"#e53e3e"}}>*</span></span>
            <input required value={intlForm.whatsapp} onChange={e=>setIntlForm(p=>({...p,whatsapp:e.target.value}))} placeholder="+20xxxxxxxxx" />
          </label>
          <label>
            <span>Email <span style={{color:"#e53e3e"}}>*</span></span>
            <input required type="email" value={intlForm.email} onChange={e=>setIntlForm(p=>({...p,email:e.target.value}))} placeholder="your@email.com" />
          </label>
          <label>
            <span>Country / الدولة <span style={{color:"#e53e3e"}}>*</span></span>
            <select required value={intlForm.country} onChange={e=>setIntlForm(p=>({...p,country:e.target.value}))}>
              {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </label>
          <label style={{gridColumn:"1/-1"}}>
            <span>Medical Summary / ملخص الحالة</span>
            <textarea rows={3} value={intlForm.notes} onChange={e=>setIntlForm(p=>({...p,notes:e.target.value}))} placeholder="Brief description of your condition" />
          </label>
          <label className="consent" style={{gridColumn:"1/-1"}}>
            <input type="checkbox" required />
            <span>I confirm my details are correct and agree to the clinic's policies. / أؤكد صحة بياناتي وأوافق على سياسات العيادة.</span>
          </label>
          <div className="hero-actions" style={{gridColumn:"1/-1"}}>
            <button type="submit" className="button primary" disabled={submitting}>
              {submitting ? "Sending…" : "Send Request / إرسال الطلب"}
            </button>
          </div>
        </form>
      </div>
    );
  }

  // ── LOCAL FLOW ──
  return (
    <div style={{maxWidth:"860px",margin:"0 auto"}}>

      {/* Progress */}
      <div style={{display:"flex",gap:"8px",marginBottom:"32px",flexWrap:"wrap"}}>
        {[["1","Clinic"],["2","Date"],["3","Slot"],["4","Your Details"],["5","Confirmed"]].map(([n,label]) => (
          <div key={n} style={{display:"flex",alignItems:"center",gap:"6px",fontSize:"13px",fontWeight:"700",
            color: parseInt(n) <= step ? "var(--gold)" : "var(--muted)"}}>
            <span style={{width:"24px",height:"24px",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",
              background: parseInt(n) <= step ? "var(--gold)" : "#e8eaec",
              color: parseInt(n) <= step ? "#fff" : "var(--muted)", fontSize:"12px"}}>{n}</span>
            {label}
            {parseInt(n) < 5 && <span style={{color:"var(--line)"}}>→</span>}
          </div>
        ))}
      </div>

      {/* Step 1 — Clinic */}
      {step === 1 && (
        <div>
          <button onClick={() => setPatientType("")}
            style={{ background:"none", border:"none", color:"var(--gold)", cursor:"pointer", fontSize:"14px", marginBottom:"16px", padding:0 }}>
            ← <span className="en">Back</span><span className="ar">رجوع</span>
          </button>
          <h2><span className="en">Select a Clinic</span><span className="ar">اختر العيادة</span></h2>
          <div className="choice-grid">
            {clinics.map(c => (
              <button key={c.id} className={`choice-card ${clinicId===c.id?"selected":""}`}
                onClick={() => { setClinicId(c.id); setSelDate(""); setSlots([]); setSelSlot(null); }}>
                <strong><span className="en">{c.name_en}</span><span className="ar">{c.name_ar}</span></strong>
                <small><span className="en">{c.address_en}</span><span className="ar">{c.address_ar}</span></small>
              </button>
            ))}
          </div>
          <div className="hero-actions" style={{marginTop:"24px"}}>
            <button className="button primary" disabled={!clinicId} onClick={() => setStep(2)}>
              <span className="en">Next →</span><span className="ar">التالي →</span>
            </button>
          </div>
        </div>
      )}

      {/* Step 2 — Date */}
      {step === 2 && (
        <div>
          <h2><span className="en">Select a Date</span><span className="ar">اختر التاريخ</span></h2>
          <p style={{color:"var(--muted)",fontSize:"13px",marginBottom:"16px"}}>
            <span className="en">Available days: {allowedDays.map(d=>DAYS[d]).join(", ")}</span>
            <span className="ar">الأيام المتاحة: {allowedDays.map(d=>DAYS[d]).join("، ")}</span>
          </p>
          {/* Month nav */}
          <div style={{display:"flex",alignItems:"center",gap:"16px",marginBottom:"16px"}}>
            <button className="button ghost" onClick={() => { if(month===0){setMonth(11);setYear(y=>y-1);}else setMonth(m=>m-1); }}>←</button>
            <strong>{MONTHS[month]} {year}</strong>
            <button className="button ghost" onClick={() => { if(month===11){setMonth(0);setYear(y=>y+1);}else setMonth(m=>m+1); }}>→</button>
          </div>
          {/* Calendar */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:"4px",marginBottom:"24px"}}>
            {DAYS.map(d => <div key={d} style={{textAlign:"center",fontSize:"11px",fontWeight:"700",color:"var(--muted)",padding:"4px"}}>{d}</div>)}
            {Array.from({length:firstDow}).map((_,i) => <div key={"e"+i}/>)}
            {Array.from({length:daysInMonth}).map((_,i) => {
              const d = i+1;
              const dateStr = `${year}-${String(month+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
              const dow = new Date(year,month,d).getDay();
              const allowed = allowedDays.includes(dow);
              const past = dateStr < todayStr;
              const selected = selDate === dateStr;
              return (
                <button key={d} disabled={!allowed||past}
                  onClick={() => { setSelDate(dateStr); setStep(3); }}
                  style={{
                    padding:"8px 4px", textAlign:"center", borderRadius:"6px", fontSize:"13px",
                    border: selected ? "2px solid var(--gold)" : "1px solid #e8eaec",
                    background: selected ? "var(--gold)" : allowed&&!past ? "#fff" : "#f6f8fa",
                    color: selected ? "#fff" : allowed&&!past ? "var(--navy)" : "#ccc",
                    cursor: allowed&&!past ? "pointer" : "not-allowed",
                    fontWeight: selected ? "700" : "400",
                  }}>{d}</button>
              );
            })}
          </div>
          <div className="hero-actions">
            <button className="button ghost" onClick={() => setStep(1)}>← <span className="en">Back</span><span className="ar">رجوع</span></button>
          </div>
        </div>
      )}

      {/* Step 3 — Slot */}
      {step === 3 && (
        <div>
          <h2><span className="en">Select a Time Slot</span><span className="ar">اختر الموعد</span></h2>
          <p style={{color:"var(--muted)",fontSize:"13px",marginBottom:"16px"}}>{selDate}</p>
          {loading ? <p><span className="en">Loading slots…</span><span className="ar">جاري التحميل…</span></p> :
           slots.length === 0 ? <p style={{color:"var(--muted)"}}><span className="en">No available slots for this date.</span><span className="ar">لا توجد مواعيد متاحة لهذا اليوم.</span></p> : (
            <div className="choice-grid">
              {slots.map(s => (
                <button key={s.id} className={`choice-card ${selSlot?.id===s.id?"selected":""}`}
                  onClick={() => setSelSlot(s)}
                  style={{padding:"12px",textAlign:"center",cursor:"pointer"}}>
                  {s.start_time?.slice(0,5)} – {s.end_time?.slice(0,5)}
                </button>
              ))}
            </div>
          )}
          <div className="hero-actions" style={{marginTop:"24px"}}>
            <button className="button ghost" onClick={() => setStep(2)}>← <span className="en">Back</span><span className="ar">رجوع</span></button>
            <button className="button primary" disabled={!selSlot} onClick={() => setStep(4)}>
              <span className="en">Next →</span><span className="ar">التالي →</span>
            </button>
          </div>
        </div>
      )}

      {/* Step 4 — Details */}
      {step === 4 && (
        <div>
          <h2><span className="en">Your Details</span><span className="ar">بياناتك</span></h2>
          <form className="booking-form" onSubmit={handleLocalSubmit}>
            <label>
              <span>Full Name / الاسم الكامل <span style={{color:"#e53e3e"}}>*</span></span>
              <input required value={localForm.name} onChange={e=>setLocalForm(p=>({...p,name:e.target.value}))} placeholder="Your full name / اسمك الكامل" />
            </label>
            <label>
              <span>Phone / الهاتف <span style={{color:"#e53e3e"}}>*</span></span>
              <input required value={localForm.phone} onChange={e=>setLocalForm(p=>({...p,phone:e.target.value}))} placeholder="01xxxxxxxxx" />
            </label>
            <label>
              <span>WhatsApp <span style={{color:"#e53e3e"}}>*</span></span>
              <input required value={localForm.whatsapp} onChange={e=>setLocalForm(p=>({...p,whatsapp:e.target.value}))} placeholder="01xxxxxxxxx" />
            </label>
            <label>
              <span>Email <span style={{color:"#e53e3e"}}>*</span></span>
              <input required type="email" value={localForm.email} onChange={e=>setLocalForm(p=>({...p,email:e.target.value}))} placeholder="your@email.com" />
            </label>
            <label style={{gridColumn:"1/-1"}}>
              <span>Notes / ملاحظات</span>
              <textarea rows={3} value={localForm.notes} onChange={e=>setLocalForm(p=>({...p,notes:e.target.value}))} placeholder="Optional notes / ملاحظات اختيارية" />
            </label>
            <label className="consent" style={{gridColumn:"1/-1"}}>
              <input type="checkbox" required />
              <span>I confirm my details are correct and agree to the clinic's policies. / أؤكد صحة بياناتي وأوافق على سياسات العيادة.</span>
            </label>
            <div className="hero-actions" style={{gridColumn:"1/-1"}}>
              <button type="button" className="button ghost" onClick={() => setStep(3)}>← <span className="en">Back</span><span className="ar">رجوع</span></button>
              <button type="submit" className="button primary" disabled={submitting}>
                {submitting ? "Submitting… / جاري الإرسال…" : "Confirm Booking / تأكيد الحجز"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Step 5 — Done */}
      {step === 5 && (
        <div style={{textAlign:"center",padding:"40px 20px"}}>
          <div style={{fontSize:"48px",marginBottom:"16px"}}>✅</div>
          <h2 style={{color:"var(--navy)"}}>
            <span className="en">Booking Request Submitted!</span>
            <span className="ar">تم إرسال طلب الحجز!</span>
          </h2>
          <p style={{color:"var(--muted)"}}>
            <span className="en">We will confirm your appointment shortly. You will receive a confirmation email once approved.</span>
            <span className="ar">سنؤكد موعدك قريباً. ستصلك رسالة تأكيد بمجرد الموافقة.</span>
          </p>
          <div style={{marginTop:"24px",padding:"16px",background:"#f6f8fa",borderRadius:"10px",display:"inline-block",textAlign:"left"}}>
            <p style={{margin:"0 0 6px",fontSize:"14px"}}><strong>📍 {clinic?.name_en}</strong></p>
            <p style={{margin:"0 0 6px",fontSize:"14px"}}>📅 {selDate}</p>
            <p style={{margin:0,fontSize:"14px"}}>⏰ {selSlot?.start_time?.slice(0,5)} – {selSlot?.end_time?.slice(0,5)}</p>
          </div>
        </div>
      )}
    </div>
  );
}
