import Header from "../../components/Header.js";
export const metadata = { title: "Media | Dr. Maged Ragab" };
export default function MediaPage() {
  return (
    <>
      <Header isPage />
      <div className="page-hero">
        <p className="eyebrow"><span className="en">Media</span><span className="ar">الإعلام</span></p>
        <h1><span className="en">Media & Conference Presence</span><span className="ar">الحضور الإعلامي والمؤتمرات</span></h1>
      </div>
      <main>
        <section className="section">
          <div className="compact-grid">
            {[
              ["📸","Conference Photos","صور المؤتمرات"],
              ["🎤","Speaking Events","محاضرات وفعاليات"],
              ["🎥","Educational Videos","فيديوهات تعليمية"],
              ["🏥","Live Surgery Workshops","ورش الجراحة المباشرة"],
            ].map(([icon,en,ar])=>(
              <div key={en} style={{padding:"28px",border:"1px solid var(--line)",background:"var(--white)",borderRadius:"4px"}}>
                <div style={{fontSize:"28px",marginBottom:"12px"}}>{icon}</div>
                <strong style={{display:"block",color:"var(--navy)",marginBottom:"6px"}}><span className="en">{en}</span><span className="ar">{ar}</span></strong>
              </div>
            ))}
          </div>
          <p style={{color:"var(--muted)",marginTop:"40px",textAlign:"center",fontStyle:"italic"}}>
            <span className="en">Content coming soon. Please check back regularly.</span>
            <span className="ar">المحتوى قريبًا. يرجى المراجعة بانتظام.</span>
          </p>
        </section>
      </main>
    </>
  );
}
