import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ryuCall } from './ryuWake.js';

test('pertanyaan lengkap ke Ryu', () => {
  assert.deepEqual(ryuCall('Ryu, menurut kamu promo ini gimana?'), { wakeOnly: false });
  assert.deepEqual(ryuCall('Kalau begitu ryuu tolong ringkas rapat ini'), { wakeOnly: false });
  assert.deepEqual(ryuCall('Rio, tolong cek food cost minggu ini'), { wakeOnly: false });
});

test('hanya memanggil nama', () => {
  assert.deepEqual(ryuCall('Ryu?'), { wakeOnly: true });
  assert.deepEqual(ryuCall('Riyu, '), { wakeOnly: true });
});

test('bukan panggilan', () => {
  assert.equal(ryuCall('Tadi pagi Rio datang ke outlet Kemang'), null);
  assert.equal(ryuCall('Stok nori sudah datang hari Kamis'), null);
  assert.equal(ryuCall(''), null);
});
