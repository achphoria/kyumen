// Furnitur kedai Jepang low-poly. Untuk meja: sumbu +z lokal mengarah ke posisi agent berdiri.
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { M, Box, Cyl, Sph, Cone } from './materials';
import { roomSpots } from '../data/hive';

const HALF = Math.PI / 2;

function Monitor({ p = [0, 0.88, -0.15], w = 0.62, h = 0.38 }) {
  return (
    <group position={p}>
      <Box p={[0, 0, 0]} s={[w, h, 0.05]} m={M.graphite} />
      <Box p={[0, 0, 0.03]} s={[w - 0.08, h - 0.08, 0.01]} m={M.screen} shadow={false} />
      <Cyl p={[0, -h / 2 - 0.06, 0]} a={[0.03, 0.03, 0.14, 6]} m={M.silver} />
    </group>
  );
}

export function PodDesk() {
  return (
    <group>
      <Box p={[0, 0.55, 0]} s={[1.4, 0.08, 0.72]} m={M.wood} />
      <Box p={[0, 0.27, -0.3]} s={[1.3, 0.5, 0.06]} m={M.gold} />
      <Box p={[-0.65, 0.27, 0]} s={[0.06, 0.5, 0.62]} m={M.gold} />
      <Box p={[0.65, 0.27, 0]} s={[0.06, 0.5, 0.62]} m={M.gold} />
      <Monitor />
      <Box p={[0, 0.6, 0.13]} s={[0.42, 0.02, 0.14]} m={M.cream} />
      <Cyl p={[0.52, 0.66, 0.05]} a={[0.06, 0.05, 0.12, 8]} m={M.red} />
    </group>
  );
}

export function StandingDesk() {
  return (
    <group>
      <Box p={[0, 0.03, -0.05]} s={[0.7, 0.06, 0.7]} m={M.graphite} />
      <Cyl p={[0, 0.44, -0.05]} a={[0.1, 0.16, 0.8, 8]} m={M.gold} />
      <Box p={[0, 0.86, -0.05]} s={[1.1, 0.07, 0.6]} m={M.wood} />
      <mesh position={[0, 1.42, -0.32]} material={M.holo}>
        <planeGeometry args={[0.95, 0.56]} />
      </mesh>
      <Box p={[-0.15, 1.52, -0.31]} s={[0.5, 0.05, 0.01]} m={M.amber} shadow={false} />
      <Box p={[0, 1.4, -0.31]} s={[0.75, 0.05, 0.01]} m={M.amber} shadow={false} />
      <Box p={[-0.2, 1.28, -0.31]} s={[0.4, 0.05, 0.01]} m={M.amber} shadow={false} />
      <Box p={[0, 0.91, 0.12]} s={[0.38, 0.02, 0.12]} m={M.cream} />
    </group>
  );
}

// meja dengan sekat shoji di belakang agent
export function BoothDesk() {
  return (
    <group>
      <PodDesk />
      {[
        [0, 1.55, 0],
        [1.342, 0.775, Math.PI / 3],
        [-1.342, 0.775, -Math.PI / 3],
      ].map(([x, z, r]) => (
        <group key={x} position={[x, 0, z]} rotation={[0, r, 0]}>
          <Box p={[0, 1, 0]} s={[1.79, 2, 0.06]} m={M.shoji} />
          {[-0.6, 0, 0.6].map((bx) => (
            <Box key={bx} p={[bx, 1, 0]} s={[0.04, 2, 0.1]} m={M.gold} shadow={false} />
          ))}
          {[0.5, 1.0, 1.5].map((by) => (
            <Box key={by} p={[0, by, 0]} s={[1.79, 0.04, 0.1]} m={M.gold} shadow={false} />
          ))}
          <Box p={[0, 2.03, 0]} s={[1.85, 0.08, 0.14]} m={M.gold} />
        </group>
      ))}
      <Cyl p={[0, 1.95, 1.0]} a={[0.01, 0.01, 0.25, 4]} m={M.silver} />
      <Sph p={[0, 1.78, 1.0]} rad={0.09} m={M.lantern} shadow={false} />
    </group>
  );
}

