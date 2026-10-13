// Komponen dunia Kyumen: dermaga di atas laut, atap genteng, papan nama, menara naga,
// perahu, mercusuar, patung naga, efek misi, dan kamera.
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { AGENTS, GUESTS, LIFT_X, SIDE_X, CELL, HALF, TIER_GAP, STAIR_Z, ROOM_LIST, tierY, tierOf } from '../data/hive';
import { useHive } from '../sim/store';
import { world, focusAgent } from '../sim/engine';
import { M, std, Box, Cyl, Sph, Cone } from './materials';
import { marbleTexture } from './textures';
import { KyuWorker } from './HiveWorker';
import { DragonBody } from './Dragon';
import { StoneLantern, PaperLantern } from './Furniture';
import { StaticMerge } from './StaticMerge';

export function Agents() {
  return [...AGENTS, ...GUESTS].map((def) => <KyuWorker key={def.id} def={def} />);
}

function seeded(seed) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

/* ---------- ukuran dermaga ---------- */

const GROUND = -2.2; // permukaan dermaga
const SEA = -2.9; // permukaan laut
const PIER = { x0: -30, x1: 36, z0: -20, z1: 26 };
const BASE = { x0: -52, x1: 58, z0: -40, z1: 50 }; // alas diorama (laut + lapisan tanah)
const MAIN_W = CELL * 3; // lebar gedung utama
const MAIN_D = CELL * 2;

/* ---------- elemen kecil ---------- */

// pinus Jepang bertingkat
function Pine({ p, s = 1 }) {
  return (
    <group position={p} scale={s}>
      <Cyl p={[0, 0.9, 0]} r={[0, 0, 0.12]} a={[0.12, 0.2, 1.8, 7]} m={M.brown} />
      <Sph p={[-0.5, 1.7, 0]} rad={0.9} sc={[1.5, 0.45, 1.1]} m={M.pine} seg={[10, 6]} />
      <Sph p={[0.5, 2.3, 0.1]} rad={0.75} sc={[1.5, 0.45, 1.1]} m={M.pineLight} seg={[10, 6]} />
      <Sph p={[0, 2.85, -0.1]} rad={0.55} sc={[1.5, 0.45, 1.1]} m={M.pine} seg={[10, 6]} />
    </group>
  );
}

// pohon sakura
const SAKURA = std('#F6B8C8', { roughness: 0.85 });
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

// rumah kecil beratap merah (kota pelabuhan di belakang)
const ROOF_RED = std('#B8402F', { roughness: 0.6 });
const HOUSE_WALLS = [std('#E8DCC8'), std('#D7C3A3'), std('#C9D3DE'), std('#E3CDB8')];
function House({ p, w = 2.4, d = 2, h = 2, r = 0, wall = 0 }) {
  return (
    <group position={p} rotation={[0, r, 0]}>
      <Box p={[0, h / 2, 0]} s={[w, h, d]} m={HOUSE_WALLS[wall % 4]} />
      <mesh position={[0, h, 0]} material={ROOF_RED} castShadow>
        <primitive object={hipRoofGeometry(w + 0.5, d + 0.5, h * 0.55)} attach="geometry" />
      </mesh>
      <Box p={[0, h * 0.4, d / 2 + 0.01]} s={[0.5, h * 0.8, 0.02]} m={M.gold} shadow={false} />
      <Box p={[w * 0.28, h * 0.6, d / 2 + 0.01]} s={[0.45, 0.4, 0.02]} m={M.window} shadow={false} />
    </group>
  );
}

// atap limas (hip roof): alas W x D, tinggi H, bubungan sepanjang sumbu z
const roofCache = {};
function hipRoofGeometry(W, D, H) {
  const key = `${W}|${D}|${H}`;
  if (roofCache[key]) return roofCache[key];
  const w = W / 2;
  const d = D / 2;
  const r = Math.max(0, d - w * 0.9); // setengah panjang bubungan
  const A = [-w, 0, -d];
  const B = [w, 0, -d];
  const C = [w, 0, d];
  const Dd = [-w, 0, d];
  const R1 = [0, H, -r];
  const R2 = [0, H, r];
  const tris = [
    // sisi kanan (+x) & kiri (-x): trapesium
    [B, R2, C], [B, R1, R2],
    [Dd, R2, R1], [Dd, R1, A],
    // ujung depan (+z) & belakang (-z): segitiga
    [C, R2, Dd],
    [A, R1, B],
    // alas
    [A, B, C], [A, C, Dd],
  ];
  const pos = new Float32Array(tris.length * 9);
  tris.forEach((t, i) => t.forEach((v, j) => pos.set(v, i * 9 + j * 3)));
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  g.computeVertexNormals();
  roofCache[key] = g;
  return g;
}

