import Header from "../../components/Header.js";
export const metadata = { title: "Privacy Policy | Dr. Maged Ragab" };
export default function PrivacyPage() {
  return (
    <>
      <Header isPage />
      <div className="page-hero">
        <h1><span className="en">Privacy Policy</span><span className="ar">سياسة الخصوصية</span></h1>
      </div>
      <main>
        <section className="section">
          <p style={{maxWidth:"720px",lineHeight:"1.8",color:"var(--muted)"}}>All patient information collected through this website is handled with strict confidentiality. Personal data is used solely for appointment management and will never be shared with third parties without explicit consent.</p>
        </section>
      </main>
    </>
  );
}
