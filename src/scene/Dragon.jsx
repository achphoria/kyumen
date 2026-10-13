// Naga biru chibi: maskot Kyuka Ramen. Dipakai semua agent (KyuWorker), di Ruang Tatami (BeeFigure),
// dan sebagai dasar Ryu (QueenBea.jsx). Ref animasi (kepala, sayap, lengan, mata) dipegang komponen induk.
import { useMemo } from 'react';
import * as THREE from 'three';
import { M, std, Box, Cyl, Sph, Cone } from './materials';

// rompi happi berwarna divisi, terbuka di depan supaya perut krem kelihatan
function Happi({ color }) {
  const mat = useMemo(() => std(color, { roughness: 0.8, side: THREE.DoubleSide }), [color]);
  return (
    <group>
      <mesh position={[0, 0.56, 0]} material={mat} castShadow>
        <cylinderGeometry args={[0.325, 0.345, 0.42, 16, 1, true, 0.55, Math.PI * 2 - 1.1]} />
      </mesh>
      {/* kerah putih */}
      {[-1, 1].map((sx) => (
        <Box key={sx} p={[sx * 0.15, 0.6, 0.27]} r={[0, sx * 0.5, sx * 0.25]} s={[0.05, 0.4, 0.03]} m={M.white} shadow={false} />
      ))}
      {/* sabuk obi */}
      <mesh position={[0, 0.4, 0]} material={M.royal}>
        <cylinderGeometry args={[0.34, 0.34, 0.06, 16, 1, true, 0.55, Math.PI * 2 - 1.1]} />
      </mesh>
    </group>
  );
}

