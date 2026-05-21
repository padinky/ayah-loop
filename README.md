# Hafalan Project

Web app untuk membantu **mengulang dan menghafal Al-Qur'an**, dengan tiga bagian utama:

## Fitur

- **Menghafal** — pilih surah, ayat, qari, pengulangan; sesi di `/memorize`.
- **Murajaah** — dengarkan berurutan: **Quran** (API) atau **YouTube** (link + loop).
- **Latihan** — #SambungAyat dan #SambungSurat (soal acak dari hafalan).

Permintaan API diatur antrean agar menghindari error 429 saat banyak surah dipilih.

## Pengembangan lokal

```sh
npm install
npm run dev      # http://localhost:8080
npm run build
npm run lint
```

## Dokumentasi untuk kontributor & AI

| Dokumen | Isi |
|---------|-----|
| [AGENTS.md](./AGENTS.md) | Arsitektur, alur fitur, state, API, antrean fetch |
| [.cursor/rules/ayah-loop.mdc](./.cursor/rules/ayah-loop.mdc) | Ringkasan untuk Cursor |

## Teknologi

Vite, React, TypeScript, Tailwind CSS, shadcn/ui, Zustand, TanStack Query, React Router.

Data & audio: [Al-Qur'an Cloud API](https://alquran.cloud).

## Deploy

Build statis: `npm run build`, host folder `dist/`.
