"use client";

import React, { useState, useEffect, useRef } from 'react';

export default function LlamamBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [attachedFile, setAttachedFile] = useState(null);
  const [filePreview, setFilePreview] = useState('');
  const [history, setHistory] = useState([]);
  const [isTyping, setIsTyping] = useState(false);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const abortControllerRef = useRef(null);

  // تنظيف الـ request لو الكومبوننت اتشال من الصفحة
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // إلغاء الطلب لو المستخدم قفل الشات
  useEffect(() => {
    if (!isOpen && abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsTyping(false);
    }
  }, [isOpen]);

  const handleBotClick = () => {
    setIsOpen(!isOpen);
    if (!isOpen && messages.length === 0) {
      setMessages([
        {
          id: 'welcome',
          sender: 'ai',
          text: 'مرحباً! أنا لمام، مساعدك الذكي في منصة مُلم 🎓\nيمكنني مساعدتك في:\n• كتابة وتقييم خطاب الحافز\n• نصائح للـ CV\n• تحليل الصور\n• توجيهك لأفضل منحة تناسبك\n\n⚠️ الحد الأقصى 15 رسالة لكل محادثة، انتقِ أسئلتك بعناية.'
        }
      ]);
    }
  };

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // فحص حجم الملف (5 ميجابايت)
    const MAX_FILE_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_FILE_SIZE) {
      setMessages(prev => [...prev, { 
        id: Date.now() + '-err', 
        sender: 'ai', 
        text: 'عذراً، حجم الصورة كبير جداً. الحد الأقصى هو 5 ميجابايت.' 
      }]);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setAttachedFile(file);
    setFilePreview(`📎 ${file.name}`);
  };

  const handleSendMessage = async (textToSend = inputValue) => {
    // منع الإرسال لو فيه طلب شغال حالياً
    if (isTyping) return;

    const trimmedText = textToSend.trim();
    if (!trimmedText && !attachedFile) return;

    const userMsgCount = history.filter(m => m.role === 'user').length;
    if (userMsgCount >= 15) {
      setMessages(prev => [...prev, { id: Date.now(), sender: 'ai', text: '⚠️ وصلت للحد الأقصى (15 رسالة). يرجى تحديث الصفحة لبدء محادثة جديدة.' }]);
      return;
    }

    const displayUserText = trimmedText || (attachedFile ? '📎 تم إرفاق صورة' : '');

    const newMsgId = Date.now();
    setMessages(prev => [...prev, { id: newMsgId, sender: 'user', text: displayUserText }]);
    setInputValue('');
    setIsTyping(true);

    // تجهيز المحتوى بصيغة OpenAI-compatible التي يقبلها Groq
    let userContent;
    if (attachedFile) {
      try {
        const dataUrl = await fileToBase64(attachedFile);
        userContent = [
          {
            type: 'image_url',
            image_url: { url: dataUrl }
          },
          { type: 'text', text: trimmedText || 'حلل هذه الصورة' }
        ];
        setAttachedFile(null);
        setFilePreview('');
        if (fileInputRef.current) fileInputRef.current.value = '';
      } catch (err) {
        console.error("File conversion error:", err);
        setMessages(prev => [...prev, { 
          id: Date.now() + '-err', 
          sender: 'ai', 
          text: 'عذراً، فشل تحويل الصورة. يرجى المحاولة بصورة أخرى.' 
        }]);
        setAttachedFile(null);
        setFilePreview('');
        if (fileInputRef.current) fileInputRef.current.value = '';
        setIsTyping(false);
        return; // توقف العملية بالكامل لو فشل التحويل
      }
    } else {
      userContent = trimmedText;
    }

    const updatedHistory = [...history, { role: 'user', content: userContent }];
    setHistory(updatedHistory);

    // تجهيز AbortController جديد
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ history: updatedHistory }),
        signal: abortControllerRef.current.signal
      });

      if (!response.ok) {
        let serverErrorMsg = '';
        try {
          const errJson = await response.json();
          if (errJson.error) serverErrorMsg = errJson.error;
        } catch (e) {}
        throw new Error(serverErrorMsg || `HTTP ${response.status}`);
      }

      setIsTyping(false);

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let fullReply = '';

      const aiResponseId = Date.now() + '-ai';
      setMessages(prev => [...prev, { id: aiResponseId, sender: 'ai', text: '' }]);

      // الباك اند يبعت نص خام (plain text) مباشر — نقرأه chunk by chunk بدون أي تحليل JSON
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        fullReply += chunk;
        setMessages(prev =>
          prev.map(m => (m.id === aiResponseId ? { ...m, text: fullReply } : m))
        );
      }

      setHistory(prev => [...prev, { role: 'assistant', content: fullReply }]);

    } catch (err) {
      setIsTyping(false);
      
      if (err.name === 'AbortError') {
        console.log('Request aborted by user');
        return; // لا تظهر رسالة خطأ للمستخدم إذا كان الإلغاء مقصوداً
      }

      console.error('Llamam Error:', err);
      
      const userFriendlyError = err.message && !err.message.startsWith('HTTP') && !err.message.includes('fetch')
        ? err.message
        : 'عذراً، حدث خطأ في الاتصال بالخادم. تحقق من اتصال الإنترنت وحاول مرة أخرى.';

      setMessages(prev => [...prev, {
        id: Date.now() + '-err',
        sender: 'ai',
        text: userFriendlyError
      }]);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const quickQuestions = ['كيف أكتب خطاب حافز قوي', 'كيف اكتب سيرة ذاتية بشكل ممتاز', 'كيف أختار المنحة المناسبة'];

  return (
    <>
      {/* زر لمام AI الأساسي */}
      <button className="llamam-button" onClick={handleBotClick}>
        🤖 لمام
      </button>

      {/* صندوق المحادثة التفاعلي المساعد */}
      {isOpen && (
        <div className="llamam-chat-box">
          <div className="llamam-header">
            <span>🤖 لمام — مساعدك الذكي</span>
            <button className="llamam-close-btn" onClick={() => setIsOpen(false)}>✕</button>
          </div>

          <div className="llamam-messages-area">
            {messages.map((msg) => (
              <div key={msg.id} className={`llamam-msg ${msg.sender}`}>
                {msg.text}
              </div>
            ))}
            {isTyping && <div style={{ color: '#aaa', fontSize: '13px' }}>...يكتب الآن</div>}
            <div ref={messagesEndRef} />
          </div>

          {messages.length <= 1 && (
            <div className="llamam-quick-container">
              {quickQuestions.map((q, idx) => (
                <button 
                  key={idx} 
                  className="llamam-quick-btn" 
                  onClick={() => handleSendMessage(q)}
                  disabled={isTyping}
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          <div className="llamam-footer">
            <div className="llamam-input-row">
              <label 
                htmlFor="llamam-file" 
                style={{ cursor: isTyping ? 'not-allowed' : 'pointer', fontSize: '22px', opacity: isTyping ? 0.5 : 1 }} 
                title="إرفاق صورة"
              >
                📎
              </label>
              <input
                id="llamam-file"
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                ref={fileInputRef}
                onChange={handleFileChange}
                disabled={isTyping}
              />
              <input
                type="text"
                className="llamam-input-field"
                placeholder="اسألني أي شيء..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !isTyping && handleSendMessage()}
                disabled={isTyping}
              />
              <button 
                className="llamam-send-btn" 
                onClick={() => handleSendMessage()}
                disabled={isTyping}
              >
                إرسال
              </button>
            </div>
            {filePreview && <div className="llamam-preview-text">{filePreview}</div>}
          </div>
        </div>
      )}
    </>
  );
}