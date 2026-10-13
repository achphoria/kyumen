// Kyuka Ramen Virtual (Kyumen): struktur kedai, agent naga, dan misi simulasi.

export const CELL = 9.6; // jarak antar ruangan (grid kotak)
export const HALF = 4.6; // setengah lebar lantai ruangan (kotak)
export const ROOM_R = 4.7; // radius acuan furnitur di dalam ruangan
export const APOTHEM = HALF; // jarak dinding dari tengah ruangan
export const TIER_GAP = 5.6;
export const WALL_H = 1.8;
export const LIFT_X = -18.6; // menara naga (jalur antar lantai) di sisi kiri kedai
export const SIDE_X = 24; // gedung Central Kitchen & Main Warehouse di dermaga kanan
export const tierY = (t) => t * TIER_GAP;
export const tierOf = (y) => Math.max(0, Math.min(2, Math.floor((y + 1.5) / TIER_GAP)));

// Siklus siang-malam
export const DAY_LEN = 240; // detik simulasi untuk satu hari penuh
export const isNightHour = (h) => h >= 20 || h < 5.5;
export const sunElevation = (h) => Math.sin(((h - 6) / 12) * Math.PI); // 1 = tengah hari, -1 = tengah malam
export function dayPhase(h) {
  if (h >= 5 && h < 7) return 'Fajar';
  if (h >= 7 && h < 11) return 'Pagi';
  if (h >= 11 && h < 15) return 'Siang';
  if (h >= 15 && h < 18) return 'Sore';
  if (h >= 18 && h < 20) return 'Senja';
  return 'Malam';
}

export const TIERS = [
  { id: 2, name: 'Lantai 3', sub: 'Ruang Chief & rapat' },
  { id: 1, name: 'Lantai 2', sub: 'Workspace 職場' },
  { id: 0, name: 'Lantai 1', sub: 'Kedai & Supply Chain' },
];

export const PALETTE = {
  navy: '#22324F',
  indigo: '#2E4A7D',
  lantern: '#E5483B',
  cream: '#F4EBDD',
  wood: '#B98A5A',
  tatami: '#C9CF8F',
  dragon: '#3B82D6',
};

export const DEPTS = {
  ceo: { name: 'Chief', short: 'Chief', color: '#1F3A68', acc: 'crown' },
  store: { name: 'Store Operations', short: 'Store', color: '#E5483B', acc: 'hachimaki' },
  scm: { name: 'Supply Chain (Central Kitchen & Main Warehouse)', short: 'Supply Chain', color: '#D9822B', acc: 'hardhat' },
  mkt: { name: 'Marketing & Creative', short: 'Marketing', color: '#C2477D', acc: 'beret' },
  fin: { name: 'Finance', short: 'Finance', color: '#3A8F6B', acc: 'glasses' },
  hr: { name: 'Human Resources', short: 'HR', color: '#7A5BC7', acc: 'scarf' },
  guest: { name: 'Tamu', short: 'Tamu', color: '#C0C5CE', acc: 'none' },
};
export const DEPT_ORDER = ['ceo', 'store', 'scm', 'mkt', 'fin', 'hr'];

// warna sisik naga per varian (dipakai sebagai "skin")
export const SKINS = ['#3B82D6', '#4A90E2', '#2F6FC0', '#5A9BE6'];
export const HAIRS = ['#F4EBDD', '#F7EFE0', '#EFE3CF', '#F9F2E6'];