function HipRoof({ p, w, d, h, m = M.tile, ridge = true }) {
  return (
    <group position={p}>
      {/* lis atap */}
      <Box p={[0, 0.06, 0]} s={[w + 0.1, 0.12, d + 0.1]} m={M.tileEdge} />
      <mesh position={[0, 0.12, 0]} material={m} castShadow receiveShadow>
        <primitive object={hipRoofGeometry(w, d, h)} attach="geometry" />
      </mesh>
      {ridge && d > w && (
        <>
          <Box p={[0, 0.12 + h, 0]} s={[0.22, 0.2, d - w * 0.9 * 2 + 0.6]} m={M.tileEdge} />
          {[-1, 1].map((sz) => (
            <Sph key={sz} p={[0, 0.3 + h, sz * (d / 2 - w * 0.45 + 0.3)]} rad={0.2} m={M.dragon} seg={[8, 6]} />
          ))}
        </>
      )}
    </group>
  );
}

/* ---------- papan nama (tekstur kanvas) ---------- */

function signTexture(lines, { w = 1024, h = 512, bg = '#F4EBDD', fg = '#22324F' } = {}) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const g = c.getContext('2d');
  g.fillStyle = bg;
  g.fillRect(0, 0, w, h);
  // panel kiri navy dengan mangkuk ramen
  g.fillStyle = '#22324F';
  g.fillRect(0, 0, h * 0.62, h);
  g.fillStyle = '#E5483B';
  g.fillRect(h * 0.62, 0, 14, h);
  const cx = h * 0.31;
  const cy = h * 0.56;
  g.strokeStyle = '#F4EBDD';
  g.lineWidth = 14;
  g.beginPath();
  g.arc(cx, cy, h * 0.17, 0, Math.PI);
  g.closePath();
  g.stroke();
  g.lineWidth = 9;
  g.beginPath();
  g.moveTo(cx - h * 0.12, cy - h * 0.3);
  g.lineTo(cx + h * 0.14, cy - h * 0.06);
  g.moveTo(cx - h * 0.04, cy - h * 0.33);
  g.lineTo(cx + h * 0.2, cy - h * 0.09);
  g.stroke();
  for (let i = 0; i < 3; i++) {
    g.beginPath();
    g.moveTo(cx - h * 0.1 + i * h * 0.1, cy - h * 0.02);
    g.bezierCurveTo(cx - h * 0.06 + i * h * 0.1, cy + h * 0.05, cx - h * 0.14 + i * h * 0.1, cy + h * 0.08, cx - h * 0.1 + i * h * 0.1, cy + h * 0.13);
    g.stroke();
  }
  g.fillStyle = fg;
  g.textAlign = 'left';
  g.textBaseline = 'middle';
  const x0 = h * 0.62 + 50;
  lines.forEach(([text, size, y, color]) => {
    g.font = `800 ${size}px "Noto Sans JP", "Yu Gothic", "Meiryo", system-ui, sans-serif`;
    g.fillStyle = color || fg;
    g.fillText(text, x0, y);
  });
  // sudut merah
  g.fillStyle = '#E5483B';
  g.beginPath();
  g.moveTo(w, 0);
  g.lineTo(w - 70, 0);
  g.lineTo(w, 70);
  g.fill();
  g.beginPath();
  g.moveTo(w, h);
  g.lineTo(w - 70, h);
  g.lineTo(w, h - 70);
  g.fill();
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

function Billboard({ p, w = 11, h = 5.5 }) {
  const mat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        map: signTexture([
          ['KYUKA RAMEN', 96, 140],
          ['VIRTUAL', 96, 245],
          ['キュウカ ラーメン バーチャル', 46, 345],
          ['「仮想店舗」', 46, 420, '#E5483B'],
        ]),
        roughness: 0.6,
        emissive: '#FFFFFF',
        emissiveIntensity: 0.08,
      }),
    [],
  );
  return (
    <group position={p}>
      {[-1, 1].map((sx) => (
        <Box key={sx} p={[sx * w * 0.32, -h * 0.55, -0.1]} s={[0.2, h * 0.9, 0.2]} m={M.graphite} />
      ))}
      <Box p={[0, 0, -0.12]} s={[w + 0.3, h + 0.3, 0.2]} m={M.royal} />
      <mesh position={[0, 0, 0.0]} material={mat}>
        <planeGeometry args={[w, h]} />
      </mesh>
    </group>
  );
}

