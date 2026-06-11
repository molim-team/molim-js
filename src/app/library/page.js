export const metadata = {
  title: "مكتبة مُلم | دليلك الشامل للمنح الدراسية",
  description:
    "أدلة شاملة قابلة للتحميل تغطي كل خطوة في رحلتك الدراسية — من التقديم على المنح إلى كتابة السيرة الذاتية والخطابات الرسمية.",
};

const guides = [
  {
    id: 1,
    title: "الدليل الشامل للتقديم على المنح",
    description:
      "كل ما تحتاج معرفته للتقديم على المنح الدراسية خطوة بخطوة — من اختيار المنحة المناسبة، إلى إعداد الملف، حتى متابعة النتائج.",
    available: true,
    filePath: "/الدليل الشامل للتقديم على المنح.pdf",
    fileName: "الدليل الشامل للتقديم على المنح.pdf",
    iconBg: "#fff1ec",
    iconColor: "#ff4500",
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ff4500" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="16" y1="13" x2="8" y2="13"/>
        <line x1="16" y1="17" x2="8" y2="17"/>
        <line x1="10" y1="9" x2="8" y2="9"/>
      </svg>
    ),
  },
  {
    id: 2,
    title: "الدليل الشامل لكتابة خطاب الحافز",
    description: "تعلّم كيف تكتب خطاب حافز يلفت الانتباه ويعكس شخصيتك وأهدافك بوضوح.",
    available: false,
    iconBg: "#eef2ff",
    iconColor: "#1a3a6e",
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#1a3a6e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 20h9"/>
        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
      </svg>
    ),
  },
  {
    id: 3,
    title: "الدليل الشامل لكتابة السيرة الذاتية (CV)",
    description: "قالب وإرشادات لبناء سيرة ذاتية احترافية تناسب متطلبات المنح الدراسية الدولية.",
    available: false,
    iconBg: "#eef2ff",
    iconColor: "#1a3a6e",
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#1a3a6e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
        <line x1="8" y1="21" x2="16" y2="21"/>
        <line x1="12" y1="17" x2="12" y2="21"/>
        <circle cx="9" cy="9" r="2"/>
        <path d="M15 8h2M15 12H9"/>
      </svg>
    ),
  },
  {
    id: 4,
    title: "الدليل الشامل لكتابة خطاب التوصية",
    description: "كيف تكتب خطاب توصية قوي وما الذي يجب أن يتضمنه لزيادة فرص قبولك.",
    available: false,
    iconBg: "#eef2ff",
    iconColor: "#1a3a6e",
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#1a3a6e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
        <polyline points="16 11 18 13 22 9"/>
      </svg>
    ),
  },
];

