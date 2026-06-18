"use client";

import React, { useState, useEffect } from 'react';

function Admin() {
  const OWNER = 'molim-team';
  const REPO = 'molim-js';
  const FILE = 'public/scholarships.json';

  
  const getFlagEmoji = (countryCode) => {
    if (!countryCode) return '🌍';
    const codePoints = countryCode
      .toUpperCase()
      .split('')
      .map(char => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
  };

  
  const COUNTRIES_LIST = [
    { name: 'السعودية', code: 'sa' },
    { name: 'المجر', code: 'hu' },
    { name: 'تركيا', code: 'tr' },
    { name: 'ألمانيا', code: 'de' },
    { name: 'بريطانيا', code: 'gb' },
    { name: 'أمريكا', code: 'us' },
    { name: 'كندا', code: 'ca' },
    { name: 'روسيا', code: 'ru' },
    { name: 'الصين', code: 'cn' },
    { name: 'اليابان', code: 'jp' },
    { name: 'فرنسا', code: 'fr' },
    { name: 'إيطاليا', code: 'it' },
    { name: 'إسبانيا', code: 'es' },
    { name: 'ماليزيا', code: 'my' },
    { name: 'قطر', code: 'qa' },
    { name: 'الإمارات', code: 'ae' },
    { name: 'مصر', code: 'eg' },
    { name: 'الأردن', code: 'jo' },
    { name: 'الكويت', code: 'kw' },
    { name: 'البحرين', code: 'bh' },
    { name: 'عمان', code: 'om' },
    { name: 'اليمن', code: 'ye' },
    { name: 'العراق', code: 'iq' },
    { name: 'سوريا', code: 'sy' },
    { name: 'لبنان', code: 'lb' },
    { name: 'فلسطين', code: 'ps' },
    { name: 'تونس', code: 'tn' },
    { name: 'الجزائر', code: 'dz' },
    { name: 'المغرب', code: 'ma' },
    { name: 'كوريا الجنوبية', code: 'kr' },
    { name: 'أستراليا', code: 'au' },
    { name: 'نيوزيلندا', code: 'nz' },
    { name: 'هولندا', code: 'nl' },
    { name: 'بلجيكا', code: 'be' },
    { name: 'سويسرا', code: 'ch' },
    { name: 'النمسا', code: 'at' },
    { name: 'السويد', code: 'se' },
    { name: 'النرويج', code: 'no' },
    { name: 'الدنمارك', code: 'dk' },
    { name: 'فنلندا', code: 'fi' },
    { name: 'إندونيسيا', code: 'id' },
    { name: 'الهند', code: 'in' },
    { name: 'باكستان', code: 'pk' },
    { name: 'بروناي', code: 'bn' },
    { name: 'أذربيجان', code: 'az' },
    { name: 'رومانيا', code: 'ro' },
    { name: 'بولندا', code: 'pl' },
    { name: 'قبرص', code: 'cy' },
    { name: 'اليونان', code: 'gr' }
  ].sort((a, b) => a.name.localeCompare(b.name, 'ar'));

  const [token, setToken] = useState('');
  const [activeTab, setActiveTab] = useState('add');
  const [message, setMessage] = useState({ text: '', type: '' });
  const [editMessage, setEditMessage] = useState({ text: '', type: '' });
  const [cachedSha, setCachedSha] = useState('');
  const [scholarships, setScholarships] = useState([]);
  const [loadingList, setLoadingList] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState(-1);
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, index: -1, name: '' });
  const [draftSaved, setDraftSaved] = useState(false); 
  const [hasStoredDraft, setHasStoredDraft] = useState(false);

  
  const [isCustomCountryAdd, setIsCustomCountryAdd] = useState(false);
  const [isCustomCountryEdit, setIsCustomCountryEdit] = useState(false);

  const initialFormState = {
    title: '', enTitle: '', country: '', flag: '', degree: '', language: '',
    status: 'open', open_date: '', deadline: '', desc: '', notes: '', link: '',
    benefits: [''], requirements: [''], majors: '',
    groupLink: '', discussionLink: '',
    requiredFiles: [''], optionalFiles: ['']
  };

  const [addForm, setAddForm] = useState(initialFormState);
  const [editForm, setEditForm] = useState(initialFormState);

  useEffect(() => {
    const saved = localStorage.getItem('draft_scholarship');
    if (saved) {
      setHasStoredDraft(true);
      try {
        const parsed = JSON.parse(saved);
        if (parsed.title || parsed.country || parsed.desc) {
          const confirmLoad = window.confirm('📝 لديك مسودة محفوظة , هل تريد إكمالها؟');
          if (confirmLoad) {
            setAddForm(parsed);
            
            const exists = COUNTRIES_LIST.some(c => c.name === parsed.country);
            if (!exists && parsed.country) setIsCustomCountryAdd(true);
          } else {
            localStorage.removeItem('draft_scholarship');
            setHasStoredDraft(false);
          }
        }
      } catch (e) {
        console.error("فشل قراءة المسودة المحفوظة:", e);
      }
    }
  }, []);

  useEffect(() => {
    const isEmpty = !addForm.title?.trim() && !addForm.country?.trim() && !addForm.desc?.trim();
    if (isEmpty) return;

    const saveTimer = setTimeout(() => {
      localStorage.setItem('draft_scholarship', JSON.stringify(addForm));
      setDraftSaved(true);
      setHasStoredDraft(true);
    }, 5000);

    return () => clearTimeout(saveTimer);
  }, [addForm]);

  useEffect(() => {
    if (!draftSaved) return;
    const hideTimer = setTimeout(() => { setDraftSaved(false); }, 2000);
    return () => clearTimeout(hideTimer);
  }, [draftSaved]);

  const handleClearDraft = () => {
    const confirmDelete = window.confirm('⚠️ هل أنت متأكد من رغبتك في حذف المسودة المحفوظة وإفراغ الحقول بالكامل؟');
    if (confirmDelete) {
      localStorage.removeItem('draft_scholarship');
      setAddForm(initialFormState);
      setIsCustomCountryAdd(false);
      setHasStoredDraft(false);
      setMessage({ text: '🗑️ تم حذف المسودة وإفراغ الفورم بنجاح.', type: 'info' });
    }
  };

  const toBase64 = (str) => {
    const bytes = new TextEncoder().encode(str);
    let binary = '';
    bytes.forEach(b => binary += String.fromCharCode(b));
    return btoa(binary);
  };

  const decodeContent = (content) => {
    const clean = content.replace(/\n/g, '');
    const bytes = Uint8Array.from(atob(clean), c => c.charCodeAt(0));
    return JSON.parse(new TextDecoder('utf-8').decode(bytes));
  };

 
  const handleCountryDropdownChange = (formType, selectedValue) => {
    if (selectedValue === 'custom') {
      if (formType === 'add') {
        setIsCustomCountryAdd(true);
        setAddForm({ ...addForm, country: '', flag: '' });
      } else {
        setIsCustomCountryEdit(true);
        setEditForm({ ...editForm, country: '', flag: '' });
      }
    } else {
      const selected = COUNTRIES_LIST.find(c => c.name === selectedValue);
      const flagUrl = selected ? `https://flagcdn.com/w40/${selected.code}.png` : '';
      
      if (formType === 'add') {
        setIsCustomCountryAdd(false);
        setAddForm({ ...addForm, country: selectedValue, flag: flagUrl });
      } else {
        setIsCustomCountryEdit(false);
        setEditForm({ ...editForm, country: selectedValue, flag: flagUrl });
      }
    }
  };

  const handleFileTypeChange = (formType, fileType, index, value) => {
    const targetForm = formType === 'add' ? addForm : editForm;
    const setForm = formType === 'add' ? setAddForm : setEditForm;
    const updatedFiles = [...targetForm[fileType]];
    updatedFiles[index] = value;
    setForm({ ...targetForm, [fileType]: updatedFiles });
  };

  const addFileField = (formType, fileType) => {
    const targetForm = formType === 'add' ? addForm : editForm;
    const setForm = formType === 'add' ? setAddForm : setEditForm;
    setForm({ ...targetForm, [fileType]: [...targetForm[fileType], ''] });
  };

  const removeFileField = (formType, fileType, index) => {
    const targetForm = formType === 'add' ? addForm : editForm;
    const setForm = formType === 'add' ? setAddForm : setEditForm;
    const updatedFiles = targetForm[fileType].filter((_, i) => i !== index);
    setForm({ ...targetForm, [fileType]: updatedFiles });
  };

  const fetchGitHubFile = async () => {
    const res = await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/contents/${FILE}`, {
      headers: { Authorization: `token ${token}` }
    });
    if (!res.ok) throw new Error('فشل الاتصال بـ GitHub — تأكد من التوكن وصلاحياته');
    return await res.json();
  };

  const saveGitHubFile = async (sha, dataArray, commitMessage) => {
    const res = await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/contents/${FILE}`, {
      method: 'PUT',
      headers: { Authorization: `token ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: commitMessage,
        content: toBase64(JSON.stringify(dataArray, null, 2)),
        sha: sha
      })
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.message || 'فشل الحفظ في المستودع');
    return result;
  };

  const handleAddScholarship = async () => {
    setMessage({ text: '⏳ جاري الإضافة...', type: 'info' });

    if (!addForm.title.trim() || !addForm.country.trim()) {
      setMessage({ text: '❌ اسم المنحة والدولة مطلوبان بقوة!', type: 'error' });
      return;
    }

    const generatedId = addForm.enTitle
      ? addForm.enTitle.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')
      : 'scholarship-' + Date.now();

    const newEntry = {
      id: generatedId,
      name: addForm.title.trim(),
      name_en: addForm.enTitle.trim(),
      country: addForm.country.trim(),
      flag: addForm.flag.trim(),
      degree: addForm.degree.trim(),
      language: addForm.language.trim(),
      description: addForm.desc.trim(),
      benefits: addForm.benefits.map(s => s.trim()).filter(Boolean),
      requirements: addForm.requirements.map(s => s.trim()).filter(Boolean),
      majors: addForm.majors.split(',').map(s => s.trim()).filter(Boolean),
      open_date: addForm.open_date,
      deadline: addForm.deadline,
      documents: {
        required: addForm.requiredFiles.map(f => f.trim()).filter(Boolean),
        optional: addForm.optionalFiles.map(f => f.trim()).filter(Boolean)
      },
      link: addForm.link.trim(),
      open: addForm.status === 'open',
      notes: addForm.notes.trim(),
      groupLink: addForm.groupLink.trim(),
      discussionLink: addForm.discussionLink.trim()
    };

    try {
      const fileData = await fetchGitHubFile();
      const currentList = decodeContent(fileData.content);
      currentList.push(newEntry);
      await saveGitHubFile(fileData.sha, currentList, `إضافة منحة: ${newEntry.name}`);
      setMessage({ text: '✅ تمت إضافة المنحة بنجاح! ستظهر على الموقع خلال دقائق.', type: 'success' });
      if (newEntry.open) {
        fetch('/api/notify-scholarship', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-notify-secret': process.env.NEXT_PUBLIC_NOTIFY_SECRET,
          },
          body: JSON.stringify({ scholarship: newEntry }),
        }).catch(console.error);
      }
      setAddForm(initialFormState);
      setIsCustomCountryAdd(false);
      localStorage.removeItem('draft_scholarship'); 
      setHasStoredDraft(false);
    } catch (e) {
      setMessage({ text: `❌ حدث خطأ: ${e.message}`, type: 'error' });
    }
  };

  const handleLoadScholarships = async () => {
    setLoadingList(true);
    setMessage({ text: '', type: '' });
    try {
      const fileData = await fetchGitHubFile();
      setCachedSha(fileData.sha);
      const decodedList = decodeContent(fileData.content);
      setScholarships(decodedList);
    } catch (e) {
      setMessage({ text: '❌ خطأ في تحميل القائمة — تأكد من صحة التوكن', type: 'error' });
    } finally {
      setLoadingList(false);
    }
  };

  const handleOpenEditModal = (index) => {
    const s = scholarships[index];
    setEditingIndex(index);
    setEditMessage({ text: '', type: '' });

    const isCustom = !COUNTRIES_LIST.some(c => c.name === s.country);
    setIsCustomCountryEdit(isCustom);

    setEditForm({
      title: s.name || s.title || '',
      enTitle: s.name_en || s.enTitle || '',
      country: s.country || '',
      flag: s.flag || '',
      degree: s.degree || s.degrees || '',
      language: s.language || '',
      status: (s.open === true || s.status === 'open') ? 'open' : 'closed',
      open_date: s.open_date || '',
      deadline: s.deadline || '',
      desc: s.description || s.desc || '',
      benefits: Array.isArray(s.benefits) ? (s.benefits.length ? s.benefits : ['']) : (s.benefits ? s.benefits.split(',').map(x => x.trim()) : ['']),
      requirements: Array.isArray(s.requirements) ? (s.requirements.length ? s.requirements : ['']) : (s.requirements ? s.requirements.split(',').map(x => x.trim()) : ['']),
      majors: Array.isArray(s.majors) ? s.majors.join(', ') : s.majors || '',
      link: s.link || '',
      notes: s.notes || '',
      groupLink: s.groupLink || '',
      discussionLink: s.discussionLink || '',
      requiredFiles: s.documents?.required?.length ? s.documents.required : [''],
      optionalFiles: s.documents?.optional?.length ? s.documents.optional : ['']
    });

    setIsModalOpen(true);
  };

  const handleSaveEdit = async () => {
    setEditMessage({ text: '⏳ جاري حفظ التعديلات...', type: 'info' });

    if (!editForm.title.trim() || !editForm.country.trim()) {
      setEditMessage({ text: '❌ اسم المنحة والدولة مطلوبان!', type: 'error' });
      return;
    }

    try {
      const updatedList = [...scholarships];
      const oldData = updatedList[editingIndex];
      const wasOpen = oldData?.open;

      updatedList[editingIndex] = {
        ...oldData,
        name: editForm.title.trim(),
        name_en: editForm.enTitle.trim(),
        country: editForm.country.trim(),
        flag: editForm.flag.trim(),
        degree: editForm.degree.trim(),
        language: editForm.language.trim(),
        description: editForm.desc.trim(),
        benefits: editForm.benefits.map(s => s.trim()).filter(Boolean),
        requirements: editForm.requirements.map(s => s.trim()).filter(Boolean),
        majors: editForm.majors.split(',').map(s => s.trim()).filter(Boolean),
        open_date: editForm.open_date,
        deadline: editForm.deadline,
        documents: {
          required: editForm.requiredFiles.map(f => f.trim()).filter(Boolean),
          optional: editForm.optionalFiles.map(f => f.trim()).filter(Boolean)
        },
        link: editForm.link.trim(),
        open: editForm.status === 'open',
        notes: editForm.notes.trim(),
        groupLink: editForm.groupLink.trim(),
        discussionLink: editForm.discussionLink.trim()
      };

      const fileData = await fetchGitHubFile();
      await saveGitHubFile(fileData.sha, updatedList, `تعديل منحة: ${editForm.title}`);

      setEditMessage({ text: '✅ تم حفظ التعديلات بنجاح!', type: 'success' });
      const isNowOpen = editForm.status === 'open';
      if (!wasOpen && isNowOpen) {
        fetch('/api/notify-scholarship', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-notify-secret': process.env.NEXT_PUBLIC_NOTIFY_SECRET,
          },
          body: JSON.stringify({ scholarship: updatedList[editingIndex] }),
        }).catch(console.error);
      }
      setTimeout(() => {
        setIsModalOpen(false);
        handleLoadScholarships();
      }, 1500);

    } catch (e) {
      setEditMessage({ text: `❌ فشل التعديل: ${e.message}`, type: 'error' });
    }
  };

  const handleDeleteClick = (index) => {
    const s = scholarships[index];
    setDeleteConfirm({ open: true, index, name: s.name || s.title || 'هذه المنحة' });
  };

  const handleConfirmDelete = async () => {
    const index = deleteConfirm.index;
    setDeleteConfirm({ open: false, index: -1, name: '' });
    setMessage({ text: '⏳ جاري حذف المنحة...', type: 'info' });

    try {
      const updatedList = scholarships.filter((_, i) => i !== index);
      const fileData = await fetchGitHubFile();
      await saveGitHubFile(fileData.sha, updatedList, `حذف منحة: ${scholarships[index].name || scholarships[index].title}`);
      setMessage({ text: '✅ تم حذف المنحة بنجاح!', type: 'success' });
      setScholarships(updatedList);
    } catch (e) {
      setMessage({ text: `❌ فشل الحذف: ${e.message}`, type: 'error' });
    }
  };

  return (
    <div className="admin-container">
      <h1>🎛️ لوحة تحكم مُلم</h1>

      {draftSaved && (
        <div style={{
          position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)',
          backgroundColor: '#e8f5e9', color: '#2e7d32', padding: '10px 20px',
          borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', zIndex: 9999,
          fontSize: '14px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px'
        }}>
          💾 تم حفظ المسودة تلقائياً
        </div>
      )}

      <div className="token-bar">
        <label>🔑 التوكن الخاص (مطلوب للتحقق)</label>
        <input
          type="password"
          placeholder="أدخل التوكن هنا..."
          value={token}
          onChange={(e) => setToken(e.target.value)}
        />
      </div>

      <div className="tabs">
        <button className={`tab-btn ${activeTab === 'add' ? 'active' : 'inactive'}`} onClick={() => setActiveTab('add')}>➕ إضافة منحة</button>
        <button className={`tab-btn ${activeTab === 'manage' ? 'active' : 'inactive'}`} onClick={() => { setActiveTab('manage'); handleLoadScholarships(); }}>📋 إدارة المنح</button>
      </div>

      {message.text && <p className={`admin-msg ${message.type}`}>{message.text}</p>}

      {activeTab === 'add' && (
        <div className="section-form">
          <div className="form-group">
            <label>اسم المنحة *</label>
            <input type="text" placeholder="مثال: منحة الحكومة التركية" value={addForm.title} onChange={e => setAddForm({...addForm, title: e.target.value})} />
          </div>
          <div className="form-group">
            <label>الاسم الإنجليزي للمنحة</label>
            <input type="text" placeholder="مثال: Turkey Government Scholarship" value={addForm.enTitle} onChange={e => setAddForm({...addForm, enTitle: e.target.value})} />
          </div>
          
          <div className="form-group">
            <label>🌍 اختر دولة المنحة *</label>
            <select 
              value={isCustomCountryAdd ? 'custom' : addForm.country} 
              onChange={e => handleCountryDropdownChange('add', e.target.value)}
            >
              <option value="">-- اختر الدولة --</option>
              {COUNTRIES_LIST.map((c, idx) => (
                <option key={idx} value={c.name}>
                  {getFlagEmoji(c.code)} {c.name}
                </option>
              ))}
              <option value="custom">⚙️ الخيار 50: إضافة دولة وعلم يدوياً (احتياطي)</option>
            </select>
          </div>

         
          {isCustomCountryAdd && (
            <div style={{ backgroundColor: '#f9f9f9', padding: '15px', borderRadius: '6px', border: '1px dashed #ccc', marginBottom: '15px' }}>
              <div className="form-group">
                <label>اسم الدولة اليدوي *</label>
                <input type="text" placeholder="اكتب اسم الدولة هنا..." value={addForm.country} onChange={e => setAddForm({...addForm, country: e.target.value})} />
              </div>
              <div className="form-group">
                <label>رابط علم الدولة اليدوي (PNG)</label>
                <input type="url" placeholder="https://example.com/flag.png" value={addForm.flag} onChange={e => setAddForm({...addForm, flag: e.target.value})} />
              </div>
            </div>
          )}

          {!isCustomCountryAdd && addForm.flag && (
            <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <label>معاينة العلم التلقائي:</label>
              <img src={addForm.flag} alt="Flag Preview" style={{ height: '24px', border: '1px solid #ccc', borderRadius: '3px' }} />
              <span style={{ fontSize: '12px', color: '#666' }}>{addForm.flag}</span>
            </div>
          )}

          <div className="form-group">
            <label>المراحل الدراسية</label>
            <input type="text" placeholder="مثال: بكالوريوس، ماجستير" value={addForm.degree} onChange={e => setAddForm({...addForm, degree: e.target.value})} />
          </div>
          <div className="form-group">
            <label>🌐 لغة الدراسة</label>
            <input type="text" placeholder="مثال: الإنجليزية، التركية" value={addForm.language} onChange={e => setAddForm({...addForm, language: e.target.value})} />
          </div>
          <div className="form-group">
            <label>حالة التتقديم</label>
            <select value={addForm.status} onChange={e => setAddForm({...addForm, status: e.target.value})}>
              <option value="open">مفتوح</option>
              <option value="closed">مغلق</option>
            </select>
          </div>
          <div className="form-group">
            <label>📅 موعد فتح التقديم</label>
            <input type="date" value={addForm.open_date} onChange={e => setAddForm({...addForm, open_date: e.target.value})} />
          </div>
          <div className="form-group">
            <label>📅 آخر موعد للتقديم</label>
            <input type="date" value={addForm.deadline} onChange={e => setAddForm({...addForm, deadline: e.target.value})} />
          </div>
          <div className="form-group">
            <label>وصف المنحة (قصير)</label>
            <textarea placeholder="اكتب وصفاً مختصراً..." value={addForm.desc} onChange={e => setAddForm({...addForm, desc: e.target.value})}></textarea>
          </div>

          <div className="files-section">
            <p className="sub-title-file">🎁 المميزات</p>
            {addForm.benefits.map((item, i) => (
              <div key={i} className="file-row">
                <input type="text" value={item} onChange={e => handleFileTypeChange('add', 'benefits', i, e.target.value)} />
                <button type="button" className="btn-remove-file" onClick={() => removeFileField('add', 'benefits', i)}>✕</button>
              </div>
            ))}
            <button type="button" className="btn-add-file" onClick={() => addFileField('add', 'benefits')}>+ إضافة ميزة</button>
          </div>

          <div className="files-section">
            <p className="sub-title-file">📋 الشروط</p>
            {addForm.requirements.map((item, i) => (
              <div key={i} className="file-row">
                <input type="text" value={item} onChange={e => handleFileTypeChange('add', 'requirements', i, e.target.value)} />
                <button type="button" className="btn-remove-file" onClick={() => removeFileField('add', 'requirements', i)}>✕</button>
              </div>
            ))}
            <button type="button" className="btn-add-file" onClick={() => addFileField('add', 'requirements')}>+ إضافة شرط</button>
          </div>

          <div className="form-group">
            <label>📚 التخصصات المتاحة (افصل بينها بفاصلة ,)</label>
            <input type="text" value={addForm.majors} onChange={e => setAddForm({...addForm, majors: e.target.value})} />
          </div>

          <div className="files-section">
            <h4>📂 المستندات والملفات المطلوبة</h4>
            <p className="sub-title-file">📌 الملفات الإجبارية</p>
            {addForm.requiredFiles.map((file, i) => (
              <div key={i} className="file-row">
                <input type="text" value={file} onChange={e => handleFileTypeChange('add', 'requiredFiles', i, e.target.value)} />
                <button type="button" className="btn-remove-file" onClick={() => removeFileField('add', 'requiredFiles', i)}>✕</button>
              </div>
            ))}
            <button type="button" className="btn-add-file" onClick={() => addFileField('add', 'requiredFiles')}>+ إضافة مستند إجباري</button>

            <hr className="section-divider"/>

            <p className="sub-title-file">📎 الملفات الاختيارية</p>
            {addForm.optionalFiles.map((file, i) => (
              <div key={i} className="file-row">
                <input type="text" value={file} onChange={e => handleFileTypeChange('add', 'optionalFiles', i, e.target.value)} />
                <button type="button" className="btn-remove-file" onClick={() => removeFileField('add', 'optionalFiles', i)}>✕</button>
              </div>
            ))}
            <button type="button" className="btn-add-file" onClick={() => addFileField('add', 'optionalFiles')}>+ إضافة مستند اختياري</button>
          </div>

          <div className="form-group">
            <label>رابط التقديم للموقع الرسمي</label>
            <input type="url" value={addForm.link} onChange={e => setAddForm({...addForm, link: e.target.value})} />
          </div>

          <div className="files-section">
            <h4>📂 روابط مجموعات Telegram</h4>
            <div className="form-group">
              <label>🔗 رابط قناة المنحة</label>
              <input type="url" value={addForm.groupLink} onChange={e => setAddForm({...addForm, groupLink: e.target.value})} />
            </div>
            <div className="form-group">
              <label>💬 رابط مناقشة المنحة</label>
              <input type="url" value={addForm.discussionLink} onChange={e => setAddForm({...addForm, discussionLink: e.target.value})} />
            </div>
          </div>

          <div className="form-group">
            <label>📝 ملاحظات إضافية</label>
            <textarea value={addForm.notes} onChange={e => setAddForm({...addForm, notes: e.target.value})}></textarea>
          </div>

          <div style={{ display: 'flex', gap: '15px', marginTop: '20px' }}>
            <button className="btn-submit" style={{ flex: 1 }} onClick={handleAddScholarship}>✅ إضافة المنحة للمستودع</button>
            {hasStoredDraft && (
              <button className="btn-delete" style={{ padding: '0 25px', backgroundColor: '#d32f2f', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }} onClick={handleClearDraft}>🗑️ حذف المسودة</button>
            )}
          </div>
        </div>
      )}

      {activeTab === 'manage' && (
        <div className="section-manage">
          <button className="btn-submit" style={{ marginBottom: '15px' }} onClick={handleLoadScholarships}>🔄 تحديث ومزامنة القائمة</button>
          {loadingList ? (
            <p style={{ textAlign: 'center', color: '#888' }}>⏳ جاري سحب المنح...</p>
          ) : scholarships.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#aaa' }}>لا توجد منح دراسية مضافة</p>
          ) : (
            <div className="scholarships-list">
              {scholarships.map((s, index) => (
                <div key={s.id || index} className="scholarship-item">
                  <div>
                    <h3>{s.flag && <img src={s.flag} alt="" style={{ height: '16px', marginLeft: '5px', verticalAlign: 'middle' }} />} {s.name || s.title}</h3>
                    <p>{s.country} — {s.degree}</p>
                  </div>
                  <div className="item-btns">
                    <button className="btn-edit" onClick={() => handleOpenEditModal(index)}>✏️ تعديل</button>
                    <button className="btn-delete" onClick={() => handleDeleteClick(index)}>🗑️ حذف</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {deleteConfirm.open && (
        <div className="modal-overlay open" onClick={() => setDeleteConfirm({ open: false, index: -1, name: '' })}>
          <div className="modal-box" style={{ maxWidth: '420px' }} onClick={(e) => e.stopPropagation()}>
            <h2>⚠️ تأكيد الحذف</h2>
            <p>هل أنت متأكد من حذف منحة <strong>"{deleteConfirm.name}"</strong>؟</p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button className="btn-cancel-delete" onClick={() => setDeleteConfirm({ open: false, index: -1, name: '' })}>إلغاء</button>
              <button className="btn-confirm-delete" onClick={handleConfirmDelete}>نعم، احذف</button>
            </div>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="modal-overlay open" onClick={() => setIsModalOpen(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setIsModalOpen(false)}>✕</button>
            <h2>✏️ تعديل بيانات المنحة</h2>
            {editMessage.text && <p className={`admin-msg ${editMessage.type}`}>{editMessage.text}</p>}

            <div className="form-group">
              <label>اسم المنحة *</label>
              <input type="text" value={editForm.title} onChange={e => setEditForm({...editForm, title: e.target.value})} />
            </div>
            
            <div className="form-group">
              <label>🌍 تعديل دولة المنحة *</label>
              <select 
                value={isCustomCountryEdit ? 'custom' : editForm.country} 
                onChange={e => handleCountryDropdownChange('edit', e.target.value)}
              >
                <option value="">-- اختر الدولة --</option>
                {COUNTRIES_LIST.map((c, idx) => (
                  <option key={idx} value={c.name}>
                    {getFlagEmoji(c.code)} {c.name}
                  </option>
                ))}
                <option value="custom">⚙️ الخيار 50: إضافة دولة وعلم يدوياً (احتياطي)</option>
              </select>
            </div>

            {isCustomCountryEdit && (
              <div style={{ backgroundColor: '#f9f9f9', padding: '15px', borderRadius: '6px', border: '1px dashed #ccc', marginBottom: '15px' }}>
                <div className="form-group">
                  <label>اسم الدولة اليدوي *</label>
                  <input type="text" value={editForm.country} onChange={e => setEditForm({...editForm, country: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>رابط علم الدولة اليدوي (PNG)</label>
                  <input type="url" value={editForm.flag} onChange={e => setEditForm({...editForm, flag: e.target.value})} />
                </div>
              </div>
            )}

            {!isCustomCountryEdit && editForm.flag && (
              <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <label>رابط العلم:</label>
                <img src={editForm.flag} alt="Preview" style={{ height: '24px', border: '1px solid #ccc', borderRadius: '3px' }} />
                <span style={{ fontSize: '12px', color: '#666' }}>{editForm.flag}</span>
              </div>
            )}

          
            <div className="form-group">
              <label>المراحل الدراسية</label>
              <input type="text" value={editForm.degree} onChange={e => setEditForm({...editForm, degree: e.target.value})} />
            </div>
            <div className="form-group">
              <label>وصف المنحة</label>
              <textarea value={editForm.desc} onChange={e => setEditForm({...editForm, desc: e.target.value})}></textarea>
            </div>

            <button className="btn-save" onClick={handleSaveEdit}>💾 حفظ التعديلات</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Admin;
