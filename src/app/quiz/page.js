"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { MAJORS_DATA, QUESTIONS_DATA } from './quiz-data';


const rankEmojis = ['🥇','🥈','🥉','4️⃣','5️⃣'];

function Quiz() {
  const [screen, setScreen] = useState('intro');
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({});
  const [calculatedResults, setCalculatedResults] = useState([]);

  const toArabicNum = (n) => {
    const map = {'0':'٠','1':'١','2':'٢','3':'٣','4':'٤','5':'٥','6':'٦','7':'٧','8':'٨','9':'٩'};
    return String(n).replace(/[0-9]/g, c => map[c]);
  };

  const startQuiz = () => {
    setAnswers({});
    setCurrentQ(0);
    setScreen('quiz');
  };

  const toggleOption = (optIndex) => {
    const currentSelected = new Set(answers[currentQ] || []);
    if (currentSelected.has(optIndex)) {
      currentSelected.delete(optIndex);
    } else if (currentSelected.size < 2) {
      currentSelected.add(optIndex);
    }
    setAnswers({ ...answers, [currentQ]: currentSelected });
  };

  const nextQuestion = () => {
    const selected = answers[currentQ] || new Set();
    if (selected.size === 0) return;

    if (currentQ < QUESTIONS_DATA.length - 1) {
      setCurrentQ(currentQ + 1);
    } else {
      processResults();
    }
  };

  const prevQuestion = () => {
    if (currentQ > 0) setCurrentQ(currentQ - 1);
  };

  const processResults = () => {
    const scores = {};
    const maxPerMajor = {};

    Object.keys(MAJORS_DATA).forEach(k => { scores[k] = 0; maxPerMajor[k] = 0; });

    QUESTIONS_DATA.forEach((q, qi) => {
      const sel = answers[qi];
      if (!sel || sel.size === 0) return;
      const weight = sel.size === 1 ? 1.0 : 0.65;
      sel.forEach(ai => {
        Object.entries(q.options[ai].traits).forEach(([k, v]) => {
          if (scores[k] !== undefined) scores[k] += v * weight;
        });
      });
    });

    QUESTIONS_DATA.forEach(q => {
      const bestForThisQuestion = {};
      q.options.forEach(opt => {
        Object.entries(opt.traits).forEach(([k, v]) => {
          if (v > 0) {
            if (bestForThisQuestion[k] === undefined || v > bestForThisQuestion[k]) {
              bestForThisQuestion[k] = v;
            }
          }
        });
      });
      Object.entries(bestForThisQuestion).forEach(([k, v]) => {
        if (maxPerMajor[k] !== undefined) maxPerMajor[k] += v;
      });
    });

    const pcts = {};
    Object.keys(scores).forEach(k => {
      if (maxPerMajor[k] > 0 && scores[k] > 0) {
        pcts[k] = Math.min(100, Math.round((scores[k] / maxPerMajor[k]) * 100));
      } else {
        pcts[k] = 0;
      }
    });

    const finalSorted = Object.entries(pcts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([key, pct]) => ({ key, pct }));

    setCalculatedResults(finalSorted);
    setScreen('results');
  };

  const currentSelected = answers[currentQ] || new Set();
  const progressPct = (currentQ / QUESTIONS_DATA.length) * 100;

  return (
    <main style={{ maxWidth: '820px', margin: '0 auto', padding: '2.5rem 1.25rem 4rem' }}>

      {screen === 'intro' && (
        <div className="intro-screen">
          <span className="intro-icon">🧭</span>
          <h1>اكتشف تخصصك المثالي بعمق</h1>
          <p>
            عشرون سؤالاً نفسياً وعملياً — لا تقيس فقط ما تحبه، بل كيف تفكر تحت الضغط، وكيف تتخذ القرارات، وما الذي يجذب انتباهك.
            يمكنك اختيار إجابة أو إجابتين تعكسان طبيعتك الحقيقية.
          </p>
          <div className="intro-features">
            <div className="intro-feature">⏱️ سبع دقائق تقريباً</div>
            <div className="intro-feature">🧠 أبعاد نفسية وعلمية</div>
            <div className="intro-feature">☑️ اختر حتى إجابتين</div>
            <div className="intro-feature">📊 تحليل منطقي متوازن</div>
          </div>
          <button className="btn-primary" onClick={startQuiz}>ابدأ الاختبار</button>
        </div>
      )}

      {screen === 'quiz' && (
        <div className="quiz-screen">
          <div className="progress-bar-wrap">
            <div className="progress-bar-fill" style={{ width: `${progressPct}%` }}></div>
          </div>

          <div className="question-card">
            <div className="q-step">السؤال {toArabicNum(currentQ + 1)} من {toArabicNum(QUESTIONS_DATA.length)}</div>
            <div className="q-text">{QUESTIONS_DATA[currentQ].text}</div>
            <div className="q-hint">يمكنك اختيار إجابة أو إجابتين إن كانتا تنطبقان عليك بالقدر ذاته</div>

            <div className="options-list">
              {QUESTIONS_DATA[currentQ].options.map((opt, i) => {
                const isSelected = currentSelected.has(i);
                const maxReached = currentSelected.size >= 2;
                return (
                  <button
                    key={i}
                    className={`option-btn ${isSelected ? 'selected' : ''} ${maxReached && !isSelected ? 'dimmed' : ''}`}
                    onClick={() => toggleOption(i)}
                  >
                    <span className="check-box"></span>
                    <span>{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="quiz-nav">
            <button className="btn-primary" style={{ visibility: currentQ === 0 ? 'hidden' : 'visible' }} onClick={prevQuestion}>السابق</button>
            <button className="btn-primary" disabled={currentSelected.size === 0} onClick={nextQuestion}>
              {currentQ === QUESTIONS_DATA.length - 1 ? 'عرض النتائج' : 'التالي'}
            </button>
          </div>
        </div>
      )}

      {screen === 'results' && (
        <div className="results-screen">
          <div className="results-header">
            <span className="trophy">🏆</span>
            <h2>نتائجك جاهزة!</h2>
            <p>بناءً على تحليلك السلوكي الشامل، هذه التخصصات الأنسب لطريقتك في التفكير:</p>
          </div>

          <div className="majors-list">
            {calculatedResults.map(({ key, pct }, i) => {
              const major = MAJORS_DATA[key];
              return (
                <div key={key} className={`major-card ${i === 0 ? 'top-pick' : ''}`}>
                  <div className="major-rank">{rankEmojis[i]}</div>
                  <div className="major-info">
                    <div className="major-field">{major.field}</div>
                    <div className="major-name">{major.name}</div>
                    <div className="major-desc">{major.desc}</div>

                    <div style={{ marginTop: '0.6rem', marginBottom: '0.2rem' }}>
                      <Link
                        href={`/majors?targetMajor=${key}`}
                      >
                        <span>تفاصيل التخصص</span>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M7 17L19 5M19 5H7M19 5V17"/>
                        </svg>
                      </Link>
                    </div>

                    <div className="pct-bar-wrap">
                      <div className="pct-bar-fill" style={{ width: `${pct}%` }}></div>
                    </div>
                  </div>
                  <div className="major-pct-wrap">
                    <span className="major-pct">{pct}%</span>
                    <span className="major-pct-label">توافق</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="results-actions" style={{ display: 'flex', justifyContent: 'center', gap: '20px' }}>
            <button className="btn-primary" onClick={() => alert('سيتم الربط مع صفحة المنح الشاملة لاحقاً')}>استعرض المنح المتاحة</button>
            <button className="btn-primary" onClick={() => setScreen('intro')}>أعد الاختبار</button>
          </div>
        </div>
      )}
    </main>
  );
}

export default Quiz;