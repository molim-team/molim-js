export default function AboutSection() {
  return (
    <section className="about-section">
      <h2 className="section-title"> عن مُلم </h2>
      <div className="cards-wrapper flex-col md:flex-row">
        <div className="about-card">
          <span className="about-icon">🎯</span>
          <h3>من نحن</h3>
          <p>مُلم منصة عربية متخصصة في تجميع أبرز المنح الدراسية حول العالم في مكان واحد. نسعى لتسهيل وصول الطلاب العرب إلى فرص التعليم الدولي بمعلومات دقيقة وموثوقة.</p>
        </div>
        <div className="about-card">
          <span className="about-icon">📚</span>
          <h3>ماذا نقدم</h3>
          <p>نوفر لك تفاصيل شاملة عن كل منحة تشمل المزايا والشروط والمستندات المطلوبة ورابط التقديم الرسمي — كل ما تحتاجه في صفحة واحدة دون الحاجة للبحث في عشرات المواقع.</p>
        </div>
        <div className="about-card">
          <span className="about-icon">✅</span>
          <h3>لماذا مُلم</h3>
          <p>معلوماتنا محدّثة باستمرار ومصدرها المواقع الرسمية للمنح. نوضح جميع المتطلبات والشروط الدقيقة لكل منحة حتى تتقدم بثقة وملف مكتمل.</p>
        </div>
        <a href="https://t.me/Molim_Team/4" target="_blank" rel="noreferrer">
          <div className="about-card">
            <span className="about-icon">💬</span>
            <h3>مجتمع مُلم</h3>
            <p>انضم لقروب التليجرام الخاص بنا للحصول على آخر أخبار المنح والمواعيد النهائية للتقديم، وللتواصل مع طلاب يمرون بنفس تجربتك.</p>
          </div>
        </a>
      </div>
    </section>
  );
}