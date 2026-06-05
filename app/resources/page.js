import Header from "../../components/Header.js";
import Link from "next/link";
export const metadata = { title: "Patient Resources | Dr. Maged Ragab" };
export default function ResourcesPage() {
  return (
    <>
      <Header isPage />
      <div className="page-hero">
        <p className="eyebrow"><span className="en">Patient Resources</span><span className="ar">إرشادات المرضى</span></p>
        <h1><span className="en">Your Guide to Care</span><span className="ar">دليلك للرعاية</span></h1>
      </div>
      <main>
        <section className="section">
          <div className="two-card-grid">
            <article className="feature-card">
              <h3><span className="en">Before Your Appointment</span><span className="ar">قبل موعدك</span></h3>
              <ul>
                <li><span className="en">Bring all previous test results and reports</span><span className="ar">أحضر جميع نتائج الفحوصات والتقارير السابقة</span></li>
                <li><span className="en">List all current medications</span><span className="ar">اكتب قائمة بجميع الأدوية الحالية</span></li>
                <li><span className="en">Note your symptoms and their duration</span><span className="ar">سجّل أعراضك ومدتها</span></li>
                <li><span className="en">Arrive 15 minutes early</span><span className="ar">احضر قبل 15 دقيقة من موعدك</span></li>
              </ul>
            </article>
            <article className="feature-card">
              <h3><span className="en">After Your Appointment</span><span className="ar">بعد موعدك</span></h3>
              <ul>
                <li><span className="en">Follow the treatment plan as prescribed</span><span className="ar">اتبع خطة العلاج كما وُصفت</span></li>
                <li><span className="en">Contact the clinic for any concerns</span><span className="ar">تواصل مع العيادة لأي استفسار</span></li>
                <li><span className="en">Schedule follow-up as recommended</span><span className="ar">احجز المتابعة كما أُوصيت</span></li>
                <li><span className="en">Keep all prescription papers safe</span><span className="ar">احتفظ بجميع الوصفات الطبية</span></li>
              </ul>
            </article>
          </div>
        </section>
        <section className="section final-cta">
          <h2><span className="en">Ready to Book?</span><span className="ar">جاهز للحجز؟</span></h2>
          <div className="hero-actions">
            <Link className="button primary" href="/booking"><span className="en">Book Appointment</span><span className="ar">احجز موعد</span></Link>
          </div>
        </section>
      </main>
    </>
  );
}