function SmallSign({ p, r = 0 }) {
  const mat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        map: signTexture(
          [
            ['kyuka', 120, 190, '#F4EBDD'],
            ['ramen', 120, 330, '#F4EBDD'],
          ],
          { bg: '#22324F', fg: '#F4EBDD' },
        ),
        roughness: 0.6,
      }),
    [],
  );
  return (
    <group position={p} rotation={[0, r, 0]}>
      <Box p={[0, 0, -0.06]} s={[4.2, 2.2, 0.12]} m={M.gold} />
      <mesh position={[0, 0, 0.01]} material={mat}>
        <planeGeometry args={[4, 2]} />
      </mesh>
    </group>
  );
}

/* ---------- dermaga & laut ---------- */

// tangga dari dermaga (y -2.2) ke pintu Genkan (y 0)
function LobbyStairs() {
  const steps = 6;
  const rise = 2.2 / steps;
  const depth = 4.1 / steps;
  return (
    <group>
      {Array.from({ length: steps }, (_, k) => {
        const top = -2.2 + (k + 1) * rise;
        const h = top + 2.2;
        return <Box key={k} p={[0, top - h / 2, STAIR_Z + 4.1 - (k + 0.5) * depth]} s={[2.6, h, depth + 0.02]} m={k % 2 ? M.stone : M.creamDark} />;
      })}
      {[-1, 1].map((sx) => (
        <group key={sx}>
          <Box p={[sx * 1.35, -0.2, STAIR_Z + 2.05]} r={[Math.atan2(2.2, 4.1), 0, 0]} s={[0.1, 0.1, 4.7]} m={M.red} />
          <Cyl p={[sx * 1.35, -1.55, STAIR_Z + 4.0]} a={[0.05, 0.05, 1.3, 5]} m={M.red} />
          <Cyl p={[sx * 1.35, 0.35, STAIR_Z + 0.2]} a={[0.05, 0.05, 0.9, 5]} m={M.red} />
        </group>
      ))}
    </group>
  );
}

// fondasi batu di bawah lantai 1 (dari dermaga sampai lantai)
function Foundation({ x, z, w, d }) {
  const h = -0.56 - GROUND;
  return (
    <group position={[x, GROUND + h / 2, z]}>
      <Box s={[w + 0.4, h, d + 0.4]} m={M.earthDark} />
      <Box p={[0, h / 2 - 0.08, 0]} s={[w + 0.55, 0.16, d + 0.55]} m={M.gold} />
    </group>
  );
}

// gerbang torii kecil di jalan masuk
function Torii({ p }) {
  return (
    <group position={p}>
      {[-1.6, 1.6].map((x) => (
        <Cyl key={x} p={[x, 1.8, 0]} a={[0.16, 0.19, 3.6, 10]} m={M.red} />
      ))}
      <Box p={[0, 3.75, 0]} s={[4.6, 0.3, 0.4]} m={M.graphite} />
      <Box p={[0, 3.45, 0]} s={[4.0, 0.22, 0.3]} m={M.red} />
      <Box p={[0, 3.0, 0]} s={[3.6, 0.2, 0.25]} m={M.red} />
      <Box p={[0, 3.25, 0.16]} s={[0.6, 0.45, 0.04]} m={M.royal} />
    </group>
  );
}

