import Header from "../../components/Header.js";
import Link from "next/link";
export const metadata = { title: "Conditions Treated | Dr. Maged Ragab" };
const conditions = [
  ["Male Infertility","تأخر الإنجاب","Comprehensive evaluation and treatment of male infertility.","تقييم شامل وعلاج تأخر الإنجاب عند الرجال."],
  ["Azoospermia","انعدام الحيوانات المنوية","Complete absence of sperm — surgical and medical management.","الغياب التام للحيوانات المنوية — إدارة جراحية وطبية."],
  ["Varicocele","دوالي الخصية","Dilated veins in the scrotum affecting fertility and pain.","الأوردة المتوسعة في كيس الصفن تؤثر على الخصوبة والألم."],
  ["Erectile Dysfunction","ضعف الانتصاب","Inability to achieve or maintain an erection suitable for intercourse.","عدم القدرة على تحقيق أو الحفاظ على انتصاب مناسب للجماع."],
  ["Peyronie's Disease","مرض بيروني","Fibrous scar tissue causing curved, painful erections.","نسيج ندبي ليفي يسبب انحناء الانتصاب مع ألم."],
  ["BPH / Prostate Enlargement","تضخم البروستاتا","Benign prostatic hyperplasia causing urinary symptoms.","تضخم البروستاتا الحميد المسبب لأعراض بولية."],
  ["Kidney Stones","حصوات الكلى","Mineral deposits in the kidneys causing pain and obstruction.","رواسب معدنية في الكلى تسبب ألمًا وانسدادًا."],
  ["Sexual Dysfunction","الخلل الجنسي","Broad range of sexual health issues in men.","مجموعة واسعة من مشاكل الصحة الجنسية عند الرجال."],
  ["Urinary Tract Issues","مشاكل المسالك البولية","Infections, strictures, and functional problems.","التهابات وتضيقات ومشاكل وظيفية."],
];
export default function ConditionsPage() {
  return (
    <>
      <Header isPage />
      <div className="page-hero">
        <p className="eyebrow"><span className="en">Conditions</span><span className="ar">الحالات</span></p>
        <h1><span className="en">Conditions We Treat</span><span className="ar">الحالات التي نعالجها</span></h1>
      </div>
      <main>
        <section className="section">
          <div className="condition-grid">
            {conditions.map(([en,ar,descEn,descAr]) => (
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
