import type { Surah } from "@/store/quranStore";

export interface SambungSuratRound {
  promptSurahNumber: number;
  answerSurahNumber: number;
}

/** Selected surahs that have a canonical next surah (not An-Nas). */
export function eligibleSurahNumbers(
  selectedNumbers: number[],
  _surahsMeta: Surah[]
): number[] {
  return selectedNumbers.filter((n) => n < 114);
}

export function pickRandomRound(
  selectedNumbers: number[],
  surahsMeta: Surah[]
): SambungSuratRound | null {
  const eligible = eligibleSurahNumbers(selectedNumbers, surahsMeta);
  if (eligible.length === 0) return null;
  const promptSurahNumber = eligible[Math.floor(Math.random() * eligible.length)]!;
  return {
    promptSurahNumber,
    answerSurahNumber: promptSurahNumber + 1,
  };
}
