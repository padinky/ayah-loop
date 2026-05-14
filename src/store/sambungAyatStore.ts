import { create } from "zustand";

export interface SambungAyatRound {
  surahNumber: number;
  promptNumberInSurah: number;
}

interface SambungAyatState {
  selectedSurahNumbers: number[];
  round: SambungAyatRound | null;
  revealed: boolean;
  toggleSurah: (surahNumber: number) => void;
  clearSelection: () => void;
  setRound: (round: SambungAyatRound | null) => void;
  setRevealed: (revealed: boolean) => void;
  resetRoundUi: () => void;
}

export const useSambungAyatStore = create<SambungAyatState>((set) => ({
  selectedSurahNumbers: [],
  round: null,
  revealed: false,

  toggleSurah: (surahNumber) =>
    set((state) => {
      const has = state.selectedSurahNumbers.includes(surahNumber);
      const selectedSurahNumbers = has
        ? state.selectedSurahNumbers.filter((n) => n !== surahNumber)
        : [...state.selectedSurahNumbers, surahNumber].sort((a, b) => a - b);
      return { selectedSurahNumbers };
    }),

  clearSelection: () => set({ selectedSurahNumbers: [], round: null, revealed: false }),

  setRound: (round) => set({ round, revealed: false }),

  setRevealed: (revealed) => set({ revealed }),

  resetRoundUi: () => set({ round: null, revealed: false }),
}));
