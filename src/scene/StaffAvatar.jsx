// Avatar staff manusia 3D: kru kedai yang bisa dikustomisasi (rambut, seragam, penutup kepala,
// barang di tangan) dengan 6 joget festival + animasi jalan. Agent AI memakai badan yang sama
// tapi bermata biru menyala; staff manusia punya label nama hijau saat diarahkan.
import { usePlaza } from '../sim/plaza';
import { useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { DEPTS } from '../data/hive';
import { POSE_BY_ID, POSE_ALIAS, normalizeProfile, lookOf } from '../data/staff';
import { outdoor } from '../sim/outdoor';
import { useHive } from '../sim/store';
import { CrewBody, updateCrewLod } from './Crew';

// Posisi badan per pose pada waktu t. aL/aR = rotasi bahu ke samping (kiri negatif = keluar),
// aLx/aRx = ayun depan-belakang, lL/lR = ayun kaki.
export function poseState(rawPose, t) {
  const pose = POSE_ALIAS[rawPose] || rawPose;
  const s = { y: 0, x: 0, rz: 0, scale: 1, headZ: 0, headX: 0, aL: 0.08, aR: -0.08, aLx: 0, aRx: 0, lL: 0, lR: 0 };
  switch (pose) {
    case 'walk': {
      const k = Math.sin(t * 9);
      s.y = Math.abs(k) * 0.05;
      s.aLx = k * 0.6;
      s.aRx = -k * 0.6;
      s.lL = -k * 0.5;
      s.lR = k * 0.5;
      break;
    }
    case 'bonodori': {
      // tangan melambai bergantian ke atas, langkah ke samping
      const k = Math.sin(t * 4.2);
      s.x = k * 0.1;
      s.rz = -k * 0.06;
      s.aL = -1.2 - Math.max(0, k) * 1.3;
      s.aR = 1.2 + Math.max(0, -k) * 1.3;
      s.lL = Math.max(0, k) * 0.35;
      s.lR = Math.max(0, -k) * 0.35;
      s.headZ = k * 0.12;
      break;
    }
    case 'soran': {
      // mendayung: kuda-kuda rendah, tangan menarik ke belakang
      const k = Math.sin(t * 5);
      s.y = -0.08 - Math.abs(k) * 0.06;
      s.aLx = -1.4 + k * 0.9;
      s.aRx = -1.4 + k * 0.9;
      s.aL = -0.3;
      s.aR = 0.3;
      s.lL = 0.35;
      s.lR = -0.35;
      s.headX = k * 0.15;
      break;
    }
    case 'mochi': {
      // palu kayu: angkat tinggi lalu hentak
      const u = (t * 1.6) % 1;
      const up = u < 0.6 ? u / 0.6 : 1 - (u - 0.6) / 0.4;
      s.aLx = -3.0 * up;
      s.aRx = -3.0 * up;
      s.y = u > 0.85 ? -0.06 : 0;
      s.headX = -0.3 * up;
      break;
    }
    case 'slurp': {
      // sumpit ke mulut, kepala mengangguk
      const k = Math.sin(t * 7);
      s.aRx = -2.0 + k * 0.35;
      s.aLx = -1.1;
      s.headX = 0.12 + k * 0.08;
      s.y = Math.abs(Math.sin(t * 3.5)) * 0.03;
      break;
    }
    case 'kanpai': {
      // bersulang: gelas naik, badan bergoyang
      const u = (t % 2) / 2;
      s.aR = u < 0.5 ? 2.6 : 0.6;
      s.aRx = u < 0.5 ? 0 : -1.2;
      s.aL = -0.4;
      s.rz = Math.sin(t * 3) * 0.06;
      s.headZ = Math.sin(t * 3) * 0.1;
      s.y = u < 0.5 ? Math.abs(Math.sin(t * 9)) * 0.08 : 0;
      break;
    }
    case 'banzai': {
      // lompat girang dengan dua tangan ke atas
      const u = (t * 1.4) % 1;
      const jump = Math.sin(Math.min(1, u / 0.5) * Math.PI);
      s.y = jump * 0.35;
      s.aL = -2.8 * Math.min(1, u * 3);
      s.aR = 2.8 * Math.min(1, u * 3);
      s.lL = jump * 0.4;
      s.lR = jump * 0.4;
      s.scale = 1 + jump * 0.04;
      break;
    }
    default:
      s.y = Math.sin(t * 2) * 0.015;
  }
  return s;
}

// terapkan pose ke ref badan (dipakai di dermaga dan pratinjau avatar)
export function applyPose(refs, s) {
  refs.body.current.position.set(s.x, s.y, 0);
  refs.body.current.rotation.z = s.rz;
  refs.body.current.scale.setScalar(s.scale);
  refs.head.current.rotation.z = s.headZ;
  refs.head.current.rotation.x = s.headX;
  refs.al.current.rotation.set(s.aLx, 0, s.aL);
  refs.ar.current.rotation.set(s.aRx, 0, s.aR);
  refs.ll.current.rotation.x = s.lL;
  refs.lr.current.rotation.x = s.lR;
}

export function useCrewRefs() {
  return { body: useRef(), head: useRef(), al: useRef(), ar: useRef(), ll: useRef(), lr: useRef(), eyes: useRef(), detail: useRef(), item: useRef() };
}

function StatusTag({ walker, p, isMe }) {
  const dept = DEPTS[p.dept];
  const pose = POSE_ALIAS[walker.pose] || walker.pose;
  const doing = walker.state === 'dance' ? `joget ${POSE_BY_ID[pose]?.name || ''}` : walker.state === 'walk' ? 'jalan-jalan' : 'santai';
  return (
    <div className={`agent-tag staff-tag${isMe ? ' is-me' : ''}`}>
      <strong>{isMe ? `${p.name || 'Anda'} (Anda)` : p.name}</strong>
      <span>
        {dept?.short} · {doing}
      </span>
    </div>
  );
}

// gelombang suara di atas kepala saat staff bicara di obrolan kedai
function TalkBadge({ id }) {
  const talking = usePlaza((s) => s.talking.includes(id));
  if (!talking) return null;
  return (
    <Html position={[0, 1.95, 0]} center style={{ pointerEvents: 'none' }} zIndexRange={[19, 0]}>
      <div className="talk-badge" aria-label="sedang bicara">
        <i />
        <i />
        <i />
      </div>
    </Html>
  );
}

// avatar staff statis/dikendalikan pose (Ruang Tatami & pratinjau)
export function StaffFigure({ profile, pose = 'idle', speed = 1 }) {
  const p = useMemo(() => normalizeProfile(profile), [profile]);
  const look = useMemo(() => lookOf(p), [p]);
  const refs = useCrewRefs();
  const off = useMemo(() => Math.random() * 10, []);
  useFrame((st) => {
    if (refs.body.current) applyPose(refs, poseState(pose, st.clock.elapsedTime * speed + off));
  });
  return <CrewBody refs={refs} look={look} />;
}

export function StaffAvatar({ walker }) {
  const p = useMemo(() => normalizeProfile(walker.profile), [walker.profile]);
  const look = useMemo(() => lookOf(p), [p]);
  const isMe = walker.id === 'me';
  const g = useRef();
  const refs = useCrewRefs();
  const [hover, setHover] = useState(false);
  const [, force] = useState(0);
  const tagTick = useRef(0);

  useFrame((st, dt) => {
    if (!g.current || !refs.body.current) return;
    g.current.position.copy(walker.pos);
    updateCrewLod(refs, g.current, st.camera);
    let d = walker.facing - g.current.rotation.y;
    d = Math.atan2(Math.sin(d), Math.cos(d));
    g.current.rotation.y += d * Math.min(1, dt * 8);
    applyPose(refs, poseState(walker.pose, st.clock.elapsedTime + walker.t0));
    // label status diperbarui pelan saja supaya tidak re-render tiap frame
    tagTick.current += dt;
    if ((hover || isMe) && tagTick.current > 0.3) {
      tagTick.current = 0;
      force((n) => n + 1);
    }
  });

  return (
    <group
      ref={g}
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
      <CrewBody refs={refs} look={look} />
      <TalkBadge id={walker.id} />
      {(hover || (isMe && walker.state === 'dance')) && (
        <Html position={[0, 2.15, 0]} center style={{ pointerEvents: 'none' }} zIndexRange={[20, 0]}>
          <StatusTag walker={walker} p={p} isMe={isMe} />
        </Html>
      )}
    </group>
  );
}

export function OutdoorStaff() {
  useHive((s) => s.outdoorVersion); // render ulang saat daftar/profil staff berubah
  return outdoor.walkers.map((w) => <StaffAvatar key={`${w.id}-${JSON.stringify(w.profile)}`} walker={w} />);
}
