export function buildAyahMap<T extends { numberInSurah: number }>(
  ayahs: T[]
): Map<number, T> {
  const m = new Map<number, T>();
  for (const a of ayahs) {
    m.set(a.numberInSurah, a);
  }
  return m;
}
