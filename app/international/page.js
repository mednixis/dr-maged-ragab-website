import Header from "../../components/Header.js";
import Link from "next/link";
export const metadata = { title: "International Patients | Dr. Maged Ragab" };
export default function InternationalPage() {
  return (
    <>
      <Header isPage />
      <div className="page-hero">
        <p className="eyebrow"><span className="en">International Patients</span><span className="ar">المرضى الدوليون</span></p>
        <h1><span className="en">Care Without Borders</span><span className="ar">رعاية بلا حدود</span></h1>
        <p><span className="en">Online consultation paths for patients outside Egypt.</span><span className="ar">مسارات استشارة أونلاين للمرضى خارج مصر.</span></p>
      </div>
      <main>
        <section className="section">
          <div className="two-card-grid">
            <article className="feature-card">
              <h3><span className="en">How It Works</span><span className="ar">كيف يعمل</span></h3>
              <ul>
                <li><span className="en">Book a dedicated Zoom consultation slot</span><span className="ar">احجز موعد Zoom مخصص</span></li>
                <li><span className="en">Upload your reports and test results</span><span className="ar">ارفع تقاريرك ونتائج الفحوصات</span></li>
                <li><span className="en">50% deposit required to secure the slot</span><span className="ar">مطلوب إيداع 50% لتأكيد الموعد</span></li>
                <li><span className="en">Human review before final confirmation</span><span className="ar">مراجعة بشرية قبل التأكيد النهائي</span></li>
                <li><span className="en">WhatsApp or email confirmation</span><span className="ar">تأكيد عبر واتساب أو البريد</span></li>
              </ul>
            </article>
            <article className="feature-card">
              <h3><span className="en">What to Prepare</span><span className="ar">ماذا تُحضّر</span></h3>
              <ul>
                <li><span className="en">Semen analysis reports (if applicable)</span><span className="ar">تقارير تحليل السائل المنوي (إن وجدت)</span></li>
                <li><span className="en">Hormone test results</span><span className="ar">نتائج اختبارات الهرمونات</span></li>
                <li><span className="en">Previous treatment history</span><span className="ar">تاريخ العلاجات السابقة</span></li>
                <li><span className="en">Imaging or ultrasound reports</span><span className="ar">تقارير الأشعة أو الموجات فوق الصوتية</span></li>
                <li><span className="en">List of current medications</span><span className="ar">قائمة الأدوية الحالية</span></li>
              </ul>
            </article>
          </div>
        </section>
        <section className="section final-cta">
          <h2><span className="en">Start Your International Consultation</span><span className="ar">ابدأ استشارتك الدولية</span></h2>
          <div className="hero-actions">
            <Link className="button primary" href="/booking"><span className="en">Book Online Consultation</span><span className="ar">احجز استشارة أونلاين</span></Link>
            <Link className="button ghost" href="/contact"><span className="en">Contact Us</span><span className="ar">تواصل معنا</span></Link>
          </div>
        </section>
      </main>
    </>
  );
}
