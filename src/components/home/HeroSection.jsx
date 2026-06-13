import Link from 'next/link';

export default function HeroSection() {
  return (
    <section className="hero">
      <div className="hero-logo-wrap">
        <img src="/images/logo.png" alt="مُلم" className="hero-logo" />
        <div className="hero-glow"></div>
      </div>
      <p className="hero-sub">منصتك الأولى لاكتشاف المنح الدراسية حول العالم</p>
      <Link href="/scholarships" className="btn-main">استعرض المنح</Link>
      <section className="stats-section">
        <div className="stat-item">
          <span className="stat-number">+2000</span>
          <span className="stat-label">🎓 مستفيد</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">+70</span>
          <span className="stat-label">📚 منحة</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">+40</span>
          <span className="stat-label">🌍 دولة</span>
        </div>
      </section>
    </section>
  );
}