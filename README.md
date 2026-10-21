# KYUMEN Holding (Kyuka Ramen)

キュウカ ラーメン バーチャル 「仮想店舗」

Kantor virtual 3D untuk brand **Kyuka Ramen**: **KYUMEN Holding**, kompleks Jepang bertingkat yang menempel di muka tebing di atas lautan awan, berisi 19 agent AI berbentuk naga biru chibi dan staff manusia. Dikembangkan dari kode Hive Colony, lalu diganti total temanya.

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

## Denah KYUMEN Holding

| Lantai | Ruangan |
|---|---|
| Puncak tebing | Ruang Chief (paviliun Ryu), Taman Zen |
| Lantai 4 | Marketing Studio, Ruang Rapat Tatami, Finance Room |
| Lantai 3 | Dojo Latihan, Ruang Server, Papan Misi |
| Lantai 2 | Store Office, Ruang Istirahat, HR Room |
| Lantai 1 | Genkan, Bar Ramen, Engawa |
| Tebing seberang (jembatan tali dari Engawa) | Central Kitchen, Main Warehouse |

Tiap lantai punya selasar kayu di depan; antar lantai ada tangga zig-zag di sisi tebing. Tamu naik tangga batu dari balik awan ke Genkan.

## Fitur (warisan Hive Colony)

- Diorama 3D dengan siklus siang-malam mengikuti WIB, dinding cutaway, pilih lantai, klik ruangan/agent.
- **Pintu utama** (dock bawah): Ruang Tatami, Ruang Kerja, Workshop, Portal saya, dan Employee (owner & kepala divisi).
- **Ruang Tatami** (`#/hall`): rapat video Cloudflare (atau rapat suara LiveKit lewat flag), transkrip, Ryu ikut rapat, notulen otomatis, papan rencana, kalender rapat, persetujuan, arsip rapat (+ rekaman).
- **Rapat video** (`#/rapat/<id>`): grid dengan pembicara aktif membesar, mic/kamera/share screen, host bisa mematikan mic & mengeluarkan peserta, chat, rekaman opsional. Lihat [docs/VIDEO-CLOUDFLARE.md](docs/VIDEO-CLOUDFLARE.md).
- **Ryu ketua tim**: membagi permintaan kerja ke maks. 5 agent, membaca hasil tugas 2 hari terakhir, lalu mengirim rekap + lampiran (dan poster SVG untuk paket visual) ke percakapan begitu semua tugas selesai.
- **Workshop** (`#/workshop`): satu permintaan = satu tiket. Ryu memecahnya jadi tugas; tiap tiket punya tab Rapat (chat Ryu), Kerja (papan tugas agent), dan Laporan (rekap & hasil). Peta tim menampilkan agent yang sedang bekerja.
- **Ruang Kerja** (`#/agent/<id>`): chat dengan agent, percakapan terakhir terbuka lagi setelah refresh, penampil lampiran (dokumen & gambar), progres tugas, satu agent satu tugas (kunci sibuk 30 menit), latih agent (skill & pelajaran), tugas rutin.
- **Papan misi**: tugas yang berjalan + yang baru selesai (±10 menit), dengan progres sungguhan.
- **Employee** (`#/employee`): data karyawan wajib lengkap (nama lengkap & panggilan, gender, TTL, foto, email, telepon, kontak darurat), lalu undangan dikirim ke email. Karyawan masuk lewat link email dan langsung membuat password.
- Semua konfirmasi memakai dialog Kyumen (bukan popup bawaan browser).
- **Akses agent** (`#/akses`), avatar staff (`#/avatar`), Mode TV (`#/tv`). Wajib login (Supabase Auth).

## Menjalankan secara lokal

```bash
npm install
npm run dev
npm test        # tes papan misi, protokol tugas, panggilan "Ryu", simulasi selesai tugas
```

Rapat video di lokal: `VITE_VIDEO_PROVIDER=cloudflare npm run dev` (tanpa env = LiveKit).

Buka http://localhost:5173/kyumen/ (port mengikuti Vite).

Mode pengembangan saja (tidak ikut build publik):
- `#/demo`: lihat kedai 3D tanpa login
- `#/queen`: pratinjau model Ryu & naga kru

## Backend (Supabase project ACHPHORIA)

Kyumen memakai project Supabase **ACHPHORIA** (`ckoejqzownrujikefgwb`) bersama ERP. Semua tabel Kyumen berawalan `hc_` dan dijaga RLS, jadi tidak menyentuh tabel ERP. Akun login (Supabase Auth) berbagi dengan ERP, tapi masuk Kyumen tetap wajib kode undangan (`hc_profiles`).

- Migrasi: `supabase/migrations/` (dimulai dari `20261013070000_kyumen_base.sql`).
- Edge Functions: `ryu`, `agent-chat` (verify JWT mati: dipanggil trigger & n8n dengan header `x-hive-secret`), `meeting-recap`, `livekit-token`, `realtime-session`, `employee-invite`. Logika bersama ada di `supabase/functions/_shared/` (ikut ter-deploy bersama fungsi).
- Secret Edge Function yang wajib diisi di dashboard: `ANTHROPIC_API_KEY`, `LIVEKIT_URL`, `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET` (cadangan), `CLOUDFLARE_REALTIME_APP_ID`, `CLOUDFLARE_REALTIME_APP_TOKEN`, `CLOUDFLARE_TURN_KEY_ID`, `CLOUDFLARE_TURN_KEY_API_TOKEN`. Opsional: `VIDEO_PROVIDER=cloudflare`, `KYUMEN_SITE_URL`.
- Template email undangan Employee: tempel `supabase/email-templates/achphoria-invite-user.html` (dan subject `achphoria-invite-user.subject.txt`) ke Auth → Emails → Invite user. Template ini gabungan: undangan dari Kyumen bertema Kyuka Ramen, undangan lain (ERP) tetap template bawaan. Email undangan butuh SMTP sendiri (SMTP bawaan Supabase hanya mengirim ke anggota tim project).
- Vault: `hive_n8n_url` (alamat n8n) dan `hive_webhook_secret` (dibuat acak; ambil nilainya lewat SQL Editor `select public.hive_webhook_secret();` lalu tempel di credential n8n "Kyumen Webhook Secret").
- n8n: impor `n8n/workflows/kyumen-*.json` (webhook di jalur `/webhook/kyumen/...`), lihat [n8n/README.md](n8n/README.md).
- Auth → URL Configuration: tambahkan `https://achphoria.github.io/kyumen/` ke Redirect URLs supaya link konfirmasi email kembali ke Kyumen.

## Struktur kode

| Folder | Isi |
|---|---|
| `src/data/hive.js` | Divisi, 19 agent, denah ruangan, posisi meja, template misi |
| `src/sim/engine.js` | Mesin simulasi (gerak, istirahat, rapat, misi) |
| `src/scene/` | Scene 3D: kedai, dermaga, naga (`Dragon.jsx`), Ryu (`QueenBea.jsx`), furnitur, Ruang Tatami |
| `src/ui/`, `src/hall/` | HUD, Ruang Tatami, Ruang Kerja, Workshop, Employee, dialog, login |
| `src/hall/rtc/` | Rapat video Cloudflare (koneksi SFU, transkrip & Ryu, rekaman) |
| `supabase/` | Migrasi, Edge Functions, template email |

Deploy otomatis ke GitHub Pages lewat `.github/workflows/deploy.yml` setiap push ke `main`.

Keputusan desain ada di [DESIGN.md](DESIGN.md), riwayat di [CHANGELOG.md](CHANGELOG.md).
