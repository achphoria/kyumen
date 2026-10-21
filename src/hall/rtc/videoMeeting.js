// Rapat video Cloudflare: membuka rapat (lobi Ruang Tatami atau jadwal kalender) dan status peserta di room.
import { supabase } from '../../lib/supabase';

// peserta dianggap masih di room kalau belum keluar dan detak terakhirnya (tiap 60 detik) masih baru
export const ACTIVE_WINDOW_MS = 150 * 1000;

const HELLO = 'Halo semua, saya Ryu. Saya ikut mencatat rapat ini dan akan membuat notulen serta laporan begitu rapat selesai.';

// Owner membuka rapat (tetap satu rapat berjalan sekaligus). Ryu wajib hadir dan membuka dengan salam.
export async function startVideoMeeting(title, eventId = null) {
  const { data, error } = await supabase
    .from('hc_meetings')
    .insert({ title: String(title || 'Rapat holding').slice(0, 80), ...(eventId ? { event_id: eventId } : {}) })
    .select('id')
    .single();
  if (error) {
    if (error.code === '23505') throw new Error('Masih ada rapat lain yang berjalan. Akhiri rapat itu dulu.');
    if (error.message.includes('row-level')) throw new Error('Hanya owner yang bisa memulai rapat.');
    throw new Error(`Gagal membuka rapat: ${error.message}`);
  }
  if (eventId) await supabase.from('hc_meeting_events').update({ meeting_id: data.id }).eq('id', eventId);
  await supabase.from('hc_meeting_lines').insert({ meeting_id: data.id, speaker_name: 'Ryu', kind: 'ai', text: HELLO });
  return data.id;
}

// siapa yang sedang ada di room video (untuk banner lobi Ruang Tatami), format sama dengan status LiveKit
export async function videoRoomStatus(meetingId) {
  const since = new Date(Date.now() - ACTIVE_WINDOW_MS).toISOString();
  const { data, error } = await supabase
    .from('hc_meeting_participants')
    .select('user_id, name, joined_at')
    .eq('meeting_id', meetingId)
    .is('left_at', null)
    .is('kicked_at', null)
    .gt('last_seen_at', since);
  if (error) return null;
  const seen = new Map();
  for (const r of data || []) if (!seen.has(r.user_id)) seen.set(r.user_id, { id: r.user_id, name: r.name, joinedAt: new Date(r.joined_at).getTime() });
  return [...seen.values()];
}
