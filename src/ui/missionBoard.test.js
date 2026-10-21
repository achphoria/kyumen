import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { resolveAgent } from '../data/hive.js';
import { BOARD_EMPTY_REAL, RECENT_DONE_MS, missionBoardItems, nextBoardTick } from './missionBoard.js';

const NOW = Date.parse('2026-10-14T08:00:00.000Z');
const min = (n) => n * 60 * 1000;

function row(partial) {
  return {
    id: 'task-1',
    kind: 'ai',
    col: 'doing',
    who: 'sales',
    title: 'Zeni: Rekap penjualan',
    updatedAt: new Date(NOW - min(1)).toISOString(),
    ...partial,
  };
}

test('who cocok ke agent meski beda huruf atau pakai nama', () => {
  assert.equal(resolveAgent('sales').id, 'sales');
  assert.equal(resolveAgent('SALES').id, 'sales');
  assert.equal(resolveAgent('Zeni').nick, 'Zeni');
  assert.equal(resolveAgent('zeni').id, 'sales');
  assert.equal(resolveAgent('  Zeni  ').id, 'sales');
  assert.equal(resolveAgent('Mochi').id, 'store_mgr');
  assert.equal(resolveAgent('tidak-ada'), null);
});

test('papan menampilkan tugas jalan, lalu yang baru selesai', () => {
  const tasks = [
    row({
      id: 'done-new',
      col: 'done',
      title: 'Zeni: Laporan baru',
      resultAt: new Date(NOW - min(2)).toISOString(),
    }),
    row({ id: 'run-a', title: 'Zeni: Masih jalan', updatedAt: new Date(NOW - min(3)).toISOString() }),
    row({
      id: 'done-old',
      col: 'done',
      who: 'ads',
      title: 'Kaze: Kemarin',
      resultAt: new Date(NOW - min(11)).toISOString(),
      updatedAt: new Date(NOW - min(11)).toISOString(),
    }),
    row({
      id: 'done-mid',
      col: 'done',
      who: 'zeni',
      title: 'zeni: Baru saja',
      updatedAt: new Date(NOW - min(1)).toISOString(),
      resultAt: null,
    }),
    row({ id: 'human', kind: 'human', who: 'Dina', col: 'doing', title: 'Tugas manusia' }),
    row({ id: 'todo', col: 'todo', title: 'Zeni: Belum' }),
    { id: 't1', kind: 'ai', col: 'doing', who: 'Mochi', title: 'Rute demo' },
  ];
  const missions = [{ taskId: 'run-a', progress: 0.42, real: true }];
  const items = missionBoardItems(tasks, missions, NOW);

  assert.deepEqual(
    items.map((m) => m.id),
    ['run-a', 'done-mid', 'done-new'],
  );
  assert.equal(items[0].finished, false);
  assert.equal(items[0].phase, 'work');
  assert.equal(items[0].progress, 0.42);
  assert.equal(items[0].leadId, 'sales');
  assert.equal(items[0].title, 'Masih jalan');
  assert.equal(items[1].finished, true);
  assert.equal(items[1].phase, 'done');
  assert.equal(items[1].progress, 1);
  assert.equal(items[1].title, 'Baru saja');
  assert.equal(items[1].dept, 'fin');
  assert.equal(items[1].roomId, 'fin');
  assert.equal(items[2].progress, 1);
  assert.equal(items.filter((m) => m.id === 'done-old').length, 0);
});

test('kartu selesai hilang tepat setelah 10 menit, tanpa data baru', () => {
  const at = new Date(NOW - RECENT_DONE_MS + 1).toISOString();
  const tasks = [row({ id: 'done', col: 'done', resultAt: at, updatedAt: at })];
  assert.equal(missionBoardItems(tasks, [], NOW).length, 1);
  assert.equal(missionBoardItems(tasks, [], NOW + 1).length, 0);
  assert.equal(nextBoardTick(tasks, NOW), NOW + 1);
  assert.equal(nextBoardTick(tasks, NOW + 1), null);
  assert.equal(nextBoardTick([row({ col: 'doing' })], NOW), null);
});

test('cap waktu terbaru yang menentukan selesai, termasuk updated_at n8n', () => {
  const fresh = row({
    col: 'done',
    resultAt: new Date(NOW - min(50)).toISOString(),
    updatedAt: new Date(NOW - min(4)).toISOString(),
  });
  assert.equal(missionBoardItems([fresh], [], NOW).length, 1);
  const stale = row({
    col: 'done',
    result_at: new Date(NOW - min(40)).toISOString(),
    updated_at: new Date(NOW - min(30)).toISOString(),
    resultAt: undefined,
    updatedAt: undefined,
  });
  assert.equal(missionBoardItems([stale], [], NOW).length, 0);
});

test('progres tersimpan di tugas dipakai kalau misi 3D belum ada', () => {
  const items = missionBoardItems([row({ id: 'run-b', progress: 0.7, title: 'Zeni: Render' })], [], NOW);
  assert.equal(items.length, 1);
  assert.equal(items[0].progress, 0.7);
  assert.equal(items[0].phase, 'work');
});

test('teks kosong dan gaya selesai terpasang di HUD', () => {
  const hud = readFileSync(new URL('./HUD.jsx', import.meta.url), 'utf8');
  const css = readFileSync(new URL('../styles.css', import.meta.url), 'utf8');
  assert.match(BOARD_EMPTY_REAL, /Tidak ada tugas yang sedang dikerjakan/);
  assert.match(BOARD_EMPTY_REAL, /Log holding/);
  assert.match(hud, /BOARD_EMPTY_REAL/);
  assert.match(hud, /✅ Selesai/);
  assert.match(hud, /setInterval\(\(\) => setNow\(Date\.now\(\)\), 10000\)/);
  assert.match(hud, /nextBoardTick/);
  assert.match(hud, /mission\$\{m\.finished \|\| m\.phase === 'done' \? ' done' : ''\}/);
  assert.match(css, /\.mission\.done/);
});
