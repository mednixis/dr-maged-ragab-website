"use client";
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase.js";

const KAFR_DAYS  = [0,1,2,6]; // Sun Mon Tue Sat
const MIVIDA_DAYS = [3,4];    // Wed Thu

function getAllowedDays(clinicName) {
  const n = (clinicName || "").toLowerCase();
  if (n.includes("kafr") || n.includes("sheikh")) return KAFR_DAYS;
  if (n.includes("mivida")) return MIVIDA_DAYS;
  return [0,1,2,3,4,5,6];
}

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

export default function BookingFlow({ clinics }) {
  const today = new Date();
  today.setHours(0,0,0,0);

  const [step, setStep]             = useState(1); // 1=clinic, 2=date, 3=slot, 4=form, 5=done
  const [clinicId, setClinicId]     = useState("");
  const [year, setYear]             = useState(today.getFullYear());
  const [month, setMonth]           = useState(today.getMonth());
  const [selectedDate, setDate]     = useState("");
  const [slots, setSlots]           = useState([]);
  const [selectedSlot, setSlot]     = useState(null);
  const [loading, setLoading]       = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm]             = useState({ name:"", phone:"", whatsapp:"", email:"", notes:"", patient_type:"local" });

  const clinic      = clinics.find(c => c.id === clinicId);
  const allowedDays = getAllowedDays(clinic?.name_en || "");
  const todayStr    = today.toISOString().split("T")[0];

  // fetch open slots when date selected
  useEffect(() => {
    if (!selectedDate || !clinicId) return;
    setLoading(true);
    setSlot(null);
    supabase
      .from("appointment_slots")
      .select("id, start_time, end_time, status")
      .eq("clinic_id", clinicId)
      .eq("slot_date", selectedDate)
      .eq("status", "open")
      .order("start_time")
      .then(({ data }) => {
        setSlots(data || []);
        setLoading(false);
      });
  }, [selectedDate, clinicId]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!selectedSlot) return;
    setSubmitting(true);
    // Mark slot as held
    await supabase.from("appointment_slots").update({ status: "held" }).eq("id", selectedSlot.id);
    // Save booking request
    await supabase.from("booking_requests").insert({
      patient_name:  form.name,
      phone:         form.phone,
      whatsapp:      form.whatsapp,
      email:         form.email,
      clinic:        clinic?.name_en,
      booking_date:  selectedDate,
      booking_slot:  `${selectedSlot.start_time?.slice(0,5)} – ${selectedSlot.end_time?.slice(0,5)}`,
      patient_type:  form.patient_type,
      notes:         form.notes,
      status:        "pending",
      slot_id:       selectedSlot.id,
    });
    setSubmitting(false);
    setStep(5);
  }

  const daysInMonth = getDaysInMonth(year, month);
  const firstDow    = new Date(year, month, 1).getDay();
  const DAYS        = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  const MONTHS      = ["January","February","March","April","May","June","July","August","September","October","November","December"];

  return (
    <div style={{maxWidth:"860px",margin:"0 auto"}}>

      {/* Progress */}
      <div style={{display:"flex",gap:"8px",marginBottom:"32px",flexWrap:"wrap"}}>
        {[["1","Clinic"],["2","Date"],["3","Slot"],["4","Your Details"],["5","Confirmed"]].map(([n, label]) => (
          <div key={n} style={{display:"flex",alignItems:"center",gap:"6px",fontSize:"13px",fontWeight:"700",
            color: parseInt(n) <= step ? "var(--gold)" : "var(--muted)"}}>
            <span style={{display:"grid",width:"28px",height:"28px",placeItems:"center",borderRadius:"50%",
              background: parseInt(n) <= step ? "var(--gold)" : "var(--line)",
              color: parseInt(n) <= step ? "#fff" : "var(--muted)", fontSize:"12px"}}>{n}</span>
            {label}
            {parseInt(n) < 5 && <span style={{color:"var(--line)"}}>›</span>}
          </div>
        ))}
      </div>

      {/* STEP 1 — Choose Clinic */}
      {step === 1 && (
        <div>
          <h3 style={{marginBottom:"20px",color:"var(--navy)"}}>
            <span>Choose Clinic / </span><span style={{fontWeight:"400",color:"var(--muted)"}}>اختر العيادة</span>
          </h3>
          <div className="choice-grid">
            {clinics.map(c => (
              <button key={c.id} className={`choice-card ${clinicId===c.id?"selected":""}`}
                onClick={() => { setClinicId(c.id); setDate(""); setSlots([]); setSlot(null); }}>
                <strong><span className="en">{c.name_en}</span><span className="ar">{c.name_ar}</span></strong>
                <p><span className="en">{c.address_en}</span><span className="ar">{c.address_ar}</span></p>
                <small>{getAllowedDays(c.name_en).map(d => DAYS[d]).join(", ")} · 3:00 PM – 8:00 PM</small>
              </button>
            ))}
          </div>
          {clinicId && (
            <button className="button primary" style={{marginTop:"24px"}} onClick={() => setStep(2)}>
              <span>Continue / متابعة</span>
            </button>
          )}
        </div>
      )}

      {/* STEP 2 — Choose Date */}
      {step === 2 && (
        <div>
          <h3 style={{marginBottom:"20px",color:"var(--navy)"}}>
            Choose Date / <span style={{fontWeight:"400",color:"var(--muted)"}}>اختر التاريخ</span>
          </h3>
          <div className="booking-calendar" style={{marginBottom:"24px"}}>
            <div className="calendar-head">
              <button onClick={() => { if(month===0){setYear(y=>y-1);setMonth(11);}else setMonth(m=>m-1); }}
                style={{background:"none",border:"1px solid var(--line)",padding:"6px 12px",cursor:"pointer"}}>←</button>
              <strong>{MONTHS[month]} {year}</strong>
              <button onClick={() => { if(month===11){setYear(y=>y+1);setMonth(0);}else setMonth(m=>m+1); }}
                style={{background:"none",border:"1px solid var(--line)",padding:"6px 12px",cursor:"pointer"}}>→</button>
            </div>
            <div className="calendar-week">
              {DAYS.map(d => <span key={d}>{d}</span>)}
            </div>
            <div className="calendar-grid">
              {Array.from({length:firstDow}).map((_,i) => <div key={`e${i}`} className="calendar-empty" />)}
              {Array.from({length:daysInMonth}).map((_,i) => {
                const day     = i + 1;
                const dateStr = `${year}-${String(month+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
                const dow     = new Date(dateStr+"T00:00:00").getDay();
                const isAllowed = allowedDays.includes(dow);
                const isPast    = dateStr < todayStr;
                const isSelected = dateStr === selectedDate;
                return (
                  <button key={dateStr} className={`calendar-day ${isAllowed&&!isPast?"available":""} ${isPast?"disabled":""} ${isSelected?"selected":""}`}
                    disabled={!isAllowed || isPast}
                    onClick={() => { setDate(dateStr); setStep(3); }}>
                    <span>{day}</span>
                    {isAllowed && !isPast && <small>Open</small>}
                  </button>
                );
              })}
            </div>
          </div>
          <button className="button ghost" onClick={() => setStep(1)}>← Back</button>
        </div>
      )}

      {/* STEP 3 — Choose Slot */}
      {step === 3 && (
        <div>
          <h3 style={{marginBottom:"8px",color:"var(--navy)"}}>
            Choose Time Slot / <span style={{fontWeight:"400",color:"var(--muted)"}}>اختر الموعد</span>
          </h3>
          <p style={{color:"var(--muted)",marginBottom:"20px",fontSize:"14px"}}>{selectedDate} · {clinic?.name_en}</p>
          {loading ? (
            <p style={{color:"var(--muted)"}}>Loading available slots…</p>
          ) : slots.length === 0 ? (
            <div>
              <p style={{color:"var(--muted)",marginBottom:"16px"}}>No open slots for this date. Please choose another date.</p>
              <button className="button ghost" onClick={() => setStep(2)}>← Choose Another Date</button>
            </div>
          ) : (
            <>
              <div className="booking-options">
                {slots.map(slot => (
                  <button key={slot.id} className={`slot-card ${selectedSlot?.id===slot.id?"selected":""}`}
                    onClick={() => setSlot(slot)}>
                    {slot.start_time?.slice(0,5)} – {slot.end_time?.slice(0,5)}
                    <span>Available</span>
                  </button>
                ))}
              </div>
              <div className="hero-actions">
                <button className="button ghost" onClick={() => setStep(2)}>← Back</button>
                {selectedSlot && (
                  <button className="button primary" onClick={() => setStep(4)}>Continue →</button>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* STEP 4 — Patient Details */}
      {step === 4 && (
        <div>
          <h3 style={{marginBottom:"8px",color:"var(--navy)"}}>
            Your Details / <span style={{fontWeight:"400",color:"var(--muted)"}}>بياناتك</span>
          </h3>
          <p style={{color:"var(--muted)",marginBottom:"24px",fontSize:"14px"}}>
            {selectedDate} · {selectedSlot?.start_time?.slice(0,5)} – {selectedSlot?.end_time?.slice(0,5)} · {clinic?.name_en}
          </p>
          <form className="booking-form" onSubmit={handleSubmit}>
            <label>
              <span>Full Name / الاسم الكامل <span style={{color:"#e53e3e"}}>*</span></span>
              <input required value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))} placeholder="Your full name / اسمك الكامل" />
            </label>
            <label>
              <span>Phone / الهاتف <span style={{color:"#e53e3e"}}>*</span></span>
              <input required value={form.phone} onChange={e=>setForm(p=>({...p,phone:e.target.value}))} placeholder="01xxxxxxxxx" />
            </label>
            <label>
              <span>WhatsApp Number / رقم الواتساب <span style={{color:"#e53e3e"}}>*</span></span>
              <input required value={form.whatsapp} onChange={e=>setForm(p=>({...p,whatsapp:e.target.value}))} placeholder="01xxxxxxxxx" />
            </label>
            <label>
              <span>Email / البريد الإلكتروني <span style={{color:"#e53e3e"}}>*</span></span>
              <input required type="email" value={form.email} onChange={e=>setForm(p=>({...p,email:e.target.value}))} placeholder="your@email.com" />
            </label>
            <label style={{gridColumn:"1/-1"}}>
              <span>Patient Type / نوع المريض</span>
              <select value={form.patient_type} onChange={e=>setForm(p=>({...p,patient_type:e.target.value}))}>
                <option value="local">Local / محلي</option>
                <option value="international">International / دولي</option>
              </select>
            </label>
            <textarea rows={3} placeholder="Notes (optional) / ملاحظات (اختياري)"
              value={form.notes} onChange={e=>setForm(p=>({...p,notes:e.target.value}))} />
            <label className="consent">
              <input type="checkbox" required />
              <span>I confirm my details are correct and agree to the clinic's policies. / أؤكد صحة بياناتي وأوافق على سياسات العيادة.</span>
            </label>
            <div className="hero-actions" style={{gridColumn:"1/-1"}}>
              <button type="button" className="button ghost" onClick={() => setStep(3)}>← Back</button>
              <button type="submit" className="button primary" disabled={submitting}>
                {submitting ? "Submitting… / جاري الإرسال…" : "Confirm Booking / تأكيد الحجز"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* STEP 5 — Confirmed */}
      {step === 5 && (
        <div style={{textAlign:"center",padding:"48px 0"}}>
          <div style={{fontSize:"48px",marginBottom:"16px"}}>✅</div>
          <h2 style={{color:"var(--navy)",marginBottom:"12px"}}>
            <span>Booking Request Submitted / </span><span style={{fontWeight:"400"}}>تم تقديم طلب الحجز</span>
          </h2>
          <p style={{color:"var(--muted)",maxWidth:"480px",margin:"0 auto 24px",lineHeight:"1.7"}}>
            Your request has been received. The clinic team will confirm your appointment via WhatsApp or phone shortly.
          </p>
          <div style={{background:"var(--soft)",border:"1px solid var(--line)",padding:"20px",maxWidth:"400px",margin:"0 auto 24px",textAlign:"left"}}>
            <p style={{margin:"0 0 8px",color:"var(--navy)",fontWeight:"700"}}>{clinic?.name_en}</p>
            <p style={{margin:"0 0 4px",color:"var(--muted)"}}>{selectedDate}</p>
            <p style={{margin:"0",color:"var(--muted)"}}>{selectedSlot?.start_time?.slice(0,5)} – {selectedSlot?.end_time?.slice(0,5)}</p>
          </div>
          <a className="button primary" href="/">Return Home / العودة للرئيسية</a>
        </div>
      )}
    </div>
  );
}
