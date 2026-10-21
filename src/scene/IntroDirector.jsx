// Sutradara kamera Mode Intro: naskah tetap ±96 detik di atas dunia KYUMEN Holding yang asli.
// Mengatur jalur kamera (naik menembus awan, crane per lantai, Ryu, Workshop, rapat video, Genkan,
// time-lapse malam, penutup), jam simulasi, dan empat tugas contoh yang hanya tampil di layar ini.
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { tierY, ROOM_BY_ID, TOP_TIER } from '../data/hive';
import { useHive } from '../sim/store';
import { world, syncRealTasks } from '../sim/engine';
import { useIntro, INTRO_LEN, CH } from '../sim/intro';

const V = (x, y, z) => new THREE.Vector3(x, y, z);
const clamp01 = (v) => Math.max(0, Math.min(1, v));
const ease = (v) => {
  const x = clamp01(v);
  return x * x * (3 - 2 * x);
};
const easeOut = (v) => 1 - Math.pow(1 - clamp01(v), 3);
const mix = (a, b, k) => a + (b - a) * k;
const mixV = (a, b, k) => a.clone().lerp(b, k);
const seg = (t, a, b) => clamp01((t - a) / (b - a));

const setFloor = (floor) => {
  if (useHive.getState().floor !== floor) useHive.setState({ floor, selectedRoom: null, selectedAgent: null });
};

// tugas contoh untuk adegan "Ryu membagi tim"
const DEMO = [
  { id: 'intro-masu', kind: 'ai', who: 'cost', title: 'Masu: Food cost ramen musim hujan' },
  { id: 'intro-kaze', kind: 'ai', who: 'ads', title: 'Kaze: Promo musim hujan' },
  { id: 'intro-hana', kind: 'ai', who: 'design', title: 'Hana: Poster menu baru' },
  { id: 'intro-kumo', kind: 'ai', who: 'store_plan', title: 'Kumo: Jadwal shift outlet' },
];
const realTasks = () => useHive.getState().planTasks || [];
const demoTasks = (col) => [...realTasks(), ...DEMO.map((d) => ({ ...d, col }))];

// jam holding sepanjang video: fajar → siang → time-lapse malam → pagi
function clockAt(t) {
  if (t < CH.title[1]) return mix(5.4, 7.2, seg(t, 4, CH.title[1]));
  if (t < CH.night[0]) return mix(9, 11, seg(t, CH.title[1], CH.night[0]));
  if (t < CH.night[0] + 4) return mix(18, 24, seg(t, CH.night[0], CH.night[0] + 4)) % 24;
  if (t < CH.night[1]) return mix(0, 8, seg(t, CH.night[0] + 4, CH.night[1]));
  return Math.min(11, 8 + (t - CH.night[1]) * 0.25);
}

const C = V(3, 12, -2); // titik tengah tebing
// busur depan: a = 0 tepat di depan (+z), positif ke timur
const front = (a, r, y, c = C) => V(c.x + Math.sin(a) * r, y, c.z + Math.cos(a) * r);

function shotAt(t) {
  const [o0] = CH.open;
  // 0: pembuka (layar masih gelap), kamera di bawah lautan awan menghadap ke atas
  if (t < CH.title[0]) return { pos: V(8, -22, 56), target: V(2, -6, 0) };
  // 1: naik menembus awan sampai tebing terlihat penuh
  if (t < CH.title[1]) {
    const k = ease(seg(t, CH.title[0], CH.title[1] - 1));
    const pos = mixV(V(8, -22, 56), V(34, 22, 78), k);
    pos.x += Math.sin(k * Math.PI) * -10;
    return { pos, target: mixV(V(2, -6, 0), V(3, 12, -2), easeOut(k)) };
  }
  // 2: crane per lantai, dari Lantai 1 ke Puncak
  if (t < CH.floors[1]) {
    const span = (CH.floors[1] - CH.floors[0]) / (TOP_TIER + 1);
    const f = clamp01((t - CH.floors[0]) / span / (TOP_TIER + 1)) * TOP_TIER;
    const y = tierY(f);
    const a = -0.35 + seg(t, CH.floors[0], CH.floors[1]) * 0.7;
    return { pos: front(a, 30, y + 6, V(0, y, 0)), target: V(0, y + 1.3, 0) };
  }
  // 3: Ryu dari dekat, lalu mundur sampai seluruh holding terlihat
  if (t < CH.ryu[1]) {
    const q = world.byId.ceo;
    const head = q ? q.pos.clone().add(V(0, 1.6, 0)) : V(0, 30.4, -2.5);
    const k = ease(seg(t, CH.ryu[1] - 4.5, CH.ryu[1]));
    const near = head.clone().add(V(4.2, 0.5, 6.8));
    const far = front(0.35, 78, 26);
    const target = mixV(head.clone().add(V(-1.4, 0, 0)), C, k);
    return { pos: mixV(near, far, k), target };
  }
  // 4: Workshop: menyusuri selasar Lantai 4 & 3 tempat agent bekerja
  if (t < CH.workshop[1]) {
    const k = ease(seg(t, CH.workshop[0], CH.workshop[1]));
    const x = mix(-16, 16, k);
    const y = mix(tierY(3) + 4, tierY(2) + 3, k);
    return { pos: V(x, y + 2, 22), target: V(x * 0.6 - 3, y - 2.2, 0) };
  }
  // 5: rapat video di Ruang Tatami (Lantai 4, tengah)
  if (t < CH.video[1]) {
    const hall = ROOM_BY_ID.hall;
    const a = -0.5 + seg(t, CH.video[0], CH.video[1]) * 0.35;
    const pos = V(hall.x + Math.sin(a) * 13, hall.y + 6.5, hall.z + Math.cos(a) * 13);
    const target = V(hall.x, hall.y + 1, hall.z);
    // geser bidikan: ruang rapat di kiri layar, kartu rapat di kanan
    const shift = pos.clone().sub(target).cross(V(0, 1, 0)).normalize().multiplyScalar(-4.5);
    return { pos: pos.add(shift), target: target.add(shift) };
  }
  // 6: Ruang Kerja & Portal: diagonal turun Lantai 3 → 2
  if (t < CH.work[1]) {
    const k = ease(seg(t, CH.work[0], CH.work[1]));
    return { pos: V(mix(14, -12, k), mix(tierY(2) + 6, tierY(1) + 5, k), 26), target: V(mix(6, -6, k), mix(tierY(2), tierY(1), k) + 1, 0) };
  }
  // 7: Employee: Genkan & tangga tamu di kaki tebing
  if (t < CH.people[1]) {
    const k = ease(seg(t, CH.people[0], CH.people[1]));
    return { pos: V(mix(-30, -22, k), mix(7, 4, k), mix(30, 24, k)), target: V(-11, 0.5, 3) };
  }
  // 8: time-lapse malam, ayunan lebar di depan tebing
  if (t < CH.night[1]) {
    const a = 0.6 - seg(t, CH.night[0], CH.night[1]) * 0.9;
    return { pos: front(a, 82, 28), target: C };
  }
  // 9: statistik
  if (t < CH.stats[1]) {
    const a = -0.3 + seg(t, CH.stats[0], CH.stats[1]) * 0.3;
    return { pos: front(a, 64, 20), target: V(0, 15, 0) };
  }
  // 10: penutup: menjauh & naik, tebing + naga + lautan awan
  const k = ease(seg(t, CH.end[0], INTRO_LEN));
  return { pos: front(mix(0.05, 0.45, k), mix(70, 150, k), mix(24, 66, k)), target: mixV(V(4, 13, -2), V(8, 4, -2), k) };
}

