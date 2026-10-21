// Dunia KYUMEN Holding: kantor bertingkat yang menempel di tebing jurang di atas lautan awan.
// Tebing berlapis, selasar & tangga zig-zag (jalur jalan agent), atap Jepang per lantai, paviliun Ryu
// di puncak dengan papan nama, jembatan tali ke tebing seberang (Central Kitchen & Main Warehouse),
// air terjun, dan naga biru penjaga yang melilit naik dari awan.
import { useLayoutEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import {
  CELL,
  HALF,
  TIER_GAP,
  TOP_TIER,
  WALL_H,
  SIDE_X,
  ROOM_LIST,
  ROOM_BY_ID,
  STAIRS,
  BRIDGES,
  GAL,
  GAL_Z,
  CLIFF_Z,
  GUEST_STAIR,
  tierY,
} from '../data/hive';
import { useHive } from '../sim/store';
import { focusAgent } from '../sim/engine';
import { M, std, Box, Cyl, Sph, Cone } from './materials';
import { PaperLantern, StoneLantern } from './Furniture';
import { StaticMerge } from './StaticMerge';

export const PLATEAU_Y = tierY(TOP_TIER) - 0.05; // permukaan puncak tebing
export const CLOUD_Y = -13; // lautan awan

function seeded(seed) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}
const shown = (floor, tier) => floor === 'all' || floor >= tier;
const roofShown = (floor, tier) => floor === 'all' || floor > tier;

/* ---------- material ---------- */
const ROCK = [std('#8A8174', { roughness: 0.95, flatShading: true }), std('#7A7266', { roughness: 0.95, flatShading: true }), std('#9C9283', { roughness: 0.95, flatShading: true }), std('#6C645A', { roughness: 0.95, flatShading: true })];
const ROCK_TOP = std('#B3A690', { roughness: 0.95, flatShading: true });
const MOSS = std('#6F9A52', { roughness: 0.95, flatShading: true });
const DECK = std('#C89A68', { roughness: 0.75 });
const BEAM = std('#5C3D24', { roughness: 0.7 });
const RAIL = std('#C8352A', { roughness: 0.55 });
const ROOF = std('#2C3448', { roughness: 0.6, flatShading: true });
const ROOF_EDGE = std('#3C4660', { roughness: 0.6, flatShading: true });
const GOLD = std('#D9A93A', { roughness: 0.4, metalness: 0.35 });
const SAKURA = std('#F6B8C8', { roughness: 0.85 });
const WATER = new THREE.MeshStandardMaterial({ color: '#DCECF7', emissive: '#EAF4FB', emissiveIntensity: 0.35, transparent: true, opacity: 0.82, roughness: 0.2 });
const MIST = new THREE.MeshStandardMaterial({ color: '#FFFFFF', transparent: true, opacity: 0.38, roughness: 1, depthWrite: false });
const CLOUD = std('#FFFFFF', { roughness: 1, emissive: '#E8F0FF', emissiveIntensity: 0.4 });
const ROPE = std('#C9B48A', { roughness: 0.9 });

const unitBox = new THREE.BoxGeometry(1, 1, 1);
const Bm = ({ p, s, r, m = BEAM, shadow = true }) => <mesh geometry={unitBox} position={p} scale={s} rotation={r} material={m} castShadow={shadow} receiveShadow />;

// balok batu bergerigi: kotak bersegmen yang titik-titiknya digeser acak (tetap tertutup rapat)
const rockCache = new Map();
function rockGeometry(w, h, d, seed, jag = 0.2) {
  const key = `${w}|${h}|${d}|${seed}|${jag}`;
  if (rockCache.has(key)) return rockCache.get(key);
  const rnd = seeded(seed);
  const g = new THREE.BoxGeometry(w, h, d, 4, 5, 4);
  const pos = g.attributes.position;
  const off = new Map();
  const v = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    const k = `${v.x.toFixed(2)},${v.y.toFixed(2)},${v.z.toFixed(2)}`;
    if (!off.has(k)) off.set(k, [(rnd() - 0.5) * jag * w * 0.22, (rnd() - 0.5) * jag * h * 0.12, (rnd() - 0.5) * jag * d * 0.22]);
    const [a, b, c] = off.get(k);
    pos.setXYZ(i, v.x + a, v.y + b, v.z + c);
  }
  g.computeVertexNormals();
  rockCache.set(key, g);
  return g;
}
function Rock({ p, s, seed = 1, jag = 0.2, m = ROCK[0], r = 0 }) {
  return <mesh geometry={rockGeometry(s[0], s[1], s[2], seed, jag)} position={p} rotation={[0, r, 0]} material={m} castShadow receiveShadow />;
}

