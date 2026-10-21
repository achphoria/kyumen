// Teks & kartu animasi di atas Mode Intro (#/intro). Waktunya mengikuti IntroDirector (useIntro.t) dan bab di CH.
// Siap direkam: kursor & tombol hilang selama diputar, tombol muncul lagi di akhir.
import { useEffect, useState } from 'react';
import { AGENT_BY_ID, TIERS, TOP_TIER } from '../data/hive';
import { useIntro, INTRO_LEN, CH } from '../sim/intro';
import { go } from './nav';
import { useAuth } from '../sim/auth';
import { markIntroSeen } from '../hall/portalApi';

// #/intro?t=30 -> mulai dari detik ke-30 (merekam ulang satu bagian)
const startFrom = () => {
  const v = Number(new URLSearchParams(window.location.hash.split('?')[1] || '').get('t'));
  return Number.isFinite(v) && v > 0 && v < INTRO_LEN ? v : 0;
};
const clamp01 = (v) => Math.max(0, Math.min(1, v));
const between = (t, a, b) => t >= a && t < b;
const inCh = (t, ch, pad = 0.4) => between(t, CH[ch][0] + pad, CH[ch][1] - 0.4);
// teks muncul huruf demi huruf antara detik a dan b
const typed = (text, t, a, b) => text.slice(0, Math.round(text.length * clamp01((t - a) / (b - a))));
// angka menghitung naik antara detik a dan b
const count = (n, t, a, b) => Math.round(n * (1 - Math.pow(1 - clamp01((t - a) / (b - a)), 3)));
const CH_ORDER = Object.keys(CH);
const chapterAt = (t) => CH_ORDER.findIndex((k) => t >= CH[k][0] && t < CH[k][1]);

// empat agent yang dibagi tugas oleh Ryu (sama dengan tugas contoh di IntroDirector)
const TEAM = [
  ['cost', 'Food cost ramen musim hujan'],
  ['ads', 'Promo musim hujan'],
  ['design', 'Poster menu baru'],
  ['store_plan', 'Jadwal shift outlet'],
].map(([id, job]) => ({ id, job, nick: AGENT_BY_ID[id]?.nick || id, role: AGENT_BY_ID[id]?.role || '' }));

// logo resmi Kyuka Ramen
function Logo({ size = 120, draw = true }) {
  return <img className={`io-logo${draw ? ' draw' : ''}`} src={`${import.meta.env.BASE_URL}logo.png`} width={size} height={size} alt="" aria-hidden="true" />;
}

// satu lapisan per adegan; "on" mengatur fade masuk/keluar
function Layer({ on, className = '', children }) {
  return <div className={`io-layer ${className}${on ? ' on' : ''}`}>{children}</div>;
}

// judul adegan muncul kata per kata
function Headline({ on, lines, pos = 'bl' }) {
  let i = 0;
  return (
    <div className={`io-headline ${pos}${on ? ' on' : ''}`}>
      {lines.map((line, l) => (
        <span key={l} className="io-hl-line">
          {line.split(' ').map((w) => (
            <span key={i} className="io-word" style={{ transitionDelay: `${0.09 * i++}s` }}>
              {w}&nbsp;
            </span>
          ))}
        </span>
      ))}
    </div>
  );
}

// huruf turun dari blur, lalu kilau cahaya menyapu dari kiri ke kanan
function Shine({ text, delay = 0, as: Tag = 'h1' }) {
  return (
    <Tag className="io-shine">
      {text.split('').map((ch, i) => (
        <span key={i} style={{ '--i': i, '--d': `${delay}s` }}>
          {ch === ' ' ? ' ' : ch}
        </span>
      ))}
    </Tag>
  );
}

// roda progres tiket Workshop: satu segmen per tugas
function Dial({ done, total = 4, spin }) {
  const C = 2 * Math.PI * 46;
  return (
    <svg className={`io-dial${spin ? ' spin' : ''}`} viewBox="0 0 120 120" aria-hidden="true">
      {Array.from({ length: total }, (_, i) => (
        <circle key={i} cx="60" cy="60" r="46" className={i < done ? 'on' : ''} strokeDasharray={`${C / total - 7} ${C}`} transform={`rotate(${-90 + (360 / total) * i + 4} 60 60)`} />
      ))}
      <text x="60" y="58">
        {Math.round((done / total) * 100)}%
      </text>
      <text x="60" y="76" className="sub">
        {done}/{total} tugas
      </text>
    </svg>
  );
}

