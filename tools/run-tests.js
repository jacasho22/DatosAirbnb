import assert from 'assert/strict';
import { parseCheckInData, normalizeCheckInData, progressText } from '../assets/form-utils.js';

function testParseValid() {
  const json = JSON.stringify({ apartment: '1', checkInDate: '2025-09-18', guestsCount: 1, language: 'es' });
  const parsed = parseCheckInData(json);
  assert.deepEqual(parsed.apartment, '1');
}

function testParseInvalid() {
  const parsed = parseCheckInData('not-a-json');
  assert.equal(parsed, null);
}

function testNormalize() {
  const data = { apartment: '1', checkInDate: '2025-09-18', numGuests: 3 };
  const n = normalizeCheckInData(data);
  assert.equal(n.guestsCount, 3);
}

function testProgressText() {
  const i18n = { getText: (k) => '{current} de {total}' };
  const txt = progressText(1, 3, i18n);
  assert.equal(txt, '1 de 3');
}

async function run() {
  try {
    console.log('Running tests...');
    testParseValid();
    testParseInvalid();
    testNormalize();
    testProgressText();
    console.log('All tests passed');
    process.exit(0);
  } catch (err) {
    console.error('Test failed:', err);
    process.exit(2);
  }
}

run();
