"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useFavorites } from '@/lib/context/FavoritesContext.js';
import { Heart } from 'lucide-react';
import AuthModal from '@/components/AuthModal';

const Scholarships = () => {
  const router = useRouter();
  const [scholarships, setScholarships] = useState([]);
  const [loadingScholarships, setLoadingScholarships] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [degreeFilter, setDegreeFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('all');
  const [showTopBtn, setShowTopBtn] = useState(false);

  // جلب البيانات من الـ Context
  const { favorites, toggleFav: favToggle, user, authLoading } = useFavorites();

  // جلب بيانات المنح من ملف JSON
  useEffect(() => {
    fetch('/scholarships.json')
      .then(res => res.json())
      .then(data => {
        setScholarships(data);
        setLoadingScholarships(false);
      })
      .catch(err => {
        console.error('خطأ في جلب بيانات المنح:', err);
        setLoadingScholarships(false);
      });
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setShowTopBtn(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleFav = async (e, id) => {
    // 💡 منع السلوك الافتراضي ومنع انتشار الحدث لأعلى
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
        setShowAuthModal(true);
        return;
    }
    await favToggle(id);
  };

  const shareScholarship = (e, id, name, country) => {
    e.preventDefault(); // 💡 منع القفز لأعلى الصفحة
    const url = `${window.location.origin}/scholarship/${id}`;
    if (navigator.share) {
      navigator.share({ title: `منحة ${name}`, text: `🎓 اكتشف منحة ${name} في ${country} على منصة مُلم!`, url });
    } else {
      navigator.clipboard.writeText(url);
      alert('✅ تم نسخ رابط المنحة!');
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const filteredScholarships = loadingScholarships ? [] : scholarships.filter(s => {
    const searchLower = search.toLowerCase();
    const matchSearch = s.name.toLowerCase().includes(searchLower) || s.country.toLowerCase().includes(searchLower);
    const isOpen = s.open === true || s.open === 'true';
    const matchStatus = statusFilter === 'all' || (statusFilter === 'open' ? isOpen : !isOpen);
    const matchDegree = degreeFilter === 'all' || s.degree.includes(degreeFilter);
    return matchSearch && matchStatus && matchDegree;
  });

  const favoriteScholarships = loadingScholarships 
    ? [] 
    : scholarships.filter(s => favorites.includes(String(s.id)));

  const ScholarshipCard = ({ s, user, favToggle }) => {
    const isFav = favorites.includes(String(s.id));
    const [showAuthModal, setShowAuthModal] = useState(false);

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
        <span className={`status ${(s.open === true || s.open === 'true') ? 'open' : 'closed'}`}>
          {(s.open === true || s.open === 'true') ? '✅ التقديم مفتوح' : '🔴 التقديم مغلق'}
        </span>
        <p className="desc">{s.description || ''}</p>
        {s.open_date && <p className="deadline">📅 موعد فتح التقديم: {s.open_date}</p>}
        <p className="deadline">📅 آخر موعد للتقديم: {s.deadline}</p>
        
        <Link href={`/scholarship/${s.id}`} className="btn-details">تفاصيل المنحة كاملة ←</Link>
        <a href={s.link} target="_blank" rel="noreferrer" className="btn-details">زيارة الموقع الرسمي ↗</a>
        <a 
         href="#" 
         className="btn-details" 
         onClick={(e) => {
         e.preventDefault(); 
         shareScholarship(e, s.id, s.name, s.country); 
  }}
>
  شارك المنحة
</a>
        
        {/*  تعديل: تحويل الرابط إلى button لمنع قفز الصفحة للأعلى */}
      </div>
    );
  };

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
            <section className="filters">
              <input
                type="text"
                placeholder="🔍 ابحث عن منحة..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="all">جميع المنح</option>
                <option value="open">التقديم مفتوح</option>
                <option value="closed">التقديم مغلق</option>
              </select>
              <select value={degreeFilter} onChange={(e) => setDegreeFilter(e.target.value)}>
                <option value="all">جميع المراحل</option>
                <option value="بكالوريوس">بكالوريوس</option>
                <option value="ماجستير">ماجستير</option>
                <option value="دكتوراه">دكتوراه</option>
              </select>
            </section>

            <section className="featured">
              <div className="grid">
                {loadingScholarships ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="skeleton-card">
                      <div className="skeleton-line skeleton-flag"></div>
                      <div className="skeleton-line skeleton-title"></div>
                      <div className="skeleton-line skeleton-text"></div>
                      <div className="skeleton-line skeleton-text wide"></div>
                      <div className="skeleton-line skeleton-btn"></div>
                      <div className="skeleton-line skeleton-btn"></div>
                    </div>
                  ))
                ) : (
                  filteredScholarships.map(s => (
                    <ScholarshipCard key={s.id} s={s} user={user} favToggle={favToggle} />
                  ))
                )}
              </div>
              {!loadingScholarships && filteredScholarships.length === 0 && (
                <p id="no-results">لا توجد منح تطابق بحثك 😔</p>
              )}
            </section>
          </div>
        )}

         {activeTab === 'favorites' && (
          <div id="favorites-section">
            <section className="featured">
              <div className="grid">
                {loadingScholarships ? (
                  <p>جاري تحميل المفضلة... ⏳</p>
                ) : (
                  favoriteScholarships.map(s => (
                    <ScholarshipCard key={s.id} s={s} user={user} favToggle={favToggle} />
                  ))
                )}
              </div>
              {!loadingScholarships && favoriteScholarships.length === 0 && (
                <p id="no-favorites">
                  لم تضف أي منحة للمفضلة بعد 💔<br />اضغط على القلب في أي منحة لحفظها هنا!
                </p>
              )}
            </section>
          </div>
        )}
      </div>

      {showTopBtn && (
        <button id="back-to-top" onClick={scrollToTop}>↑</button>
      )}
    </div>
  );
};

export default Scholarships;