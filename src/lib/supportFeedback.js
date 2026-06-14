import { supabaseClient } from "./supabaseClient";

/**
 * Saves a support feedback response to Supabase.
 * @param {Object} data
 * @param {string} data.speedRating
 * @param {string} data.clarityRating
 * @param {string} data.behaviorRating
 * @param {number} data.overallStars
 * @param {string|null} data.suggestions
 */
export async function submitSupportFeedback({
  speedRating,
  clarityRating,
  behaviorRating,
  overallStars,
  suggestions,
}) {
  const { error } = await supabaseClient.from("support_feedback").insert({
    speed_rating: speedRating,
    clarity_rating: clarityRating,
    behavior_rating: behaviorRating,
    overall_stars: overallStars,
    suggestions: suggestions?.trim() ? suggestions.trim() : null,
  });

  if (error) {
    throw error;
  }
}