// Komponen dunia yang dipakai bersama: agent (naga & tamu), efek misi, dan kamera.
// Bangunan, tebing, dan awan KYUMEN Holding ada di Holding.jsx.
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { AGENTS, GUESTS, tierOf } from '../data/hive';
import { useHive } from '../sim/store';
import { world } from '../sim/engine';
import { M, std } from './materials';
import { KyuWorker } from './HiveWorker';

const SAKURA = std('#F6B8C8', { roughness: 0.85 });

export function Agents() {
  return [...AGENTS, ...GUESTS].map((def) => <KyuWorker key={def.id} def={def} />);
}

/* ---------- efek misi: mutiara naga & percikan kelopak ---------- */

const bez = new THREE.Vector3();
const dropGeo = new THREE.SphereGeometry(0.34, 16, 12);
const petalGeo = new THREE.SphereGeometry(0.16, 8, 6);
export function Effects() {
  const drops = useRef([]);
  const bursts = useRef([]);
  useFrame(() => {
    const floor = useHive.getState().floor;
    const showY = (y) => floor === 'all' || tierOf(y) <= floor;
    const ds = world.effects.filter((e) => e.type === 'drop');
    drops.current.forEach((m, i) => {
      if (!m) return;
      const e = ds[i];
      if (!e) {
        m.visible = false;
        return;
      }
      const k = Math.min(1, e.t / e.dur);
      const ctrl = e.from.clone().add(e.to).multiplyScalar(0.5);
      ctrl.y = Math.max(e.from.y, e.to.y) + 6;
      const u = 1 - k;
      bez.set(0, 0, 0)
        .addScaledVector(e.from, u * u)
        .addScaledVector(ctrl, 2 * u * k)
        .addScaledVector(e.to, k * k);
      m.position.copy(bez);
      m.scale.setScalar(1 + Math.sin(k * Math.PI) * 0.3);
      m.visible = showY(bez.y);
    });
    const bs = world.effects.filter((e) => e.type === 'burst');
    bursts.current.forEach((grp, i) => {
      if (!grp) return;
      const e = bs[i];
      if (!e) {
        grp.visible = false;
        return;
      }
      const k = e.t / e.dur;
      grp.visible = showY(e.at.y);
      grp.position.copy(e.at);
      grp.children.forEach((c, j) => {
        const d = e.dirs[j];
        c.position.set(d.x * k * 2.6, d.y * k * 3 - 3 * k * k, d.z * k * 2.6);
        c.scale.set(Math.max(0.01, 1 - k), Math.max(0.01, 1 - k) * 0.3, Math.max(0.01, 1 - k));
        c.rotation.set(k * 6, k * 4, 0);
      });
    });
  });
  return (
    <group>
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <mesh key={i} ref={(el) => (drops.current[i] = el)} visible={false} geometry={dropGeo} material={M.honey} />
      ))}
      {[0, 1, 2, 3].map((i) => (
        <group key={i} ref={(el) => (bursts.current[i] = el)} visible={false}>
          {Array.from({ length: 14 }, (_, j) => (
            <mesh key={j} geometry={petalGeo} material={j % 2 ? SAKURA : M.honey} />
          ))}
        </group>
      ))}
    </group>
  );
}

/* ---------- kamera ---------- */

export function CameraRig() {
  const { camera, controls } = useThree();
  const focus = useHive((s) => s.focus);
  const anim = useRef(null);

  useEffect(() => {
    // layar tegak (HP) butuh kamera sedikit lebih jauh; holding tinggi & ramping, jadi cukup akar rasionya
    const fit = Math.sqrt(Math.max(1, 0.75 / camera.aspect));
    anim.current = {
      target: new THREE.Vector3(...focus.target),
      dist: focus.dist * fit,
      dir: focus.dir ? new THREE.Vector3(...focus.dir).normalize() : null,
      t: 0,
    };
  }, [focus.key]);

  useEffect(() => {
    if (!controls) return;
    const stop = () => (anim.current = null);
    controls.addEventListener('start', stop);
    return () => controls.removeEventListener('start', stop);
  }, [controls]);

  useFrame((_, dt) => {
    if (!controls || !anim.current) return;
    const k = 1 - Math.exp(-dt * 3.2);
    controls.target.lerp(anim.current.target, k);
    if (anim.current.dir) {
      const goal = anim.current.target.clone().addScaledVector(anim.current.dir, anim.current.dist);
      camera.position.lerp(goal, k);
    } else {
      const dir = camera.position.clone().sub(controls.target);
      const d = dir.length();
      dir.normalize();
      camera.position.copy(controls.target).addScaledVector(dir, d + (anim.current.dist - d) * k);
    }
    anim.current.t += dt;
    if (anim.current.t > 2.5) anim.current = null;
    controls.update();
  });
  return null;
}