// meja Chief: meja rendah pernis, layar, dan sandaran berlukis naga
export function ThroneDesk() {
  return (
    <group>
      <Box p={[0, 0.6, 0]} s={[2, 0.1, 0.9]} m={M.royal} />
      <Box p={[0, 0.3, -0.4]} s={[1.9, 0.55, 0.08]} m={M.gold} />
      <Box p={[-0.9, 0.3, 0]} s={[0.08, 0.55, 0.8]} m={M.gold} />
      <Box p={[0.9, 0.3, 0]} s={[0.08, 0.55, 0.8]} m={M.gold} />
      <Monitor p={[0, 1.02, -0.22]} w={1.3} h={0.62} />
      <Cyl p={[0.75, 0.72, 0.1]} a={[0.07, 0.06, 0.14, 8]} m={M.red} />
      {/* kursi & sandaran byobu */}
      <Box p={[0, 0.3, 1.2]} s={[1.1, 0.25, 0.8]} m={M.amber} />
      {[-0.7, 0, 0.7].map((x, i) => (
        <group key={x} position={[x, 0, 1.65 - Math.abs(x) * 0.2]} rotation={[0, -x * 0.5, 0]}>
          <Box p={[0, 1.1, 0]} s={[0.7, 1.9, 0.06]} m={i === 1 ? M.royal : M.shoji} />
          <Box p={[0, 2.08, 0]} s={[0.74, 0.07, 0.1]} m={M.gold} />
        </group>
      ))}
      <Sph p={[0, 1.4, 1.6]} rad={0.26} sc={[1, 1, 0.2]} m={M.amber} />
      <Sph p={[0, 1.4, 1.58]} rad={0.2} sc={[1, 1, 0.2]} m={M.cream} />
    </group>
  );
}

export const DESKS = { pod: PodDesk, standing: StandingDesk, booth: BoothDesk, throne: ThroneDesk };

function Plant({ p, s = 1 }) {
  return (
    <group position={p} scale={s}>
      <Cyl p={[0, 0.2, 0]} a={[0.2, 0.15, 0.4, 8]} m={M.pot} />
      <Sph p={[0, 0.62, 0]} rad={0.32} m={M.leaf} seg={[7, 5]} />
      <Sph p={[0.12, 0.85, 0.05]} rad={0.2} m={M.leafDark} seg={[6, 4]} />
    </group>
  );
}

// bambu dalam pot
function Bamboo({ p, s = 1 }) {
  return (
    <group position={p} scale={s}>
      <Cyl p={[0, 0.2, 0]} a={[0.22, 0.18, 0.4, 8]} m={M.pot} />
      {[
        [-0.08, 0, 1.6],
        [0.08, 0.05, 1.9],
        [0, -0.08, 1.3],
      ].map(([x, z, h], i) => (
        <group key={i}>
          <Cyl p={[x, 0.4 + h / 2, z]} a={[0.025, 0.025, h, 5]} m={M.leaf} />
          <Sph p={[x + 0.1, 0.4 + h * 0.85, z]} rad={0.16} sc={[1.4, 0.35, 0.6]} m={M.leafDark} seg={[6, 4]} />
          <Sph p={[x - 0.1, 0.4 + h * 0.65, z]} rad={0.14} sc={[1.4, 0.35, 0.6]} m={M.leaf} seg={[6, 4]} />
        </group>
      ))}
    </group>
  );
}

// lentera kertas merah tergantung
export function PaperLantern({ p, s = 1 }) {
  return (
    <group position={p} scale={s}>
      <Cyl p={[0, 0.38, 0]} a={[0.01, 0.01, 0.3, 4]} m={M.graphite} shadow={false} />
      <Cyl p={[0, 0.22, 0]} a={[0.1, 0.1, 0.04, 10]} m={M.graphite} shadow={false} />
      <Sph rad={0.2} sc={[1, 1.15, 1]} m={M.lantern} seg={[12, 10]} shadow={false} />
      <Cyl p={[0, -0.22, 0]} a={[0.1, 0.1, 0.04, 10]} m={M.graphite} shadow={false} />
    </group>
  );
}

// lentera batu (tōrō)
export function StoneLantern({ p, s = 1 }) {
  return (
    <group position={p} scale={s}>
      <Box p={[0, 0.06, 0]} s={[0.5, 0.12, 0.5]} m={M.stone} />
      <Cyl p={[0, 0.45, 0]} a={[0.09, 0.11, 0.7, 6]} m={M.stone} />
      <Box p={[0, 0.84, 0]} s={[0.42, 0.08, 0.42]} m={M.stone} />
      <Box p={[0, 1.0, 0]} s={[0.3, 0.26, 0.3]} m={M.lantern} />
      <Cone p={[0, 1.27, 0]} r={[0, Math.PI / 4, 0]} a={[0.38, 0.28, 4]} m={M.stone} />
      <Sph p={[0, 1.45, 0]} rad={0.06} m={M.stone} seg={[6, 4]} />
    </group>
  );
}

