import Header from "../../components/Header.js";
import Link from "next/link";
export const metadata = { title: "Procedures | Dr. Maged Ragab" };
const procs = [
  ["Micro-TESE","Micro-TESE","Microscopic testicular sperm extraction for azoospermia.","استخراج الحيوانات المنوية المجهري من الخصية لحالات انعدامها."],
  ["Penile Prosthesis Implantation","زرع دعامات العضو الذكري","Surgical implantation for erectile dysfunction unresponsive to medication.","زرع جراحي لحالات ضعف الانتصاب التي لا تستجيب للأدوية."],
  ["Varicocele Repair","علاج دوالي الخصية","Microsurgical or laparoscopic varicocele ligation.","ربط دوالي الخصية المجهري أو بالمنظار."],
  ["Rezum Technology","تقنية Rezum","Water vapor therapy for BPH — minimally invasive.","علاج بخار الماء لتضخم البروستاتا — أقل تدخلًا."],
  ["Echolaser Technology","تقنية Echolaser","Laser-guided treatment for prostate conditions.","علاج بتوجيه الليزر لحالات البروستاتا."],
  ["Endoscopic Urology","مناظير المسالك البولية","Camera-guided procedures for kidney stones and strictures.","إجراءات بالكاميرا لحصوات الكلى والتضيقات."],
  ["TRUS Biopsy","خزعة البروستاتا","Ultrasound-guided prostate biopsy for diagnosis.","خزعة البروستاتا بتوجيه الموجات فوق الصوتية للتشخيص."],
  ["Circumcision","الختان","Performed for medical or personal reasons.","يُجرى لأسباب طبية أو شخصية."],
];
export default function ProceduresPage() {
  return (
    <>
      <Header isPage />
      <div className="page-hero">
        <p className="eyebrow"><span className="en">Procedures</span><span className="ar">الإجراءات</span></p>
        <h1><span className="en">Surgical & Medical Procedures</span><span className="ar">الإجراءات الجراحية والطبية</span></h1>
      </div>
      <main>
        <section className="section">
          <div className="condition-grid">
            {procs.map(([en,ar,descEn,descAr]) => (
              <div key={en} className="condition-card">
                <h3><span className="en">{en}</span><span className="ar">{ar}</span></h3>
                <p><span className="en">{descEn}</span><span className="ar">{descAr}</span></p>
              </div>
            ))}
          </div>
        </section>
        <section className="section final-cta">
          <h2><span className="en">Book a Consultation</span><span className="ar">احجز استشارة</span></h2>
          <div className="hero-actions">
            <Link className="button primary" href="/booking"><span className="en">Book Appointment</span><span className="ar">احجز موعد</span></Link>
          </div>
        </section>
      </main>
    </>
  );
}
