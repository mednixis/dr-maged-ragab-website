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

        {/* Mednixis floating badge */}
        <a href="https://mednixis.com" target="_blank" rel="noopener noreferrer"
          style={{
            position: "fixed",
            bottom: "24px",
            right: "24px",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            gap: "8px",
            background: "rgba(7,21,37,0.92)",
            backdropFilter: "blur(8px)",
            border: "1px solid rgba(185,155,98,0.4)",
            borderRadius: "50px",
            padding: "8px 16px 8px 12px",
            textDecoration: "none",
            boxShadow: "0 4px 20px rgba(0,0,0,0.25)",
            transition: "all 0.2s ease",
          }}>
          <span style={{
            width: "22px", height: "22px",
            background: "linear-gradient(135deg, #b99b62, #d4b896)",
            borderRadius: "50%",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "11px", fontWeight: "900", color: "#071525",
          }}>M</span>
          <span style={{ display: "flex", flexDirection: "column", lineHeight: 1.2 }}>
            <span style={{ fontSize: "9px", color: "rgba(255,255,255,0.5)", letterSpacing: "0.5px", textTransform: "uppercase" }}>Built by</span>
            <span style={{
              fontSize: "13px", fontWeight: "800", letterSpacing: "1px",
              background: "linear-gradient(135deg, #b99b62, #d4b896)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            }}>MEDNIXIS</span>
          </span>
        </a>
      </body>
    </html>
  );
}
