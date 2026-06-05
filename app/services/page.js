import Link from "next/link";
import Header from "../../components/Header.js";
import { createClient } from "@supabase/supabase-js";

export const metadata = { title: "Services | Dr. Maged Ragab" };

async function getServices() {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  const { data } = await supabase.from("services").select("*").eq("active", true).order("sort_order");
  return data || [];
}

const defaultServices = [
  { id:"1", name_en:"Male Infertility", name_ar:"تأخر الإنجاب عند الرجال", description_en:"Comprehensive evaluation and treatment of male infertility causes.", description_ar:"تقييم شامل وعلاج أسباب تأخر الإنجاب عند الرجال.", icon:"🔬" },
  { id:"2", name_en:"Azoospermia", name_ar:"انعدام الحيوانات المنوية", description_en:"Diagnosis and surgical management of azoospermia including Micro-TESE.", description_ar:"تشخيص وإدارة جراحية لانعدام الحيوانات المنوية بما في ذلك Micro-TESE.", icon:"🧬" },
  { id:"3", name_en:"Erectile Dysfunction", name_ar:"ضعف الانتصاب", description_en:"Advanced treatment options for erectile dysfunction including penile prosthesis.", description_ar:"خيارات علاج متقدمة لضعف الانتصاب بما في ذلك الدعامات.", icon:"💊" },
  { id:"4", name_en:"Prostate Diseases", name_ar:"أمراض البروستاتا", description_en:"Medical and surgical management of BPH and prostate conditions including Rezum.", description_ar:"الإدارة الطبية والجراحية لتضخم البروستاتا والحالات الأخرى بما في ذلك Rezum.", icon:"🏥" },
  { id:"5", name_en:"Kidney Stones", name_ar:"حصوات الكلى", description_en:"Minimally invasive stone management using modern endoscopic techniques.", description_ar:"إدارة الحصوات بأقل تدخل جراحي باستخدام تقنيات التنظير الحديثة.", icon:"⚕️" },
  { id:"6", name_en:"Men's Health", name_ar:"صحة الرجال", description_en:"Comprehensive men's health care with a confidential, respectful approach.", description_ar:"رعاية شاملة لصحة الرجال بنهج سري ومحترم.", icon:"👨‍⚕️" },
];

export default async function ServicesPage() {
  const dbServices = await getServices();
  const services = dbServices.length > 0 ? dbServices : defaultServices;

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
          <div className="service-grid">
            {services.map(svc => (
              <div key={svc.id} className="service-card">
                {svc.icon && <div className="service-icon">{svc.icon}</div>}
                <h3><span className="en">{svc.name_en}</span><span className="ar">{svc.name_ar}</span></h3>
                <p><span className="en">{svc.description_en}</span><span className="ar">{svc.description_ar}</span></p>
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