// refs: { head, wl, wr, al, ar, eyes }; body: material sisik; vest: warna happi (null = tanpa rompi)
export function DragonBody({ refs, body = M.dragon, vest = null, thinking = false, headExtra = null, bodyExtra = null }) {
  const eyeScale = thinking ? [1, 0.3, 1] : [1, 1, 1];
  return (
    <group>
      {/* kaki gempal + cakar */}
      {[-0.13, 0.13].map((x) => (
        <group key={x}>
          <Cyl p={[x, 0.12, 0]} a={[0.085, 0.095, 0.24, 8]} m={body} />
          <Sph p={[x, 0.05, 0.06]} rad={0.1} sc={[1, 0.55, 1.3]} m={body} seg={[8, 6]} />
          {[-0.04, 0, 0.04].map((cx) => (
            <Sph key={cx} p={[x + cx, 0.035, 0.18]} rad={0.022} m={M.horn} seg={[5, 4]} shadow={false} />
          ))}
        </group>
      ))}
      {/* badan bulat + perut krem bergaris */}
      <mesh position={[0, 0.55, 0]} material={body} castShadow>
        <capsuleGeometry args={[0.3, 0.32, 4, 14]} />
      </mesh>
      <Sph p={[0, 0.52, 0.16]} rad={1} sc={[0.22, 0.32, 0.16]} m={M.belly} seg={[14, 10]} />
      {[0.4, 0.52, 0.64].map((y) => (
        <Box key={y} p={[0, y, 0.315]} s={[0.22 - Math.abs(y - 0.52) * 0.5, 0.012, 0.012]} m={M.creamDark} shadow={false} />
      ))}
      {vest && <Happi color={vest} />}
      {bodyExtra}
      {/* ekor melengkung dengan duri */}
      <group position={[0, 0.3, -0.26]}>
        <Sph p={[0, 0, -0.04]} rad={0.17} m={body} seg={[10, 8]} />
        <Sph p={[0.03, -0.08, -0.22]} rad={0.13} m={body} seg={[10, 8]} />
        <Sph p={[0.1, -0.12, -0.37]} rad={0.095} m={body} seg={[8, 6]} />
        <Sph p={[0.2, -0.1, -0.47]} rad={0.07} m={body} seg={[8, 6]} />
        <Cone p={[0.28, -0.04, -0.52]} r={[0.6, 0, -0.9]} a={[0.07, 0.16, 4]} m={M.horn} />
      </group>
      {/* duri punggung */}
      {[
        [0.86, -0.27],
        [0.68, -0.32],
        [0.5, -0.33],
      ].map(([y, z]) => (
        <Cone key={y} p={[0, y, z]} r={[-0.5, 0, 0]} a={[0.055, 0.14, 4]} m={M.horn} />
      ))}
      {/* tangan */}
      <group ref={refs.al} position={[-0.33, 0.72, 0]}>
        <mesh position={[0, -0.16, 0]} material={body} castShadow>
          <capsuleGeometry args={[0.08, 0.18, 3, 8]} />
        </mesh>
        <Sph p={[0, -0.33, 0]} rad={0.085} m={M.belly} seg={[8, 6]} />
      </group>
      <group ref={refs.ar} position={[0.33, 0.72, 0]}>
        <mesh position={[0, -0.16, 0]} material={body} castShadow>
          <capsuleGeometry args={[0.08, 0.18, 3, 8]} />
        </mesh>
        <Sph p={[0, -0.33, 0]} rad={0.085} m={M.belly} seg={[8, 6]} />
      </group>
      {/* sayap kecil berselaput */}
      <group ref={refs.wl} position={[-0.15, 0.84, -0.26]} rotation={[0, 0.35, 0]}>
        <Cyl p={[-0.26, 0.12, 0]} r={[0, 0, 1.1]} a={[0.025, 0.02, 0.52, 5]} m={M.dragonDark} />
        <mesh position={[-0.28, 0.04, 0]} scale={[0.3, 0.05, 0.2]} material={M.wing}>
          <sphereGeometry args={[1, 12, 8]} />
        </mesh>
      </group>
      <group ref={refs.wr} position={[0.15, 0.84, -0.26]} rotation={[0, -0.35, 0]}>
        <Cyl p={[0.26, 0.12, 0]} r={[0, 0, -1.1]} a={[0.025, 0.02, 0.52, 5]} m={M.dragonDark} />
        <mesh position={[0.28, 0.04, 0]} scale={[0.3, 0.05, 0.2]} material={M.wing}>
          <sphereGeometry args={[1, 12, 8]} />
        </mesh>
      </group>
      {/* kepala besar ala chibi */}
      <group ref={refs.head} position={[0, 1.1, 0]}>
        <Sph rad={0.44} m={body} seg={[18, 14]} />
        {/* moncong */}
        <Sph p={[0, -0.14, 0.32]} rad={0.19} sc={[1.2, 0.72, 0.9]} m={M.belly} seg={[14, 10]} />
        {[-0.06, 0.06].map((x) => (
          <Sph key={x} p={[x, -0.1, 0.49]} rad={0.018} m={M.brown} seg={[6, 4]} shadow={false} />
        ))}
        <mesh position={[0, -0.2, 0.47]} rotation={[0.35, 0, Math.PI]} material={M.brown}>
          <torusGeometry args={[0.04, 0.01, 6, 12, Math.PI]} />
        </mesh>
        {/* mata besar berkilau */}
        <group ref={refs.eyes} position={[0, 0.06, 0]} scale={eyeScale}>
          {[-0.17, 0.17].map((x) => (
            <group key={x}>
              <Sph p={[x, 0, 0.37]} rad={0.075} sc={[1, 1.15, 0.7]} m={M.graphite} seg={[10, 8]} shadow={false} />
              <Sph p={[x + 0.025, 0.035, 0.42]} rad={0.024} m={M.white} seg={[6, 4]} shadow={false} />
            </group>
          ))}
        </group>
        {[-0.27, 0.27].map((x) => (
          <Sph key={x} p={[x, -0.1, 0.3]} rad={0.055} sc={[1, 0.6, 0.5]} m={M.pink} seg={[8, 6]} shadow={false} />
        ))}
        {/* tanduk & sirip telinga */}
        {[-1, 1].map((sx) => (
          <group key={sx}>
            <Cone p={[sx * 0.17, 0.44, -0.06]} r={[-0.35, 0, -sx * 0.35]} a={[0.06, 0.24, 6]} m={M.horn} />
            <Cone p={[sx * 0.41, 0.1, -0.06]} r={[0, 0, -sx * 1.25]} a={[0.09, 0.2, 4]} m={M.dragonDark} />
          </group>
        ))}
        {/* jambul kecil */}
        <Sph p={[0, 0.38, -0.2]} rad={0.08} m={M.belly} seg={[8, 6]} />
        <Sph p={[0, 0.3, -0.33]} rad={0.07} m={M.belly} seg={[8, 6]} />
        {headExtra}
      </group>
    </group>
  );
}
