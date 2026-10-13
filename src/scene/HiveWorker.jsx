// Agent AI di kedai 3D: kru kedai ramen chibi (happi/celemek/baju koki warna divisi, penutup kepala per peran).
// Agent berjalan kaki lewat pintu & tangga (tidak terbang). Ryu memakai model khusus (QueenBea.jsx).
import { useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Html, Billboard } from '@react-three/drei';
import { AGENTS, DEPTS, tierOf, statusText } from '../data/hive';
import { useHive } from '../sim/store';
import { world, focusAgent } from '../sim/engine';
import { M, std } from './materials';
import { RyuModel } from './QueenBea';
import { CrewBody, agentLook, updateCrewLod } from './Crew';

const BUBBLE = { mission: '#E5483B', break: '#9BD36A', charge: '#9EC9FF', meeting: '#F4EBDD' };
const bubbleGeo = new THREE.OctahedronGeometry(0.12, 0);
const ringGeo = new THREE.TorusGeometry(0.6, 0.045, 6, 24);
const zGeo = new THREE.BoxGeometry(0.22, 0.04, 0.02);

// Huruf "Z" untuk agent yang tidur
function ZMark({ zRef }) {
  return (
    <group ref={zRef}>
      <mesh geometry={zGeo} material={M.zzz} position={[0, 0.09, 0]} />
      <mesh geometry={zGeo} material={M.zzz} rotation={[0, 0, Math.PI / 4 + 0.2]} />
      <mesh geometry={zGeo} material={M.zzz} position={[0, -0.09, 0]} />
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
  const refs = { body: useRef(), head: useRef(), al: useRef(), ar: useRef(), ll: useRef(), lr: useRef(), eyes: useRef(), dragon: useRef(), detail: useRef(), item: useRef() };
  const bubble = useRef();
  const bubbleMat = useMemo(() => std('#E5483B', { emissive: '#E5483B', emissiveIntensity: 0.5 }), []);
  const ring = useRef();
  const zzz = useRef();
  const z1 = useRef();
  const z2 = useRef();
  const [hover, setHover] = useState(false);
  const selected = useHive((s) => s.selectedAgent === def.id);
  const off = useMemo(() => Math.random() * 10, []);
  const blink = useRef(2 + Math.random() * 4);
  const queen = def.id === 'ceo';
  const look = useMemo(() => agentLook(def, DEPTS[def.dept]?.color || '#22324F', AGENTS.findIndex((a) => a.id === def.id)), [def]);
  const topY = queen ? 2.25 : 2.0;

  useFrame((st, dt) => {
    const a = world.byId[def.id];
    if (!a || !g.current) return;
    const floor = useHive.getState().floor;
    const visible = a.active !== false && (floor === 'all' || tierOf(a.pos.y) <= floor);
    g.current.visible = visible;
    if (!visible) return;
    g.current.position.copy(a.pos);
    updateCrewLod(refs, g.current, st.camera);
    let d = a.targetFacing - g.current.rotation.y;
    d = Math.atan2(Math.sin(d), Math.cos(d));
    g.current.rotation.y += d * Math.min(1, dt * 8);

    const t = st.clock.elapsedTime + off;
    const s = a.state;
    const gym = s === 'break' && a.roomId === 'gym';
    let bob = 0;
    let tilt = 0;
    let armL = 0;
    let armR = 0;
    let legL = 0;
    let legR = 0;
    let turn = 0;
    let roll = 0;
    if (s === 'walk' || s === 'fly') {
      const k = Math.sin(t * 9);
      bob = Math.abs(k) * 0.05;
      armL = k * 0.6;
      armR = -armL;
      legL = -k * 0.55;
      legR = -legL;
    } else if (s === 'idle') {
      turn = Math.sin(t * 0.8) * 0.4;
      armR = Math.sin(t * 5) * 0.3 - 1.4;
    } else if (s === 'sleep') {
      bob = Math.sin(t * 1.2) * 0.02;
      tilt = 0.12;
      roll = 0.3;
      armL = armR = 0.1;
    } else if (s === 'desk') {
      bob = Math.abs(Math.sin(t * 2)) * 0.015;
      armL = Math.sin(t * 16) * 0.12 - 0.9;
      armR = Math.sin(t * 16 + 1.6) * 0.12 - 0.9;
      turn = Math.sin(t * 0.6) * 0.15;
    } else if (s === 'meeting' || s === 'visit') {
      turn = Math.sin(t * 0.9) * 0.35;
      armL = Math.sin(t * 3) * 0.4 - 0.3;
      armR = -0.2;
    } else if (gym) {
      // latihan di dojo: memotong/mengaduk dengan semangat
      bob = Math.abs(Math.sin(t * 4)) * 0.08;
      armR = Math.sin(t * 10) * 0.8 - 1.2;
      armL = -0.6;
    } else if (s === 'break') {
      bob = Math.sin(t * 1.5) * 0.03;
      turn = Math.sin(t * 0.7) * 0.3;
      armR = -1.4 + Math.sin(t * 2) * 0.2; // menyeruput ramen
    } else if (s === 'charge') {
      bob = Math.sin(t) * 0.02;
      tilt = 0.08;
    }
    if (a.cheer > 0) {
      bob += Math.sin(a.cheer * Math.PI) * 0.4;
      armL = armR = -2.7;
    }
    refs.body.current.position.y = bob;
    refs.body.current.rotation.x = tilt;
    refs.head.current.rotation.y = turn;
    refs.head.current.rotation.z = roll;
    refs.al.current.rotation.x = armL;
    refs.ar.current.rotation.x = armR;
    refs.ll.current.rotation.x = legL;
    refs.lr.current.rotation.x = legR;
    if (refs.dragon.current) {
      refs.dragon.current.position.y = Math.sin(t * 2.2) * 0.06;
      refs.dragon.current.rotation.y = Math.sin(t * 0.7) * 0.5;
    }

    blink.current -= dt;
    let ey = 1;
    if (s === 'charge' || s === 'sleep') ey = 0.15;
    else if (blink.current < 0) {
      ey = 0.15;
      if (blink.current < -0.13) blink.current = 2 + Math.random() * 4;
    }
    if (refs.eyes.current) refs.eyes.current.scale.y = ey;

    const key = a.missionId ? 'mission' : s;
    const col = BUBBLE[key];
    bubble.current.visible = !!col && s !== 'fly';
    if (col) {
      bubbleMat.color.set(col);
      bubbleMat.emissive.set(col);
      bubble.current.position.y = topY + Math.sin(t * 3) * 0.06;
      bubble.current.rotation.y = t * 1.5;
    }
    zzz.current.visible = s === 'sleep';
    if (s === 'sleep') {
      [z1.current, z2.current].forEach((z, i) => {
        const k = (t * 0.5 + i * 0.5) % 1;
        z.position.set(0.25 + k * 0.3, (queen ? 1.9 : 1.7) + k * 0.7, 0);
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
      <mesh ref={ring} geometry={ringGeo} position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]} material={M.led} visible={false} />
      {queen ? <RyuModel refs={refs} /> : <CrewBody refs={refs} look={look} ai={!def.guest} />}
      <Billboard ref={zzz} visible={false}>
        <ZMark zRef={z1} />
        <ZMark zRef={z2} />
      </Billboard>
      <mesh ref={bubble} geometry={bubbleGeo} material={bubbleMat} position={[0, topY, 0]} visible={false} />
      {(hover || selected) && (
        <Html position={[0, topY + 0.4, 0]} center style={{ pointerEvents: 'none' }} zIndexRange={[20, 0]}>
          <AgentTag def={def} />
        </Html>
      )}
    </group>
  );
}
