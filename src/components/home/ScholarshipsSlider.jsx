"use client";

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Heart } from 'lucide-react';
import { useFavorites } from '@/lib/context/FavoritesContext';

function getCountdown(deadline) {
  if (!deadline) return null;
  const today = new Date();
  const end = new Date(deadline);
  const diff = Math.ceil((end - today) / (1000 * 60 * 60 * 24));
  if (diff < 0) return null;
  if (diff === 0) return { text: '⚠️ آخر يوم للتقديم!', urgent: true };

  // Arabic grammatical rules for تمييز العدد (days)
  let daysText;
  if (diff === 1) {
    daysText = 'يوم واحد';
  } else if (diff === 2) {
    daysText = 'يومان';
  } else if (diff >= 3 && diff <= 10) {
    daysText = `${diff} أيام`;
  } else {
    daysText = `${diff} يوماً`;
  }

  if (diff <= 7) return { text: `⚠️ باقي ${daysText} فقط!`, urgent: true };
  return { text: `📅 باقي ${daysText} على إغلاق التقديم`, urgent: false };
}

export default function ScholarshipsSlider({ scholarships }) {
  const navigate = useRouter();
  const { favorites, toggleFav: favToggle, user } = useFavorites();
  const gridRef = useRef(null);
  const [isDown, setIsDown] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeftState, setScrollLeftState] = useState(0);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => setShowBackToTop(window.scrollY > 300);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); }),
      { threshold: 0.1 }
    );
    document.querySelectorAll('.card, .about-card').forEach(card => observer.observe(card));
    return () => observer.disconnect();
  }, [scholarships]);

  const slideCards = (direction) => {
    if (!gridRef.current) return;
    const card = gridRef.current.querySelector('.card');
    if (!card) return;
    gridRef.current.scrollBy({ left: direction * (card.offsetWidth + 20), behavior: 'smooth' });
  };

  const handleMouseDown = (e) => {
    setIsDown(true);
    setStartX(e.pageX - gridRef.current.offsetLeft);
    setScrollLeftState(gridRef.current.scrollLeft);
  };
  const handleMouseLeave = () => setIsDown(false);
  const handleMouseUp = () => setIsDown(false);
  const handleMouseMove = (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - gridRef.current.offsetLeft;
    gridRef.current.scrollLeft = scrollLeftState - (x - startX) * 3;
  };

  const toggleFav = async (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    const success = await favToggle(id);
    if (!success) setShowAuthModal(true);
  };

  const shareScholarship = (e, id, name) => {
    e.preventDefault();
    e.stopPropagation();
    const url = `${window.location.origin}/scholarship/${id}`;
    const text = `🎓 ${name}\n`;
    if (navigator.share) {
      navigator.share({ title: `منحة ${name}`, text, url });
    } else {
      navigator.clipboard.writeText(text + '\n' + url);
      alert('✅ تم نسخ رابط المنحة!');
    }
  };

  return (
    <>
      <section className="open-scholarships-section">
        <h2 className="section-title">المنح المتاحة حالياً 🟢</h2>
        <div className="slider-wrapper">
          <button className="slider-btn prev" onClick={() => slideCards(-1)}>&#8250;</button>
          <div
            id="open-scholarships-grid"
            className="cards-grid"
            ref={gridRef}
            onMouseDown={handleMouseDown}
            onMouseLeave={handleMouseLeave}
            onMouseUp={handleMouseUp}
            onMouseMove={handleMouseMove}
          >
            {scholarships.length === 0 ? (
              <p>لا توجد منح مفتوحة حالياً</p>
            ) : (
              scholarships.map(s => {
                const active = favorites.includes(String(s.id));
                const cd = getCountdown(s.deadline);
                return (
                  <div key={s.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between'}}>
                    <div>
                      <button
                        className={`fav-btn ${active ? 'active' : ''}`}
                        aria-label={active ? 'إزالة من المفضلة' : 'إضافة للمفضلة'}
                        onClick={(e) => {
                          if (!user) { setShowAuthModal(true); }
                          else { toggleFav(e, s.id); }
                        }}
                        type="button"
                        style={{ background:'none', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', transition:'transform 0.2s ease' }}
                        onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.85)'}
                        onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
                      >
                        <Heart size={24} color={active ? '#e63946' : '#888888'} fill={active ? '#e63946' : 'transparent'} style={{ transition: 'all 0.3s ease' }} />
                      </button>

                      {s.flag && (s.flag.startsWith('http') || s.flag.includes('/') || s.flag.includes('.')) ? (
                        <img className="card-flag" src={s.flag} alt="flag" />
                      ) : (
                        <span className="card-flag">{s.flag || ''}</span>
                      )}

                      <h3>{s.name}</h3>
                      <p className="country">📍 {s.country}</p>
                      <p className="degree">🎓 {s.degree}</p>
                      <span className="status open">✅ التقديم مفتوح</span>
                      <p className="desc">{s.description || ''}</p>
                      {s.open_date && <p className="deadline">📅 موعد فتح التقديم: {s.open_date}</p>}
                      {cd && <div className={`countdown ${cd.urgent ? 'urgent' : ''}`}>{cd.text}</div>}
                      <p className="deadline">📅 آخر موعد للتقديم: {s.deadline}</p>
                    </div>

                    {/* الأزرار دائماً في الأسفل */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: 'auto' }}>
                      <Link href={`/scholarship/${s.id}`} className="btn-details">تفاصيل المنحة كاملة ←</Link>
                      <a href={s.link} target="_blank" rel="noreferrer" className="btn-details">زيارة الموقع الرسمي ↗</a>
                      <button className="btn-details" onClick={(e) => shareScholarship(e, s.id, s.name)}>📤 شارك المنحة</button>
                    </div>

                  </div>
                );
              })
            )}
          </div>
          <button className="slider-btn next" onClick={() => slideCards(1)}>&#8249;</button>
        </div>
      </section>

      {showBackToTop && (
        <button id="back-to-top" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>↑</button>
      )}

      {/* Auth Modal */}
      {showAuthModal && (
        <div
          style={{ position:'fixed', top:0, left:0, right:0, bottom:0, width:'100vw', height:'100vh', backgroundColor:'rgba(15,23,42,0.5)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:99999 }}
          onClick={() => setShowAuthModal(false)}
        >
          <div
            style={{ position:'relative', width:'90%', maxWidth:'440px', backgroundColor:'var(--card-bg,#ffffff)', borderRadius:'24px', padding:'32px', boxShadow:'0 20px 25px -5px rgba(0,0,0,0.1)', border:'1px solid var(--card-border,#e0e0e0)', textAlign:'center', direction:'rtl' }}
            onClick={(e) => e.stopPropagation()}
          >
            <button onClick={() => setShowAuthModal(false)} style={{ position:'absolute', top:'16px', left:'16px', background:'none', border:'none', fontSize:'22px', cursor:'pointer', color:'var(--text-color,#666)' }}>✕</button>
            <div style={{ width:'80px', height:'80px', margin:'0 auto 24px', backgroundColor:'rgba(255,69,0,0.08)', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', color:'#ff4500', fontSize:'36px' }}>❤️</div>
            <h3 style={{ fontSize:'22px', fontWeight:'900', color:'var(--primary-color,#ff4500)', marginBottom:'12px' }}>المنح المفضلة</h3>
            <p style={{ color:'var(--text-color,#333)', fontSize:'16px', lineHeight:'1.6', marginBottom:'32px' }}>الرجاء تسجيل الدخول للاستفادة من ميزة المنح المفضلة.</p>
            <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
              <button onClick={() => { setShowAuthModal(false); navigate.push('/login'); }} style={{ width:'100%', padding:'14px', backgroundColor:'#ff4500', color:'white', border:'none', borderRadius:'12px', fontSize:'16px', fontWeight:'700', cursor:'pointer' }}>تسجيل الدخول</button>
              <button onClick={() => setShowAuthModal(false)} style={{ width:'100%', padding:'14px', backgroundColor:'transparent', color:'var(--text-color,#666)', border:'2px solid var(--primary-color,#ff4500)', borderRadius:'12px', fontSize:'16px', fontWeight:'700', cursor:'pointer' }}>إلغاء</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}