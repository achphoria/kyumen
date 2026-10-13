import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { HALF, WALL_H, TIER_GAP, SEATS_BY_ROOM, DEPTS } from '../data/hive';
import { useHive } from '../sim/store';
import { world } from '../sim/engine';
import { M, std, Cyl, Sph } from './materials';
import { woodTexture, marbleTexture } from './textures';
import { StaticMerge } from './StaticMerge';
import {
  DESKS,
  DeptProp,
  LobbySet,
  LoungeSet,
  GymSet,
  HallSet,
  PodsSet,
  ServerSet,
  GardenSet,
  MissionSet,
  RoyalDecor,
  PaperLantern,
} from './Furniture';

// empat dinding kotak: +x, +z (depan), -x, -z (belakang)
const WALL_ANGLES = [0, 1, 2, 3].map((i) => (i * Math.PI) / 2);
const SIDE = HALF * 2;

// lantai per jenis ruangan: tatami untuk ruang Jepang, kayu untuk ruang kerja, batu untuk dapur/gudang/server
const TATAMI = new Set(['royal', 'hall', 'lobby', 'gym', 'mission']);
function floorMaterial(room) {
  if (room.kind === 'garden') return std('#E7D7B5', { roughness: 0.95 });
  if (TATAMI.has(room.kind)) return std('#D6D99C', { map: woodTexture(), roughness: 0.9 });
  if (room.kind === 'server' || room.kind === 'pods' || room.id === 'ck' || room.id === 'wh')
    return std(room.kind === 'server' ? '#C9CED6' : '#E8E2D6', { map: marbleTexture(), roughness: 0.5 });
  return std('#E9CFA8', { map: woodTexture(), roughness: 0.62 });
}

// dinding shoji: kertas krem dengan kisi kayu gelap
function ShojiWall({ wallH, len }) {
  const cols = Math.max(2, Math.round(len / 1.5));
  return (
    <group>
      <mesh position={[0, wallH / 2, 0]} material={M.shoji} castShadow receiveShadow>
        <boxGeometry args={[len, wallH, 0.12]} />
      </mesh>
      {Array.from({ length: cols + 1 }, (_, i) => (
        <mesh key={i} position={[-len / 2 + (i * len) / cols, wallH / 2, 0]} material={M.gold}>
          <boxGeometry args={[0.07, wallH, 0.18]} />
        </mesh>
      ))}
      {[0.35, 0.7].map((k) => (
        <mesh key={k} position={[0, wallH * k, 0]} material={M.gold}>
          <boxGeometry args={[len, 0.05, 0.16]} />
        </mesh>
      ))}
      <mesh position={[0, 0.08, 0]} material={M.gold}>
        <boxGeometry args={[len, 0.16, 0.18]} />
      </mesh>
      <mesh position={[0, wallH + 0.04, 0]} material={M.gold} castShadow>
        <boxGeometry args={[len + 0.05, 0.08, 0.22]} />
      </mesh>
    </group>
  );
}

// tanaman dalam pot
function Plant({ p, s = 1 }) {
  return (
    <group position={p} scale={s}>
      <Cyl p={[0, 0.22, 0]} a={[0.26, 0.19, 0.44, 12]} m={M.pot} />
      <Sph p={[0, 0.78, 0]} rad={0.36} sc={[1, 1.1, 1]} m={M.leaf} seg={[12, 10]} />
      <Sph p={[0.16, 1.02, 0.08]} rad={0.24} m={M.leafDark} seg={[10, 8]} />
      <Sph p={[-0.14, 0.98, -0.1]} rad={0.22} m={M.leaf} seg={[10, 8]} />
    </group>
  );
}

// dekorasi umum: tanaman di dua sudut belakang
function RoomDecor({ room }) {
  if (room.kind === 'garden' || room.kind === 'server' || room.kind === 'gym') return null;
  const c = HALF - 0.75;
  return (
    <group>
      <Plant p={[-c, 0, -c]} s={0.85} />
      <Plant p={[c, 0, -c]} s={0.75} />
    </group>
  );
}
const SETS = {
  lobby: LobbySet,
  lounge: LoungeSet,
  gym: GymSet,
  hall: HallSet,
  pods: PodsSet,
  server: ServerSet,
  garden: GardenSet,
  mission: MissionSet,
};

