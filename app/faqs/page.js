export const revalidate = 0;
import Header from "../../components/Header.js";
import Footer from "../../components/Footer.js";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

export const metadata = { title: "FAQs | Dr. Maged Ragab" };

async function getFaqs() {
  try {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
    const { data } = await supabase.from("faqs").select("*").eq("active", true).order("sort_order");
    return data || [];
  } catch { return []; }
}

export default async function FaqsPage() {
  const faqs = await getFaqs();
  return (
    <>
      <Header isPage />
      <div className="page-hero">
        <p className="eyebrow"><span className="en">FAQs</span><span className="ar">الأسئلة الشائعة</span></p>
        <h1><span className="en">Frequently Asked Questions</span><span className="ar">الأسئلة الشائعة</span></h1>
        <p><span className="en">Everything you need to know before your consultation.</span><span className="ar">كل ما تحتاج معرفته قبل استشارتك.</span></p>
      </div>
      <main>
        <section className="section">
          <div style={{maxWidth:"800px",margin:"0 auto",display:"flex",flexDirection:"column",gap:"16px"}}>
            {faqs.map(faq => (
              <details key={faq.id} style={{background:"#fff",border:"1px solid #e8eaec",borderRadius:"12px",overflow:"hidden",boxShadow:"0 2px 8px rgba(7,21,37,0.05)"}}>
                <summary style={{padding:"20px 24px",cursor:"pointer",fontWeight:"700",fontSize:"15px",color:"var(--navy)",display:"flex",justifyContent:"space-between",alignItems:"center",listStyle:"none",userSelect:"none"}}>
                  <span><span className="en">{faq.question_en}</span><span className="ar">{faq.question_ar}</span></span>
                  <span style={{color:"var(--gold)",fontSize:"20px",fontWeight:"400",flexShrink:0,marginLeft:"16px"}}>+</span>
                </summary>
                <div style={{padding:"0 24px 20px",borderTop:"1px solid #f0f2f4"}}>
                  <p style={{margin:"16px 0 0",fontSize:"15px",lineHeight:"1.8",color:"var(--ink)"}}>
                    <span className="en">{faq.answer_en}</span>
                    <span className="ar">{faq.answer_ar}</span>
                  </p>
                </div>
              </details>
            ))}
          </div>
        </section>
        <section className="section final-cta">
          <h2><span className="en">Still have questions?</span><span className="ar">هل لديك المزيد من الأسئلة؟</span></h2>
          <div className="hero-actions">
            <Link className="button primary" href="/booking"><span className="en">Book Appointment</span><span className="ar">احجز موعد</span></Link>
            <Link className="button ghost" href="/contact"><span className="en">Contact Us</span><span className="ar">تواصل معنا</span></Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
