// "Sutradara kamera" mode TV: kamera hanya berkeliling KYUMEN Holding (tidak mengikuti karakter).
// Bergantian: ayunan lebar di depan tebing, tur per lantai, crane naik dari kaki tebing ke puncak,
// dan putaran pelan di sekitar naga penjaga.
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { TIERS, tierY, TOP_TIER } from '../data/hive';
import { useHive } from '../sim/store';
import { useTv } from '../sim/tv';

const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
const rand = (a, b) => a + Math.random() * (b - a);
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const CENTER = [4, 12, -2]; // titik tengah tebing + tebing seberang
const FRONT = Math.PI / 2; // arah depan (z positif)

const setFloor = (floor) => {
  if (useHive.getState().floor !== floor) useHive.setState({ floor, selectedRoom: null });
};

// ayunan lebar di busur depan (sisi belakang tebing hanya batu)
function orbitShot() {
  setFloor('all');
  const phase = rand(0, Math.PI * 2);
  useTv.setState({ caption: { type: 'orbit', kicker: 'Kyuka Ramen', title: 'KYUMEN Holding', sub: 'Kantor 19 agent AI di atas awan' } });
  return {
    type: 'orbit',
    dur: rand(16, 20),
    t: 0,
    frame(sh) {
      const a = FRONT + 0.2 + Math.sin(phase + sh.t * 0.08) * 0.85;
      return { pos: V(CENTER[0] + Math.cos(a) * 84, 26 + Math.sin(sh.t * 0.2) * 4, CENTER[2] + Math.sin(a) * 84), target: V(...CENTER) };
    },
  };
}

function floorShot() {
  const tier = pick(TIERS);
  setFloor(tier.id);
  const a0 = FRONT + rand(-0.6, 0.6);
  const y = tierY(tier.id);
  useTv.setState({ caption: { type: 'floor', kicker: 'Tur lantai', title: tier.name, sub: tier.sub } });
  return {
    type: 'floor',
    dur: rand(12, 15),
    t: 0,
    frame(sh) {
      const a = a0 + Math.sin(sh.t * 0.12) * 0.3;
      return { pos: V(Math.cos(a) * 34, y + 9, 1 + Math.sin(a) * 34), target: V(0, y + 1.2, 0) };
    },
  };
}

// crane: naik dari kaki tebing (Bar Ramen) sampai paviliun Ryu
function craneShot() {
  setFloor('all');
  const x = rand(-10, 14);
  useTv.setState({ caption: { type: 'orbit', kicker: 'Dari bawah ke atas', title: 'Lima lantai di muka tebing', sub: 'Bar Ramen sampai paviliun Ryu' } });
  return {
    type: 'crane',
    dur: rand(13, 16),
    t: 0,
    frame(sh) {
      const k = Math.min(1, sh.t / 13);
      const y = -4 + k * (tierY(TOP_TIER) + 6);
      return { pos: V(x, y + 3, 40), target: V(x * 0.3, y, 0) };
    },
  };
}

function dragonShot() {
  setFloor('all');
  const dir = Math.random() < 0.5 ? 1 : -1;
  useTv.setState({ caption: { type: 'orbit', kicker: 'Penjaga holding', title: 'Naga biru Kyumen', sub: 'Melilit naik dari lautan awan' } });
  return {
    type: 'dragon',
    dur: rand(10, 13),
    t: 0,
    frame(sh) {
      const a = FRONT + 0.5 + dir * sh.t * 0.05;
      return { pos: V(30 + Math.cos(a) * 34, 14 + sh.t * 0.4, 4 + Math.sin(a) * 34), target: V(32, 8, 4) };
    },
  };
}

// jenis shot bergantian, tidak mengulang jenis yang sama berturut-turut
function nextShot(prevType) {
  const options = [
    { kind: 'orbit', make: orbitShot },
    { kind: 'floor', make: floorShot },
    { kind: 'crane', make: craneShot },
    { kind: 'dragon', make: dragonShot },
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
