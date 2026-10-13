// Naga statis untuk Ruang Tatami: duduk di meja rapat, bergerak dan menyala saat bicara.
import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Billboard } from '@react-three/drei';
import { RyuModel } from './QueenBea';
import { DragonBody } from './Dragon';
import { M, std, Box, Cyl, Sph, Cone } from './materials';

export function SpeakRing({ active, color = '#E5483B' }) {
  const ring = useRef();
  const mat = useMemo(() => std(color, { emissive: color, emissiveIntensity: 1.2 }), [color]);
  useFrame((st) => {
    if (!ring.current) return;
    ring.current.visible = active;
    if (active) ring.current.scale.setScalar(1 + Math.sin(st.clock.elapsedTime * 7) * 0.08);
  });
  return (
    <mesh ref={ring} position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]} material={mat} visible={false}>
      <torusGeometry args={[0.62, 0.05, 8, 32]} />
    </mesh>
  );
}

export function SoundBars({ active, position = [0.62, 1.45, 0] }) {
  const g = useRef();
  useFrame((st) => {
    if (!g.current) return;
    g.current.visible = active;
    if (!active) return;
    g.current.children.forEach((c, i) => {
      c.scale.y = 0.4 + Math.abs(Math.sin(st.clock.elapsedTime * 9 + i * 1.3));
    });
  });
  return (
    <Billboard position={position}>
      <group ref={g} visible={false}>
        {[-0.09, 0, 0.09].map((x) => (
          <mesh key={x} position={[x, 0, 0]} material={M.led}>
            <boxGeometry args={[0.05, 0.22, 0.02]} />
          </mesh>
        ))}
      </group>
    </Billboard>
  );
}

function ThinkDots({ active }) {
  const g = useRef();
  useFrame((st) => {
    if (!g.current) return;
    g.current.visible = active;
    if (!active) return;
    g.current.children.forEach((c, i) => {
      c.scale.setScalar(0.6 + 0.5 * Math.abs(Math.sin(st.clock.elapsedTime * 4 - i * 0.6)));
    });
  });
  return (
    <Billboard position={[0, 2.2, 0]}>
      <group ref={g} visible={false}>
        {[-0.16, 0, 0.16].map((x) => (
          <mesh key={x} position={[x, 0, 0]} material={M.led}>
            <sphereGeometry args={[0.06, 8, 6]} />
          </mesh>
        ))}
      </group>
    </Billboard>
  );
}

export function BeeFigure({ position, facing = 0, crown = false, muted = false, speaking = false, thinking = false, vest = null }) {
  const inner = useRef();
  const head = useRef();
  const wl = useRef();
  const wr = useRef();
  const al = useRef();
  const ar = useRef();
  const off = useMemo(() => Math.random() * 10, []);
  useFrame((st) => {
    const t = st.clock.elapsedTime + off;
    if (!inner.current) return;
    inner.current.position.y = speaking ? Math.abs(Math.sin(t * 8)) * 0.06 : Math.sin(t * 1.6) * 0.02;
    head.current.rotation.y = speaking ? Math.sin(t * 2.2) * 0.25 : Math.sin(t * 0.5) * 0.12;
    head.current.rotation.z = thinking ? 0.18 : 0;
    const flap = speaking ? Math.sin(t * 30) * 0.5 : Math.sin(t * 4) * 0.12;
    wl.current.rotation.z = -(0.45 + flap);
    wr.current.rotation.z = 0.45 + flap;
    al.current.rotation.x = speaking ? Math.sin(t * 4) * 0.5 - 0.6 : thinking ? -1.9 : -0.25;
    ar.current.rotation.x = speaking ? Math.sin(t * 4 + 1.5) * 0.3 - 0.3 : -0.25;
  });
  return (
    <group position={position} rotation={[0, facing, 0]}>
      <SpeakRing active={speaking} />
      <group ref={inner}>
        {crown ? (
          <RyuModel refs={{ head, wl, wr, al, ar }} thinking={thinking} />
        ) : (
          <DragonBody refs={{ head, wl, wr, al, ar }} thinking={thinking} vest={vest} />
        )}
      </group>
      {muted && (
        <Billboard position={[0.45, 1.75, 0]}>
          <mesh material={M.mute}>
            <circleGeometry args={[0.13, 20]} />
          </mesh>
          <Box p={[0, 0, 0.01]} r={[0, 0, Math.PI / 4]} s={[0.2, 0.035, 0.01]} m={M.white} shadow={false} />
        </Billboard>
      )}
      <group position={[0, crown ? 0.45 : 0, 0]}>
        <ThinkDots active={thinking} />
        <SoundBars active={speaking} />
      </group>
    </group>
  );
}