// tikar tatami persegi dengan list kain gelap
function Rug({ m = M.tatami, rad = 1.3 }) {
  const w = rad * 1.6;
  return (
    <group>
      <Box p={[0, 0.012, 0]} s={[w + 0.08, 0.02, w + 0.08]} m={M.tileEdge} shadow={false} />
      <Box p={[0, 0.02, 0]} s={[w, 0.02, w]} m={m} shadow={false} />
    </group>
  );
}

/* ---------- prop divisi (di tengah ruangan) ---------- */

// uap mengepul dari panci/mangkuk
export function Steam({ p = [0, 1, 0], s = 1 }) {
  const ref = useRef();
  useFrame((st) => {
    if (!ref.current) return;
    const t = st.clock.elapsedTime;
    ref.current.children.forEach((c, i) => {
      const k = (t * 0.45 + i / 3) % 1;
      c.position.set(Math.sin(t + i * 2) * 0.08, k * 0.9, 0);
      c.scale.setScalar(Math.max(0.01, (0.4 + k) * (1 - k) * 1.6));
    });
  });
  return (
    <group ref={ref} position={p} scale={s} userData={{ dynamic: true }}>
      {[0, 1, 2].map((i) => (
        <mesh key={i} material={M.cloud}>
          <sphereGeometry args={[0.16, 8, 6]} />
        </mesh>
      ))}
    </group>
  );
}

