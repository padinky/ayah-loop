import type { Surah } from "@/store/quranStore";
import type { SambungAyatRound } from "@/store/sambungAyatStore";

/** Surahs that have at least one “prompt” ayah (not the last ayah of the surah). */
export function eligibleSurahNumbers(
  selectedNumbers: number[],
  surahsMeta: Surah[]
): number[] {
  return selectedNumbers.filter((n) => {
    const meta = surahsMeta.find((s) => s.number === n);
    return meta !== undefined && meta.numberOfAyahs >= 2;
  });
}

export function pickRandomRound(
  selectedNumbers: number[],
  surahsMeta: Surah[]
): SambungAyatRound | null {
  const eligible = eligibleSurahNumbers(selectedNumbers, surahsMeta);
  if (eligible.length === 0) return null;
  const surahNumber = eligible[Math.floor(Math.random() * eligible.length)]!;
  const meta = surahsMeta.find((s) => s.number === surahNumber)!;
  const maxPrompt = meta.numberOfAyahs - 1;
  const promptNumberInSurah = 1 + Math.floor(Math.random() * maxPrompt);
  return { surahNumber, promptNumberInSurah };
}

export function buildAyahMap<T extends { numberInSurah: number }>(
  ayahs: T[]
): Map<number, T> {
  const m = new Map<number, T>();
  for (const a of ayahs) {
    m.set(a.numberInSurah, a);
  }
  return m;
}
