import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

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

export default async function HomePage() {
  const { pageMap, services, clinics, contact } = await getData();
  const hero  = pageMap["hero"]  || {};
  const about = pageMap["about"] || {};

  const kafrClinic   = clinics.find(c => c.name_en?.toLowerCase().includes("kafr")) || clinics[0] || {};
  const mividaClinic = clinics.find(c => c.name_en?.toLowerCase().includes("mivida")) || clinics[1] || {};

  return (
    <main>
      {/* HERO */}
      <section className="hero">
        <img className="hero-image" src="/hero-clinic.png" alt="Dr. Maged Ragab clinic" />
        <div className="hero-scrim" />
        <div className="hero-content">
          <p className="eyebrow">
            <span className="en">Professor & Head of Urology Department, Tanta University</span>
            <span className="ar">أستاذ ورئيس قسم المسالك البولية - جامعة طنطا</span>
          </p>
          <h1>
            <span className="en">{hero.title_en || "Excellence in Urology & Men's Health"}</span>
            <span className="ar">{hero.title_ar || "التميز في المسالك البولية وصحة الرجال"}</span>
          </h1>
          <p className="hero-subtitle">
            <span className="en">{hero.body_en || "World-Class Urology & Men's Health Care Led by Academic Excellence."}</span>
            <span className="ar">{hero.body_ar || "رعاية عالمية في المسالك وصحة الرجال بقيادة أكاديمية متميزة."}</span>
          </p>
          <div className="hero-actions">
            <Link className="button primary" href="/booking"><span className="en">Book Appointment</span><span className="ar">احجز موعد</span></Link>
            <Link className="button ghost" href="/services"><span className="en">Explore Services</span><span className="ar">استكشف الخدمات</span></Link>
            <Link className="button quiet" href="/international"><span className="en">International Consultation</span><span className="ar">استشارة دولية</span></Link>
          </div>
        </div>
      </section>

      {/* AUTHORITY STRIP */}
      <section className="authority-strip">
        <div>
          <strong><span className="en">Advanced Diagnostics</span><span className="ar">تشخيص متقدم</span></strong>
          <span><span className="en">Evidence-led assessment for complex urology, male fertility, and men's health cases.</span><span className="ar">تقييم قائم على الدليل للحالات المعقدة في المسالك وخصوبة الرجال وصحة الرجال.</span></span>
        </div>
        <div>
          <strong><span className="en">Minimally Invasive Care</span><span className="ar">علاجات قليلة التدخل</span></strong>
          <span><span className="en">Modern procedures designed for precision, comfort, faster recovery, and reduced surgical burden.</span><span className="ar">إجراءات حديثة مصممة للدقة والراحة وسرعة التعافي وتقليل العبء الجراحي.</span></span>
        </div>
        <div>
          <strong><span className="en">International Patients</span><span className="ar">مرضى خارج مصر</span></strong>
          <span><span className="en">Online consultation paths with report upload, time-zone guidance, and treatment planning.</span><span className="ar">مسارات استشارة أونلاين مع رفع التقارير وإرشاد التوقيت وخطة علاج للمرضى خارج مصر.</span></span>
        </div>
      </section>

      {/* ABOUT PREVIEW — photo first */}
      <section className="section about-section">
        <div className="split image-split">
          <div style={{ display:"flex", flexDirection:"column", gap:"24px" }}>
            <img
              src="/Maged%20photo.png"
              alt="Professor Dr. Maged Ragab"
              style={{ width:"100%", maxWidth:"420px", display:"block", borderRadius:"4px", boxShadow:"0 24px 70px rgba(9,21,35,0.18)" }}
            />
            <div>
              <div className="section-kicker"><span className="en">About Dr. Maged</span><span className="ar">عن د. ماجد</span></div>
              <h2>
                <span className="en">{about.title_en || "Academic Leadership. Surgical Precision. Human Care."}</span>
                <span className="ar">{about.title_ar || "قيادة أكاديمية. دقة جراحية. رعاية إنسانية."}</span>
              </h2>
            </div>
          </div>
          <div className="section-copy">
            <p>
              <span className="en">{about.body_en || "Professor Dr. Maged Ragab is a Professor of Urology & Andrology and Head of the Urology Department at Tanta University Hospital, with more than 25 years of experience in advanced urology, male infertility, and men's health."}</span>
              <span className="ar">{about.body_ar || "الأستاذ الدكتور ماجد رجب أستاذ المسالك البولية وطب الذكورة ورئيس قسم المسالك البولية بمستشفى جامعة طنطا، بخبرة تزيد عن 25 عامًا في المسالك المتقدمة وتأخر الإنجاب وصحة الرجال."}</span>
            </p>
            <div className="stats-row" style={{marginBottom:"24px"}}>
              {[["25+","Years Experience","سنة خبرة"],["10,000+","Surgeries","عملية جراحية"],["300+","Conferences","مؤتمر دولي"]].map(([num,enL,arL])=>(
                <div key={num}>
                  <strong>{num}</strong>
                  <span><span className="en">{enL}</span><span className="ar">{arL}</span></span>
                </div>
              ))}
            </div>
            <div className="hero-actions">
              <Link className="button primary" href="/about"><span className="en">Read More About Dr. Maged</span><span className="ar">اقرأ المزيد عن د. ماجد</span></Link>
            </div>
          </div>
        </div>
      </section>

      {/* EXPERTISE */}
      <section className="section">
        <div className="section-kicker"><span className="en">Main Areas of Expertise</span><span className="ar">مجالات الخبرة الرئيسية</span></div>
        <div className="compact-grid">
          {["Male Infertility","Azoospermia","Micro-TESE","Varicocele","Erectile Dysfunction","Penile Prosthesis","Peyronie's Disease","Prostate Diseases","Rezum Technology","Echolaser Technology","Kidney Stones","Endoscopic Urology","Sexual Dysfunction","Men's Health"].map(s => (
            <Link key={s} href="/services"><span className="en">{s}</span><span className="ar">{s}</span></Link>
          ))}
        </div>
      </section>

      {/* WHY CHOOSE */}
      <section className="section why-section">
        <div className="section-kicker"><span className="en">Why Choose Dr. Maged</span><span className="ar">لماذا د. ماجد</span></div>
        <div className="why-list six">
          {[
            ["01","Academic Leadership","قيادة أكاديمية","Professor and department head with decades of academic and clinical leadership.","أستاذ ورئيس قسم بعقود من القيادة الأكاديمية والسريرية."],
            ["02","Advanced Surgical Expertise","خبرة جراحية متقدمة","Mastery in complex urological and men's health procedures.","إتقان في الإجراءات المعقدة للمسالك البولية وصحة الرجال."],
            ["03","Male Infertility Focus","تركيز على خصوبة الرجال","Specialized in azoospermia, Micro-TESE, and advanced fertility options.","متخصص في انعدام الحيوانات المنوية وMicro-TESE وخيارات الخصوبة المتقدمة."],
            ["04","Confidential Men's Health","رعاية سرية لصحة الرجال","A respectful, private approach to sensitive men's health concerns.","منهج محترم وخاص للمخاوف الحساسة في صحة الرجال."],
            ["05","International Presence","حضور طبي دولي","International conferences, fellowships, and cross-border patient experience.","مؤتمرات دولية وزمالات وخبرة مع المرضى عبر الحدود."],
            ["06","Personalized Treatment","خطة علاج شخصية","Every patient receives a tailored diagnosis and treatment plan.","كل مريض يحصل على تشخيص وخطة علاج مخصصة."],
          ].map(([num, en, ar, descEn, descAr]) => (
            <div key={num}>
              <span>{num}</span>
              <strong><span className="en">{en}</span><span className="ar">{ar}</span></strong>
              <p><span className="en">{descEn}</span><span className="ar">{descAr}</span></p>
            </div>
          ))}
        </div>
      </section>

      {/* SERVICES (from DB) */}
      {services.length > 0 && (
        <section className="section services-section">
          <div className="section-heading">
            <div>
              <div className="section-kicker"><span className="en">Services</span><span className="ar">الخدمات</span></div>
              <h2><span className="en">What We Treat</span><span className="ar">ما نعالجه</span></h2>
            </div>
            <Link className="text-link" href="/services"><span className="en">View All Services</span><span className="ar">عرض كل الخدمات</span></Link>
          </div>
          <div className="service-grid">
            {services.slice(0, 6).map(svc => (
              <div key={svc.id} className="service-card">
                {svc.icon && <div className="service-icon">{svc.icon}</div>}
                <h3><span className="en">{svc.name_en}</span><span className="ar">{svc.name_ar}</span></h3>
                <p><span className="en">{svc.description_en}</span><span className="ar">{svc.description_ar}</span></p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* PATIENT PATHWAYS */}
      <section className="section pathway-section">
        <div className="section-kicker"><span className="en">Patient Pathways</span><span className="ar">مسارات المرضى</span></div>
        <div className="two-card-grid">
          <article className="feature-card">
            <h3><span className="en">Egyptian / Local Patients</span><span className="ar">المرضى داخل مصر</span></h3>
            <ul>
              <li><span className="en">Choose clinic location</span><span className="ar">اختيار العيادة</span></li>
              <li><span className="en">Choose available date</span><span className="ar">اختيار اليوم المتاح</span></li>
              <li><span className="en">Choose appointment slot</span><span className="ar">اختيار الموعد</span></li>
              <li><span className="en">Payment at clinic only</span><span className="ar">الدفع داخل العيادة فقط</span></li>
              <li><span className="en">Receive WhatsApp confirmation</span><span className="ar">استلام تأكيد واتساب</span></li>
            </ul>
          </article>
          <article className="feature-card">
            <h3><span className="en">International Patients</span><span className="ar">المرضى الدوليون</span></h3>
            <ul>
              <li><span className="en">Dedicated Zoom slots</span><span className="ar">مواعيد Zoom مخصصة</span></li>
              <li><span className="en">Optional report upload</span><span className="ar">رفع التقارير اختياري</span></li>
              <li><span className="en">50% deposit required</span><span className="ar">مطلوب إيداع 50%</span></li>
              <li><span className="en">Human approval before confirmation</span><span className="ar">مراجعة بشرية قبل التأكيد</span></li>
              <li><span className="en">WhatsApp confirmation</span><span className="ar">تأكيد واتساب</span></li>
            </ul>
          </article>
        </div>
        <Link className="button primary" href="/booking"><span className="en">Start Booking</span><span className="ar">ابدأ الحجز</span></Link>
      </section>

      {/* CLINICS */}
      <section className="section locations-section">
        <div>
          <div className="section-kicker"><span className="en">Clinics</span><span className="ar">العيادات</span></div>
          <h2><span className="en">Two premium clinic routes in Kafr El Sheikh and New Cairo.</span><span className="ar">مساران متميزان للحجز في كفر الشيخ والقاهرة الجديدة.</span></h2>
        </div>
        <div className="location-grid" style={{gridTemplateColumns:"repeat(2,minmax(0,1fr))"}}>
          {[kafrClinic, mividaClinic].filter(c => c.id).map(clinic => (
            <article key={clinic.id} className="location-card">
              <strong><span className="en">{clinic.name_en}</span><span className="ar">{clinic.name_ar}</span></strong>
              <p><span className="en">{clinic.address_en}</span><span className="ar">{clinic.address_ar}</span></p>
              <span><span className="en">Time</span><span className="ar">الوقت</span>: 3:00 PM – 8:00 PM</span>
              {clinic.google_maps_url && <a className="button quiet" href={clinic.google_maps_url} target="_blank" rel="noopener noreferrer"><span className="en">Google Maps</span><span className="ar">خرائط Google</span></a>}
              {clinic.phone && <a className="button ghost" href={`tel:${clinic.phone}`}><span className="en">Call</span><span className="ar">اتصال</span></a>}
              <Link className="button primary" href="/booking"><span className="en">Book this location</span><span className="ar">احجز هذا الفرع</span></Link>
            </article>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="section testimonial-section">
        <div className="testimonial">
          <p><span className="en">The consultation was very professional and private. Dr. Maged explained my condition clearly and gave me confidence in the treatment plan.</span><span className="ar">كانت الاستشارة مهنية وخاصة جدًا. شرح د. ماجد الحالة بوضوح ومنحني ثقة في خطة العلاج.</span></p>
          <span><span className="en">Patient from Egypt</span><span className="ar">مريض من مصر</span></span>
        </div>
        <div className="testimonial">
          <p><span className="en">I booked an online consultation from outside Egypt. The process was smooth, and the medical explanation was clear and detailed.</span><span className="ar">حجزت استشارة أونلاين من خارج مصر. كانت العملية سلسة والشرح الطبي واضحًا ومفصلًا.</span></p>
          <span><span className="en">International Patient</span><span className="ar">مريض دولي</span></span>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="section final-cta">
        <h2><span className="en">Take the First Step Toward Better Men's Health</span><span className="ar">اتخذ الخطوة الأولى نحو صحة أفضل للرجل</span></h2>
        <div className="hero-actions">
          <Link className="button primary" href="/booking"><span className="en">Book Appointment</span><span className="ar">احجز موعد</span></Link>
          <Link className="button ghost" href="/international"><span className="en">International Consultation</span><span className="ar">استشارة دولية</span></Link>
          <Link className="button quiet" href="/contact"><span className="en">Contact the Clinic</span><span className="ar">تواصل مع العيادة</span></Link>
        </div>
      </section>
    </main>
  );
}