// mangkuk ramen kecil (merah, kuah, telur, nori, sumpit)
export function Bowl({ p = [0, 0, 0], s = 1 }) {
  return (
    <group position={p} scale={s}>
      <mesh position={[0, 0.16, 0]} rotation={[Math.PI, 0, 0]} material={M.red} castShadow>
        <sphereGeometry args={[0.16, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
      </mesh>
      <Cyl p={[0, 0.15, 0]} a={[0.15, 0.15, 0.01, 14]} m={M.nectar} shadow={false} />
      <Sph p={[0.05, 0.16, 0.02]} rad={0.04} sc={[1, 0.4, 1]} m={M.white} seg={[6, 4]} shadow={false} />
      <Box p={[-0.05, 0.17, -0.04]} r={[0.5, 0.4, 0]} s={[0.07, 0.1, 0.01]} m={M.leafDark} shadow={false} />
      <Box p={[0.02, 0.2, 0]} r={[0, 0.3, 0]} s={[0.012, 0.012, 0.36]} m={M.wood} shadow={false} />
      <Box p={[0.05, 0.2, 0]} r={[0, 0.3, 0]} s={[0.012, 0.012, 0.36]} m={M.wood} shadow={false} />
    </group>
  );
}

function StockPot({ p, s = 1 }) {
  return (
    <group position={p} scale={s}>
      <Cyl p={[0, 0.3, 0]} a={[0.36, 0.33, 0.6, 14]} m={M.silver} />
      <Cyl p={[0, 0.6, 0]} a={[0.33, 0.33, 0.02, 14]} m={M.nectar} shadow={false} />
      {[-1, 1].map((sx) => (
        <Box key={sx} p={[sx * 0.38, 0.5, 0]} s={[0.1, 0.04, 0.08]} m={M.silver} />
      ))}
    </group>
  );
}

function Crate({ p, r = 0, m = M.wood }) {
  return (
    <group position={p} rotation={[0, r, 0]}>
      <Box p={[0, 0.22, 0]} s={[0.6, 0.44, 0.45]} m={m} />
      <Box p={[0, 0.22, 0.23]} s={[0.62, 0.06, 0.02]} m={M.honeyDark} shadow={false} />
      <Box p={[0, 0.36, 0.23]} s={[0.62, 0.06, 0.02]} m={M.honeyDark} shadow={false} />
    </group>
  );
}

function CentralKitchen() {
  // kompor panjang dengan dua panci kuah raksasa yang mengepul + rak mie
  return (
    <group>
      <Rug m={M.stone} rad={1.6} />
      <Box p={[0, 0.45, 0]} s={[2.6, 0.9, 0.9]} m={M.silver} />
      <Box p={[0, 0.92, 0]} s={[2.7, 0.05, 1.0]} m={M.graphite} />
      {[-0.8, 0.8].map((x) => (
        <group key={x}>
          <StockPot p={[x, 0.94, 0]} s={0.85} />
          <Steam p={[x, 1.55, 0]} />
        </group>
      ))}
      <Bowl p={[0, 0.94, 0.25]} s={1.2} />
      <group position={[1.9, 0, 1.0]}>
        <Box p={[0, 0.6, 0]} s={[0.7, 1.2, 0.4]} m={M.wood} />
        {[0.35, 0.7, 1.05].map((y) => (
          <Box key={y} p={[0, y, 0.15]} s={[0.55, 0.12, 0.2]} m={M.nectar} />
        ))}
      </group>
    </group>
  );
}

function Warehouse() {
  return (
    <group>
      <Rug m={M.stone} />
      <Crate p={[-0.5, 0, 0]} />
      <Crate p={[0.2, 0, 0.1]} r={0.2} m={M.nectar} />
      <Crate p={[-0.2, 0.44, 0.05]} r={-0.1} />
      {[0, 1].map((i) => (
        <Sph key={i} p={[0.95, 0.22, -0.3 + i * 0.55]} rad={0.28} sc={[1, 0.8, 0.8]} m={M.creamDark} />
      ))}
      {/* palet + forklift tangan */}
      <group position={[-1.1, 0, 0.9]}>
        <Box p={[0, 0.05, 0]} s={[0.8, 0.1, 1.0]} m={M.amber} />
        <Box p={[0, 0.6, -0.48]} s={[0.06, 1.1, 0.06]} m={M.silver} />
      </group>
    </group>
  );
}

export function DeptProp({ dept, roomId }) {
  if (roomId === 'ck') return <CentralKitchen />;
  if (roomId === 'wh') return <Warehouse />;
  switch (dept) {
    case 'store':
      return (
        <group>
          <Rug />
          {/* meja contoh menu dengan mangkuk */}
          <Box p={[0, 0.35, 0]} s={[1.2, 0.7, 0.7]} m={M.wood} />
          <Box p={[0, 0.72, 0]} s={[1.3, 0.05, 0.8]} m={M.gold} />
          <Bowl p={[-0.3, 0.74, 0]} />
          <Bowl p={[0.3, 0.74, 0.1]} />
          <Steam p={[0, 1.05, 0]} s={0.6} />
          {/* papan menu berdiri */}
          <group position={[0.95, 0, 0.7]} rotation={[0, -0.5, 0]}>
            <Box p={[0, 0.6, 0]} s={[0.06, 1.2, 0.06]} m={M.gold} />
            <Box p={[0, 1.15, 0]} s={[0.6, 0.8, 0.04]} m={M.royal} />
            {[1.35, 1.2, 1.05, 0.9].map((y) => (
              <Box key={y} p={[0, y, 0.025]} s={[0.42, 0.04, 0.01]} m={M.cream} shadow={false} />
            ))}
          </group>
        </group>
      );
    case 'mkt':
      return (
        <group>
          <Rug m={M.rugInner} />
          <Box p={[-0.25, 0.7, 0]} r={[0, 0, 0.12]} s={[0.05, 1.4, 0.05]} m={M.wood} />
          <Box p={[0.25, 0.7, 0]} r={[0, 0, -0.12]} s={[0.05, 1.4, 0.05]} m={M.wood} />
          <Box p={[0, 0.65, -0.18]} r={[-0.25, 0, 0]} s={[0.05, 1.3, 0.05]} m={M.wood} />
          <Box p={[0, 1.0, 0.04]} s={[0.8, 0.6, 0.04]} m={M.cream} />
          <Sph p={[0, 1.02, 0.07]} rad={0.17} sc={[1, 1, 0.1]} m={M.amber} shadow={false} />
          <group position={[0.95, 0, 0.6]}>
            <Cyl p={[0, 0.5, 0]} a={[0.025, 0.025, 1, 4]} m={M.graphite} />
            <Box p={[0, 1.05, 0]} s={[0.3, 0.2, 0.2]} m={M.graphite} />
            <Cyl p={[0, 1.05, 0.14]} a={[0.07, 0.07, 0.1, 8]} r={[HALF, 0, 0]} m={M.silver} />
          </group>
          <Bowl p={[-0.8, 0, 0.6]} s={1.4} />
        </group>
      );
    case 'fin':
      return (
        <group>
          <Rug />
          {/* sempoa (soroban) raksasa */}
          <group position={[0, 0, -0.1]}>
            <Box p={[0, 0.75, 0]} s={[1.3, 0.08, 0.12]} m={M.gold} />
            <Box p={[0, 0.15, 0]} s={[1.3, 0.08, 0.12]} m={M.gold} />
            {[-0.6, 0.6].map((x) => (
              <Box key={x} p={[x, 0.45, 0]} s={[0.08, 0.68, 0.12]} m={M.gold} />
            ))}
            {[0.3, 0.45, 0.6].map((y, j) => (
              <group key={y}>
                <Box p={[0, y, 0]} s={[1.15, 0.015, 0.015]} m={M.silver} shadow={false} />
                {[-0.4, -0.25, 0.1, 0.35].map((x, i) => (
                  <Sph key={x} p={[x + j * 0.05, y, 0]} rad={0.05} sc={[1, 0.7, 1]} m={(i + j) % 2 ? M.amber : M.royal} seg={[8, 6]} />
                ))}
              </group>
            ))}
          </group>
          {[0, 1, 2, 3, 4].map((i) => (
            <Cyl key={i} p={[0.75, 0.04 + i * 0.07, 0.55]} a={[0.15, 0.15, 0.06, 10]} m={M.nectar} />
          ))}
        </group>
      );
    case 'hr':
      return (
        <group>
          <Rug />
          {/* bonsai */}
          <group scale={1.2}>
            <Box p={[0, 0.12, 0]} s={[0.6, 0.22, 0.4]} m={M.pot} />
            <Cyl p={[0.05, 0.4, 0]} r={[0, 0, 0.3]} a={[0.05, 0.08, 0.5, 6]} m={M.brown} />
            <Sph p={[-0.1, 0.68, 0]} rad={0.28} sc={[1.3, 0.6, 1]} m={M.pine} />
            <Sph p={[0.22, 0.55, 0.05]} rad={0.18} sc={[1.3, 0.6, 1]} m={M.pineLight} />
          </group>
          <group position={[0.9, 0, 0.5]}>
            <Box p={[0, 0.5, 0]} s={[0.5, 1, 0.5]} m={M.wood} />
            {[0.25, 0.55, 0.85].map((y) => (
              <Box key={y} p={[0, y, 0.26]} s={[0.3, 0.04, 0.02]} m={M.gold} shadow={false} />
            ))}
          </group>
        </group>
      );
    default:
      return null;
  }
}

/* ---------- ruang bersama ---------- */

function atSpots(roomId, r, render) {
  return roomSpots(roomId).map((s, i) => {
    const c = Math.cos(s.angle);
    const sn = Math.sin(s.angle);
    return (
      <group key={i} position={[r * c, 0, r * sn]} rotation={[0, Math.atan2(-c, -sn), 0]}>
        {render(i)}
      </group>
    );
  });
}

// noren: tirai kain di pintu kedai
export function Noren({ p, w = 1.8, r = 0 }) {
  return (
    <group position={p} rotation={[0, r, 0]}>
      <Cyl p={[0, 0, 0]} r={[0, 0, HALF]} a={[0.03, 0.03, w + 0.2, 6]} m={M.gold} />
      {[0, 1, 2].map((i) => (
        <Box key={i} p={[(i - 1) * (w / 3), -0.35, 0]} s={[w / 3 - 0.04, 0.68, 0.02]} m={M.noren} />
      ))}
      <Sph p={[0, -0.32, 0.02]} rad={0.13} sc={[1, 1, 0.1]} m={M.white} shadow={false} />
    </group>
  );
}

export function LobbySet() {
  return (
    <group>
      <Rug m={M.tatami} rad={1.6} />
      {/* papan lambang Kyuka: mangkuk ramen besar */}
      <group position={[0, 0, -0.2]}>
        <Cyl p={[0, 0.45, 0]} a={[0.1, 0.16, 0.9, 8]} m={M.gold} />
        <Bowl p={[0, 0.85, 0]} s={3} />
        <Steam p={[0, 1.6, 0]} />
      </group>
      {/* meja resepsionis */}
      <group position={[0, 0, -3.1]}>
        <Box p={[0, 0.45, 0]} s={[2.4, 0.9, 0.6]} m={M.wood} />
        <Box p={[0, 0.93, 0]} s={[2.5, 0.07, 0.7]} m={M.royal} />
        <Monitor p={[0.6, 1.2, -0.05]} w={0.5} h={0.32} />
        <Sph p={[-0.7, 1.05, 0]} rad={0.1} m={M.amber} />
      </group>
      <Bamboo p={[-3.2, 0, 0]} s={1.1} />
      <Bamboo p={[3.2, 0, 0]} s={1.1} />
      <Noren p={[0, 1.75, 3.9]} />
      <Box p={[-2.2, 0.25, 2.2]} r={[0, -0.5, 0]} s={[1.4, 0.18, 0.5]} m={M.wood} />
    </group>
  );
}

// Kedai Kyuka: meja bar ramen di tengah dengan panci mengepul, bangku di sekeliling
export function LoungeSet() {
  return (
    <group>
      <Box p={[0, 0.45, 0]} s={[1.7, 0.9, 1.7]} m={M.wood} />
      <Box p={[0, 0.93, 0]} s={[1.9, 0.07, 1.9]} m={M.gold} />
      <StockPot p={[0, 0.96, 0]} s={0.75} />
      <Steam p={[0, 1.5, 0]} />
      {[0, 1, 2, 3].map((i) => {
        const a = (i * Math.PI) / 2 + Math.PI / 4;
        return <Bowl key={i} p={[0.62 * Math.cos(a), 0.96, 0.62 * Math.sin(a)]} />;
      })}
      {atSpots('lounge', 3.35, (i) =>
        i % 2 === 0 ? (
          <group>
            <Cyl p={[0, 0.3, 0]} a={[0.22, 0.2, 0.06, 10]} m={M.red} />
            <Cyl p={[0, 0.15, 0]} a={[0.05, 0.05, 0.3, 6]} m={M.gold} />
            <PaperLantern p={[0, 2.1, 0.2]} />
          </group>
        ) : (
          <Bamboo p={[0, 0, 0.2]} s={0.8} />
        ),
      )}
    </group>
  );
}

// Dojo Latihan: lantai tatami, papan latihan potong & wajan
export function GymSet() {
  return (
    <group>
      <Box p={[0, 0.012, 0]} s={[6.4, 0.02, 6.4]} m={M.tatami} shadow={false} />
      {[-1.6, 0, 1.6].map((x) => (
        <Box key={x} p={[x, 0.024, 0]} s={[0.03, 0.01, 6.4]} m={M.tileEdge} shadow={false} />
      ))}
      {/* stasiun latihan tengah: talenan + pisau + wajan */}
      <Box p={[0, 0.4, 0]} s={[1.3, 0.8, 0.8]} m={M.wood} />
      <Box p={[0, 0.82, 0]} s={[1.0, 0.05, 0.6]} m={M.creamDark} />
      <Box p={[0.25, 0.86, 0]} r={[0, 0.4, 0]} s={[0.5, 0.01, 0.08]} m={M.silver} />
      <mesh position={[-0.3, 0.9, 0]} rotation={[Math.PI, 0, 0]} material={M.graphite}>
        <sphereGeometry args={[0.22, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2.5]} />
      </mesh>
      {/* kakemono (gulungan kaligrafi) */}
      <group position={[0, 0, -3.9]}>
        <Box p={[0, 1.4, 0]} s={[0.8, 1.6, 0.03]} m={M.cream} />
        <Box p={[0, 2.22, 0]} s={[0.9, 0.06, 0.06]} m={M.gold} />
        {[1.8, 1.5, 1.2, 0.9].map((y) => (
          <Box key={y} p={[0, y, 0.02]} s={[0.18, 0.18, 0.01]} m={M.graphite} shadow={false} />
        ))}
      </group>
      {atSpots('gym', 3.35, (i) =>
        i % 2 === 0 ? (
          <group>
            <Box p={[0, 0.2, 0]} s={[0.7, 0.4, 0.5]} m={M.wood} />
            <Bowl p={[0, 0.4, 0]} />
          </group>
        ) : (
          <Sph p={[0, 0.12, 0]} rad={0.32} sc={[1, 0.35, 1]} m={M.royal} />
        ),
      )}
    </group>
  );
}

// Ruang Rapat Tatami: chabudai (meja rendah) dan zabuton (bantal duduk)
export function HallSet() {
  return (
    <group>
      <Box p={[0, 0.012, 0]} s={[5.2, 0.02, 5.2]} m={M.tatami} shadow={false} />
      <Box p={[0, 0.38, 0]} s={[2.0, 0.08, 1.4]} m={M.royal} />
      {[
        [-0.85, -0.55],
        [0.85, -0.55],
        [-0.85, 0.55],
        [0.85, 0.55],
      ].map(([x, z]) => (
        <Box key={`${x}${z}`} p={[x, 0.17, z]} s={[0.1, 0.34, 0.1]} m={M.gold} />
      ))}
      <Bowl p={[-0.3, 0.42, 0]} />
      <Bowl p={[0.3, 0.42, 0.1]} />
      <Cyl p={[0, 0.5, -0.3]} a={[0.08, 0.08, 0.16, 10]} m={M.cream} />
      {atSpots('hall', 2.6, () => (
        <Box p={[0, 0.06, -0.15]} s={[0.6, 0.1, 0.6]} m={M.red} />
      ))}
      <Box p={[0, 1.4, -3.6]} s={[2.2, 1.2, 0.08]} m={M.graphite} />
      <Box p={[0, 1.4, -3.55]} s={[2.0, 1.0, 0.02]} m={M.screen} shadow={false} />
      <PaperLantern p={[-2.6, 2.3, -2.6]} />
      <PaperLantern p={[2.6, 2.3, -2.6]} />
    </group>
  );
}

// Ruang Istirahat: kapsul tidur kayu ala capsule hotel
export function PodsSet() {
  return (
    <group>
      {atSpots('pods', 2.7, (i) => (
        <group>
          <Box p={[0, 0.06, 0]} s={[1.0, 0.12, 1.0]} m={M.wood} />
          <Box p={[0, 0.13, 0]} s={[0.8, 0.02, 0.8]} m={i % 2 ? M.tatami : M.rugInner} shadow={false} />
          <mesh position={[0, 1.0, 0]} material={M.glass}>
            <capsuleGeometry args={[0.55, 0.8, 4, 12]} />
          </mesh>
          <Box p={[0, 1.95, 0]} s={[0.8, 0.1, 0.8]} m={M.gold} />
        </group>
      ))}
      <Box p={[0, 0.3, 0]} s={[1.2, 0.6, 1.2]} m={M.wood} />
      <StoneLantern p={[0, 0.6, 0]} s={0.6} />
    </group>
  );
}

export function ServerSet() {
  const leds = useRef([]);
  useFrame((st) => {
    const t = st.clock.elapsedTime;
    leds.current.forEach((m, i) => {
      if (m) m.visible = Math.sin(t * 3 + i * 1.7) > -0.2;
    });
  });
  let k = 0;
  return (
    <group>
      <Box p={[0, 0.6, 0]} s={[1.0, 1.2, 1.0]} m={M.silver} />
      <Box p={[0, 0.9, 0]} s={[1.04, 0.1, 1.04]} m={M.amber} />
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const a = ((90 + 60 * i) * Math.PI) / 180;
        const c = Math.cos(a);
        const s = Math.sin(a);
        return (
          <group key={i} position={[3.25 * c, 0, 3.25 * s]} rotation={[0, Math.atan2(-c, -s), 0]}>
            <Box p={[0, 0.85, 0]} s={[0.9, 1.7, 0.6]} m={M.graphite} />
            {[0.35, 0.65, 0.95, 1.25, 1.55].map((y) => (
              <mesh
                key={y}
                ref={(el) => (leds.current[k++] = el)}
                userData={{ dynamic: true }}
                position={[-0.2 + ((y * 10) % 3) * 0.15, y, 0.31]}
                material={(y * 10) % 2 > 1 ? M.ledGreen : M.screen}
              >
                <boxGeometry args={[0.08, 0.05, 0.01]} />
              </mesh>
            ))}
          </group>
        );
      })}
    </group>
  );
}

