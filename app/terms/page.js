import Header from "../../components/Header.js";
export const metadata = { title: "Terms & Medical Disclaimer | Dr. Maged Ragab" };
export default function TermsPage() {
  return (
    <>
      <Header isPage />
      <div className="page-hero">
        <h1><span className="en">Terms & Medical Disclaimer</span><span className="ar">الشروط والتنبيه الطبي</span></h1>
      </div>
      <main>
        <section className="section">
          <p style={{maxWidth:"720px",lineHeight:"1.8",color:"var(--muted)"}}>The content on this website is for informational purposes only and does not constitute medical advice. Always consult a qualified healthcare professional for diagnosis and treatment. Appointment bookings are subject to confirmation by the clinic team.</p>
        </section>
      </main>
    </>
  );
}
