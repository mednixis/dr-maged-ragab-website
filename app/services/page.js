export const revalidate = 0;
import Link from "next/link";
import Header from "../../components/Header.js";
import Footer from "../../components/Footer.js";
import { createClient } from "@supabase/supabase-js";

export const metadata = { title: "Services | Dr. Maged Ragab" };

async function getServices() {
  try {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
    const { data } = await supabase.from("services").select("*").eq("active", true).order("sort_order");
    return data || [];
  } catch { return []; }
}

const CATEGORIES = [
  {
    title_en: "Male Infertility & Reproductive Health",
    title_ar: "العقم عند الرجال وصحة الإنجاب",
    icon: "🔬",
    procedures_en: ["Male Infertility Evaluation","Azoospermia (Micro-TESE)","Varicocele Surgery","Semen Analysis & Treatment","Hormonal Assessment & Therapy"],
    procedures_ar: ["تقييم العقم عند الرجال","انعدام الحيوانات المنوية (Micro-TESE)","جراحة الدوالي","تحليل السائل المنوي والعلاج","التقييم الهرموني والعلاج"],
  },
  {
    title_en: "Erectile Dysfunction & Sexual Medicine",
    title_ar: "ضعف الانتصاب والطب الجنسي",
    icon: "💊",
    procedures_en: ["Erectile Dysfunction Treatment","Penile Prosthesis Implantation","Peyronie's Disease Management","Premature Ejaculation Treatment","Sexual Health Counselling"],
    procedures_ar: ["علاج ضعف الانتصاب","زراعة دعامات القضيب","علاج مرض بيروني","علاج سرعة القذف","استشارات الصحة الجنسية"],
  },
  {
    title_en: "Prostate Diseases",
    title_ar: "أمراض البروستاتا",
    icon: "🏥",
    procedures_en: ["Benign Prostatic Hyperplasia (BPH)","Rezum Steam Therapy","Echolaser Prostate Treatment","Prostatitis Management","PSA Screening & Diagnosis"],
    procedures_ar: ["تضخم البروستاتا الحميد","علاج الريزوم بالبخار","علاج البروستاتا بالإيكو ليزر","علاج التهاب البروستاتا","فحص PSA والتشخيص"],
  },
  {
    title_en: "Kidney & Urinary Stones",
    title_ar: "حصوات الكلى والمسالك البولية",
    icon: "⚕️",
    procedures_en: ["Kidney Stone Management","Ureteroscopy (URS)","PCNL (Percutaneous Surgery)","ESWL (Shock Wave Lithotripsy)","Ureteral Stenting"],
    procedures_ar: ["علاج حصوات الكلى","تنظير الحالب","جراحة عبر الجلد (PCNL)","تفتيت الحصوات بالموجات الصوتية","تركيب دعامة الحالب"],
  },
  {
    title_en: "Bladder Diseases",
    title_ar: "أمراض المثانة",
    icon: "💧",
    procedures_en: ["Overactive Bladder","Urinary Incontinence","Bladder Cancer Screening","Cystoscopy","Interstitial Cystitis"],
    procedures_ar: ["المثانة النشطة","سلس البول","فحص سرطان المثانة","تنظير المثانة","التهاب المثانة الخلالي"],
  },
  {
    title_en: "Urinary Tract Infections",
    title_ar: "التهابات المسالك البولية",
    icon: "🔵",
    procedures_en: ["UTI Diagnosis & Treatment","Recurrent UTI Management","Kidney Infection (Pyelonephritis)","Prostate Infection Treatment","Sexually Transmitted Infections"],
    procedures_ar: ["تشخيص وعلاج التهابات المسالك","إدارة التهابات المسالك المتكررة","التهاب الكلى (التهاب الحويضة)","علاج التهاب البروستاتا","الأمراض المنقولة جنسياً"],
  },
  {
    title_en: "Scrotal & Testicular Conditions",
    title_ar: "أمراض الصفن والخصية",
    icon: "🩺",
    procedures_en: ["Varicocele Repair","Hydrocele Surgery","Epididymal Cyst Removal","Testicular Torsion","Orchitis Management"],
    procedures_ar: ["علاج دوالي الخصية","جراحة القيلة المائية","إزالة كيس البربخ","التواء الخصية","إدارة التهاب الخصية"],
  },
  {
    title_en: "Advanced & Minimally Invasive Surgery",
    title_ar: "الجراحة المتقدمة والأقل توغلاً",
    icon: "🔆",
    procedures_en: ["Laparoscopic Urology","Endoscopic Surgery","Circumcision (Adults & Children)","Urethral Stricture Treatment","Penile Surgery"],
    procedures_ar: ["جراحة المسالك بالمنظار","الجراحة التنظيرية","الختان (بالغين وأطفال)","علاج تضيق الإحليل","جراحة القضيب"],
  },
];