// Taman Zen: pasir bergaris, batu, bonsai pinus, lentera batu, dan bangku kayu
export function GardenSet() {
  return (
    <group>
      <Box p={[0, 0.02, 0]} s={[6.6, 0.04, 6.6]} m={M.sand} shadow={false} />
      {[-2.4, -1.6, -0.8, 0.8, 1.6, 2.4].map((z) => (
        <Box key={z} p={[0, 0.045, z]} s={[6.4, 0.012, 0.05]} m={M.creamDark} shadow={false} />
      ))}
      {[
        [0.2, 0.1, 0.7],
        [-0.6, 0.3, 0.45],
        [0.9, -0.5, 0.35],
      ].map(([x, z, r]) => (
        <group key={x}>
          <mesh position={[x, 0.04, z]} rotation={[Math.PI / 2, 0, 0]} material={M.creamDark}>
            <torusGeometry args={[r + 0.25, 0.025, 4, 24]} />
          </mesh>
          <Sph p={[x, r * 0.35, z]} rad={r} sc={[1.1, 0.7, 0.9]} m={M.earthDark} seg={[8, 6]} />
          <Sph p={[x + r * 0.2, r * 0.75, z]} rad={r * 0.35} sc={[1, 0.6, 1]} m={M.leaf} seg={[6, 4]} />
        </group>
      ))}
      <StoneLantern p={[2.6, 0, -2.4]} />
      <group position={[-2.6, 0, -2.2]}>
        <Cyl p={[0, 0.6, 0]} r={[0, 0, 0.25]} a={[0.1, 0.16, 1.2, 6]} m={M.brown} />
        <Sph p={[-0.35, 1.25, 0]} rad={0.5} sc={[1.5, 0.45, 1.1]} m={M.pine} />
        <Sph p={[0.35, 1.55, 0.1]} rad={0.4} sc={[1.5, 0.45, 1.1]} m={M.pineLight} />
        <Sph p={[0, 1.85, -0.1]} rad={0.3} sc={[1.5, 0.45, 1.1]} m={M.pine} />
      </group>
      <Box p={[2.3, 0.25, 2.4]} r={[0, 0.6, 0]} s={[1.3, 0.12, 0.45]} m={M.wood} />
    </group>
  );
}

