import type { Occasion, WeatherContext } from '@/types/domain';
export const occasionLabels: { key: Occasion; label: string }[] = [
  { key: 'everyday', label: 'Everyday' },
  { key: 'work', label: 'Work' },
  { key: 'dinner', label: 'Dinner' },
  { key: 'date', label: 'Date' },
  { key: 'going_out', label: 'Going out' },
  { key: 'formal', label: 'Formal' },
];
export const lookTitles: Record<Occasion, string> = {
  everyday: 'An easy kind\nof put-together.',
  work: 'Ready for\nwhat is next.',
  dinner: 'A table for\ngood taste.',
  date: 'A little\nchemistry.',
  going_out: 'Make an\nevening of it.',
  formal: 'Rise to\nthe occasion.',
};
export const defaultWeather: WeatherContext = {
  temperatureF: 65,
  precipitationProbability: 0,
  raining: false,
  outdoorMinutes: 0,
};
