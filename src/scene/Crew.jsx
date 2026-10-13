// Karakter "kru kedai ramen" bergaya chibi: dipakai 18 agent AI, Ryu, dan avatar staff manusia.
// Dibuat hemat: geometri & material dipakai bersama, hanya badan dan kepala yang membuat bayangan.
// Ref animasi (badan, kepala, lengan, kaki, mata) dipegang komponen induk.
import * as THREE from 'three';
import { M } from './materials';

/* ---------- geometri & material bersama ---------- */

const G = {
  sph: new THREE.SphereGeometry(1, 14, 10),
  sphLo: new THREE.SphereGeometry(1, 8, 6),
  cyl: new THREE.CylinderGeometry(1, 1, 1, 12),
  cylLo: new THREE.CylinderGeometry(1, 1, 1, 8),
  box: new THREE.BoxGeometry(1, 1, 1),
  torso: new THREE.CylinderGeometry(0.25, 0.33, 0.62, 14),
  sleeve: new THREE.CylinderGeometry(0.075, 0.12, 0.3, 8),
  cap: new THREE.SphereGeometry(0.41, 14, 8, 0, Math.PI * 2, 0, 1.3),
  bowl: new THREE.SphereGeometry(1, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2),
  band: new THREE.TorusGeometry(0.4, 0.045, 6, 20),
};

const matCache = new Map();
export function mat(color, extra) {
  const key = color + (extra ? JSON.stringify(extra) : '');
  if (!matCache.has(key)) matCache.set(key, new THREE.MeshStandardMaterial({ color, roughness: 0.75, ...extra }));
  return matCache.get(key);
}

// potongan dasar: mesh dengan geometri bersama, diskalakan
function P({ g = G.sph, m, p = [0, 0, 0], s = [1, 1, 1], r, shadow = false }) {
  return <mesh geometry={g} material={m} position={p} scale={s} rotation={r} castShadow={shadow} />;
}

/* ---------- rambut ---------- */

function Hair({ type, m }) {
  const cap = <mesh geometry={G.cap} material={m} position={[0, 0.03, -0.02]} rotation={[-0.25, 0, 0]} />;
  switch (type) {
    case 'bald':
      return null;
    case 'bun': // sanggul di atas kepala
      return (
        <group>
          {cap}
          <P m={m} p={[0, 0.42, -0.08]} s={[0.15, 0.13, 0.15]} />
        </group>
      );
    case 'pony':
      return (
        <group>
          {cap}
          <P m={m} p={[0, 0.06, -0.42]} s={[0.12, 0.2, 0.12]} r={[0.5, 0, 0]} />
        </group>
      );
    case 'bob':
      return (
        <group>
          {cap}
          <P m={m} p={[0, -0.08, -0.06]} s={[0.43, 0.3, 0.4]} />
        </group>
      );
    case 'spiky':
      return (
        <group>
          {cap}
          {[-0.18, 0, 0.18].map((x) => (
            <mesh key={x} material={m} position={[x, 0.36, 0.05]} rotation={[0.3, 0, -x * 1.5]}>
              <coneGeometry args={[0.09, 0.22, 5]} />
            </mesh>
          ))}
        </group>
      );
    case 'topknot': // chonmage ala Ryu
      return (
        <group>
          {cap}
          <P g={G.cylLo} m={m} p={[0, 0.45, -0.04]} s={[0.05, 0.22, 0.05]} r={[1.2, 0, 0]} />
        </group>
      );
    default: // short
      return cap;
  }
}

/* ---------- penutup kepala ---------- */

