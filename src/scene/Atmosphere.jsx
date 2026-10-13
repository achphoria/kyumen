// Suasana diorama: kubah langit bergradasi (warnanya diatur siklus siang-malam) dan awan
// empuk di kejauhan di atas laut. Awan = ratusan gumpalan dalam satu InstancedMesh supaya ringan.
import { useLayoutEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { M } from './materials';

export const skyUniforms = {
  top: { value: new THREE.Color('#86BCEB') },
  bottom: { value: new THREE.Color('#E3F0FA') },
};

export function SkyDome() {
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        side: THREE.BackSide,
        depthWrite: false,
        fog: false,
        uniforms: skyUniforms,
        vertexShader: `varying vec3 vPos; void main(){ vPos = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
        fragmentShader: `uniform vec3 top; uniform vec3 bottom; varying vec3 vPos;
          void main(){ float h = smoothstep(-0.15, 0.65, vPos.y); gl_FragColor = vec4(mix(bottom, top, h), 1.0);
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
          }`,
      }),
    [],
  );
  return (
    <mesh material={mat} renderOrder={-1} frustumCulled={false}>
      <sphereGeometry args={[420, 32, 16]} />
    </mesh>
  );
}

function rng(seed) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

// gumpalan awan: [x, y, z, skala]
function buildClouds() {
  const r = rng(42);
  const puffs = [];
  const cluster = (cx, cy, cz, size, n) => {
    for (let i = 0; i < n; i++) {
      const a = r() * Math.PI * 2;
      const d = r() * size * 1.4;
      puffs.push([cx + Math.cos(a) * d, cy + r() * size * 0.5, cz + Math.sin(a) * d * 0.7, size * (0.55 + r() * 0.6)]);
    }
  };
  // awan putih di kejauhan, melayang di atas laut
  for (let i = 0; i < 26; i++) {
    const a = (i / 26) * Math.PI * 2 + r() * 0.15;
    const rad = 120 + r() * 50;
    cluster(Math.cos(a) * rad, 14 + r() * 22, Math.sin(a) * rad, 6 + r() * 7, 7);
  }
  return puffs;
}

export function CloudSea() {
  const ref = useRef();
  const puffs = useMemo(buildClouds, []);
  const geo = useMemo(() => new THREE.IcosahedronGeometry(1, 2), []);
  useLayoutEffect(() => {
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    puffs.forEach(([x, y, z, s], i) => {
      m.compose(new THREE.Vector3(x, y, z), q, new THREE.Vector3(s, s * 0.62, s));
      ref.current.setMatrixAt(i, m);
    });
    ref.current.instanceMatrix.needsUpdate = true;
  }, [puffs]);
  // awan berputar sangat pelan mengelilingi kedai
  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.y += dt * 0.004;
  });
  return <instancedMesh ref={ref} args={[geo, M.cloud, puffs.length]} receiveShadow={false} castShadow={false} />;
}
