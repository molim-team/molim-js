"use client";

import { useState } from "react";
import "./apply.css";

const skillLabels = {
  1: "سيئ",
  2: "مقبول",
  3: "جيد",
  4: "جيد جداً",
  5: "ممتاز",
};

export default function SupportApplyPage() {
  const [currentStep, setCurrentStep] = useState(1);

  const [fullName, setFullName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [nationality, setNationality] = useState("");
  const [residence, setResidence] = useState("");
  const [email, setEmail] = useState("");
  const [telegram, setTelegram] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [joinReason, setJoinReason] = useState("");
  const [freeTime, setFreeTime] = useState("");

  const [arabicSkill, setArabicSkill] = useState(0);
  const [writtenCommSkill, setWrittenCommSkill] = useState(0);
  const [explainingSkill, setExplainingSkill] = useState(0);

  const [scenario1, setScenario1] = useState("");
  const [scenario2, setScenario2] = useState("");
  const [scenario3, setScenario3] = useState("");
  const [scenario4, setScenario4] = useState("");
  const [scenario5, setScenario5] = useState("");

  const [agreeEthics, setAgreeEthics] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [agreeTraining, setAgreeTraining] = useState(false);

  const [touchedStep1, setTouchedStep1] = useState(false);
  const [touchedStep2, setTouchedStep2] = useState(false);
  const [touchedStep3, setTouchedStep3] = useState(false);

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleNextToStep2 = () => {
    setTouchedStep1(true);
    if (!fullName || !birthDate || !nationality || !residence || !email || !telegram || !joinReason || !freeTime) {
      setError("من فضلك قم بتعبئة جميع الحقول الإلزامية الملونة بالأحمر.");
      return;
    }
    setError("");
    setCurrentStep(2);
  };

  const handleNextToStep3 = () => {
    setTouchedStep2(true);
    if (arabicSkill === 0 || writtenCommSkill === 0 || explainingSkill === 0) {
      setError("من فضلك قيم مهاراتك في جميع النقاط المطلوبة.");
      return;
    }
    setError("");
    setCurrentStep(3);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouchedStep3(true);

    if (!scenario1 || !scenario2 || !scenario3 || !scenario4 || !scenario5) {
      setError("يرجى الإجابة على جميع السيناريوهات المطروحة قبل الإرسال.");
      return;
    }

    if (!agreeEthics || !agreePrivacy || !agreeTraining) {
      setError("يرجى الموافقة على جميع التعهدات والشروط للمتابعة.");
      return;
    }

    setError("");
    setSubmitting(true);

    try {
      const response = await fetch("/api/airtable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName, birthDate, nationality, residence, email, telegram, whatsapp, joinReason, freeTime,
          arabicSkill: skillLabels[arabicSkill], 
          writtenCommSkill: skillLabels[writtenCommSkill], 
          explainingSkill: skillLabels[explainingSkill],
          scenario1, scenario2, scenario3, scenario4, scenario5
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setSubmitted(true);
      } else {
        setError(result.error || "حدث خطأ أثناء إرسال طلبك. حاول مرة أخرى.");
      }
    } catch (err) {
      console.error("Error sending application:", err);
      setError("حدث خطأ غير متوقع. حاول مرة أخرى لاحقاً.");
    } finally {
      setSubmitting(false);
    }
  };

  const SkillRating = ({ question, value, onChange, hasError }) => {
    return (
      <div className={`feedback-group ${hasError ? "field-invalid" : ""}`} style={{ padding: hasError ? "0.5rem" : "0", borderRadius: "0.75rem" }}>
        <label className="feedback-legend">{question} *</label>
        <div style={{ display: "flex", gap: "0.5rem", flexDirection: "row", flexWrap: "wrap", marginTop: "0.5rem" }}>
          {[1, 2, 3, 4, 5].map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => onChange(num)}
              className={`feedback-option ${value === num ? "selected" : ""}`}
              style={{ flex: "1", padding: "0.75rem", textAlign: "center", justifyContent: "center", margin: 0 }}
            >
              {skillLabels[num]}
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <main className="feedback-page">
      <div className="feedback-card">
        
        {submitted ? (
          <div className="feedback-thanks">
            <div className="feedback-thanks-icon" style={{ background: "#22c55e", boxShadow: "0 8px 20px rgba(34, 197, 94, 0.3)" }}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>
            <h1 className="feedback-thanks-title">تم الإرسال بنجاح!</h1>
            <p className="feedback-thanks-text" style={{ fontSize: "0.9rem", color: "#64748b", marginTop: "0.5rem" }}>
              شكراً لاهتمامك بالتطوع مع فريق ملم، سنتواصل معك قريباً.
            </p>
          </div>
        ) : (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "2rem", borderBottom: "2px solid #f1f5f9", paddingBottom: "1rem" }}>
              <span style={{ fontWeight: currentStep === 1 ? "800" : "500", color: currentStep === 1 ? "#ff4500" : "#94a3b8" }}>1. البيانات الشخصية</span>
              <span style={{ fontWeight: currentStep === 2 ? "800" : "500", color: currentStep === 2 ? "#ff4500" : "#94a3b8" }}>2. المهارات</span>
              <span style={{ fontWeight: currentStep === 3 ? "800" : "500", color: currentStep === 3 ? "#ff4500" : "#94a3b8" }}>3. اختبار السيناريوهات</span>
            </div>

            <form onSubmit={handleSubmit}>
              
              {currentStep === 1 && (
                <div className="step-container">
                  <h2 className="feedback-title" style={{ textAlign: "right" }}>المعلومات الشخصية</h2>
                  <p className="feedback-subtitle" style={{ textAlign: "right" }}>يرجى إدخال معلوماتك الأساسية بدقة.</p>

                  <div className="feedback-group">
                    <label className="feedback-legend">الاسم الثلاثي *</label>
                    <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="أدخل اسمك الثلاثي" className={`feedback-textarea ${touchedStep1 && !fullName ? "input-invalid" : ""}`} style={{ height: "auto", padding: "0.85rem 1rem" }} />
                  </div>

                  <div className="feedback-group">
                    <label className="feedback-legend">تاريخ الميلاد *</label>
                    <input type="date" max="2010-12-31" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} className={`feedback-textarea ${touchedStep1 && !birthDate ? "input-invalid" : ""}`} style={{ height: "auto", padding: "0.85rem 1rem", direction: "rtl" }} />
                  </div>

                  <div className="feedback-group">
                    <label className="feedback-legend">الجنسية *</label>
                    <input type="text" value={nationality} onChange={(e) => setNationality(e.target.value)} placeholder="مثال: يمني" className={`feedback-textarea ${touchedStep1 && !nationality ? "input-invalid" : ""}`} style={{ height: "auto", padding: "0.85rem 1rem" }} />
                  </div>

                  <div className="feedback-group">
                    <label className="feedback-legend">مكان السكن الحالي *</label>
                    <input type="text" value={residence} onChange={(e) => setResidence(e.target.value)} placeholder=" الدولة" className={`feedback-textarea ${touchedStep1 && !residence ? "input-invalid" : ""}`} style={{ height: "auto", padding: "0.85rem 1rem" }} />
                  </div>

                  <div className="feedback-group">
                    <label className="feedback-legend">البريد الإلكتروني *</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="example@mail.com" className={`feedback-textarea ${touchedStep1 && !email ? "input-invalid" : ""}`} style={{ height: "auto", padding: "0.85rem 1rem", direction: "ltr", textAlign: "right" }} />
                  </div>

                  <div className="feedback-group">
                    <label className="feedback-legend">حساب تيليجرام (Username) *</label>
                    <input type="text" value={telegram} onChange={(e) => setTelegram(e.target.value)} placeholder="@username" className={`feedback-textarea ${touchedStep1 && !telegram ? "input-invalid" : ""}`} style={{ height: "auto", padding: "0.85rem 1rem", direction: "ltr", textAlign: "right" }} />
                  </div>

                  <div className="feedback-group">
                    <label className="feedback-legend">رقم الواتساب (اختياري)</label>
                    <input type="tel" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="مع رمز الدولة :+967" className="feedback-textarea" style={{ height: "auto", padding: "0.85rem 1rem", direction: "ltr", textAlign: "right" }} />
                  </div>

                  <div className="feedback-group">
                    <label className="feedback-legend">ما هو سبب رغبتك في الانضمام لفريق مُلِم؟ *</label>
                    <textarea rows={3} value={joinReason} onChange={(e) => setJoinReason(e.target.value)} placeholder="اكتب سبب انضمامك وشغفك هنا..." className={`feedback-textarea ${touchedStep1 && !joinReason ? "input-invalid" : ""}`} />
                  </div>

                  <div className="feedback-group">
                    <label className="feedback-legend">أوقات التفرغ المناسبة لك للعمل التطوعي *</label>
                    <input type="text" value={freeTime} onChange={(e) => setFreeTime(e.target.value)} placeholder="مثال: الفترة المسائية، أيام الويكند، إلخ" className={`feedback-textarea ${touchedStep1 && !freeTime ? "input-invalid" : ""}`} style={{ height: "auto", padding: "0.85rem 1rem" }} />
                  </div>

                  {error && <p className="feedback-error">{error}</p>}
                  <button type="button" onClick={handleNextToStep2} className="feedback-submit">الانتـقال لقسم المهارات ←</button>
                </div>
              )}

              {currentStep === 2 && (
                <div className="step-container">
                  <h2 className="feedback-title" style={{ textAlign: "right" }}>قسم المهارات والاختبار السريع</h2>
                  <p className="feedback-subtitle" style={{ textAlign: "right" }}>يرجى تقييم مهاراتك الذاتية بكل شفافية.</p>

                  <SkillRating question="ماهي خبرتك بالتواصل باللغة العربية الفصحى؟" value={arabicSkill} onChange={setArabicSkill} hasError={touchedStep2 && arabicSkill === 0} />
                  <SkillRating question="كيف تقيِّم مهاراتك في التواصل الكتابي مع المستفيدين؟" value={writtenCommSkill} onChange={setWrittenCommSkill} hasError={touchedStep2 && writtenCommSkill === 0} />
                  <SkillRating question="كيف تقيِّم قدرتك على شرح المعلومات بطريقة بسيطة وواضحة؟" value={explainingSkill} onChange={setExplainingSkill} hasError={touchedStep2 && explainingSkill === 0} />

                  {error && <p className="feedback-error">{error}</p>}
                  <div style={{ display: "flex", gap: "1rem", marginTop: "2rem" }}>
                    <button type="button" onClick={() => setCurrentStep(1)} className="feedback-submit" style={{ background: "#cbd5e1", color: "#334155" }}>رجوع</button>
                    <button type="button" onClick={handleNextToStep3} className="feedback-submit">الذهاب للسيناريوهات ←</button>
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="step-container">
                  <h2 className="feedback-title" style={{ textAlign: "right" }}>سيناريوهات قياس ردة الفعل</h2>
                  <p className="feedback-subtitle" style={{ textAlign: "right" }}>كيف ستتصرف في المواقف التالية بصفتك عضواً في فريق مُلِم؟</p>

                  <div className="feedback-group">
                    <label className="feedback-legend">1. واجهتك مشكلة لأول مرة ولا تعرف حلها، ماذا ستفعل؟ *</label>
                    <textarea rows={3} value={scenario1} onChange={(e) => setScenario1(e.target.value)} placeholder="اكتب تصرفك هنا..." className={`feedback-textarea ${touchedStep3 && !scenario1 ? "input-invalid" : ""}`} />
                  </div>

                  <div className="feedback-group">
                    <label className="feedback-legend">2. قدمت معلومة للمستفيد، ثم اكتشفت أنها خاطئة. ماذا ستفعل؟ *</label>
                    <textarea rows={3} value={scenario2} onChange={(e) => setScenario2(e.target.value)} placeholder="اكتب تصرفك هنا..." className={`feedback-textarea ${touchedStep3 && !scenario2 ? "input-invalid" : ""}`} />
                  </div>

                  <div className="feedback-group">
                    <label className="feedback-legend">3. لاحظت أن أحد أعضاء الفريق يرد على المستفيدين بطريقة غير مناسبة، ماذا ستفعل؟ *</label>
                    <textarea rows={3} value={scenario3} onChange={(e) => setScenario3(e.target.value)} placeholder="اكتب تصرفك هنا..." className={`feedback-textarea ${touchedStep3 && !scenario3 ? "input-invalid" : ""}`} />
                  </div>

                  <div className="feedback-group">
                    <label className="feedback-legend">4. طلب منك شخص معلومات أو بيانات خاصة بأحد المستفيدين، ماذا سيكون تصرفك؟ *</label>
                    <textarea rows={3} value={scenario4} onChange={(e) => setScenario4(e.target.value)} placeholder="اكتب تصرفك هنا..." className={`feedback-textarea ${touchedStep3 && !scenario4 ? "input-invalid" : ""}`} />
                  </div>

                  <div className="feedback-group">
                    <label className="feedback-legend">5. إذا قُبلت في الفريق ثم شعرت بعد شهر أنك لا تستطيع الالتزام، ماذا ستفعل؟ *</label>
                    <textarea rows={3} value={scenario5} onChange={(e) => setScenario5(e.target.value)} placeholder="اكتب تصرفك هنا..." className={`feedback-textarea ${touchedStep3 && !scenario5 ? "input-invalid" : ""}`} />
                  </div>

                  <div className="feedback-group" style={{ background: "#f8fafc", padding: "1.25rem", borderRadius: "1rem", border: "1px solid #e2e8f0", marginTop: "2rem" }}>
                    <label className="feedback-legend" style={{ color: "#0f172a", marginBottom: "1.25rem" }}>التعهد والإقرار الأكاديمي *</label>
                    
                    <label style={{ display: "flex", alignItems: "center", gap: "0.75rem", cursor: "pointer", marginBottom: "1rem", fontSize: "0.95rem" }}>
                      <input type="checkbox" checked={agreeEthics} onChange={(e) => setAgreeEthics(e.target.checked)} style={{ width: "1.2rem", height: "1.2rem", accentColor: "#ff4500" }} />
                      <span>ألتزم بأخلاقيات العمل التطوعي.</span>
                    </label>

                    <label style={{ display: "flex", alignItems: "center", gap: "0.75rem", cursor: "pointer", marginBottom: "1rem", fontSize: "0.95rem" }}>
                      <input type="checkbox" checked={agreePrivacy} onChange={(e) => setAgreePrivacy(e.target.checked)} style={{ width: "1.2rem", height: "1.2rem", accentColor: "#ff4500" }} />
                      <span>أتعهد بالمحافظة على سرية البيانات.</span>
                    </label>

                    <label style={{ display: "flex", alignItems: "center", gap: "0.75rem", cursor: "pointer", fontSize: "0.95rem" }}>
                      <input type="checkbox" checked={agreeTraining} onChange={(e) => setAgreeTraining(e.target.checked)} style={{ width: "1.2rem", height: "1.2rem", accentColor: "#ff4500" }} />
                      <span>أوافق على حضور التدريب.</span>
                    </label>
                  </div>

                  {error && <p className="feedback-error">{error}</p>}
                  <div style={{ display: "flex", gap: "1rem", marginTop: "2rem" }}>
                    <button type="button" onClick={() => setCurrentStep(2)} className="feedback-submit" style={{ background: "#cbd5e1", color: "#334155" }}>رجوع</button>
                    <button type="submit" disabled={submitting} className="feedback-submit">
                      {submitting && (
                        <svg className="feedback-spinner" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <circle opacity="0.25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path opacity="0.75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                        </svg>
                      )}
                      {submitting ? "جاري الإرسال الآن..." : "إرسال طلب التطوع"}
                    </button>
                  </div>
                </div>
              )}

            </form>
          </>
        )}
      </div>
    </main>
  );
}
