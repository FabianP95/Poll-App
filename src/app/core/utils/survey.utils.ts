import { Survey } from "../interfaces/survey.interfaces";

/**
 * Calculates the number of days until a survey ends.
 * @param end_date The end date of the survey
 * @returns Number of days remaining or null
 */
export function daysUntilEnd(end_date: Date | null): number | null {
  if (!end_date) return null;
  const now = new Date();
  const diff = end_date.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

/**
 * Creates a formatted label for when a survey ends.
 * @param end_date The end date of the survey
 * @returns A formatted string describing when the survey ends
 */
export function formatEndLabel(end_date: Date | null): string {
  const days = daysUntilEnd(end_date);
  if (days === null) return '';
  if (days === 0) return 'Ends today';
  if (days === 1) return 'Ends in 1 Day';
  return `Ends in ${days} Days`;
}

/**
 * Checks if a survey is still active.
 * @param survey The survey to check
 * @returns True if the survey is active, false otherwise
 */
export function isSurveyActive(survey: Survey): boolean {
  if (!survey.end_date) return true;
  return survey.end_date.getTime() >= Date.now();
}

/**
 * Filters surveys that are ending soon.
 * @param surveys Array of surveys to filter
 * @param limit Maximum number of surveys to return
 * @returns Array of surveys ending soon
 */
export function getEndingSoonSurveys(surveys: Survey[], limit = 3): Survey[] {
  return surveys
    .filter((s) => isSurveyActive(s) && s.end_date)
    .sort((a, b) => (a.end_date!.getTime() > b.end_date!.getTime() ? 1 : -1))
    .slice(0, limit);
}

/**
 * Formats a date to German locale format.
 * @param date The date to format
 * @returns A formatted date string
 */
export function formatDate(date: Date | null): string {
  if (!date) return '';
  return date.toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

/**
 * Filters surveys by category.
 * @param surveys Array of surveys to filter
 * @param category The category to filter by
 * @returns Array of surveys in the selected category
 */
export function filterSurveysByCategory(surveys: Survey[], category: string): Survey[] {
  if (!category) return surveys;
  return surveys.filter((s) => s.category === category);
}
