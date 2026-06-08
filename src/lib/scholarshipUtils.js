/**
 * حساب حالة المنحة تلقائياً بناءً على التواريخ.
 */
export function getIsOpen(s) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const hasOpenDate = s.open_date && s.open_date.trim() !== '';
  const hasDeadline = s.deadline && s.deadline.trim() !== '';

  if (hasOpenDate && hasDeadline) {
    const openDate = new Date(s.open_date);
    const closeDate = new Date(s.deadline);
    return today >= openDate && today <= closeDate;
  }

  if (hasDeadline) {
    const closeDate = new Date(s.deadline);
    return today <= closeDate;
  }

  if (hasOpenDate) {
    const openDate = new Date(s.open_date);
    return today >= openDate;
  }

  // لا تواريخ يرجع للقيمة اليدوية
  return s.open === true || s.open === 'true';
}