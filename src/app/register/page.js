"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { auth, db } from '../../lib/firebase';
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import {
  createUserWithEmailAndPassword,
  updateProfile,
  sendEmailVerification,
  signOut,
  signInWithPopup,
  GoogleAuthProvider,
  getAdditionalUserInfo,
} from "firebase/auth";

const googleProvider = new GoogleAuthProvider();

export default function Register() {
  const router = useRouter();
  const [fullname, setFullname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [notifyConsent, setNotifyConsent] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [googleUser, setGoogleUser] = useState(null);
  const googleUserRef = useRef(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user && !googleUserRef.current) {
        router.push('/');
      }
    });
    return () => unsubscribe();
  }, []);

  const handleGoogleRegister = async () => {
    setMessage({ text: '', type: '' });
    setGoogleLoading(true);
    googleUserRef.current = true;
    try {
      const userCredential = await signInWithPopup(auth, googleProvider);
      const uid = userCredential.user.uid;

      if (localStorage.getItem(`notifyConsent_${uid}`) === 'true') {
        setMessage({ text: '✅ تم تسجيل الدخول بنجاح! جاري التحويل...', type: 'success' });
        router.push('/');
        return;
      }

      const additionalInfo = getAdditionalUserInfo(userCredential);
      const userDocRef = doc(db, 'users', uid);

      if (additionalInfo?.isNewUser) {
        setDoc(userDocRef, {
          fullname: userCredential.user.displayName,
          email: userCredential.user.email,
          role: 'student',
          registrationDate: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          notifyOnNewScholarship: false,
          notifyConsentAnswered: false,
        }).catch(e => console.error(e));

        setGoogleLoading(false);
        setGoogleUser({ uid });
        return;
      }

      try {
        const userDocSnap = await getDoc(userDocRef);
        let wantsNotify = false;
        let answered = false;

        if (userDocSnap.exists()) {
          const data = userDocSnap.data();
          wantsNotify = data.notifyOnNewScholarship === true;
          answered = data.notifyConsentAnswered === true;
        }

        if (answered || wantsNotify) {
          localStorage.setItem(`notifyConsent_${uid}`, 'true');
          setMessage({ text: '✅ تم تسجيل الدخول بنجاح! جاري التحويل...', type: 'success' });
          router.push('/');
          return;
        }
      } catch (e) {
        console.error('Firestore error:', e);
      }

      setGoogleLoading(false);
      setGoogleUser({ uid });

    } catch (error) {
      googleUserRef.current = false;
      setGoogleLoading(false);
      if (
        error.code === 'auth/popup-closed-by-user' ||
        error.code === 'auth/cancelled-popup-request'
      ) {
        setMessage({ text: '⚠️ تم إغلاق نافذة تسجيل الدخول.', type: 'error' });
      } else {
        setMessage({ text: '⚠️ حدث خطأ أثناء إنشاء الحساب بـ Google.', type: 'error' });
      }
    }
  };

  const handleGoogleNotifyAnswer = async (wantsNotify) => {
    const uid = googleUser?.uid;
    if (!uid) return;

    setGoogleLoading(true);

    try {
      localStorage.setItem(`notifyConsent_${uid}`, 'true');
      updateDoc(doc(db, 'users', uid), {
        notifyOnNewScholarship: wantsNotify,
        notifyConsentAnswered: true,
      }).catch(e => console.error(e));
    } catch (e) {
      console.error(e);
    }

    router.push('/');
  };

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

      setDoc(doc(db, 'users', user.uid), {
        fullname: fullname.trim(),
        email: email.trim(),
        role: 'student',
        registrationDate: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        notifyOnNewScholarship: notifyConsent,
        notifyConsentAnswered: true,
      });

      sendEmailVerification(user).catch((err) => {
        console.error('sendEmailVerification failed:', err);
      });

      await signOut(auth);

      setLoading(false);
      setIsDone(true);
      setMessage({
        text: '✅ تم إنشاء حسابك بنجاح! تحقق من بريدك الإلكتروني وأكّد حسابك قبل تسجيل الدخول.',
        type: 'success',
      });

      setTimeout(() => {
        router.push('/login');
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

  if (googleUser) {
    return (
      <div className="auth-container">
        <div className="auth-card" style={{ textAlign: 'center', direction: 'rtl' }}>
          <h2 style={{ marginBottom: '12px' }}>🔔 إشعارات المنح</h2>
          <p style={{ color: '#555', marginBottom: '28px', fontSize: '15px' }}>
            هل تريد تلقّي إشعار بالبريد الإلكتروني عند فتح منحة دراسية جديدة؟
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button
              className="btn-auth"
              onClick={() => handleGoogleNotifyAnswer(true)}
              disabled={googleLoading}
              style={{ cursor: googleLoading ? 'not-allowed' : 'pointer' }}
            >
              {googleLoading ? 'جاري التحويل...' : 'نعم، أريد الإشعارات'}
            </button>
            <button
              type="button"
              className="btn-link"
              onClick={() => handleGoogleNotifyAnswer(false)}
              disabled={googleLoading}
              style={{ fontSize: '14px', color: '#888', cursor: googleLoading ? 'not-allowed' : 'pointer' }}
            >
              {googleLoading ? 'انتظر...' : 'لا، شكراً'}
            </button>
          </div>
        </div>
      </div>
    );
  }

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
            <button
              type="button"
              onClick={handleGoogleRegister}
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
              {googleLoading ? 'جاري إنشاء الحساب...' : 'إنشاء حساب عن طريق Google'}
            </button>

            <div style={{ textAlign: 'center', color: '#aaa', marginBottom: '16px', fontSize: '13px' }}>
              أو
            </div>

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

              <button type="submit" className="btn-auth" disabled={loading || googleLoading}>
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