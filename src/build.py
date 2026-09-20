#!/usr/bin/env python3
"""
Static site generator for drmagedragab.com

Produces real HTML files at real URLs — /ar/services/, /en/services/ — with the
page text baked into the source, so search engines index every page. There is no
framework and no runtime dependency.

    python3 src/build.py

Everything it emits is committed to the repo, so the site deploys with no build
step on the host.
"""

import json, pathlib, shutil, html, datetime, re
from bs4 import BeautifulSoup

ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC = ROOT / "src"
PARTS = SRC / "parts"
DATA = json.loads((SRC / "data.json").read_text(encoding="utf-8"))

SITE = "https://www.drmagedragab.com"
BUILT = datetime.date.today().isoformat()

CONTACT = {
    "kfs": {"tel": "+201039310401", "wa": "201039310401",
            "map": "https://maps.app.goo.gl/vb4a5uZf89KehnJv5"},
    "mvd": {"tel": "+201039310403", "wa": "201039310403",
            "map": "https://maps.app.goo.gl/24PuEgYWCTMmNzBh6"},
}

PAGES = ["home", "about", "services", "procedures", "clinics", "faq", "booking"]
SLUG = {"home": "", "about": "about", "services": "services",
        "procedures": "procedures", "clinics": "clinics", "faq": "faq",
        "booking": "booking"}

META = {
    "home": {
        "ar": ("أ.د. ماجد رجب — أستاذ جراحة المسالك البولية وصحة الرجل",
               "أستاذ ورئيس قسم جراحة المسالك البولية بجامعة طنطا. رعاية متقدّمة في تأخّر الإنجاب عند الرجال، وصحة الرجل، والبروستاتا، وحصوات الكلى. عيادتان في كفر الشيخ وميفيدا."),
        "en": ("Prof. Dr. Maged Ragab — Urology & Men's Health",
               "Professor and Head of Urology at Tanta University. Advanced care in male infertility, men's health, prostate disease and kidney stones. Clinics in Kafr El Sheikh and New Cairo."),
    },
    "about": {
        "ar": ("عن أ.د. ماجد رجب — السيرة العلمية",
               "أستاذ جراحة المسالك البولية والأندرولوجيا ورئيس وحدة الأندرولوجيا بمستشفى جامعة طنطا. زمالة بحثية بجامعة واشنطن، وعضويات AUA وEAU وISSM وESSM."),
        "en": ("About Prof. Maged M. Ragab — Academic profile",
               "Professor of Urology and Andrology and Head of the Andrology Unit at Tanta University Hospital. Research fellowship at Washington University; member of the AUA, EAU, ISSM and ESSM."),
    },
    "services": {
        "ar": ("الخدمات الطبية — أ.د. ماجد رجب",
               "٤٧ خدمة في ثمانية مجالات: تأخّر الإنجاب، ضعف الانتصاب، البروستاتا، حصوات الكلى، المثانة، التهابات المسالك، الصفن والخصية، والجراحة التنظيرية."),
        "en": ("Medical services — Prof. Dr. Maged Ragab",
               "47 services across eight areas: male infertility, erectile dysfunction, prostate disease, kidney stones, bladder conditions, urinary infections, scrotal surgery and endourology."),
    },
    "procedures": {
        "ar": ("الإجراءات والتقنيات — Micro-TESE وRezum والجراحة المجهرية",
               "الاستئصال المجهري لدوالي الخصية، وإزالة التعصيب المجهري للحبل المنوي، وMicro-TESE، وRezum، وEcholaser — مع سجل عمليات موثّق."),
        "en": ("Procedures — Micro-TESE, Rezum and microsurgery",
               "Microsurgical varicocelectomy, microsurgical denervation of the spermatic cord, Micro-TESE, Rezum and Echolaser — with a documented surgical logbook."),
    },
    "clinics": {
        "ar": ("العيادات ومواعيد العمل — كفر الشيخ وميفيدا",
               "عيادة كفر الشيخ: الأحد والثلاثاء والسبت. عيادة ميفيدا بالقاهرة الجديدة: الأربعاء والخميس. من ٣ إلى ٩ مساءً. الدفع في العيادة."),
        "en": ("Clinics and opening hours — Kafr El Sheikh and New Cairo",
               "Kafr El Sheikh Clinic: Sunday, Tuesday, Saturday. Mivida Clinic, New Cairo: Wednesday and Thursday. 3:00–9:00 PM. Payment at the clinic."),
    },
    "faq": {
        "ar": ("أسئلة شائعة — التكلفة والتأكيد والخصوصية",
               "تكلفة الكشف، ووقت وصول التأكيد، وسرّية الزيارة، وما تحتاج إحضاره — إجابات واضحة قبل أن تحجز."),
        "en": ("FAQs — fees, confirmation and privacy",
               "What the consultation costs, when confirmation arrives, whether the visit is confidential, and what to bring — answered before you book."),
    },
    "booking": {
        "ar": ("احجز موعدك — أ.د. ماجد رجب",
               "ثلاث خطوات، بدون حساب وبدون دفع إلكتروني. اختر العيادة والموعد، اترك اسمك ورقمك، ويصلك التأكيد عبر واتساب."),
        "en": ("Book an appointment — Prof. Dr. Maged Ragab",
               "Three steps, no account and no online payment. Choose a clinic and time, leave your name and number, and get confirmation by WhatsApp."),
    },
}

