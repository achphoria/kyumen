// Staff manusia (mode demo): opsi avatar kru kedai, joget, staff contoh, dan profil "saya" di browser.

export const POSES = [
  { id: 'idle', name: 'Diam', desc: 'Berdiri santai' },
  { id: 'bonodori', name: 'Bon Odori', desc: 'Tari festival musim panas, tangan melambai bergantian' },
  { id: 'soran', name: 'Soran Bushi', desc: 'Gerak nelayan mendayung, kuda-kuda rendah' },
  { id: 'mochi', name: 'Tumbuk Mochi', desc: 'Palu kayu diangkat tinggi lalu dihentakkan' },
  { id: 'slurp', name: 'Seruput Ramen', desc: 'Sumpit naik turun, seruput puas' },
  { id: 'kanpai', name: 'Kanpai!', desc: 'Angkat gelas, bersulang ke semua' },
  { id: 'banzai', name: 'Banzai!', desc: 'Lompat girang, dua tangan ke atas' },
];
export const POSE_BY_ID = Object.fromEntries(POSES.map((p) => [p.id, p]));
// pose lama (versi awal) -> pose baru, supaya avatar yang sudah tersimpan tetap berjoget
export const POSE_ALIAS = { pargoy: 'banzai', itik: 'bonodori', floss: 'soran', baling: 'mochi', robot: 'kanpai', koboi: 'slurp' };
export const DEFAULT_POSE = 'bonodori';

export const AVATAR_OPTIONS = {
  hair: [
    ['short', 'Pendek'],
    ['bun', 'Sanggul'],
    ['pony', 'Kuncir'],
    ['bob', 'Bob'],
    ['spiky', 'Jabrik'],
    ['topknot', 'Chonmage'],
    ['bald', 'Plontos'],
  ],
  hairColor: [
    ['#1E1E22', 'Hitam'],
    ['#3A2A1C', 'Cokelat tua'],
    ['#6B4416', 'Cokelat'],
    ['#C9A26B', 'Pirang'],
    ['#C8352A', 'Merah'],
    ['#5A6F9E', 'Biru keabu'],
  ],
  skin: [
    ['#FFE0BD', 'Terang'],
    ['#F1C27D', 'Kuning langsat'],
    ['#E0AC69', 'Sawo matang'],
    ['#C68642', 'Cokelat'],
    ['#8D5524', 'Gelap'],
  ],
  outfit: [
    ['happi', 'Happi kru'],
    ['apron', 'Kaos + celemek'],
    ['chef', 'Baju koki'],
    ['jinbei', 'Jinbei'],
    ['kimono', 'Kimono'],
  ],
  outfitColor: [
    ['#1C2F5A', 'Navy'],
    ['#E5483B', 'Merah lentera'],
    ['#3B82D6', 'Biru naga'],
    ['#6E9A4A', 'Hijau matcha'],
    ['#B98A5A', 'Kayu'],
    ['#2B2B2E', 'Arang'],
  ],
  headwear: [
    ['none', 'Tidak ada'],
    ['hachimaki', 'Hachimaki'],
    ['towel', 'Tenugui'],
    ['bandana', 'Bandana'],
    ['cap', 'Topi kru'],
    ['chefhat', 'Topi koki'],
  ],
  extra: [
    ['none', 'Tidak ada'],
    ['glasses', 'Kacamata'],
    ['mask', 'Masker'],
    ['pen', 'Pena di telinga'],
  ],
  hand: [
    ['none', 'Kosong'],
    ['ladle', 'Centong'],
    ['bowl', 'Mangkuk ramen'],
    ['tablet', 'Tablet pesanan'],
  ],
  expr: [
    ['happy', 'Senang'],
    ['hype', 'Semangat'],
    ['chill', 'Santai'],
    ['wink', 'Kedip'],
  ],
};

