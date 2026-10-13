// "Sutradara kamera" mode TV: kamera hanya berkeliling kantor (tidak mengikuti karakter).
// Bergantian: orbit seluruh kedai, tur per lantai, dan geser pelan menyusuri depan gedung.
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { TIERS, tierY } from '../data/hive';
import { useHive } from '../sim/store';
import { useTv } from '../sim/tv';

const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
const rand = (a, b) => a + Math.random() * (b - a);
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const CENTER = [3, 0, 0]; // titik tengah kedai + gedung samping

const setFloor = (floor) => {
  if (useHive.getState().floor !== floor) useHive.setState({ floor, selectedRoom: null });
};

function orbitShot() {
  setFloor('all');
  const a0 = rand(0, Math.PI * 2);
  const dir = Math.random() < 0.5 ? 1 : -1;
  useTv.setState({ caption: { type: 'orbit', kicker: 'Kyuka Ramen Virtual', title: 'Kedai 仮想店舗', sub: 'Kantor virtual 19 agent AI' } });
  return {
    type: 'orbit',
    dur: rand(16, 20),
    t: 0,
    frame(sh) {
      const a = a0 + sh.t * 0.05 * dir;
      return { pos: V(CENTER[0] + Math.cos(a) * 62, 30 + Math.sin(sh.t * 0.2) * 4, Math.sin(a) * 62), target: V(CENTER[0], 6, 0) };
    },
  };
}

function floorShot() {
  const tier = pick(TIERS);
  setFloor(tier.id);
  // tur dari depan/samping (sisi barat ada teras & tangga)
  const a0 = rand(0.1 * Math.PI, 0.6 * Math.PI);
  const y = tierY(tier.id);
  useTv.setState({ caption: { type: 'floor', kicker: 'Tur lantai', title: tier.name, sub: tier.sub } });
  return {
    type: 'floor',
    dur: rand(12, 15),
    t: 0,
    frame(sh) {
      const a = a0 + sh.t * 0.05;
      return { pos: V(CENTER[0] + Math.cos(a) * 34, y + 20, Math.sin(a) * 34), target: V(CENTER[0], y + 1, 0) };
    },
  };
}

function sweepShot() {
  setFloor('all');
  const dir = Math.random() < 0.5 ? 1 : -1;
  useTv.setState({ caption: { type: 'orbit', kicker: 'Dermaga', title: 'Kyuka Ramen', sub: 'Kedai, Central Kitchen & Main Warehouse' } });
  return {
    type: 'sweep',
    dur: rand(12, 15),
    t: 0,
    frame(sh) {
      const x = -dir * 30 + dir * sh.t * 4.2;
      return { pos: V(x, 14, 44), target: V(x * 0.6, 4, 0) };
    },
  };
}

// jenis shot bergantian, tidak mengulang jenis yang sama berturut-turut
function nextShot(prevType) {
  const options = [
    { kind: 'orbit', make: orbitShot },
    { kind: 'floor', make: floorShot },
    { kind: 'sweep', make: sweepShot },
  ].filter((o) => o.kind !== prevType);
  return pick(options).make();
}

export function TvDirector() {
  const { camera, controls } = useThree();
  const shot = useRef(null);
  const skip = useTv((s) => s.skip);

  // penonton tidak mengendalikan kamera; kembalikan semuanya saat keluar mode TV
  useEffect(() => {
    if (controls) controls.enabled = false;
    return () => {
      if (controls) controls.enabled = true;
      useHive.setState({ floor: 'all' });
      useTv.setState({ caption: null });
    };
  }, [controls]);
  useEffect(() => {
    if (shot.current) shot.current.t = Infinity; // lompat ke shot berikutnya
  }, [skip]);

  useFrame((_, rawDt) => {
    if (!controls) return;
    // tab sempat tidak aktif -> dt bisa sangat besar; batasi supaya shot tidak terlewat
    const dt = Math.min(rawDt, 0.1);
    let s = shot.current;
    if (!s || s.t > s.dur) s = shot.current = nextShot(s?.type);
    s.t += dt;
    const { pos, target } = s.frame(s);
    // awal shot: meluncur pelan; setelah itu bergerak halus
    const k = 1 - Math.exp(-dt * (s.t < 2.5 ? 1.0 : 2.0));
    camera.position.lerp(pos, k);
    controls.target.lerp(target, k);
    controls.update();
  });

  return null;
}
