import Link from "next/link";
import Header from "../../components/Header.js";
import { createClient } from "@supabase/supabase-js";

export const metadata = { title: "About Dr. Maged Ragab | Urology Professor" };

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
        <h1><span className="en">{about.title_en || "Academic Leadership. Surgical Precision. Human Care."}</span><span className="ar">{about.title_ar || "قيادة أكاديمية. دقة جراحية. رعاية إنسانية."}</span></h1>
        <p><span className="en">Professor & Head of Urology Department, Tanta University</span><span className="ar">أستاذ ورئيس قسم المسالك البولية - جامعة طنطا</span></p>
      </div>
      <main>
        <section className="section">
          <div className="split">
            <div>
              <div className="section-kicker"><span className="en">Biography</span><span className="ar">السيرة الذاتية</span></div>
              <h2><span className="en">Professor Dr. Maged Ragab</span><span className="ar">الأستاذ الدكتور ماجد رجب</span></h2>
            </div>
            <div className="section-copy">
              <p><span className="en">{about.body_en || "Dr. Maged Ragab is a Professor and Head of Urology Department at Tanta University, with more than 25 years of experience in advanced urology, male infertility, and men's health. He is internationally recognized for his surgical expertise and academic contributions."}</span><span className="ar">{about.body_ar || "الأستاذ الدكتور ماجد رجب أستاذ ورئيس قسم المسالك البولية بجامعة طنطا، بخبرة تزيد عن 25 عامًا في المسالك المتقدمة وتأخر الإنجاب وصحة الرجال. معترف به دوليًا لخبرته الجراحية ومساهماته الأكاديمية."}</span></p>
              <div className="stats-row">
                {[["25+","en","Years Experience","ar","سنة خبرة"],["1000+","en","Surgeries Performed","ar","عملية جراحية"],["50+","en","International Conferences","ar","مؤتمر دولي"]].map(([num,,enLabel,,arLabel]) => (
                  <div key={num}>
                    <strong>{num}</strong>
                    <span><span className="en">{enLabel}</span><span className="ar">{arLabel}</span></span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
        <section className="section why-section">
          <div className="section-kicker"><span className="en">Areas of Expertise</span><span className="ar">مجالات الخبرة</span></div>
          <div className="why-list six">
            {[
              ["Urology","المسالك البولية"],["Male Infertility","تأخر الإنجاب"],["Erectile Dysfunction","ضعف الانتصاب"],
              ["Prostate Diseases","أمراض البروستاتا"],["Kidney Stones","حصوات الكلى"],["Men's Health","صحة الرجال"],
            ].map(([en, ar], i) => (
              <div key={en}>
                <span>0{i+1}</span>
                <strong><span className="en">{en}</span><span className="ar">{ar}</span></strong>
              </div>
            ))}
          </div>
        </section>
        <section className="section final-cta">
          <h2><span className="en">Book a Consultation</span><span className="ar">احجز استشارة</span></h2>
          <div className="hero-actions">
            <Link className="button primary" href="/booking"><span className="en">Book Appointment</span><span className="ar">احجز موعد</span></Link>
            <Link className="button ghost" href="/contact"><span className="en">Contact Us</span><span className="ar">تواصل معنا</span></Link>
          </div>
        </section>
      </main>
    </>
  );
}
