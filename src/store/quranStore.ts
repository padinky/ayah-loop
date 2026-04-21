import { create } from 'zustand';

export interface Surah {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: string;
}

export interface Ayah {
  number: number;
  numberInSurah: number;
  text: string;
  translation?: string;
  audio?: string;
}

export interface RepeatConfig {
  ayahs: Record<string, number>;
  range: number;
}

export interface Reciter {
  identifier: string;
  language: string;
  name: string;
  englishName: string;
  format: string;
  type: string;
}

export interface YouTubeLink {
  id: string;
  url: string;
  videoId: string;
  loopCount: number;
}

export interface QuranState {
  sessionMode: 'quran' | 'youtube';
  selectedSurah: Surah | null;
  selectedReciter: Reciter | null;
  ayahs: Ayah[];
  selectedAyahs: number[];
  repeatConfig: RepeatConfig;
  currentAyah: number | null;
  isPlaying: boolean;
  currentRepeat: number;
  rangeRepeat: number;
  youtubeLinks: YouTubeLink[];
  youtubeSessionLoops: number;
  currentLinkIndex: number;
  currentLinkLoop: number;
  currentSessionLoop: number;
  
  setSessionMode: (mode: 'quran' | 'youtube') => void;
  setSelectedSurah: (surah: Surah) => void;
  setSelectedReciter: (reciter: Reciter) => void;
  setAyahs: (ayahs: Ayah[]) => void;
  toggleAyahSelection: (ayahNumber: number) => void;
  selectAllAyahs: () => void;
  setAyahRepeat: (ayahNumber: number, count: number) => void;
  setRangeRepeat: (count: number) => void;
  setCurrentAyah: (ayahNumber: number | null) => void;
  setIsPlaying: (playing: boolean) => void;
  incrementCurrentRepeat: () => void;
  incrementRangeRepeat: () => void;
  resetMemorization: () => void;
  resetCurrentRepeat: () => void;
  setYouTubeLinks: (links: YouTubeLink[]) => void;
  setYouTubeSessionLoops: (count: number) => void;
  setCurrentLinkIndex: (index: number) => void;
  setCurrentLinkLoop: (count: number) => void;
  setCurrentSessionLoop: (count: number) => void;
  resetYouTubeSession: () => void;
}

export const useQuranStore = create<QuranState>((set) => ({
  sessionMode: 'quran',
  selectedSurah: null,
  selectedReciter: {
    identifier: "ar.alafasy",
    language: "ar",
    name: "العفاسي",
    englishName: "Alafasy",
    format: "audio",
    type: "versebyverse"
  },
  ayahs: [],
  selectedAyahs: [],
  repeatConfig: {
    ayahs: {},
    range: 1
  },
  currentAyah: null,
  isPlaying: false,
  currentRepeat: 0,
  rangeRepeat: 0,
  youtubeLinks: [],
  youtubeSessionLoops: 1,
  currentLinkIndex: 0,
  currentLinkLoop: 0,
  currentSessionLoop: 0,

  setSessionMode: (mode) => set({ sessionMode: mode }),

  setSelectedSurah: (surah) => set({ selectedSurah: surah }),
  
  setSelectedReciter: (reciter) => set({ selectedReciter: reciter }),
  
  setAyahs: (ayahs) => set({ ayahs }),
  
  toggleAyahSelection: (ayahNumber) => 
    set((state) => ({
      selectedAyahs: state.selectedAyahs.includes(ayahNumber)
        ? state.selectedAyahs.filter(num => num !== ayahNumber)
        : [...state.selectedAyahs, ayahNumber].sort((a, b) => a - b)
    })),
    
  selectAllAyahs: () =>
    set((state) => {
      const allAyahNumbers = state.ayahs.map(ayah => ayah.numberInSurah);
      const newRepeatConfig = { ...state.repeatConfig };
      
      // Set repeat count to 1 for each ayah if not already set
      allAyahNumbers.forEach(ayahNumber => {
        if (!newRepeatConfig.ayahs[ayahNumber]) {
          newRepeatConfig.ayahs[ayahNumber] = 1;
        }
      });
      
      return {
        selectedAyahs: allAyahNumbers,
        repeatConfig: newRepeatConfig
      };
    }),
    
  setAyahRepeat: (ayahNumber, count) =>
    set((state) => ({
      repeatConfig: {
        ...state.repeatConfig,
        ayahs: {
          ...state.repeatConfig.ayahs,
          [ayahNumber]: count
        }
      }
    })),
    
  setRangeRepeat: (count) =>
    set((state) => ({
      repeatConfig: {
        ...state.repeatConfig,
        range: count
      }
    })),
    
  setCurrentAyah: (ayahNumber) => set({ currentAyah: ayahNumber }),
  
  setIsPlaying: (playing) => set({ isPlaying: playing }),
  
  incrementCurrentRepeat: () => set((state) => ({ currentRepeat: state.currentRepeat + 1 })),
  
  incrementRangeRepeat: () => set((state) => ({ rangeRepeat: state.rangeRepeat + 1 })),
  
  resetMemorization: () => set({ 
    currentAyah: null, 
    isPlaying: false, 
    currentRepeat: 0, 
    rangeRepeat: 0,
    currentLinkIndex: 0,
    currentLinkLoop: 0,
    currentSessionLoop: 0
  }),
  
  resetCurrentRepeat: () => set({ currentRepeat: 0 }),

  setYouTubeLinks: (links) => set({ youtubeLinks: links }),

  setYouTubeSessionLoops: (count) => set({ youtubeSessionLoops: Math.max(1, count) }),

  setCurrentLinkIndex: (index) => set({ currentLinkIndex: Math.max(0, index) }),

  setCurrentLinkLoop: (count) => set({ currentLinkLoop: Math.max(0, count) }),

  setCurrentSessionLoop: (count) => set({ currentSessionLoop: Math.max(0, count) }),

  resetYouTubeSession: () => set({
    currentLinkIndex: 0,
    currentLinkLoop: 0,
    currentSessionLoop: 0,
    isPlaying: false
  })
}));