export function Island() {
  const stoneMat = useMemo(() => std('#FFFFFF', { map: marbleTexture(), color: '#C9C7C2', roughness: 0.85 }), []);
  const rnd = seeded(7);
  const trees = [];
  // pinus & sakura di sisi kiri dan belakang dermaga
  for (let i = 0; i < 14; i++) {
    const x = PIER.x0 + 2 + rnd() * 6;
    const z = PIER.z0 + 2 + rnd() * 32;
    trees.push(i % 3 ? <Pine key={`l${i}`} p={[x, GROUND, z]} s={0.8 + rnd() * 0.5} /> : <Sakura key={`l${i}`} p={[x, GROUND, z]} s={0.8 + rnd() * 0.4} />);
  }
  for (let i = 0; i < 8; i++) {
    const x = -16 + i * 4.2 + rnd();
    trees.push(<Pine key={`b${i}`} p={[x, GROUND, PIER.z0 + 2.5 + rnd() * 2]} s={0.75 + rnd() * 0.4} />);
  }
  const houses = [];
  for (let i = 0; i < 7; i++) {
    houses.push(
      <House key={i} p={[18 + (i % 4) * 4.4, GROUND, PIER.z0 + 2.6 + Math.floor(i / 4) * 4]} w={2.6 + (i % 2) * 0.6} d={2.4} h={1.8 + (i % 3) * 0.5} wall={i} r={(i % 2) * 0.1} />,
    );
  }
  const W = PIER.x1 - PIER.x0;
  const D = PIER.z1 - PIER.z0;
  const BW = BASE.x1 - BASE.x0;
  const BD = BASE.z1 - BASE.z0;
  const bcx = (BASE.x0 + BASE.x1) / 2;
  const bcz = (BASE.z0 + BASE.z1) / 2;
  return (
    <StaticMerge>
      {/* alas diorama: lapisan pasir & tanah di bawah laut */}
      <Box p={[bcx, -6.6, bcz]} s={[BW, 1.4, BD]} m={M.sand} />
      <Box p={[bcx, -8.0, bcz]} s={[BW, 1.4, BD]} m={M.earth} />
      <Box p={[bcx, -9.2, bcz]} s={[BW, 1.0, BD]} m={M.earthDark} />
      {/* dermaga batu */}
      <mesh position={[(PIER.x0 + PIER.x1) / 2, (GROUND - 6) / 2, (PIER.z0 + PIER.z1) / 2]} material={stoneMat} receiveShadow castShadow>
        <boxGeometry args={[W, GROUND + 6, D]} />
      </mesh>
      {/* tembok laut berpanel putih di sisi depan & kanan */}
      {Array.from({ length: Math.floor(W / 2.4) }, (_, i) => (
        <Box key={`f${i}`} p={[PIER.x0 + 1.2 + i * 2.4, GROUND - 0.55, PIER.z1 + 0.05]} s={[2.2, 0.7, 0.12]} m={M.cream} shadow={false} />
      ))}
      {Array.from({ length: Math.floor(D / 2.4) }, (_, i) => (
        <Box key={`r${i}`} p={[PIER.x1 + 0.05, GROUND - 0.55, PIER.z0 + 1.2 + i * 2.4]} s={[0.12, 0.7, 2.2]} m={M.cream} shadow={false} />
      ))}
      {/* tepi dermaga */}
      <Box p={[(PIER.x0 + PIER.x1) / 2, GROUND + 0.08, PIER.z1 - 0.25]} s={[W, 0.16, 0.5]} m={M.creamDark} />
      {/* fondasi kedai & gedung samping */}
      <Foundation x={0} z={0} w={MAIN_W} d={MAIN_D} />
      <Foundation x={SIDE_X} z={0} w={CELL} d={MAIN_D} />
      {/* jalan batu dari tepi dermaga ke tangga Genkan */}
      {Array.from({ length: 5 }, (_, i) => (
        <Box key={`s${i}`} p={[i % 2 ? 0.3 : -0.3, GROUND + 0.04, STAIR_Z + 5 + i * 1.6]} s={[1.6, 0.08, 1.2]} m={M.stone} shadow={false} />
      ))}
      <LobbyStairs />
      <Torii p={[0, GROUND, STAIR_Z + 11]} />
      {[-1, 1].map((sx) => [STAIR_Z + 5, STAIR_Z + 9].map((z) => <StoneLantern key={`${sx}-${z}`} p={[sx * 2.4, GROUND, z]} />))}
      {[
        [-12, 15],
        [12, 15],
        [-24, 4],
        [32, 14],
        [16, 20],
        [-16, 21],
      ].map(([x, z]) => (
        <StoneLantern key={`l${x}${z}`} p={[x, GROUND, z]} s={1.1} />
      ))}
      {/* dermaga kayu kecil di depan kanan */}
      <group position={[26, GROUND - 0.05, PIER.z1]}>
        <Box p={[0, 0, 5]} s={[3, 0.18, 10]} m={M.wood} />
        {[0, 1, 2, 3].map((i) => [-1.4, 1.4].map((x) => <Cyl key={`${i}${x}`} p={[x, -0.6, 1.5 + i * 2.6]} a={[0.12, 0.12, 1.4, 6]} m={M.brown} />))}
      </group>
      {/* gudang: tumpukan peti di luar Main Warehouse */}
      {[0, 1, 2].map((i) => (
        <Box key={`c${i}`} p={[SIDE_X + 6.2, GROUND + 0.35 + (i === 2 ? 0.7 : 0), -6 + (i % 2) * 0.9]} s={[1, 0.7, 0.8]} m={i % 2 ? M.wood : M.nectar} />
      ))}
      {trees}
      {houses}
    </StaticMerge>
  );
}

