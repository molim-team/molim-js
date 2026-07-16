"use client";

import { useState, useEffect } from "react";
import "./support-training.css";

// 1. هيكلة الأقسام الثلاثة الجديدة بعد الدمج والتنقيح
const trainingModules = (fullName, setFullName, telegram, setTelegram, step, setStep, answers, handleSelect, isAllAnswered, resetQuiz, quizQuestions) => [
  {
    id: 1,
    title: "١. قواعد وميثاق الدعم",
    icon: "🎯",
    content: (
      <div className="training-section">
        <h3>أولاً: ركائز التعامل الأساسية</h3>
        <p>بصفتك ممثلاً لمنصة مُلِم، فإن أسلوبك يعكس قيم الفريق بالكامل. إليك أهم الركائز:</p>
        <ul className="training-list" style={{ marginBottom: "2.5rem" }}>
          <li><strong>الترحيب واللباقة:</strong> ابدأ دائماً بتحية رسمية مستخدماً أمر الردود المعتمدة (مثل \ترحيب).</li>
          <li><strong>السرعة والدقة:</strong> أجب بناءً على الحقائق والروابط الرسمية المعتمدة وتجنب التخمين.</li>
          <li><strong>سعة الصدر:</strong> تعامل مع جميع استفسارات الطلاب باحترام وتقدير، مهما كان السؤال بسيطاً أو متكرراً.</li>
          <li><strong>ختام الخدمة والتقييم:</strong> عند الانتهاء تماماً من مساعدة المستفيد وتأكيد حل مشكلته، احرص دائماً على إنهاء المحادثة مستخدماً أمر الردود المعتمدة (مثل \ختام) لإرسال رسالة انتهاء الخدمة ورابط تقييم الأداء.</li>
          <li><strong>الأمان والسرية:</strong> يُمنع تماماً مشاركة بيانات الطلاب، أو وثائقهم، أو معدلاتهم مع أي طرف خارج الإدارة المعنية.</li>
        </ul>

        <h3>ثانياً: ميثاق وقوانين الدعم لتنظيم العمل</h3>
        <p>هذه القوانين وُجدت لتنظيم آلية العمل داخل الفريق وتوحيد التجربة لجميع الطلاب المتواصلين معنا. نرجو من الجميع الالتزام التام بها:</p>
        <ul className="training-list" style={{ marginBottom: "2rem" }}>
          <li><strong>١. احترام التخصص والاستلام:</strong> يُمنع التدخل أو الرد على أي سؤال أو طلب في حال وجود زميل آخر استلم المشكلة وبدأ بالرد على الشخص المعني.</li>
          <li><strong>٢. الهوية اللغوية الرسمية:</strong> الرد دائماً باللغة العربية الفصحى المبسطة، ويُمنع تماماً استخدام الرسائل الصوتية (الفويس) أو اللهجات العامية في الشروحات الرسمية.</li>
          <li><strong>٣. التمثيل المؤسسي:</strong> الرد يصدر دائماً باسم الفريق/المؤسسة (صيغة الجمع والمهنية) وتجنب تماماً شخصنة الحلول أو طرح الآراء الفردية غير المعتمدة.</li>
          <li><strong>٤. وحدة الصف والرأي:</strong> يُمنع الاعتراض أو تعديل رد زميل آخر أمام الأعضاء والمستفيدين في القنوات العامة. في حال وجود ملاحظة، يتم مناقشتها مع الزميل مباشرة في الخاص وبكل احترام.</li>
          <li><strong>٥. الالتزام بمجال الخدمة:</strong> يُمنع الدخول في أي نقاشات جانبية، سياسية، رياضية، أو عقائدية مع الأعضاء والمستفيدين داخل المنصة.</li>
          <li><strong>٦. إغلاق التذكرة الذكي والتقييم:</strong> التأكد بشكل كامل وقاطع من حل مشكلة العميل وإرسال رسالة إغلاق الطلب المعتمدة مع رابط التقييم باستخدام أمر الرد المعتمد (مثل \ختام) قبل إنهاء المحادثة.</li>
          <li><strong>٧. التوثيق والمتابعة:</strong> الحرص على تسجيل الملاحظات وتحديث حالة العضو في النظام فور انتهاء المحادثة مباشرة لضمان تسلسل الخدمة.</li>
          <li><strong>٨. الحزم واللباقة مع المتجاوزين:</strong> يُمنع الرد على أي مستخدم يتجاوز حدود الأدب واللباقة، ويتم رفع تذكرته مباشرة للإدارة لاتخاذ إجراء الحظر (الباند).</li>
        </ul>

        <div className="scenario-box valid-box" style={{ background: "#f8fafc", borderColor: "#ff4500", padding: "1.5rem" }}>
          <h4 style={{ color: "#ff4500" }}>⚠️ تنويه هام بخصوص المخالفات:</h4>
          <p className="scenario-text" style={{ color: "#475569", marginTop: "0.5rem", lineHeight: "1.7" }}>
            هذه القوانين لم توضع لتقييد حرية الإداريين، بل لضمان حقوق جميع الأطراف وتمثيل فريق <strong>مُلِم</strong> بأبهى صورة مهنية ورسمية تليق بأهدافه النبيلة.
            <br />
            <br />
            اعتباراً من الآن، سيتم تسجيل المخالفات بنظام الإنذارات التدريجي: 
            <br />
            <strong>(إنذار أول ⬅️ إنذار ثانٍ ⬅️ إنذار ثالث)</strong>. وفي حال الوصول للإنذار الثالث، سيتم بكل أسف إقصاء العضو من فريق الدعم الفني لضمان جودة الأداء ومصلحة المستفيدين.
          </p>
        </div>
      </div>
    )
  },
  {
    id: 2,
    title: "٢. السيناريوهات العملية",
    icon: "💬",
    content: (
      <div className="training-section">
        <h3>أمثلة حية لكيفية الرد الذكي والتعامل مع المواقف الصعبة</h3>
        <p>إليك دليلك العملي للتعامل مع المواقف الشائعة (الرد الصحيح مقابل الرد الخاطئ):</p>
        
        {/* السياسة الحمراء الصارمة */}
        <div className="scenario-box invalid-box" style={{ borderColor: "#dc2626", background: "#fef2f2", borderWidth: "2px", borderStyle: "solid" }}>
          <h4 style={{ color: "#dc2626", fontSize: "1.1rem", fontWeight: "900" }}>⚠️ [سياسة حمراء صارمة] موقف: مستفيد يسيء أو يستخدم ألفاظاً غير لائقة</h4>
          <p className="scenario-text" style={{ color: "#991b1b" }}>
            <strong>الرد والسلوك الخاطئ:</strong> الدخول في نقاش مع المستفيد، أو الرد على إساءته، أو مجادلته بأي شكل من الأشكال.
          </p>
        </div>
        <div className="scenario-box valid-box" style={{ borderColor: "#dc2626", borderWidth: "2px", borderStyle: "solid" }}>
          <h4 style={{ color: "#15803d", fontSize: "1.1rem" }}>⚖️ الإجراء الرسمي المعتمد فوراً:</h4>
          <p className="scenario-text" style={{ fontWeight: "700" }}>
            يُمنع الرد على المستفيد إطلاقاً أو مجاراته في الحديث. يتم إيقاف المحادثة فوراً، وتصعيد التذكرة مباشرة إلى رئيس قسم الدعم الفني لاتخاذ الإجراء القانوني وحظر الحساب وفق سياسة الخصوصية والأمان الصارمة الخاصة بفريق مُلِم.
          </p>
        </div>

        <hr style={{ margin: "2rem 0", border: "0", borderTop: "1px dashed #cbd5e1" }} />

        <div className="scenario-box invalid-box">
          <h4>❌ موقف: مستفيد يسأل عن حل مشكلة تقنية لا تعرفها</h4>
          <p className="scenario-text"><strong>الرد الخاطئ:</strong> "والله ما أدري، اسأل أحد ثاني بالجروب أو انتظر المشرف."</p>
        </div>
        <div className="scenario-box valid-box">
          <h4>✅ الرد الاحترافي المعتمد:</h4>
          <p className="scenario-text">"أهلاً بك، سعداء بخدمتك. سأقوم برفع مشكلتك حالاً للقسم المختص للمراجعة، وسيتم الرد عليك فور حلها مباشرة. شاكرين تفهمك."</p>
        </div>

        <div className="scenario-box invalid-box" style={{ marginTop: "1.5rem" }}>
          <h4>❌ موقف: مستفيد غاضب ويستخدم أسلوباً حاداً</h4>
          <p className="scenario-text"><strong>الرد الخاطئ:</strong> "إذا ما يعجبك الدعم تواصل مع جهة ثانية."</p>
        </div>
        <div className="scenario-box valid-box">
          <h4>✅ الرد الاحترافي المعتمد:</h4>
          <p className="scenario-text">"نتفهم انزعاجكم ونعتذر عن أي إزعاج حدث. يسعدنا مساعدتكم، ونرجو تزويدنا بتفاصيل المشكلة حتى نتمكن من معالجتها بأسرع وقت ممكن."</p>
        </div>

        <div className="scenario-box invalid-box" style={{ marginTop: "1.5rem" }}>
          <h4>❌ موقف: مستفيد يكرر نفس السؤال عدة مرات</h4>
          <p className="scenario-text"><strong>الرد الخاطئ:</strong> "جاوبناك قبل شوي."</p>
        </div>
        <div className="scenario-box valid-box">
          <h4>✅ الرد الاحترافي المعتمد:</h4>
          <p className="scenario-text">"لا بأس، نعيد التوضيح بكل سرور." (ثم يتم إعادة شرح الإجابة باختصار ووضوح دون إظهار أي انزعاج).</p>
        </div>

        <div className="scenario-box invalid-box" style={{ marginTop: "1.5rem" }}>
          <h4>❌ موقف: مستفيد يسأل عن معلومة لا تعرفها</h4>
          <p className="scenario-text"><strong>الرد الخاطئ:</strong> "ما عندي فكرة" أو "ما أعرف."</p>
        </div>
        <div className="scenario-box valid-box">
          <h4>✅ الرد الاحترافي المعتمد:</h4>
          <p className="scenario-text">استخدم أمر الرد الجاهز المخصص لهذه الحالة: <strong>/مانعرف</strong>، ثم تابع الحالة حسب الإجراءات المعتمدة داخل الفريق.</p>
        </div>

        <div className="scenario-box invalid-box" style={{ marginTop: "1.5rem" }}>
          <h4>❌ موقف: مستفيد مستعجل جداً ويريد الرد فوراً</h4>
          <p className="scenario-text"><strong>الرد الخاطئ:</strong> "اصبر دورك."</p>
        </div>
        <div className="scenario-box valid-box">
          <h4>✅ الرد الاحترافي المعتمد:</h4>
          <p className="scenario-text">"نقدر استعجالكم، ونعمل على معالجة جميع الطلبات حسب ترتيبها، وسنبذل جهدنا للرد عليكم بأسرع وقت ممكن."</p>
        </div>

        <div className="scenario-box invalid-box" style={{ marginTop: "1.5rem" }}>
          <h4>❌ موقف: المستفيد يطلب معلومة غير مؤكدة</h4>
          <p className="scenario-text"><strong>الرد الخاطئ:</strong> "أتوقع..." أو "غالباً..."</p>
        </div>
        <div className="scenario-box valid-box">
          <h4>✅ الرد الاحترافي المعتمد:</h4>
          <p className="scenario-text">"لا يمكننا تزويدكم بمعلومة غير مؤكدة. سنقوم بالتحقق من المصدر الرسمي ثم نوافيكم بالإجابة الصحيحة."</p>
        </div>

        <div className="scenario-box invalid-box" style={{ marginTop: "1.5rem" }}>
          <h4>❌ موقف: المستفيد يرسل عدداً كبيراً من الرسائل المتتالية (سبام)</h4>
          <p className="scenario-text"><strong>الرد الخاطئ:</strong> "وقف سبام."</p>
        </div>
        <div className="scenario-box valid-box">
          <h4>✅ الرد الاحترافي المعتمد:</h4>
          <p className="scenario-text">استخدم أمر الرد الجاهز المخصص: <strong>/استلام</strong>، ثم تابع الرد على المستفيد فور توفر أحد أعضاء الدعم.</p>
        </div>

        <div className="scenario-box invalid-box" style={{ marginTop: "1.5rem" }}>
          <h4>❌ موقف: المستفيد يطلب تجاوز الأنظمة أو اللوائح</h4>
          <p className="scenario-text"><strong>الرد الخاطئ:</strong> "أبشر، بنسويها لك."</p>
        </div>
        <div className="scenario-box valid-box">
          <h4>✅ الرد الاحترافي المعتمد:</h4>
          <p className="scenario-text">"نعتذر، لا يمكننا تجاوز الأنظمة أو تقديم استثناءات خارج اللوائح المعتمدة، ويسعدنا توضيح الإجراءات الرسمية المتاحة."</p>
        </div>

        <div className="scenario-box invalid-box" style={{ marginTop: "1.5rem" }}>
          <h4>❌ موقف: المستفيد يرسل رابطاً مجهولاً أو مشبوهاً</h4>
          <p className="scenario-text"><strong>الرد الخاطئ:</strong> "خلني أفتحه."</p>
        </div>
        <div className="scenario-box valid-box">
          <h4>✅ الرد الاحترافي المعتمد:</h4>
          <p className="scenario-text">"حرصاً على أمن المعلومات، لا يمكننا التعامل مع روابط غير موثوقة. نرجو توضيح المشكلة كتابياً أو إرسال صورة توضيحية إن أمكن."</p>
        </div>

        <div className="scenario-box invalid-box" style={{ marginTop: "1.5rem" }}>
          <h4>❌ موقف: المستفيد يطلب بيانات تواصل مع طالب آخر أو حسابه الشخصي</h4>
          <p className="scenario-text"><strong>الرد الخاطئ:</strong> "أبشر، هذا حساب التيلجرام حقه" أو "هذا رقمه."</p>
        </div>
        <div className="scenario-box valid-box">
          <h4>✅ الرد الاحترافي المعتمد:</h4>
          <p className="scenario-text">"نعتذر منكم بشدة، فسياسة الخصوصية وأمن المعلومات في فريق مُلِم تحظر تماماً مشاركة أي بيانات شخصية، أو أرقام، أو حسابات خاصة بالطلاب والمستفيدين. يسعدنا طرح استفساركم هنا وسنقوم بخدمتكم بكل سرور."</p>
        </div>

        <div className="scenario-box invalid-box" style={{ marginTop: "1.5rem" }}>
          <h4>❌ موقف: المستفيد يطلب التواصل مع الإدارة مباشرة</h4>
          <p className="scenario-text"><strong>الرد الخاطئ:</strong> "هذا حساب المدير."</p>
        </div>
        <div className="scenario-box valid-box">
          <h4>✅ الرد الاحترافي المعتمد:</h4>
          <p className="scenario-text">"يسعدنا مساعدتكم أولاً، وإذا استدعت الحالة تصعيد الطلب فسيتم تحويله للإدارة عبر القنوات الرسمية."</p>
        </div>

        <div className="scenario-box invalid-box" style={{ marginTop: "1.5rem" }}>
          <h4>❌ موقف: رسالة المستفيد غير واضحة أو غامضة</h4>
          <p className="scenario-text"><strong>الرد الخاطئ:</strong> "ما فهمت."</p>
        </div>
        <div className="scenario-box valid-box">
          <h4>✅ الرد الاحترافي المعتمد:</h4>
          <p className="scenario-text">"نعتذر، لم تتضح لنا المشكلة بشكل كامل. نرجو إعادة صياغة الاستفسار أو إرسال صورة توضيحية حتى نتمكن من مساعدتكم."</p>
        </div>

        <div className="scenario-box invalid-box" style={{ marginTop: "1.5rem" }}>
          <h4>❌ موقف: المستفيد يسأل عن خدمة خارج نطاق منصة مُلِم</h4>
          <p className="scenario-text"><strong>الرد الخاطئ:</strong> "مو شغلنا."</p>
        </div>
        <div className="scenario-box valid-box">
          <h4>✅ الرد الاحترافي المعتمد:</h4>
          <p className="scenario-text">"نعتذر، هذا الاستفسار خارج نطاق الخدمات التي يقدمها فريق مُلِم حالياً، ويسعدنا مساعدتكم في أي استفسار يتعلق بخدمات المنصة."</p>
        </div>

        <div className="scenario-box invalid-box" style={{ marginTop: "1.5rem" }}>
          <h4>❌ موقف: تبيّن أن أحد أعضاء الدعم السابقين أخطأ في الرد</h4>
          <p className="scenario-text"><strong>الرد الخاطئ:</strong> "العضو اللي قبلي غلط."</p>
        </div>
        <div className="scenario-box valid-box">
          <h4>✅ الرد الاحترافي المعتمد:</h4>
          <p className="scenario-text">"نعتذر عن أي لبس حدث، وسنراجع الحالة ونتأكد من تزويدكم بالمعلومة الصحيحة وفق الإجراءات المعتمدة."</p>
        </div>

        <div className="scenario-box invalid-box" style={{ marginTop: "1.5rem" }}>
          <h4>❌ موقف: المستفيد يسأل عن موعد إعلان النتائج أو فتح التسجيل</h4>
          <p className="scenario-text"><strong>الرد الخاطئ:</strong> "يمكن اليوم أو بكرة."</p>
        </div>
        <div className="scenario-box valid-box">
          <h4>✅ الرد الاحترافي المعتمد:</h4>
          <p className="scenario-text">"حتى هذه اللحظة لم يصدر أي إعلان رسمي بهذا الخصوص. ننصح بمتابعة القنوات الرسمية لمنصة مُلِم، وسيتم نشر أي تحديث فور اعتماده."</p>
        </div>

        <div className="scenario-box invalid-box" style={{ marginTop: "1.5rem" }}>
          <h4>❌ موقف: المستفيد يطلب خدمة أو ميزة غير متوفرة بالمنصة</h4>
          <p className="scenario-text"><strong>الرد الخاطئ:</strong> "لا."</p>
        </div>
        <div className="scenario-box valid-box">
          <h4>✅ الرد الاحترافي المعتمد:</h4>
          <p className="scenario-text">"نعتذر، هذه الخدمة غير متوفرة حالياً ضمن خدمات منصة مُلِم، ويسعدنا مساعدتكم في أي خدمة أخرى متاحة."</p>
        </div>
      </div>
    )
  },
  {
    id: 3,
    title: "٣. اختبر نفسك",
    icon: "📝",
    content: (
      <div className="training-section">
        <h3>اختبار تقييم الأداء والجاهزية المهنية</h3>
        <p>أجب على الأسئلة العشرة التالية بدقة، ثم أدخل بياناتك الرسمية للانتقال للقسم الثاني وتصحيح الاختبار:</p>
        <QuizContainer 
          fullName={fullName} 
          setFullName={setFullName} 
          telegram={telegram} 
          setTelegram={setTelegram}
          step={step}
          setStep={setStep}
          answers={answers}
          handleSelect={handleSelect}
          isAllAnswered={isAllAnswered}
          resetQuiz={resetQuiz}
          quizQuestions={quizQuestions}
        />
      </div>
    )
  }
];

