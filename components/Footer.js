import Link from "next/link";

export default function Footer() {
  return (
    <footer className="site-footer expanded-footer">
      <div>
        <strong><span className="en">Dr. Maged Ragab</span><span className="ar">د. ماجد رجب</span></strong>
        <p><span className="en">World-class urology and men's health care led by academic excellence.</span><span className="ar">رعاية عالمية في المسالك وصحة الرجال بقيادة أكاديمية متميزة.</span></p>
      </div>
      <div className="footer-links">
        <Link href="/about"><span className="en">About Dr. Maged</span><span className="ar">عن د. ماجد</span></Link>
        <Link href="/services"><span className="en">Services</span><span className="ar">الخدمات</span></Link>
        <Link href="/international"><span className="en">International Patients</span><span className="ar">المرضى الدوليون</span></Link>
        <Link href="/media"><span className="en">Media</span><span className="ar">الإعلام</span></Link>
        <Link href="/faqs"><span className="en">FAQs</span><span className="ar">الأسئلة الشائعة</span></Link>
      </div>
      <div className="footer-links">
        <Link href="/privacy"><span className="en">Privacy Policy</span><span className="ar">سياسة الخصوصية</span></Link>
        <Link href="/terms"><span className="en">Terms & Medical Disclaimer</span><span className="ar">الشروط والتنبيه الطبي</span></Link>
        <Link href="/contact"><span className="en">Contact & Locations</span><span className="ar">التواصل والفروع</span></Link>
        <Link href="/booking"><span className="en">Book Appointment</span><span className="ar">احجز موعد</span></Link>
      </div>

      {/* Mednixis credit bar */}
      <div style={{
        gridColumn: "1 / -1",
        borderTop: "1px solid rgba(255,255,255,0.08)",
        marginTop: "24px",
        paddingTop: "20px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "12px",
      }}>
        <p style={{ margin: 0, fontSize: "12px", color: "rgba(255,255,255,0.35)" }}>
          <span className="en">© 2026 Dr. Maged Ragab. All rights reserved.</span>
          <span className="ar">© 2026 د. ماجد رجب. جميع الحقوق محفوظة.</span>
        </p>
        <a href="https://mednixis.com" target="_blank" rel="noopener noreferrer"
          style={{ display: "flex", alignItems: "center", gap: "8px", textDecoration: "none" }}>
          <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.35)", letterSpacing: "0.5px" }}>
            <span className="en">Powered & Managed by</span>
            <span className="ar">بتقنية وإدارة</span>
          </span>
          <span style={{
            background: "linear-gradient(135deg, #b99b62, #d4b896)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            fontSize: "14px",
            fontWeight: "800",
            letterSpacing: "1px",
          }}>MEDNIXIS</span>
        </a>
      </div>
    </footer>
  );
}
