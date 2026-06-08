export const revalidate = 0;
import Link from "next/link";
import Header from "../../components/Header.js";


export const metadata = { title: "Services | Dr. Maged Ragab" };

const SERVICES = [
  {
    title_en: "Male Infertility & Reproductive Health",
    title_ar: "العقم عند الرجال وصحة الإنجاب",
    icon: "🔬",
    procedures: [
      ["Male Infertility Evaluation & Treatment", "تقييم وعلاج العقم عند الرجال"],
      ["Azoospermia — Micro-TESE (Microsurgical Sperm Retrieval)", "انعدام الحيوانات المنوية — Micro-TESE"],
      ["Varicocele Surgery (Open & Microsurgical)", "جراحة الدوالي (مفتوحة ودقيقة)"],
      ["Semen Analysis & Advanced Sperm Testing", "تحليل السائل المنوي والفحوصات المتقدمة"],
      ["Hormonal Assessment & Therapy", "التقييم الهرموني والعلاج"],
      ["Oncofertility & Sperm Banking", "الخصوبة الورمية وبنك الحيوانات المنوية"],
    ],
  },
  {
    title_en: "Erectile Dysfunction & Sexual Medicine",
    title_ar: "ضعف الانتصاب والطب الجنسي",
    icon: "💊",
    procedures: [
      ["Erectile Dysfunction — Diagnosis & Treatment", "تشخيص وعلاج ضعف الانتصاب"],
      ["Penile Prosthesis Implantation", "زراعة دعامات القضيب"],
      ["Peyronie's Disease Management", "علاج مرض بيروني (انحناء القضيب)"],
      ["Premature Ejaculation Treatment", "علاج سرعة القذف"],
      ["Testosterone Replacement Therapy (TRT)", "علاج الاستبدال بالتستوستيرون (TRT)"],
      ["Sexual Health Counselling", "استشارات الصحة الجنسية"],
    ],
  },
  {
    title_en: "Prostate Diseases",
    title_ar: "أمراض البروستاتا",
    icon: "🏥",
    procedures: [
      ["Benign Prostatic Hyperplasia (BPH)", "تضخم البروستاتا الحميد"],
      ["Rezum Steam Therapy for BPH", "علاج الريزوم بالبخار لتضخم البروستاتا"],
      ["Echolaser Prostate Treatment", "علاج البروستاتا بالإيكو ليزر"],
      ["Prostatitis (Acute & Chronic)", "التهاب البروستاتا الحاد والمزمن"],
      ["PSA Screening & Prostate Cancer Diagnosis", "فحص PSA وتشخيص سرطان البروستاتا"],
      ["TURP & Minimally Invasive Prostate Surgery", "استئصال البروستاتا بالمنظار والجراحة الأقل توغلاً"],
    ],
  },
  {
    title_en: "Kidney & Urinary Tract Stones",
    title_ar: "حصوات الكلى والمسالك البولية",
    icon: "⚕️",
    procedures: [
      ["Kidney Stone Diagnosis & Management", "تشخيص وعلاج حصوات الكلى"],
      ["Flexible Ureteroscopy (RIRS)", "تنظير الحالب المرن"],
      ["PCNL (Percutaneous Nephrolithotomy)", "استخراج الحصوات عبر الجلد (PCNL)"],
      ["ESWL (Shock Wave Lithotripsy)", "تفتيت الحصوات بالموجات الصوتية"],
      ["Ureteral Stenting (Double J)", "تركيب دعامة الحالب (Double J)"],
      ["Stone Prevention & Metabolic Workup", "الوقاية من الحصوات والتقييم الأيضي"],
    ],
  },
  {
    title_en: "Bladder Diseases",
    title_ar: "أمراض المثانة",
    icon: "💧",
    procedures: [
      ["Overactive Bladder (OAB)", "المثانة فرطة النشاط"],
      ["Urinary Incontinence", "سلس البول"],
      ["Bladder Cancer — Screening & TURBT", "سرطان المثانة — الفحص والاستئصال بالمنظار"],
      ["Cystoscopy & Bladder Biopsy", "تنظير المثانة والخزعة"],
      ["Interstitial Cystitis", "التهاب المثانة الخلالي"],
      ["Neurogenic Bladder", "المثانة العصبية"],
    ],
  },
  {
    title_en: "Urinary Tract Infections",
    title_ar: "التهابات المسالك البولية",
    icon: "🔵",
    procedures: [
      ["UTI Diagnosis & Treatment", "تشخيص وعلاج التهابات المسالك البولية"],
      ["Recurrent UTI Management", "إدارة التهابات المسالك المتكررة"],
      ["Kidney Infection (Pyelonephritis)", "التهاب الكلى (التهاب الحويضة والكلية)"],
      ["Epididymo-orchitis", "التهاب البربخ والخصية"],
      ["Sexually Transmitted Infections (STIs)", "الأمراض المنقولة جنسياً"],
    ],
  },
  {
    title_en: "Scrotal & Testicular Conditions",
    title_ar: "أمراض الصفن والخصية",
    icon: "🩺",
    procedures: [
      ["Varicocele Repair", "إصلاح دوالي الخصية"],
      ["Hydrocele Surgery", "جراحة القيلة المائية"],
      ["Epididymal Cyst Removal", "إزالة كيس البربخ"],
      ["Testicular Torsion", "التواء الخصية"],
      ["Undescended Testis (Orchidopexy)", "الخصية المعلقة (نزول الخصية)"],
      ["Testicular Cancer Screening", "فحص سرطان الخصية"],
    ],
  },
  {
    title_en: "Endourology & Minimally Invasive Surgery",
    title_ar: "الجراحة التنظيرية والأقل توغلاً",
    icon: "🔆",
    procedures: [
      ["Laparoscopic Urology", "جراحة المسالك البولية بالمنظار"],
      ["Urethral Stricture & Urethroplasty", "تضيق الإحليل وإعادة بنائه"],
      ["Circumcision (Adults & Children)", "الختان (بالغين وأطفال)"],
      ["Flexible Cystoscopy", "تنظير المثانة المرن"],
      ["Retrograde Intrarenal Surgery (RIRS)", "جراحة الكلى التراجعية داخل الكلية"],
      ["Penile Surgery", "جراحة القضيب"],
    ],
  },
];

