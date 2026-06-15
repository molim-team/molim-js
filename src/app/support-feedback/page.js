"use client";

import { useState } from "react";
import { submitFeedbackServer } from "@/app/actions/feedbackAction"; 
import "./feedback.css";

const speedOptions = ["ممتاز", "مقبول", "بطيئ"];
const clarityOptions = [
  "واضحه وشفافه تماماً.",
  "متوسطة الوضوح.",
  "غير واضحة / لم تحل مشكلتي",
];
const behaviorOptions = [
  "محترف ومتعاون جداً.",
  "عادي/ مقبول.",
  "غير متعاون",
];

const starLabels = {
  1: "سيئ جداً",
  2: "ضعيف",
  3: "متوسط",
  4: "جيد جداً",
  5: "ممتاز جداً",
};

function RadioGroup({ name, question, options, value, onChange }) {
  return (
    <fieldset className="feedback-group">
      <legend className="feedback-legend">{question}</legend>
      <div className="feedback-options">
        {options.map((option) => {
          const isSelected = value === option;
          return (
            <label
              key={option}
              className={`feedback-option ${isSelected ? "selected" : ""}`}
            >
              <span>{option}</span>
              <input
                type="radio"
                name={name}
                value={option}
                checked={isSelected}
                onChange={() => onChange(option)}
              />
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

function StarRating({ value, onChange }) {
  const [hovered, setHovered] = useState(0);

  return (
    <fieldset className="feedback-group">
      <legend className="feedback-legend">
        بشكل عام، ما مدى رضاك عن تجربة الدعم الفني في مُلِم؟
      </legend>
      <div className="feedback-stars">
        {[5, 4, 3, 2, 1].map((star) => {
          const active = (hovered || value) >= star;
          return (
            <button
              key={star}
              type="button"
              onClick={() => onChange(star)}
              onMouseEnter={() => setHovered(star)}
              onMouseLeave={() => setHovered(0)}
              aria-label={`${star} نجوم - ${starLabels[star]}`}
              className="feedback-star-btn"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill={active ? "#ff4500" : "none"}
                stroke={active ? "#ff4500" : "currentColor"}
                strokeWidth="1.5"
                style={{ color: active ? "#ff4500" : undefined }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.98 21.539a.562.562 0 0 1-.84-.61l1.285-5.385a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z"
                />
              </svg>
            </button>
          );
        })}
      </div>
      {(hovered || value) > 0 && (
        <p className="feedback-star-label">{starLabels[hovered || value]}</p>
      )}
    </fieldset>
  );
}

export default function SupportFeedbackPage() {
  const [speedRating, setSpeedRating] = useState("");
  const [clarityRating, setClarityRating] = useState("");
  const [behaviorRating, setBehaviorRating] = useState("");
  const [overallStars, setOverallStars] = useState(0);
  const [suggestions, setSuggestions] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!speedRating || !clarityRating || !behaviorRating || overallStars === 0) {
      setError("من فضلك جاوب على كل الأسئلة المطلوبة قبل الإرسال.");
      return;
    }

    setError("");
    setSubmitting(true);

    try {
      // التعديل هنا: إرسال البيانات للباكند والتحقق من النتيجة
      const result = await submitFeedbackServer({
        speedRating,
        clarityRating,
        behaviorRating,
        overallStars,
        suggestions,
      });

      if (result.success) {
        setSubmitted(true);
      } else {
        setError(result.error || "حدث خطأ أثناء إرسال تقييمك. حاول مرة أخرى.");
      }
    } catch (err) {
      console.error("Error submitting support feedback:", err);
      setError("حدث خطأ غير متوقع أثناء إرسال تقييمك. حاول مرة أخرى.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="feedback-page">
      <div className="feedback-card">
        {submitted ? (
          <div className="feedback-thanks">
            <div className="feedback-thanks-icon">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>
            <h1 className="feedback-thanks-title">شكراً لك!</h1>
            <p className="feedback-thanks-text">
              تم استقبال تقييمك بنجاح ومساعدتنا في تطوير خدماتنا.
            </p>
          </div>
        ) : (
          <>
            <h1 className="feedback-title">
              لأن هدفنا نكون مُلِمين بكل احتياجاتك ومساعدتك بأفضل شكل، يهمنا نعرف
              تجربتك مع الدعم الفني.
            </h1>
            <p className="feedback-subtitle">
              لن يستغرق هذا التقييم أكثر من دقيقة واحدة.
            </p>

            <form onSubmit={handleSubmit}>
              <RadioGroup
                name="speedRating"
                question="كيف تقيم سرعة الاستجابة لطلبك؟"
                options={speedOptions}
                value={speedRating}
                onChange={setSpeedRating}
              />

              <RadioGroup
                name="clarityRating"
                question="مدى وضوح ودقة الإجابة أو الحل المقدم لك؟"
                options={clarityOptions}
                value={clarityRating}
                onChange={setClarityRating}
              />

              <RadioGroup
                name="behaviorRating"
                question="أسلوب وتعامل ممثل الدعم الفني كان؟"
                options={behaviorOptions}
                value={behaviorRating}
                onChange={setBehaviorRating}
              />

              <StarRating value={overallStars} onChange={setOverallStars} />

              <div className="feedback-group">
                <label htmlFor="suggestions" className="feedback-legend">
                  كلمة، ملاحظة، أو مقترح لتطوير الدعم الفني؟
                </label>
                <textarea
                  id="suggestions"
                  rows={4}
                  value={suggestions}
                  onChange={(e) => setSuggestions(e.target.value)}
                  placeholder="اكتب مقترحك أو ملاحظتك هنا (اختياري)..."
                  className="feedback-textarea"
                />
              </div>

              {error && <p className="feedback-error">{error}</p>}

              <button type="submit" disabled={submitting} className="feedback-submit">
                {submitting && (
                  <svg
                    className="feedback-spinner"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle
                      opacity="0.25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      opacity="0.75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                    />
                  </svg>
                )}
                {submitting ? "جارٍ الإرسال..." : "إرسال التقييم"}
              </button>
            </form>
          </>
        )}
      </div>
    </main>
  );
}