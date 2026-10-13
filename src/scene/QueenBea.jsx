// Ryu: Chief Kyuka Ramen. Naga biru yang lebih besar dari kru biasa, dengan mahkota emas bermutiara,
// haori navy berlambang mangkuk ramen, kumis naga panjang, dan surai krem.
// Dipakai di gedung kedai (KyuWorker) dan di Ruang Tatami (BeeFigure).
// Ref animasi (kepala, sayap, lengan, mata) dipegang komponen induk.
import * as THREE from 'three';
import { M, std, Box, Cyl, Sph, Cone } from './materials';
import { DragonBody } from './Dragon';

const Q = {
  gold: std('#F2B630', { metalness: 0.6, roughness: 0.3 }),
  goldDeep: std('#C98A00', { metalness: 0.6, roughness: 0.32 }),
  scale: std('#2F6FC0', { roughness: 0.42 }),
  haori: std('#22324F', { roughness: 0.85, side: THREE.DoubleSide }),
  haoriIn: std('#C8352A', { roughness: 0.9, side: THREE.DoubleSide }),
  pearl: std('#FFFFFF', { metalness: 0.2, roughness: 0.15, emissive: '#DDEBFF', emissiveIntensity: 0.3 }),
  gem: std('#7CC0FF', { emissive: '#3B82D6', emissiveIntensity: 0.9, roughness: 0.15, metalness: 0.2 }),
  ruby: std('#E5483B', { emissive: '#C2302F', emissiveIntensity: 0.5, roughness: 0.2 }),
  mane: std('#F4EBDD', { roughness: 0.9 }),
};

function Crown() {
  const points = 5;
  return (
    <group position={[0, 0.47, -0.02]} rotation={[-0.12, 0, 0]} scale={0.8}>
      <mesh material={Q.gold} castShadow>
        <cylinderGeometry args={[0.2, 0.23, 0.12, 20, 1, true]} />
      </mesh>
      {Array.from({ length: points }, (_, i) => {
        const a = (i / points) * Math.PI * 2 + Math.PI / 2;
        return (
          <group key={i} position={[0.21 * Math.cos(a), 0.12, 0.21 * Math.sin(a)]}>
            <Cone a={[0.05, 0.16, 4]} m={Q.gold} />
            <Sph p={[0, 0.1, 0]} rad={0.03} m={Q.pearl} seg={[8, 6]} />
          </group>
        );
      })}
      <Sph p={[0, 0.01, 0.23]} rad={0.045} m={Q.gem} seg={[8, 6]} />
      {[1, 2].map((k) => {
        const a = Math.PI / 2 + (k === 1 ? 1 : -1) * 1.1;
        return <Sph key={k} p={[0.225 * Math.cos(a), 0, 0.225 * Math.sin(a)]} rad={0.028} m={Q.ruby} seg={[6, 5]} shadow={false} />;
      })}
    </group>
  );
}

// kumis naga panjang yang menjuntai dari moncong
function Whiskers() {
  return [-1, 1].map((sx) => (
    <group key={sx} position={[sx * 0.16, -0.12, 0.42]} rotation={[0, sx * -0.5, -sx * 0.45]}>
      <Cyl p={[sx * 0.14, 0, 0]} r={[0, 0, Math.PI / 2]} a={[0.012, 0.006, 0.3, 5]} m={Q.gold} shadow={false} />
      <Sph p={[sx * 0.29, 0, 0]} rad={0.018} m={Q.gold} seg={[6, 4]} shadow={false} />
    </group>
  ));
}

// surai krem di belakang kepala
function Mane() {
  return [
    [0, 0.3, -0.32, 0.12],
    [-0.18, 0.16, -0.34, 0.1],
    [0.18, 0.16, -0.34, 0.1],
    [0, 0.05, -0.4, 0.11],
  ].map(([x, y, z, r]) => <Sph key={`${x}${y}`} p={[x, y, z]} rad={r} m={Q.mane} seg={[8, 6]} />);
}

// haori (jaket luar) navy dengan lapisan merah dan lambang mangkuk di punggung
function Haori() {
  return (
    <group>
      <mesh position={[0, 0.55, 0]} material={Q.haoriIn}>
        <cylinderGeometry args={[0.335, 0.4, 0.62, 18, 1, true, 0.5, Math.PI * 2 - 1.0]} />
      </mesh>
      <mesh position={[0, 0.55, 0]} material={Q.haori} castShadow>
        <cylinderGeometry args={[0.345, 0.41, 0.62, 18, 1, true, 0.5, Math.PI * 2 - 1.0]} />
      </mesh>
      {/* lambang mangkuk */}
      <group position={[0, 0.66, -0.37]} rotation={[0, Math.PI, 0]}>
        <mesh rotation={[Math.PI / 2, 0, 0]} material={M.white}>
          <circleGeometry args={[0.09, 20]} />
        </mesh>
        <mesh position={[0, -0.01, 0.005]} material={Q.ruby}>
          <circleGeometry args={[0.06, 16, Math.PI, Math.PI]} />
        </mesh>
      </group>
      {/* tali haori */}
      <Sph p={[0, 0.72, 0.33]} rad={0.035} m={Q.gold} seg={[8, 6]} />
      <Box p={[0, 0.72, 0.32]} s={[0.18, 0.02, 0.02]} m={Q.gold} shadow={false} />
    </group>
  );
}

// Tubuh lengkap Ryu. refs: { head, wl, wr, al, ar, eyes }
export function RyuModel({ refs, thinking = false }) {
  return (
    <group scale={1.25}>
      <DragonBody
        refs={refs}
        body={Q.scale}
        thinking={thinking}
        bodyExtra={<Haori />}
        headExtra={
          <>
            <Crown />
            <Whiskers />
            <Mane />
          </>
        }
      />
    </group>
  );
}
