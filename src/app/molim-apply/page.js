'use client';

import React, { useState, useRef } from 'react';

const VOLUNTEER_FIELDS = [
  { id: 'marketing', label: 'التسويق', desc: 'الترويج لمنصة "ملم" عبر منصات السوشيال ميديا المختلفة، وإدارة الحسابات الرسمية للمنصة، والالتزام بالنشر المتواصل لزيادة التفاعل والوصول.' },
  { id: 'design', label: 'التصميم', desc: 'تصميم البوستات والصور الخاصة بالإعلان عن المنح، تنسيق الملفات، وصناعة الهويات البصرية للمنشورات والموقع الإلكتروني الخاص بـ "ملم".' },
  { id: 'video', label: 'المونتاج', desc: 'تعديل وتركيب مقاطع الفيديو الترويجية والتعريفية، وإضافة المؤثرات الصوتية والبصرية لإنتاج محتوى مرئي احترافي.' },
  { id: 'writing', label: 'الكتابة والتحرير', desc: 'صياغة النصوص المتنوعة (سواء لمنشورات التواصل الاجتماعي أو شروحات تفصيلية للمنح)، مع التركيز العالي على المراجعة والتدقيق اللغوي.' },
  { id: 'telegram', label: 'إدارة قروبات المنح (تليجرام)', desc: 'الإشراف على مجموعات التليجرام والرد المستمر على استفسارات الطلاب. يتطلب هذا المجال خبرة سابقة ودراية عامة بآليات التقديم على المنح.' },
  { id: 'it', label: 'البرمجة وتقنية المعلومات (IT)', desc: 'تطوير الموقع الإلكتروني لمنصة "ملم"، المساهمة في الحلول البرمجية الذكية، وصيانة وتكامل الأنظمة التقنية لتسهيل وربط سير العمل.' },
  { id: 'streaming', label: 'البثوث والورش', desc: 'إدارة وتقديم البثوث الحية والورش الافتراضية لشرح المنح ومتطلباتها، أو لاستضافة الشركاء الخارجيين. يتطلب هذا المجال مهارات تواصل عالية.' },
  { id: 'research', label: 'البحث عن المنح', desc: 'البحث العميق وجمع المعلومات التفصيلية حول المنح المتاحة، شروطها، والجهات المقدمة لها. يُمنع فيه الاعتماد الكامل على الذكاء الاصطناعي دون تدقيق.' },
  { id: 'pr', label: 'العلاقات العامة', desc: 'بناء وتطوير الشراكات الاستراتيجية، إبرام العقود والاتفاقيات مع المؤسسات والمبادرات الأخرى، والتعامل مع الشركاء الخارجيين لتوسيع نطاق منصة "ملم".' },
  { id: 'management', label: 'إدارة المهام', desc: 'تنظيم سير العمل الداخلي، توزيع المسؤوليات على فريق المتطوعين، ومتابعة الجداول الزمنية لضمان تنفيذ المشاريع بنجاح وفي وقتها المحدد.' },
  { id: 'support', label: 'الدعم الفني', desc: 'تقديم المساعدة للطلاب في حل المشاكل المتعلقة بالتقديم على المنح، والرد على الاستفسارات العامة في قروبات ملم وفي التطبيق الخاص بالدعم الفني.' }
];

const SKILLS = [
  'التصميم الجرافيكي', 'تصميم الشعارات', 'تصميم السوشيال ميديا', 'UI/UX Design',
  'تصميم العروض التقديمية (Presentations)', 'كتابة المحتوى', 'كتابة المقالات',
  'كتابة الإعلانات (Copywriting)', 'التدقيق اللغوي', 'التلخيص', 'كتابة السيناريو',
  'التدوين (Blogging)', 'إدارة حسابات السوشيال ميديا', 'التخطيط للمحتوى',
  'تحليل التفاعل (Analytics)', 'مهارات اخرئ'
];

const HOURS = ['25 ساعة', '20 ساعة', '15 ساعة', '10 ساعات', '5 ساعات'];

