"use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const KAFR_DAYS   = [0,1,2,6];
const MIVIDA_DAYS = [3,4];

const CLINIC_CONFIG = {
  kafr:   { days:[0,1,2,6], start:"15:00", end:"20:00", mins:20 },
  mivida: { days:[3,4],     start:"15:00", end:"20:00", mins:20 },
};

function getAllowedDays(clinicName) {
  const n = (clinicName || "").toLowerCase();
  if (n.includes("kafr") || n.includes("sheikh")) return KAFR_DAYS;
  if (n.includes("mivida")) return MIVIDA_DAYS;
  return [0,1,2,3,4,5,6];
}

function getClinicConfig(clinicName) {
  const n = (clinicName || "").toLowerCase();
  if (n.includes("kafr") || n.includes("sheikh")) return CLINIC_CONFIG.kafr;
  if (n.includes("mivida")) return CLINIC_CONFIG.mivida;
  return CLINIC_CONFIG.kafr;
}

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

async function generateSlotsForDate(clinicId, dateStr, cfg) {
  const [sh, sm] = cfg.start.split(":").map(Number);
  const [eh, em] = cfg.end.split(":").map(Number);
  let cur = sh * 60 + sm;
  const end = eh * 60 + em;
  const slots = [];
  while (cur + cfg.mins <= end) {
    const hh = String(Math.floor(cur / 60)).padStart(2, "0");
    const mm = String(cur % 60).padStart(2, "0");
    const nh = String(Math.floor((cur + cfg.mins) / 60)).padStart(2, "0");
    const nm = String((cur + cfg.mins) % 60).padStart(2, "0");
    slots.push({ clinic_id: clinicId, slot_date: dateStr, start_time: `${hh}:${mm}`, end_time: `${nh}:${nm}`, status: "open" });
    cur += cfg.mins;
  }
  if (slots.length > 0) {
    await supabase.from("appointment_slots")
      .upsert(slots, { onConflict: "clinic_id,slot_date,start_time", ignoreDuplicates: true });
  }
  return slots;
}

