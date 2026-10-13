import * as THREE from 'three';

// Permukaan halus (bukan low-poly patah-patah) supaya mirip diorama referensi
export const std = (color, extra = {}) =>
  new THREE.MeshStandardMaterial({ color, roughness: 0.68, metalness: 0, flatShading: false, ...extra });

export const M = {
  // trim kayu pernis gelap ala kedai Jepang (nama kunci lama dipertahankan supaya semua komponen tetap jalan)
  gold: std('#4A3524', { roughness: 0.55 }),
  amber: std('#E5483B', { roughness: 0.55 }),
  royal: std('#22324F', { roughness: 0.5 }),
  nectar: std('#D9B98A', { roughness: 0.7 }),
  hoodie: std('#3B82D6', { roughness: 0.45 }),
  cream: std('#F4EBDD', { roughness: 0.85 }),
  creamDark: std('#E6D6BC', { roughness: 0.85 }),
  silver: std('#C0C5CE', { metalness: 0.35, roughness: 0.4 }),
  graphite: std('#2B2B2E'),
  brown: std('#3A2A1C'),
  honeyDark: std('#5A3B24'),
  wood: std('#B98A5A'),
  pink: std('#FF9E9E'),
  white: std('#FFFFFF'),
  leaf: std('#6FA84A', { roughness: 0.8 }),
  leafDark: std('#3F7A3C', { roughness: 0.85 }),
  pine: std('#2F6B3A', { roughness: 0.85 }),
  pineLight: std('#4E8C46', { roughness: 0.85 }),
  pot: std('#3A3F4A', { roughness: 0.5 }),
  terracotta: std('#C9783C', { roughness: 0.75 }),
  rug: std('#B9C07A', { roughness: 0.95 }),
  rugInner: std('#D3D89C', { roughness: 0.95 }),
  sofa: std('#2E4A7D', { roughness: 0.8 }),
  cloud: std('#FFFFFF', { roughness: 1, emissive: '#E8F0FF', emissiveIntensity: 0.45 }),
  lantern: std('#FF8A6A', { emissive: '#E5483B', emissiveIntensity: 2.0, roughness: 0.3 }),
  grass: std('#A9C77A'),
  earth: std('#B8B0A2'),
  earthDark: std('#8F877A'),
  stone: std('#D9D2C5'),
  screen: std('#9CC8FF', { emissive: '#3B82D6', emissiveIntensity: 0.6 }),
  led: std('#FFE2B0', { emissive: '#FF9A6B', emissiveIntensity: 1.4 }),
  ledGreen: std('#B6E07A', { emissive: '#8DCB45', emissiveIntensity: 1.2 }),
  // "mutiara naga": efek misi dari Ryu (pengganti tetes madu)
  honey: std('#7CC0FF', { emissive: '#3B82D6', emissiveIntensity: 0.7, roughness: 0.2 }),
  // khas kedai
  tile: std('#2B3445', { roughness: 0.6 }),
  tileEdge: std('#1C2333', { roughness: 0.6 }),
  shoji: std('#FFF6E8', { roughness: 0.9, emissive: '#FFC89A', emissiveIntensity: 0.12 }),
  tatami: std('#C9CF8F', { roughness: 0.95 }),
  noren: std('#22324F', { roughness: 0.9, side: THREE.DoubleSide }),
  red: std('#C8352A', { roughness: 0.6 }),
  dragon: std('#3B82D6', { roughness: 0.45 }),
  dragonDark: std('#2559A8', { roughness: 0.5 }),
  belly: std('#F7E7C6', { roughness: 0.7 }),
  horn: std('#F4E2B8', { roughness: 0.5 }),
  water: new THREE.MeshStandardMaterial({ color: '#2F6FA8', roughness: 0.18, metalness: 0.15, transparent: true, opacity: 0.88 }),
  waterDeep: std('#1E4F7E', { roughness: 0.3 }),
  sand: std('#E7D7B5', { roughness: 0.95 }),
  glass: new THREE.MeshStandardMaterial({
    color: '#F4F8FF',
    transparent: true,
    opacity: 0.2,
    roughness: 0.1,
    metalness: 0.1,
    depthWrite: false,
  }),
  holo: new THREE.MeshStandardMaterial({
    color: '#9CC8FF',
    emissive: '#3B82D6',
    emissiveIntensity: 0.7,
    transparent: true,
    opacity: 0.5,
    side: THREE.DoubleSide,
    depthWrite: false,
  }),
  window: std('#FFF1D6', { emissive: '#FFB37A', emissiveIntensity: 0.15 }),
  skinBee: std('#F7E7C6'),
  hairBee: std('#F4E2B8'),
  mute: new THREE.MeshBasicMaterial({ color: '#E24B4A' }),
  sky: std('#DCEBF7', { emissive: '#BFD9F2', emissiveIntensity: 0.5 }),
  zzz: new THREE.MeshBasicMaterial({ color: '#BFD3FF', transparent: true, opacity: 0.9 }),
  doorGlass: new THREE.MeshStandardMaterial({
    color: '#FFF6E8',
    transparent: true,
    opacity: 0.55,
    roughness: 0.1,
    metalness: 0.2,
  }),
  wing: new THREE.MeshStandardMaterial({
    color: '#9CCBFF',
    transparent: true,
    opacity: 0.85,
    roughness: 0.2,
    side: THREE.DoubleSide,
  }),
};

export const HEX_START = Math.PI / 2; // thetaStart agar heksagon flat-top (titik sudut di +x)

export const Box = ({ p = [0, 0, 0], s = [1, 1, 1], r, m = M.cream, shadow = true }) => (
  <mesh position={p} rotation={r} material={m} castShadow={shadow} receiveShadow>
    <boxGeometry args={s} />
  </mesh>
);

export const Cyl = ({ p = [0, 0, 0], a = [0.5, 0.5, 1, 12], r, m = M.cream, shadow = true }) => (
  <mesh position={p} rotation={r} material={m} castShadow={shadow} receiveShadow>
    <cylinderGeometry args={a} />
  </mesh>
);

export const Hex = ({ p = [0, 0, 0], rad = 0.5, h = 0.1, r, m = M.gold, shadow = true }) => (
  <mesh position={p} rotation={r} material={m} castShadow={shadow} receiveShadow>
    <cylinderGeometry args={[rad, rad, h, 6, 1, false, HEX_START]} />
  </mesh>
);

export const Sph = ({ p = [0, 0, 0], rad = 0.5, sc, m = M.cream, seg = [12, 10], shadow = true }) => (
  <mesh position={p} scale={sc} material={m} castShadow={shadow}>
    <sphereGeometry args={[rad, seg[0], seg[1]]} />
  </mesh>
);

export const Cone = ({ p = [0, 0, 0], a = [0.5, 1, 8], r, m = M.leaf }) => (
  <mesh position={p} rotation={r} material={m} castShadow receiveShadow>
    <coneGeometry args={a} />
  </mesh>
);
