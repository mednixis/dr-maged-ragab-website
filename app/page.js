export const revalidate = 0;
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

export const metadata = {
  title: "Dr. Maged Ragab | Professor of Urology & Men's Health — Egypt",
  description: "Professor Dr. Maged Ragab — Head of Andrology, Tanta University. Specialist in male infertility, azoospermia, Micro-TESE, erectile dysfunction, and advanced urology. Clinics in Kafr El Sheikh & New Cairo.",
};

async function getData() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
  const [{ data: pages }, { data: services }, { data: clinics }, { data: contact }] = await Promise.all([
    supabase.from("content_pages").select("*"),
    supabase.from("services").select("*").eq("active", true).order("sort_order"),
    supabase.from("clinic_locations").select("*").eq("active", true),
    supabase.from("contact_info").select("*").maybeSingle(),
  ]);
  const pageMap = {};
  (pages || []).forEach(p => { pageMap[p.slug] = p; });
  return { pageMap, services: services || [], clinics: clinics || [], contact: contact || {} };
}

// Fix: Egyptian WhatsApp numbers need +20, drop leading 0
function waLink(phone) {
  if (!phone) return "#";
  const digits = phone.replace(/\D/g, "");
  const intl = digits.startsWith("0") ? "20" + digits.slice(1) : digits;
  return `https://wa.me/${intl}`;
}

const CLINIC_SCHEDULE = {
  kafr:   { days_en: "Sun · Tue · Sat", days_ar: "الأحد · الثلاثاء · السبت" },
  mivida: { days_en: "Wed · Thu",        days_ar: "الأربعاء · الخميس" },
};

// Condition groups — replaces the old flat 14-item expertise list.
// Edit group names / items here. Links point to the previously orphaned pages.
const CONDITION_GROUPS = [
  {
    en: "Male fertility", ar: "خصوبة الرجل",
    href: "/conditions",
    items: [
      ["Male infertility", "عقم الرجال"],
      ["Azoospermia", "انعدام الحيوانات المنوية"],
      ["Micro-TESE", "Micro-TESE"],
      ["Varicocele", "دوالي الخصية"],
    ],
    moreEn: "All fertility conditions", moreAr: "كل حالات الخصوبة",
  },
  {
    en: "Men's health", ar: "صحة الرجل",
    href: "/conditions",
    items: [
      ["Erectile dysfunction", "ضعف الانتصاب"],
      ["Penile prosthesis", "دعامات العضو الذكري"],
      ["Peyronie's disease", "مرض بيروني"],
      ["Sexual dysfunction", "الضعف الجنسي"],
    ],
    moreEn: "All men's health conditions", moreAr: "كل حالات صحة الرجل",
  },
  {
    en: "Prostate & urology", ar: "البروستاتا والمسالك البولية",
    href: "/procedures",
    items: [
      ["Prostate diseases", "أمراض البروستاتا"],
      ["Rezum technology", "تقنية Rezum"],
      ["Echolaser technology", "تقنية Echolaser"],
      ["Kidney stones", "حصوات الكلى"],
      ["Endoscopic urology", "مناظير المسالك البولية"],
    ],
    moreEn: "All procedures", moreAr: "كل الإجراءات",
  },
];

