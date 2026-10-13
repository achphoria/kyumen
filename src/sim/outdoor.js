// Staff manusia yang berjalan-jalan di dermaga depan kedai (outdoor), sesekali berjoget.
import * as THREE from 'three';
import { DEFAULT_POSE, POSE_ALIAS } from '../data/staff';

const GROUND_Y = -2.2;
const WALK = 1.7;
// area jalan: plaza dermaga di depan kedai (di luar gedung, menara, dan tangga Genkan)
const X_MIN = -25;
const X_MAX = 32;
const Z_MIN = 14.5;
const Z_MAX = 23;

export const outdoor = { walkers: [], byId: {} };

function pointNear(from) {
  // titik baru tidak jauh dari posisi sekarang
  const cx = from ? from.x : X_MIN + Math.random() * (X_MAX - X_MIN);
  let x = Math.max(X_MIN, Math.min(X_MAX, cx + (Math.random() - 0.5) * 14));
  const z = Z_MIN + Math.random() * (Z_MAX - Z_MIN);
  if (Math.abs(x) < 3.2 && z < 15.5) x = x < 0 ? -3.8 : 3.8; // jangan berdiri di kaki tangga Genkan
  return new THREE.Vector3(x, GROUND_Y, z);
}

export function upsertWalker(profile) {
  const existing = outdoor.byId[profile.id];
  if (existing) {
    existing.profile = profile;
    return existing;
  }
  const w = {
    id: profile.id,
    profile,
    pos: pointNear(null),
    target: null,
    state: 'idle',
    pose: 'idle',
    timer: 1 + Math.random() * 3,
    facing: Math.random() * Math.PI * 2,
    t0: Math.random() * 10,
  };
  outdoor.walkers.push(w);
  outdoor.byId[w.id] = w;
  return w;
}

export function danceNow(id, pose) {
  const w = outdoor.byId[id];
  if (!w) return;
  w.state = 'dance';
  w.pose = pose;
  w.timer = 7;
  w.target = null;
}

export function updateOutdoor(dt) {
  for (const w of outdoor.walkers) {
    w.timer -= dt;
    if (w.state === 'walk' && w.target) {
      const d = w.target.clone().sub(w.pos);
      const len = d.length();
      if (len < 0.15) {
        w.state = 'idle';
        w.pose = 'idle';
        w.timer = 2 + Math.random() * 4;
      } else {
        w.pos.addScaledVector(d.normalize(), Math.min(len, WALK * dt));
        w.facing = Math.atan2(d.x, d.z);
      }
      continue;
    }
    if (w.timer > 0) continue;
    if (w.state === 'idle' && Math.random() < 0.35) {
      w.state = 'dance';
      w.pose = w.profile.pose === 'idle' ? DEFAULT_POSE : POSE_ALIAS[w.profile.pose] || w.profile.pose;
      w.timer = 5 + Math.random() * 3;
    } else {
      w.state = 'walk';
      w.pose = 'walk';
      w.target = pointNear(w.pos);
    }
  }
}

export function removeWalker(id) {
  const i = outdoor.walkers.findIndex((w) => w.id === id);
  if (i >= 0) outdoor.walkers.splice(i, 1);
  delete outdoor.byId[id];
}
