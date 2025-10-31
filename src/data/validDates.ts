export const routeToValidDates: Record<string, string[]> = {
  'Denia - Ibiza Elvissa': [
    '2024-05-29', '2024-05-30', '2024-06-05', '2024-06-12'
  ],
  'Ibiza Elvissa - Denia': [
    '2024-05-29', '2024-05-30', '2024-06-05', '2024-06-12'
  ],
  'Denia - Mallorca Palma': ['2024-06-10'],
  'Mallorca Palma - Denia': ['2024-06-10'],
};

export function suggestNearestDate(route: string, target: string): string | null {
  const dates = routeToValidDates[route];
  if (!dates || dates.length === 0) return null;
  const targetTime = new Date(target).getTime();
  const sorted = [...dates].sort((a, b) => Math.abs(new Date(a).getTime() - targetTime) - Math.abs(new Date(b).getTime() - targetTime));
  return sorted[0] || null;
}
