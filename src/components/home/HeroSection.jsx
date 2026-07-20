import Link from 'next/link';

export default function HeroSection() {
  return (
    <section className="hero">
      <video
        className="hero-video"
        src="/videos/hero-video.mp4"
        poster="/images/hero-bg.jpg"
        autoPlay
        muted
        loop
        playsInline
      />
      <div className="hero-overlay"></div>

      <img
        src="/images/logo.png"
        alt="مُلم"
        className="hero-logo-desktop"
      />

      <div className="hero-content">
        <h1 className="hero-title">بوابتك لبدء مستقبلك المهني</h1>
        <p className="hero-desc">
          مُلم رفيقك نحو مستقبل مشرق، منصة تجمع لك الدقة والموثوقية وكل
          التفاصيل التي تحتاجها في مكان واحد، بأسلوب سهل وواضح للجميع.
        </p>
        <Link href="/scholarships" className="hero-cta">
          استعرض المنح
        </Link>
      </div>
    </section>
  );
}