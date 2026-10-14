// Sutradara kamera Mode Intro: naskah tetap ±80 detik di atas scene kedai Kyumen yang asli.
// Mengatur jalur kamera, jam kedai (matahari terbit & time-lapse malam), lantai yang terlihat,
// dan dua tugas contoh (Masu & Kaze) yang hanya tampil di layar ini, lalu dikembalikan seperti semula.
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { tierOf, tierY, ROOM_BY_ID } from '../data/hive';
import { useHive } from '../sim/store';
import { world, syncRealTasks } from '../sim/engine';
import { useIntro, INTRO_LEN } from '../sim/intro';

const V = (x, y, z) => new THREE.Vector3(x, y, z);
const clamp01 = (v) => Math.max(0, Math.min(1, v));
const ease = (v) => {
  const x = clamp01(v);
  return x * x * (3 - 2 * x);
};
const mix = (a, b, k) => a + (b - a) * k;
const seg = (t, a, b) => clamp01((t - a) / (b - a));

const setFloor = (floor) => {
  if (useHive.getState().floor !== floor) useHive.setState({ floor, selectedRoom: null, selectedAgent: null });
};

// tugas contoh untuk adegan "satu perintah, tim langsung bergerak"
const DEMO = [
  { id: 'intro-masu', kind: 'ai', who: 'cost', title: 'Masu: HPP menu ramen baru' },
  { id: 'intro-kaze', kind: 'ai', who: 'ads', title: 'Kaze: Promo Ramen Day' },
];
const realTasks = () => useHive.getState().planTasks || [];
const demoTasks = (col) => [...realTasks(), ...DEMO.map((d) => ({ ...d, col }))];

// jam kedai sepanjang video: fajar → siang → time-lapse malam → pagi
function clockAt(t) {
  if (t < 5) return 5.6;
  if (t < 15) return mix(5.6, 7.6, seg(t, 5, 15));
  if (t < 62) return 10;
  if (t < 66) return (mix(18, 24, seg(t, 62, 66)) + 24) % 24;
  if (t < 69) return mix(0, 8, seg(t, 66, 69));
  return Math.min(11, 8 + (t - 69) * 0.2);
}

// posisi kamera & titik pandang untuk detik ke-t (titik tengah kedai di x = CX)
const CX = 3;
const O = (a, r, y) => V(CX + Math.cos(a) * r, y, Math.sin(a) * r);
function shotAt(t) {
  const q = world.byId.ceo;
  if (t < 5) return { pos: O(0.85, 175, 82), target: V(CX, 6, 0) };
  if (t < 15) {
    // terbang mendekat ke kedai sambil sedikit memutar
    const k = ease(seg(t, 5, 15));
    return { pos: O(mix(0.85, 0.62, k), mix(175, 66, k), mix(82, 28, k)), target: V(CX, mix(4, 6, k), 0) };
  }
  if (t < 25) {
    // tur lantai: orbit mengikuti lantai yang sedang dibuka
    const f = useHive.getState().floor;
    const y = f === 'all' ? 6 : tierY(f) + 1;
    return { pos: O(0.9 + (t - 15) * 0.09, 40, y + 20), target: V(CX, y, 0) };
  }
  if (t < 37 && q) {
    // Ryu dari dekat, lalu kamera mundur searah pandangan sampai seluruh kedai terlihat
    const f = (q.targetFacing ?? 0) + 0.5;
    const head = q.pos.clone().add(V(0, 1.6, 0));
    const k = ease(seg(t, 32, 37));
    const elev = mix(0.5, 0.72, k);
    const dist = t < 32 ? mix(9, 6.5, ease(seg(t, 25, 29))) : mix(6.5, 46, k);
    const dir = V(Math.sin(f) * Math.cos(elev), Math.sin(elev), Math.cos(f) * Math.cos(elev));
    // bidikan digeser supaya Ryu di kiri layar & kartu chat di kanan tidak menutupi wajahnya
    const right = dir.clone().cross(V(0, 1, 0)).normalize().multiplyScalar(-1.7 * (1 - k));
    const target = head.lerp(V(CX, 7, 0), k).add(right);
    return { pos: target.clone().addScaledVector(dir, dist), target };
  }
  if (t < 37) return { pos: O(0.5 + (t - 32) * 0.05, 48, 30), target: V(CX, 7, 0) };
  if (t < 47) return { pos: O(1.6 + (t - 37) * 0.05, 54, 26), target: V(CX, 6, 0) };
  if (t < 55) {
    // Ruang Rapat Tatami (lantai 3, depan tengah) dari atas depan
    const hall = ROOM_BY_ID.hall;
    const a = 1.35 + (t - 47) * 0.035;
    const pos = V(hall.x + Math.cos(a) * 13, hall.y + 13, hall.z + Math.sin(a) * 13);
    const target = V(hall.x, hall.y + 0.8, hall.z);
    // geser bidikan: ruang rapat di kiri layar, kartu notulen di kanan
    const shift = pos.clone().sub(target).cross(V(0, 1, 0)).normalize().multiplyScalar(-4);
    return { pos: pos.add(shift), target: target.add(shift) };
  }
  if (t < 62) {
    // Portal saya: menyusuri dermaga depan kedai tempat staff berkumpul
    const x = mix(-22, 14, ease(seg(t, 55, 62)));
    return { pos: V(x, 12, 46), target: V(x * 0.5 + 6, -1, 16) };
  }
  if (t < 70) return { pos: O(2.6 + (t - 62) * 0.05, 64, 32), target: V(CX, 6, 0) };
  if (t < 77) return { pos: O(3.0 + (t - 70) * 0.06, 46, 40), target: V(CX, 5, 0) };
  // penutup: kamera menjauh dari kedai
  const k = ease(seg(t, 77, INTRO_LEN));
  return { pos: O(3.4 + (t - 77) * 0.04, mix(52, 160, k), mix(36, 80, k)), target: V(CX, 6, 0) };
}

// kejadian sekali jalan di detik tertentu
const CUES = [
  { at: 0, run: () => setFloor('all') },
  { at: 15, run: () => setFloor(0) },
  { at: 17.5, run: () => setFloor(1) },
  { at: 20, run: () => setFloor(2) },
  { at: 22.5, run: () => setFloor('all') },
  { at: 25, run: () => world.byId.ceo && setFloor(Math.max(tierOf(world.byId.ceo.pos.y), 2)) },
  { at: 30.8, run: () => syncRealTasks(demoTasks('doing')) },
  { at: 32, run: () => setFloor('all') },
  { at: 47, run: () => setFloor(2) },
  { at: 55, run: () => setFloor('all') },
  { at: 68.6, run: () => syncRealTasks(demoTasks('done')) },
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
      scene.fog.near = 160;
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
    r.current = { t: from, fired: new Set(), push: from, snap: from > 0 };
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
      // mulai dari detik tertentu: kamera langsung di posisinya
      s.snap = false;
      camera.position.copy(pos);
      controls.target.copy(target);
    } else {
      // adegan baru meluncur halus; terbang awal dibuat lebih rapat mengikuti jalurnya
      const k = 1 - Math.exp(-dt * (t >= 5 && t < 15 ? 4 : 2.2));
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
