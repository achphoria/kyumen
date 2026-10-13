// "Otak" Ryu versi demo: suara browser (text-to-speech) dan jawaban berbasis data kedai.
// Fase berikutnya diganti dengan AI sungguhan lewat n8n / Supabase Edge Function.
import { AGENTS, AGENT_BY_ID, DEPTS } from '../data/hive';
import { useHive } from '../sim/store';
import { world } from '../sim/engine';
import { demoEvents, dayStart, wibNow, cut } from '../ui/hallData';

export function speak(text, onEnd) {
  const synth = window.speechSynthesis;
  if (!synth) {
    onEnd?.();
    return false;
  }
  synth.cancel();
  const u = new SpeechSynthesisUtterance(text);
  const voice = synth.getVoices().find((v) => v.lang?.toLowerCase().startsWith('id'));
  if (voice) u.voice = voice;
  u.lang = 'id-ID';
  u.rate = 1.03;
  u.pitch = 1.05;
  if (onEnd) {
    u.onend = onEnd;
    u.onerror = onEnd; // dibatalkan / gagal juga dianggap selesai
  }
  synth.speak(u);
  return true;
}

export function stopSpeaking() {
  window.speechSynthesis?.cancel();
}

export function buildAnswer(kind) {
  const s = useHive.getState();
  const pending = s.approvals.filter((a) => a.status === 'pending');
  const lowest = [...s.missions].sort((a, b) => a.progress - b.progress)[0];
  if (kind === 'kondisi') {
    return {
      q: 'Ryu, gimana kondisi kedai sekarang?',
      a: `Saat ini ${s.missions.length} misi sedang berjalan, ${s.stats.done} misi sudah selesai, dan ${s.stats.honey} mangkuk sudah tersaji. ${
        pending.length ? `Ada ${pending.length} persetujuan yang menunggu keputusan.` : 'Tidak ada persetujuan yang menunggu.'
      }`,
      note: pending.length ? `Tindak lanjuti ${pending.length} persetujuan` : null,
    };
  }
  if (kind === 'mendesak') {
    return {
      q: 'Ryu, apa yang paling mendesak?',
      a: lowest
        ? `Yang paling perlu dikejar: "${lowest.title}" oleh ${AGENT_BY_ID[lowest.leadId].nick}, baru ${Math.round(lowest.progress * 100)} persen. Saya minta dia memberi update dalam satu jam.`
        : 'Belum ada misi yang macet. Semua agent sedang lancar.',
      note: lowest ? `Follow up: ${cut(lowest.title, 34)}` : null,
    };
  }
  const ev = demoEvents().find((e) => e.big);
  const days = Math.round((ev.ts - dayStart(wibNow())) / 864e5);
  return {
    q: 'Ryu, persiapan Ramen Day sudah sampai mana?',
    a: `${ev.title} tinggal ${days} hari lagi. Layout outlet dan iklan sedang dikerjakan Kumo dan Kaze, dan PO bahan stok awal masih menunggu persetujuan.`,
    note: 'Cek status PO stok awal',
  };
}

// Data ringkas untuk slide presentasi report
export function reportData() {
  const s = useHive.getState();
  const byDept = {};
  for (const [id, n] of Object.entries(world.doneBy)) {
    const dept = AGENT_BY_ID[id]?.dept;
    if (dept) byDept[dept] = (byDept[dept] || 0) + n;
  }
  const depts = Object.keys(DEPTS)
    .filter((d) => d !== 'guest' && d !== 'ceo')
    .map((d) => ({ id: d, name: DEPTS[d].short, color: DEPTS[d].color, done: byDept[d] || 0 }))
    .sort((a, b) => b.done - a.done);
  const awake = Object.values(s.agentStates).filter((a) => a.state !== 'sleep').length;
  const pending = s.approvals.filter((a) => a.status === 'pending');
  const slow = [...s.missions].sort((a, b) => a.progress - b.progress).slice(0, 3);
  return { stats: s.stats, missions: s.missions, awake, depts, pending, slow };
}

// Balasan chat Chief versi demo
export function chiefReply(text, files) {
  const t = text.toLowerCase();
  const r = reportData();
  const parts = [];
  if (files.length) {
    const names = files.map((f) => `"${f.name}"`).join(', ');
    parts.push(`File ${names} sudah saya terima.`);
    parts.push('Di fase berikutnya saya akan benar-benar membaca isinya dan menganalisisnya untuk Anda.');
  }
  if (/kondisi|status|gimana|bagaimana|laporan|report/.test(t)) {
    parts.push(`Ringkasnya: ${r.missions.length} misi berjalan, ${r.stats.done} misi selesai, ${r.stats.honey} mangkuk tersaji, dan ${r.awake} dari ${AGENTS.length} agent sedang aktif.`);
  } else if (/macet|telat|urgent|mendesak|lambat/.test(t)) {
    parts.push(
      r.slow.length
        ? `Yang paling lambat: ${r.slow.map((m) => `"${m.title}" (${Math.round(m.progress * 100)}%)`).join(', ')}.`
        : 'Saat ini tidak ada misi yang macet.',
    );
  } else if (/setuj|approval|persetujuan/.test(t)) {
    parts.push(r.pending.length ? `Ada ${r.pending.length} persetujuan menunggu: ${r.pending.map((a) => a.title).join('; ')}.` : 'Semua persetujuan sudah diputuskan.');
  } else if (!files.length) {
    parts.push('Siap, saya catat. Untuk sekarang saya masih mode demo, jadi jawaban saya terbatas pada data kedai. Coba tanya soal kondisi kedai, yang macet, atau persetujuan.');
  }
  return parts.join(' ');
}