export default async function HomePage() {
  const { pageMap, services, clinics, contact } = await getData();
  const hero  = pageMap["hero"]  || {};
  const about = pageMap["about"] || {};

  const kafrClinic   = clinics.find(c => c.name_en?.toLowerCase().includes("kafr"))   || clinics[0] || {};
  const mividaClinic = clinics.find(c => c.name_en?.toLowerCase().includes("mivida")) || clinics[1] || {};

  return (
    <main>

      {/* 1 · HERO — one primary action, one secondary */}
      <section className="hero">
        <img className="hero-image" src="/hero-clinic.png" alt="Dr. Maged Ragab clinic" />
        <div className="hero-scrim" />
        <div className="hero-content">
          <p className="eyebrow">
            <span className="en">Professor &amp; Head of Urology Department, Tanta University</span>
            <span className="ar">أستاذ ورئيس قسم المسالك البولية - جامعة طنطا</span>
          </p>
          <h1>
            <span className="en">{hero.title_en || "Excellence in Urology & Men's Health"}</span>
            <span className="ar">{hero.title_ar || "التميز في المسالك البولية وصحة الرجل"}</span>
          </h1>
          <p className="hero-subtitle">
            <span className="en">{hero.body_en || "World-Class Urology & Men's Health Care Led by Academic Excellence."}</span>
            <span className="ar">{hero.body_ar || "رعاية عالمية المستوى للمسالك البولية وصحة الرجل بقيادة أكاديمية متميزة."}</span>
          </p>
          <div className="hero-actions">
            <Link className="button primary" href="/booking"><span className="en">Book Appointment</span><span className="ar">احجز موعد</span></Link>
            <Link className="button quiet" href="#treat"><span className="en">See What We Treat</span><span className="ar">ما نعالجه</span></Link>
          </div>
          {/* NEW COPY — please review the Arabic */}
          <p className="hero-note">
            <span className="en">Appointments confirmed by WhatsApp · Payment at the clinic</span>
            <span className="ar">تأكيد المواعيد عبر واتساب · الدفع في العيادة</span>
          </p>
        </div>
      </section>

      {/* 2 · WHAT WE TREAT — merges the old Expertise list + Services grid */}
      <section className="section services-section" id="treat">
        <div className="section-heading">
          <div>
            <h2><span className="en">What We Treat</span><span className="ar">ما نعالجه</span></h2>
          </div>
          <Link className="text-link" href="/services"><span className="en">View All Services</span><span className="ar">عرض كل الخدمات</span></Link>
        </div>
        {/* NEW COPY — please review the Arabic */}
        <p className="section-copy" style={{ marginBottom: "32px" }}>
          <span className="en">Not sure which applies to you? Book a consultation and we will guide you.</span>
          <span className="ar">لست متأكداً من حالتك؟ احجز استشارة وسنرشدك.</span>
        </p>
        <div className="condition-grid">
          {CONDITION_GROUPS.map(g => (
            <article key={g.en} className="feature-card">
              <h3><span className="en">{g.en}</span><span className="ar">{g.ar}</span></h3>
              <ul>
                {g.items.map(([en, ar]) => (
                  <li key={en}><span className="en">{en}</span><span className="ar">{ar}</span></li>
                ))}
              </ul>
              <Link className="text-link group-more" href={g.href}>
                <span className="en">{g.moreEn}</span><span className="ar">{g.moreAr}</span>
              </Link>
            </article>
          ))}
        </div>
      </section>

      {/* 3 · CLINICS — moved up from position 8 */}
      <section className="section locations-section">
        <div>
          <h2><span className="en">Where to Find Us</span><span className="ar">أين تجدنا</span></h2>
          {/* NEW COPY — please review the Arabic */}
          <p className="section-copy">
            <span className="en">Two clinics, both open afternoons and evenings.</span>
            <span className="ar">عيادتان، تفتحان بعد الظهر والمساء.</span>
          </p>
        </div>
        <div className="location-grid" style={{gridTemplateColumns:"repeat(2,minmax(0,1fr))"}}>
          {[
            { clinic: kafrClinic,   sched: CLINIC_SCHEDULE.kafr },
            { clinic: mividaClinic, sched: CLINIC_SCHEDULE.mivida },
          ].filter(({ clinic }) => clinic.id).map(({ clinic, sched }) => (
            <article key={clinic.id} className="location-card">
              <strong><span className="en">{clinic.name_en}</span><span className="ar">{clinic.name_ar}</span></strong>
              <p><span className="en">{clinic.address_en}</span><span className="ar">{clinic.address_ar}</span></p>
              <p style={{ margin:"4px 0", fontSize:"13px" }}>
                <span className="en">📅 {sched.days_en} &nbsp;·&nbsp; 🕒 3:00 – 9:00 PM</span>
                <span className="ar">📅 {sched.days_ar} &nbsp;·&nbsp; 🕒 3:00 – 9:00 م</span>
              </p>
              <div style={{ display:"flex", gap:"8px", flexWrap:"wrap", marginTop:"10px" }}>
                <Link className="button primary" href="/booking">
                  <span className="en">Book here</span><span className="ar">احجز هنا</span>
                </Link>
                {clinic.google_maps_url && (
                  <a className="button ghost" href={clinic.google_maps_url} target="_blank" rel="noopener noreferrer">
                    <span className="en">Directions</span><span className="ar">الاتجاهات</span>
                  </a>
                )}
                {clinic.phone && (
                  <a className="button ghost" href={`tel:${clinic.phone}`}>
                    <span className="en">Call</span><span className="ar">اتصال</span>
                  </a>
                )}
                {clinic.phone && (
                  <a className="button ghost" href={waLink(clinic.phone)} target="_blank" rel="noopener noreferrer">
                    <span className="en">WhatsApp</span><span className="ar">واتساب</span>
                  </a>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* 4 · ABOUT — merges old About + Authority strip + Why Choose */}
      <section className="section about-section">
        <div className="split image-split">
          <div className="about-photo-col">
            <img
              src="/Maged%20photo.png"
              alt="Professor Dr. Maged Ragab"
              style={{ width:"100%", maxWidth:"420px", display:"block", borderRadius:"4px", boxShadow:"0 24px 70px rgba(55,7,13,0.20)" }}
            />
          </div>
          <div className="section-copy">
            <h2>
              <span className="en">{about.title_en || "Academic Leadership. Surgical Precision. Human Care."}</span>
              <span className="ar">{about.title_ar || "قيادة أكاديمية. دقة جراحية. رعاية إنسانية."}</span>
            </h2>
            <p>
              <span className="en">{about.body_en || "Professor Dr. Maged Ragab is a Professor of Urology & Andrology and Head of the Urology Department at Tanta University, with more than 25 years of clinical and academic practice."}</span>
              <span className="ar">{about.body_ar || "الأستاذ الدكتور ماجد رجب أستاذ المسالك البولية والذكورة ورئيس قسم المسالك البولية بجامعة طنطا، بخبرة تزيد عن 25 عاماً في الممارسة السريرية والأكاديمية."}</span>
            </p>
            <div className="stats-row" style={{marginBottom:"24px"}}>
              {[["25+","Years Experience","سنة خبرة"],["10,000+","Surgeries","عملية جراحية"],["300+","Conferences","مؤتمر"]].map(([num,enL,arL])=>(
                <div key={num}>
                  <strong>{num}</strong>
                  <span><span className="en">{enL}</span><span className="ar">{arL}</span></span>
                </div>
              ))}
            </div>
            <ul className="about-points">
              {[
                ["Specialised in azoospermia, Micro-TESE and advanced fertility options.","متخصص في انعدام الحيوانات المنوية وMicro-TESE وخيارات الخصوبة المتقدمة."],
                ["A respectful, private approach to sensitive men's health concerns.","منهج محترم وخاص للمخاوف الحساسة في صحة الرجال."],
                ["Every patient receives a tailored diagnosis and treatment plan.","كل مريض يحصل على تشخيص وخطة علاج مخصصة."],
              ].map(([en,ar]) => (
                <li key={en}><span className="en">{en}</span><span className="ar">{ar}</span></li>
              ))}
            </ul>
            <div className="hero-actions">
              <Link className="button ghost" href="/about"><span className="en">Read Full Profile</span><span className="ar">الملف الكامل</span></Link>
            </div>
          </div>
        </div>
      </section>

      {/* 5 · HOW BOOKING WORKS */}
      <section className="section pathway-section">
        <h2><span className="en">How Booking Works</span><span className="ar">كيف يتم الحجز</span></h2>
        <div className="two-card-grid" style={{ marginTop: "32px" }}>
          <div className="feature-card">
            <h3><span className="en">Patients in Egypt</span><span className="ar">المرضى في مصر</span></h3>
            <ul>
              <li><span className="en">Choose clinic location</span><span className="ar">اختر موقع العيادة</span></li>
              <li><span className="en">Choose available date</span><span className="ar">اختر التاريخ المتاح</span></li>
              <li><span className="en">Choose appointment slot</span><span className="ar">اختر موعد الحجز</span></li>
              <li><span className="en">Receive WhatsApp confirmation</span><span className="ar">استلم تأكيد واتساب</span></li>
              <li><span className="en">Payment at clinic only</span><span className="ar">الدفع في العيادة فقط</span></li>
            </ul>
          </div>
          <div className="feature-card">
            <h3><span className="en">International Patients</span><span className="ar">المرضى الدوليون</span></h3>
            <ul>
              <li><span className="en">Dedicated Zoom slots</span><span className="ar">مواعيد Zoom مخصصة</span></li>
              <li><span className="en">Optional report upload</span><span className="ar">رفع التقارير اختياري</span></li>
              <li><span className="en">50% deposit required</span><span className="ar">مقدم مطلوب 50%</span></li>
              <li><span className="en">Human approval before confirmation</span><span className="ar">مراجعة بشرية قبل التأكيد</span></li>
              <li><span className="en">WhatsApp confirmation</span><span className="ar">تأكيد واتساب</span></li>
            </ul>
          </div>
        </div>
        <div className="hero-actions" style={{ marginTop: "28px" }}>
          <Link className="button primary" href="/booking"><span className="en">Start Booking</span><span className="ar">ابدأ الحجز</span></Link>
          <Link className="button quiet" href="/international"><span className="en">International Consultation</span><span className="ar">استشارة دولية</span></Link>
        </div>
      </section>

      {/* 6 · TESTIMONIALS */}
      <section className="section testimonial-section">
        <div className="testimonial">
          <p>
            <span className="en">After years of searching, Dr. Maged diagnosed my azoospermia correctly on the first visit and gave us a clear path forward with Micro-TESE. We finally had real answers.</span>
            <span className="ar">بعد سنوات من البحث، شخّص د. ماجد حالة الأزوسبيرميا بدقة من أول زيارة وأعطانا مساراً واضحاً عبر Micro-TESE. وجدنا أخيراً إجابات حقيقية.</span>
          </p>
          <span><span className="en">Infertility patient — Cairo, 2025</span><span className="ar">مريض عقم — القاهرة، 2025</span></span>
        </div>
        <div className="testimonial">
          <p>
            <span className="en">I traveled from Saudi Arabia specifically for Dr. Maged. He reviewed my reports before the appointment, explained everything clearly, and the treatment plan was exactly what I needed.</span>
            <span className="ar">سافرت من السعودية خصيصاً لد. ماجد. راجع تقاريري قبل الموعد وشرح كل شيء بوضوح. كانت خطة العلاج بالضبط ما احتجته.</span>
          </p>
          <span><span className="en">International patient — Saudi Arabia, 2025</span><span className="ar">مريض دولي — المملكة العربية السعودية، 2025</span></span>
        </div>
      </section>

      {/* 7 · FINAL CTA */}
      <section className="section final-cta">
        <h2><span className="en">Take the First Step Toward Better Men's Health</span><span className="ar">اتخذ الخطوة الأولى نحو صحة أفضل للرجل</span></h2>
        <div className="hero-actions">
          <Link className="button primary" href="/booking"><span className="en">Book Appointment</span><span className="ar">احجز موعد</span></Link>
          <Link className="button quiet" href="/contact"><span className="en">Contact the Clinic</span><span className="ar">تواصل مع العيادة</span></Link>
        </div>
      </section>

    </main>
  );
}
