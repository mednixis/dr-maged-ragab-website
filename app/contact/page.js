import Header from "../../components/Header.js";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

export const metadata = { title: "Contact | Dr. Maged Ragab" };

async function getData() {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  const [{ data: contact }, { data: clinics }] = await Promise.all([
    supabase.from("contact_info").select("*").maybeSingle(),
    supabase.from("clinic_locations").select("*").eq("active", true),
  ]);
  return { contact: contact || {}, clinics: clinics || [] };
}

export default async function ContactPage() {
  const { contact, clinics } = await getData();
  return (
    <>
      <Header isPage />
      <div className="page-hero">
        <p className="eyebrow"><span className="en">Contact</span><span className="ar">التواصل</span></p>
        <h1><span className="en">Contact & Clinic Locations</span><span className="ar">التواصل والعيادات</span></h1>
        <p><span className="en">Reach out to book an appointment or ask a question.</span><span className="ar">تواصل معنا لحجز موعد أو طرح سؤال.</span></p>
      </div>
      <main>
        <section className="section">
          <div className="two-card-grid">
            {clinics.map(clinic => (
              <article key={clinic.id} className="feature-card">
                <h3><span className="en">{clinic.name_en}</span><span className="ar">{clinic.name_ar}</span></h3>
                <p><span className="en">{clinic.address_en}</span><span className="ar">{clinic.address_ar}</span></p>
                <p style={{color:"var(--muted)"}}>3:00 PM – 8:00 PM</p>
                {clinic.phone && <p><span className="en">Phone:</span><span className="ar">هاتف:</span> <a href={`tel:${clinic.phone}`}>{clinic.phone}</a></p>}
                {clinic.whatsapp && <p><span className="en">WhatsApp:</span><span className="ar">واتساب:</span> <a href={`https://wa.me/${clinic.whatsapp.replace(/[^0-9]/g,"")}`}>{clinic.whatsapp}</a></p>}
                <div className="hero-actions" style={{marginTop:"8px"}}>
                  {clinic.google_maps_url && <a className="button quiet" href={clinic.google_maps_url} target="_blank" rel="noopener noreferrer"><span className="en">Google Maps</span><span className="ar">خرائط Google</span></a>}
                  <Link className="button primary" href="/booking"><span className="en">Book Here</span><span className="ar">احجز هنا</span></Link>
                </div>
              </article>
            ))}
          </div>

          {(contact.phone || contact.whatsapp || contact.email) && (
            <div style={{marginTop:"48px"}}>
              <div className="section-kicker"><span className="en">General Contact</span><span className="ar">التواصل العام</span></div>
              <div className="two-card-grid">
                {contact.phone && <a className="button ghost" href={`tel:${contact.phone}`} style={{justifyContent:"flex-start",padding:"20px"}}><span className="en">📞 {contact.phone}</span><span className="ar">📞 {contact.phone}</span></a>}
                {contact.whatsapp && <a className="button ghost" href={`https://wa.me/${contact.whatsapp.replace(/[^0-9]/g,"")}`} target="_blank" rel="noopener noreferrer" style={{justifyContent:"flex-start",padding:"20px"}}><span className="en">💬 WhatsApp: {contact.whatsapp}</span><span className="ar">💬 واتساب: {contact.whatsapp}</span></a>}
                {contact.email && <a className="button ghost" href={`mailto:${contact.email}`} style={{justifyContent:"flex-start",padding:"20px"}}><span className="en">✉️ {contact.email}</span><span className="ar">✉️ {contact.email}</span></a>}
                {contact.instagram && <a className="button ghost" href={contact.instagram} target="_blank" rel="noopener noreferrer" style={{justifyContent:"flex-start",padding:"20px"}}><span className="en">Instagram</span><span className="ar">إنستغرام</span></a>}
                {contact.facebook && <a className="button ghost" href={contact.facebook} target="_blank" rel="noopener noreferrer" style={{justifyContent:"flex-start",padding:"20px"}}><span className="en">Facebook</span><span className="ar">فيسبوك</span></a>}
              </div>
            </div>
          )}
        </section>
      </main>
    </>
  );
}
