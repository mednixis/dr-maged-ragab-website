import "./globals.css";
import Header from "../components/Header.js";
import Footer from "../components/Footer.js";

export const metadata = {
  title: "Dr. Maged Ragab | Urology & Men's Health Authority",
  description: "Professor Dr. Maged Ragab — advanced urology, male infertility, and men's health care. Kafr El Sheikh & New Cairo clinics.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
