import type { Ayah } from "@/store/quranStore";

export function sortedSelectedSurahs(selectedSurahNumbers: number[]): number[] {
  return [...selectedSurahNumbers].sort((a, b) => a - b);
}

export function buildMurajaahPlaylist(
  selectedSurahNumbers: number[],
  ayahsBySurah: Record<number, Ayah[]>
): Ayah[] {
  const sorted = sortedSelectedSurahs(selectedSurahNumbers);
  const out: Ayah[] = [];
  for (const num of sorted) {
    const list = ayahsBySurah[num];
    if (list?.length) out.push(...list);
  }
  return out;
}

export function surahNumberAtPlaylistIndex(
  playlist: Ayah[],
  index: number,
  sortedSurahNumbers: number[],
  ayahsBySurah: Record<number, Ayah[]>
): number | undefined {
  if (index < 0 || index >= playlist.length) return undefined;
  const target = playlist[index];
  for (const num of sortedSurahNumbers) {
    const list = ayahsBySurah[num];
    if (list?.some((a) => a.number === target.number)) return num;
  }
  return undefined;
}
