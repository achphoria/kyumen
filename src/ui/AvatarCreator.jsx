import { useState } from 'react';
import { DEPTS, DEPT_ORDER as ALL_DEPTS } from '../data/hive';
import { AVATAR_OPTIONS, DEFAULT_PROFILE, DEFAULT_POSE, POSES, normalizeProfile, saveProfile } from '../data/staff';
import { useHive } from '../sim/store';
import { upsertWalker, danceNow } from '../sim/outdoor';
import { AvatarPreview } from './AvatarPreview';
import { go } from './nav';
import { useAuth } from '../sim/auth';
import { updatePresence } from '../sim/presence';

const STAFF_DEPTS = ALL_DEPTS.filter((d) => d !== 'ceo');

function Chips({ field, value, onPick }) {
  return (
    <div className="opts">
      {AVATAR_OPTIONS[field].map(([v, label]) => (
        <button key={v} className={`opt${value === v ? ' on' : ''}`} onClick={() => onPick(v)}>
          {label}
        </button>
      ))}
    </div>
  );
}

function Swatches({ field, value, onPick }) {
  return (
    <div className="opts">
      {AVATAR_OPTIONS[field].map(([v, label]) => (
        <button
          key={v}
          className={`sw${value === v ? ' on' : ''}`}
          style={{ background: v }}
          aria-label={label}
          title={label}
          onClick={() => onPick(v)}
        />
      ))}
    </div>
  );
}

export function AvatarCreator() {
  const saved = useHive((s) => s.profile);
  const account = useAuth((s) => s.account);
  const saveAvatar = useAuth((s) => s.saveAvatar);
  const [p, setP] = useState(() => normalizeProfile(saved || DEFAULT_PROFILE));
  const [preview, setPreview] = useState(() => normalizeProfile(saved).pose);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k) => (v) => setP((old) => ({ ...old, [k]: v }));

  const save = async () => {
    const name = p.name.trim();
    if (!name) {
      setError('Isi nama dulu supaya teman kantor tahu ini kamu.');
      return;
    }
    const pose = p.pose === 'idle' ? DEFAULT_POSE : p.pose;
    if (account) {
      // akun sungguhan: disimpan ke Supabase, divisi tetap dari undangan
      setBusy(true);
      try {
        await saveAvatar({ ...p, name, dept: account.primary_dept });
      } catch (e) {
        setError(e.message);
        setBusy(false);
        return;
      }
      setBusy(false);
    } else {
      const profile = { ...p, name, id: 'me' };
      saveProfile(profile);
      upsertWalker(profile);
      useHive.getState().setProfile(profile);
    }
    danceNow('me', pose);
    setTimeout(() => updatePresence({ pose, danceAt: Date.now() }), 1500);
    go('/');
  };

  return (
    <div className="page">
      <div className="page-inner">
        <div className="page-head">
          <button className="back" onClick={() => go('/')}>
            ← Kembali ke kantor
          </button>
          <div>
            <h1>{saved ? 'Ubah avatar kamu' : 'Buat avatar kamu'}</h1>
            <p>Avatar kamu akan berjalan-jalan di dermaga Kyuka Ramen dan ikut rapat di Ruang Tatami.</p>
          </div>
        </div>
        <div className="creator">
          <div className="creator-preview">
            <AvatarPreview p={p} pose={preview} />
            <div className="name">{p.name.trim() || 'Nama kamu'}</div>
            <div className="sub">
              {DEPTS[p.dept]?.name} · {POSES.find((x) => x.id === preview)?.name}
            </div>
          </div>
          <div className="creator-form">
            <div className="field">
              <div className="field-label">Nama panggilan</div>
              <input
                type="text"
                value={p.name}
                maxLength={20}
                placeholder="Dina"
                onChange={(e) => {
                  set('name')(e.target.value);
                  setError('');
                }}
              />
              {error && <div className="error">{error}</div>}
            </div>
            <div className="field">
              <div className="field-label">Divisi</div>
              {account ? (
                <>
                  <div className="locked">
                    🔒 {DEPTS[account.primary_dept]?.name}
                    {account.depts?.length > 0 && ` + ${account.depts.map((d) => DEPTS[d]?.short).join(', ')}`}
                  </div>
                  <div className="field-hint">Divisi dikunci dari undangan admin.</div>
                </>
              ) : (
                <>
                  <select value={p.dept} onChange={(e) => set('dept')(e.target.value)}>
                    {STAFF_DEPTS.map((d) => (
                      <option key={d} value={d}>
                        {DEPTS[d].name}
                      </option>
                    ))}
                  </select>
                  <div className="field-hint">Mode demo: masuk dengan akun supaya avatar tersimpan dan terlihat rekan kerja.</div>
                </>
              )}
            </div>
            <div className="field">
              <div className="field-label">Joget favorit</div>
              <div className="poses">
                {POSES.map((x) => (
                  <button
                    key={x.id}
                    className={`pose${p.pose === x.id ? ' on' : ''}`}
                    onClick={() => {
                      set('pose')(x.id);
                      setPreview(x.id);
                    }}
                  >
                    <b>{x.name}</b>
                    <span>{x.desc}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="field">
              <div className="field-label">Rambut</div>
              <Chips field="hair" value={p.hair} onPick={set('hair')} />
            </div>
            <div className="field">
              <div className="field-label">Warna rambut</div>
              <Swatches field="hairColor" value={p.hairColor} onPick={set('hairColor')} />
            </div>
            <div className="field">
              <div className="field-label">Kulit</div>
              <Swatches field="skin" value={p.skin} onPick={set('skin')} />
            </div>
            <div className="field">
              <div className="field-label">Seragam kru</div>
              <Chips field="outfit" value={p.outfit} onPick={set('outfit')} />
            </div>
            <div className="field">
              <div className="field-label">Warna seragam</div>
              <Swatches field="outfitColor" value={p.outfitColor} onPick={set('outfitColor')} />
            </div>
            <div className="field">
              <div className="field-label">Penutup kepala</div>
              <Chips field="headwear" value={p.headwear} onPick={set('headwear')} />
            </div>
            <div className="field">
              <div className="field-label">Di tangan</div>
              <Chips field="hand" value={p.hand} onPick={set('hand')} />
            </div>
            <div className="field">
              <div className="field-label">Aksesori wajah</div>
              <Chips field="extra" value={p.extra} onPick={set('extra')} />
            </div>
            <div className="field">
              <div className="field-label">Ekspresi</div>
              <Chips field="expr" value={p.expr} onPick={set('expr')} />
            </div>
            <button className="save" onClick={save} disabled={busy}>
              {busy ? 'Menyimpan…' : account ? 'Simpan avatar ke akun' : 'Simpan dan masuk ke kantor'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