ICONS = {
    "spark": '<circle cx="12" cy="12" r="3.2"/><path d="M12 2v5M12 17v5M2 12h5M17 12h5M5 5l3.2 3.2M15.8 15.8 19 19M19 5l-3.2 3.2M8.2 15.8 5 19"/>',
    "male": '<circle cx="10" cy="14" r="5.2"/><path d="M14.5 9.5 20 4M15.5 4H20v4.5"/>',
    "organ": '<path d="M12 3c-3.5 0-6 2.4-6 5.5 0 2.2 1 3.4 1 5.5 0 3 2.2 5 5 5s5-2 5-5c0-2.1 1-3.3 1-5.5C18 5.4 15.5 3 12 3z"/><path d="M9.5 10.5h5M12 8v5"/>',
    "stone": '<path d="M12 3 5 8v6l7 7 7-7V8z"/><path d="M9 11h6M12 8v6"/>',
    "drop": '<path d="M12 3s6 6.4 6 10.2A6 6 0 0 1 6 13.2C6 9.4 12 3 12 3z"/>',
    "shield": '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9.5 12h5M12 9.5v5"/>',
    "circle": '<circle cx="12" cy="14" r="6"/><path d="M12 8V3M9 5h6"/>',
    "scope": '<circle cx="12" cy="12" r="7"/><path d="M12 9v6M9 12h6M17 17l4 4"/>',
    "pin": '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="2.8"/>',
    "cal": '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4M16 3v4M3 11h18"/>',
    "clock": '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.2 2"/>',
    "wa": '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
    "tel": '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z"/>',
    "check": '<path d="M20 6 9 17l-5-5"/>',
}


def svg(name, w=16, sw=1.8):
    return (f'<svg width="{w}" height="{w}" viewBox="0 0 24 24" fill="none" '
            f'stroke="currentColor" stroke-width="{sw}" stroke-linecap="round" '
            f'stroke-linejoin="round" aria-hidden="true">{ICONS[name]}</svg>')


def e(s):
    return html.escape(str(s), quote=True)


def url(lang, page):
    slug = SLUG[page]
    return f"/{lang}/" if not slug else f"/{lang}/{slug}/"


# --------------------------------------------------------------- pre-rendering
def area_tiles(lang):
    out = []
    for g in DATA["SERVICES"]:
        n = len(g["items"])
        label = f"{n} خدمات" if lang == "ar" else f"{n} services"
        out.append(
            f'<a class="tile" href="{url(lang,"services")}#svc-{g["id"]}">'
            f'<span class="card-ico">{svg(g["icon"],19,1.6)}</span>'
            f'<b>{e(g[lang])}</b><span>{e(label)}</span></a>')
    return "".join(out)


