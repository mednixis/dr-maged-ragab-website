import Header from "../../components/Header.js";
export const metadata = { title: "Articles & Insights | Dr. Maged Ragab" };
const articles = [
  { cat:"Men's Health", catAr:"صحة الرجال", title:"What Every Man Should Know About Male Infertility", titleAr:"ما يجب أن يعرفه كل رجل عن تأخر الإنجاب", desc:"Clear medical education written for patients.", descAr:"تثقيف طبي واضح للمرضى." },
  { cat:"Azoospermia", catAr:"انعدام الحيوانات", title:"Azoospermia Explained: Causes, Diagnosis, and Treatment", titleAr:"شرح انعدام الحيوانات المنوية: الأسباب والتشخيص والعلاج", desc:"A comprehensive guide to understanding azoospermia.", descAr:"دليل شامل لفهم انعدام الحيوانات المنوية." },
  { cat:"Male Fertility", catAr:"خصوبة الرجال", title:"Micro-TESE: A Modern Option for Severe Male Infertility", titleAr:"Micro-TESE: خيار حديث لحالات تأخر الإنجاب الشديدة", desc:"How Micro-TESE works and who it can help.", descAr:"كيف يعمل Micro-TESE ومن يمكنه مساعدته." },
  { cat:"Prostate", catAr:"البروستاتا", title:"Understanding Rezum: A Modern Approach to BPH", titleAr:"فهم Rezum: نهج حديث لعلاج تضخم البروستاتا", desc:"Water vapor therapy explained simply.", descAr:"علاج بخار الماء شرح بسيط." },
  { cat:"Erectile Health", catAr:"صحة الانتصاب", title:"Penile Prosthesis: When Is It the Right Option?", titleAr:"الدعامات: متى تكون الخيار الصحيح؟", desc:"A guide for patients considering surgical treatment.", descAr:"دليل للمرضى الذين يفكرون في العلاج الجراحي." },
  { cat:"Urology", catAr:"المسالك البولية", title:"Kidney Stones: Prevention and Modern Treatment", titleAr:"حصوات الكلى: الوقاية والعلاج الحديث", desc:"What causes kidney stones and how to prevent them.", descAr:"ما الذي يسبب حصوات الكلى وكيفية الوقاية منها." },
];
export default function ArticlesPage() {
  return (
    <>
      <Header isPage />
      <div className="page-hero">
        <p className="eyebrow"><span className="en">Articles & Insights</span><span className="ar">المقالات والرؤى</span></p>
        <h1><span className="en">Patient Education & Medical Insights</span><span className="ar">تثقيف المرضى والرؤى الطبية</span></h1>
      </div>
      <main>
        <section className="section">
          <div className="article-grid">
            {articles.map(a => (
              <div key={a.title} className="article-card">
                <span><span className="en">{a.cat}</span><span className="ar">{a.catAr}</span></span>
                <strong><span className="en">{a.title}</span><span className="ar">{a.titleAr}</span></strong>
                <p><span className="en">{a.desc}</span><span className="ar">{a.descAr}</span></p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