export default function BookingFlow({ clinics }) {
  const today = new Date();
  today.setHours(0,0,0,0);

  const [patientType, setPatientType] = useState(""); // "local" or "international"
  const [step, setStep]               = useState(1);
  const [clinicId, setClinicId]       = useState("");
  const [year, setYear]               = useState(today.getFullYear());
  const [month, setMonth]             = useState(today.getMonth());
  const [selectedDate, setDate]       = useState("");
  const [slots, setSlots]             = useState([]);
  const [selectedSlot, setSlot]       = useState(null);
  const [loading, setLoading]         = useState(false);
  const [submitting, setSubmitting]   = useState(false);
  const [form, setForm]               = useState({ name:"", phone:"", email:"", notes:"", country:"" });

  const clinic      = clinics.find(c => c.id === clinicId);
  const allowedDays = getAllowedDays(clinic?.name_en || "");
  const todayStr    = today.toISOString().split("T")[0];

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
      .then(async ({ data }) => {
        if (data && data.length > 0) {
          setSlots(data);
          setLoading(false);
        } else {
          const cfg = getClinicConfig(clinic?.name_en || "");
          await generateSlotsForDate(clinicId, selectedDate, cfg);
          const { data: newData } = await supabase
            .from("appointment_slots")
            .select("id, start_time, end_time, status")
            .eq("clinic_id", clinicId)
            .eq("slot_date", selectedDate)
            .eq("status", "open")
            .order("start_time");
          setSlots(newData || []);
          setLoading(false);
        }
      });
  }, [selectedDate, clinicId]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (patientType === "local" && !selectedSlot) return;
    setSubmitting(true);
    if (patientType === "local" && selectedSlot) {
      await supabase.from("appointment_slots").update({ status: "held" }).eq("id", selectedSlot.id);
    }
    await supabase.from("booking_requests").insert({
      patient_name:  form.name,
      phone:         form.phone,
      clinic:        clinic?.name_en || "Online / Zoom",
      booking_date:  selectedDate || null,
      booking_slot:  selectedSlot ? `${selectedSlot.start_time?.slice(0,5)} – ${selectedSlot.end_time?.slice(0,5)}` : "Zoom — to be confirmed",
      patient_type:  patientType,
      notes:         `${form.country ? "Country: " + form.country + " | " : ""}${form.email ? "Email: " + form.email + " | " : ""}${form.notes}`,
      status:        "pending",
    });
    setSubmitting(false);
    setStep(99);
  }

  const daysInMonth = getDaysInMonth(year, month);
  const firstDow    = new Date(year, month, 1).getDay();
  const DAYS   = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

  const cardStyle = {
    display:"grid", gap:"10px", minHeight:"188px", padding:"20px",
    border:"1px solid var(--line)", background:"#fbfcfc",
    color:"var(--ink)", cursor:"pointer", textAlign:"left",
    transition:"box-shadow 0.15s",
  };
  const selectedCard = { ...cardStyle, borderColor:"var(--gold)", background:"var(--white)", boxShadow:"inset 0 0 0 1px var(--gold)" };

  // ── PATIENT TYPE SELECTION (before step 1) ──
  if (!patientType) {
    return (
      <div style={{maxWidth:"860px",margin:"0 auto"}}>
        <div className="section-kicker" style={{marginBottom:"20px"}}>
          <span className="en">Select Patient Type</span>
          <span className="ar">اختر نوع المريض</span>
        </div>
        <div className="choice-grid">
          <button style={cardStyle} onClick={() => setPatientType("local")}>
            <strong style={{fontSize:"20px"}}>
              <span className="en">🏥 Egyptian / Local Patients</span>
              <span className="ar">🏥 المرضى داخل مصر</span>
            </strong>
            <p style={{color:"var(--muted)",margin:0,lineHeight:"1.55"}}>
              <span className="en">Book a clinic appointment in Kafr El Sheikh or New Cairo. Choose your date and time slot.</span>
              <span className="ar">احجز موعدًا في عيادة كفر الشيخ أو القاهرة الجديدة. اختر تاريخك وموعدك.</span>
            </p>
            <small style={{color:"var(--gold)",fontWeight:"850"}}>
              <span className="en">In-clinic · Payment at clinic</span>
              <span className="ar">داخل العيادة · الدفع في العيادة</span>
            </small>
          </button>
          <button style={cardStyle} onClick={() => { setPatientType("international"); setStep(4); }}>
            <strong style={{fontSize:"20px"}}>
              <span className="en">🌍 International Patients</span>
              <span className="ar">🌍 المرضى الدوليون</span>
            </strong>
            <p style={{color:"var(--muted)",margin:0,lineHeight:"1.55"}}>
              <span className="en">Book a Zoom consultation from anywhere in the world. Confirmed by the clinic team via WhatsApp.</span>
              <span className="ar">احجز استشارة Zoom من أي مكان في العالم. يتم التأكيد من فريق العيادة عبر واتساب.</span>
            </p>
            <small style={{color:"var(--gold)",fontWeight:"850"}}>
              <span className="en">Online · Zoom · 50% deposit required</span>
              <span className="ar">أونلاين · Zoom · مطلوب إيداع 50%</span>
            </small>
          </button>
        </div>
      </div>
    );
  }

  // ── PROGRESS BAR (local only) ──
  const steps = patientType === "local"
    ? [["1","Clinic"],["2","Date"],["3","Slot"],["4","Details"],["5","Confirmed"]]
    : [["1","Details"],["2","Confirmed"]];

  return (
    <div style={{maxWidth:"860px",margin:"0 auto"}}>

      {/* Back to type selection */}
      {step === 1 && (
        <button onClick={() => { setPatientType(""); setStep(1); setClinicId(""); setDate(""); setSlots([]); setSlot(null); }}
          style={{background:"none",border:"none",color:"var(--muted)",cursor:"pointer",fontSize:"13px",marginBottom:"16px",padding:0}}>
          ← <span className="en">Change patient type</span><span className="ar">تغيير نوع المريض</span>
        </button>
      )}

      {/* Progress */}
      <div style={{display:"flex",gap:"8px",marginBottom:"32px",flexWrap:"wrap"}}>
        {steps.map(([n,label]) => (
          <div key={n} style={{display:"flex",alignItems:"center",gap:"6px",fontSize:"13px",fontWeight:"700",
            color:parseInt(n)<=step?"var(--gold)":"var(--muted)"}}>
            <span style={{display:"grid",width:"28px",height:"28px",placeItems:"center",borderRadius:"50%",
              background:parseInt(n)<=step?"var(--gold)":"var(--line)",
              color:parseInt(n)<=step?"#fff":"var(--muted)",fontSize:"12px"}}>{n}</span>
            {label}
            {parseInt(n)<steps.length&&<span style={{color:"var(--line)"}}>›</span>}
          </div>
        ))}
      </div>

      {/* ── LOCAL: STEP 1 — Clinic ── */}
      {patientType==="local" && step===1 && (
        <div>
          <h3 style={{marginBottom:"20px",color:"var(--navy)"}}>
            <span className="en">Choose Clinic</span><span className="ar">اختر العيادة</span>
          </h3>
          <div className="choice-grid">
            {clinics.map(c=>(
              <button key={c.id} style={clinicId===c.id?selectedCard:cardStyle}
                onClick={()=>{setClinicId(c.id);setDate("");setSlots([]);setSlot(null);}}>
                <strong style={{fontSize:"20px"}}><span className="en">{c.name_en}</span><span className="ar">{c.name_ar}</span></strong>
                <p style={{color:"var(--muted)",margin:0}}><span className="en">{c.address_en}</span><span className="ar">{c.address_ar}</span></p>
                <small style={{color:"var(--gold)",fontWeight:"850"}}>
                  {getAllowedDays(c.name_en).map(d=>DAYS[d]).join(", ")} · 3:00 PM – 8:00 PM
                </small>
                {c.phone && <small style={{color:"var(--muted)"}}>📞 {c.phone}</small>}
              </button>
            ))}
          </div>
          {clinicId && (
            <button className="button primary" style={{marginTop:"24px"}} onClick={()=>setStep(2)}>
              <span className="en">Continue</span><span className="ar">متابعة</span>
            </button>
          )}
        </div>
      )}

      {/* ── LOCAL: STEP 2 — Date ── */}
      {patientType==="local" && step===2 && (
        <div>
          <h3 style={{marginBottom:"20px",color:"var(--navy)"}}>
            <span className="en">Choose Date</span><span className="ar">اختر التاريخ</span>
          </h3>
          <div className="booking-calendar" style={{marginBottom:"24px"}}>
            <div className="calendar-head">
              <button onClick={()=>{if(month===0){setYear(y=>y-1);setMonth(11);}else setMonth(m=>m-1);}}
                style={{background:"none",border:"1px solid var(--line)",padding:"6px 12px",cursor:"pointer"}}>←</button>
              <strong>{MONTHS[month]} {year}</strong>
              <button onClick={()=>{if(month===11){setYear(y=>y+1);setMonth(0);}else setMonth(m=>m+1);}}
                style={{background:"none",border:"1px solid var(--line)",padding:"6px 12px",cursor:"pointer"}}>→</button>
            </div>
            <div className="calendar-week">{DAYS.map(d=><span key={d}>{d}</span>)}</div>
            <div className="calendar-grid">
              {Array.from({length:firstDow}).map((_,i)=><div key={`e${i}`} className="calendar-empty"/>)}
              {Array.from({length:daysInMonth}).map((_,i)=>{
                const day=i+1;
                const dateStr=`${year}-${String(month+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
                const dow=new Date(dateStr+"T00:00:00").getDay();
                const isAllowed=allowedDays.includes(dow);
                const isPast=dateStr<todayStr;
                const isSelected=dateStr===selectedDate;
                return(
                  <button key={dateStr}
                    className={`calendar-day${isAllowed&&!isPast?" available":""}${isPast?" disabled":""}${isSelected?" selected":""}`}
                    disabled={!isAllowed||isPast}
                    onClick={()=>{setDate(dateStr);setStep(3);}}>
                    <span>{day}</span>
                    {isAllowed&&!isPast&&<small>Open</small>}
                  </button>
                );
              })}
            </div>
          </div>
          <button className="button ghost" onClick={()=>setStep(1)}>← <span className="en">Back</span><span className="ar">رجوع</span></button>
        </div>
      )}

      {/* ── LOCAL: STEP 3 — Slot ── */}
      {patientType==="local" && step===3 && (
        <div>
          <h3 style={{marginBottom:"8px",color:"var(--navy)"}}>
            <span className="en">Choose Time Slot</span><span className="ar">اختر الموعد</span>
          </h3>
          <p style={{color:"var(--muted)",marginBottom:"20px",fontSize:"14px"}}>{selectedDate} · {clinic?.name_en}</p>
          {loading ? (
            <p style={{color:"var(--muted)"}}>Loading available slots…</p>
          ) : slots.length===0 ? (
            <div>
              <p style={{color:"var(--muted)",marginBottom:"16px"}}>
                <span className="en">No available slots for this date. The day may be closed or fully booked.</span>
                <span className="ar">لا توجد مواعيد متاحة لهذا اليوم. قد يكون اليوم مغلقًا أو محجوزًا بالكامل.</span>
              </p>
              <button className="button ghost" onClick={()=>setStep(2)}>← <span className="en">Choose Another Date</span><span className="ar">اختر تاريخًا آخر</span></button>
            </div>
          ) : (
            <>
              <div className="booking-options">
                {slots.map(slot=>(
                  <button key={slot.id} className={`slot-card${selectedSlot?.id===slot.id?" selected":""}`}
                    onClick={()=>setSlot(slot)}>
                    {slot.start_time?.slice(0,5)} – {slot.end_time?.slice(0,5)}
                    <span><span className="en">Available</span><span className="ar">متاح</span></span>
                  </button>
                ))}
              </div>
              <div className="hero-actions">
                <button className="button ghost" onClick={()=>setStep(2)}>← <span className="en">Back</span><span className="ar">رجوع</span></button>
                {selectedSlot&&<button className="button primary" onClick={()=>setStep(4)}><span className="en">Continue</span><span className="ar">متابعة</span> →</button>}
              </div>
            </>
          )}
        </div>
      )}

      {/* ── STEP 4 — Details (both local & international) ── */}
      {step===4 && step!==99 && (
        <div>
          <h3 style={{marginBottom:"8px",color:"var(--navy)"}}>
            <span className="en">Your Details</span><span className="ar">بياناتك</span>
          </h3>

          {patientType==="local" && (
            <p style={{color:"var(--muted)",marginBottom:"24px",fontSize:"14px"}}>
              {selectedDate} · {selectedSlot?.start_time?.slice(0,5)} – {selectedSlot?.end_time?.slice(0,5)} · {clinic?.name_en}
            </p>
          )}
          {patientType==="international" && (
            <div style={{background:"#f0f6ff",border:"1px solid #c8d8f0",borderRadius:"8px",padding:"14px 18px",marginBottom:"24px"}}>
              <p style={{margin:"0 0 6px",color:"var(--navy)",fontWeight:"700"}}>
                <span className="en">🌍 International Zoom Consultation</span>
                <span className="ar">🌍 استشارة Zoom دولية</span>
              </p>
              <p style={{margin:0,color:"var(--muted)",fontSize:"13px",lineHeight:"1.6"}}>
                <span className="en">Submit your details and the clinic team will contact you via WhatsApp to confirm your Zoom slot and payment (50% deposit required).</span>
                <span className="ar">أرسل بياناتك وسيتواصل معك فريق العيادة عبر واتساب لتأكيد موعد Zoom والدفع (مطلوب إيداع 50%).</span>
              </p>
            </div>
          )}

          <form className="booking-form" onSubmit={handleSubmit}>
            <label>
              <span><span className="en">Full Name</span><span className="ar">الاسم الكامل</span></span>
              <input required value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))} placeholder="Your full name" />
            </label>
            <label>
              <span><span className="en">Phone / WhatsApp</span><span className="ar">الهاتف / واتساب</span></span>
              <input required value={form.phone} onChange={e=>setForm(p=>({...p,phone:e.target.value}))} placeholder="+20xxxxxxxxx" />
            </label>
            {patientType==="international" && (
              <>
                <label>
                  <span><span className="en">Email</span><span className="ar">البريد الإلكتروني</span></span>
                  <input type="email" value={form.email} onChange={e=>setForm(p=>({...p,email:e.target.value}))} placeholder="your@email.com" />
                </label>
                <label>
                  <span><span className="en">Country</span><span className="ar">الدولة</span></span>
                  <select value={form.country} onChange={e=>setForm(p=>({...p,country:e.target.value}))} required>
                    <option value="">Select country / اختر الدولة</option>
                    {["Saudi Arabia","United Arab Emirates","Kuwait","Qatar","Bahrain","Oman","Jordan","Lebanon","Syria","Iraq","Libya","Tunisia","Algeria","Morocco","Sudan","Yemen","United Kingdom","United States","Canada","Australia","Germany","France","Italy","Spain","Netherlands","Belgium","Sweden","Switzerland","Austria","Other"].map(c=>(
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </label>
              </>
            )}
            <textarea rows={3}
              placeholder="Notes / medical history (optional)"
              style={{gridColumn:"1/-1"}}
              value={form.notes} onChange={e=>setForm(p=>({...p,notes:e.target.value}))}/>
            <label className="consent" style={{gridColumn:"1/-1"}}>
              <input type="checkbox" required/>
              <span><span className="en">I confirm my details are correct and agree to the clinic's policies.</span><span className="ar">أؤكد صحة بياناتي وأوافق على سياسات العيادة.</span></span>
            </label>
            <div className="hero-actions" style={{gridColumn:"1/-1"}}>
              {patientType==="local" && <button type="button" className="button ghost" onClick={()=>setStep(3)}>← <span className="en">Back</span><span className="ar">رجوع</span></button>}
              {patientType==="international" && <button type="button" className="button ghost" onClick={()=>{ setPatientType(""); setStep(1); }}>← <span className="en">Back</span><span className="ar">رجوع</span></button>}
              <button type="submit" className="button primary" disabled={submitting}>
                {submitting ? "Submitting…" : <><span className="en">Submit Request</span><span className="ar">إرسال الطلب</span></>}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── CONFIRMED ── */}
      {step===99 && (
        <div style={{textAlign:"center",padding:"48px 0"}}>
          <div style={{fontSize:"48px",marginBottom:"16px"}}>✅</div>
          <h2 style={{color:"var(--navy)",marginBottom:"12px"}}>
            <span className="en">Request Submitted Successfully</span>
            <span className="ar">تم إرسال الطلب بنجاح</span>
          </h2>
          <p style={{color:"var(--muted)",maxWidth:"520px",margin:"0 auto 24px",lineHeight:"1.7"}}>
            <span className="en">Your request has been received. The clinic team will confirm your appointment via WhatsApp or phone shortly.</span>
            <span className="ar">تم استلام طلبك. سيتواصل معك فريق العيادة عبر واتساب أو الهاتف لتأكيد الموعد.</span>
          </p>
          {patientType==="local" && (
            <div style={{background:"var(--soft)",border:"1px solid var(--line)",padding:"20px",maxWidth:"400px",margin:"0 auto 24px",textAlign:"left"}}>
              <p style={{margin:"0 0 8px",color:"var(--navy)",fontWeight:"700"}}>{clinic?.name_en}</p>
              <p style={{margin:"0 0 4px",color:"var(--muted)"}}>{selectedDate}</p>
              <p style={{margin:0,color:"var(--muted)"}}>{selectedSlot?.start_time?.slice(0,5)} – {selectedSlot?.end_time?.slice(0,5)}</p>
            </div>
          )}
          {patientType==="international" && (
            <div style={{background:"#f0f6ff",border:"1px solid #c8d8f0",padding:"20px",maxWidth:"400px",margin:"0 auto 24px"}}>
              <p style={{margin:"0 0 8px",color:"var(--navy)",fontWeight:"700"}}>
                <span className="en">🌍 Zoom Consultation Request</span>
                <span className="ar">🌍 طلب استشارة Zoom</span>
              </p>
              <p style={{margin:0,color:"var(--muted)",fontSize:"13px"}}>
                <span className="en">The team will contact you on WhatsApp to arrange your slot and payment details.</span>
                <span className="ar">سيتواصل الفريق معك عبر واتساب لترتيب موعدك وتفاصيل الدفع.</span>
              </p>
            </div>
          )}
          <a className="button primary" href="/"><span className="en">Return Home</span><span className="ar">العودة للرئيسية</span></a>
        </div>
      )}
    </div>
  );
}