// permukaan laut yang beriak pelan
export function Sea() {
  const ref = useRef();
  useFrame((st) => {
    if (ref.current) ref.current.position.y = SEA + Math.sin(st.clock.elapsedTime * 0.8) * 0.04;
  });
  const BW = BASE.x1 - BASE.x0;
  const BD = BASE.z1 - BASE.z0;
  return (
    <group>
      <mesh ref={ref} position={[(BASE.x0 + BASE.x1) / 2, SEA, (BASE.z0 + BASE.z1) / 2]} rotation={[-Math.PI / 2, 0, 0]} material={M.water} receiveShadow>
        <planeGeometry args={[BW, BD]} />
      </mesh>
      {/* sisi depan & samping air (potongan diorama) */}
      <mesh position={[(BASE.x0 + BASE.x1) / 2, (SEA - 5.9) / 2, BASE.z1]} material={M.water}>
        <planeGeometry args={[BW, SEA + 5.9]} />
      </mesh>
      <mesh position={[BASE.x1, (SEA - 5.9) / 2, (BASE.z0 + BASE.z1) / 2]} rotation={[0, Math.PI / 2, 0]} material={M.water}>
        <planeGeometry args={[BD, SEA + 5.9]} />
      </mesh>
    </group>
  );
}

// perahu yang terombang-ambing
function Boat({ p, r = 0, c = '#F4EBDD', speed = 1 }) {
  const ref = useRef();
  const hull = useMemo(() => std(c, { roughness: 0.6 }), [c]);
  const off = useMemo(() => Math.random() * 10, []);
  useFrame((st) => {
    if (!ref.current) return;
    const t = st.clock.elapsedTime * speed + off;
    ref.current.position.y = SEA + 0.15 + Math.sin(t * 1.3) * 0.08;
    ref.current.rotation.z = Math.sin(t * 1.1) * 0.05;
    ref.current.rotation.x = Math.sin(t * 0.9) * 0.03;
  });
  return (
    <group ref={ref} position={p} rotation={[0, r, 0]}>
      <Box p={[0, 0.2, 0]} s={[1.6, 0.5, 4.2]} m={hull} />
      <Cone p={[0, 0.2, 2.5]} r={[Math.PI / 2, 0, 0]} a={[0.8, 0.9, 4]} m={hull} />
      <Box p={[0, 0.47, 0]} s={[1.4, 0.06, 4]} m={M.wood} />
      <Box p={[0, 0.85, -0.6]} s={[1.1, 0.7, 1.4]} m={M.cream} />
      <Box p={[0, 1.24, -0.6]} s={[1.2, 0.08, 1.5]} m={M.red} />
      <PaperLantern p={[0, 1.5, 0.8]} s={0.7} />
    </group>
  );
}

// mercusuar merah-putih di atas batu karang
function Lighthouse({ p }) {
  const light = useRef();
  useFrame((st) => {
    if (light.current) light.current.rotation.y = st.clock.elapsedTime * 1.2;
  });
  return (
    <group position={p}>
      <Sph p={[0, 0, 0]} rad={2.2} sc={[1.2, 0.55, 1]} m={M.earthDark} seg={[10, 6]} />
      {[0, 1, 2, 3, 4].map((i) => (
        <Cyl key={i} p={[0, 1.1 + i * 0.9, 0]} a={[0.75 - i * 0.07, 0.8 - i * 0.07, 0.9, 14]} m={i % 2 ? M.white : M.red} />
      ))}
      <Cyl p={[0, 5.7, 0]} a={[0.55, 0.55, 0.7, 10]} m={M.glass} />
      <mesh ref={light} position={[0, 5.7, 0]} material={M.led}>
        <boxGeometry args={[0.9, 0.2, 0.2]} />
      </mesh>
      <Cone p={[0, 6.4, 0]} a={[0.7, 0.7, 10]} m={M.red} />
    </group>
  );
}

