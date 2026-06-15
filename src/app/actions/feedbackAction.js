'use server'

import { createClient } from '@supabase/supabase-js'

export async function submitFeedbackServer(data) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  try {
    const { error } = await supabase
      .from('support_feedback')
      .insert([
        {
          speed_rating: data.speedRating,
          clarity_rating: data.clarityRating,
          behavior_rating: data.behaviorRating,
          overall_stars: data.overallStars,
          suggestions: data.suggestions,
        }
      ])

    if (error) throw error

    return { success: true }
  } catch (error) {
    console.error('Supabase Error:', error.message)
    return { success: false, error: 'حدث خطأ أثناء إرسال التقييم، يرجى المحاولة لاحقاً.' }
  }
}