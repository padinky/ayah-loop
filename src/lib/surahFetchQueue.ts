import type { Ayah } from "@/store/quranStore";

type Fetcher = (surahNumber: number, reciterId: string) => Promise<Ayah[]>;

let chain: Promise<unknown> = Promise.resolve();

/**
 * Ensures at most one combined-surah fetch runs at a time app-wide (avoids 429).
 */
export function fetchCombinedSurahQueued(
  surahNumber: number,
  reciterId: string,
  fetcher: Fetcher
): Promise<Ayah[]> {
  const task = chain.then(() => fetcher(surahNumber, reciterId));
  chain = task.then(
    () => undefined,
    () => undefined
  );
  return task;
}