const quizQuestions = [
  {
    id: "q1",
    question: "السؤال الأول: أحد المستفيدين يسأل عن معلومة لا تعرفها، ماذا تفعل؟",
    options: [
      { key: "a", text: "أ) أخبره بما تتوقع أنه صحيح." },
      { key: "b", text: "ب) تستخدم الأمر /مانعرف." },
      { key: "c", text: "ج) تخبره أنك لا تعلم." },
      { key: "d", text: "د) تتجاهل الرسالة." }
    ],
    correct: "b"
  },
  {
    id: "q2",
    question: "السؤال الثاني: مستفيد أرسل أكثر من عشر رسائل متتالية، ماذا تفعل؟",
    options: [
      { key: "a", text: "أ) تطلب منه التوقف." },
      { key: "b", text: "ب) تستخدم الأمر /استلام." },
      { key: "c", text: "ج) تحذف رسائله." },
      { key: "d", text: "د) تتجاهله." }
    ],
    correct: "b"
  },
  {
    id: "q3",
    question: "السؤال الثالث: طلب منك أحد المستفيدين رقم عضو في فريق مُلِم.",
    options: [
      { key: "a", text: "أ) ترسل الرقم." },
      { key: "b", text: "ب) ترسل حسابه الشخصي." },
      { key: "c", text: "ج) تعتذر وتوضح أن البيانات الشخصية لا يمكن مشاركتها." },
      { key: "d", text: "د) تطلب منه البحث بنفسه." }
    ],
    correct: "c"
  },
  {
    id: "q4",
    question: "السؤال الرابع: أحد المستفيدين يسيء بالألفاظ، ما هو السلوك المعتمد؟",
    options: [
      { key: "a", text: "أ) ترد عليه وتوقفه عند حده." },
      { key: "b", text: "ب) تناقشه وتحاول إقناعه بالهدوء." },
      { key: "c", text: "ج) تصعد الحالة مباشرة لرئيس القسم ولا ترد إطلاقاً." },
      { key: "d", text: "د) تحظره بنفسك فوراً دون العودة للإدارة." }
    ],
    correct: "c"
  },
  {
    id: "q5",
    question: "السؤال الخامس: وصلتك معلومة غير مؤكدة وتريد تقديمها لمستفيد.",
    options: [
      { key: "a", text: "أ) ترسلها للمستفيد لتسريع الرد." },
      { key: "b", text: "ب) تنتظر حتى تتأكد منها من مصدر رسمي قبل الإرسال." },
      { key: "c", text: "ج) ترسلها وتقول “غالباً” لتبرئة مسؤوليتك." },
      { key: "d", text: "د) تخبره أنها صحيحة بناءً على توقعك." }
    ],
    correct: "b"
  },
  {
    id: "q6",
    question: "السؤال السادس: أحد الزملاء بدأ بالرد على المستفيد واستلام التذكرة.",
    options: [
      { key: "a", text: "أ) أكمل الرد معه في نفس المحادثة." },
      { key: "b", text: "ب) أرسل رسالة أخرى للمستفيد لتأكيد الاهتمام." },
      { key: "c", text: "ج) أترك الحالة بالكامل للزميل تجنباً للتشتيت." },
      { key: "d", text: "د) أصحح كلامه أمام المستفيد لو أخطأ." }
    ],
    correct: "c"
  },
  {
    id: "q7",
    question: "السؤال السابع: بأي لغة تكون الردود الرسمية المعتمدة في الدعم؟",
    options: [
      { key: "a", text: "أ) اللهجة العامية والودية المفرطة." },
      { key: "b", text: "ب) اللغة العربية الفصحى المبسطة بأسلوب راقٍ." },
      { key: "c", text: "ج) اللغة الإنجليزية بشكل كامل." },
      { key: "d", text: "د) حسب رغبة العضو ومزاجه الشخصي." }
    ],
    correct: "b"
  },
  {
    id: "q8",
    question: "السؤال الثامن: بعد انتهاء المشكلة وتأكيد الحل مع المستفيد بالكامل، ماذا تفعل؟",
    options: [
      { key: "a", text: "أ) تغلق المحادثة مباشرة دون إشعار." },
      { key: "b", text: "ب) تستخدم أمر الردود المعتمدة /ختام لإرسال التقييم والتحية." },
      { key: "c", text: "ج) لا تفعل شيئاً وتترك الطلب معلقاً." },
      { key: "d", text: "د) تحذف المحادثة من سجل النظام." }
    ],
    correct: "b"
  },
  {
    id: "q9",
    question: "السؤال التاسع: أحد المستفيدين يسأل عن خدمة لا تقدمها منصة مُلِم.",
    options: [
      { key: "a", text: "أ) أؤلف له إجابة تقريبية لكي لا يخرج فارغ اليدين." },
      { key: "b", text: "ب) أعتذر بلباقة وأوضح أن هذا خارج نطاق خدمات المنصة." },
      { key: "c", text: "ج) أتجاهل رسالته بالكامل." },
      { key: "d", text: "د) أحوله لعضو آخر كنوع من تصريف الطلب." }
    ],
    correct: "b"
  },
  {
    id: "q10",
    question: "السؤال العاشر: ما هي أهم صفة يجب أن يتحلى بها عضو الدعم الفني؟",
    options: [
      { key: "a", text: "أ) السرعة الفائقة بغض النظر عن جودة المعلومة." },
      { key: "b", text: "ب) الدقة فقط حتى لو بأسلوب غير لائق." },
      { key: "c", text: "ج) الدقة والاحترافية واللباقة المطلقة وسعة الصدر." },
      { key: "d", text: "د) إنهاء وإغلاق أكبر عدد من المحادثات بسرعة." }
    ],
    correct: "c"
  }
];

