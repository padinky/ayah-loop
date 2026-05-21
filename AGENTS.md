# Hafalan Project — Agent Context

Indonesian-language web app that helps users **repeat and memorize Qur’an** via audio loops, optional YouTube clips, and practice drills (**Sambung Ayat**, **Sambung Surat**, **Murajaah**).

## Quick start

```bash
npm install
npm run dev    # Vite on http://localhost:8080
npm run build
npm run lint
```

Path alias: `@/` → `src/` (see `vite.config.ts`).

## Tech stack

| Layer | Choice |
|--------|--------|
| Build | Vite 5 + `@vitejs/plugin-react-swc` |
| UI | React 18, TypeScript, Tailwind, shadcn/ui (`src/components/ui/`) |
| Routing | `react-router-dom` |
| Server state | TanStack Query (`src/lib/queryClient.ts`) |
| Client state | Zustand (per-feature stores + `quranStore`) |
| HTTP | Axios → [Al-Qur’an Cloud API](https://alquran.cloud), throttled via `surahFetchQueue` |
| Origins | Lovable project; treat this file as source of truth |

## Routes (`src/App.tsx`)

Shell: `AppLayout` — nav **Menghafal | Murajaah | Latihan** (+ Tentang, theme).

| Path | Page | Purpose |
|------|------|---------|
| `/` | `Home.tsx` (`Menghafal`) | Pick surah/ayah/repeat → `/memorize` |
| `/murajaah` | `MurajaahHub.tsx` | Choose Quran vs YouTube source |
| `/murajaah/quran` | `Murajaah.tsx` | Sequential surah playback (API) |
| `/murajaah/youtube` | `MurajaahYouTube.tsx` | YouTube link loop setup |
| `/latihan` | `LatihanHub.tsx` | Links to Sambung modes |
| `/sambung-ayat` | `SambungAyat.tsx` | Next ayah quiz |
| `/sambung-surat` | `SambungSurat.tsx` | End surah → next surah ayah 1 |
| `/memorize` | `Memorize.tsx` | Session (outside layout; quran or youtube) |
| `/about` | `About.tsx` | Credits, APIs |
| `*` | `NotFound.tsx` | 404 |

## Product flows

### 1. Quran memorization loop (`sessionMode: 'quran'`)

1. **Home**: pick surah → `quranApi.getCombinedSurahData` (queued).
2. Select ayahs, per-ayah and range repeat (`repeatConfig` in `quranStore`).
3. **Memorize**: `AudioPlayer` plays selection with repeat counters.

Default reciter: `ar.alafasy` in `quranStore`.

### 2. Murajaah (`/murajaah`)

Hub then:

- **Quran** (`/murajaah/quran`) — `murajaahStore` + `MurajaahPlayer`
- **YouTube** (`/murajaah/youtube`) — `YouTubeSetupCard` → `/memorize` with `sessionMode: 'youtube'` + `YouTubeLoopPlayer`; playlist `ustHanifPlaylist.ts`

### 3. Sambung Ayat (`/sambung-ayat`)

Store: `sambungAyatStore`. Logic: `src/lib/sambungAyatRound.ts`. Eligible surahs: ≥ 2 ayahs.

- Random prompt ayah (not last); answer = next ayah in **same** surah.
- **Lazy fetch**: only current round’s surah via `useQuery` + `combinedSurahQueryKey` (not bulk `useQueries`).

### 4. Sambung Surat (`/sambung-surat`)

Store: `sambungSuratStore`. Logic: `src/lib/sambungSuratRound.ts`. Eligible: selected surah `< 114`.

- Prompt = **last ayah** of surah N; answer = **ayah 1** of surah N+1 (Mushaf order).
- Lazy fetch: surah N + N+1 per round through `surahFetchQueue`.

### 3. Latihan (`/latihan`)

Hub → `/sambung-ayat` or `/sambung-surat`. Stores: `sambungAyatStore`, `sambungSuratStore`.

## API rate limiting

- `getSurahData`: 3 edition requests **in series** per surah (was parallel).
- `getCombinedSurahData`: wrapped in `fetchCombinedSurahQueued` (`src/lib/surahFetchQueue.ts`) — max 1 surah fetch at a time app-wide.
- React Query: 429 retry with backoff in `src/lib/queryClient.ts`; surah ayah `staleTime` 24h (`SURAH_STALE_TIME`).
- Shared cache key: `["surah", "combined", surahNumber, reciterId]`.

## State (Zustand)

| Store | Used by |
|-------|---------|
| `quranStore` | Home, Memorize, reciter default for drills |
| `sambungAyatStore` | Sambung Ayat |
| `sambungSuratStore` | Sambung Surat |
| `murajaahStore` | Murajaah |

Do not merge without explicit refactor.

## External API (`src/services/quranApi.ts`)

Base: `https://api.alquran.cloud/v1` — surah list, reciters, per-surah Arabic / `id.indonesian` / reciter audio.

## Directory map

```
src/
  pages/          Home, Memorize, SambungAyat, SambungSurat, Murajaah, About, NotFound
  components/     SurahMultiSelect, MurajaahPlayer, feature UI
  store/          quranStore, sambungAyatStore, sambungSuratStore, murajaahStore
  services/       quranApi
  lib/            surahFetchQueue, surahQueryKeys, queryClient, *Round, murajaahPlaylist, ayahMap
```

## UI & copy conventions

- **Indonesian** user-facing strings.
- Arabic: `font-arabic-quran`.
- Shared multi-surah picker: `SurahMultiSelect.tsx`.

## When changing code

- New routes above `*` in `App.tsx`.
- New surah fetches: use `quranApi.getCombinedSurahData` (queued), not raw axios.
- Drill random logic in `src/lib/*Round.ts`.
- Minimize diff; match existing patterns.

## Deployment

`npm run build` → static `dist/` for any static host.