def cond_chips(lang):
    i = 0 if lang == "ar" else 1
    return "".join(f"<span>{e(c[i])}</span>" for c in DATA["CONDITIONS"])


def svc_nav(lang):
    return "".join(
        f'<button type="button" data-jump="{g["id"]}" aria-pressed="{"true" if i==0 else "false"}">{e(g[lang])}</button>'
        for i, g in enumerate(DATA["SERVICES"]))


def svc_groups(lang):
    idx = 0 if lang == "ar" else 1
    out = []
    for g in DATA["SERVICES"]:
        items = "".join(f'<li><i class="dot"></i><span>{e(it[idx])}</span></li>'
                        for it in g["items"])
        out.append(
            f'<section class="svc-g" id="svc-{g["id"]}">'
            f'<div class="svc-g-hd"><span class="card-ico">{svg(g["icon"],19,1.6)}</span>'
            f'<h2>{e(g[lang])}</h2></div><ul class="svc-items">{items}</ul></section>')
    return "".join(out)


def proc_list(lang):
    icons = ["spark", "male", "circle", "circle", "organ", "organ", "scope", "shield"]
    ni, di = (0, 2) if lang == "ar" else (1, 3)
    sig = "يميّزنا" if lang == "ar" else "Signature"
    out = []
    for i, p in enumerate(DATA["PROCEDURES"]):
        flag = (f'<span class="sig">{svg("check",12,3)}<span>{e(sig)}</span></span>'
                if len(p) > 4 and p[4] else "")
        out.append(
            f'<article class="proc{" proc-sig" if flag else ""}">'
            f'<span class="card-ico">{svg(icons[i % len(icons)],19,1.6)}</span>'
            f'<div><div class="proc-hd"><h2>{e(p[ni])}</h2>{flag}</div>'
            f'<p>{e(p[di])}</p></div></article>')
    return "".join(out)


def logbook(lang):
    i = 0 if lang == "ar" else 1
    mx = DATA["LOGBOOK"][0][2]
    out = []
    for r in DATA["LOGBOOK"]:
        w = max(6, round(r[2] / mx * 70))
        out.append(f'<div class="lb-row"><span>{e(r[i])}</span>'
                   f'<i class="lb-bar" style="width:{w}px"></i><b>{r[2]}</b></div>')
    return "".join(out)


def timeline(lang):
    a, b, c = (0, 2, 4) if lang == "ar" else (1, 3, 5)
    return "".join(
        f'<div class="tl-row"><time>{e(t[a])}</time>'
        f'<div><b>{e(t[b])}</b><span>{e(t[c])}</span></div></div>'
        for t in DATA["TIMELINE"])


def cv_blocks(lang):
    i = 0 if lang == "ar" else 1
    out = []
    for b in DATA["CVBLOCKS"]:
        items = "".join(f'<li><i class="dot"></i><span>{e(x[i])}</span></li>' for x in b[2])
        out.append(f'<div class="card"><h2>{e(b[i])}</h2><ul class="list">{items}</ul></div>')
    return "".join(out)


def faq_list(lang):
    q, a = (0, 2) if lang == "ar" else (1, 3)
    return "".join(f'<div class="qa"><h2>{e(f[q])}</h2><p>{e(f[a])}</p></div>'
                   for f in DATA["FAQ"])


