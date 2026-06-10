"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { auth, db } from '../../lib/firebase';
import { doc, updateDoc, setDoc } from 'firebase/firestore';
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification,
  signInWithPopup,
  GoogleAuthProvider,
} from 'firebase/auth';

const googleProvider = new GoogleAuthProvider();

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' });
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [notifyConsent, setNotifyConsent] = useState(false);
  const [hideNotify, setHideNotify] = useState(false);
  const [showResend, setShowResend] = useState(false);

  useEffect(() => {
    const answered = localStorage.getItem('notifyConsentAnswered');
    if (answered === 'true') setHideNotify(true);
  }, []);

  const handleGoogleLogin = async () => {
    setMessage({ text: '', type: '' });
    setGoogleLoading(true);
    try {
      const userCredential = await signInWithPopup(auth, googleProvider);
      const uid = userCredential.user.uid;
      try {
        await setDoc(doc(db, 'users', uid), {
          email: userCredential.user.email,
          name: userCredential.user.displayName,
          notifyOnNewScholarship: false,
          notifyConsentAnswered: false,
        }, { merge: true });
      } catch (firestoreError) {
        console.error('Firestore error:', firestoreError);
      }
      setMessage({ text: '✅ تم تسجيل الدخول بنجاح! جاري التحويل...', type: 'success' });
      setTimeout(() => { window.location.href = '/'; }, 800);
    } catch (error) {
      setGoogleLoading(false);
      if (
        error.code === 'auth/popup-closed-by-user' ||
        error.code === 'auth/cancelled-popup-request'
      ) {
        setMessage({ text: '⚠️ تم إغلاق نافذة تسجيل الدخول.', type: 'error' });
      } else {
        setMessage({ text: '⚠️ حدث خطأ أثناء تسجيل الدخول بـ Google.', type: 'error' });
      }
    }
  };

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
      setTimeout(() => { window.location.href = '/'; }, 800);

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

        {/* زر Google */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={googleLoading || loading}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            width: '100%',
            padding: '12px',
            borderRadius: '8px',
            border: '2px solid #e0e0e0',
            backgroundColor: 'white',
            cursor: googleLoading ? 'not-allowed' : 'pointer',
            fontSize: '15px',
            fontWeight: 'bold',
            color: '#333',
            marginBottom: '16px',
          }}
        >
          <svg width="20" height="20" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
          </svg>
          {googleLoading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول بـ Google'}
        </button>

        <div style={{ textAlign: 'center', color: '#aaa', marginBottom: '16px', fontSize: '13px' }}>
          أو
        </div>

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

          <button type="submit" className="btn-auth" disabled={loading || googleLoading}>
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