// Pratinjau Ryu & naga kru dari dekat (hanya mode pengembangan: #/queen).
import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { RyuModel } from './QueenBea';
import { BeeFigure } from './BeeFigure';

function Spin({ children }) {
  const g = useRef();
  useFrame((st) => {
    if (g.current) g.current.rotation.y = Math.sin(st.clock.elapsedTime * 0.4) * 0.5;
  });
  return <group ref={g}>{children}</group>;
}

export default function QueenPreview() {
  const refs = { head: useRef(), wl: useRef(), wr: useRef(), al: useRef(), ar: useRef(), eyes: useRef() };
  const angle = new URLSearchParams(window.location.hash.split('?')[1] || '').get('a');
  return (
    <div style={{ position: 'fixed', inset: 0, background: '#E3F0FA' }}>
      <Canvas shadows camera={{ position: [0, 1.6, 4.2], fov: 35 }}>
        <hemisphereLight args={['#F4F8FF', '#8F877A', 0.9]} />
        <directionalLight position={[3, 6, 5]} intensity={1.6} castShadow />
        <group rotation={[0, angle ? Number(angle) : 0, 0]}>
          <RyuModel refs={refs} />
        </group>
        <group position={[1.4, 0, 0]}>
          <BeeFigure position={[0, 0, 0]} vest="#E5483B" />
        </group>
        <Spin />
        <OrbitControls target={[0, 1.1, 0]} />
      </Canvas>
    </div>
  );
}
