import Header from "../../components/Header.js";
import BookingFlow from "./BookingFlow.js";
import { createClient } from "@supabase/supabase-js";

export const metadata = { title: "Book Appointment | Dr. Maged Ragab" };

async function getData() {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  const { data: clinics } = await supabase.from("clinic_locations").select("*").eq("active", true).order("name_en");
  return { clinics: clinics || [] };
}

export default async function BookingPage() {
  const { clinics } = await getData();
  return (
    <>
      <Header isPage />
      <div className="page-hero">
        <p className="eyebrow"><span className="en">Booking</span><span className="ar">الحجز</span></p>
        <h1><span className="en">Book Your Appointment</span><span className="ar">احجز موعدك</span></h1>
        <p><span className="en">Choose your clinic, date, and available slot.</span><span className="ar">اختر العيادة والتاريخ والموعد المتاح.</span></p>
      </div>
      <main>
        <section className="section">
          <BookingFlow clinics={clinics} />
        </section>
      </main>
    </>
  );
}