function Headwear({ type, color }) {
  switch (type) {
    case 'hachimaki':
      return (
        <group position={[0, 0.14, 0]}>
          <mesh geometry={G.band} material={M.white} rotation={[Math.PI / 2 - 0.1, 0, 0]} />
          <P m={mat('#E5483B')} p={[0, 0.03, 0.41]} s={[0.06, 0.06, 0.02]} />
          <P g={G.box} m={M.white} p={[0.06, -0.05, -0.43]} s={[0.05, 0.16, 0.02]} r={[0.3, 0, 0.5]} />
        </group>
      );
    case 'bandana':
      return <mesh geometry={G.cap} material={mat(color || '#22324F')} position={[0, 0.06, -0.02]} rotation={[-0.35, 0, 0]} scale={1.04} />;
    case 'towel': // tenugui diikat
      return (
        <group position={[0, 0.2, 0]}>
          <mesh geometry={G.band} material={mat('#F4EBDD')} rotation={[Math.PI / 2 - 0.25, 0, 0]} scale={[1, 1, 1.6]} />
          <P m={mat('#3B82D6')} p={[0, 0.02, 0.41]} s={[0.12, 0.04, 0.03]} />
        </group>
      );
    case 'chefhat':
      return (
        <group position={[0, 0.34, -0.02]}>
          <P g={G.cyl} m={M.white} s={[0.29, 0.18, 0.29]} />
          <P m={M.white} p={[0, 0.2, 0]} s={[0.33, 0.24, 0.33]} />
        </group>
      );
    case 'cap':
      return (
        <group position={[0, 0.08, 0]} rotation={[-0.12, 0, 0]}>
          <mesh geometry={G.bowl} material={mat(color || '#22324F')} scale={0.43} />
          <P g={G.box} m={mat(color || '#22324F')} p={[0, 0.01, 0.4]} s={[0.4, 0.03, 0.24]} />
          <P m={mat('#E5483B')} p={[0, 0.2, 0.36]} s={[0.07, 0.07, 0.02]} />
        </group>
      );
    case 'headset':
      return (
        <group>
          <mesh material={M.graphite} rotation={[0, 0, 0]}>
            <torusGeometry args={[0.42, 0.03, 6, 16, Math.PI]} />
          </mesh>
          {[-1, 1].map((sx) => (
            <P key={sx} g={G.cylLo} m={M.graphite} p={[sx * 0.42, 0, 0]} s={[0.1, 0.08, 0.1]} r={[0, 0, Math.PI / 2]} />
          ))}
          <P g={G.box} m={M.graphite} p={[0.34, -0.16, 0.2]} s={[0.03, 0.03, 0.28]} r={[0, -0.8, 0]} />
        </group>
      );
    case 'beret':
      return <P g={G.cyl} m={mat(color || '#22324F')} p={[0.06, 0.36, -0.02]} s={[0.36, 0.1, 0.36]} r={[0, 0, -0.3]} />;
    default:
      return null;
  }
}

/* ---------- wajah ---------- */

function Face({ expr = 'happy', eyesRef, ai }) {
  const eye = ai ? mat('#22324F', { emissive: '#3B82D6', emissiveIntensity: 0.6 }) : M.graphite;
  const ey = expr === 'chill' ? 0.3 : expr === 'happy' ? 0.6 : 1;
  return (
    <group>
      <group ref={eyesRef}>
        <P m={eye} p={[-0.13, 0.02, 0.36]} s={[0.05, 0.05 * ey, 0.04]} />
        <P m={eye} p={[0.13, 0.02, 0.36]} s={[0.05, expr === 'wink' ? 0.01 : 0.05 * ey, 0.04]} />
      </group>
      <P m={M.pink} p={[-0.23, -0.08, 0.31]} s={[0.055, 0.032, 0.03]} />
      <P m={M.pink} p={[0.23, -0.08, 0.31]} s={[0.055, 0.032, 0.03]} />
      {expr === 'hype' ? (
        <P m={M.brown} p={[0, -0.13, 0.36]} s={[0.06, 0.045, 0.03]} />
      ) : (
        <P g={G.box} m={M.brown} p={[0, -0.12, 0.38]} s={[expr === 'chill' ? 0.08 : 0.1, 0.018, 0.01]} />
      )}
    </group>
  );
}

/* ---------- pakaian ---------- */

