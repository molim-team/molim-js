/**
 * Utility function to generate a pre-filled WhatsApp link
 * @param {Object} data - Order data
 * @param {string} data.name - Applicant's name
 * @param {string} data.age - Applicant's age
 * @param {string} data.gpa - Applicant's GPA/Grade
 * @param {string} data.residence - Applicant's country of residence
 * @param {string} data.level - Study level (Bachelors, Masters, etc)
 * @param {string} data.service - The requested service or scholarship
 * @returns {string} The WhatsApp API URL
 */
export function generateWhatsAppLink(data) {
  const { name, age, gpa, residence, level, service } = data;
  
  const message = `مرحباً، أود طلب الخدمة التالية:
  
*الخدمة المطلوبة:* ${service}

*البيانات الشخصية:*
- الاسم: ${name}
- العمر: ${age}
- المعدل: ${gpa}
- مكان الإقامة: ${residence}
- المرحلة الدراسية: ${level}

شكراً لكم.`;

  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/966544512404?text=${encodedMessage}`;
}