// patung naga raksasa di batu pelabuhan: diklik = sorot Ryu
function DragonStatue({ p, r = 0 }) {
  const refs = { head: useRef(), wl: useRef(), wr: useRef(), al: useRef(), ar: useRef(), eyes: useRef() };
  const g = useRef();
  useFrame((st) => {
    const t = st.clock.elapsedTime;
    if (g.current) g.current.position.y = Math.sin(t * 0.9) * 0.08;
    if (refs.wl.current) {
      refs.wl.current.rotation.z = -(0.45 + Math.sin(t * 2) * 0.25);
      refs.wr.current.rotation.z = 0.45 + Math.sin(t * 2) * 0.25;
      refs.head.current.rotation.y = Math.sin(t * 0.4) * 0.3;
      refs.ar.current.rotation.x = -2.2 + Math.sin(t * 1.5) * 0.3;
    }
  });
  return (
    <group
      position={p}
      rotation={[0, r, 0]}
      onClick={(e) => {
        e.stopPropagation();
        focusAgent('ceo');
      }}
      onPointerOver={() => (document.body.style.cursor = 'pointer')}
      onPointerOut={() => (document.body.style.cursor = '')}
    >
      <Sph p={[0, -0.3, 0]} rad={2.8} sc={[1.3, 0.5, 1.1]} m={M.earthDark} seg={[10, 6]} />
      <Sph p={[1.6, -0.1, 1.0]} rad={1.0} sc={[1, 0.6, 1]} m={M.stone} seg={[8, 6]} />
      <group ref={g} position={[0, 0.9, 0]} scale={3.2}>
        <DragonBody refs={refs} body={M.dragon} vest="#E5483B" />
      </group>
    </group>
  );
}

// gerobak pengantar barang dari Main Warehouse ke kedai (bolak-balik)
function DeliveryCart() {
  const ref = useRef();
  const wheels = useRef([]);
  useFrame((st) => {
    if (!ref.current) return;
    const t = st.clock.elapsedTime * 0.12;
    const k = (Math.sin(t) + 1) / 2; // 0 = gudang, 1 = kedai
    ref.current.position.x = SIDE_X - 1 - k * 7.5;
    ref.current.rotation.y = Math.cos(t) > 0 ? -Math.PI / 2 : Math.PI / 2;
    wheels.current.forEach((w) => w && (w.rotation.x = st.clock.elapsedTime * 3));
  });
  return (
    <group ref={ref} position={[SIDE_X - 1, GROUND, 12.2]}>
      <Box p={[0, 0.65, 0]} s={[1.0, 0.5, 1.5]} m={M.wood} />
      <Box p={[0, 1.0, -0.1]} s={[0.8, 0.3, 0.6]} m={M.nectar} />
      <Box p={[0, 1.0, 0.4]} s={[0.6, 0.3, 0.4]} m={M.creamDark} />
      <Box p={[0, 0.9, -0.95]} r={[0.4, 0, 0]} s={[0.9, 0.06, 0.06]} m={M.brown} />
      {[-0.55, 0.55].map((x) => (
        <mesh key={x} ref={(el) => wheels.current.push(el)} position={[x, 0.35, 0.1]} rotation={[0, 0, Math.PI / 2]} material={M.graphite}>
          <cylinderGeometry args={[0.35, 0.35, 0.1, 12]} />
        </mesh>
      ))}
    </group>
  );
}

export function Harbor() {
  return (
    <group>
      <Sea />
      <Boat p={[-14, 0, 36]} r={0.4} c="#F4EBDD" />
      <Boat p={[10, 0, 41]} r={-0.9} c="#C9D3DE" speed={0.8} />
      <Boat p={[44, 0, 8]} r={0.1} c="#E5483B" speed={1.2} />
      <Lighthouse p={[44, SEA, 34]} />
      <DragonStatue p={[-6, SEA, 37]} r={0.3} />
      <DeliveryCart />
    </group>
  );
}

/* ---------- atap kedai ---------- */