// room: ruangan meja agent (default ruangan divisinya); acc: aksesori khusus agent
export const AGENTS = [
  { id: 'ceo', nick: 'Ryu', role: 'Chief', dept: 'ceo', mode: 'Hybrid', desk: 'throne', skin: 0 },
  { id: 'store_mgr', nick: 'Mochi', role: 'Store Manager', dept: 'store', mode: 'Hybrid', desk: 'pod', skin: 1 },
  { id: 'trainer', nick: 'Sensei', role: 'Store Trainer', dept: 'store', mode: 'Hybrid', desk: 'pod', skin: 2 },
  { id: 'store_plan', nick: 'Kumo', role: 'Store Planner', dept: 'store', mode: 'Hybrid', desk: 'pod', skin: 3 },
  { id: 'cs', nick: 'Yuzu', role: 'Customer Service', dept: 'store', mode: 'Full AI', desk: 'booth', skin: 0, acc: 'headset' },
  { id: 'ck_mgr', nick: 'Taishō', role: 'Central Kitchen Manager', dept: 'scm', mode: 'Hybrid', desk: 'pod', skin: 1, room: 'ck', acc: 'chefhat' },
  { id: 'sc_mgr', nick: 'Nori', role: 'Supply Chain Manager', dept: 'scm', mode: 'Hybrid', desk: 'pod', skin: 2, room: 'wh' },
  { id: 'sc_plan', nick: 'Hikari', role: 'Supply Chain Planner', dept: 'scm', mode: 'Full AI', desk: 'standing', skin: 3, room: 'wh' },
  { id: 'content', nick: 'Sora', role: 'Content Creator', dept: 'mkt', mode: 'Hybrid', desk: 'standing', skin: 0 },
  { id: 'design', nick: 'Hana', role: 'Visual Designer', dept: 'mkt', mode: 'Hybrid', desk: 'standing', skin: 1 },
  { id: 'ads', nick: 'Kaze', role: 'Ads & Promo Strategist', dept: 'mkt', mode: 'Hybrid', desk: 'standing', skin: 2 },
  { id: 'social', nick: 'Hoshi', role: 'Social Media & Community', dept: 'mkt', mode: 'Full AI', desk: 'standing', skin: 3 },
  { id: 'accounting', nick: 'Koban', role: 'Accounting', dept: 'fin', mode: 'Hybrid', desk: 'pod', skin: 0 },
  { id: 'cost', nick: 'Masu', role: 'Cost Control (HPP & Food Cost)', dept: 'fin', mode: 'Hybrid', desk: 'pod', skin: 1 },
  { id: 'sales', nick: 'Zeni', role: 'Sales & Cashier Analyst', dept: 'fin', mode: 'Full AI', desk: 'pod', skin: 2 },
  { id: 'hr_mgr', nick: 'Tama', role: 'HR Manager', dept: 'hr', mode: 'Hybrid', desk: 'booth', skin: 3 },
  { id: 'recruit', nick: 'Aoi', role: 'Recruitment', dept: 'hr', mode: 'Hybrid', desk: 'pod', skin: 0 },
  { id: 'payroll', nick: 'Kiku', role: 'Payroll & Absensi', dept: 'hr', mode: 'Hybrid', desk: 'pod', skin: 1 },
  { id: 'culture', nick: 'Sakura', role: 'People & Culture', dept: 'hr', mode: 'Hybrid', desk: 'pod', skin: 2 },
];
export const AGENT_BY_ID = Object.fromEntries(AGENTS.map((a) => [a.id, a]));
export const agentAcc = (def) => def.acc || DEPTS[def.dept].acc;

// Agent yang tetap bekerja saat malam (jaga malam)
export const NIGHT_SHIFT = new Set(AGENTS.filter((a) => a.mode !== 'Hybrid').map((a) => a.id));

/* ---------- denah: grid kotak, gx = kolom (-1..1), row = 0 belakang / 1 depan ---------- */

export const gridToWorld = (gx, row) => [gx * CELL, (row - 0.5) * CELL];

