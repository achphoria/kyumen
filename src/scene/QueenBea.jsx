// Ryu: Chief Kyuka Ramen. Pemilik kedai berkimono putih dan haori navy berlapis merah, rambut chonmage,
// sedikit lebih besar dari kru lain, dengan naga biru kecil (maskot brand) melayang di bahunya.
// Dipakai di gedung kedai (KyuWorker) dan di Ruang Tatami (BeeFigure).
// Ref animasi (badan, kepala, lengan, kaki, mata, naga) dipegang komponen induk.
import { CrewBody, MiniDragon, agentLook } from './Crew';

const LOOK = agentLook({ id: 'ceo' });

export function RyuModel({ refs = {}, thinking = false }) {
  return (
    <group scale={1.12}>
      <CrewBody refs={refs} look={{ ...LOOK, expr: thinking ? 'chill' : LOOK.expr }} ai />
      <group position={[0.46, 1.42, -0.05]}>
        <MiniDragon dragonRef={refs.dragon} />
      </group>
    </group>
  );
}