// عدد محاولات إعادة الإرسال التلقائية بعد المحاولة الأولى (يعني 3 محاولات إجمالاً)
const MAX_RETRIES = 2;
// مهلة كل محاولة قبل اعتبارها معلّقة (بالمللي ثانية)
const REQUEST_TIMEOUT_MS = 20000;

// دالة مساعدة للانتظار بين المحاولات
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export default function MolimApply() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    nationality: '',
    volunteerFields: [],
    skills: [],
    otherSkills: '',
    experience: '',
    previousVolunteering: '',
    reasonToVolunteer: '',
    weeklyHours: '',
    telegramLink: '',
    socialLinks: '',
    notes: '',
    honeypot: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null); // 'success' or 'error'
  const [errorMessage, setErrorMessage] = useState('');
  const [openAccordion, setOpenAccordion] = useState(null);
  
  const toggleAccordion = (index) => {
    setOpenAccordion(openAccordion === index ? null : index);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      const currentArray = formData[name];
      if (checked) {
        if (name === 'volunteerFields' && currentArray.length >= 2) {
          return; // Limit to 2
        }
        if (name === 'skills' && currentArray.length >= 5) {
          return; // Limit to 5
        }
        setFormData({ ...formData, [name]: [...currentArray, value] });
      } else {
        setFormData({ ...formData, [name]: currentArray.filter(item => item !== value) });
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // محاولة إرسال واحدة، ترجع { ok: true } أو { ok: false, retryable, message }
  const attemptSubmit = async () => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    let res;
    try {
      res = await fetch('https://molim-js.vercel.app/api/molim-apply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
        signal: controller.signal,
      });
    } catch (err) {
      clearTimeout(timeoutId);
      // خطأ شبكة أو انتهاء المهلة: قابل لإعادة المحاولة
      return {
        ok: false,
        retryable: true,
        message: err.name === 'AbortError'
          ? 'استغرق الطلب وقتًا طويلاً.'
          : 'تعذر الاتصال بالخادم.'
      };
    }
    clearTimeout(timeoutId);

    // نحاول نقرأ الرد كـ JSON بشكل منفصل عن خطأ الشبكة، عشان لو السيرفر
    // رجّع صفحة خطأ (HTML) أو رد فاضي بدل JSON ما ينكسر الكود.
    let data = null;
    try {
      data = await res.json();
    } catch (parseErr) {
      data = null;
    }

    if (res.ok) {
      return { ok: true };
    }

    // أخطاء السيرفر (5xx) غالبًا مؤقتة وقابلة لإعادة المحاولة.
    // أخطاء الطلب (4xx) مثل بيانات ناقصة أو غير صحيحة غير قابلة لإعادة المحاولة
    // لأن إعادة الإرسال نفس البيانات بيرجع نفس النتيجة.
    const retryable = res.status >= 500;

    return {
      ok: false,
      retryable,
      message: (data && data.error) || 'حدث خطأ أثناء إرسال الطلب.'
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);
    setErrorMessage('');

    let lastResult = null;

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      lastResult = await attemptSubmit();

      if (lastResult.ok) {
        break;
      }

      // لو الخطأ مو قابل لإعادة المحاولة (مثلاً بيانات غير صحيحة)، نوقف فورًا
      if (!lastResult.retryable) {
        break;
      }

      // لو باقي محاولات، ننتظر شوي قبل إعادة المحاولة (تأخير تصاعدي بسيط)
      if (attempt < MAX_RETRIES) {
        await wait(1500 * (attempt + 1));
      }
    }

    setIsSubmitting(false);

    if (lastResult && lastResult.ok) {
      setSubmitStatus('success');
    } else {
      setSubmitStatus('error');
      setErrorMessage(
        (lastResult && lastResult.message
          ? lastResult.message + ' حاولنا عدة مرات ولم ننجح، الرجاء المحاولة مرة أخرى بعد قليل.'
          : 'حدث خطأ أثناء إرسال الطلب، الرجاء المحاولة مرة أخرى.')
      );
    }
  };

  if (submitStatus === 'success') {
    return (
      <div className="apply-container" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
        <h1 style={{ color: '#4caf50' }}>تم إرسال طلبك بنجاح!</h1>
        <p style={{ fontSize: '1.2rem', marginTop: '1rem' }}>
          شكراً لاهتمامك بالتطوع مع فريق مُلِم. سيتم مراجعة طلبك والتواصل معك قريباً.
        </p>
      </div>
    );
  }

  return (
    <div className="apply-container">
      <h1>تطوع مع مُلِم</h1>
      <p>
        فريق مُلم يفتح باب التطوع لكل شخص عنده شغف بالمساعدة والتطوير وصناعة أثر حقيقي. إذا عندك خبرة أو مهارة في المنح الدراسية، الإشراف، التصميم، إدارة السوشيال ميديا، المونتاج، أو أي مجال تقدر تضيف فيه قيمة، فمكانك معنا.
        <br /><br />
        نؤمن إن العمل الجماعي يصنع فرق، وإن كل مهارة مهما كانت بسيطة ممكن تساهم في بناء مجتمع أقوى وأكثر فائدة للطلاب.
      </p>

      <form onSubmit={handleSubmit}>
        {/* Honeypot Field */}
        <input
          type="text"
          name="honeypot"
          className="honeypot-field"
          autoComplete="off"
          tabIndex="-1"
          value={formData.honeypot}
          onChange={handleChange}
        />

        <div className="apply-form-group">
          <label><span className="required">*</span>الاسم الثلاثي</label>
          <input type="text" name="fullName" required className="apply-input" value={formData.fullName} onChange={handleChange} maxLength="200" />
        </div>

        <div className="apply-form-group">
          <label><span className="required">*</span>البريد الإلكتروني</label>
          <input type="email" name="email" required className="apply-input" value={formData.email} onChange={handleChange} maxLength="200" />
        </div>

        <div className="apply-form-group">
          <label><span className="required">*</span>رقم الهاتف</label>
          <input type="tel" name="phone" required className="apply-input" value={formData.phone} onChange={handleChange} maxLength="50" dir="ltr" style={{ textAlign: 'right' }} />
        </div>

        <div className="apply-form-group">
          <label><span className="required">*</span>الجنسية - الدولة المقيم فيها</label>
          <span className="field-hint">مثال: سعودي - الرياض</span>
          <input type="text" name="nationality" required className="apply-input" value={formData.nationality} onChange={handleChange} maxLength="200" />
        </div>

        <div className="apply-form-group">
          <label><span className="required">*</span>المجال الذي ترغب بالتطوع فيه</label>
          <span className="field-hint">اختر المجال الذي تمتلك المهارات اللازمة للمساهمة فيه (الحد الأقصى 2 كحد أقصى). اضغط على المجال لرؤية التفاصيل.</span>
          
          <div style={{ marginBottom: '1rem', marginTop: '0.5rem' }}>
            {VOLUNTEER_FIELDS.map((field, index) => (
              <div key={field.id} className="accordion-item">
                <button 
                  type="button" 
                  className="accordion-header"
                  onClick={() => toggleAccordion(index)}
                >
                  <span>{field.label}</span>
                  <i className={`fas fa-chevron-${openAccordion === index ? 'up' : 'down'}`}></i>
                </button>
                <div className={`accordion-content ${openAccordion === index ? 'open' : ''}`}>
                  <p style={{ margin: 0, fontSize: '0.9rem' }}>{field.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="apply-pills-container">
            {VOLUNTEER_FIELDS.map((field, index) => (
              <div key={field.id}>
                <input 
                  type="checkbox" 
                  id={`field-${field.id}`} 
                  name="volunteerFields" 
                  value={field.label}
                  className="apply-pill-checkbox"
                  onChange={handleChange}
                  checked={formData.volunteerFields.includes(field.label)}
                />
                <label htmlFor={`field-${field.id}`} className={`apply-pill-label pill-color-${index % 7}`}>
                  {field.label}
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className="apply-form-group">
          <label><span className="required">*</span>المهارات والخبرات</label>
          <div className="apply-pills-container">
            {SKILLS.map((skill, index) => (
              <div key={index}>
                <input 
                  type="checkbox" 
                  id={`skill-${index}`} 
                  name="skills" 
                  value={skill}
                  className="apply-pill-checkbox"
                  onChange={handleChange}
                  checked={formData.skills.includes(skill)}
                />
                <label htmlFor={`skill-${index}`} className={`apply-pill-label pill-color-${(index + 3) % 7}`}>
                  {skill}
                </label>
              </div>
            ))}
          </div>
        </div>

        {formData.skills.includes('مهارات اخرئ') && (
          <div className="apply-form-group">
            <label>اذا كانت لديك مهارات اخرئ اذكرها</label>
            <input type="text" name="otherSkills" className="apply-input" value={formData.otherSkills} onChange={handleChange} maxLength="500" />
          </div>
        )}

        <div className="apply-form-group">
          <label><span className="required">*</span>هل لديك أي خبرات أو مشاريع عملت عليها من قبل ويمكنك اخبارنا بها؟</label>
          <textarea name="experience" required className="apply-input apply-textarea" value={formData.experience} onChange={handleChange} maxLength="2000"></textarea>
        </div>

        <div className="apply-form-group">
          <label><span className="required">*</span>هل سبق لك العمل مع فريق تطوعي من قبل أو لا؟</label>
          <select name="previousVolunteering" required className="apply-input" value={formData.previousVolunteering} onChange={handleChange}>
            <option value="" disabled>اختر...</option>
            <option value="نعم">نعم</option>
            <option value="لا">لا</option>
          </select>
        </div>

        <div className="apply-form-group">
          <label><span className="required">*</span>لماذا تريد التطوع في فريق مُلِم؟</label>
          <textarea name="reasonToVolunteer" required className="apply-input apply-textarea" value={formData.reasonToVolunteer} onChange={handleChange} maxLength="2000"></textarea>
        </div>

        <div className="apply-form-group">
          <label><span className="required">*</span>كم وقت تستطيع تخصيصه اسبوعيا للعمل مع فريق مُلِم؟</label>
          <div className="apply-pills-container">
            {HOURS.map((hour, index) => (
              <div key={index}>
                <input 
                  type="radio" 
                  id={`hour-${index}`} 
                  name="weeklyHours" 
                  value={hour}
                  required
                  className="apply-pill-checkbox"
                  onChange={handleChange}
                  checked={formData.weeklyHours === hour}
                />
                <label htmlFor={`hour-${index}`} className={`apply-pill-label pill-color-${(index + 1) % 7}`}>
                  {hour}
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className="apply-form-group">
          <label><span className="required">*</span>رابط أو يوزر حساب التلجرام</label>
          <span className="field-hint">عمل فريق ملم يتم عبر تلجرام لذا سيكون من الالزامي عمل حساب بتلجرام ايضا سيتم التواصل معك عبر الحساب الذي ستضعه هنا. تاكد من كتابته بشكل صحيح.</span>
          <input type="text" name="telegramLink" required className="apply-input" value={formData.telegramLink} onChange={handleChange} maxLength="500" dir="ltr" style={{ textAlign: 'right' }} />
        </div>

        <div className="apply-form-group">
          <label>رابط حساباتك بالسوشيال ميديا</label>
          <textarea name="socialLinks" className="apply-input apply-textarea" value={formData.socialLinks} onChange={handleChange} maxLength="2000" dir="ltr" style={{ textAlign: 'right' }}></textarea>
        </div>

        <div className="apply-form-group">
          <label>ملاحظات مقدم الطلب</label>
          <textarea name="notes" className="apply-input apply-textarea" value={formData.notes} onChange={handleChange} maxLength="2000"></textarea>
        </div>

        <button type="submit" className="apply-submit-btn" disabled={isSubmitting}>
          {isSubmitting ? 'جاري الإرسال...' : 'إرسال طلب التطوع'}
        </button>

        {submitStatus === 'error' && (
          <div style={{ background: '#ffebee', color: '#c62828', padding: '1rem', borderRadius: '8px', marginTop: '1.5rem', border: '1px solid #ef9a9a' }}>
            {errorMessage}
          </div>
        )}
      </form>
    </div>
  );
}