/* ---------- tumbuhan & ornamen ---------- */
function Pine({ p, s = 1, tilt = 0 }) {
  return (
    <group position={p} scale={s} rotation={[0, 0, tilt]}>
      <Cyl p={[0, 0.9, 0]} a={[0.12, 0.2, 1.8, 7]} m={M.brown} />
      <Sph p={[-0.5, 1.7, 0]} rad={0.9} sc={[1.5, 0.45, 1.1]} m={M.pine} seg={[10, 6]} />
      <Sph p={[0.5, 2.3, 0.1]} rad={0.75} sc={[1.5, 0.45, 1.1]} m={M.pineLight} seg={[10, 6]} />
      <Sph p={[0, 2.85, -0.1]} rad={0.55} sc={[1.5, 0.45, 1.1]} m={M.pine} seg={[10, 6]} />
    </group>
  );
}
function Sakura({ p, s = 1 }) {
  return (
    <group position={p} scale={s}>
      <Cyl p={[0, 0.8, 0]} a={[0.1, 0.18, 1.6, 7]} m={M.brown} />
      <Sph p={[0, 2.1, 0]} rad={1.1} m={SAKURA} seg={[10, 8]} />
      <Sph p={[0.7, 1.8, 0.3]} rad={0.7} m={SAKURA} seg={[10, 8]} />
      <Sph p={[-0.6, 1.9, -0.3]} rad={0.75} m={M.pink} seg={[10, 8]} />
    </group>
  );
}
function Torii({ p, s = 1, r = 0 }) {
  return (
    <group position={p} scale={s} rotation={[0, r, 0]}>
      {[-1.5, 1.5].map((x) => (
        <Cyl key={x} p={[x, 1.8, 0]} a={[0.16, 0.19, 3.6, 10]} m={M.red} />
      ))}
      <Box p={[0, 3.75, 0]} s={[4.6, 0.3, 0.4]} m={M.graphite} />
      <Box p={[0, 3.0, 0]} s={[3.6, 0.2, 0.25]} m={M.red} />
      <Box p={[0, 3.35, 0.16]} s={[0.6, 0.45, 0.04]} m={M.royal} />
    </group>
  );
}
function Vine({ p, len = 4, seed = 1 }) {
  const rnd = seeded(seed);
  return (
    <group position={p}>
      {[0, 1, 2, 3].map((i) => {
        const l = len * (0.55 + rnd() * 0.45);
        return (
          <group key={i}>
            <Cyl p={[i * 0.3, -l / 2, 0]} a={[0.04, 0.04, l, 4]} m={M.leafDark} shadow={false} />
            <Sph p={[i * 0.3, -l, 0]} rad={0.22} m={M.leaf} seg={[6, 5]} />
          </group>
        );
      })}
    </group>
  );
}

/* ---------- atap Jepang: emper landai + badan curam + bubungan, ujung sudut melengkung ---------- */
// limas terpancung 4 sisi, sejajar sumbu (rotasi dipanggang ke geometri supaya skala w x d tetap persegi panjang)
const R2 = Math.SQRT2;
const frustumCache = new Map();
function frustumGeo(rt, rb, h) {
  const key = `${rt}|${rb}|${h}`;
  if (!frustumCache.has(key)) frustumCache.set(key, new THREE.CylinderGeometry(rt * R2, rb * R2, h, 4, 1).rotateY(Math.PI / 4));
  return frustumCache.get(key);
}
function Frustum({ w, d, rt, rb, h, y, m }) {
  return <mesh geometry={frustumGeo(rt, rb, h)} position={[0, y, 0]} scale={[w / 2, 1, d / 2]} material={m} castShadow receiveShadow />;
}
export function JRoof({ p, w, d, s = 1, ridgeGold = true }) {
  const top = 0.18 + 0.5 * s + 1.05 * s;
  const long = w >= d;
  const rl = (long ? w : d) * 0.32;
  return (
    <group position={p}>
      <Frustum w={w} d={d} rt={1} rb={1.02} h={0.18} y={0.09} m={BEAM} />
      <Frustum w={w} d={d} rt={0.76} rb={1.04} h={0.5 * s} y={0.18 + 0.25 * s} m={ROOF_EDGE} />
      <Frustum w={w} d={d} rt={long ? 0.3 : 0.3} rb={0.76} h={1.05 * s} y={0.18 + 0.5 * s + 0.525 * s} m={ROOF} />
      <Bm p={[0, top + 0.08, 0]} s={long ? [rl * 2, 0.32, 0.32] : [0.32, 0.32, rl * 2]} m={ROOF_EDGE} />
      {ridgeGold &&
        [-1, 1].map((sg) => (
          <Cone key={sg} p={long ? [sg * rl, top + 0.4, 0] : [0, top + 0.4, sg * rl]} r={long ? [0, 0, -sg * 0.45] : [sg * 0.45, 0, 0]} a={[0.18, 0.5, 6]} m={GOLD} />
        ))}
      {[
        [-1, -1],
        [1, -1],
        [-1, 1],
        [1, 1],
      ].map(([sx, sz]) => (
        <Cone key={`${sx}${sz}`} p={[(sx * w) / 2, 0.42, (sz * d) / 2]} r={[sz * 0.75, 0, -sx * 0.75]} a={[0.14, 0.62, 5]} m={ROOF_EDGE} />
      ))}
    </group>
  );
}