export default function LibraryPage() {
  return (
    <div className="library-page" dir="rtl">
      {/* ── Hero ── */}
      <section className="library-hero">
        <div className="hero-inner">
          <span className="hero-eyebrow">مكتبة مُلم</span>
          <h1 className="hero-title">
            كل ما تحتاجه في مكان واحد
          </h1>
          <p className="hero-subtitle">
            أدلة مجانية أعدّها فريق مُلم لمساعدتك في كل مرحلة من رحلة البحث
            عن المنح الدراسية.
          </p>
        </div>
      </section>

      {/* ── Guides Grid ── */}
      <section className="guides-section">
        <div className="guides-grid">
          {guides.map((guide) => (
            <article
              key={guide.id}
              className={`guide-card ${!guide.available ? "guide-card--soon" : ""}`}
            >
              {/* شارة الحالة */}
              <span className={`guide-badge ${guide.available ? "badge--ready" : "badge--soon"}`}>
                {guide.available ? "متاح الآن" : "قريبًا"}
              </span>

              {/* الأيقونة */}
              <div
                className="guide-icon-circle"
                style={{ background: guide.iconBg }}
                aria-hidden="true"
              >
                {guide.icon}
              </div>

              {/* المحتوى */}
              <div className="guide-body">
                <h2 className="guide-title">{guide.title}</h2>
                <p className="guide-desc">{guide.description}</p>
              </div>

              {/* الزر */}
              {guide.available ? (
                <a
                  href={guide.filePath}
                  download={guide.fileName}
                  className="guide-btn guide-btn--download"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  اضغط للتحميل
                </a>
              ) : (
                <button className="guide-btn guide-btn--soon" disabled>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  قريبًا
                </button>
              )}
            </article>
          ))}
        </div>
      </section>

      <style>{`
        /* ── Base ── */
        .library-page {
          font-family: 'Cairo', 'Tajawal', sans-serif;
          min-height: 100vh;
        }

        /* ── Hero ── */
        .library-hero {
          background: var(--page-hero-bg);
          padding: 20px 20px 20px;
          text-align: center;
        }
        .hero-inner {
          max-width: 640px;
          margin: 0 auto;
        }
        .hero-eyebrow {
          display: inline-block;
          background: #ff4500;
          color: #ffffff;
          font-size: 0.85rem;
          font-weight: 700;
          letter-spacing: 0.06em;
          padding: 6px 18px;
          border-radius: 999px;
          margin-bottom: 20px;
          border: 1px solid #ff4500;
        }
        .hero-title {
          font-size: clamp(1.8rem, 5vw, 2.6rem);
          font-weight: 800;
          color: #ff4500;
          margin: 0 0 16px;
          line-height: 1.3;
        }
        .hero-subtitle {
          font-size: 1.05rem;
          color: rgba(255,255,255,0.78);
          line-height: 1.8;
          margin: 0;
        }

        /* ── Section ── */
        .guides-section {
          background: var(--bg-color);
          padding: 56px 20px 80px;
        }

        /* ── Grid ── */
        .guides-grid {
          display: grid;
          gap: 24px;
          max-width: 900px;
          margin: 0 auto;
        }

        /* ── Card ── */
        .guide-card {
          position: relative;
          background: var(--card-bg);
          border: 1.5px solid var(--card-border);
          border-radius: 16px;
          padding: 28px 28px 24px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          transition: box-shadow 0.2s, transform 0.2s;
          overflow: hidden;
        }
        .guide-card:not(.guide-card--soon):hover {
          box-shadow: 0 8px 32px rgba(26,58,110,0.10);
          transform: translateY(-2px);
        }
        .guide-card--soon {
          opacity: 0.5;
        }

        /* شريط جانبي */
        .guide-card::before {
          content: '';
          position: absolute;
          right: 0;
          top: 0;
          bottom: 0;
          width: 4px;
          background: #ff4500;
          border-radius: 0 16px 16px 0;
        }
        .guide-card--soon::before {
          background: #cccccc;
        }

        /* ── Badge ── */
        .guide-badge {
          position: absolute;
          top: 20px;
          left: 20px;
          font-size: 0.72rem;
          font-weight: 700;
          padding: 4px 12px;
          border-radius: 999px;
        }
        .badge--ready {
          background: #fff1ec;
          color: #ff4500;
          border: 1px solid #ffd0c0;
        }
        .badge--soon {
          background: #f0f0f0;
          color: #888;
          border: 1px solid #ddd;
        }

        /* ── Icon ── */
        .guide-icon-circle {
          width: 60px;
          height: 60px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        /* ── Body ── */
        .guide-body {
          flex: 1;
        }
        .guide-title {
          font-size: 1.15rem;
          font-weight: 800;
          color: var(--primary-color);
          margin: 0 0 8px;
          line-height: 1.4;
        }
        .guide-desc {
          font-size: 0.93rem;
          color: var(--secondary-color);
          line-height: 1.8;
          margin: 0;
          font-weight: 400;
        }

        /* ── Buttons ── */
        .guide-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 11px 22px;
          border-radius: 10px;
          font-family: inherit;
          font-size: 0.9rem;
          font-weight: 700;
          cursor: pointer;
          text-decoration: none;
          width: fit-content;
          transition: background 0.18s, opacity 0.18s;
          border: none;
        }
        .guide-btn--download {
          background: #ff4500;
          color: #ffffff;
        }
        .guide-btn--download:hover {
          background: #e03d00;
        }
        .guide-btn--soon {
          background: #ebebeb;
          color: #999;
          cursor: not-allowed;
        }

        /* ── Responsive ── */
        @media (min-width: 640px) {
          .guide-card {
            flex-direction: row;
            align-items: flex-start;
          }
          .guide-body {
            order: 1;
            flex: 1;
          }
          .guide-icon-circle {
            order: 0;
            align-self: center;
            margin-left: 16px;
          }
          .guide-btn {
            order: 2;
            align-self: flex-end;
            flex-shrink: 0;
          }
        }

        @media (max-width: 480px) {
          .library-hero {
            padding: 48px 16px 40px;
          }
          .guides-section {
            padding: 36px 16px 60px;
          }
          .guide-card {
            padding: 24px 20px 20px;
          }
        }
      `}</style>
    </div>
  );
}