function Outfit({ type, color }) {
  const c = mat(color);
  const torso = <mesh geometry={G.torso} material={c} position={[0, 0.56, 0]} castShadow />;
  switch (type) {
    case 'apron': // kaos + celemek kedai
      return (
        <group>
          {torso}
          <P g={G.box} m={mat('#F4EBDD')} p={[0, 0.5, 0.27]} s={[0.4, 0.5, 0.03]} r={[-0.08, 0, 0]} />
          <P g={G.box} m={mat('#F4EBDD')} p={[0, 0.78, 0.22]} s={[0.04, 0.18, 0.02]} />
          <P m={mat('#E5483B')} p={[0, 0.5, 0.29]} s={[0.06, 0.06, 0.01]} />
        </group>
      );
    case 'chef': // baju koki putih dua baris kancing
      return (
        <group>
          <mesh geometry={G.torso} material={M.white} position={[0, 0.56, 0]} castShadow />
          {[0.72, 0.6, 0.48].map((y) => [-0.07, 0.07].map((x) => <P key={`${x}${y}`} m={c} p={[x, y, 0.3 - (0.72 - y) * 0.12]} s={[0.025, 0.025, 0.02]} />))}
          <P g={G.cylLo} m={c} p={[0, 0.85, 0]} s={[0.24, 0.05, 0.24]} />
        </group>
      );
    case 'jinbei': // setelan santai Jepang dengan tali
      return (
        <group>
          {torso}
          <P g={G.box} m={mat('#F4EBDD')} p={[0.05, 0.62, 0.29]} s={[0.03, 0.36, 0.01]} r={[0, 0, 0.35]} />
          <P g={G.box} m={mat('#F4EBDD')} p={[0.04, 0.54, 0.31]} s={[0.12, 0.02, 0.01]} />
        </group>
      );
    case 'kimono':
      return (
        <group>
          <mesh geometry={G.torso} material={c} position={[0, 0.5, 0]} scale={[1.05, 1.2, 1.05]} castShadow />
          <P g={G.cyl} m={mat('#F4EBDD')} p={[0, 0.5, 0]} s={[0.3, 0.1, 0.3]} />
          <P g={G.box} m={mat('#F4EBDD')} p={[0.05, 0.74, 0.27]} s={[0.025, 0.24, 0.01]} r={[0, 0, 0.4]} />
        </group>
      );
    case 'haori': // Ryu: kimono putih + haori navy berlapis merah
      return (
        <group>
          <mesh geometry={G.torso} material={M.white} position={[0, 0.56, 0]} castShadow />
          <mesh position={[0, 0.54, 0]} material={mat('#1C2F5A', { side: THREE.DoubleSide })} castShadow>
            <cylinderGeometry args={[0.29, 0.39, 0.72, 16, 1, true, 0.55, Math.PI * 2 - 1.1]} />
          </mesh>
          <P g={G.box} m={mat('#E5483B')} p={[-0.15, 0.6, 0.28]} s={[0.04, 0.5, 0.02]} r={[0, 0.4, -0.2]} />
          <P g={G.box} m={mat('#E5483B')} p={[0.15, 0.6, 0.28]} s={[0.04, 0.5, 0.02]} r={[0, -0.4, 0.2]} />
          <P m={mat('#F2B630', { metalness: 0.5, roughness: 0.3 })} p={[0, 0.66, 0.3]} s={[0.04, 0.04, 0.03]} />
        </group>
      );
    default: // happi: jaket kedai dengan kerah putih & obi
      return (
        <group>
          {torso}
          <P g={G.box} m={M.white} p={[-0.07, 0.64, 0.28]} s={[0.05, 0.4, 0.02]} r={[0, 0.2, -0.25]} />
          <P g={G.box} m={M.white} p={[0.07, 0.64, 0.28]} s={[0.05, 0.4, 0.02]} r={[0, -0.2, 0.25]} />
          <P g={G.cyl} m={mat('#22324F')} p={[0, 0.4, 0]} s={[0.335, 0.07, 0.335]} />
        </group>
      );
  }
}

/* ---------- barang tambahan ---------- */

function Extra({ type }) {
  switch (type) {
    case 'glasses':
      return (
        <group position={[0, 0.03, 0.38]}>
          {[-0.13, 0.13].map((x) => (
            <mesh key={x} material={M.graphite} position={[x, 0, 0]}>
              <torusGeometry args={[0.075, 0.014, 5, 12]} />
            </mesh>
          ))}
          <P g={G.box} m={M.graphite} p={[0, 0.01, 0]} s={[0.1, 0.018, 0.018]} />
        </group>
      );
    case 'mask':
      return <P m={M.white} p={[0, -0.1, 0.3]} s={[0.24, 0.13, 0.12]} />;
    case 'pen': // pena terselip di telinga
      return <P g={G.cylLo} m={mat('#E5483B')} p={[0.38, 0.04, 0.05]} s={[0.018, 0.2, 0.018]} r={[0.4, 0, 0.3]} />;
    default:
      return null;
  }
}