function QuizContainer({ 
  fullName, setFullName, telegram, setTelegram, 
  step, setStep, answers, handleSelect, isAllAnswered, resetQuiz, quizQuestions 
}) {

  const calculateScore = () => {
    let score = 0;
    quizQuestions.forEach((q) => {
      if (answers[q.id] === q.correct) {
        score += 10;
      }
    });
    return score;
  };

  const handleShowResults = () => {
    if (!isAllAnswered() || !fullName.trim() || !telegram.trim()) return;
    
    const finalScore = calculateScore();
    
    // حفظ النتيجة في التخزين المحلي للمتصفح
    const currentResults = JSON.parse(localStorage.getItem("mulim_quiz_results") || "[]");
    const newRecord = {
      id: Date.now(),
      name: fullName.trim(),
      telegram: telegram.trim(),
      score: finalScore,
      date: new Date().toLocaleString("ar-SA")
    };
    localStorage.setItem("mulim_quiz_results", JSON.stringify([newRecord, ...currentResults]));
    
    setStep(2);
  };

  if (step === 2) {
    const finalScore = calculateScore();
    return (
      <div className="quiz-box results-page-content" style={{ animation: "fadeIn 0.5s ease" }}>
        <div className="quiz-header-fame">
          <h3 className="results-title"> النتائج   </h3>
          <p className="results-subtitle">القسم الثاني: التقرير المفصل ومراجعة الأداء : {fullName}</p>
        </div>

        <div className={`score-badge-card ${finalScore >= 80 ? "score-perfect" : "score-try-again"}`}>
          <div className="score-number">{finalScore}%</div>
          <div className="score-status">
            {finalScore === 100 
              ? " اداء مثالي ، انتظر رد مسؤلي الذعم" 
              : finalScore >= 80 
              ? "رائع جداً! إجاباتك تدل على فهم عالٍ لمبادئ وقيم الخدمة" 
              : "نوصيك بمراجعة ميثاق الدعم والسيناريوهات والبدء مجدداً لتلافي الإنذارات"}
          </div>
        </div>

        <h4 style={{ color: "#0f172a", marginBottom: "1.5rem", fontWeight: "800", fontSize: "1.1rem" }}>تفاصيل التصحيح والمراجعة:</h4>
        <div className="results-breakdown">
          {quizQuestions.map((q, idx) => {
            const userAnswer = answers[q.id];
            const isCorrect = userAnswer === q.correct;
            const correctOptionText = q.options.find(opt => opt.key === q.correct)?.text;
            const userOptionText = q.options.find(opt => opt.key === userAnswer)?.text;

            return (
              <div key={q.id} className={`result-item-card ${isCorrect ? "correct-card" : "wrong-card"}`}>
                <p className="result-q-text"><strong>{idx + 1}. {q.question.replace(/السؤال.*?: /, "")}</strong></p>
                <div className="result-details">
                  <p className="user-ans">إجابتك: <span className={isCorrect ? "txt-success" : "txt-danger"}>{userOptionText || "لم تجب"}</span></p>
                  {!isCorrect && (
                    <p className="correct-ans">الإجابة المعتمدة: <span className="txt-success">{correctOptionText}</span></p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <button type="button" onClick={resetQuiz} className="training-btn reset-btn" style={{ marginTop: "2rem", width: "100%" }}>
          🔄 إعادة محاولة الاختبار
        </button>
      </div>
    );
  }

  return (
    <div className="quiz-box" style={{ animation: "fadeIn 0.5s ease" }}>
      <div className="quiz-header-fame">
        <h4 style={{ color: "#ff4500", fontWeight: "800", marginBottom: "1.5rem", fontSize: "1.1rem" }}>القسم الأول: الأسئلة المتعددة</h4>
      </div>

      <div className="quiz-questions-list">
        {quizQuestions.map((q, index) => (
          <div key={q.id} className="quiz-question" style={{ marginTop: index === 0 ? "0" : "2rem" }}>
            <p className="quiz-q-title"><strong>{q.question}</strong></p>
            <div className="options-grid">
              {q.options.map((opt) => (
                <label 
                  key={opt.key} 
                  className={`quiz-option ${answers[q.id] === opt.key ? "selected-option" : ""}`}
                >
                  <input 
                    type="radio" 
                    name={q.id} 
                    value={opt.key} 
                    checked={answers[q.id] === opt.key}
                    onChange={() => handleSelect(q.id, opt.key)} 
                  />
                  <span>{opt.text}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* نموذج جمع البيانات الشخصية المضاف قبل زر عرض النتائج */}
      <div className="user-info-fields-section" style={{ marginTop: "3rem", paddingTop: "2rem", borderTop: "2px dashed #e2e8f0" }}>
        <h4 style={{ color: "#0f172a", fontWeight: "800", marginBottom: "1.25rem", fontSize: "1.1rem" }}>تسجيل بيانات الإداري  :</h4>
        
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <div className="form-input-group">
            <label className="field-label">الاسم الثلاثي بالكامل <span style={{ color: "#dc2626" }}>*</span></label>
            <input 
              type="text" 
              placeholder="مثال: محمد حلمي العريفي" 
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="mulim-input-style"
            />
          </div>

          <div className="form-input-group">
            <label className="field-label">رابط أو معرف التيليجرام الخاص بك <span style={{ color: "#dc2626" }}>*</span></label>
            <input 
              type="text" 
              placeholder="مثال: @username أو رابط الحساب مباشرة" 
              value={telegram}
              onChange={(e) => setTelegram(e.target.value)}
              className="mulim-input-style"
              style={{ direction: "ltr", textAlign: "right" }}
            />
          </div>
        </div>
      </div>

           <button 
        type="button" 
        onClick={handleShowResults} 
        className="training-btn submit-quiz-btn" 
        disabled={!isAllAnswered() || !fullName.trim() || !telegram.trim()}
        style={{ 
          marginTop: "2.5rem", 
          width: "100%", 
          opacity: (isAllAnswered() && fullName.trim() && telegram.trim()) ? 1 : 0.5,
          cursor: (isAllAnswered() && fullName.trim() && telegram.trim()) ? "pointer" : "not-allowed"
        }}
      >
        {(isAllAnswered() && fullName.trim() && telegram.trim()) 
          ? "الانتقال إلى القسم الثاني وعرض النتيجة 🚀" 
          : "يرجى حل الأسئلة وتعبئة الاسم والتيليجرام لعرض النتائج"}
      </button>

    </div>
  );
}

export default function SupportTrainingPage() {
  const [activeTab, setActiveTab] = useState(1);
  const [tabThreeClicks, setTabThreeClicks] = useState(0);
  const [showSecretModal, setShowSecretModal] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [savedRecords, setSavedRecords] = useState([]);

  // بيانات نموذج التقييم
  const [fullName, setFullName] = useState("");
  const [telegram, setTelegram] = useState("");
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState({});

  const handleSelect = (questionId, optionKey) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionKey }));
  };

  const isAllAnswered = () => {
    return quizQuestions.every((q) => answers[q.id] !== undefined);
  };

  const resetQuiz = () => {
    setAnswers({});
    setFullName("");
    setTelegram("");
    setStep(1);
  };

  // جلب سجلات النتائج عند فتح لوحة التحكم الإدارية
  useEffect(() => {
    if (isAdminAuthenticated) {
      const records = JSON.parse(localStorage.getItem("mulim_quiz_results") || "[]");
      setSavedRecords(records);
    }
  }, [isAdminAuthenticated]);

  // إدارة تتبع الضغطات (7 ضغطات على زر "٣. اختبر نفسك")
  const handleTabClick = (tabId) => {
    if (tabId === 3) {
      const nextCount = tabThreeClicks + 1;
      if (nextCount === 7) {
        setTabThreeClicks(0);
        setShowSecretModal(true);
      } else {
        setTabThreeClicks(nextCount);
      }
    } else {
      setTabThreeClicks(0);
    }
    setActiveTab(tabId);
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (adminPassword === "Mm0551580968") {
      setIsAdminAuthenticated(true);
      setShowSecretModal(false);
      setPasswordError("");
      setAdminPassword("");
    } else {
      setPasswordError("الرمز السري غير صحيح! يرجى المحاولة مرة أخرى.");
    }
  };

  const handleClearRecords = () => {
    if (confirm("هل أنت متأكد تماماً من رغبتك في حذف كافة نتائج الإداريين من السجل؟")) {
      localStorage.removeItem("mulim_quiz_results");
      setSavedRecords([]);
    }
  };

  return (
    <main className="training-page">
      <div className="training-card">
        <header className="training-header">
          <h1 className="training-main-title">بوابة التدريب والتأهيل التقني</h1>
          <p className="training-main-subtitle">فريق مُلِم التطوعي - قسم الدعم الفني والإرشاد الأكاديمي</p>
          
          {/* شارة إغلاق لوحة الإدارة إذا كانت مفتوحة */}
          {isAdminAuthenticated && (
            <div className="admin-status-bar">
              <span> لوحة تحكم - النتائج </span>
              <button onClick={() => setIsAdminAuthenticated(false)} className="close-admin-view-btn">
                إغلاق وضع المسؤول ❌
              </button>
            </div>
          )}
        </header>

        {/* عرض جدول النتائج السري بدلاً من الواجهة الرئيسية في حال تفعيله */}
        {isAdminAuthenticated ? (
          <div className="admin-dashboard-container" style={{ animation: "fadeIn 0.4s ease" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
              <h3 className="admin-section-title">📊 قائمة نتائج اختبارات الدعم الفني</h3>
              <button onClick={handleClearRecords} className="clear-records-btn">
                🧹 مسح السجلات بالكامل
              </button>
            </div>

            {savedRecords.length === 0 ? (
              <div className="no-records-message">
                لا توجد نتائج مسجلة حتى الآن. بمجرد قيام الأعضاء بإنهاء الاختبار ستظهر تفاصيلهم هنا تلقائياً.
              </div>
            ) : (
              <div className="table-responsive">
                <table className="admin-results-table">
                  <thead>
                    <tr>
                      <th>الاسم الثلاثي بالكامل</th>
                      <th>حساب التيليجرام</th>
                      <th>الدرجة</th>
                      <th>التوقيت والتاريخ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {savedRecords.map((record) => (
                      <tr key={record.id}>
                        <td className="admin-td-name">{record.name}</td>
                        <td className="admin-td-tele">
                          <a 
                            href={record.telegram.startsWith("@") ? `https://t.me/${record.telegram.replace("@", "")}` : record.telegram} 
                            target="_blank" 
                            rel="noopener noreferrer"
                          >
                            {record.telegram}
                          </a>
                        </td>
                        <td className={`admin-td-score ${record.score >= 80 ? "pass" : "fail"}`}>
                          {record.score}%
                        </td>
                        <td className="admin-td-date">{record.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : (
          <>
            <div className="training-tabs">
              {trainingModules(fullName, setFullName, telegram, setTelegram, step, setStep, answers, handleSelect, isAllAnswered, resetQuiz, quizQuestions).map((mod) => (
                <button
                  key={mod.id}
                  onClick={() => handleTabClick(mod.id)}
                  className={`training-tab-btn ${activeTab === mod.id ? "tab-active" : ""}`}
                >
                  <span className="tab-icon">{mod.icon}</span>
                  <span className="tab-title">{mod.title}</span>
                </button>
              ))}
            </div>

            <div className="training-body-content">
              {trainingModules(fullName, setFullName, telegram, setTelegram, step, setStep, answers, handleSelect, isAllAnswered, resetQuiz, quizQuestions).find((m) => m.id === activeTab)?.content}
            </div>
          </>
        )}
      </div>

      {/* نافذة إدخال الرمز السري المنبثقة (Modal) */}
      {showSecretModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-card" style={{ animation: "fadeIn 0.3s ease" }}>
            <h3 className="admin-modal-title">🔐 لوحة التحكم - نتائج المختبرين</h3>
            <p className="admin-modal-desc">يرجى إدخال الرمز السري    :</p>
            
            <form onSubmit={handlePasswordSubmit}>
              <input 
                type="password" 
                placeholder="أدخل الرمز السري هنا" 
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                className="admin-modal-input"
                autoFocus
              />
              {passwordError && <p className="admin-modal-error">{passwordError}</p>}
              
              <div className="admin-modal-actions">
                <button type="submit" className="admin-modal-submit-btn">تأكيد الدخول</button>
                <button type="button" onClick={() => { setShowSecretModal(false); setPasswordError(""); setAdminPassword(""); }} className="admin-modal-cancel-btn">إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
