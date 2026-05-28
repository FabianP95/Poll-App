import { Survey } from "../interfaces/survey.interfaces";

export function daysUntilEnd(end_date: Date | null): number | null {
  if (!end_date) return null;
  const now = new Date();
  const diff = end_date.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export function formatEndLabel(end_date: Date | null): string {
  const days = daysUntilEnd(end_date);
  if (days === null) return '';
  if (days === 0) return 'Ends today';
  if (days === 1) return 'Ends in 1 Day';
  return `Ends in ${days} Days`;
}

export function isSurveyActive(survey: Survey): boolean {
  if (!survey.end_date) return true;
  return survey.end_date.getTime() >= Date.now();
}

export function getEndingSoonSurveys(surveys: Survey[], limit = 3): Survey[] {
  return surveys
    .filter((s) => isSurveyActive(s) && s.end_date)
    .sort((a, b) => (a.end_date!.getTime() > b.end_date!.getTime() ? 1 : -1))
    .slice(0, limit);
}

export function formatDate(date: Date | null): string {
  if (!date) return '';
  return date.toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export function filterSurveysByCategory(surveys: Survey[], category: string): Survey[] {
  if (!category) return surveys;
  return surveys.filter((s) => s.category === category);
}