const ROOMS = [
  // Lantai 1: kedai & ruang bersama
  { id: 'store', name: 'Store Office', tier: 0, gx: -1, row: 1, kind: 'dept', dept: 'store', desc: 'Kantor tim outlet: store manager, trainer, planner, dan customer service.' },
  { id: 'lobby', name: 'Genkan 玄関', tier: 0, gx: 0, row: 1, kind: 'lobby', desc: 'Pintu masuk kedai dan meja resepsionis.' },
  { id: 'lounge', name: 'Kedai Kyuka', tier: 0, gx: 1, row: 1, kind: 'lounge', desc: 'Bar ramen, tempat kru istirahat sambil makan.' },
  { id: 'gym', name: 'Dojo Latihan', tier: 0, gx: -1, row: 0, kind: 'gym', desc: 'Ruang latihan kru: teknik masak dan penyajian.' },
  { id: 'pods', name: 'Ruang Istirahat', tier: 0, gx: 0, row: 0, kind: 'pods', desc: 'Kapsul tidur ala Jepang untuk mengisi tenaga.' },
  { id: 'server', name: 'Ruang Server', tier: 0, gx: 1, row: 0, kind: 'server', desc: 'Rak server dan sistem kasir kedai.' },
  // Gedung samping di dermaga: Supply Chain
  { id: 'ck', name: 'Central Kitchen', tier: 0, x: SIDE_X, z: (1 - 0.5) * CELL, kind: 'dept', dept: 'scm', desc: 'Dapur pusat: produksi kuah, tare, mie, dan topping.' },
  { id: 'wh', name: 'Main Warehouse', tier: 0, x: SIDE_X, z: (0 - 0.5) * CELL, kind: 'dept', dept: 'scm', desc: 'Gudang utama: stok bahan, PO supplier, dan distribusi ke outlet.' },
  // Lantai 2: workspace
  { id: 'mkt', name: 'Marketing Studio', tier: 1, gx: -1, row: 1, kind: 'dept', dept: 'mkt', desc: 'Konten, desain, iklan, dan komunitas.' },
  { id: 'fin', name: 'Finance Room', tier: 1, gx: 0, row: 1, kind: 'dept', dept: 'fin', desc: 'Pembukuan, food cost, dan analisis penjualan.' },
  { id: 'hr', name: 'HR Room', tier: 1, gx: 1, row: 1, kind: 'dept', dept: 'hr', desc: 'Rekrutmen, payroll, absensi, dan budaya kerja.' },
  { id: 'mission', name: 'Papan Misi', tier: 1, gx: 0, row: 0, kind: 'mission', desc: 'Papan misi dan peta seluruh kedai.' },
  // Lantai 3: tatami
  { id: 'garden', name: 'Taman Zen', tier: 2, gx: -1, row: 1, kind: 'garden', desc: 'Taman batu di balkon atap, tempat mencari ide.' },
  { id: 'hall', name: 'Ruang Rapat Tatami', tier: 2, gx: 0, row: 1, kind: 'hall', desc: 'Ruang rapat lintas divisi dengan meja rendah.' },
  { id: 'royal', name: 'Ruang Chief', tier: 2, gx: 0, row: 0, kind: 'royal', dept: 'ceo', desc: 'Ruang kerja Ryu, asal semua misi.' },
];

export const ROOM_LIST = ROOMS.map((rm) => {
  const [x, z] = rm.x !== undefined ? [rm.x, rm.z] : gridToWorld(rm.gx, rm.row);
  return { ...rm, x, z, y: tierY(rm.tier) };
});
export const ROOM_BY_ID = Object.fromEntries(ROOM_LIST.map((r) => [r.id, r]));

// Tamu yang datang ke Genkan lewat tangga depan
const LOBBY = ROOM_BY_ID.lobby;
export const LOBBY_DOOR = [LOBBY.x, 0, LOBBY.z + HALF];
export const STAIR_Z = LOBBY.z + HALF + 0.2; // tangga turun dari pintu ke dermaga
const guestPath = (dx) => [
  [dx, -2.2, STAIR_Z + 13],
  [dx, -2.2, STAIR_Z + 4.2],
  [dx, 0, STAIR_Z + 0.1],
  [dx, 0, LOBBY.z + HALF - 1.0],
  [dx * 3.5, 0, LOBBY.z + 2.2],
  [dx * 2.5, 0, LOBBY.z + 1.6],
];
export const GUESTS = [
  { id: 'guest-a', nick: 'Tamu', role: 'Pelanggan', dept: 'guest', guest: true, skin: 1, path: guestPath(0.4) },
  { id: 'guest-b', nick: 'Tamu', role: 'Pelanggan', dept: 'guest', guest: true, skin: 3, path: guestPath(-0.4) },
];