// pengukur progres misi: tabung kaca yang terisi "kuah" biru naga
function Gauge({ roomId }) {
  const group = useRef();
  const fill = useRef();
  useFrame((st) => {
    const m = world.missions.find((x) => x.roomId === roomId && x.phase !== 'done');
    if (!group.current) return;
    group.current.visible = !!m;
    if (!m) return;
    group.current.rotation.y = st.clock.elapsedTime * 0.7;
    group.current.position.y = 3.3 + Math.sin(st.clock.elapsedTime * 2) * 0.08;
    fill.current.scale.y = Math.max(0.04, m.progress);
  });
  return (
    <group ref={group} position={[0, 3.3, 0]} visible={false}>
      <mesh material={M.glass}>
        <cylinderGeometry args={[0.6, 0.6, 1, 16]} />
      </mesh>
      <mesh position={[0, 0.52, 0]} material={M.red}>
        <cylinderGeometry args={[0.64, 0.64, 0.06, 16]} />
      </mesh>
      <mesh position={[0, -0.52, 0]} material={M.red}>
        <cylinderGeometry args={[0.64, 0.64, 0.06, 16]} />
      </mesh>
      <group ref={fill} position={[0, -0.48, 0]}>
        <mesh position={[0, 0.48, 0]} material={M.honey}>
          <cylinderGeometry args={[0.52, 0.52, 0.96, 16]} />
        </mesh>
      </group>
    </group>
  );
}

// Dinding depan Genkan: kusen kayu dengan pintu shoji geser yang terbuka saat tamu mendekat.
function DoorWall({ wallH, len }) {
  const left = useRef();
  const right = useRef();
  useFrame((_, dt) => {
    world.door += ((world.doorOpen ? 1 : 0) - world.door) * Math.min(1, dt * 5);
    left.current.position.x = -0.5 - world.door * 0.95;
    right.current.position.x = 0.5 + world.door * 0.95;
  });
  const side = (len - 2) / 2;
  return (
    <group>
      {[-1, 1].map((s) => (
        <group key={s} position={[s * (1 + side / 2), 0, 0]}>
          <ShojiWall wallH={wallH} len={side} />
        </group>
      ))}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * 1.02, wallH / 2, 0]} material={M.gold} castShadow>
          <boxGeometry args={[0.12, wallH, 0.24]} />
        </mesh>
      ))}
      <mesh position={[0, wallH + 0.05, 0]} material={M.gold} castShadow>
        <boxGeometry args={[2.2, 0.1, 0.24]} />
      </mesh>
      {/* papan nama kecil di atas pintu */}
      <mesh position={[0, wallH + 0.35, 0.06]} material={M.royal}>
        <boxGeometry args={[1.6, 0.42, 0.06]} />
      </mesh>
      <mesh position={[0, wallH + 0.35, 0.1]} material={M.cream}>
        <boxGeometry args={[1.3, 0.08, 0.01]} />
      </mesh>
      <mesh ref={left} position={[-0.5, wallH * 0.47, 0]} material={M.doorGlass}>
        <boxGeometry args={[1, wallH * 0.92, 0.05]} />
      </mesh>
      <mesh ref={right} position={[0.5, wallH * 0.47, 0]} material={M.doorGlass}>
        <boxGeometry args={[1, wallH * 0.92, 0.05]} />
      </mesh>
    </group>
  );
}

