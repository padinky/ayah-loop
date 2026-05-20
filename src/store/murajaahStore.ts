import { create } from "zustand";

interface MurajaahState {
  selectedSurahNumbers: number[];
  sessionLoops: number;
  sessionStarted: boolean;
  currentAyahIndex: number;
  currentSessionLoop: number;
  isPlaying: boolean;
  isCompleted: boolean;
  toggleSurah: (surahNumber: number) => void;
  clearSelection: () => void;
  setSessionLoops: (count: number) => void;
  setSessionStarted: (started: boolean) => void;
  setCurrentAyahIndex: (index: number) => void;
  setCurrentSessionLoop: (loop: number) => void;
  setIsPlaying: (playing: boolean) => void;
  setIsCompleted: (completed: boolean) => void;
  resetSession: () => void;
}

export const useMurajaahStore = create<MurajaahState>((set) => ({
  selectedSurahNumbers: [],
  sessionLoops: 1,
  sessionStarted: false,
  currentAyahIndex: 0,
  currentSessionLoop: 0,
  isPlaying: false,
  isCompleted: false,

  toggleSurah: (surahNumber) =>
    set((state) => {
      const has = state.selectedSurahNumbers.includes(surahNumber);
      const selectedSurahNumbers = has
        ? state.selectedSurahNumbers.filter((n) => n !== surahNumber)
        : [...state.selectedSurahNumbers, surahNumber].sort((a, b) => a - b);
      return { selectedSurahNumbers };
    }),

  clearSelection: () =>
    set({
      selectedSurahNumbers: [],
      sessionStarted: false,
      currentAyahIndex: 0,
      currentSessionLoop: 0,
      isPlaying: false,
      isCompleted: false,
    }),

  setSessionLoops: (count) => set({ sessionLoops: Math.max(1, count) }),

  setSessionStarted: (started) => set({ sessionStarted: started }),

  setCurrentAyahIndex: (index) => set({ currentAyahIndex: Math.max(0, index) }),

  setCurrentSessionLoop: (loop) => set({ currentSessionLoop: Math.max(0, loop) }),

  setIsPlaying: (playing) => set({ isPlaying: playing }),

  setIsCompleted: (completed) => set({ isCompleted: completed }),

  resetSession: () =>
    set({
      currentAyahIndex: 0,
      currentSessionLoop: 0,
      isPlaying: false,
      isCompleted: false,
    }),
}));
