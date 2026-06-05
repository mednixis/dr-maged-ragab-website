import Link from "next/link";
import Header from "../../components/Header.js";
import { createClient } from "@supabase/supabase-js";

export const metadata = { title: "Services | Dr. Maged Ragab" };

async function getServices() {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  const { data } = await supabase.from("services").select("*").eq("active", true).order("sort_order");
  return data || [];
}

const CATEGORIES = [
  { sort: 10, label_en: "Male Infertility & Andrology", label_ar: "تأخر الإنجاب وطب الذكورة", range: [10,19] },
  { sort: 20, label_en: "Endourology & Kidney Stones",  label_ar: "التنظير البولي وحصوات الكلى", range: [20,29] },
  { sort: 30, label_en: "Prostate & BPH",               label_ar: "البروستاتا وتضخمها", range: [30,39] },
  { sort: 40, label_en: "Urethral Reconstruction",       label_ar: "إعادة بناء الإحليل", range: [40,49] },
  { sort: 50, label_en: "Laparoscopic / Minimally Invasive Urology", label_ar: "جراحة المسالك بالمنظار", range: [50,59] },
  { sort: 60, label_en: "Bladder & Urinary Problems",    label_ar: "مشاكل المثانة والمسالك", range: [60,69] },
  { sort: 70, label_en: "Pediatric & Congenital Urology",label_ar: "المسالك البولية للأطفال", range: [70,79] },
  { sort: 80, label_en: "Kidney & Upper Tract Surgery",  label_ar: "جراحة الكلى والمسالك العلوية", range: [80,89] },
];

const PROCEDURES = {
  10: ["Micro-TESE / sperm retrieval techniques","Microsurgical subinguinal varicocelectomy","Varicocele treatment","Male infertility evaluation and treatment","Non-obstructive azoospermia management","Erectile dysfunction management","Penile prosthesis implantation","Peyronie's disease treatment","Premature ejaculation treatment","Regenerative therapy for ED"],
  20: ["Ureteroscopy","Flexible ureteroscopy","Retrograde intrarenal surgery","PCNL / percutaneous nephrolithotomy","Mini-percutaneous antegrade ureteroscopic lithotripsy","ESWL / shock wave lithotripsy","Laparoscopic ureterolithotomy","Medical expulsive therapy for ureteric stones"],
  30: ["TURP / transurethral resection of prostate","TUNA / transurethral needle ablation of prostate","Rezum water vapor therapy","Echolaser technology","Prostate cancer early detection: PSA density, transition zone biopsy","Laparoscopic radical prostatectomy"],
  40: ["Urethroplasty","Lingual mucosal graft urethroplasty","Buccal mucosal graft urethroplasty","Female urethral reconstruction"],
  50: ["Laparoscopic cyst decortication","Laparoscopic partial nephrectomy","Laparoscopic nephrectomy","Laparoscopic radical prostatectomy","Laparoscopic ureteroureterostomy","Laparoscopic renal cryoablation"],
  60: ["Urodynamics","Posterior / percutaneous tibial nerve stimulation","Treatment of overactive bladder / detrusor overactivity","Painful bladder syndrome / interstitial cystitis","Nocturnal enuresis management","Female stress urinary incontinence surgery / sling procedures"],
  70: ["Hypospadias repair complications","Distal and mid-penile hypospadias repair","Vesicoureteric reflux treatment","Pediatric incontinence"],
  80: ["Endopyelotomy for UPJ obstruction","Ureteric reimplantation","Renal stone surgery","Large/staghorn kidney stone management"],
};

export default async function ServicesPage() {
  const services = await getServices();

  return (
    <>
      <Header isPage />
      <div className="page-hero">
        <p className="eyebrow"><span className="en">Services</span><span className="ar">الخدمات</span></p>
        <h1><span className="en">Advanced Urology & Men's Health Services</span><span className="ar">خدمات المسالك البولية وصحة الرجال المتقدمة</span></h1>
        <p><span className="en">Comprehensive care led by academic expertise and surgical precision.</span><span className="ar">رعاية شاملة بقيادة الخبرة الأكاديمية والدقة الجراحية.</span></p>
      </div>
      <main>
        {CATEGORIES.map(cat => {
          const catServices = services.filter(s => s.sort_order >= cat.range[0] && s.sort_order <= cat.range[1]);
          const mainService = catServices[0];
          const procs = PROCEDURES[cat.range[0]] || [];
          if (!mainService) return null;
          return (
            <section key={cat.sort} className="section" style={{borderBottom:"1px solid var(--line)",paddingBottom:"64px"}}>
              <div className="section-kicker">
                <span className="en">{mainService.icon} {cat.label_en}</span>
                <span className="ar">{mainService.icon} {cat.label_ar}</span>
              </div>
              <div className="split" style={{gap:"clamp(24px,4vw,60px)"}}>
                <div>
                  <h2 style={{fontSize:"clamp(24px,3vw,38px)"}}>
                    <span className="en">{mainService.name_en}</span>
                    <span className="ar">{mainService.name_ar}</span>
                  </h2>
                  <p style={{color:"var(--muted)",lineHeight:"1.7",marginTop:"16px",fontSize:"17px"}}>
                    <span className="en">{mainService.description_en}</span>
                    <span className="ar">{mainService.description_ar}</span>
                  </p>
                </div>
                <div>
                  <p style={{fontSize:"12px",fontWeight:"800",textTransform:"uppercase",letterSpacing:"0.5px",color:"var(--gold)",marginBottom:"14px"}}>
                    <span className="en">Procedures & Treatments</span>
                    <span className="ar">الإجراءات والعلاجات</span>
                  </p>
                  <ul style={{margin:0,padding:"0 0 0 18px",display:"grid",gap:"8px",color:"var(--muted)",lineHeight:"1.6"}}>
                    {procs.map(p => <li key={p}>{p}</li>)}
                  </ul>
                </div>
              </div>
            </section>
          );
        })}

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
