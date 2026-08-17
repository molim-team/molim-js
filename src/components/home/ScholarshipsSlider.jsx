"use client";

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import AuthModal from '@/components/AuthModal';
import { Heart } from 'lucide-react';
import { useFavorites } from '@/lib/context/FavoritesContext';
import { getIsOpen } from '@/lib/scholarshipUtils';

function getCountdown(deadline) {
  if (!deadline) return null;
  const today = new Date();
  const end = new Date(deadline);
  if (isNaN(end.getTime())) return null;
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
  const { favorites, toggleFav: favToggle, user } = useFavorites();
  const gridRef = useRef(null);
  const [isDown, setIsDown] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeftState, setScrollLeftState] = useState(0);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);

  // Client-side re-filter: ensure expired scholarships are never shown
  const openScholarships = scholarships.filter(s => getIsOpen(s));

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
      <section id="available-scholarships" className="open-scholarships-section">
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
            {openScholarships.length === 0 ? (
              <p>لا توجد منح مفتوحة حالياً</p>
            ) : (
              openScholarships.map(s => {
                const active = favorites.includes(String(s.id));
                const cd = getCountdown(s.deadline);
                return (
                  <div key={s.id} className="card">
                    <button
                      className={`fav-btn ${active ? 'active' : ''}`}
                      aria-label={active ? 'إزالة من المفضلة' : 'إضافة للمفضلة'}
                      onClick={(e) => {
                        e.preventDefault();
                        if (!user) { setShowAuthModal(true); }
                        else { toggleFav(e, s.id); }
                      }}
                      type="button"
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'transform 0.2s ease',
                      }}
                    >
                      <Heart
                        size={24}
                        color={active ? '#ff4500' : '#888888'}
                        fill={active ? '#ff4500' : 'transparent'}
                        style={{ transition: 'all 0.3s ease' }}
                      />
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

                    <Link href={`/scholarship/${s.id}`} className="btn-details">تفاصيل المنحة كاملة ←</Link>
                    <a href={s.link} target="_blank" rel="noreferrer" className="btn-details">زيارة الموقع الرسمي ↗</a>
                    <a
                      href="#"
                      className="btn-details"
                      onClick={(e) => { e.preventDefault(); shareScholarship(e, s.id, s.name); }}
                    >
                      شارك المنحة
                    </a>
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

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </>
  );
}