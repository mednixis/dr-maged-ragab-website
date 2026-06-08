"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navLinks = [
  { href: "/",              en: "Home",                  ar: "الرئيسية" },
  { href: "/about",         en: "About",                 ar: "عن الدكتور" },
  { href: "/services",      en: "Services",              ar: "الخدمات" },
  { href: "/international", en: "International Patients",ar: "المرضى الدوليون" },
  { href: "/media",         en: "Media",                 ar: "الإعلام" },
  { href: "/faqs",          en: "FAQs",                  ar: "الأسئلة الشائعة" },
  { href: "/booking",       en: "Book Appointment",      ar: "الحجز" },
  { href: "/contact",       en: "Contact",               ar: "التواصل" },
];

export default function Header({ isPage = false }) {
  const pathname  = usePathname();
  const [scrolled, setScrolled]   = useState(false);
  const [menuOpen, setMenuOpen]   = useState(false);
  const [lang, setLang]           = useState("en");

  useEffect(() => {
    const saved = localStorage.getItem("lang") || "en";
    setLang(saved);
    document.documentElement.setAttribute("data-lang", saved);
    document.body.classList.toggle("lang-ar", saved === "ar");
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function toggleLang() {
    const next = lang === "en" ? "ar" : "en";
    setLang(next);
    localStorage.setItem("lang", next);
    document.documentElement.setAttribute("data-lang", next);
    document.body.classList.toggle("lang-ar", next === "ar");
  }

  const cls = [
    "site-header",
    isPage ? "page-header" : "",
    scrolled ? "scrolled" : "",
    menuOpen ? "menu-open" : "",
  ].filter(Boolean).join(" ");

  return (
    <header className={cls} id="top">
      <Link className="brand" href="/" aria-label="Dr. Maged Ragab home">
        <img src="/Transparent_LOGO.svg" alt="Dr. Maged Ragab" style={{height:"52px", width:"auto", display:"block"}} />
        <span className="en">Dr. Maged Ragab</span>
        <span className="ar">د. ماجد رجب</span>
      </Link>
      <nav className="main-nav" aria-label="Primary navigation">
        {navLinks.map(l => (
          <Link key={l.href} href={l.href} className={pathname === l.href ? "active" : ""}
            onClick={() => setMenuOpen(false)}>
            <span className="en">{l.en}</span>
            <span className="ar">{l.ar}</span>
          </Link>
        ))}
      </nav>
      <div className="header-tools">
        <button className="lang-toggle" type="button" onClick={toggleLang} aria-label="Switch language">
          {lang === "en" ? "العربية" : "English"}
        </button>
        <Link className="nav-action" href="/booking">
          <span className="en">Book Appointment</span>
          <span className="ar">احجز موعد</span>
        </Link>
        <button className="menu-button" type="button" aria-label="Open menu"
          aria-expanded={menuOpen} onClick={() => setMenuOpen(o => !o)}>
          {menuOpen ? "✕" : "☰"}
        </button>
      </div>
    </header>
  );
}
