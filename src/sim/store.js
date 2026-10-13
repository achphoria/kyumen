import { create } from 'zustand';
import { TIER_GAP, ROOM_BY_ID } from '../data/hive';
import { loadProfile } from '../data/staff';

const DEFAULT_FOCUS = { target: [3, 6, 2], dist: 66 };

// Isi awal Ruang Tatami (mode demo): tugas rencana pembukaan outlet baru + promo "Ramen Day" dan antrean persetujuan.
const PLAN_TASKS = [
  { id: 't1', title: 'Layout dapur & bar outlet baru', who: 'Kumo', kind: 'ai', col: 'doing' },
  { id: 't2', title: 'Cek peralatan masak & kompor outlet', who: 'Dina', kind: 'human', col: 'todo' },
  { id: 't3', title: 'Konten & iklan IG promo "Ramen Day"', who: 'Kaze', kind: 'ai', col: 'doing' },
  { id: 't4', title: 'Hitung HPP & budget pembukaan', who: 'Masu', kind: 'ai', col: 'todo' },
  { id: 't5', title: 'Atur kiriman stok awal dari Main Warehouse', who: 'Rudi', kind: 'human', col: 'todo' },
  { id: 't6', title: 'Tetapkan tanggal soft opening', who: 'Anda', kind: 'human', col: 'done' },
];
const APPROVALS = [
  { id: 'a1', title: 'Iklan IG "Ramen Day"', by: 'Kaze', dept: 'mkt', detail: 'Budget Rp1,5 juta, 7 hari, target radius 5 km dari outlet baru.', status: 'pending' },
  { id: 'a2', title: 'PO bahan stok awal outlet baru', by: 'Nori', dept: 'scm', detail: 'Tepung, tulang babi & ayam, nori, telur. Total Rp12,4 juta dari supplier langganan.', status: 'pending' },
  { id: 'a3', title: 'Bonus lembur kru opening (Rp850 ribu)', by: 'Kiku', dept: 'hr', detail: '6 kru lembur saat persiapan soft opening, sesuai aturan lembur pasal 4.', status: 'pending' },
];

export const useHive = create((set) => ({
  floor: 'all',
  speed: 1,
  paused: false,
  selectedAgent: null,
  selectedRoom: null,
  hoverRoom: null,
  missions: [],
  log: [],
  stats: { done: 0, honey: 0 },
  agentStates: {},
  focus: { ...DEFAULT_FOCUS, key: 0 },
  profile: loadProfile(),
  outdoorVersion: 0,
  planTasks: PLAN_TASKS,
  approvals: APPROVALS,
  onlineStaff: [], // staff lain yang sedang online (Realtime Presence)
  dbActivity: [], // log aktivitas manusia dari Supabase
  agentPrompts: [], // id agent yang aktif tersambung AI lewat n8n (hc_agent_prompts)

  focusOn: (target, dist, dir = null) => set((s) => ({ focus: { target, dist, dir, key: s.focus.key + 1 } })),
  setFloor: (floor) =>
    set((s) => ({
      floor,
      selectedRoom: null,
      focus:
        floor === 'all'
          ? { ...DEFAULT_FOCUS, key: s.focus.key + 1 }
          : { target: [3, floor * TIER_GAP + 1.2, 0], dist: 44, key: s.focus.key + 1 },
    })),
  selectRoom: (id) =>
    set((s) => {
      const r = ROOM_BY_ID[id];
      return {
        selectedRoom: id,
        selectedAgent: null,
        floor: r.tier,
        focus: { target: [r.x, r.y + 1, r.z], dist: 32, key: s.focus.key + 1 },
      };
    }),
  selectAgent: (id) => set({ selectedAgent: id, selectedRoom: null }),
  clearSelection: () => set({ selectedAgent: null, selectedRoom: null }),
  setHoverRoom: (id) => set({ hoverRoom: id }),
  setSpeed: (speed) => set({ speed, paused: false }),
  togglePause: () => set((s) => ({ paused: !s.paused })),
  pushLog: (entry) => set((s) => ({ log: [entry, ...s.log].slice(0, 40) })),
  resetView: () =>
    set((s) => ({ floor: 'all', selectedRoom: null, selectedAgent: null, focus: { ...DEFAULT_FOCUS, key: s.focus.key + 1 } })),

  setProfile: (profile) => set((s) => ({ profile, outdoorVersion: s.outdoorVersion + 1 })),
  bumpOutdoor: () => set((s) => ({ outdoorVersion: s.outdoorVersion + 1 })),
  advanceTask: (id) =>
    set((s) => ({
      planTasks: s.planTasks.map((t) =>
        t.id === id ? { ...t, col: t.col === 'todo' ? 'doing' : t.col === 'doing' ? 'done' : 'todo' } : t,
      ),
    })),
  decideApproval: (id, status) =>
    set((s) => ({ approvals: s.approvals.map((a) => (a.id === id ? { ...a, status } : a)) })),
}));
