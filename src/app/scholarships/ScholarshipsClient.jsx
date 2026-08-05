"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useFavorites } from '@/lib/context/FavoritesContext.js';
import { Heart } from 'lucide-react';
import AuthModal from '@/components/AuthModal';
import { getIsOpen } from '@/lib/scholarshipUtils'; 

const ScholarshipCard = ({ s, user, favToggle, favorites }) => {
  const isFav = favorites.includes(String(s.id));
  const [showAuthModal, setShowAuthModal] = useState(false);
  const isOpen = getIsOpen(s); 

  const shareScholarship = (e) => {
    e.preventDefault();
    const url = `${window.location.origin}/scholarship/${s.id}`;
    if (navigator.share) {
      navigator.share({
        title: `منحة ${s.name}`,
        text: `🎓 اكتشف منحة ${s.name} في ${s.country} على منصة مُلم!`,
        url
      });
    } else {
      navigator.clipboard.writeText(url);
      alert('✅ تم نسخ رابط المنحة!');
    }
  };

  return (
    <div className="card">
      <button
        className={`fav-btn ${isFav ? 'active' : ''}`}
        aria-label={isFav ? 'إزالة من المفضلة' : 'إضافة للمفضلة'}
        onClick={(e) => {
          e.preventDefault();
          if (!user) {
            setShowAuthModal(true);
          } else {
            favToggle(s.id);
          }
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
          color={isFav ? '#ff4500' : '#888888'}
          fill={isFav ? '#ff4500' : 'transparent'}
          style={{ transition: 'all 0.3s ease' }}
        />
      </button>
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />

      {s.flag && (s.flag.startsWith('http') || s.flag.includes('/') || s.flag.includes('.')) ? (
        <img className="card-flag" src={s.flag} alt="flag" />
      ) : (
        <span className="card-flag">{s.flag || ''}</span>
      )}
      <h3>{s.name}</h3>
      <p className="country">📍 {s.country}</p>
      <p className="degree">🎓 {s.degree}</p>
      <span className={`status ${isOpen ? 'open' : 'closed'}`}>
        {isOpen ? '✅ التقديم مفتوح' : '🔴 التقديم مغلق'}
      </span>
      <p className="desc">{s.description || ''}</p>
      {s.open_date && <p className="deadline">📅 موعد فتح التقديم: {s.open_date}</p>}
      <p className="deadline">📅 آخر موعد للتقديم: {s.deadline}</p>

      <Link href={`/scholarship/${s.id}`} className="btn-details">تفاصيل المنحة كاملة ←</Link>
      <a href={s.link} target="_blank" rel="noreferrer" className="btn-details">زيارة الموقع الرسمي ↗</a>
      <a
        href="#"
        className="btn-details"
        onClick={(e) => { e.preventDefault(); shareScholarship(e); }}
      >
        شارك المنحة
      </a>
    </div>
  );
};

// دالة مساعدة: تتحقق هل التخصصات المطلوبة (majorSearch) موجودة داخل قائمة تخصصات المنحة (s.majors)
// أي منحة يكون مكتوب فيها "جميع التخصصات" تُطابق تلقائيًا أي عملية بحث عن تخصص
const matchesMajorSearch = (s, majorSearchTerm) => {
  const term = majorSearchTerm.trim().toLowerCase();
  if (!term) return true; // ما فيه بحث عن تخصص، خلي الكل يمر

  if (!Array.isArray(s.majors) || s.majors.length === 0) return false;

  return s.majors.some((m) => {
    const majorLower = String(m).toLowerCase();
    // شرط "جميع التخصصات": تظهر المنحة في أي بحث عن أي تخصص
    if (majorLower.includes('جميع التخصصات')) return true;
    // مطابقة جزئية عادية بين نص البحث واسم التخصص
    return majorLower.includes(term);
  });
};

export default function ScholarshipsClient({ scholarships }) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [degreeFilter, setDegreeFilter] = useState('all');
  const [majorSearch, setMajorSearch] = useState(''); // جديد: فلتر البحث عن تخصص
  const [activeTab, setActiveTab] = useState('all');
  const [showTopBtn, setShowTopBtn] = useState(false);

  const { favorites, toggleFav: favToggle, user } = useFavorites();

  useEffect(() => {
    const handleScroll = () => setShowTopBtn(window.scrollY > 300);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const filteredScholarships = scholarships.filter(s => {
    const searchLower = search.toLowerCase();
    const matchSearch =
      s.name.toLowerCase().includes(searchLower) ||
      s.country.toLowerCase().includes(searchLower);
    const isOpen = getIsOpen(s); // ← جديد: بدل s.open === true || s.open === 'true'
    const matchStatus =
      statusFilter === 'all' ||
      (statusFilter === 'open' ? isOpen : !isOpen);
    const matchDegree =
      degreeFilter === 'all' || s.degree.includes(degreeFilter);
    const matchMajor = matchesMajorSearch(s, majorSearch); // جديد: فلتر التخصص
    return matchSearch && matchStatus && matchDegree && matchMajor;
  });

  const favoriteScholarships = scholarships.filter(s =>
    favorites.includes(String(s.id))
  );

  return (
    <div className="flex flex-col min-h-screen justify-between">
      <div>
        <section className="page-hero">
          <h1>🎓 جميع المنح الدراسية</h1>
          <p>اكتشف المنح المتاحة وتفاصيلها كاملة</p>
        </section>

        <div className="tabs">
          <button
            type="button"
            className={`tab-btn ${activeTab === 'all' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            📋 جميع المنح
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === 'favorites' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('favorites')}
          >
            ❤️ المفضلة
          </button>
        </div>

        {activeTab === 'all' && (
          <div id="all-section">
            <section className="filters filters-compact">
              <input
                type="text"
                placeholder="🔍 ابحث عن منحة..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ fontSize: '0.85rem', padding: '8px 10px' }}
              />
              <input
                type="text"
                placeholder="🎓 ابحث عن تخصص..."
                value={majorSearch}
                onChange={(e) => setMajorSearch(e.target.value)}
                style={{ fontSize: '0.85rem', padding: '8px 10px' }}
              />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{ fontSize: '0.85rem', padding: '8px 10px' }}
              >
                <option value="all">جميع المنح</option>
                <option value="open">التقديم مفتوح</option>
                <option value="closed">التقديم مغلق</option>
              </select>
              <select
                value={degreeFilter}
                onChange={(e) => setDegreeFilter(e.target.value)}
                style={{ fontSize: '0.85rem', padding: '8px 10px' }}
              >
                <option value="all">جميع المراحل</option>
                <option value="بكالوريوس">بكالوريوس</option>
                <option value="ماجستير">ماجستير</option>
                <option value="دكتوراه">دكتوراه</option>
              </select>
            </section>

            <section className="featured">
              <div className="grid">
                {filteredScholarships.map(s => (
                  <ScholarshipCard
                    key={s.id}
                    s={s}
                    user={user}
                    favToggle={favToggle}
                    favorites={favorites}
                  />
                ))}
              </div>
              {filteredScholarships.length === 0 && (
                <p id="no-results">لا توجد منح تطابق بحثك 😔</p>
              )}
            </section>
          </div>
        )}

        {activeTab === 'favorites' && (
          <div id="favorites-section">
            <section className="featured">
              <div className="grid">
                {favoriteScholarships.map(s => (
                  <ScholarshipCard
                    key={s.id}
                    s={s}
                    user={user}
                    favToggle={favToggle}
                    favorites={favorites}
                  />
                ))}
              </div>
              {favoriteScholarships.length === 0 && (
                <p id="no-favorites">
                  لم تضف أي منحة للمفضلة بعد 💔<br />
                  اضغط على القلب في أي منحة لحفظها هنا!
                </p>
              )}
            </section>
          </div>
        )}
      </div>

      {showTopBtn && (
        <button id="back-to-top" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} type="button">
          ↑
        </button>
      )}
    </div>
  );
}