def clinic_cards(lang):
    out = []
    for c in DATA["CLINICS"]:
        k = CONTACT[c["id"]]
        name, area = c[lang], c["areaAr" if lang == "ar" else "areaEn"]
        days = c["daysAr" if lang == "ar" else "daysEn"]
        hours = c["hoursAr" if lang == "ar" else "hoursEn"]
        book = ("احجز في " + name.replace("عيادة ", "")) if lang == "ar" \
            else ("Book at " + name.replace(" Clinic", ""))
        l_dir = "الاتجاهات" if lang == "ar" else "Directions"
        l_tel = "اتصال" if lang == "ar" else "Call"
        l_wa = "واتساب" if lang == "ar" else "WhatsApp"
        out.append(
            f'<article class="clinic"><div class="clinic-hd"><div>'
            f'<h2>{e(name)}</h2><span>{e(area)}</span></div>'
            f'<span style="color:var(--muted)">{svg("pin",22,1.6)}</span></div>'
            f'<div class="hours">'
            f'<div>{svg("cal",16,1.9)}<span>{e(days)}</span></div>'
            f'<div>{svg("clock",16,1.9)}<span>{e(hours)}</span></div></div>'
            f'<a class="btn btn-ink" href="{url(lang,"booking")}?clinic={c["id"]}">{e(book)}</a>'
            f'<div class="clinic-acts">'
            f'<a class="btn btn-out" href="{k["map"]}" target="_blank" rel="noopener">{svg("pin",15,1.9)}<span>{e(l_dir)}</span></a>'
            f'<a class="btn btn-out" href="tel:{k["tel"]}">{svg("tel",15,1.9)}<span>{e(l_tel)}</span></a>'
            f'<a class="btn btn-out" href="https://wa.me/{k["wa"]}" target="_blank" rel="noopener">{svg("wa",15,1.9)}<span>{e(l_wa)}</span></a>'
            f'</div></article>')
    return "".join(out)


BLOCKS = {
    "areaTiles": area_tiles, "condChips": cond_chips, "svcNav": svc_nav,
    "svcGroups": svc_groups, "procList": proc_list, "logbook": logbook,
    "cvTimeline": timeline, "cvBlocks": cv_blocks, "faqList": faq_list,
    "clinicCardsHome": clinic_cards, "clinicCardsFull": clinic_cards,
}


# ------------------------------------------------------------------ transform
def localise(soup, lang):
    """Resolve every data-ar / data-en pair into real text for this language."""
    for el in soup.select("[data-ar]"):
        el.string = el.get("data-ar") if lang == "ar" else el.get("data-en")
        del el["data-ar"]; del el["data-en"]
    for attr, target in (("data-ar-alt", "alt"), ("data-ar-ph", "placeholder"),
                         ("data-ar-label", "aria-label")):
        en_attr = attr.replace("-ar", "-en")
        for el in soup.select(f"[{attr}]"):
            el[target] = el.get(attr) if lang == "ar" else el.get(en_attr)
            del el[attr]
            if el.has_attr(en_attr):
                del el[en_attr]
    for el in soup.select("[data-route]"):
        el["href"] = url(lang, el["data-route"])
        del el["data-route"]
    return soup


def real_links(soup, lang):
    """Replace the demo's inert placeholders with working contact links."""
    kfs, mvd = CONTACT["kfs"], CONTACT["mvd"]
    for a in soup.select('a[href="#"]'):
        txt = a.get_text(strip=True)
        if a.has_attr("onclick"):
            del a["onclick"]
        if "0401" in txt:
            a["href"] = f"tel:{kfs['tel']}"
        elif "0403" in txt:
            a["href"] = f"tel:{mvd['tel']}"
        elif "واتساب" in txt or "WhatsApp" in txt:
            a["href"] = f"https://wa.me/{kfs['wa']}"; a["target"] = "_blank"; a["rel"] = "noopener"
        elif "اتصال" in txt or "Call" in txt:
            a["href"] = f"tel:{kfs['tel']}"
        else:
            a["href"] = url(lang, "clinics")
    return soup