export function Room({ room }) {
  const floor = useHive((s) => s.floor);
  const hover = useHive((s) => s.hoverRoom === room.id);
  const selected = useHive((s) => s.selectedRoom === room.id);
  const walls = useRef([]);
  const accent = room.dept ? DEPTS[room.dept].color : '#4A3524';
  const rim = useMemo(() => std(accent, { emissive: '#E5483B', emissiveIntensity: 0 }), [accent]);
  const floorMat = useMemo(() => floorMaterial(room), [room]);
  const isGarden = room.kind === 'garden';
  const wallH = isGarden ? 0.55 : WALL_H;
  // tiang sudut setinggi lantai berikutnya supaya kedai tampak seperti satu bangunan
  const postH = room.tier === 2 || room.id === 'ck' || room.id === 'wh' ? 3.1 : TIER_GAP - 0.4;

  useFrame((st, dt) => {
    const cam = st.camera.position;
    const dx = cam.x - room.x;
    const dz = cam.z - room.z;
    const len = Math.hypot(dx, dz) || 1;
    walls.current.forEach((w, i) => {
      if (!w) return;
      const a = WALL_ANGLES[i];
      const dot = (Math.cos(a) * dx + Math.sin(a) * dz) / len;
      const target = isGarden ? 1 : dot > 0.1 ? 0.1 : 1;
      w.scale.y += (target - w.scale.y) * Math.min(1, dt * 6);
    });
    const g = world.glow[room.id] || 0;
    rim.emissiveIntensity = g * 1.6 + (hover || selected ? 0.35 : 0);
  });

  if (floor !== 'all' && room.tier > floor) return null;

  const showLabel = hover || selected || floor === room.tier;
  const Set = SETS[room.kind];

  return (
    <group position={[room.x, room.y, room.z]}>
      {/* lantai */}
      <mesh
        position={[0, -0.2, 0]}
        material={rim}
        receiveShadow
        castShadow
        onPointerOver={(e) => {
          e.stopPropagation();
          useHive.getState().setHoverRoom(room.id);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          if (useHive.getState().hoverRoom === room.id) useHive.getState().setHoverRoom(null);
          document.body.style.cursor = '';
        }}
        onClick={(e) => {
          e.stopPropagation();
          useHive.getState().selectRoom(room.id);
        }}
      >
        <boxGeometry args={[SIDE + 0.3, 0.4, SIDE + 0.3]} />
      </mesh>
      <mesh position={[0, -0.19, 0]} material={floorMat} receiveShadow>
        <boxGeometry args={[SIDE - 0.1, 0.4, SIDE - 0.1]} />
      </mesh>
      {/* balok kayu di bawah lantai (plafon ruangan di bawahnya) */}
      <mesh position={[0, -0.48, 0]} material={M.gold} castShadow>
        <boxGeometry args={[SIDE + 0.1, 0.16, SIDE + 0.1]} />
      </mesh>

      {/* tiang sudut */}
      {!isGarden &&
        [
          [-1, -1],
          [1, -1],
          [-1, 1],
          [1, 1],
        ].map(([sx, sz]) => (
          <mesh key={`${sx}${sz}`} position={[sx * (HALF + 0.05), postH / 2, sz * (HALF + 0.05)]} material={M.gold} castShadow>
            <boxGeometry args={[0.24, postH, 0.24]} />
          </mesh>
        ))}

      {/* dinding (otomatis turun di sisi yang menghadap kamera) */}
      {WALL_ANGLES.map((a, i) => {
        const transform = {
          position: [HALF * Math.cos(a), 0, HALF * Math.sin(a)],
          rotation: [0, -(a + Math.PI / 2), 0],
        };
        if (room.kind === 'lobby' && i === 1) {
          return (
            <group key={i} {...transform} userData={{ cutaway: true }}>
              <DoorWall wallH={wallH} len={SIDE} />
            </group>
          );
        }
        return (
          <group key={i} ref={(el) => (walls.current[i] = el)} {...transform} userData={{ cutaway: true }}>
            {isGarden ? (
              <>
                {/* pagar balkon kayu */}
                <mesh position={[0, wallH, 0]} material={M.gold} castShadow>
                  <boxGeometry args={[SIDE, 0.08, 0.12]} />
                </mesh>
                {Array.from({ length: 9 }, (_, k) => (
                  <mesh key={k} position={[-SIDE / 2 + (k * SIDE) / 8, wallH / 2, 0]} material={M.wood}>
                    <boxGeometry args={[0.07, wallH, 0.07]} />
                  </mesh>
                ))}
              </>
            ) : (
              <ShojiWall wallH={wallH} len={SIDE} />
            )}
            {/* lentera kertas kecil di dinding */}
            {!isGarden && i % 2 === 0 && <PaperLantern p={[SIDE * 0.3, wallH * 0.75, 0.25]} s={0.6} />}
          </group>
        );
      })}

      {/* furnitur & dekorasi statis digabung per material (lihat StaticMerge) */}
      <StaticMerge>
        {SEATS_BY_ROOM[room.id]?.map((s) => {
          const Desk = DESKS[s.type];
          return (
            <group key={s.agentId} position={s.deskLocal} rotation={[0, s.deskRot, 0]}>
              <Desk />
            </group>
          );
        })}
        <RoomDecor room={room} />
        {room.kind === 'dept' && <DeptProp dept={room.dept} roomId={room.id} />}
        {room.kind === 'royal' && <RoyalDecor />}
        {Set && <Set />}
      </StaticMerge>

      <Gauge roomId={room.id} />

      {showLabel && (
        <Html position={[0, WALL_H + 2.0, 0]} center style={{ pointerEvents: 'none' }} zIndexRange={[10, 0]}>
          <div className={`room-tag${selected ? ' is-active' : ''}`}>{room.name}</div>
        </Html>
      )}
    </group>
  );
}