// kejadian sekali jalan di detik tertentu
const CUES = [
  { at: 0, run: () => setFloor('all') },
  // atap paviliun puncak disembunyikan selama close-up Ryu supaya kamera tidak tertutup
  { at: CH.ryu[0], run: () => setFloor(TOP_TIER) },
  { at: CH.workshop[0], run: () => setFloor('all') },
  // bunyi pesan masuk tepat saat balasan Ryu muncul (IntroOverlay), lalu tugas melesat ke empat agent
  { at: CH.ryu[0] + 5.2, run: () => world.events.push('message') },
  { at: CH.ryu[0] + 5.8, run: () => syncRealTasks(demoTasks('doing')) },
  { at: CH.night[1] - 1, run: () => syncRealTasks(demoTasks('done')) },
];

export function IntroDirector() {
  const { camera, controls, scene } = useThree();
  const run = useIntro((s) => s.run);
  const r = useRef({ t: 0, fired: new Set(), push: 0 });

  // kamera dikendalikan naskah; semuanya dikembalikan saat keluar
  useEffect(() => {
    if (controls) controls.enabled = false;
    const prevMode = world.clockMode;
    world.clockMode = 'sim';
    const fog = scene.fog ? { near: scene.fog.near, far: scene.fog.far } : null;
    if (scene.fog) {
      scene.fog.near = 170;
      scene.fog.far = 420;
    }
    return () => {
      if (scene.fog && fog) Object.assign(scene.fog, fog);
      if (controls) controls.enabled = true;
      world.clockMode = prevMode === 'sim' ? 'wib' : prevMode;
      useHive.setState({ floor: 'all' });
      syncRealTasks(realTasks());
    };
  }, [controls, scene]);

  // putar (ulang) dari awal, atau dari detik tertentu: kejadian sebelumnya dijalankan berurutan
  // dan kamera langsung diletakkan di posisinya
  useEffect(() => {
    const from = useIntro.getState().from || 0;
    r.current = { t: from, fired: new Set(), push: from, snap: true };
    syncRealTasks(realTasks());
    setFloor('all');
    if (from > 0) {
      for (const c of CUES) {
        if (c.at <= from) {
          r.current.fired.add(c.at);
          c.run();
        }
      }
      world.clock = clockAt(from);
    }
  }, [run]);

  useFrame((_, raw) => {
    if (!controls) return;
    const dt = Math.min(raw, 0.1);
    const s = r.current;
    // status dibaca langsung dari store (bukan dari render terakhir) supaya frame pertama setelah Putar sudah benar
    const now = useIntro.getState().status;
    const playing = now === 'playing';
    if (playing && !s.snap) s.t = Math.min(INTRO_LEN, s.t + dt);
    const t = now === 'ready' ? 0 : s.t;

    if (playing) {
      for (const c of CUES) {
        if (t >= c.at && !s.fired.has(c.at)) {
          s.fired.add(c.at);
          c.run();
        }
      }
    }
    world.clockMode = 'sim';
    world.clock = clockAt(t);

    const { pos, target } = shotAt(t);
    if (s.snap) {
      s.snap = false;
      camera.position.copy(pos);
      controls.target.copy(target);
    } else {
      // adegan meluncur halus; naik menembus awan & crane dibuat rapat mengikuti jalurnya
      const tight = (t >= CH.title[0] && t < CH.floors[1]) || t >= CH.end[0];
      const k = 1 - Math.exp(-dt * (tight ? 4.5 : 2.4));
      camera.position.lerp(pos, k);
      controls.target.lerp(target, k);
    }
    controls.update();

    if (playing && (t - s.push >= 0.1 || t >= INTRO_LEN)) {
      s.push = t;
      useIntro.setState({ t, clock: world.clock });
      if (t >= INTRO_LEN) {
        syncRealTasks(realTasks());
        useIntro.getState().finish();
      }
    }
  });

  return null;
}