export default function ServicesPage() {
  return (
    <>
      <Header isPage />
      <div className="page-hero">
        <p className="eyebrow"><span className="en">Services</span><span className="ar">الخدمات</span></p>
        <h1><span className="en">Advanced Urology & Men's Health Services</span><span className="ar">خدمات المسالك البولية وصحة الرجال المتقدمة</span></h1>
        <p><span className="en">Comprehensive care led by academic expertise and surgical precision.</span><span className="ar">رعاية شاملة بقيادة الخبرة الأكاديمية والدقة الجراحية.</span></p>
      </div>

      <main>
        <section className="section">
          <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(320px, 1fr))", gap:"24px", maxWidth:"1200px", margin:"0 auto"}}>
            {SERVICES.map((svc, i) => (
              <div key={i} style={{background:"#fff", border:"1px solid #e8eaec", borderRadius:"16px", padding:"28px", boxShadow:"0 2px 12px rgba(7,21,37,0.06)", display:"flex", flexDirection:"column"}}>
                {/* Header */}
                <div style={{display:"flex", alignItems:"center", gap:"12px", marginBottom:"20px", paddingBottom:"16px", borderBottom:"2px solid #f0f2f4"}}>
                  <span style={{fontSize:"32px", lineHeight:1}}>{svc.icon}</span>
                  <h3 style={{margin:0, fontSize:"15px", color:"var(--navy)", fontWeight:"700", lineHeight:"1.4"}}>
                    <span className="en">{svc.title_en}</span>
                    <span className="ar">{svc.title_ar}</span>
                  </h3>
                </div>
                {/* Procedures list */}
                <ul style={{listStyle:"none", padding:0, margin:0, flex:1}}>
                  {svc.procedures.map(([en, ar], j) => (
                    <li key={j} style={{display:"flex", alignItems:"flex-start", gap:"10px", padding:"7px 0", borderBottom: j < svc.procedures.length - 1 ? "1px solid #f6f8fa" : "none"}}>
                      <span style={{color:"var(--gold)", fontSize:"10px", fontWeight:"700", marginTop:"5px", flexShrink:0}}>◆</span>
                      <span style={{fontSize:"14px", color:"var(--ink)", lineHeight:"1.5"}}>
                        <span className="en">{en}</span>
                        <span className="ar">{ar}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <section className="section final-cta">
          <h2><span className="en">Book a Consultation</span><span className="ar">احجز استشارة</span></h2>
          <div className="hero-actions">
            <Link className="button primary" href="/booking"><span className="en">Book Appointment</span><span className="ar">احجز موعد</span></Link>
            <Link className="button ghost" href="/international"><span className="en">International Consultation</span><span className="ar">استشارة دولية</span></Link>
          </div>
        </section>
      </main>
      
    </>
  );
}
