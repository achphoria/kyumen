// Pratinjau avatar staff 3D (kru kedai) yang berjoget sesuai pilihan, berputar pelan di atas tikar tatami.
import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { StaffFigure } from '../scene/StaffAvatar';

function Turntable({ children }) {
  const g = useRef();
  useFrame((st) => {
    if (g.current) g.current.rotation.y = Math.sin(st.clock.elapsedTime * 0.5) * 0.6;
  });
  return <group ref={g}>{children}</group>;
}

export function AvatarPreview({ p, pose = 'idle', className = '' }) {
  return (
    <div className={`avp avp3d ${className}`} role="img" aria-label={`Avatar ${p.name || 'staff'}`}>
      <Canvas dpr={[1, 1.5]} camera={{ position: [0, 1.25, 4.2], fov: 30 }} gl={{ antialias: true, alpha: true }}>
        <hemisphereLight args={['#F4F8FF', '#B98A5A', 1.1]} />
        <directionalLight position={[2, 4, 3]} intensity={1.6} />
        <group position={[0, -0.85, 0]}>
          <mesh position={[0, -0.03, 0]}>
            <cylinderGeometry args={[0.95, 0.95, 0.06, 32]} />
            <meshStandardMaterial color="#C9CF8F" roughness={0.95} />
          </mesh>
          <Turntable>
            <StaffFigure profile={p} pose={pose} />
          </Turntable>
        </group>
      </Canvas>
    </div>
  );
}
