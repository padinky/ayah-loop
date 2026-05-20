export const SURAH_STALE_TIME = 1000 * 60 * 60 * 24;

export function combinedSurahQueryKey(surahNumber: number, reciterId: string) {
  return ["surah", "combined", surahNumber, reciterId] as const;
}
