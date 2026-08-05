"use client";

import React, { useState, useEffect, useMemo } from 'react';
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

// ===== منطق البحث عن تخصص =====

const ALL_MAJORS_KEYWORD = 'جميع التخصصات';
// كلمات دلالية تشير لوجود استثناء داخل نص التخصص (مثال: "جميع التخصصات باستثناء الطبية")
const EXCLUSION_KEYWORDS = ['باستثناء', 'ما عدا', 'عدا', 'إلا'];

// ===== تطبيع النصوص العربية =====
// المشكلة اللي كنا نواجهها: "هندسة مدنية" (بدون أل) ما تُطابق "الهندسة المدنية" (بأل التعريف)
// رغم إنه نفس التخصص بالضبط. الحل: نوحّد الحروف المتشابهة، ونشيل "أل" التعريف من بداية كل
// كلمة، ونقارن كلمة-بكلمة بدل النص الكامل عشان ترتيب الكلمات ما يأثر على النتيجة.

// يوحّد الحروف المتشابهة شكلاً (همزات، تاء مربوطة، ياء...) ويشيل التشكيل
const normalizeArabic = (str) =>
  String(str)
    .replace(/[\u064B-\u065F\u0670]/g, '') // إزالة التشكيل
    .replace(/[أإآ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ؤ/g, 'و')
    .replace(/ئ/g, 'ي')
    .replace(/ة/g, 'ه')
    .toLowerCase()
    .trim();

// يشيل "أل" التعريف من بداية الكلمة (لو الكلمة أطول من حرفين بعد الحذف، تفاديًا لحذف خاطئ)
const stripAlPrefix = (word) => (word.startsWith('ال') && word.length > 3 ? word.slice(2) : word);

// يقسّم النص لكلمات بعد التطبيع وحذف "أل" من كل كلمة
const toNormalizedWords = (str) =>
  normalizeArabic(str)
    .split(/[^a-z0-9\u0600-\u06FF]+/)
    .filter(Boolean)
    .map(stripAlPrefix);

// ===== تجذيع خفيف (light stemming) =====
// المشكلة: كلمتين مختلفتين بالمعنى ممكن يشتركوا بنفس أول حرفين/ثلاثة بالعربي
// (مثال: "الطب" Medicine و"الطبيعية" Natural كلاهما يبدأ بـ "طب")، فمطابقة الـ
// substring البسيطة كانت تعتبرهم متطابقين غلط. الحل: نشيل اللواحق الشائعة من
// نهاية الكلمة (ية، ات، ين، ون، ها، ه، ي) عشان نوصل لجذر أدق، مثل:
// "الطبية" (طب+ية) ← جذرها "طب"  |  "الطبيعية" (طبيع+ية) ← جذرها "طبيع" (مختلف)
const STEM_SUFFIXES = ['يه', 'ات', 'ين', 'ون', 'ها', 'ه', 'ي'];
const stemWord = (word) => {
  for (const suf of STEM_SUFFIXES) {
    if (word.length - suf.length >= 2 && word.endsWith(suf)) {
      return word.slice(0, -suf.length);
    }
  }
  return word;
};

// يقرر هل كلمتان (من التخصص ومن البحث) تُعتبران متطابقتين
// - لو جذر كلمة البحث قصير (أقل من 4 حروف، زي "طب")، نطلب تطابق تام للجذر
//   عشان نتفادى تصادم الكلمات القصيرة المشتركة بالحروف الأولى بس (زي "طب"/"طبيعة")
// - لو جذر كلمة البحث 4 حروف فأكثر، نسمح بمطابقة جزئية (prefix) بالاتجاهين
//   عشان الكتابة الجزئية ("قانو" مثلاً) تظل شغالة
const wordsMatch = (majorWord, termWord) => {
  const majorStem = stemWord(majorWord);
  const termStem = stemWord(termWord);
  if (termStem.length >= 4) {
    return majorStem.startsWith(termStem) || termStem.startsWith(majorStem);
  }
  return majorStem === termStem;
};

// قائمة تخصصات مشهورة، مكتوبة يدويًا ونظيفة — تُستخدم فقط لعرض الاقتراحات (autocomplete)
// بمربع البحث عن تخصص، حتى لا تظهر نصوص خام طويلة من بيانات المنح كما كانت تظهر سابقًا.
// ملاحظة مهمة: هذي القائمة لا تؤثر إطلاقًا على منطق المطابقة (matchesMajorSearch) —
// المستخدم يقدر يكتب أي تخصص يدويًا حتى لو مو موجود هنا، وبيشتغل بنفس القوانين بالضبط.
const COMMON_MAJORS = [
  'الطب',
  'طب الأسنان',
  'الصيدلة',
  'التمريض',
  'العلوم الطبية والصحية',
  'هندسة مدنية',
  'هندسة كهربائية',
  'هندسة ميكانيكية',
  'هندسة صناعية',
  'هندسة حاسب',
  'علوم حاسب',
  'تقنية المعلومات',
  'هندسة البرمجيات',
  'ذكاء اصطناعي',
  'امن سبراني',
  'إدارة أعمال',
  'المحاسبة',
  'التمويل',
  'التسويق',
  'القانون',
  'الاقتصاد',
  'العلوم السياسية',
  'العلاقات الدولية',
  'الزراعة',
  'إدارة السياحة والفنادق',
  'العمارة',
  'التصميم',
  'الإعلام',
  'الدراسات الإسلامية',
  'الشريعة',
  'اللغة الإنجليزية',
  'الترجمة',
  'علم النفس',
  'العلوم الاجتماعية',
  'العلوم التربوية',
];

// يبني قائمة موحّدة بكل التخصصات "المحددة فعليًا" الموجودة عبر كل المنح
// (يستثني عبارات "جميع التخصصات" لأنها مش اسم تخصص حقيقي)
// تُستخدم كـ "قاموس مرجعي" للتحقق إن الكلمة المكتوبة تشبه تخصص حقيقي
const buildKnownMajors = (scholarships) => {
  const set = new Set();
  scholarships.forEach((s) => {
    if (Array.isArray(s.majors)) {
      s.majors.forEach((m) => {
        const text = String(m).trim();
        if (text && !text.toLowerCase().includes(ALL_MAJORS_KEYWORD)) {
          set.add(text);
        }
      });
    }
  });
  return Array.from(set);
};

// يتحقق هل الكلمة المكتوبة موجودة داخل الجزء "المستثنى" من نص التخصص
// مثال: "جميع التخصصات باستثناء الطبية" + term="طب" → true (مستثناة)
const isExcludedFromAllMajors = (majorText, termWords) => {
  const normalizedMajorText = normalizeArabic(majorText);
  for (const kw of EXCLUSION_KEYWORDS) {
    const kwNormalized = normalizeArabic(kw);
    const idx = normalizedMajorText.indexOf(kwNormalized);
    if (idx !== -1) {
      const excludedWords = toNormalizedWords(normalizedMajorText.slice(idx));
      if (termWords.every((tw) => excludedWords.some((ew) => wordsMatch(ew, tw)))) {
        return true;
      }
    }
  }
  return false;
};

// دالة مساعدة رئيسية: تتحقق هل تخصصات المنحة (s.majors) تطابق نص البحث
// - المقارنة تتم على مستوى الكلمات وبعد تطبيع النصوص، عشان "هندسة مدنية" تطابق
//   "الهندسة المدنية" رغم اختلاف "أل" التعريف
// - منحة فيها "جميع التخصصات" تطابق أي بحث، إلا لو:
//     (أ) الكلمة مذكورة صراحة داخل جزء استثناء ("باستثناء الطبية" مثلاً)
//     (ب) الكلمة المكتوبة مش شبيهة بأي تخصص حقيقي موجود بقاعدة البيانات (لتفادي كلام عشوائي)
const matchesMajorSearch = (s, majorSearchTerm, knownMajorsWordSets) => {
  const termWords = toNormalizedWords(majorSearchTerm);
  if (termWords.length === 0) return true; // ما فيه بحث عن تخصص، خلي الكل يمر

  if (!Array.isArray(s.majors) || s.majors.length === 0) return false;

  return s.majors.some((m) => {
    const majorText = String(m);
    const majorWords = toNormalizedWords(majorText);
    const isAllMajors = normalizeArabic(majorText).includes(normalizeArabic(ALL_MAJORS_KEYWORD));

    if (isAllMajors) {
      if (isExcludedFromAllMajors(majorText, termWords)) return false;
      // اعتبرها "تشمل الجميع" فقط لو الكلمة تشبه تخصص حقيقي موجود عندنا
      return knownMajorsWordSets.some((kmWords) =>
        termWords.every((tw) => kmWords.some((kw) => wordsMatch(kw, tw)))
      );
    }

    // مطابقة كل كلمة من كلمات البحث داخل كلمات اسم التخصص (بعد التطبيع والتجذيع)
    return termWords.every((tw) => majorWords.some((mw) => wordsMatch(mw, tw)));
  });
};

export default function ScholarshipsClient({ scholarships }) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [degreeFilter, setDegreeFilter] = useState('all');
  const [majorSearch, setMajorSearch] = useState(''); // جديد: فلتر البحث عن تخصص
  const [showMajorSuggestions, setShowMajorSuggestions] = useState(false); // إظهار/إخفاء قائمة اقتراحات التخصصات
  const [activeTab, setActiveTab] = useState('all');
  const [showTopBtn, setShowTopBtn] = useState(false);

  const { favorites, toggleFav: favToggle, user } = useFavorites();

  // قاموس التخصصات الحقيقية المستخرج من كل المنح (يُحسب مرة وحدة فقط)
  const knownMajors = useMemo(() => buildKnownMajors(scholarships), [scholarships]);
  const knownMajorsWordSets = useMemo(
    () => knownMajors.map((m) => toNormalizedWords(m)),
    [knownMajors]
  );

  // التخصصات المقترحة بالقائمة المنسدلة: تتفلتر حسب اللي مكتوب، وتُحدّد بـ 8 عناصر كحد أقصى
  const filteredMajorSuggestions = useMemo(() => {
    const term = majorSearch.trim().toLowerCase();
    const list = term
      ? COMMON_MAJORS.filter((m) => m.toLowerCase().includes(term))
      : COMMON_MAJORS;
    return list.slice(0, 8);
  }, [majorSearch]);

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
    const matchMajor = matchesMajorSearch(s, majorSearch, knownMajorsWordSets); // جديد: فلتر التخصص
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
              <div style={{ position: 'relative', flex: '1 1 180px', minWidth: '140px' }}>
                <input
                  type="text"
                  placeholder="ابحث عن تخصص..."
                  value={majorSearch}
                  onChange={(e) => setMajorSearch(e.target.value)}
                  onFocus={() => setShowMajorSuggestions(true)}
                  onBlur={() => setShowMajorSuggestions(false)}
                  style={{ fontSize: '0.85rem', padding: '8px 10px', width: '100%', boxSizing: 'border-box' }}
                />
                {showMajorSuggestions && filteredMajorSuggestions.length > 0 && (
                  <ul
                    style={{
                      position: 'absolute',
                      top: 'calc(100% + 4px)',
                      right: 0,
                      left: 0,
                      zIndex: 30,
                      margin: 0,
                      padding: '6px 0',
                      listStyle: 'none',
                      background: '#fff',
                      border: '1px solid #ddd',
                      borderRadius: '10px',
                      boxShadow: '0 6px 16px rgba(0,0,0,0.15)',
                      maxHeight: '220px',
                      overflowY: 'auto',
                    }}
                  >
                    {filteredMajorSuggestions.map((m, i) => (
                      <li
                        key={i}
                        // onMouseDown بدل onClick عشان نمنع الـ blur من إخفاء القائمة قبل ما يسجل الاختيار
                        onMouseDown={(e) => {
                          e.preventDefault();
                          setMajorSearch(m);
                          setShowMajorSuggestions(false);
                        }}
                        style={{
                          padding: '9px 14px',
                          fontSize: '0.85rem',
                          cursor: 'pointer',
                          textAlign: 'right',
                          color: '#333',
                        }}
                      >
                        {m}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
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