def head(lang, page):
    title, desc = META[page][lang]
    other = "en" if lang == "ar" else "ar"
    canon = SITE + url(lang, page)
    return f"""<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{e(title)}</title>
<meta name="description" content="{e(desc)}">
<link rel="canonical" href="{canon}">
<link rel="alternate" hreflang="ar" href="{SITE}{url('ar',page)}">
<link rel="alternate" hreflang="en" href="{SITE}{url('en',page)}">
<link rel="alternate" hreflang="x-default" href="{SITE}{url('ar',page)}">
<meta property="og:type" content="website">
<meta property="og:locale" content="{'ar_EG' if lang=='ar' else 'en_US'}">
<meta property="og:title" content="{e(title)}">
<meta property="og:description" content="{e(desc)}">
<meta property="og:url" content="{canon}">
<meta property="og:image" content="{SITE}/assets/portrait.jpg">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#F5F3EF">
<link rel="icon" href="/assets/logo.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Almarai:wght@300;400;700;800&amp;family=Archivo:wght@300;400;500;600;700&amp;family=Newsreader:opsz,wght@6..72,300;6..72,400;6..72,500&amp;display=swap">
<link rel="stylesheet" href="/assets/styles.css">"""


def jsonld(lang):
    locs = []
    for c in DATA["CLINICS"]:
        k = CONTACT[c["id"]]
        locs.append({
            "@type": "MedicalClinic",
            "name": c[lang],
            "address": {"@type": "PostalAddress",
                        "addressLocality": c["areaAr" if lang == "ar" else "areaEn"],
                        "addressCountry": "EG"},
            "telephone": k["tel"],
            "openingHours": "Su,Tu,Sa 15:00-21:00" if c["id"] == "kfs" else "We,Th 15:00-21:00",
        })
    doc = {
        "@context": "https://schema.org",
        "@type": "Physician",
        "name": "أ.د. ماجد رجب" if lang == "ar" else "Prof. Dr. Maged M. Ragab",
        "medicalSpecialty": ["Urology", "Andrology"],
        "url": SITE + url(lang, "home"),
        "image": SITE + "/assets/portrait.jpg",
        "telephone": CONTACT["kfs"]["tel"],
        "areaServed": "EG",
        "availableService": [
            {"@type": "MedicalProcedure", "name": p[1]} for p in DATA["PROCEDURES"]
        ],
        "location": locs,
    }
    return ('<script type="application/ld+json">'
            + json.dumps(doc, ensure_ascii=False, separators=(",", ":"))
            + "</script>")


def build_page(lang, page, shell):
    header, footer, sections = shell
    soup = BeautifulSoup(str(sections[page]), "html.parser")
    for el_id, fn in BLOCKS.items():
        holder = soup.find(id=el_id)
        if holder:
            holder.clear()
            holder.append(BeautifulSoup(fn(lang), "html.parser"))
    body_html = str(soup)

    hdr = BeautifulSoup(header, "html.parser")
    localise(hdr, lang)
    for a in hdr.select(".nav a"):
        if a["href"] == url(lang, page):
            a["class"] = a.get("class", []) + ["on"]
            a["aria-current"] = "page"
    btn = hdr.find(id="langBtn")
    other = "en" if lang == "ar" else "ar"
    new = hdr.new_tag("a", href=url(other, page))
    new["class"] = "btn btn-out lang"
    new["lang"] = other
    new["hreflang"] = other
    new.string = "EN" if lang == "ar" else "العربية"
    btn.replace_with(new)

    ftr = BeautifulSoup(footer, "html.parser")
    localise(ftr, lang); real_links(ftr, lang)

    page_soup = BeautifulSoup(body_html, "html.parser")
    localise(page_soup, lang); real_links(page_soup, lang)
    # pages live at /ar/services/ etc, so images need absolute asset paths
    for img in page_soup.select("img[src]"):
        src = img["src"]
        if not src.startswith(("/", "http")):
            img["src"] = "/assets/" + src
        if not img.has_attr("loading"):
            img["loading"] = "lazy"
        if not img.has_attr("decoding"):
            img["decoding"] = "async"
    first = page_soup.select_one("img")
    if first is not None:
        first["loading"] = "eager"
        first["fetchpriority"] = "high"

    sec = page_soup.find("section", class_="page")
    if sec:
        del sec["hidden"]
        if sec.has_attr("data-page"):
            del sec["data-page"]
        sec["class"] = [c for c in sec.get("class", []) if c != "page"]

    dirn = "rtl" if lang == "ar" else "ltr"
    boot = (f'<script>window.SITE={{lang:"{lang}",page:"{page}"}};</script>'
            '<script src="/assets/app.js" defer></script>')
    return (f'<!doctype html>\n<html lang="{lang}" dir="{dirn}">\n<head>\n'
            f'{head(lang,page)}\n{jsonld(lang)}\n</head>\n<body>\n'
            f'{hdr}\n<main>\n{page_soup}\n</main>\n{ftr}\n{boot}\n</body>\n</html>\n')


