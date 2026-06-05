import Header from "../../components/Header.js";
export const metadata = { title: "Media | Dr. Maged Ragab" };
export default function MediaPage() {
  return (
    <>
      <Header isPage />
      <div className="page-hero">
        <p className="eyebrow"><span className="en">Media</span><span className="ar">الإعلام</span></p>
        <h1><span className="en">Media & International Presence</span><span className="ar">الإعلام والحضور الدولي</span></h1>
      </div>
      <main>
        <section className="section">
          <div className="compact-grid">
            {["Conference Photos","Speaking Events","Educational Videos","International Fellowships","Media Interviews","Academic Publications"].map(item => (
              <div key={item} style={{padding:"24px",border:"1px solid var(--line)",background:"var(--white)"}}>
                <span className="en">{item}</span>
                <span className="ar">{item}</span>
              </div>
            ))}
          </div>
          <p className="muted" style={{marginTop:"32px",textAlign:"center"}}>Content coming soon. Please check back regularly.</p>
        </section>
      </main>
    </>
  );
}
