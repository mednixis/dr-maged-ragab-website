import Link from "next/link";
import Header from "../../components/Header.js";
import { createClient } from "@supabase/supabase-js";

export const metadata = { title: "About | Dr. Maged Ragab" };

async function getAbout() {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  const { data } = await supabase.from("content_pages").select("*").eq("slug","about").maybeSingle();
  return data || {};
}

export default async function AboutPage() {
  const about = await getAbout();
  return (
    <>
      <Header isPage />
      <div className="page-hero">
        <p className="eyebrow"><span className="en">About</span><span className="ar">عن الدكتور</span></p>
        <h1>
          <span className="en">{about.title_en || "Academic Leadership. Surgical Precision. Human Care."}</span>
          <span className="ar">{about.title_ar || "قيادة أكاديمية. دقة جراحية. رعاية إنسانية."}</span>
        </h1>
        <p><span className="en">Professor of Urology & Andrology — Head of Urology Department, Tanta University Hospital</span><span className="ar">أستاذ المسالك البولية وطب الذكورة — رئيس قسم المسالك البولية، مستشفى جامعة طنطا</span></p>
      </div>
      <main>

        {/* BIO + PHOTO */}
        <section className="section">
          <div className="split image-split">
            <div>
              <img src="/Maged%20photo.png" alt="Professor Dr. Maged Ragab"
                style={{width:"100%",maxWidth:"480px",display:"block",borderRadius:"4px",boxShadow:"0 24px 70px rgba(9,21,35,0.18)"}} />
            </div>
            <div className="section-copy">
              <div className="section-kicker"><span className="en">Biography</span><span className="ar">السيرة الذاتية</span></div>
              <h2 style={{marginBottom:"20px"}}>
                <span className="en">Professor Dr. Maged M. Ragab</span>
                <span className="ar">الأستاذ الدكتور ماجد محمد رجب</span>
              </h2>
              <p>
                <span className="en">{about.body_en || "Professor of Urology and Andrology at Tanta University Hospital, Egypt, and Head of the Andrology Unit. With over 25 years of academic and clinical experience, Dr. Maged Ragab is recognized internationally for his expertise in male infertility, microsurgery, minimally invasive urology, and men's health. He combines surgical excellence with an active academic career in research, teaching, and postgraduate education."}</span>
                <span className="ar">{about.body_ar || "أستاذ المسالك البولية وطب الذكورة بمستشفى جامعة طنطا، ورئيس وحدة طب الذكورة. بخبرة أكاديمية وسريرية تمتد لأكثر من 25 عامًا، يُعدّ الأستاذ الدكتور ماجد رجب مرجعًا دوليًا في مجال تأخر الإنجاب والجراحة المجهرية والمسالك البولية قليلة التدخل وصحة الرجال. يجمع بين التميز الجراحي ومسيرة أكاديمية نشطة في البحث العلمي والتدريس والتعليم العالي."}</span>
              </p>
              <div className="stats-row">
                {[
                  ["25+",     "Years Experience",          "سنة خبرة"],
                  ["10,000+", "Surgeries Performed",       "عملية جراحية"],
                  ["300+",    "International Conferences", "مؤتمر دولي"],
                ].map(([num, enLabel, arLabel]) => (
                  <div key={num}>
                    <strong>{num}</strong>
                    <span><span className="en">{enLabel}</span><span className="ar">{arLabel}</span></span>
                  </div>
                ))}
              </div>
              <div className="hero-actions" style={{marginTop:"28px"}}>
                <Link className="button primary" href="/booking"><span className="en">Book Appointment</span><span className="ar">احجز موعد</span></Link>
                <Link className="button ghost" href="/contact"><span className="en">Contact Us</span><span className="ar">تواصل معنا</span></Link>
              </div>
            </div>
          </div>
        </section>

        {/* ACADEMIC POSITIONS */}
        <section className="section" style={{background:"var(--soft)",paddingTop:"72px",paddingBottom:"72px"}}>
          <div className="section-kicker"><span className="en">Academic & Professional Positions</span><span className="ar">المناصب الأكاديمية والمهنية</span></div>
          <div className="two-card-grid" style={{marginBottom:0}}>
            <div className="feature-card">
              <h3><span className="en">Academic Roles</span><span className="ar">الأدوار الأكاديمية</span></h3>
              <ul>
                <li><span className="en">Professor of Urology & Andrology, Tanta University Hospital</span><span className="ar">أستاذ المسالك البولية وطب الذكورة، مستشفى جامعة طنطا</span></li>
                <li><span className="en">Head of the Andrology Unit, Tanta University Hospital</span><span className="ar">رئيس وحدة طب الذكورة، مستشفى جامعة طنطا</span></li>
                <li><span className="en">Teaching urology to medical students since 1998</span><span className="ar">تدريس المسالك البولية لطلاب الطب منذ عام 1998</span></li>
                <li><span className="en">Supervises MSc and PhD theses in urology and andrology</span><span className="ar">إشراف على رسائل الماجستير والدكتوراه في المسالك البولية وطب الذكورة</span></li>
              </ul>
            </div>
            <div className="feature-card">
              <h3><span className="en">Professional Roles</span><span className="ar">الأدوار المهنية</span></h3>
              <ul>
                <li><span className="en">Secretary of the Erectile Dysfunction section, Egyptian Urological Association</span><span className="ar">أمين سر قسم ضعف الانتصاب، جمعية المسالك البولية المصرية</span></li>
                <li><span className="en">Active contributor to Egyptian male infertility and urological guideline committees</span><span className="ar">مساهم فعال في لجان الإرشادات المصرية لتأخر الإنجاب والمسالك البولية</span></li>
                <li><span className="en">Organizes live surgery workshops and teaching courses in Egypt</span><span className="ar">ينظم ورش عمل الجراحة المباشرة والدورات التعليمية في مصر</span></li>
              </ul>
            </div>
          </div>
        </section>

        {/* INTERNATIONAL TRAINING */}
        <section className="section">
          <div className="section-kicker"><span className="en">International Training & Fellowships</span><span className="ar">التدريب والزمالات الدولية</span></div>
          <div className="two-card-grid" style={{marginBottom:0}}>
            <div className="feature-card">
              <h3><span className="en">Research Fellowship</span><span className="ar">زمالة البحث العلمي</span></h3>
              <ul>
                <li><span className="en">Endourology & Laparoscopy Fellowship — Washington University, USA</span><span className="ar">زمالة التنظير البولي والمنظار — جامعة واشنطن، الولايات المتحدة</span></li>
                <li><span className="en">Trained under Prof. Ralph Clayman and Prof. Chandru Sundaram</span><span className="ar">تدرّب تحت إشراف الأستاذ رالف كلايمان والأستاذ شاندرو سوندارام</span></li>
                <li><span className="en">Presented at international conferences in USA, Spain, UAE, and Egypt</span><span className="ar">قدّم أبحاثًا في مؤتمرات دولية في الولايات المتحدة وإسبانيا والإمارات ومصر</span></li>
              </ul>
            </div>
            <div className="feature-card">
              <h3><span className="en">International Memberships</span><span className="ar">العضويات الدولية</span></h3>
              <ul>
                <li><span className="en">American Urological Association (AUA)</span><span className="ar">جمعية المسالك البولية الأمريكية (AUA)</span></li>
                <li><span className="en">European Association of Urology (EAU)</span><span className="ar">الجمعية الأوروبية للمسالك البولية (EAU)</span></li>
                <li><span className="en">ISSM, ESSM, MESSM — Sexual Medicine Societies</span><span className="ar">ISSM وESSM وMESSM — جمعيات الطب الجنسي</span></li>
                <li><span className="en">Global Andrology Forum</span><span className="ar">المنتدى العالمي لطب الذكورة</span></li>
              </ul>
            </div>
          </div>
        </section>

        {/* RESEARCH */}
        <section className="section" style={{background:"var(--soft)"}}>
          <div className="section-kicker"><span className="en">Research & Publications</span><span className="ar">البحث العلمي والمنشورات</span></div>
          <div className="split">
            <div>
              <h2 style={{fontSize:"clamp(28px,3vw,44px)"}}>
                <span className="en">Published in Leading International Journals</span>
                <span className="ar">منشور في أبرز المجلات الطبية الدولية</span>
              </h2>
            </div>
            <div className="section-copy">
              <p>
                <span className="en">Dr. Ragab has published numerous peer-reviewed studies covering male infertility, azoospermia, varicocele, urethral reconstruction, endourology, and laparoscopic surgery.</span>
                <span className="ar">نشر الدكتور رجب عددًا كبيرًا من الدراسات المحكّمة في مجالات تأخر الإنجاب وانعدام الحيوانات المنوية ودوالي الخصية وإعادة بناء الإحليل والتنظير البولي والجراحة بالمنظار.</span>
              </p>
              <ul style={{paddingLeft:"18px",color:"var(--muted)",lineHeight:"1.8",display:"grid",gap:"6px"}}>
                {["Journal of Urology","Urology","BJU International","Journal of Endourology","World Journal of Men's Health"].map(j=>(
                  <li key={j}>{j}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* EXPERTISE */}
        <section className="section why-section">
          <div className="section-kicker"><span className="en">Areas of Expertise</span><span className="ar">مجالات الخبرة</span></div>
          <div className="why-list six">
            {[
              ["Male Infertility & Andrology","تأخر الإنجاب وطب الذكورة"],
              ["Microsurgery & Micro-TESE","الجراحة المجهرية وMicro-TESE"],
              ["Endourology & Stone Surgery","التنظير البولي وجراحة الحصوات"],
              ["Erectile Dysfunction","ضعف الانتصاب"],
              ["Laparoscopic Urology","المسالك البولية بالمنظار"],
              ["Urethral Reconstruction","إعادة بناء الإحليل"],
            ].map(([en, ar], i) => (
              <div key={en}>
                <span>0{i+1}</span>
                <strong><span className="en">{en}</span><span className="ar">{ar}</span></strong>
              </div>
            ))}
          </div>
        </section>

        <section className="section final-cta">
          <h2><span className="en">Book a Consultation with Dr. Maged</span><span className="ar">احجز استشارة مع د. ماجد</span></h2>
          <div className="hero-actions">
            <Link className="button primary" href="/booking"><span className="en">Book Appointment</span><span className="ar">احجز موعد</span></Link>
            <Link className="button ghost" href="/international"><span className="en">International Consultation</span><span className="ar">استشارة دولية</span></Link>
            <Link className="button quiet" href="/contact"><span className="en">Contact Us</span><span className="ar">تواصل معنا</span></Link>
          </div>
        </section>
      </main>
    </>
  );
}