def main():
    header_src = (PARTS / "header.html").read_text(encoding="utf-8")
    footer_src = (PARTS / "footer.html").read_text(encoding="utf-8")
    pages_src = BeautifulSoup((PARTS / "pages.html").read_text(encoding="utf-8"), "html.parser")
    sections = {s["data-page"]: s for s in pages_src.select("section.page")}

    for lang in ("ar", "en"):
        for page in PAGES:
            out = ROOT / lang / SLUG[page] / "index.html" if SLUG[page] else ROOT / lang / "index.html"
            out.parent.mkdir(parents=True, exist_ok=True)
            out.write_text(build_page(lang, page, (header_src, footer_src, sections)),
                           encoding="utf-8")
            print("  ", out.relative_to(ROOT))

    # root redirect
    (ROOT / "index.html").write_text(
        '<!doctype html>\n<html lang="ar"><head><meta charset="utf-8">'
        '<title>أ.د. ماجد رجب</title><link rel="canonical" href="' + SITE + '/ar/">'
        '<meta http-equiv="refresh" content="0; url=/ar/">'
        '<script>location.replace("/ar/");</script></head>'
        '<body><p><a href="/ar/">اضغط هنا للمتابعة — Continue</a></p></body></html>\n',
        encoding="utf-8")

    (ROOT / "404.html").write_text(
        '<!doctype html>\n<html lang="ar" dir="rtl"><head><meta charset="utf-8">'
        '<meta name="viewport" content="width=device-width,initial-scale=1">'
        '<title>الصفحة غير موجودة</title><link rel="stylesheet" href="/assets/styles.css">'
        '</head><body><div class="wrap" style="padding-block:120px;text-align:center">'
        '<h1>الصفحة غير موجودة</h1><p style="margin:18px 0 28px">Page not found</p>'
        '<a class="btn btn-pri" href="/ar/">العودة للرئيسية</a></div></body></html>\n',
        encoding="utf-8")

    urls = [SITE + url(l, p) for l in ("ar", "en") for p in PAGES]
    sm = ['<?xml version="1.0" encoding="UTF-8"?>',
          '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" '
          'xmlns:xhtml="http://www.w3.org/1999/xhtml">']
    for l in ("ar", "en"):
        for p in PAGES:
            sm.append("  <url>")
            sm.append(f"    <loc>{SITE}{url(l,p)}</loc>")
            sm.append(f'    <xhtml:link rel="alternate" hreflang="ar" href="{SITE}{url("ar",p)}"/>')
            sm.append(f'    <xhtml:link rel="alternate" hreflang="en" href="{SITE}{url("en",p)}"/>')
            sm.append(f"    <lastmod>{BUILT}</lastmod>")
            sm.append(f"    <priority>{'1.0' if p=='home' else '0.8' if p in ('services','booking') else '0.6'}</priority>")
            sm.append("  </url>")
    sm.append("</urlset>")
    (ROOT / "sitemap.xml").write_text("\n".join(sm) + "\n", encoding="utf-8")

    (ROOT / "robots.txt").write_text(
        f"User-agent: *\nAllow: /\n\nSitemap: {SITE}/sitemap.xml\n", encoding="utf-8")

    print(f"\nBuilt {len(urls)} pages + sitemap, robots, 404, root redirect.")


if __name__ == "__main__":
    main()