export default async function ServicesPage() {
  const dbServices = await getServices();

  return (
    <>
      <Header isPage />
      <div className="page-hero">
        <p className="eyebrow"><span className="en">Services</span><span className="ar">الخدمات</span></p>
        <h1><span className="en">Advanced Urology & Men's Health Services</span><span className="ar">خدمات المسالك البولية وصحة الرجال المتقدمة</span></h1>
        <p><span className="en">Comprehensive care led by academic expertise and surgical precision.</span><span className="ar">رعاية شاملة بقيادة الخبرة الأكاديمية والدقة الجراحية.</span></p>
      </div>

      <main>
        {/* Dynamic services from Supabase if available, else show full categories */}
        {dbServices.length > 0 ? (
          <section className="section">
            <div className="service-grid">
              {dbServices.map(svc => (
                <div key={svc.id} className="service-card">
                  {svc.icon && <div className="service-icon">{svc.icon}</div>}
                  <h3><span className="en">{svc.name_en}</span><span className="ar">{svc.name_ar}</span></h3>
                  <p><span className="en">{svc.description_en}</span><span className="ar">{svc.description_ar}</span></p>
                </div>
              ))}
            </div>
          </section>
        ) : (
          <section className="section">
            <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(340px, 1fr))", gap:"28px", maxWidth:"1200px", margin:"0 auto"}}>
              {CATEGORIES.map((cat, i) => (
                <div key={i} style={{background:"#fff", border:"1px solid #e8eaec", borderRadius:"16px", padding:"28px", boxShadow:"0 2px 12px rgba(7,21,37,0.06)"}}>
                  <div style={{display:"flex", alignItems:"center", gap:"12px", marginBottom:"16px"}}>
                    <span style={{fontSize:"28px"}}>{cat.icon}</span>
                    <h3 style={{margin:0, fontSize:"16px", color:"var(--navy)", fontWeight:"700"}}>
                      <span className="en">{cat.title_en}</span>
                      <span className="ar">{cat.title_ar}</span>
                    </h3>
                  </div>
                  <ul style={{listStyle:"none", padding:0, margin:0}}>
                    {cat.procedures_en.map((proc, j) => (
                      <li key={j} style={{display:"flex", alignItems:"center", gap:"8px", padding:"6px 0", borderBottom: j < cat.procedures_en.length-1 ? "1px solid #f0f2f4" : "none"}}>
                        <span style={{color:"var(--gold)", fontSize:"12px", fontWeight:"700"}}>◆</span>
                        <span style={{fontSize:"14px", color:"var(--ink)"}}>
                          <span className="en">{proc}</span>
                          <span className="ar">{cat.procedures_ar[j]}</span>
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="section final-cta">
          <h2><span className="en">Book a Consultation</span><span className="ar">احجز استشارة</span></h2>
          <div className="hero-actions">
            <Link className="button primary" href="/booking"><span className="en">Book Appointment</span><span className="ar">احجز موعد</span></Link>
            <Link className="button ghost" href="/international"><span className="en">International Consultation</span><span className="ar">استشارة دولية</span></Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