// barang di tangan kanan
function HandItem({ type }) {
  if (type === 'ladle')
    return (
      <group position={[0, -0.36, 0.06]} rotation={[1.2, 0, 0]}>
        <P g={G.cylLo} m={M.wood} p={[0, 0.16, 0]} s={[0.018, 0.34, 0.018]} />
        <mesh geometry={G.bowl} material={M.silver} position={[0, 0, 0]} rotation={[Math.PI, 0, 0]} scale={0.07} />
      </group>
    );
  if (type === 'bowl')
    return (
      <group position={[0, -0.36, 0.1]}>
        <mesh geometry={G.bowl} material={mat('#C8352A')} rotation={[Math.PI, 0, 0]} scale={[0.12, 0.08, 0.12]} />
        <P g={G.cylLo} m={M.nectar} p={[0, -0.005, 0]} s={[0.11, 0.01, 0.11]} />
      </group>
    );
  if (type === 'tablet')
    return <P g={G.box} m={mat('#22324F', { emissive: '#3B82D6', emissiveIntensity: 0.4 })} p={[0, -0.36, 0.08]} s={[0.16, 0.22, 0.02]} r={[-0.6, 0, 0]} />;
  return null;
}

/* ---------- naga kecil pendamping Ryu (maskot brand) ---------- */

export function MiniDragon({ dragonRef }) {
  const blue = mat('#3B82D6');
  const belly = mat('#F7E7C6');
  return (
    <group ref={dragonRef}>
      <P m={blue} s={[0.13, 0.11, 0.17]} />
      <P m={belly} p={[0, -0.02, 0.08]} s={[0.08, 0.07, 0.08]} />
      <P m={blue} p={[0, 0.1, 0.13]} s={[0.1, 0.09, 0.1]} />
      <P m={M.graphite} p={[-0.045, 0.12, 0.21]} s={[0.018, 0.022, 0.015]} />
      <P m={M.graphite} p={[0.045, 0.12, 0.21]} s={[0.018, 0.022, 0.015]} />
      {[-1, 1].map((sx) => (
        <mesh key={sx} material={mat('#F4E2B8')} position={[sx * 0.05, 0.2, 0.1]} rotation={[-0.3, 0, -sx * 0.4]}>
          <coneGeometry args={[0.02, 0.07, 5]} />
        </mesh>
      ))}
      <P m={mat('#9CCBFF', { transparent: true, opacity: 0.85 })} p={[0, 0.06, -0.06]} s={[0.2, 0.02, 0.08]} r={[0, 0, 0.3]} />
      <P m={blue} p={[0, -0.04, -0.2]} s={[0.05, 0.04, 0.1]} r={[0.5, 0, 0]} />
    </group>
  );
}

/* ---------- badan lengkap ---------- */

// look: { skin, hair, hairColor, outfit, outfitColor, headwear, headwearColor, extra, hand, expr }
// refs: { body, head, al, ar, ll, lr, eyes, detail, item }
export function CrewBody({ refs = {}, look, ai = false }) {
  const skin = mat(look.skin || '#F1C27D');
  const hair = mat(look.hairColor || '#2B2B2E');
  const sleeve = mat(look.outfit === 'chef' ? '#FFFFFF' : look.outfit === 'haori' ? '#1C2F5A' : look.outfitColor || '#22324F');
  const pants = mat(look.outfit === 'chef' ? '#2B2B2E' : '#22324F');
  return (
    <group ref={refs.body}>
      {/* kaki: celana + sandal geta */}
      {[
        [-0.11, refs.ll],
        [0.11, refs.lr],
      ].map(([x, ref]) => (
        <group key={x} ref={ref} position={[x, 0.26, 0]}>
          <P g={G.cylLo} m={pants} p={[0, -0.09, 0]} s={[0.075, 0.18, 0.075]} />
          <P g={G.box} m={M.wood} p={[0, -0.24, 0.03]} s={[0.12, 0.035, 0.22]} />
        </group>
      ))}
      <Outfit type={look.outfit} color={look.outfitColor || '#22324F'} />
      {/* lengan lebar + tangan */}
      <group ref={refs.al} position={[-0.3, 0.8, 0]}>
        <P g={G.sleeve} m={sleeve} p={[0, -0.15, 0]} />
        <P m={skin} p={[0, -0.33, 0]} s={[0.07, 0.07, 0.07]} />
      </group>
      <group ref={refs.ar} position={[0.3, 0.8, 0]}>
        <P g={G.sleeve} m={sleeve} p={[0, -0.15, 0]} />
        <P m={skin} p={[0, -0.33, 0]} s={[0.07, 0.07, 0.07]} />
        <group ref={refs.item}>
          <HandItem type={look.hand} />
        </group>
      </group>
      {/* kepala */}
      <group ref={refs.head} position={[0, 1.18, 0]}>
        <mesh geometry={G.sph} material={skin} scale={0.4} castShadow />
        <Hair type={look.hair} m={hair} />
        {/* detail wajah: disembunyikan saat kamera jauh (lihat useCrewLod) */}
        <group ref={refs.detail}>
          <Face expr={look.expr} eyesRef={refs.eyes} ai={ai} />
          <Extra type={look.extra} />
        </group>
        <Headwear type={look.headwear} color={look.headwearColor} />
      </group>
    </group>
  );
}

