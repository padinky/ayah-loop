import axios from 'axios';
import { Surah, Ayah, Reciter } from '../store/quranStore';

const BASE_URL = 'https://api.alquran.cloud/v1';

export interface SurahResponse {
  code: number;
  status: string;
  data: {
    number: number;
    name: string;
    englishName: string;
    englishNameTranslation: string;
    numberOfAyahs: number;
    revelationType: string;
    ayahs: Array<{
      number: number;
      numberInSurah: number;
      text: string;
      audio?: string;
    }>;
  };
}

export interface SurahListResponse {
  code: number;
  status: string;
  data: Array<{
    number: number;
    name: string;
    englishName: string;
    englishNameTranslation: string;
    numberOfAyahs: number;
    revelationType: string;
  }>;
}

export interface ReciterListResponse {
  code: number;
  status: string;
  data: Array<{
    identifier: string;
    language: string;
    name: string;
    englishName: string;
    format: string;
    type: string;
  }>;
}

export const quranApi = {
  async getSurahs(): Promise<Surah[]> {
    try {
      const response = await axios.get<SurahListResponse>(`${BASE_URL}/surah`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching surahs:', error);
      throw new Error('Failed to fetch Surahs');
    }
  },

  async getReciters(): Promise<Reciter[]> {
    try {
      const response = await axios.get<ReciterListResponse>(`${BASE_URL}/edition?format=audio&language=ar&type=versebyverse`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching reciters:', error);
      throw new Error('Failed to fetch Reciters');
    }
  },

  async getSurahData(surahNumber: number, reciterIdentifier: string = 'ar.alafasy'): Promise<{
    arabic: Ayah[];
    translation: Ayah[];
    audio: Ayah[];
  }> {
    try {
      const [arabicRes, translationRes, audioRes] = await Promise.all([
        axios.get<SurahResponse>(`${BASE_URL}/surah/${surahNumber}`),
        axios.get<SurahResponse>(`${BASE_URL}/surah/${surahNumber}/id.indonesian`),
        axios.get<SurahResponse>(`${BASE_URL}/surah/${surahNumber}/${reciterIdentifier}`)
      ]);

      const arabic = arabicRes.data.data.ayahs.map(ayah => ({
        number: ayah.number,
        numberInSurah: ayah.numberInSurah,
        text: ayah.text
      }));

      const translation = translationRes.data.data.ayahs.map(ayah => ({
        number: ayah.number,
        numberInSurah: ayah.numberInSurah,
        text: ayah.text
      }));

      const audio = audioRes.data.data.ayahs.map(ayah => ({
        number: ayah.number,
        numberInSurah: ayah.numberInSurah,
        text: '',
        audio: ayah.audio || ''
      }));

      return { arabic, translation, audio };
    } catch (error) {
      console.error('Error fetching surah data:', error);
      throw new Error('Failed to fetch Surah data');
    }
  },

  async getCombinedSurahData(surahNumber: number, reciterIdentifier?: string): Promise<Ayah[]> {
    const { arabic, translation, audio } = await this.getSurahData(surahNumber, reciterIdentifier);
    
    return arabic.map((ayah, index) => ({
      ...ayah,
      translation: translation[index]?.text || '',
      audio: audio[index]?.audio || ''
    }));
  }
};