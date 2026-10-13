// Karakter kru Kyumen: naga biru chibi berompi happi warna divisi, aksesori berbeda per divisi/peran.
import { useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html, Billboard } from '@react-three/drei';
import { DEPTS, SKINS, agentAcc, tierOf, statusText } from '../data/hive';
import { useHive } from '../sim/store';
import { world, focusAgent } from '../sim/engine';
import { M, std, Box, Cyl, Sph, Cone } from './materials';
import { RyuModel } from './QueenBea';
import { DragonBody } from './Dragon';

const BUBBLE = { mission: '#FF8C1A', break: '#9BD36A', charge: '#9EC9FF', meeting: '#FFF8E7' };

function Accessory({ type }) {
  switch (type) {
    case 'crown':
      return (
        <group position={[0, 0.42, 0]}>
          <Cyl p={[0, 0, 0]} a={[0.2, 0.23, 0.12, 6]} m={M.led} />
          {[0, 1, 2, 3, 4].map((i) => {
            const a = (i / 5) * Math.PI * 2;
            return <Cone key={i} p={[0.18 * Math.cos(a), 0.12, 0.18 * Math.sin(a)]} a={[0.05, 0.14, 4]} m={M.gold} />;
          })}
        </group>
      );
    case 'hachimaki':
      return (
        <group position={[0, 0.16, 0]}>
          <mesh rotation={[Math.PI / 2 - 0.12, 0, 0]} material={M.white} castShadow>
            <torusGeometry args={[0.43, 0.045, 6, 22]} />
          </mesh>
          <mesh position={[0, 0.05, 0.43]} material={M.amber}>
            <circleGeometry args={[0.06, 16]} />
          </mesh>
          {[-1, 1].map((sx) => (
            <Box key={sx} p={[sx * 0.07, -0.05, -0.45]} r={[0.3, 0, sx * 0.5]} s={[0.05, 0.18, 0.02]} m={M.white} />
          ))}
        </group>
      );
    case 'chefhat':
      return (
        <group position={[0, 0.36, -0.02]}>
          <Cyl a={[0.27, 0.27, 0.16, 16]} m={M.white} />
          <Sph p={[0, 0.2, 0]} rad={0.25} sc={[1.15, 0.9, 1.15]} m={M.white} seg={[12, 10]} />
          {[-1, 1].map((sx) => (
            <Sph key={sx} p={[sx * 0.15, 0.17, 0]} rad={0.17} m={M.white} seg={[10, 8]} />
          ))}
        </group>
      );
    case 'headset':
      return (
        <group>
          <mesh material={M.graphite}>
            <torusGeometry args={[0.45, 0.035, 6, 16, Math.PI]} />
          </mesh>
          <Cyl p={[0.45, 0, 0]} r={[0, 0, Math.PI / 2]} a={[0.11, 0.11, 0.09, 10]} m={M.graphite} />
          <Cyl p={[-0.45, 0, 0]} r={[0, 0, Math.PI / 2]} a={[0.11, 0.11, 0.09, 10]} m={M.graphite} />
          <Box p={[0.38, -0.14, 0.2]} r={[0, -0.9, 0]} s={[0.03, 0.03, 0.3]} m={M.graphite} />
          <Sph p={[0.27, -0.16, 0.33]} rad={0.045} m={M.amber} />
        </group>
      );
    case 'hardhat':
      return (
        <group position={[0, 0.12, 0]}>
          <mesh material={M.amber} castShadow>
            <sphereGeometry args={[0.46, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
          </mesh>
          <Cyl p={[0, 0.01, 0.06]} a={[0.52, 0.52, 0.04, 16]} m={M.amber} />
          <Box p={[0, 0.3, 0]} s={[0.08, 0.2, 0.7]} m={M.gold} />
        </group>
      );
    case 'glasses':
      return (
        <group position={[0, 0.06, 0.43]}>
          {[-0.17, 0.17].map((x) => (
            <mesh key={x} position={[x, 0, 0]} material={M.graphite}>
              <torusGeometry args={[0.1, 0.017, 6, 14]} />
            </mesh>
          ))}
          <Box p={[0, 0.01, 0]} s={[0.14, 0.02, 0.02]} m={M.graphite} />
        </group>
      );
    case 'beret':
      return (
        <group position={[0.07, 0.4, -0.02]} rotation={[0, 0, -0.3]}>
          <Cyl a={[0.33, 0.37, 0.1, 14]} m={M.graphite} />
          <Cyl p={[0, 0.08, 0]} a={[0.025, 0.025, 0.08, 6]} m={M.graphite} />
        </group>
      );
    case 'goggles':
      return (
        <group position={[0, 0.17, 0]}>
          <mesh rotation={[Math.PI / 2, 0, 0]} material={M.brown}>
            <torusGeometry args={[0.445, 0.03, 6, 20]} />
          </mesh>
          {[-0.14, 0.14].map((x) => (
            <Cyl key={x} p={[x, 0.02, 0.41]} r={[Math.PI / 2 - 0.3, 0, 0]} a={[0.09, 0.09, 0.07, 10]} m={M.honey} />
          ))}
        </group>
      );
    default:
      return null;
  }
}

function BodyAccessory({ type }) {
  if (type === 'bowtie')
    return (
      <group position={[0, 0.7, 0.3]}>
        <Cone p={[-0.08, 0, 0]} r={[0, 0, Math.PI / 2]} a={[0.06, 0.13, 4]} m={M.graphite} />
        <Cone p={[0.08, 0, 0]} r={[0, 0, -Math.PI / 2]} a={[0.06, 0.13, 4]} m={M.graphite} />
        <Sph rad={0.035} m={M.gold} />
      </group>
    );
  if (type === 'scarf')
    return (
      <group position={[0, 0.72, 0]}>
        <mesh rotation={[Math.PI / 2, 0, 0]} material={M.cream} castShadow>
          <torusGeometry args={[0.28, 0.07, 8, 16]} />
        </mesh>
        <Box p={[0.12, -0.18, 0.27]} r={[0.15, 0, 0.1]} s={[0.12, 0.3, 0.05]} m={M.cream} />
      </group>
    );
  return null;
}

// Huruf "Z" dari tiga balok untuk agent yang tidur
function ZMark({ zRef, size = 1 }) {
  return (
    <group ref={zRef} scale={size}>
      <mesh position={[0, 0.09, 0]} material={M.zzz}>
        <boxGeometry args={[0.2, 0.04, 0.02]} />
      </mesh>
      <mesh rotation={[0, 0, Math.PI / 4 + 0.2]} material={M.zzz}>
        <boxGeometry args={[0.26, 0.04, 0.02]} />
      </mesh>
      <mesh position={[0, -0.09, 0]} material={M.zzz}>
        <boxGeometry args={[0.2, 0.04, 0.02]} />
      </mesh>
    </group>
  );
}

function AgentTag({ def }) {
  const st = useHive((s) => s.agentStates[def.id]);
  return (
    <div className="agent-tag">
      <strong>{def.nick}</strong>
      <span>{def.guest ? 'Pelanggan di Genkan' : statusText(st)}</span>
    </div>
  );
}

export function KyuWorker({ def }) {
  const g = useRef();
  const inner = useRef();
  const head = useRef();
  const wl = useRef();
  const wr = useRef();
  const al = useRef();
  const ar = useRef();
  const eyes = useRef();
  const bubble = useRef();
  const bubbleMat = useMemo(() => std('#FF8C1A', { emissive: '#FF8C1A', emissiveIntensity: 0.5 }), []);
  const ring = useRef();
  const zzz = useRef();
  const z1 = useRef();
  const z2 = useRef();
  const [hover, setHover] = useState(false);
  const selected = useHive((s) => s.selectedAgent === def.id);
  const off = useMemo(() => Math.random() * 10, []);
  const blink = useRef(2 + Math.random() * 4);
  const mats = useMemo(() => ({ skin: def.guest ? std('#9FB4C8', { roughness: 0.5 }) : std(SKINS[def.skin], { roughness: 0.45 }) }), [def.skin, def.guest]);
  const acc = agentAcc(def);
  const queen = def.id === 'ceo'; // Ryu punya model sendiri yang lebih besar
  const topY = queen ? 2.6 : 2.15;

  useFrame((st, dt) => {
    const a = world.byId[def.id];
    if (!a || !g.current) return;
    const floor = useHive.getState().floor;
    const visible = a.active !== false && (floor === 'all' || tierOf(a.pos.y) <= floor);
    g.current.visible = visible;
    if (!visible) return;
    g.current.position.copy(a.pos);
    let d = a.targetFacing - g.current.rotation.y;
    d = Math.atan2(Math.sin(d), Math.cos(d));
    g.current.rotation.y += d * Math.min(1, dt * 8);

    const t = st.clock.elapsedTime + off;
    const s = a.state;
    const gym = s === 'break' && a.roomId === 'gym';
    let bob = 0;
    let tilt = 0;
    let flap = Math.sin(t * 5) * 0.12;
    let armL = 0;
    let armR = 0;
    let turn = 0;
    let roll = 0;
    if (s === 'walk') {
      bob = Math.abs(Math.sin(t * 8)) * 0.06;
      armL = Math.sin(t * 8) * 0.6;
      armR = -armL;
    } else if (s === 'idle') {
      turn = Math.sin(t * 0.8) * 0.4;
      armR = Math.sin(t * 5) * 0.3 - 1.4;
    } else if (s === 'sleep') {
      bob = Math.sin(t * 1.2) * 0.02;
      tilt = 0.18;
      roll = 0.28;
      flap = 0;
      armL = armR = 0.1;
    } else if (s === 'fly') {
      bob = 0.2 + Math.sin(t * 7) * 0.08;
      tilt = 0.28;
      flap = Math.sin(t * 40) * 0.7;
      armL = armR = -0.5;
    } else if (s === 'desk') {
      bob = Math.abs(Math.sin(t * 2)) * 0.02;
      armL = Math.sin(t * 16) * 0.15 - 0.9;
      armR = Math.sin(t * 16 + 1.6) * 0.15 - 0.9;
      turn = Math.sin(t * 0.6) * 0.15;
    } else if (s === 'meeting' || s === 'visit') {
      turn = Math.sin(t * 0.9) * 0.35;
      armL = Math.sin(t * 3) * 0.4 - 0.3;
      armR = -0.2;
    } else if (gym) {
      bob = Math.abs(Math.sin(t * 4)) * 0.35;
      armL = Math.sin(t * 8) * 1.2;
      armR = -armL;
    } else if (s === 'break') {
      bob = Math.sin(t * 1.5) * 0.04;
      turn = Math.sin(t * 0.7) * 0.3;
      armR = -1.2;
    } else if (s === 'charge') {
      bob = Math.sin(t) * 0.03;
      flap = 0;
    }
    if (a.cheer > 0) {
      bob += Math.sin(a.cheer * Math.PI) * 0.5;
      armL = armR = -2.6;
    }
    inner.current.position.y = bob;
    inner.current.rotation.x = tilt;
    head.current.rotation.y = turn;
    head.current.rotation.z = roll;
    wl.current.rotation.z = -(0.45 + flap);
    wr.current.rotation.z = 0.45 + flap;
    al.current.rotation.x = armL;
    ar.current.rotation.x = armR;

    blink.current -= dt;
    let ey = 1;
    if (s === 'charge' || s === 'sleep') ey = 0.12;
    else if (blink.current < 0) {
      ey = 0.12;
      if (blink.current < -0.13) blink.current = 2 + Math.random() * 4;
    }
    eyes.current.scale.y = ey;

    const key = a.missionId ? 'mission' : s;
    const col = BUBBLE[key];
    bubble.current.visible = !!col && s !== 'fly';
    if (col) {
      bubbleMat.color.set(col);
      bubbleMat.emissive.set(col);
      bubble.current.position.y = topY + Math.sin(t * 3) * 0.06;
    }
    zzz.current.visible = s === 'sleep';
    if (s === 'sleep') {
      [z1.current, z2.current].forEach((z, i) => {
        const k = (t * 0.5 + i * 0.5) % 1;
        z.position.set(0.25 + k * 0.3, (queen ? 2.1 : 1.75) + k * 0.7, 0);
        z.scale.setScalar((0.6 + k * 0.6) * (1 - Math.max(0, k - 0.8) * 5));
      });
    }
    ring.current.visible = selected || hover;
    if (ring.current.visible) ring.current.rotation.z = t;
  });

  const onClick = (e) => {
    e.stopPropagation();
    if (!g.current?.visible || def.guest) return;
    focusAgent(def.id, false);
  };

  return (
    <group
      ref={g}
      onClick={onClick}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHover(true);
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        setHover(false);
        document.body.style.cursor = '';
      }}
    >
      <mesh ref={ring} position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]} material={M.led} visible={false}>
        <torusGeometry args={[0.6, 0.045, 6, 6]} />
      </mesh>
      <group ref={inner}>
        {queen ? (
          <RyuModel refs={{ head, wl, wr, al, ar, eyes }} />
        ) : (
          <DragonBody
            refs={{ head, wl, wr, al, ar, eyes }}
            body={mats.skin}
            vest={def.guest ? null : DEPTS[def.dept].color}
            bodyExtra={<BodyAccessory type={acc} />}
            headExtra={<Accessory type={acc} />}
          />
        )}
      </group>
      <Billboard ref={zzz} visible={false}>
        <ZMark zRef={z1} />
        <ZMark zRef={z2} />
      </Billboard>
      <Billboard ref={bubble} position={[0, 2.15, 0]} visible={false}>
        <mesh rotation={[Math.PI / 2, 0, 0]} material={bubbleMat}>
          <cylinderGeometry args={[0.13, 0.13, 0.04, 6]} />
        </mesh>
      </Billboard>
      {(hover || selected) && (
        <Html position={[0, queen ? 2.95 : 2.55, 0]} center style={{ pointerEvents: 'none' }} zIndexRange={[20, 0]}>
          <AgentTag def={def} />
        </Html>
      )}
    </group>
  );
}