export function MissionSet() {
  const ref = useRef();
  useFrame((st) => {
    if (ref.current) ref.current.rotation.y = st.clock.elapsedTime * 0.3;
  });
  return (
    <group>
      <Box p={[0, 0.45, 0]} s={[1.8, 0.9, 1.8]} m={M.royal} />
      <Box p={[0, 0.92, 0]} s={[1.95, 0.06, 1.95]} m={M.gold} />
      <group ref={ref} position={[0, 1.1, 0]} userData={{ dynamic: true }}>
        {[
          [0, 0, 0.3],
          [0.45, 0.26, 0.15],
          [-0.45, 0.26, 0.2],
          [0, 0.52, 0.1],
          [0.45, -0.26, 0.25],
          [-0.45, -0.26, 0.12],
          [0, -0.52, 0.18],
        ].map(([x, z, h], i) => (
          <mesh key={i} position={[x, h / 2, z]} material={i === 0 ? M.lantern : M.holo}>
            <boxGeometry args={[0.36, h, 0.36]} />
          </mesh>
        ))}
      </group>
      {[-1, 0, 1].map((i) => {
        const a = -HALF + i * 0.55;
        return (
          <group key={i} position={[3.4 * Math.cos(a), 0, 3.4 * Math.sin(a)]} rotation={[0, Math.atan2(-Math.cos(a), -Math.sin(a)), 0]}>
            <Box p={[0, 1.5, 0]} s={[1.5, 0.9, 0.08]} m={M.graphite} />
            <Box p={[0, 1.5, 0.05]} s={[1.35, 0.75, 0.01]} m={M.screen} shadow={false} />
            <Box p={[0, 0.5, 0]} s={[0.1, 1.1, 0.1]} m={M.gold} />
          </group>
        );
      })}
    </group>
  );
}

export function RoyalDecor() {
  return (
    <group>
      <Box p={[0, 0.012, 0.3]} s={[3.6, 0.02, 2.8]} m={M.red} shadow={false} />
      {[-1, 1].map((sx) => (
        <StoneLantern key={sx} p={[sx * 2.9, 0, 1.4]} s={1.15} />
      ))}
      <Bamboo p={[0, 0, 2.8]} s={0.9} />
      {/* kakemono naga di dinding belakang */}
      <group position={[2.2, 0, -3.9]}>
        <Box p={[0, 1.4, 0]} s={[0.8, 1.6, 0.03]} m={M.cream} />
        <Box p={[0, 2.22, 0]} s={[0.9, 0.06, 0.06]} m={M.gold} />
        <Sph p={[0, 1.45, 0.02]} rad={0.28} sc={[1, 1, 0.1]} m={M.dragon} shadow={false} />
      </group>
    </group>
  );
}