export const DEFAULT_PROFILE = {
  id: 'me',
  name: '',
  dept: 'store',
  hair: 'short',
  hairColor: '#1E1E22',
  skin: '#F1C27D',
  outfit: 'happi',
  outfitColor: '#E5483B',
  headwear: 'hachimaki',
  extra: 'none',
  hand: 'none',
  expr: 'happy',
  pose: DEFAULT_POSE,
};

// avatar versi awal (hoodie, mohawk, tato, dst.) dipetakan ke pilihan kru kedai
const OLD = {
  hair: { long: 'bob', mohawk: 'spiky' },
  outfit: { hoodie: 'happi', tee: 'apron', jacket: 'happi', shirt: 'jinbei' },
  acc: { band: 'hachimaki', cap: 'cap' },
};
const valid = (field, v) => AVATAR_OPTIONS[field].some(([x]) => x === v);
export function normalizeProfile(p) {
  const out = { ...DEFAULT_PROFILE, ...(p || {}) };
  if (!valid('hair', out.hair)) out.hair = OLD.hair[out.hair] || 'short';
  if (!valid('outfit', out.outfit)) out.outfit = OLD.outfit[out.outfit] || 'happi';
  if (!p?.headwear) out.headwear = OLD.acc[p?.acc] || DEFAULT_PROFILE.headwear;
  if (!p?.extra && p?.acc === 'glasses') out.extra = 'glasses';
  for (const f of ['headwear', 'extra', 'hand', 'expr']) if (!valid(f, out[f])) out[f] = DEFAULT_PROFILE[f];
  out.pose = POSE_ALIAS[out.pose] || (POSE_BY_ID[out.pose] ? out.pose : DEFAULT_POSE);
  delete out.acc;
  delete out.tattoo;
  return out;
}

// profil avatar -> tampilan karakter kru (Crew.jsx)
export const lookOf = (p) => ({
  skin: p.skin,
  hair: p.hair,
  hairColor: p.hairColor,
  outfit: p.outfit,
  outfitColor: p.outfitColor,
  headwear: p.headwear,
  headwearColor: p.outfitColor,
  extra: p.extra,
  hand: p.hand,
  expr: p.expr,
});

export const DEMO_STAFF = [
  { id: 'dina', name: 'Dina', dept: 'store', hair: 'bun', hairColor: '#3A2A1C', skin: '#E0AC69', outfit: 'happi', outfitColor: '#E5483B', headwear: 'hachimaki', extra: 'none', hand: 'tablet', expr: 'happy', pose: 'bonodori', spot: 'rapat' },
  { id: 'rudi', name: 'Rudi', dept: 'scm', hair: 'spiky', hairColor: '#1E1E22', skin: '#C68642', outfit: 'apron', outfitColor: '#B98A5A', headwear: 'towel', extra: 'none', hand: 'ladle', expr: 'hype', pose: 'mochi', spot: 'gudang' },
  { id: 'maya', name: 'Maya', dept: 'mkt', hair: 'pony', hairColor: '#C8352A', skin: '#FFE0BD', outfit: 'jinbei', outfitColor: '#3B82D6', headwear: 'none', extra: 'none', hand: 'bowl', expr: 'wink', pose: 'slurp', spot: 'lobby' },
  { id: 'tono', name: 'Tono', dept: 'hr', hair: 'short', hairColor: '#1E1E22', skin: '#F1C27D', outfit: 'kimono', outfitColor: '#1C2F5A', headwear: 'none', extra: 'glasses', hand: 'none', expr: 'chill', pose: 'kanpai', spot: 'outdoor' },
];

const KEY = 'kyumen.profile';
export function loadProfile() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...normalizeProfile(JSON.parse(raw)), id: 'me' } : null;
  } catch {
    return null;
  }
}
export function saveProfile(p) {
  try {
    localStorage.setItem(KEY, JSON.stringify(p));
  } catch {
    /* penyimpanan browser tidak tersedia: profil hanya berlaku di sesi ini */
  }
}
