// Mode Intro (#/intro): video perkenalan ±96 detik yang diputar dari scene 3D asli KYUMEN Holding.
// Waktu diputar oleh IntroDirector (di dalam kanvas) dan dibaca teks di atasnya (IntroOverlay).
import { create } from 'zustand';

export const INTRO_LEN = 96; // detik

// bab video [mulai, selesai] dalam detik; dipakai kamera (IntroDirector) dan teks (IntroOverlay)
export const CH = {
  open: [0, 5.5],
  title: [5.5, 15],
  floors: [15, 25],
  ryu: [25, 36],
  workshop: [36, 46],
  video: [46, 56],
  work: [56, 63],
  people: [63, 70],
  night: [70, 78],
  stats: [78, 85],
  end: [85, INTRO_LEN],
};

// status: ready (layar mulai) | playing | done
export const useIntro = create((set, get) => ({
  status: 'ready',
  t: 0,
  clock: 6,
  run: 0, // naik setiap kali diputar (ulang), supaya sutradara mulai dari awal
  from: 0, // detik awal pemutaran (#/intro?t=30 untuk merekam ulang satu bagian)
  start: (from = 0) => set({ status: 'playing', t: from, from, run: get().run + 1 }),
  finish: () => set({ status: 'done' }),
  reset: () => set({ status: 'ready', t: 0 }),
}));