// cari ruangan tepat di atas ruangan lain (grid sama, tingkat berikutnya)
const ABOVE = new Set(ROOM_LIST.filter((r) => r.gx !== undefined).map((r) => `${r.tier}|${r.gx}|${r.row}`));

export function Roofs() {
  const floor = useHive((s) => s.floor);
  const show = (tier) => floor === 'all' || floor > tier;
  const small = ROOM_LIST.filter(
    (r) => r.gx !== undefined && r.tier < 2 && r.kind !== 'garden' && !ABOVE.has(`${r.tier + 1}|${r.gx}|${r.row}`),
  );
  const top = tierY(2) + 3.1;
  const S = HALF * 2 + 1.4;
  return (
    <group>
      {/* atap kecil di ruangan yang tidak tertutup lantai di atasnya */}
      {small.map((r) =>
        show(r.tier) ? (
          <HipRoof key={r.id} p={[r.x, r.y + TIER_GAP - 0.4, r.z]} w={S} d={S} h={1.4} ridge={false} />
        ) : null,
      )}
      {/* atap utama di atas Ruang Tatami & Ruang Chief */}
      {floor === 'all' && (
        <group>
          <HipRoof p={[0, top, 0]} w={CELL + 1.8} d={MAIN_D + 1.8} h={3.2} />
          <Billboard p={[0, top + 7.4, -3.2]} />
          <SmallSign p={[-CELL * 0.5 + 0.2, tierY(2) + 2.4, CELL * 0.5 + 0.2]} r={0} />
        </group>
      )}
      {/* atap merah gedung Central Kitchen & Main Warehouse */}
      {show(0) && <HipRoof p={[SIDE_X, 3.1, 0]} w={CELL + 1.4} d={MAIN_D + 1.4} h={2.6} m={ROOF_RED} />}
      {/* lis atap (engawa) tiap tingkat di sekeliling gedung utama */}
      {[0, 1].map((t) =>
        show(t) ? (
          <group key={t} position={[0, tierY(t + 1) - 0.62, 0]}>
            <Box p={[0, 0, MAIN_D / 2 + 0.6]} r={[0.35, 0, 0]} s={[MAIN_W + 1.6, 0.12, 1.1]} m={M.tile} />
            <Box p={[0, 0, -MAIN_D / 2 - 0.6]} r={[-0.35, 0, 0]} s={[MAIN_W + 1.6, 0.12, 1.1]} m={M.tile} />
            <Box p={[MAIN_W / 2 + 0.6, 0, 0]} r={[0, 0, -0.35]} s={[1.1, 0.12, MAIN_D + 1.6]} m={M.tile} />
            <Box p={[-MAIN_W / 2 - 0.6, 0, 0]} r={[0, 0, 0.35]} s={[1.1, 0.12, MAIN_D + 1.6]} m={M.tile} />
          </group>
        ) : null,
      )}
    </group>
  );
}

/* ---------- menara naga (jalur antar lantai) ---------- */

export function Lift() {
  const cab = useRef();
  const top = tierY(2) + 4.2;
  const bottom = GROUND;
  const h = top - bottom;
  useFrame((st) => {
    if (cab.current) cab.current.position.y = tierY(1) + Math.sin(st.clock.elapsedTime * 0.5) * (TIER_GAP + 0.4);
  });
  const W = 2.6;
  const bridge = -LIFT_X - CELL * 1.5 - W / 2; // panjang jembatan dari menara ke dinding kedai
  return (
    <group position={[LIFT_X, 0, 0]}>
      {/* empat tiang merah */}
      {[
        [-1, -1],
        [1, -1],
        [-1, 1],
        [1, 1],
      ].map(([sx, sz]) => (
        <Box key={`${sx}${sz}`} p={[(sx * W) / 2, (top + bottom) / 2, (sz * W) / 2]} s={[0.22, h, 0.22]} m={M.red} />
      ))}
      {[0, 1, 2].map((t) => (
        <group key={t} position={[0, tierY(t), 0]}>
          <Box p={[0, -0.15, 0]} s={[W + 0.4, 0.3, W + 0.4]} m={M.gold} />
          {/* jembatan ke gedung */}
          <Box p={[W / 2 + bridge / 2, -0.15, 0]} s={[bridge + 0.2, 0.2, 1.4]} m={M.wood} />
          <PaperLantern p={[W / 2 + 0.1, 2.0, W / 2 + 0.1]} s={0.8} />
        </group>
      ))}
      <HipRoof p={[0, top, 0]} w={W + 1.6} d={W + 1.6} h={1.6} ridge={false} />
      <Sph p={[0, top + 1.9, 0]} rad={0.28} m={M.lantern} />
      <group ref={cab}>
        <Box s={[W - 0.3, 0.12, W - 0.3]} m={M.honey} shadow={false} />
      </group>
    </group>
  );
}

