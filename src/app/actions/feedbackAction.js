"use server";

export async function submitFeedbackServer(data) {
  const token = process.env.AIRTABLE_TOKEN;
  const baseId = process.env.AIRTABLE_BASE_ID;
  const tableName = process.env.AIRTABLE_TABLE_NAME;

  try {
    const response = await fetch(
      `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableName)}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fields: {
            "كيف تقيم سرعة الاستجابة لطلبك؟": data.speedRating,
            "مدى وضوح ودقة الإجابة أو الحل المقدم لك؟": data.clarityRating,
            "أسلوب وتعامل ممثل الدعم الفني كان؟": data.behaviorRating,
            "بشكل عام، ما مدى رضاك عن تجربة الدعم الفني في مُلِم؟": data.overallStars,
            "كلمة، ملاحظة، أو مقترح لتطوير الدعم الفني؟": data.suggestions,
          },
        }),
      }
    );

    if (!response.ok) {
      const err = await response.json();
      console.error("Airtable Error:", err);
      return { success: false, error: "حدث خطأ أثناء إرسال التقييم، برجى المحاولة لاحقاً." };
    }

    return { success: true };
  } catch (error) {
    console.error("Airtable Error:", error.message);
    return { success: false, error: "حدث خطأ أثناء إرسال التقييم، برجى المحاولة لاحقاً." };
  }
}