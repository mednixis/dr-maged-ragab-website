import Link from "next/link";

export default function Footer() {
  return (
    <footer className="site-footer expanded-footer">
      <div>
        <strong><span className="en">Dr. Maged Ragab</span><span className="ar">د. ماجد رجب</span></strong>
        <p><span className="en">World-class urology and men's health care led by academic excellence.</span><span className="ar">رعاية عالمية في المسالك وصحة الرجال بقيادة أكاديمية متميزة.</span></p>
        <small><span className="en">Managed by Mednixis</span><span className="ar">تدار بواسطة Mednixis</span></small>
      </div>
      <div className="footer-links">
        <Link href="/about"><span className="en">About Dr. Maged</span><span className="ar">عن د. ماجد</span></Link>
        <Link href="/services"><span className="en">Services</span><span className="ar">الخدمات</span></Link>
        <Link href="/conditions"><span className="en">Conditions</span><span className="ar">الحالات</span></Link>
        <Link href="/procedures"><span className="en">Procedures</span><span className="ar">الإجراءات</span></Link>
        <Link href="/international"><span className="en">International Patients</span><span className="ar">المرضى الدوليون</span></Link>
        <Link href="/resources"><span className="en">Patient Resources</span><span className="ar">إرشادات المرضى</span></Link>
        <Link href="/articles"><span className="en">Articles & Insights</span><span className="ar">المقالات</span></Link>
        <Link href="/media"><span className="en">Media</span><span className="ar">الإعلام</span></Link>
      </div>
      <div className="footer-links">
        <Link href="/privacy"><span className="en">Privacy Policy</span><span className="ar">سياسة الخصوصية</span></Link>
        <Link href="/terms"><span className="en">Terms & Medical Disclaimer</span><span className="ar">الشروط والتنبيه الطبي</span></Link>
        <Link href="/contact"><span className="en">Contact & Locations</span><span className="ar">التواصل والفروع</span></Link>
        <Link href="/booking"><span className="en">Book Appointment</span><span className="ar">احجز موعد</span></Link>
      </div>
    </footer>
  );
}