/* ---------- efek misi: mutiara naga & percikan kelopak ---------- */

const bez = new THREE.Vector3();
export function Effects() {
  const drops = useRef([]);
  const bursts = useRef([]);
  useFrame(() => {
    const floor = useHive.getState().floor;
    const show = (y) => floor === 'all' || tierOf(y) <= floor;
    const ds = world.effects.filter((e) => e.type === 'drop');
    drops.current.forEach((m, i) => {
      if (!m) return;
      const e = ds[i];
      if (!e) {
        m.visible = false;
        return;
      }
      const k = Math.min(1, e.t / e.dur);
      const ctrl = e.from.clone().add(e.to).multiplyScalar(0.5);
      ctrl.y = Math.max(e.from.y, e.to.y) + 6;
      const u = 1 - k;
      bez.set(0, 0, 0)
        .addScaledVector(e.from, u * u)
        .addScaledVector(ctrl, 2 * u * k)
        .addScaledVector(e.to, k * k);
      m.position.copy(bez);
      m.scale.setScalar(1 + Math.sin(k * Math.PI) * 0.3);
      m.visible = show(bez.y);
    });
    const bs = world.effects.filter((e) => e.type === 'burst');
    bursts.current.forEach((grp, i) => {
      if (!grp) return;
      const e = bs[i];
      if (!e) {
        grp.visible = false;
        return;
      }
      const k = e.t / e.dur;
      grp.visible = show(e.at.y);
      grp.position.copy(e.at);
      grp.children.forEach((c, j) => {
        const d = e.dirs[j];
        c.position.set(d.x * k * 2.6, d.y * k * 3 - 3 * k * k, d.z * k * 2.6);
        c.scale.setScalar(Math.max(0.01, 1 - k));
        c.rotation.set(k * 6, k * 4, 0);
      });
    });
  });
  return (
    <group>
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <mesh key={i} ref={(el) => (drops.current[i] = el)} visible={false} material={M.honey}>
          <sphereGeometry args={[0.34, 16, 12]} />
        </mesh>
      ))}
      {[0, 1, 2, 3].map((i) => (
        <group key={i} ref={(el) => (bursts.current[i] = el)} visible={false}>
          {Array.from({ length: 14 }, (_, j) => (
            <mesh key={j} material={j % 2 ? SAKURA : M.honey} scale={[1, 0.3, 1]}>
              <sphereGeometry args={[0.16, 8, 6]} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}

/* ---------- kamera ---------- */

export function CameraRig() {
  const { camera, controls } = useThree();
  const focus = useHive((s) => s.focus);
  const anim = useRef(null);

  useEffect(() => {
    // layar tegak (HP) butuh kamera lebih jauh supaya kedai muat selebar layar
    const fit = Math.max(1, 0.75 / camera.aspect);
    anim.current = {
      target: new THREE.Vector3(...focus.target),
      dist: focus.dist * fit,
      dir: focus.dir ? new THREE.Vector3(...focus.dir).normalize() : null,
      t: 0,
    };
  }, [focus.key]);

  useEffect(() => {
    if (!controls) return;
    const stop = () => (anim.current = null);
    controls.addEventListener('start', stop);
    return () => controls.removeEventListener('start', stop);
  }, [controls]);

  useFrame((_, dt) => {
    if (!controls || !anim.current) return;
    const k = 1 - Math.exp(-dt * 3.2);
    controls.target.lerp(anim.current.target, k);
    if (anim.current.dir) {
      const goal = anim.current.target.clone().addScaledVector(anim.current.dir, anim.current.dist);
      camera.position.lerp(goal, k);
    } else {
      const dir = camera.position.clone().sub(controls.target);
      const d = dir.length();
      dir.normalize();
      camera.position.copy(controls.target).addScaledVector(dir, d + (anim.current.dist - d) * k);
    }
    anim.current.t += dt;
    if (anim.current.t > 2.5) anim.current = null;
    controls.update();
  });
  return null;
}