const DEPT_ROOM = { ceo: 'royal', store: 'store', scm: 'wh', mkt: 'mkt', fin: 'fin', hr: 'hr' };
const homeRoom = (a) => a.room || DEPT_ROOM[a.dept];

// Meja tersusun melingkar di sisi belakang ruangan, agent menghadap ke tengah.
const DESK_R = 1.75;
const SEAT_R = 2.55;
export const SEATS = {};
export const SEATS_BY_ROOM = {};
for (const roomId of new Set(AGENTS.map(homeRoom))) {
  const room = ROOM_BY_ID[roomId];
  const list = AGENTS.filter((a) => homeRoom(a) === roomId);
  const n = list.length;
  const spread = (52 * Math.PI) / 180;
  const base = roomId === 'royal' ? -Math.PI / 2 : (-100 * Math.PI) / 180;
  SEATS_BY_ROOM[room.id] = [];
  list.forEach((agent, i) => {
    const a = base + (i - (n - 1) / 2) * spread;
    const c = Math.cos(a);
    const s = Math.sin(a);
    const seat = {
      agentId: agent.id,
      roomId: room.id,
      type: agent.desk,
      angle: a,
      deskLocal: [DESK_R * c, 0, DESK_R * s],
      deskRot: Math.atan2(c, s),
      deskWorld: [room.x + DESK_R * c, room.y, room.z + DESK_R * s],
      seat: [room.x + SEAT_R * c, room.y, room.z + SEAT_R * s],
      facing: Math.atan2(-c, -s),
    };
    SEATS[agent.id] = seat;
    SEATS_BY_ROOM[room.id].push(seat);
  });
}

// Titik berdiri di ruang bersama (melingkar, menghadap tengah).
const SPOT_CFG = {
  lounge: { r: 2.5, n: 6 },
  gym: { r: 2.55, n: 6 },
  pods: { r: 2.7, n: 6 },
  garden: { r: 2.6, n: 6 },
  hall: { r: 2.05, n: 6 },
  mission: { r: 2.45, n: 4, base: -90, step: 50 },
  lobby: { r: 2.4, n: 4, base: 0, step: 90 },
  server: { r: 2.3, n: 3, base: 30, step: 120 },
};
const spotCache = {};
export function roomSpots(roomId) {
  if (spotCache[roomId]) return spotCache[roomId];
  const room = ROOM_BY_ID[roomId];
  const cfg = SPOT_CFG[room.kind];
  const out = [];
  for (let i = 0; i < cfg.n; i++) {
    const deg = cfg.base !== undefined ? cfg.base + (i - (cfg.n - 1) / 2) * cfg.step : 30 + 60 * i;
    const a = (deg * Math.PI) / 180;
    const c = Math.cos(a);
    const s = Math.sin(a);
    out.push({ local: [cfg.r * c, 0, cfg.r * s], angle: a, facing: Math.atan2(-c, -s) });
  }
  spotCache[roomId] = out;
  return out;
}

