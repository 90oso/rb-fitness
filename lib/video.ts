/** YouTube search for a technique video of the exercise; opens in a new tab so the workout is not lost. */
export function videoSearchUrl(exerciseName: string): string {
  const query = `${exerciseName} técnica correcta`;
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
}