/* ---------- tampilan agent AI ---------- */

const HAIR_CYCLE = ['short', 'bun', 'spiky', 'bob', 'pony'];
const SKIN_TONES = ['#FFE0BD', '#F1C27D', '#E0AC69', '#C68642'];
const HAIR_TONES = ['#2B2B2E', '#3A2A1C', '#6B4416', '#2B2B2E'];
// penutup kepala & barang per peran
const ROLE_LOOK = {
  store_mgr: { headwear: 'hachimaki', outfit: 'happi', hand: 'tablet' },
  trainer: { headwear: 'hachimaki', outfit: 'happi', hand: 'ladle', extra: 'glasses' },
  store_plan: { headwear: 'towel', outfit: 'happi', hand: 'tablet' },
  cs: { headwear: 'headset', outfit: 'apron' },
  ck_mgr: { headwear: 'chefhat', outfit: 'chef', hand: 'ladle' },
  sc_mgr: { headwear: 'cap', outfit: 'apron', hand: 'tablet' },
  sc_plan: { headwear: 'bandana', outfit: 'apron' },
  content: { headwear: 'beret', outfit: 'jinbei', hand: 'tablet' },
  design: { headwear: 'beret', outfit: 'jinbei' },
  ads: { headwear: 'cap', outfit: 'jinbei' },
  social: { headwear: 'none', outfit: 'jinbei', extra: 'pen' },
  accounting: { headwear: 'none', outfit: 'kimono', extra: 'glasses' },
  cost: { headwear: 'towel', outfit: 'kimono', hand: 'bowl' },
  sales: { headwear: 'none', outfit: 'kimono', hand: 'tablet' },
  hr_mgr: { headwear: 'none', outfit: 'kimono', extra: 'glasses' },
  recruit: { headwear: 'bandana', outfit: 'happi' },
  payroll: { headwear: 'none', outfit: 'happi', extra: 'pen' },
  culture: { headwear: 'hachimaki', outfit: 'happi' },
};

export function agentLook(def, deptColor, index = 0) {
  if (def.id === 'ceo')
    return { skin: '#F1C27D', hair: 'topknot', hairColor: '#1E1E22', outfit: 'haori', outfitColor: '#1C2F5A', headwear: 'none', expr: 'happy' };
  if (def.guest)
    return { skin: SKIN_TONES[def.skin % 4], hair: HAIR_CYCLE[(def.skin + 2) % 5], hairColor: HAIR_TONES[def.skin % 4], outfit: 'jinbei', outfitColor: '#9FB4C8', headwear: 'none', expr: 'happy' };
  const role = ROLE_LOOK[def.id] || {};
  return {
    skin: SKIN_TONES[def.skin % 4],
    hair: HAIR_CYCLE[index % 5],
    hairColor: HAIR_TONES[(index + def.skin) % 4],
    outfit: role.outfit || 'happi',
    outfitColor: deptColor,
    headwear: role.headwear || 'none',
    headwearColor: deptColor,
    extra: role.extra || 'none',
    hand: role.hand || 'none',
    expr: index % 3 === 0 ? 'happy' : index % 3 === 1 ? 'hype' : 'chill',
  };
}

// LOD sederhana: detail kecil (mata, pipi, mulut, kacamata, barang di tangan) hanya digambar
// saat kamera cukup dekat. Dari jauh tidak terlihat, tapi menghemat ratusan draw call.
const _p = new THREE.Vector3();
export const LOD_NEAR = 34;
export function updateCrewLod(refs, group, camera) {
  if (!group) return;
  group.getWorldPosition(_p);
  const near = _p.distanceToSquared(camera.position) < LOD_NEAR * LOD_NEAR;
  if (refs.detail?.current && refs.detail.current.visible !== near) refs.detail.current.visible = near;
  if (refs.item?.current && refs.item.current.visible !== near) refs.item.current.visible = near;
}
