"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { auth, db } from '../../lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification,
} from 'firebase/auth';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' });
  const [loading, setLoading] = useState(false);
  const [notifyConsent, setNotifyConsent] = useState(false);
  const [hideNotify, setHideNotify] = useState(false);
  const [showResend, setShowResend] = useState(false);

  useEffect(() => {
    const answered = localStorage.getItem('notifyConsentAnswered');
    if (answered === 'true') setHideNotify(true);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage({ text: '', type: '' });
    setShowResend(false);

    if (!email.trim() || !password) {
      setMessage({ text: '⚠️ يرجى تعبئة جميع الحقول', type: 'error' });
      return;
    }

    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);

      if (!userCredential.user.emailVerified) {
        await auth.signOut();
        setLoading(false);
        setShowResend(true);
        setMessage({
          text: '⚠️ يرجى تأكيد بريدك الإلكتروني أولاً. تحقق من صندوق الوارد أو البريد المزعج.',
          type: 'error',
        });
        return;
      }

      const uid = userCredential.user.uid;

      // تحديث Firestore - لا يوقف التحويل في حال الفشل
      try {
        updateDoc(doc(db, 'users', uid), {
          notifyOnNewScholarship: notifyConsent,
          notifyConsentAnswered: true,
        });
        if (notifyConsent) localStorage.setItem('notifyConsentAnswered', 'true');
      } catch (firestoreError) {
        console.error('Firestore update error:', firestoreError);
      }

      setMessage({ text: '✅ تم تسجيل الدخول بنجاح! جاري التحويل...', type: 'success' });

      setTimeout(() => {
        window.location.href = '/';
      }, 800);

    } catch (error) {
      setLoading(false);
      console.error(error);

      if (
        error.code === 'auth/user-not-found' ||
        error.code === 'auth/wrong-password' ||
        error.code === 'auth/invalid-credential'
      ) {
        setMessage({ text: '⚠️ البريد الإلكتروني أو كلمة المرور غير صحيحة.', type: 'error' });
      } else if (error.code === 'auth/too-many-requests') {
        setMessage({ text: '⚠️ تم حظر المحاولات مؤقتاً بسبب كثرة الأخطاء. يرجى المحاولة لاحقاً.', type: 'error' });
      } else if (error.code === 'auth/invalid-email') {
        setMessage({ text: '⚠️ صيغة البريد الإلكتروني المدخل غير صالحة.', type: 'error' });
      } else {
        setMessage({ text: '⚠️ حدث خطأ أثناء تسجيل الدخول، يرجى المحاولة مرة أخرى.', type: 'error' });
      }
    }
  };

  const handleForgotPassword = async () => {
    setMessage({ text: '', type: '' });
    if (!email.trim()) {
      setMessage({ text: '⚠️ أدخل بريدك الإلكتروني أولاً في الحقل المخصص', type: 'error' });
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email.trim());
      setMessage({ text: '✅ تم إرسال رابط إعادة تعيين كلمة المرور لبريدك الإلكتروني', type: 'success' });
    } catch (error) {
      setMessage({ text: '⚠️ تعذر إرسال الرابط، تأكد من صحة البريد الإلكتروني المكتوب', type: 'error' });
    }
  };

  // لإعادة إرسال رسالة التأكيد للحسابات المعلّقة
  const handleResendVerification = async () => {
    if (!email.trim() || !password) {
      setMessage({ text: '⚠️ تأكد من كتابة البريد وكلمة المرور أعلاه أولاً', type: 'error' });
      return;
    }
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
      await sendEmailVerification(userCredential.user);
      await auth.signOut();
      setShowResend(false);
      setMessage({ text: '✅ تم إعادة إرسال رسالة التأكيد. تحقق من الوارد والسبام.', type: 'success' });
    } catch {
      setMessage({ text: '⚠️ تعذر إرسال الرسالة، حاول مرة أخرى', type: 'error' });
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>👋 أهلاً بك</h1>
        <p className="subtitle">سجّل دخولك للوصول إلى حسابك</p>

        {message.text && (
          <div className={`auth-msg ${message.type}`}>
            {message.text}
          </div>
        )}

        {showResend && (
          <button
            type="button"
            className="btn-link"
            onClick={handleResendVerification}
            style={{ display: 'block', margin: '4px auto 12px', color: '#ff4500', fontSize: '14px' }}
          >
            إعادة إرسال رسالة تأكيد البريد الإلكتروني
          </button>
        )}

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>البريد الإلكتروني</label>
            <input
              type="email"
              placeholder="amr@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>كلمة المرور</label>
            <input
              type="password"
              placeholder="كلمة المرور"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="forgot-password">
            <button type="button" className="btn-link" onClick={handleForgotPassword}>
              نسيت كلمة المرور؟
            </button>
          </div>

          <button type="submit" className="btn-auth" disabled={loading}>
            {loading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
          </button>

          {!hideNotify && (
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
          )}
        </form>

        <div className="auth-switch">
          لا تملك حساباً؟ <Link href="/register">إنشاء حساب جديد</Link>
        </div>
      </div>
    </div>
  );
}