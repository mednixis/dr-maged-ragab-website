export const revalidate = 0;
import Header from "../../components/Header.js";
import Footer from "../../components/Footer.js";

export const metadata = { title: "About Dr. Maged Ragab | Professor of Urology & Andrology" };

export default function AboutPage() {
  return (
    <>
      <Header isPage />
      <div className="page-hero">
        <p className="eyebrow"><span className="en">About</span><span className="ar">عن الدكتور</span></p>
        <h1><span className="en">Professor Dr. Maged M. Ragab</span><span className="ar">أستاذ دكتور ماجد م. رجب</span></h1>
        <p><span className="en">Professor of Urology & Andrology — Head of Andrology Unit, Tanta University Hospital</span><span className="ar">أستاذ المسالك البولية والأندرولوجيا — رئيس وحدة الأندرولوجيا، مستشفى جامعة طنطا</span></p>
      </div>

      <main>
        <section className="section" style={{paddingTop:"60px"}}>
          <div style={{display:"grid", gridTemplateColumns:"300px 1fr", gap:"48px", alignItems:"start", maxWidth:"1100px", margin:"0 auto"}}>

            {/* Left column — photo + card */}
            <div style={{position:"sticky", top:"100px"}}>
              <img src="/Maged%20photo.png" alt="Professor Dr. Maged Ragab"
                style={{width:"100%", borderRadius:"16px", boxShadow:"0 8px 32px rgba(7,21,37,0.15)", display:"block"}} />
              <div style={{marginTop:"20px", padding:"20px", background:"var(--navy)", borderRadius:"12px", color:"#fff"}}>
                <p style={{margin:"0 0 12px", fontSize:"11px", fontWeight:"700", textTransform:"uppercase", letterSpacing:"1px", opacity:0.6}}>Position</p>
                <p style={{margin:"0 0 16px", fontSize:"14px", fontWeight:"700", lineHeight:"1.5"}}>Professor of Urology & Andrology, Tanta University</p>
                <p style={{margin:"0 0 12px", fontSize:"11px", fontWeight:"700", textTransform:"uppercase", letterSpacing:"1px", opacity:0.6}}>Role</p>
                <p style={{margin:"0 0 16px", fontSize:"14px", fontWeight:"700"}}>Head of Andrology Unit, Tanta University Hospital</p>
                <p style={{margin:"0 0 12px", fontSize:"11px", fontWeight:"700", textTransform:"uppercase", letterSpacing:"1px", opacity:0.6}}>Teaching Since</p>
                <p style={{margin:"0 0 16px", fontSize:"14px", fontWeight:"700"}}>1998</p>
                <p style={{margin:"0 0 12px", fontSize:"11px", fontWeight:"700", textTransform:"uppercase", letterSpacing:"1px", opacity:0.6}}>Secretary</p>
                <p style={{margin:0, fontSize:"14px", fontWeight:"700", lineHeight:"1.5"}}>ED Section, Egyptian Urological Association</p>
              </div>
            </div>

            {/* Right column — full CV */}
            <div>
              {/* Bio */}
              <h2 style={{fontSize:"26px", color:"var(--navy)", marginBottom:"16px", fontFamily:"Georgia,serif"}}>
                <span className="en">Biography</span><span className="ar">السيرة الذاتية</span>
              </h2>
              <p style={{fontSize:"15px", lineHeight:"1.9", color:"var(--ink)", marginBottom:"16px"}}>
                <span className="en">Professor Dr. Maged M. Ragab is a Professor of Urology and Andrology at Tanta University Hospital, Egypt, and Head of the Andrology Unit. He has been teaching urology to medical students since 1998 and is recognised as one of Egypt's foremost academic urologists with a strong focus on male infertility, sexual medicine, and minimally invasive urology.</span>
                <span className="ar">أستاذ دكتور ماجد م. رجب أستاذ المسالك البولية والأندرولوجيا في مستشفى جامعة طنطا، مصر، ورئيس وحدة الأندرولوجيا. يُدرّس علم المسالك البولية لطلاب الطب منذ عام 1998، ويُعدّ من أبرز الأكاديميين المتخصصين في علاج العقم عند الرجال والطب الجنسي والجراحة الأقل توغلاً.</span>
              </p>
              <p style={{fontSize:"15px", lineHeight:"1.9", color:"var(--ink)", marginBottom:"32px"}}>
                <span className="en">He completed a research fellowship in Endourology and Laparoscopy at Washington University, USA, where he worked under internationally recognised professors including Ralph Clayman and Chandru Sundaram. He has presented at international conferences in the USA, Spain, UAE, and Egypt, and is an active member of the American Urological Association, European Association of Urology, ISSM, ESSM, MESSM, and the Global Andrology Forum.</span>
                <span className="ar">أتمّ زمالة بحثية في تنظير المسالك البولية والجراحة بالمنظار في جامعة واشنطن بالولايات المتحدة الأمريكية، حيث عمل تحت إشراف أساتذة معترف بهم دولياً من بينهم رالف كلايمان وشاندرو سوندارام. قدّم أبحاثه في مؤتمرات دولية في الولايات المتحدة وإسبانيا والإمارات ومصر، وهو عضو فعّال في الجمعية الأمريكية لعلم المسالك البولية والجمعية الأوروبية والهيئات الدولية المتخصصة.</span>
              </p>

              {/* Academic Positions */}
              <h3 style={{fontSize:"16px", color:"var(--gold)", marginBottom:"14px", fontWeight:"700", borderBottom:"2px solid var(--gold)", paddingBottom:"8px"}}>
                <span className="en">Academic & Professional Positions</span><span className="ar">المناصب الأكاديمية والمهنية</span>
              </h3>
              <ul style={{listStyle:"none", padding:0, marginBottom:"28px"}}>
                {[
                  ["Professor of Urology & Andrology, Tanta University Hospital","أستاذ المسالك البولية والأندرولوجيا، مستشفى جامعة طنطا"],
                  ["Head of the Andrology Unit, Tanta University Hospital","رئيس وحدة الأندرولوجيا، مستشفى جامعة طنطا"],
                  ["Secretary of the ED Section, Egyptian Urological Association","أمين سر قسم ضعف الانتصاب، الجمعية المصرية للمسالك البولية"],
                  ["Active contributor to Egyptian male infertility & urological guideline committees","مساهم فعّال في لجان إرشادات العقم الذكوري والمسالك البولية المصرية"],
                  ["Teaching urology to medical students since 1998","تدريس علم المسالك البولية لطلاب الطب منذ عام 1998"],
                ].map(([en,ar],i) => (
                  <li key={i} style={{display:"flex", gap:"12px", marginBottom:"10px", padding:"12px 16px", background:"#f6f8fa", borderRadius:"8px", borderLeft:"3px solid var(--gold)"}}>
                    <span style={{color:"var(--gold)", fontWeight:"700"}}>◆</span>
                    <span style={{fontSize:"14px"}}><span className="en" style={{color:"var(--navy)", fontWeight:"600"}}>{en}</span><span className="ar" style={{color:"var(--navy)", fontWeight:"600"}}>{ar}</span></span>
                  </li>
                ))}
              </ul>

              {/* Areas of Expertise */}
              <h3 style={{fontSize:"16px", color:"var(--gold)", marginBottom:"14px", fontWeight:"700", borderBottom:"2px solid var(--gold)", paddingBottom:"8px"}}>
                <span className="en">Main Areas of Expertise</span><span className="ar">المجالات الرئيسية للخبرة</span>
              </h3>
              <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px", marginBottom:"28px"}}>
                {[
                  ["Male Infertility & Andrology","العقم عند الرجال والأندرولوجيا"],
                  ["Microsurgery & Micro-TESE","الجراحة الدقيقة وMicro-TESE"],
                  ["Varicocele Surgery","جراحة الدوالي"],
                  ["Erectile Dysfunction & Sexual Medicine","ضعف الانتصاب والطب الجنسي"],
                  ["Endourology & Stone Surgery","تنظير المسالك وجراحة الحصوات"],
                  ["Flexible Ureteroscopy & PCNL","تنظير الحالب المرن وPCNL"],
                  ["Laparoscopic Urology","جراحة المسالك بالمنظار"],
                  ["Urethral Reconstruction","إعادة بناء الإحليل"],
                  ["Penile Prosthesis Implantation","زراعة دعامات القضيب"],
                  ["Peyronie's Disease","مرض بيروني"],
                ].map(([en,ar],i) => (
                  <div key={i} style={{padding:"10px 14px", background:"var(--navy)", borderRadius:"8px", color:"#fff"}}>
                    <span className="en" style={{fontSize:"13px", fontWeight:"600"}}>{en}</span>
                    <span className="ar" style={{fontSize:"13px", fontWeight:"600"}}>{ar}</span>
                  </div>
                ))}
              </div>

              {/* International Training */}
              <h3 style={{fontSize:"16px", color:"var(--gold)", marginBottom:"14px", fontWeight:"700", borderBottom:"2px solid var(--gold)", paddingBottom:"8px"}}>
                <span className="en">International Training & Fellowships</span><span className="ar">التدريب الدولي والزمالات</span>
              </h3>
              <ul style={{listStyle:"none", padding:0, marginBottom:"28px"}}>
                {[
                  ["Research Fellowship in Endourology & Laparoscopy — Washington University, USA","زمالة بحثية في تنظير المسالك والجراحة بالمنظار — جامعة واشنطن، الولايات المتحدة الأمريكية"],
                  ["Worked under Prof. Ralph Clayman & Prof. Chandru Sundaram (Washington University)","عمل تحت إشراف أ.د. رالف كلايمان وأ.د. شاندرو سوندارام (جامعة واشنطن)"],
                  ["International conferences — USA, Spain, UAE, Egypt","مؤتمرات دولية — الولايات المتحدة، إسبانيا، الإمارات، مصر"],
                  ["Live Surgery Workshops & Teaching Courses in Egypt","ورش عمل الجراحة المباشرة والدورات التعليمية في مصر"],
                ].map(([en,ar],i) => (
                  <li key={i} style={{display:"flex", gap:"12px", marginBottom:"10px", padding:"12px 16px", background:"#f6f8fa", borderRadius:"8px", borderLeft:"3px solid var(--navy)"}}>
                    <span style={{fontSize:"16px"}}>🌍</span>
                    <span style={{fontSize:"14px"}}><span className="en" style={{color:"var(--navy)", fontWeight:"600"}}>{en}</span><span className="ar" style={{color:"var(--navy)", fontWeight:"600"}}>{ar}</span></span>
                  </li>
                ))}
              </ul>

              {/* Memberships */}
              <h3 style={{fontSize:"16px", color:"var(--gold)", marginBottom:"14px", fontWeight:"700", borderBottom:"2px solid var(--gold)", paddingBottom:"8px"}}>
                <span className="en">Professional Memberships</span><span className="ar">العضويات المهنية</span>
              </h3>
              <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px", marginBottom:"28px"}}>
                {[
                  ["American Urological Association (AUA)","الجمعية الأمريكية للمسالك البولية"],
                  ["European Association of Urology (EAU)","الجمعية الأوروبية للمسالك البولية"],
                  ["ISSM (Sexual Medicine)","ISSM للطب الجنسي"],
                  ["ESSM (European Sexual Medicine)","ESSM للطب الجنسي الأوروبي"],
                  ["MESSM (Middle East Sexual Medicine)","MESSM للطب الجنسي في الشرق الأوسط"],
                  ["Global Andrology Forum","المنتدى العالمي للأندرولوجيا"],
                ].map(([en,ar],i) => (
                  <div key={i} style={{padding:"10px 14px", background:"#f6f8fa", borderRadius:"8px", border:"1px solid #e8eaec"}}>
                    <span className="en" style={{fontSize:"13px", fontWeight:"600", color:"var(--navy)"}}>{en}</span>
                    <span className="ar" style={{fontSize:"13px", fontWeight:"600", color:"var(--navy)"}}>{ar}</span>
                  </div>
                ))}
              </div>

              {/* Research */}
              <h3 style={{fontSize:"16px", color:"var(--gold)", marginBottom:"14px", fontWeight:"700", borderBottom:"2px solid var(--gold)", paddingBottom:"8px"}}>
                <span className="en">Research & Publications</span><span className="ar">البحث العلمي والمنشورات</span>
              </h3>
              <p style={{fontSize:"15px", lineHeight:"1.9", color:"var(--ink)", marginBottom:"16px"}}>
                <span className="en">Professor Ragab has published numerous peer-reviewed studies in major international journals including the Journal of Urology, Urology, BJU International, Journal of Endourology, and World Journal of Men's Health. His research focuses on male infertility, azoospermia, varicocele, urethral reconstruction, endourology, and laparoscopic surgery.</span>
                <span className="ar">نشر الأستاذ الدكتور رجب دراسات محكّمة عديدة في مجلات دولية كبرى منها Journal of Urology وBJU International وWorld Journal of Men's Health. تتمحور أبحاثه حول العقم الذكوري وانعدام الحيوانات المنوية ودوالي الخصية وإعادة بناء الإحليل والجراحة التنظيرية.</span>
              </p>
              <p style={{fontSize:"15px", lineHeight:"1.9", color:"var(--ink)", marginBottom:"32px"}}>
                <span className="en">He supervises MSc and PhD theses in urology and andrology, and has organised live surgery workshops and teaching courses, actively contributing to the training of the next generation of urologists in Egypt.</span>
                <span className="ar">يُشرف على رسائل الماجستير والدكتوراه في المسالك البولية والأندرولوجيا، وينظّم ورش عمل جراحية ودورات تعليمية، مساهماً بفاعلية في تدريب الجيل القادم من أطباء المسالك البولية في مصر.</span>
              </p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="section final-cta">
          <h2><span className="en">Book a Consultation with Professor Ragab</span><span className="ar">احجز استشارة مع أستاذ دكتور ماجد رجب</span></h2>
          <div className="hero-actions">
            <a className="button primary" href="/booking"><span className="en">Book Appointment</span><span className="ar">احجز موعد</span></a>
            <a className="button ghost" href="/contact"><span className="en">Contact Us</span><span className="ar">تواصل معنا</span></a>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
