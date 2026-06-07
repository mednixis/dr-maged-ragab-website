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
        <h1><span className="en">Professor Dr. Maged Ragab</span><span className="ar">أستاذ دكتور ماجد رجب</span></h1>
        <p><span className="en">Professor of Urology & Andrology — Head of Urology Department, Tanta University Hospital</span><span className="ar">أستاذ المسالك البولية والأندرولوجيا — رئيس قسم المسالك البولية، مستشفى جامعة طنطا</span></p>
      </div>

      <main>
        {/* Photo + Bio */}
        <section className="section" style={{paddingTop:"60px"}}>
          <div style={{display:"grid", gridTemplateColumns:"300px 1fr", gap:"48px", alignItems:"start", maxWidth:"1100px", margin:"0 auto"}}>
            <div style={{position:"sticky", top:"100px"}}>
              <img src="/Maged%20photo.png" alt="Professor Dr. Maged Ragab"
                style={{width:"100%", borderRadius:"16px", boxShadow:"0 8px 32px rgba(7,21,37,0.15)", display:"block"}} />
              <div style={{marginTop:"20px", padding:"20px", background:"var(--gold)", borderRadius:"12px", color:"#fff"}}>
                <p style={{margin:"0 0 6px", fontSize:"11px", fontWeight:"700", textTransform:"uppercase", letterSpacing:"1px", opacity:0.8}}>Academic Title</p>
                <p style={{margin:"0 0 16px", fontSize:"14px", fontWeight:"700"}}>Professor of Urology & Andrology</p>
                <p style={{margin:"0 0 6px", fontSize:"11px", fontWeight:"700", textTransform:"uppercase", letterSpacing:"1px", opacity:0.8}}>Institution</p>
                <p style={{margin:"0 0 16px", fontSize:"14px", fontWeight:"700"}}>Tanta University Hospital</p>
                <p style={{margin:"0 0 6px", fontSize:"11px", fontWeight:"700", textTransform:"uppercase", letterSpacing:"1px", opacity:0.8}}>Speciality</p>
                <p style={{margin:0, fontSize:"14px", fontWeight:"700"}}>Urology, Andrology & Sexual Medicine</p>
              </div>
            </div>

            <div>
              <h2 style={{fontSize:"28px", color:"var(--navy)", marginBottom:"20px", fontFamily:"Georgia,serif"}}>
                <span className="en">Biography</span><span className="ar">السيرة الذاتية</span>
              </h2>
              <p style={{fontSize:"16px", lineHeight:"1.8", color:"var(--ink)", marginBottom:"20px"}}>
                <span className="en">Professor Dr. Maged Ragab is a distinguished Professor of Urology and Andrology and Head of the Urology Department at Tanta University Hospital, one of Egypt's leading academic medical centres. With over two decades of clinical and academic experience, he is recognised as one of Egypt's foremost experts in male reproductive health, erectile dysfunction, and advanced urological surgery.</span>
                <span className="ar">أستاذ دكتور ماجد رجب أستاذ متميز في المسالك البولية والأندرولوجيا ورئيس قسم المسالك البولية في مستشفى جامعة طنطا، أحد المراكز الطبية الأكاديمية الرائدة في مصر. بخبرة سريرية وأكاديمية تمتد لأكثر من عقدين، يُعدّ من أبرز خبراء مصر في صحة الذكورة الإنجابية وضعف الانتصاب والجراحة البولية المتقدمة.</span>
              </p>
              <p style={{fontSize:"16px", lineHeight:"1.8", color:"var(--ink)", marginBottom:"20px"}}>
                <span className="en">He holds subspecialty expertise in male infertility, including microsurgical techniques such as Micro-TESE for azoospermia, penile prosthesis implantation, Peyronie's disease management, varicocele repair, and minimally invasive prostate treatments including Rezum steam therapy and Echolaser.</span>
                <span className="ar">يمتلك خبرة متخصصة في علاج العقم عند الرجال، بما يشمل تقنيات الجراحة الدقيقة مثل Micro-TESE لانعدام الحيوانات المنوية، وزراعة دعامات القضيب، وعلاج مرض بيروني، وإصلاح الدوالي، والعلاجات الجراحية الأقل توغلاً للبروستاتا بما في ذلك علاج الريزوم بالبخار والإيكو ليزر.</span>
              </p>
              <p style={{fontSize:"16px", lineHeight:"1.8", color:"var(--ink)", marginBottom:"32px"}}>
                <span className="en">Professor Ragab has participated in numerous international conferences, live surgery demonstrations, and educational programmes across Europe and the Middle East. He is committed to bringing the latest global advances in urology to his patients in Egypt.</span>
                <span className="ar">شارك الأستاذ الدكتور رجب في مؤتمرات دولية عديدة وعروض جراحية حية وبرامج تعليمية في أوروبا والشرق الأوسط، وهو ملتزم بتقديم أحدث التطورات العالمية في المسالك البولية لمرضاه في مصر.</span>
              </p>

              {/* Academic Positions */}
              <h3 style={{fontSize:"18px", color:"var(--gold)", marginBottom:"16px", fontWeight:"700", borderBottom:"2px solid var(--gold)", paddingBottom:"8px"}}>
                <span className="en">Academic Positions</span><span className="ar">المناصب الأكاديمية</span>
              </h3>
              <ul style={{listStyle:"none", padding:0, marginBottom:"32px"}}>
                {[
                  ["Professor of Urology & Andrology, Tanta University", "أستاذ المسالك البولية والأندرولوجيا، جامعة طنطا"],
                  ["Head of Urology Department, Tanta University Hospital", "رئيس قسم المسالك البولية، مستشفى جامعة طنطا"],
                  ["Consultant Urologist & Andrologist, Kafr El Sheikh Clinic", "استشاري مسالك بولية وأندرولوجيا، عيادة كفر الشيخ"],
                  ["Consultant Urologist & Andrologist, Mivida Clinic, Cairo", "استشاري مسالك بولية وأندرولوجيا، عيادة ميفيدا، القاهرة"],
                ].map(([en,ar],i) => (
                  <li key={i} style={{display:"flex", alignItems:"flex-start", gap:"12px", marginBottom:"12px", padding:"12px 16px", background:"#f6f8fa", borderRadius:"8px", borderLeft:"3px solid var(--gold)"}}>
                    <span style={{color:"var(--gold)", fontWeight:"700", fontSize:"16px", marginTop:"1px"}}>◆</span>
                    <span><span className="en" style={{fontWeight:"600", color:"var(--navy)"}}>{en}</span><span className="ar" style={{fontWeight:"600", color:"var(--navy)"}}>{ar}</span></span>
                  </li>
                ))}
              </ul>

              {/* Education */}
              <h3 style={{fontSize:"18px", color:"var(--gold)", marginBottom:"16px", fontWeight:"700", borderBottom:"2px solid var(--gold)", paddingBottom:"8px"}}>
                <span className="en">Education & Qualifications</span><span className="ar">التعليم والمؤهلات</span>
              </h3>
              <ul style={{listStyle:"none", padding:0, marginBottom:"32px"}}>
                {[
                  ["MBBCh, Faculty of Medicine, Tanta University", "بكالوريوس الطب والجراحة، كلية الطب، جامعة طنطا"],
                  ["Master's Degree in Urology, Tanta University", "ماجستير في المسالك البولية، جامعة طنطا"],
                  ["MD (Doctorate) in Urology & Andrology, Tanta University", "دكتوراه في المسالك البولية والأندرولوجيا، جامعة طنطا"],
                ].map(([en,ar],i) => (
                  <li key={i} style={{display:"flex", alignItems:"flex-start", gap:"12px", marginBottom:"12px", padding:"12px 16px", background:"#f6f8fa", borderRadius:"8px", borderLeft:"3px solid var(--navy)"}}>
                    <span style={{color:"var(--navy)", fontWeight:"700", fontSize:"16px", marginTop:"1px"}}>🎓</span>
                    <span><span className="en" style={{fontWeight:"600", color:"var(--navy)"}}>{en}</span><span className="ar" style={{fontWeight:"600", color:"var(--navy)"}}>{ar}</span></span>
                  </li>
                ))}
              </ul>

              {/* International Fellowships */}
              <h3 style={{fontSize:"18px", color:"var(--gold)", marginBottom:"16px", fontWeight:"700", borderBottom:"2px solid var(--gold)", paddingBottom:"8px"}}>
                <span className="en">International Fellowships & Training</span><span className="ar">الزمالات الدولية والتدريب</span>
              </h3>
              <ul style={{listStyle:"none", padding:0, marginBottom:"32px"}}>
                {[
                  ["Fellowship in Andrology & Sexual Medicine, Europe", "زمالة في الأندرولوجيا والطب الجنسي، أوروبا"],
                  ["Training in Penile Prosthesis Implantation, International Centre", "تدريب على زراعة دعامات القضيب، مركز دولي"],
                  ["Fellowship in Microsurgical Male Infertility (Micro-TESE)", "زمالة في جراحة العقم الدقيقة عند الرجال (Micro-TESE)"],
                  ["Training in Rezum Steam Therapy for BPH", "تدريب على علاج الريزوم بالبخار لتضخم البروستاتا"],
                ].map(([en,ar],i) => (
                  <li key={i} style={{display:"flex", alignItems:"flex-start", gap:"12px", marginBottom:"12px", padding:"12px 16px", background:"#f6f8fa", borderRadius:"8px", borderLeft:"3px solid var(--gold)"}}>
                    <span style={{color:"var(--gold)", fontWeight:"700", fontSize:"16px", marginTop:"1px"}}>🌍</span>
                    <span><span className="en" style={{fontWeight:"600", color:"var(--navy)"}}>{en}</span><span className="ar" style={{fontWeight:"600", color:"var(--navy)"}}>{ar}</span></span>
                  </li>
                ))}
              </ul>

              {/* Expertise */}
              <h3 style={{fontSize:"18px", color:"var(--gold)", marginBottom:"16px", fontWeight:"700", borderBottom:"2px solid var(--gold)", paddingBottom:"8px"}}>
                <span className="en">Areas of Expertise</span><span className="ar">مجالات الخبرة</span>
              </h3>
              <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px", marginBottom:"32px"}}>
                {[
                  ["Male Infertility & Micro-TESE","العقم عند الرجال وMicro-TESE"],
                  ["Erectile Dysfunction","ضعف الانتصاب"],
                  ["Penile Prosthesis Implantation","زراعة دعامات القضيب"],
                  ["Peyronie's Disease","مرض بيروني"],
                  ["Varicocele Surgery","جراحة الدوالي"],
                  ["Prostate Diseases & Rezum","أمراض البروستاتا وريزوم"],
                  ["Kidney Stones (Endoscopic)","حصوات الكلى (تنظيرية)"],
                  ["Echolaser Therapy","علاج الإيكو ليزر"],
                  ["Bladder Diseases","أمراض المثانة"],
                  ["Men's Sexual Health","الصحة الجنسية للرجل"],
                ].map(([en,ar],i) => (
                  <div key={i} style={{padding:"10px 14px", background:"var(--navy)", borderRadius:"8px", color:"#fff"}}>
                    <span className="en" style={{fontSize:"13px", fontWeight:"600"}}>{en}</span>
                    <span className="ar" style={{fontSize:"13px", fontWeight:"600"}}>{ar}</span>
                  </div>
                ))}
              </div>

              {/* Research */}
              <h3 style={{fontSize:"18px", color:"var(--gold)", marginBottom:"16px", fontWeight:"700", borderBottom:"2px solid var(--gold)", paddingBottom:"8px"}}>
                <span className="en">Research & Publications</span><span className="ar">البحث العلمي والمنشورات</span>
              </h3>
              <p style={{fontSize:"15px", lineHeight:"1.8", color:"var(--ink)", marginBottom:"32px"}}>
                <span className="en">Professor Ragab has authored and co-authored numerous peer-reviewed research papers in international urology and andrology journals. His research focuses on male reproductive medicine, surgical innovations in urology, and outcomes of advanced urological procedures.</span>
                <span className="ar">ألّف الأستاذ الدكتور رجب وشارك في تأليف أبحاث علمية محكّمة عديدة في مجلات دولية متخصصة في المسالك البولية والأندرولوجيا. تركز أبحاثه على طب الإنجاب الذكوري والابتكارات الجراحية في المسالك البولية ونتائج الإجراءات البولية المتقدمة.</span>
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
