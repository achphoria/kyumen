import { OrbitControls } from '@react-three/drei';
import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { ROOM_LIST } from '../data/hive';
import { Room } from './Room';
import { Agents, Island, Harbor, Roofs, WestTerrace, Bridges, Effects, CameraRig } from './World';
import { OutdoorStaff } from './StaffAvatar';
import { DayNight } from './DayNight';
import { TvDirector } from './TvDirector';
import { SkyDome, CloudSea } from './Atmosphere';
import { WarmEnvironment, LookFX, useQuality } from './Look';
import { useSaver } from '../sim/saver';

// pengembangan saja: akses renderer untuk profil performa (tidak ikut build publik)
function DevExpose() {
  const three = useThree();
  if (import.meta.env.DEV) window.__three = three;
  return null;
}

// Peta bayangan diperbarui ~3x per detik (bukan tiap frame): matahari & naga bergerak pelan,
// jadi hasilnya sama tapi pass bayangan tidak menggambar ulang ratusan objek setiap frame.
function ShadowThrottle({ hz = 3 }) {
  const { gl } = useThree();
  const acc = useRef(0);
  useEffect(() => {
    gl.shadowMap.autoUpdate = false;
    gl.shadowMap.needsUpdate = true;
    return () => {
      gl.shadowMap.autoUpdate = true;
    };
  }, [gl]);
  useFrame((_, dt) => {
    acc.current += dt;
    if (acc.current >= 1 / hz) {
      acc.current = 0;
      gl.shadowMap.needsUpdate = true;
    }
  });
  return null;
}

// tv: mode spectator untuk layar besar (kamera dikendalikan TvDirector)
export function Scene({ tv = false }) {
  const quality = useQuality();
  const saver = useSaver((s) => s.on);
  return (
    <>
      {import.meta.env.DEV && <DevExpose />}
      {!saver && <ShadowThrottle />}
      <fog attach="fog" args={['#E3F0FA', 95, 230]} />
      <SkyDome />
      <CloudSea />
      <WarmEnvironment intensity={0.42} />
      {/* tanpa AO (paling berat) supaya kedai tetap mulus */}
      {!saver && <LookFX quality={quality} ao={false} />}
      <DayNight />
      <Island />
      <Harbor />
      <Roofs />
      {ROOM_LIST.map((r) => (
        <Room key={r.id} room={r} />
      ))}
      <WestTerrace />
      <Bridges />
      <Agents />
      <OutdoorStaff />
      <Effects />
      <OrbitControls
        makeDefault
        enableDamping
        dampingFactor={0.08}
        minDistance={7}
        maxDistance={120}
        maxPolarAngle={1.4}
        target={[3, 6, 2]}
      />
      {tv ? <TvDirector /> : <CameraRig />}
    </>
  );
}
