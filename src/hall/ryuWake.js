// Panggilan "Ryu" di kalimat rapat. Dipakai rapat suara (LiveKit) dan ruang video (Cloudflare).
// Pengenal suara sering menulis "Ryu" sebagai "ryuu"/"riyu"/"riu"/"rio", jadi semuanya diterima.
const WAKE = /\b(ryuu?|riyu|riu|rio)\b/i;

// null = bukan panggilan; { wakeOnly: true } = hanya memanggil nama (pertanyaan menyusul di kalimat
// berikutnya); { wakeOnly: false } = kalimat ini sendiri pertanyaannya.
export function ryuCall(text) {
  const s = String(text || '');
  let m = s.match(WAKE);
  // "Ryu ..." di mana saja; ejaan yang mirip nama lain ("Rio", "Riu") hanya kalau di awal kalimat
  if (m) {
    const exact = /^(ryuu?|riyu)$/i.test(m[1]);
    const atStart = s.slice(0, m.index).trim().split(/\s+/).filter(Boolean).length <= 1;
    if (!exact && !atStart) m = null;
  }
  if (!m) return null;
  const rest = s
    .slice(m.index + m[0].length)
    .replace(/^[\s,.:!?-]*/, '')
    .trim();
  return { wakeOnly: rest.split(/\s+/).filter(Boolean).length < 3 };
}
