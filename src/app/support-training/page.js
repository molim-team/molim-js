"use client";

import { useState } from "react";
import "./support-training.css";

const trainingModules = [
  {
    id: 1,
    title: "١. أساسيات الدعم الفني",
    icon: "🎯",
    content: (
      <div className="training-section">
        <h3>قواعد  في التعامل مع المستفيدين</h3>
        <p>بصفتك ممثلاً لمنصة مُلِم، فإن أسلوبك يعكس قيم الفريق بالكامل. إليك أهم الركائز:</p>
        <ul className="training-list">
          <li><strong>الترحيب واللباقة:</strong> ابدأ دائماً بتحية رسمية مستخدماً أمر \ترحيب    .</li>
          <li><strong>السرعة والدقة:</strong> أجب بناءً على الحقائق والروابط الرسمية المعتمدة     .</li>
          <li><strong>سعة الصدر:</strong> تعامل مع جميع استفسارات الطلاب باحترام وتقدير، مهما كان السؤال بسيطاً أو متكرراً.</li>
          <li><strong>الأمان والسرية:</strong> يُمنع تماماً مشاركة بيانات الطلاب، أو وثائقهم، أو معدلاتهم مع أي طرف خارج الإدارة المعنية.</li>
        </ul>
      </div>
    )
  },
  {
    id: 2,
    title: "٢. السيناريوهات العملية",
    icon: "💬",
    content: (
      <div className="training-section">
        <h3>أمثلة حية لكيفية الرد الذكي</h3>
        <p>إليك دليلك العملي للتعامل مع المواقف الشائعة (الرد الصحيح مقابل الرد الخاطئ):</p>
        
        <div className="scenario-box invalid-box">
          <h4>❌ موقف: مستفيد يسأل عن حل مشكلة تقنية لا تعرفها</h4>
          <p className="scenario-text"><strong>الرد الخاطئ:</strong> "والله ما أدري، اسأل أحد ثاني بالجروب أو انتظر المشرف."</p>
        </div>
        
        <div className="scenario-box valid-box">
          <h4>✅ الرد الاحترافي المعتمد:</h4>
          <p className="scenario-text">"أهلاً بك يا غالي، سعداء بخدمتك. سأقوم برفع مشكلتك التقنية حالاً للقسم المختص بالفريق للمراجعة، وسيتم الرد عليك هنا فور حلها مباشرة. شكراً لصبرك معنا."</p>
        </div>

        <div className="scenario-box invalid-box" style={{ marginTop: "1.5rem" }}>
          <h4>❌ موقف: مستفيد يطلب بيانات تواصل مع طالب آخر انقبل في منحة</h4>
          <p className="scenario-text"><strong>الرد الخاطئ:</strong> "أبشر، هذا حساب التيلجرام حقه كلمه بخصوص المنحة."</p>
        </div>
        
        <div className="scenario-box valid-box">
          <h4>✅ الرد الاحترافي المعتمد:</h4>
          <p className="scenario-text">"مرحباً بك، نعتذر منك بشدة، فسياسة الخصوصية الصارمة في فريق مُلِم تحظر مشاركة أي بيانات شخصية أو حسابات خاصة بالطلاب والمستفيدين حرصاً على سرية المعلومات وأمانها. يمكنك طرح استفسارك هنا وسنجيبك بكل سرور."</p>
        </div>
      </div>
    )
  },
  {
    id: 3,
    title: "٣. اختبار الجاهزية",
    icon: "📝",
    content: (
      <div className="training-section">
        <h3>اختبر معلوماتك التدريبية</h3>
        <p>أجب على الأسئلة التالية للتأكد من استيعابك للمادة التدريبية:</p>
        
        <QuizContainer />
      </div>
    )
  }
];

function QuizContainer() {
  const [score, setScore] = useState(null);
  const [q1, setQ1] = useState("");
  const [q2, setQ2] = useState("");

  const checkQuiz = () => {
    let currentScore = 0;
    if (q1 === "correct") currentScore += 50;
    if (q2 === "correct") currentScore += 50;
    setScore(currentScore);
  };

  return (
    <div className="quiz-box">
      <div className="quiz-question">
        <p><strong>السؤال الأول: اكتشفت أنك قدمت معلومة خاطئة بالخطأ لمستفيد، ما هو الإجراء الصحيح؟</strong></p>
        <label className="quiz-option">
          <input type="radio" name="q1" value="wrong1" onChange={(e) => setQ1(e.target.value)} />
          <span>تتجاهل الأمر وتتمنى ألا يلاحظ المستفيد ذلك دمجاً للمشاكل.</span>
        </label>
        <label className="quiz-option">
          <input type="radio" name="q1" value="correct" onChange={(e) => setQ1(e.target.value)} />
          <span>تتواصل معه فوراً بكل لباقة، وتعتذر عن اللبس وتزوده بالمعلومة الصحيحة والمحدثة بناءً على الوقائع.</span>
        </label>
      </div>

      <div className="quiz-question" style={{ marginTop: "1.5rem" }}>
        <p><strong>السؤال الثاني: ما هي اللغة المعتمدة رسمياً للتواصل المباشر مع الطلاب في مُلِم؟</strong></p>
        <label className="quiz-option">
          <input type="radio" name="q2" value="wrong1" onChange={(e) => setQ2(e.target.value)} />
          <span>اللغة العامية والرموز التعبيرية المفرطة.</span>
        </label>
        <label className="quiz-option">
          <input type="radio" name="q2" value="correct" onChange={(e) => setQ2(e.target.value)} />
          <span>اللغة العربية الفصحى المبسطة بأسلوب راقٍ واحترافي.</span>
        </label>
      </div>

      <button type="button" onClick={checkQuiz} className="training-btn" style={{ marginTop: "1.5rem", width: "100%" }}>تصحيح الاختبار السريع</button>
      
      {score !== null && (
        <div className={`quiz-result ${score === 100 ? "score-full" : "score-low"}`}>
          {score === 100 ? "🎉 ممتاز! إجاباتك كاملة وصحيحة، أنت جاهز تماماً للانضمام للدعم الفني بمُلِم!" : "⚠️ ركز جيداً، بعض الإجابات غير صحيحة، يرجى مراجعة القواعد التدريبية مرة أخرى."}
        </div>
      )}
    </div>
  );
}

export default function SupportTrainingPage() {
  const [activeTab, setActiveTab] = useState(1);

  return (
    <main className="training-page">
      <div className="training-card">
        <header className="training-header">
          <h1 className="training-main-title">بوابة التدريب والتأهيل التقني</h1>
          <p className="training-main-subtitle">فريق مُلِم التطوعي - قسم الدعم الفني والإرشاد الأكاديمي</p>
        </header>

        <div className="training-tabs">
          {trainingModules.map((mod) => (
            <button
              key={mod.id}
              onClick={() => setActiveTab(mod.id)}
              className={`training-tab-btn ${activeTab === mod.id ? "tab-active" : ""}`}
            >
              <span className="tab-icon">{mod.icon}</span>
              <span className="tab-title">{mod.title}</span>
            </button>
          ))}
        </div>

        <div className="training-body-content">
          {trainingModules.find((m) => m.id === activeTab)?.content}
        </div>
      </div>
    </main>
  );
}
