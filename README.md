# Kyuka Ramen Virtual (Kyumen)

キュウカ ラーメン バーチャル 「仮想店舗」

Kantor virtual 3D untuk brand **Kyuka Ramen**: kedai Jepang 3 lantai di dermaga, berisi 19 agent AI berbentuk naga biru chibi dan staff manusia. Dikembangkan dari kode Hive Colony, lalu diganti total temanya.

Situs (setelah GitHub Pages aktif): https://achphoria.github.io/kyumen/

## Struktur tim: 6 divisi, 19 agent

| Divisi | Agent |
|---|---|
| 👑 Chief | **Ryu** (naga besar bermahkota, memimpin & mendelegasikan) |
| 🏮 Store | Mochi (Store Manager), Sensei (Trainer), Kumo (Planner), Yuzu (Customer Service) |
| 🍜 Supply Chain | Taishō (Central Kitchen Manager), Nori (Supply Chain Manager), Hikari (SC Planner) |
| 🎨 Marketing | Sora (Content), Hana (Visual Design), Kaze (Ads & Promo), Hoshi (Social Media & Community) |
| 💰 Finance | Koban (Accounting), Masu (Cost Control / HPP), Zeni (Sales & Cashier Analyst) |
| 🧑‍💼 HR | Tama (HR Manager), Aoi (Recruitment), Kiku (Payroll & Absensi), Sakura (People & Culture) |

## Denah kedai

| Lantai | Ruangan |
|---|---|
| Lantai 3 | Ruang Rapat Tatami, Ruang Chief, Taman Zen |
| Lantai 2 (Workspace 職場) | Marketing Studio, Finance Room, HR Room, Papan Misi |
| Lantai 1 | Genkan, Store Office, Kedai Kyuka (bar ramen), Dojo Latihan, Ruang Istirahat, Ruang Server |
| Gedung samping | Central Kitchen, Main Warehouse |

## Fitur (warisan Hive Colony)

- Diorama 3D dengan siklus siang-malam mengikuti WIB, dinding cutaway, pilih lantai, klik ruangan/agent.
- **Ruang Tatami** (`#/hall`): rapat suara (LiveKit), transkrip, notulen otomatis oleh Ryu, papan rencana, kalender, persetujuan, arsip rapat.
- **Ruang Kerja** (`#/agent/<id>`): chat dengan agent, lampiran, suara, simpan hasil, jadikan tugas, latih agent (skill & pelajaran), tugas rutin.
- **Akses agent** (`#/akses`), undang staff (`#/undang`), avatar staff (`#/avatar`), Mode TV (`#/tv`).
- Wajib login (Supabase Auth).

## Menjalankan secara lokal

```bash
npm install
npm run dev
```

Buka http://localhost:5173/kyumen/ (port mengikuti Vite).

Mode pengembangan saja (tidak ikut build publik):
- `#/demo`: lihat kedai 3D tanpa login
- `#/queen`: pratinjau model Ryu & naga kru

## Backend (Supabase project ACHPHORIA)

Kyumen memakai project Supabase **ACHPHORIA** (`ckoejqzownrujikefgwb`) bersama ERP. Semua tabel Kyumen berawalan `hc_` dan dijaga RLS, jadi tidak menyentuh tabel ERP. Akun login (Supabase Auth) berbagi dengan ERP, tapi masuk Kyumen tetap wajib kode undangan (`hc_profiles`).

- Migrasi: `supabase/migrations/` (dimulai dari `20261013070000_kyumen_base.sql`).
- Edge Functions: `ryu`, `agent-chat` (verify JWT mati: dipanggil trigger & n8n dengan header `x-hive-secret`), `meeting-recap`, `livekit-token`.
- Secret Edge Function yang wajib diisi di dashboard: `ANTHROPIC_API_KEY`, `LIVEKIT_URL`, `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET`.
- Vault: `hive_n8n_url` (alamat n8n) dan `hive_webhook_secret` (dibuat acak; ambil nilainya lewat SQL Editor `select public.hive_webhook_secret();` lalu tempel di credential n8n "Kyumen Webhook Secret").
- n8n: impor `n8n/workflows/kyumen-*.json` (webhook di jalur `/webhook/kyumen/...`), lihat [n8n/README.md](n8n/README.md).
- Auth → URL Configuration: tambahkan `https://achphoria.github.io/kyumen/` ke Redirect URLs supaya link konfirmasi email kembali ke Kyumen.

## Struktur kode

| Folder | Isi |
|---|---|
| `src/data/hive.js` | Divisi, 19 agent, denah ruangan, posisi meja, template misi |
| `src/sim/engine.js` | Mesin simulasi (gerak, istirahat, rapat, misi) |
| `src/scene/` | Scene 3D: kedai, dermaga, naga (`Dragon.jsx`), Ryu (`QueenBea.jsx`), furnitur, Ruang Tatami |
| `src/ui/`, `src/hall/` | HUD, Ruang Tatami, Ruang Kerja, login & undangan |
| `supabase/` | Migrasi, Edge Functions, template email |

Deploy otomatis ke GitHub Pages lewat `.github/workflows/deploy.yml` setiap push ke `main`.

Keputusan desain ada di [DESIGN.md](DESIGN.md), riwayat di [CHANGELOG.md](CHANGELOG.md).
