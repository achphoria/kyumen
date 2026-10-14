# Changelog

## Tahap 3: fitur terbaru dari Hive Colony (tanpa Grok Bot)

- **⚡ Mode hemat** di rak alat: tanpa efek cahaya & bayangan, resolusi 1x, untuk laptop/TV yang berat (tersimpan per browser).
- **🗣 Mode percakapan suara** di Ruang Kerja: bicara, terkirim otomatis setelah diam ±1,5 detik, jawaban dibacakan, mikrofon menyala lagi; bisa disela dengan spasi.
- **📊 Statistik** (owner, `#/statistik`): pesan per agent & staff, tugas, gagal, waktu balas, perkiraan token, grafik harian; **batas pesan harian per staff**.
- **Ruang Kerja**: cari di semua percakapan, sematkan & ganti judul, unduh percakapan (.md), sisa kuota hari ini.
- Database: migrasi `20261014090000_hc_stats_limits_threads.sql`; Edge Function `agent-chat` menegakkan kuota harian.

## Tahap 2: kru kedai, tangga, tebing, dan lebih ringan

- Karakter dirombak total: agent AI, Ryu, dan avatar staff kini kru kedai ramen chibi (happi, celemek, baju koki, jinbei, kimono; hachimaki, tenugui, topi koki). Agent AI bermata biru menyala; Ryu berhaori navy dengan naga biru kecil (maskot) di bahu.
- Pembuat avatar baru: pratinjau 3D, pilihan seragam/penutup kepala/barang di tangan, 6 joget festival (Bon Odori, Soran Bushi, Tumbuk Mochi, Seruput Ramen, Kanpai, Banzai). Avatar lama dipetakan otomatis.
- Lift dihapus: agent berjalan kaki lewat pintu antar-ruangan, teras barat, dan dua tangga luar; jembatan kayu ke Central Kitchen & Main Warehouse. Denah baru: Papan Misi & Ruang Server di lantai 2, Engawa (teras) di lantai 1.
- Papan nama pindah dari atap ke pojok dermaga.
- Daratan jadi tebing berbatu tinggi di atas laut, tepi laut ditutup awan/kabut.
- Mode TV hanya berkeliling kantor (orbit, tur lantai, geser menyusuri dermaga).
- Performa: dinding shoji bertekstur (1 mesh per bidang), detail wajah karakter hanya saat kamera dekat, bagian statis digabung, MSAA pasca-proses dimatikan, bayangan diperbarui 3x per detik.

## Tahap 1: fork dari Hive Colony, rebrand Kyumen

- Kode diambil dari Hive Colony (kantor virtual 3D + agent AI), lalu diganti total ke brand **Kyuka Ramen Virtual**.
- Struktur baru: 6 divisi, 19 agent (Ryu + 18 agent): Store (4), Supply Chain (3), Marketing (4), Finance (3), HR (4).
- Maskot naga biru chibi menggantikan lebah; Ryu punya model khusus (mahkota, haori, kumis).
- Gedung 3D baru: kedai Jepang 3 lantai bergrid kotak (bukan sarang heksagon), atap genteng, dinding shoji, papan nama "KYUKA RAMEN VIRTUAL".
- Dunia baru: dermaga di atas laut, Central Kitchen & Main Warehouse beratap merah, torii, mercusuar, perahu, patung naga, gerobak pengantar.
- Ruang rapat 3D (Ruang Tatami): lantai tatami, dinding shoji, meja rendah, lentera kertas.
- Tema UI navy + merah lentera; Edge Function `queen-bea` menjadi `ryu`; webhook n8n memakai jalur `/webhook/kyumen/...`.
- Mode pengembangan: `#/demo` menampilkan kedai 3D tanpa login, `#/queen` pratinjau model naga.