// papan nama KYUMEN Holding (tekstur kanvas)
function signTexture() {
  const c = document.createElement('canvas');
  c.width = 1024;
  c.height = 320;
  const g = c.getContext('2d');
  g.fillStyle = '#1D2230';
  g.fillRect(0, 0, 1024, 320);
  g.strokeStyle = '#D9A93A';
  g.lineWidth = 12;
  g.strokeRect(16, 16, 992, 288);
  g.fillStyle = '#E9C05A';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = '800 150px "Fredoka", "Nunito", system-ui, sans-serif';
  g.fillText('KYUMEN', 512, 140);
  g.font = '700 54px "Nunito", system-ui, sans-serif';
  g.fillStyle = '#F4EBDD';
  g.fillText('H O L D I N G', 512, 248);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

/* ---------- tebing utama, kaki tebing, tebing seberang, pilar jauh ---------- */
export function Cliff() {
  const rocks = useMemo(() => {
    const out = [];
    // lapisan tebing utama di belakang ruangan (dari dalam awan sampai puncak)
    const layers = [
      [-30, 14, 3],
      [-17, 12, 1],
      [-6, 10, 0],
      [4, 10, 2],
      [14, 10, 0],
      [23.4, 5.4, 2],
    ];
    layers.forEach(([y0, h, mi], i) => out.push({ p: [((i % 3) - 1) * 0.5, y0 + h / 2, CLIFF_Z - 11 + (i % 2) * 0.4], s: [46 - i * 0.6, h, 22], seed: 11 + i, m: ROCK[mi] }));
    out.push({ p: [0, PLATEAU_Y - 1.2, CLIFF_Z - 11.2], s: [46.5, 2.6, 22.6], seed: 31, m: ROCK_TOP, jag: 0.12 });
    // penopang samping
    out.push({ p: [-24.5, -6, CLIFF_Z - 6], s: [9, 48, 14], seed: 41, m: ROCK[1], jag: 0.3 });
    out.push({ p: [24.5, -9, CLIFF_Z - 7], s: [8, 42, 12], seed: 43, m: ROCK[3], jag: 0.3 });
    // celah gelap vertikal
    out.push({ p: [-5, 12, CLIFF_Z + 0.2], s: [3.2, 22, 1.2], seed: 47, m: ROCK[3], jag: 0.35 });
    // kaki tebing di bawah Lantai 1
    out.push({ p: [0, -7.8, -1.5], s: [40, 13, 12], seed: 51, m: ROCK[0], jag: 0.25 });
    out.push({ p: [-10, -14, 2], s: [22, 10, 10], seed: 53, m: ROCK[1], jag: 0.3 });
    // punggung batu tangga tamu (barat depan)
    out.push({ p: [GUEST_STAIR.x, -10, GUEST_STAIR.zBottom - 4], s: [5, 14, 14], seed: 57, m: ROCK[2], jag: 0.3 });
    // tebing seberang (Central Kitchen & Main Warehouse)
    out.push({ p: [SIDE_X, -14, -4.8], s: [13, 27, 23], seed: 61, m: ROCK[0], jag: 0.25 });
    out.push({ p: [SIDE_X + 5, -20, -6], s: [8, 20, 12], seed: 63, m: ROCK[3], jag: 0.3 });
    // pilar batu jauh menembus awan
    [
      [-52, -34, 7, 26],
      [44, -48, 6, 22],
      [64, 6, 5, 18],
      [-26, -66, 5, 20],
      [-62, 18, 4, 14],
    ].forEach(([x, z, w, h], i) => out.push({ p: [x, CLOUD_Y + h / 2 - 4, z], s: [w, h, w], seed: 70 + i, m: ROCK[i % 4], jag: 0.3, far: true }));
    return out;
  }, []);
  // langkan berlumut di bawah tiap selasar (rak batu tempat balok penyangga menancap)
  const ledges = [0, 1, 2, 3].map((t) => ({ y: tierY(t) - 1.4, t }));
  return (
    <group>
      <StaticMerge>
        {rocks.map((r, i) => (
          <Rock key={i} p={r.p} s={r.s} seed={r.seed} jag={r.jag ?? 0.2} m={r.m} />
        ))}
        {ledges.map(({ y, t }) => (
          <group key={t}>
            <Rock p={[0, y, CLIFF_Z - 0.2]} s={[42, 1.4, 2.6]} seed={80 + t} jag={0.4} m={ROCK[2]} />
            <Rock p={[0, y + 0.75, CLIFF_Z - 0.3]} s={[38, 0.4, 2.2]} seed={90 + t} jag={0.2} m={MOSS} />
          </group>
        ))}
        {/* rumput di puncak */}
        <Rock p={[0, PLATEAU_Y - 0.12, CLIFF_Z - 11.2]} s={[45, 0.3, 21.6]} seed={33} jag={0.06} m={MOSS} />
        <Rock p={[SIDE_X, -0.6, -4.8]} s={[12.6, 0.5, 22.4]} seed={65} jag={0.08} m={MOSS} />
        {/* pinus & sulur di celah tebing */}
        <Pine p={[-20.5, 17, CLIFF_Z + 0.4]} s={1.4} tilt={0.5} />
        <Pine p={[21, 10, CLIFF_Z + 0.4]} s={1.2} tilt={-0.55} />
        <Pine p={[-21.5, 3.5, CLIFF_Z + 0.6]} s={1.1} tilt={0.45} />
        <Pine p={[SIDE_X + 4, -0.4, -14]} s={1.3} />
        <Sakura p={[SIDE_X - 4, -0.4, -14.5]} s={1.1} />
        <Vine p={[-12, 26, CLIFF_Z + 0.2]} len={5} seed={3} />
        <Vine p={[6, 19, CLIFF_Z + 0.2]} len={4} seed={5} />
        <Vine p={[-16, 12, CLIFF_Z + 0.2]} len={6} seed={7} />
        <Vine p={[13, 5, CLIFF_Z + 0.2]} len={4} seed={9} />
        {/* sisi belakang: jalur batu menurun dari puncak */}
        {Array.from({ length: 9 }, (_, i) => (
          <Rock key={i} p={[8 - i * 1.3, PLATEAU_Y - 2 - i * 2.2, CLIFF_Z - 22.4]} s={[2.4, 0.5, 1.5]} seed={100 + i} jag={0.15} m={ROCK_TOP} />
        ))}
        <Pine p={[12, 20, CLIFF_Z - 22.3]} s={1.3} tilt={-0.5} />
        <Pine p={[-14, 14, CLIFF_Z - 22.3]} s={1.2} tilt={0.5} />
      </StaticMerge>
      {/* pinus di pilar jauh */}
      {[
        [-52, -34, 26],
        [44, -48, 22],
        [64, 6, 18],
      ].map(([x, z, h]) => (
        <Pine key={`${x}${z}`} p={[x, CLOUD_Y + h - 4, z]} s={1.3} />
      ))}
    </group>
  );
}

/* ---------- selasar tiap lantai + balok penyangga + tiang + lampion ---------- */
function Gallery({ t }) {
  const y = tierY(t);
  const len = GAL.x1 - GAL.x0;
  const cx = (GAL.x0 + GAL.x1) / 2;
  // tiang hanya di batas antar ruangan & ujung selasar (tidak rapat seperti perancah)
  const posts = [GAL.x0 + 0.4, -CELL / 2, CELL / 2, GAL.x1 - 0.4];
  const drop = t === 0 ? 11 : TIER_GAP - 0.4;
  return (
    <group>
      <StaticMerge>
        {/* lantai selasar + lantai ruangan menjorok dari tebing */}
        <Bm p={[cx, y - 0.16, (GAL.z0 + GAL.z1) / 2]} s={[len, 0.32, GAL.z1 - GAL.z0]} m={DECK} />
        <Bm p={[cx, y - 0.62, (CLIFF_Z + GAL.z1) / 2]} s={[len, 0.22, GAL.z1 - CLIFF_Z]} m={BEAM} />
        {/* balok menancap ke tebing di bawah lantai */}
        {posts.map((x) => (
          <Bm key={`b${x}`} p={[x, y - 0.95, (CLIFF_Z - 1.2 + GAL.z1) / 2]} s={[0.4, 0.4, GAL.z1 - CLIFF_Z + 1.2]} />
        ))}
        {/* tiang panjang di depan selasar sampai lantai bawah (lantai 1: sampai kaki tebing) */}
        {posts.map((x) => (
          <Bm key={`p${x}`} p={[x, y - 0.4 - drop / 2, GAL.z1 - 0.3]} s={[0.36, drop, 0.36]} />
        ))}
        {/* pagar merah */}
        <Bm p={[cx, y + 0.9, GAL.z1 - 0.05]} s={[len, 0.12, 0.14]} m={RAIL} />
        <Bm p={[cx, y + 0.45, GAL.z1 - 0.05]} s={[len, 0.08, 0.1]} m={RAIL} />
        {Array.from({ length: 22 }, (_, i) => (
          <Bm key={`r${i}`} p={[GAL.x0 + (i * len) / 21, y + 0.45, GAL.z1 - 0.05]} s={[0.12, 0.9, 0.12]} m={RAIL} />
        ))}
      </StaticMerge>
      {[-1.5, -0.5, 0.5, 1.5].map((k) => (
        <PaperLantern key={k} p={[k * CELL * 0.95, y + 2.45, GAL.z1 - 0.2]} s={0.75} />
      ))}
    </group>
  );
}
export function Galleries() {
  const floor = useHive((s) => s.floor);
  return Array.from({ length: TOP_TIER + 1 }, (_, t) => (shown(floor, t) ? <Gallery key={t} t={t} /> : null));
}

/* ---------- tangga zig-zag antar selasar ---------- */
function Flight({ x, y0, y1, z0, z1, n = 9 }) {
  const rise = (y1 - y0) / n;
  const dz = (z1 - z0) / n;
  const len = Math.hypot(y1 - y0, z1 - z0);
  const ang = Math.atan2(y1 - y0, Math.abs(z1 - z0)) * Math.sign(z0 - z1);
  return (
    <group>
      {Array.from({ length: n }, (_, k) => (
        <Bm key={k} p={[x, y0 + (k + 1) * rise - 0.1, z0 + (k + 0.5) * dz]} s={[1.5, 0.2, Math.abs(dz) + 0.04]} m={k % 2 ? DECK : M.nectar} />
      ))}
      {[-0.82, 0.82].map((ox) => (
        <Bm key={ox} p={[x + ox, (y0 + y1) / 2 + 0.6, (z0 + z1) / 2]} r={[ang, 0, 0]} s={[0.1, 0.1, len]} m={RAIL} />
      ))}
    </group>
  );
}
export function Stairs() {
  const floor = useHive((s) => s.floor);
  return STAIRS.map((st) => {
    if (!shown(floor, st.from + 1)) return null;
    const y0 = tierY(st.from);
    const y1 = tierY(st.from + 1);
    const mid = (y0 + y1) / 2;
    const xs = [st.x, st.xOut];
    const xc = (st.x + st.xOut) / 2;
    return (
      <StaticMerge key={st.from}>
        <Flight x={st.x} y0={y0} y1={mid} z0={st.zFront} z1={st.zBack} />
        <Flight x={st.xOut} y0={mid} y1={y1} z0={st.zBack} z1={st.zFront} />
        {/* bordes tengah & sambungan ke selasar */}
        <Bm p={[xc, mid - 0.15, st.zBack - 0.5]} s={[3.4, 0.3, 1.6]} m={DECK} />
        <Bm p={[(st.side * GAL.x1 + st.xOut) / 2 + st.side * 0.4, y0 - 0.16, GAL_Z]} s={[Math.abs(st.xOut - st.side * GAL.x1) + 1.2, 0.3, GAL.z1 - GAL.z0]} m={DECK} />
        <Bm p={[(st.side * GAL.x1 + st.xOut) / 2 + st.side * 0.4, y1 - 0.16, GAL_Z]} s={[Math.abs(st.xOut - st.side * GAL.x1) + 1.2, 0.3, GAL.z1 - GAL.z0]} m={DECK} />
        {xs.map((x) => (
          <Bm key={x} p={[x, (y0 + mid) / 2 - 1.2, st.zBack - 0.6]} s={[0.3, mid - y0 + 1.6, 0.3]} />
        ))}
      </StaticMerge>
    );
  });
}

/* ---------- tangga batu tamu dari balik awan + bordes ---------- */
export function GuestStair() {
  const { x, zTop, zBottom, yBottom } = GUEST_STAIR;
  const n = 16;
  return (
    <StaticMerge>
      {Array.from({ length: n }, (_, k) => {
        const t = (k + 0.5) / n;
        return <Box key={k} p={[x, yBottom + (0 - yBottom) * t - 0.2, zBottom + (zTop - zBottom) * t]} s={[2.6, 0.4, Math.abs(zTop - zBottom) / n + 0.05]} m={k % 2 ? M.stone : M.creamDark} />;
      })}
      <Bm p={[(x + GAL.x0) / 2, -0.16, zTop - 0.2]} s={[GAL.x0 - x + 2.6, 0.32, 2.4]} m={M.stone} />
      {[-1.4, 1.4].map((ox) => (
        <Bm key={ox} p={[x + ox, yBottom / 2 + 0.9, (zTop + zBottom) / 2]} r={[Math.atan2(-yBottom, zBottom - zTop), 0, 0]} s={[0.1, 0.1, Math.hypot(yBottom, zBottom - zTop)]} m={RAIL} />
      ))}
      <Torii p={[x, 0, zTop + 1.2]} s={0.8} />
    </StaticMerge>
  );
}

/* ---------- jembatan tali Engawa -> Central Kitchen ---------- */
export function RopeBridge() {
  const floor = useHive((s) => s.floor);
  if (!shown(floor, 0)) return null;
  return BRIDGES.map((b) => {
    const n = 14;
    const sag = 0.7;
    const at = (t) => [b.x0 + (b.x1 - b.x0) * t, b.y - 0.12 - Math.sin(t * Math.PI) * sag, b.z];
    return (
      <StaticMerge key={b.z}>
        {Array.from({ length: n + 1 }, (_, i) => {
          const p = at(i / n);
          return <Bm key={i} p={p} s={[0.42, 0.12, 1.8]} m={DECK} />;
        })}
        {[-0.95, 0.95].map((oz) =>
          Array.from({ length: n }, (_, i) => {
            const a = at(i / n);
            const c = at((i + 1) / n);
            const len = Math.hypot(c[0] - a[0], c[1] - a[1]);
            return <Bm key={`${oz}${i}`} p={[(a[0] + c[0]) / 2, (a[1] + c[1]) / 2 + 0.9, b.z + oz]} r={[0, 0, Math.atan2(c[1] - a[1], c[0] - a[0])]} s={[len, 0.06, 0.06]} m={ROPE} />;
          }),
        )}
        {[b.x0, b.x1].map((x) => [-0.95, 0.95].map((oz) => <Bm key={`${x}${oz}`} p={[x, b.y + 0.5, b.z + oz]} s={[0.22, 1.4, 0.22]} m={BEAM} />))}
      </StaticMerge>
    );
  });
}

/* ---------- atap: satu atap panjang per lantai + atap kecil menonjol di ruang tengah ---------- */
export function Roofs() {
  const floor = useHive((s) => s.floor);
  const tiers = [0, 1, 2, 3];
  const sideRooms = ROOM_LIST.filter((r) => r.gx === undefined);
  return (
    <group>
      {tiers.map((t) =>
        roofShown(floor, t) ? (
          <group key={t}>
            <JRoof p={[0, tierY(t) + WALL_H + 0.3, -0.2]} w={CELL * 3 + 1.6} d={HALF * 2 + 2.2} s={0.95} />
            <JRoof p={[0, tierY(t) + WALL_H + 1.2, 1.6]} w={CELL - 1.2} d={HALF + 1.4} s={0.75} ridgeGold={false} />
          </group>
        ) : null,
      )}
      {roofShown(floor, TOP_TIER) && <RoyalPavilion />}
      {roofShown(floor, 0) && <JRoof p={[SIDE_X, WALL_H + 0.3, (sideRooms[0].z + sideRooms[1].z) / 2]} w={HALF * 2 + 2} d={CELL + HALF * 2 + 2} s={1} />}
    </group>
  );
}

// paviliun Ryu dua tingkat di puncak: atap besar, lantai atas kecil, papan nama KYUMEN Holding
function RoyalPavilion() {
  const r = ROOM_BY_ID.royal;
  const g = ROOM_BY_ID.garden;
  const sign = useMemo(() => new THREE.MeshStandardMaterial({ map: signTexture(), roughness: 0.55, emissive: '#FFFFFF', emissiveIntensity: 0.06 }), []);
  const y = r.y + WALL_H + 0.3;
  return (
    <group>
      <JRoof p={[r.x, y, r.z]} w={HALF * 2 + 2.8} d={HALF * 2 + 2.6} s={1.25} />
      <StaticMerge>
        <Bm p={[r.x, y + 2.3, r.z - 0.3]} s={[6.6, 0.3, 5]} m={DECK} />
        {[
          [-1, -1],
          [1, -1],
          [-1, 1],
          [1, 1],
        ].map(([sx, sz]) => (
          <Bm key={`${sx}${sz}`} p={[r.x + sx * 3, y + 3.6, r.z - 0.3 + sz * 2.2]} s={[0.26, 2.6, 0.26]} />
        ))}
        <Bm p={[r.x, y + 3.6, r.z - 2.4]} s={[6, 2.4, 0.12]} m={M.shoji} />
        <Bm p={[r.x, y + 4.95, r.z + 2.0]} s={[6.4, 0.24, 0.24]} />
      </StaticMerge>
      <JRoof p={[r.x, y + 5.0, r.z - 0.3]} w={8.6} d={7} s={1.25} />
      {/* papan nama di bawah emper atas */}
      <group position={[r.x, y + 3.7, r.z + 2.25]}>
        <mesh material={M.graphite} position={[0, 0, -0.06]}>
          <boxGeometry args={[5.3, 1.75, 0.12]} />
        </mesh>
        <mesh material={sign}>
          <planeGeometry args={[5.1, 1.6]} />
        </mesh>
      </group>
      {/* atap pergola kecil di Taman Zen */}
      <JRoof p={[g.x - 2.6, g.y + WALL_H + 0.6, g.z - 2.6]} w={3.6} d={3.6} s={0.8} />
    </group>
  );
}

/* ---------- penyangga di bawah ruangan (balok ke tebing) untuk ruang di tebing seberang ---------- */
export function SideSupports() {
  return (
    <StaticMerge>
      {[-1, 1].map((sx) => (
        <Bm key={sx} p={[SIDE_X + sx * (HALF - 0.2), -1.4, -4.8]} s={[0.4, 2, CELL + HALF * 2]} />
      ))}
    </StaticMerge>
  );
}

/* ---------- puncak tebing: deret torii, lentera batu, pohon, kuil kecil ---------- */
export function Plateau() {
  const y = PLATEAU_Y;
  const z0 = CLIFF_Z - 2;
  return (
    <group>
      <StaticMerge>
        {[0, 1, 2, 3, 4].map((i) => (
          <Torii key={i} p={[-6 + i * 0.05, y, z0 - 3 - i * 2.4]} s={0.82} />
        ))}
        {Array.from({ length: 10 }, (_, i) => (
          <Box key={i} p={[-6 + (i % 2 ? 0.35 : -0.35), y + 0.04, z0 - 1.5 - i * 1.4]} s={[1.6, 0.1, 1.1]} m={M.stone} shadow={false} />
        ))}
        <Sakura p={[-17, y, z0 - 3]} s={1.6} />
        <Sakura p={[15.5, y, z0 - 2.5]} s={1.5} />
        <Pine p={[9, y, z0 - 12]} s={1.7} />
        <Pine p={[-12, y, z0 - 15]} s={1.4} />
        <Pine p={[17, y, z0 - 16]} s={1.3} />
        <Box p={[6, y + 0.9, z0 - 9]} s={[4.4, 1.8, 3.4]} m={M.shoji} />
        {[-1, 1].map((sx) => [-1, 1].map((sz) => <Bm key={`${sx}${sz}`} p={[6 + sx * 2.1, y + 0.9, z0 - 9 + sz * 1.6]} s={[0.22, 1.8, 0.22]} />))}
      </StaticMerge>
      <JRoof p={[6, y + 1.9, z0 - 9]} w={6} d={5} s={0.9} />
      {[-9, -3].map((x) => [z0 - 1.5, z0 - 8].map((z) => <StoneLantern key={`${x}${z}`} p={[x, y, z]} s={1.1} />))}
    </group>
  );
}

/* ---------- air terjun dari celah barat, jatuh ke awan ---------- */
export function Waterfall() {
  const mist = useRef();
  useFrame((st) => {
    if (mist.current) mist.current.scale.setScalar(1 + Math.sin(st.clock.elapsedTime * 1.3) * 0.06);
  });
  const x = -22.6;
  const top = PLATEAU_Y - 3;
  const h = top - CLOUD_Y;
  return (
    <group>
      <mesh position={[x, top - h / 2, CLIFF_Z + 1.2]} material={WATER}>
        <boxGeometry args={[2, h, 0.35]} />
      </mesh>
      <group ref={mist} position={[x, CLOUD_Y + 1, CLIFF_Z + 2]}>
        {[0, 1, 2, 3].map((i) => (
          <mesh key={i} material={MIST} position={[(i - 1.5) * 1.2, (i % 2) * 0.6, (i % 3) * 0.4]} scale={[1.6, 0.7, 1.2]}>
            <sphereGeometry args={[1.4, 14, 10]} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

/* ---------- naga biru penjaga: ruas-ruas bersisik melilit naik dari awan ---------- */
const DRAGON_PTS = [
  [46, -22, -2],
  [37, -13, 6],
  [43, -4, 9],
  [34, 4, 8],
  [40, 12, 4],
  [32, 19, 4],
  [25, 24, 3.5],
];
const BODY = std('#3B82D6', { roughness: 0.45 });
const BODY2 = std('#3274C4', { roughness: 0.45 });
const BELLY = std('#F7E7C6', { roughness: 0.65 });
export function GuardianDragon() {
  const group = useRef();
  const segA = useRef();
  const segB = useRef();
  const belly = useRef();
  const spikes = useRef();
  const N = 76;
  const curve = useMemo(() => new THREE.CatmullRomCurve3(DRAGON_PTS.map((p) => new THREE.Vector3(...p))), []);
  const sphere = useMemo(() => new THREE.SphereGeometry(1, 12, 10), []);
  const cone = useMemo(() => new THREE.ConeGeometry(0.4, 1.2, 5), []);
  const R = 1.15;
  useLayoutEffect(() => {
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const s = new THREE.Vector3();
    const up = new THREE.Vector3(0, 1, 0);
    let ia = 0;
    let ib = 0;
    let ik = 0;
    for (let i = 0; i < N; i++) {
      const t = (i / N) * 0.97;
      const p = curve.getPoint(t);
      const rr = R * (0.3 + 0.7 * Math.pow(t, 0.7));
      s.set(rr, rr * 0.92, rr);
      m.compose(p, q.identity(), s);
      (i % 2 ? segB : segA).current.setMatrixAt(i % 2 ? ib++ : ia++, m);
      if (i % 2 === 0) {
        s.setScalar(rr * 0.7);
        m.compose(p.clone().add(new THREE.Vector3(0, -rr * 0.45, rr * 0.35)), q.identity(), s);
        belly.current.setMatrixAt(i / 2, m);
      }
      if (i % 3 === 0) {
        s.setScalar(rr);
        q.setFromAxisAngle(new THREE.Vector3(0, 0, 1), 0.25);
        m.compose(p.clone().addScaledVector(up, rr * 1.0), q, s);
        spikes.current.setMatrixAt(ik++, m);
      }
    }
    for (const r of [segA, segB, belly, spikes]) r.current.instanceMatrix.needsUpdate = true;
  }, [curve]);
  useFrame((st) => {
    if (group.current) group.current.position.y = Math.sin(st.clock.elapsedTime * 0.5) * 0.35;
  });
  const head = curve.getPoint(1);
  const headRef = useRef();
  useLayoutEffect(() => {
    // kepala menatap ke arah balai Ryu & penonton
    headRef.current?.lookAt(6, 26, 40);
  }, []);
  return (
    <group
      ref={group}
      onClick={(e) => {
        e.stopPropagation();
        focusAgent('ceo');
      }}
      onPointerOver={() => (document.body.style.cursor = 'pointer')}
      onPointerOut={() => (document.body.style.cursor = '')}
    >
      <instancedMesh ref={segA} args={[sphere, BODY, Math.ceil(N / 2)]} castShadow />
      <instancedMesh ref={segB} args={[sphere, BODY2, Math.floor(N / 2)]} castShadow />
      <instancedMesh ref={belly} args={[sphere, BELLY, Math.ceil(N / 2)]} />
      <instancedMesh ref={spikes} args={[cone, GOLD, Math.ceil(N / 3)]} castShadow />
      {/* kepala menatap ke arah balai Ryu & kamera */}
      <group ref={headRef} position={head} scale={1.45}>
        <Sph rad={1.2} sc={[1, 0.9, 1.2]} m={BODY} seg={[18, 14]} />
        <Sph p={[0, -0.35, 1.15]} rad={0.85} sc={[1, 0.62, 1.15]} m={BELLY} seg={[16, 12]} />
        {[-1, 1].map((sx) => (
          <group key={sx}>
            <Sph p={[sx * 0.62, 0.45, 0.85]} rad={0.28} m={M.white} seg={[12, 10]} />
            <Sph p={[sx * 0.66, 0.48, 1.06]} rad={0.15} m={M.graphite} seg={[10, 8]} />
            <Cone p={[sx * 0.55, 1.2, -0.4]} r={[-0.7, 0, -sx * 0.25]} a={[0.2, 1.4, 6]} m={GOLD} />
            <Cyl p={[sx * 1.2, -0.35, 1.3]} r={[0.4, 0, sx * 1.2]} a={[0.05, 0.025, 2.6, 5]} m={GOLD} />
          </group>
        ))}
        <Cone p={[0, 1.0, -1.0]} r={[-1.2, 0, 0]} a={[0.5, 1.4, 6]} m={M.cream} />
      </group>
    </group>
  );
}

/* ---------- lautan awan di bawah tebing ---------- */
export function CloudFloor() {
  const ref = useRef();
  const puffs = useMemo(() => {
    const rnd = seeded(7);
    const out = [];
    for (let i = 0; i < 230; i++) {
      const a = rnd() * Math.PI * 2;
      const r = 8 + rnd() * 120;
      out.push([Math.cos(a) * r, CLOUD_Y + (rnd() - 0.5) * 2.4, Math.sin(a) * r, 3 + rnd() * 4.5]);
    }
    // awan melingkari pinggang tebing
    for (let i = 0; i < 18; i++) {
      const side = i % 2 ? 1 : -1;
      out.push([side * (24 + rnd() * 10), 2 + rnd() * 16, -4 + rnd() * 10, 2.2 + rnd() * 1.6]);
    }
    return out;
  }, []);
  const geo = useMemo(() => new THREE.IcosahedronGeometry(1, 2), []);
  useLayoutEffect(() => {
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    puffs.forEach(([x, y, z, s], i) => {
      m.compose(new THREE.Vector3(x, y, z), q, new THREE.Vector3(s * 1.4, s * 0.5, s));
      ref.current.setMatrixAt(i, m);
    });
    ref.current.instanceMatrix.needsUpdate = true;
  }, [puffs]);
  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.y += dt * 0.003;
  });
  return (
    <group>
      <mesh position={[0, CLOUD_Y - 1.4, 0]} material={CLOUD} receiveShadow>
        <cylinderGeometry args={[200, 200, 0.4, 48]} />
      </mesh>
      <instancedMesh ref={ref} args={[geo, CLOUD, puffs.length]} receiveShadow />
    </group>
  );
}