// required: staff baru yang belum pernah menonton (wajib sekali, tidak bisa dilewati)
export function IntroOverlay({ required = false }) {
  const account = useAuth((s) => s.account);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');
  const from = () => (required ? 0 : startFrom());
  const status = useIntro((s) => s.status);
  const t = useIntro((s) => s.t);
  const clock = useIntro((s) => s.clock);
  const playing = status === 'playing';

  // F = layar penuh, Esc keluar dari layar penuh (bawaan browser), Spasi = putar/ulang
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'f' || e.key === 'F') {
        if (document.fullscreenElement) document.exitFullscreen?.();
        else document.documentElement.requestFullscreen?.().catch(() => {});
      }
      if (e.code === 'Space' && useIntro.getState().status !== 'playing') {
        e.preventDefault();
        useIntro.getState().start(required ? 0 : startFrom());
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
  useEffect(() => () => useIntro.getState().reset(), []);

  const hh = String(Math.floor(clock)).padStart(2, '0');
  const mm = String(Math.floor((clock % 1) * 60)).padStart(2, '0');
  const black = status === 'ready' ? 1 : t < 4.2 ? 1 : t < 5.6 ? 1 - (t - 4.2) / 1.4 : t > INTRO_LEN - 1.5 ? Math.min(1, (t - (INTRO_LEN - 1.5)) / 1.3) : 0;
  const chapter = chapterAt(t);

  // lantai yang sedang disorot kamera crane (Lantai 1 -> Puncak)
  const floorSpan = (CH.floors[1] - CH.floors[0]) / (TOP_TIER + 1);
  const floorNow = Math.min(TOP_TIER, Math.max(0, Math.floor((t - CH.floors[0]) / floorSpan)));
  const tierInfo = TIERS.find((x) => x.id === floorNow);

  // Workshop: tiap tugas antre -> bekerja -> selesai
  const w0 = CH.workshop[0];
  const stepOf = (i) => (t < w0 + 1 + i * 0.6 ? 'Antre' : t < w0 + 4.5 + i * 1.3 ? 'Bekerja' : 'Selesai');
  const wsDone = TEAM.filter((_, i) => stepOf(i) === 'Selesai').length;

  // Ruang Kerja: satu kartu berpindah kolom
  const k0 = CH.work[0];
  const moving = t < k0 + 2 ? 'todo' : t < k0 + 4.5 ? 'doing' : 'done';

  // Employee: isi form, tekan kirim, undangan terkirim
  const p0 = CH.people[0];
  const sent = t > p0 + 4.3;

  const nightDone = t > CH.night[1] - 1;

  return (
    <div className={`intro${playing ? ' playing' : ''}`}>
      <div className="io-bars" aria-hidden="true" />
      <div className="io-black" style={{ opacity: black }} />
      {/* sapuan lentera merah setiap pergantian bab */}
      {playing && chapter > 0 && <div key={chapter} className="io-wipe" aria-hidden="true" />}

      {/* pembuka */}
      <Layer on={playing && t < CH.open[1] - 0.9} className="io-center">
        <Logo size={130} />
        <p className={`io-q l1${t > 1.2 ? ' on' : ''}`}>Di atas lautan awan,</p>
        <p className={`io-q l2${t > 2.4 ? ' on' : ''}`}>
          satu tebing bekerja <b>tanpa henti</b>.
        </p>
      </Layer>

      {/* judul: naik menembus awan */}
      <Layer on={inCh(t, 'title', 0.7)} className="io-title">
        <Shine text="KYUMEN" />
        <p className="io-holding">H O L D I N G</p>
        <p className="io-tag">Kyuka Ramen · 19 rekan kerja AI di tebing awan</p>
      </Layer>

      {/* tur 5 lantai */}
      <Layer on={inCh(t, 'floors', 0.3)} className="io-floors">
        <div className="io-ladder" aria-hidden="true">
          {[4, 3, 2, 1, 0].map((f) => (
            <i key={f} className={f === floorNow ? 'on' : f < floorNow ? 'past' : ''} />
          ))}
        </div>
        <div key={floorNow} className="io-floor-card">
          <small>{floorNow === TOP_TIER ? 'Puncak tebing' : `Lantai ${floorNow + 1} dari 4`}</small>
          <b>{tierInfo?.name}</b>
          <span>{tierInfo?.sub}</span>
        </div>
        <div className="io-stat">
          <span>
            <b>{count(5, t, CH.floors[0] + 0.5, CH.floors[0] + 3)}</b> lantai
          </span>
          <i />
          <span>
            <b>{count(18, t, CH.floors[0] + 0.8, CH.floors[0] + 3.6)}</b> agent
          </span>
          <i />
          <span>
            <b>{count(1, t, CH.floors[0] + 1.2, CH.floors[0] + 3)}</b> Chief
          </span>
        </div>
      </Layer>

      {/* Ryu ketua tim membagi tugas */}
      <Layer on={inCh(t, 'ryu')} className="io-chat io-left">
        <div className="io-card io-swing">
          <div className="io-card-head">
            <span className="io-av">🐉</span>
            <b>Ryu</b>
            <em>Chief · ketua tim</em>
          </div>
          <div className="io-bubble me">
            {typed('Ryu, siapkan kampanye musim hujan untuk semua outlet.', t, CH.ryu[0] + 0.8, CH.ryu[0] + 4.4)}
            {t < CH.ryu[0] + 4.4 && <span className="io-caret" />}
          </div>
          <div className={`io-bubble ai${t > CH.ryu[0] + 5.2 ? ' on' : ''}`}>Siap! Saya bagi ke empat agent, rekapnya saya kirim begitu selesai.</div>
          <div className="io-tasks">
            {TEAM.map((a, i) => (
              <span key={a.id} className={t > CH.ryu[0] + 5.8 + i * 0.35 ? 'on' : ''}>
                → <b>{a.nick}</b> · {a.job}
              </span>
            ))}
          </div>
        </div>
      </Layer>
      <Headline on={between(t, CH.ryu[0] + 7, CH.ryu[1] - 0.4)} pos="br" lines={['Satu perintah,', 'empat agent bergerak']} />

      {/* Workshop: tiket & roda progres */}
      <Layer on={inCh(t, 'workshop')} className="io-chat">
        <div className="io-card io-swing io-ws">
          <p className="io-kicker">Workshop · tiket #0142</p>
          <div className="io-ws-row">
            <Dial done={wsDone} spin={wsDone < 4} />
            <div className="io-ws-head">
              <b>Kampanye musim hujan</b>
              <div className="io-tabs">
                <span>Rapat</span>
                <span className="on">Kerja</span>
                <span>Laporan</span>
              </div>
            </div>
          </div>
          <ul className="io-steps">
            {TEAM.map((a, i) => {
              const s = stepOf(i);
              return (
                <li key={a.id} className={s === 'Selesai' ? 'done' : s === 'Bekerja' ? 'run' : ''}>
                  <b>{a.nick}</b>
                  <span>{a.job}</span>
                  <em key={s}>{s === 'Selesai' ? '✓ Selesai' : s}</em>
                </li>
              );
            })}
          </ul>
        </div>
      </Layer>
      <Headline on={between(t, w0 + 1.2, CH.workshop[1] - 0.4)} lines={['Satu tiket,', 'progresnya terlihat']} />

      {/* rapat video */}
      <Layer on={inCh(t, 'video')} className="io-chat">
        <div className="io-card io-swing io-vid">
          <p className="io-kicker">
            <span className="io-rec" /> Rapat video · Ruang Tatami
          </p>
          <div className="io-tiles">
            {[
              ['R', 'Rina'],
              ['D', 'Dimas'],
              ['A', 'Andi'],
              ['🐉', 'Ryu'],
            ].map(([av, name], i) => (
              <div key={name} className={`io-tile${(Math.floor(t * 0.9) + i) % 4 === 0 ? ' talk' : ''}`} style={{ '--h': 200 + i * 38 }}>
                <span>{av}</span>
                <small>{name}</small>
              </div>
            ))}
          </div>
          <p className="io-kicker">Notulen otomatis · Ryu</p>
          <ul className="io-notes">
            <li>{typed('Promo musim hujan mulai 1 November', t, CH.video[0] + 1.6, CH.video[0] + 3.4)}</li>
            <li>{typed('Hana kirim poster sebelum Kamis', t, CH.video[0] + 3.6, CH.video[0] + 5.3)}</li>
            <li>{typed('Kumo atur shift tambahan akhir pekan', t, CH.video[0] + 5.5, CH.video[0] + 7.3)}</li>
          </ul>
        </div>
      </Layer>
      <Headline on={between(t, CH.video[0] + 1.2, CH.video[1] - 0.4)} lines={['Rapat video,', 'notulen langsung jadi']} />

      {/* Ruang Kerja & Portal */}
      <Layer on={inCh(t, 'work')} className="io-chat">
        <div className="io-card io-swing io-portal">
          <div className="io-card-head">
            <span className="io-av">🙋</span>
            <b>Portal saya</b>
            <em>Selamat pagi, Rina 👋</em>
          </div>
          <div className="io-kanban">
            {[
              ['todo', 'Belum'],
              ['doing', 'Jalan'],
              ['done', 'Selesai'],
            ].map(([col, label]) => (
              <div key={col} className="io-kcol">
                <span>{label}</span>
                {col === 'todo' && <i>Balas review Google</i>}
                {col === moving && (
                  <i key={moving} className="hot">
                    Pasang poster outlet
                  </i>
                )}
                {col === 'done' && <i>Rekap absensi</i>}
              </div>
            ))}
          </div>
          <div className="io-dock">
            {['🏯 Kantor', '🧩 Workshop', '🎥 Rapat', '💬 Ruang Kerja', '🙋 Portal'].map((d, i) => (
              <span key={d} className={t > k0 + 0.8 + i * 0.3 ? 'on' : ''}>
                {d}
              </span>
            ))}
          </div>
        </div>
      </Layer>
      <Headline on={between(t, k0 + 1, CH.work[1] - 0.4)} lines={['Pekerjaanmu,', 'satu halaman']} />

      {/* Employee: undang staff baru */}
      <Layer on={inCh(t, 'people')} className="io-chat">
        <div className="io-card io-swing io-emp">
          <p className="io-kicker">Employee · staff baru</p>
          <label>
            <span>Nama</span>
            <i>{typed('Rina Putri', t, p0 + 0.8, p0 + 1.8)}</i>
          </label>
          <label>
            <span>Email</span>
            <i>{typed('rina@kyukaramen.id', t, p0 + 1.9, p0 + 3.2)}</i>
          </label>
          <div className="io-emp-row">
            <span className="io-pill">Store</span>
            <span className="io-pill">Staff</span>
            <b className={`io-send${t > p0 + 3.8 ? ' press' : ''}${sent ? ' sent' : ''}`}>{sent ? '✓ Terkirim' : 'Kirim undangan'}</b>
          </div>
          <div className={`io-toast in-card${sent ? ' on' : ''}`}>✉️ Undangan terkirim ke email Rina</div>
        </div>
      </Layer>
      <Headline on={between(t, p0 + 1, CH.people[1] - 0.4)} lines={['Staff baru?', 'Undang lewat email']} />

      {/* time-lapse malam */}
      <Layer on={inCh(t, 'night')} className="io-clock">
        <b>
          {hh}
          <span>:</span>
          {mm}
        </b>
        <p>WIB</p>
        <div className="io-done-list">
          {TEAM.map((a, i) => (
            <span key={a.id} className={nightDone ? 'on' : ''} style={{ transitionDelay: `${i * 0.12}s` }}>
              ✓ {a.nick}
            </span>
          ))}
        </div>
        <div className={`io-toast${nightDone ? ' on' : ''}`}>🐉 Rekap Ryu siap · 4 hasil terlampir</div>
      </Layer>
      <Headline on={between(t, CH.night[0] + 0.8, CH.night[1] - 0.4)} pos="tl" lines={['Kerja semalaman,', 'pagi tinggal baca hasil']} />

      {/* statistik */}
      <Layer on={inCh(t, 'stats')} className="io-chat">
        <div className="io-card io-swing">
          <p className="io-kicker">Statistik owner</p>
          <div className="io-nums">
            <span>
              <b>{count(128, t, CH.stats[0] + 0.4, CH.stats[0] + 3)}</b> tugas selesai
            </span>
            <span>
              <b>{count(36, t, CH.stats[0] + 0.6, CH.stats[0] + 3.2)}</b> tiket
            </span>
            <span>
              <b>{count(14, t, CH.stats[0] + 0.8, CH.stats[0] + 3.4)}</b> rapat
            </span>
          </div>
          <div className="io-bars-chart">
            {[0.55, 0.8, 0.4, 0.95, 0.65, 0.75, 0.9].map((h, i) => (
              <i key={i} style={{ '--h': h, animationDelay: `${0.1 * i}s` }} />
            ))}
          </div>
          <div className="io-locks">
            <span>🔐 Login wajib</span>
            <span>🔑 Akses per staff</span>
            <span>📊 Kuota harian</span>
          </div>
        </div>
      </Layer>
      <Headline on={between(t, CH.stats[0] + 0.8, CH.stats[1] - 0.4)} lines={['Terpantau, terkendali,', 'aman']} />

      {/* penutup */}
      <Layer on={between(t, CH.end[0] + 0.4, INTRO_LEN + 1) && status !== 'ready'} className="io-center io-end">
        <Logo size={110} />
        <Shine text="KYUMEN" as="h2" delay={0.3} />
        <p className="io-holding">H O L D I N G</p>
        <p>Tim AI yang dilatih oleh tim kita sendiri</p>
      </Layer>

      {/* layar mulai & akhir (tidak ikut terekam saat diputar) */}
      {status === 'ready' && (
        <div className="io-start">
          <Logo size={90} draw={false} />
          {required ? (
            <>
              <h2>Selamat datang, {account?.name?.split(' ')[0] || 'rekan baru'}! 👋</h2>
              <p>Sebelum mulai, tonton dulu video perkenalan KYUMEN Holding (±{INTRO_LEN} detik). Wajib sekali untuk staff baru, supaya kamu tahu cara bekerja bersama Ryu dan 18 agent AI kita.</p>
            </>
          ) : (
            <>
              <h2>Video perkenalan KYUMEN Holding</h2>
              <p>±{INTRO_LEN} detik. Tekan F untuk layar penuh, lalu mulai rekam layar (Win+Alt+R atau OBS) sebelum menekan Putar.</p>
            </>
          )}
          <div className="io-actions">
            <button className="io-btn pri" onClick={() => useIntro.getState().start(from())}>
              ▶ Putar{from() ? ` dari detik ${from()}` : ''}
            </button>
            {!required && (
              <button className="io-btn" onClick={() => go('/')}>
                Kembali ke kantor
              </button>
            )}
          </div>
        </div>
      )}
      {status === 'done' && !required && (
        <div className="io-actions io-after">
          <button className="io-btn pri" onClick={() => useIntro.getState().start()}>
            ↺ Putar ulang
          </button>
          <button className="io-btn" onClick={() => go('/')}>
            Kembali ke kantor
          </button>
        </div>
      )}
      {status === 'done' && required && (
        <div className="io-start io-next">
          <h2>Siap mulai! 🎉</h2>
          <ol>
            <li>Buat avatarmu supaya terlihat di kantor.</li>
            <li>
              Buka <b>Portal saya</b> untuk melihat tugas dan rapatmu.
            </li>
            <li>
              Coba <b>Workshop</b>: tulis tiket, Ryu membagi tugas ke agent.
            </li>
          </ol>
          {err && <p className="io-err">{err}</p>}
          <div className="io-actions">
            <button
              className="io-btn pri"
              disabled={saving}
              onClick={async () => {
                setSaving(true);
                setErr('');
                try {
                  await markIntroSeen();
                  go('/avatar');
                } catch (e) {
                  setErr(e.message);
                  setSaving(false);
                }
              }}
            >
              {saving ? 'Menyimpan…' : 'Mulai pakai KYUMEN Holding →'}
            </button>
            <button className="io-btn" onClick={() => useIntro.getState().start()}>
              ↺ Putar ulang
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
