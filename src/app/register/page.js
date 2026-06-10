"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { auth, db } from '../../lib/firebase';
import { doc, setDoc } from "firebase/firestore";
import {
  createUserWithEmailAndPassword,
  updateProfile,
  sendEmailVerification,
  signOut,
} from "firebase/auth";

export default function Register() {
  const [fullname, setFullname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [loading, setLoading] = useState(false);
  const [notifyConsent, setNotifyConsent] = useState(false);
  const [isDone, setIsDone] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage({ text: '', type: '' });

    if (!fullname.trim() || !email.trim() || !password || !confirmPassword) {
      setMessage({ text: '⚠️ يرجى تعبئة جميع الحقول', type: 'error' });
      return;
    }
    if (password.length < 6) {
      setMessage({ text: '⚠️ يجب أن تكون كلمة المرور 6 أحرف على الأقل', type: 'error' });
      return;
    }
    if (password !== confirmPassword) {
      setMessage({ text: '⚠️ كلمة المرور غير متطابقة', type: 'error' });
      return;
    }

    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
      const user = userCredential.user;

      await updateProfile(user, { displayName: fullname.trim() });

      // حفظ البيانات في Firestore
       setDoc(doc(db, 'users', user.uid), {
        fullname: fullname.trim(),
        email: email.trim(),
        role: 'student',
        registrationDate: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        notifyOnNewScholarship: notifyConsent,
        notifyConsentAnswered: true,
      });

      // ⚠️ المشكلة الجذرية: إرسال رسالة التأكيد كـ fire-and-forget
      // لا نستخدم await حتى لا يعلق الكود إذا كانت هناك مشكلة شبكة
      sendEmailVerification(user).catch((err) => {
        console.error('sendEmailVerification failed:', err);
      });

      // تسجيل الخروج قبل تحديث الـ UI
      await signOut(auth);

      // setLoading(false) في مسار النجاح
      setLoading(false);
      setIsDone(true);
      setMessage({
        text: '✅ تم إنشاء حسابك بنجاح! تحقق من بريدك الإلكتروني وأكّد حسابك قبل تسجيل الدخول.',
        type: 'success',
      });

      setTimeout(() => {
        window.location.href = '/login';
      }, 3000);

    } catch (error) {
      setLoading(false);
      console.error(error);

      if (error.code === 'auth/email-already-in-use') {
        setMessage({
          text: '⚠️ هذا البريد الإلكتروني مستخدم بالفعل. إذا لم تستلم رسالة التأكيد، سجّل الدخول ثم اطلب إعادة الإرسال.',
          type: 'error',
        });
      } else if (error.code === 'auth/weak-password') {
        setMessage({ text: '⚠️ كلمة المرور ضعيفة جداً! يرجى اختيار كلمة مرور أقوى (6 أحرف على الأقل).', type: 'error' });
      } else if (error.code === 'auth/invalid-email') {
        setMessage({ text: '⚠️ صيغة البريد الإلكتروني المدخل غير صالحة.', type: 'error' });
      } else {
        setMessage({ text: `⚠️ حدث خطأ أثناء إنشاء الحساب: ${error.message || 'يرجى المحاولة مرة أخرى'}`, type: 'error' });
      }
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>🎓 إنشاء حساب</h1>
        <p className="subtitle">انضم إلى مُلم واستفد من جميع الميزات</p>

        {message.text && (
          <div className={`auth-msg ${message.type}`}>
            {message.text}
          </div>
        )}

        {isDone ? (
          <div style={{ textAlign: 'center', padding: '24px 0', direction: 'rtl' }}>
            <p style={{ color: '#555', marginBottom: '12px' }}>
              سيتم تحويلك لصفحة تسجيل الدخول خلال ثوانٍ...
            </p>
            <Link href="/login" style={{ color: '#ff4500', fontWeight: 'bold' }}>
              انتقل الآن
            </Link>
          </div>
        ) : (
          <>
            <form onSubmit={handleRegister}>
              <div className="form-group">
                <label>الاسم الكامل</label>
                <input
                  type="text"
                  placeholder="أدخل اسمك الكامل"
                  value={fullname}
                  onChange={(e) => setFullname(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>البريد الإلكتروني</label>
                <input
                  type="email"
                  placeholder="example@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>كلمة المرور</label>
                <div className="password-input-wrapper">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="6 أحرف على الأقل"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <span className="password-toggle-icon" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? '👁️‍🗨️' : '👁️'}
                  </span>
                </div>
              </div>
              <div className="form-group">
                <label>تأكيد كلمة المرور</label>
                <div className="password-input-wrapper">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="أعد كتابة كلمة المرور"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                  <span className="password-toggle-icon" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                    {showConfirmPassword ? '👁️‍🗨️' : '👁️'}
                  </span>
                </div>
              </div>

              <button type="submit" className="btn-auth" disabled={loading}>
                {loading ? 'جاري إنشاء الحساب...' : 'إنشاء الحساب'}
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px', direction: 'rtl' }}>
                <input
                  type="checkbox"
                  id="notify-consent"
                  checked={notifyConsent}
                  onChange={(e) => setNotifyConsent(e.target.checked)}
                  style={{ width: '16px', height: '16px', accentColor: '#ff4500', cursor: 'pointer' }}
                />
                <label htmlFor="notify-consent" style={{ fontSize: '14px', color: '#555', cursor: 'pointer' }}>
                  أرغب في تلقّي إشعار بالبريد الإلكتروني عند فتح منحة دراسية جديدة
                </label>
              </div>
            </form>

            <div className="auth-switch">
              لديك حساب؟ <Link href="/login">سجّل دخول</Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}