// Template misi simulasi (bisnis ramen: outlet, central kitchen, gudang, marketing, finance, HR).
export const MISSIONS = [
  { lead: 'store_mgr', title: 'Cek checklist buka toko semua outlet' },
  { lead: 'store_mgr', title: 'Susun jadwal shift kru minggu depan', with: 'payroll' },
  { lead: 'trainer', title: 'Training standar penyajian ramen untuk 3 kru baru', with: 'recruit' },
  { lead: 'trainer', title: 'Buat kuis SOP kebersihan dapur outlet' },
  { lead: 'store_plan', title: 'Hitung target penjualan outlet bulan ini', with: 'sales' },
  { lead: 'store_plan', title: 'Rencanakan kebutuhan bahan harian outlet', with: 'sc_plan' },
  { lead: 'cs', title: 'Balas 24 chat & DM pelanggan' },
  { lead: 'cs', title: 'Tanggapi 5 review bintang 3 di Google Maps', with: 'store_mgr' },
  { lead: 'ck_mgr', title: 'Produksi 40 liter kuah tonkotsu' },
  { lead: 'ck_mgr', title: 'Uji rasa batch tare shoyu baru', with: 'cost' },
  { lead: 'sc_mgr', title: 'Terima kiriman tepung & daging dari supplier' },
  { lead: 'sc_mgr', title: 'Buat PO bahan untuk minggu depan', with: 'accounting' },
  { lead: 'sc_plan', title: 'Forecast kebutuhan mie untuk akhir pekan', with: 'store_plan' },
  { lead: 'sc_plan', title: 'Jadwalkan pengiriman CK ke semua outlet', with: 'ck_mgr' },
  { lead: 'content', title: 'Tulis skrip video "Behind the Bowl"' },
  { lead: 'content', title: 'Siapkan caption 7 hari konten IG', with: 'social' },
  { lead: 'design', title: 'Desain poster menu musiman', with: 'content' },
  { lead: 'design', title: 'Perbarui desain menu board outlet' },
  { lead: 'ads', title: 'Optimasi budget iklan Meta minggu ini', with: 'sales' },
  { lead: 'ads', title: 'Siapkan promo "Ramen Day" akhir bulan' },
  { lead: 'social', title: 'Hubungi 5 food vlogger untuk kolaborasi' },
  { lead: 'social', title: 'Pantau tren kuliner Jepang di TikTok' },
  { lead: 'accounting', title: 'Tutup buku harian semua outlet' },
  { lead: 'accounting', title: 'Rekap utang supplier bulan ini', with: 'sc_mgr' },
  { lead: 'cost', title: 'Hitung HPP menu ramen baru', with: 'ck_mgr' },
  { lead: 'cost', title: 'Analisis food cost minggu ini' },
  { lead: 'sales', title: 'Rekonsiliasi kasir semua outlet' },
  { lead: 'sales', title: 'Laporan menu terlaris per outlet', with: 'store_mgr' },
  { lead: 'hr_mgr', title: 'Evaluasi kinerja kru kuartal ini' },
  { lead: 'recruit', title: 'Screening 12 CV kru dapur' },
  { lead: 'recruit', title: 'Jadwalkan interview calon kasir', with: 'hr_mgr' },
  { lead: 'payroll', title: 'Proses payroll & lembur periode ini', with: 'accounting' },
  { lead: 'culture', title: 'Survei kepuasan kru bulanan' },
];

export function statusText(st) {
  if (!st) return '';
  const room = (id) => ROOM_BY_ID[id]?.name || '';
  switch (st.state) {
    case 'fly':
      return `Terbang ke ${room(st.destRoom)}`;
    case 'desk':
      return st.missionId ? 'Mengerjakan misi' : 'Kerja rutin di meja';
    case 'break':
      if (st.roomId === 'lounge') return 'Makan ramen di Kedai Kyuka';
      if (st.roomId === 'gym') return 'Latihan di Dojo';
      if (st.roomId === 'garden') return 'Cari ide di Taman Zen';
      if (st.roomId === 'mission') return 'Memantau Papan Misi';
      return `Santai di ${room(st.roomId)}`;
    case 'charge':
      return 'Istirahat di kapsul tidur';
    case 'meeting':
      return 'Rapat di Ruang Tatami';
    case 'visit':
      return `Kolaborasi di ${room(st.roomId)}`;
    case 'sleep':
      return `Tidur di ${room(st.roomId)}`;
    default:
      return '';
  }
}
