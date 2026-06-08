"use client";

export default function ShareButton({ scholarship, id }) {
  const shareScholarship = () => {
    const s = scholarship;
    const cleanUrl = `${window.location.origin}/scholarship/${id}`;

    let text = `🎓 ${s.name}\n\n🌍 الدولة: ${s.country}\n⏰ آخر موعد: ${s.deadline}\n\n🔗 ${cleanUrl}\nعبر منصة مُلم 🎓`;

    if (navigator.share) {
      navigator.share({
        title: `مُلم | ${s.name}`,
        text: text,
        url: cleanUrl
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(cleanUrl).then(() => alert('تم نسخ رابط المنحة بنجاح'));
    }
  };

  return (
    <button onClick={shareScholarship} className="btn-main">
      📤 شارك تفاصيل المنحة
    </button>
  );
}