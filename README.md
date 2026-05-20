# Ayah Loop (Hafalan)

Web app untuk membantu **mengulang dan menghafal Al-Qur'an**: loop audio per ayat, mode YouTube, dan tiga latihan tambahan.

## Fitur

- **Mode Quran** — pilih surah, ayat, qari, pengulangan per ayat/blok; putar di halaman hafalan.
- **Mode YouTube** — link dengan loop per video dan per sesi; playlist Ust. Hanif.
- **#SambungAyat** — soal acak: sambung ayat berikutnya dalam satu surah.
- **#SambungSurat** — akhir surah → awal surah berikutnya (urutan Mushaf).
- **#Murajaah Quran** — putar semua ayat surah pilihan berurutan (nomor surah naik), dengan ulang sesi.

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
