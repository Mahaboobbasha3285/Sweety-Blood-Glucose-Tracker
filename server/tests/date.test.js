import test from 'node:test';
import assert from 'node:assert/strict';

process.env.DATABASE_URL ||= 'postgresql://postgres:postgres@localhost:5432/sweety?schema=public';
process.env.JWT_SECRET ||= 'test-secret-that-is-at-least-thirty-two-characters-long';
process.env.NODE_ENV = 'test';

const { isValidDateString, previousMonthRange } = await import('../src/utils/date.js');
const { readingSchema } = await import('../src/validators/readings.js');

test('accepts real calendar dates and rejects impossible dates', () => {
  assert.equal(isValidDateString('2026-10-15'), true);
  assert.equal(isValidDateString('2026-02-29'), false);
  assert.equal(isValidDateString('15-10-2026'), false);
});

test('previous month range handles year boundaries and leap years', () => {
  assert.deepEqual(previousMonthRange('2026-01-15'), { start: '2025-12-01', end: '2025-12-31' });
  assert.deepEqual(previousMonthRange('2024-03-15'), { start: '2024-02-01', end: '2024-02-29' });
});

test('reading validator accepts an in-range whole number', () => {
  const result = readingSchema.safeParse({ date: '2026-10-15', timeSlot: 'AFTER_LUNCH', value: 120 });
  assert.equal(result.success, true);
});

test('reading validator rejects decimals and out-of-range values', () => {
  assert.equal(readingSchema.safeParse({ date: '2026-10-15', timeSlot: 'AFTER_LUNCH', value: 120.5 }).success, false);
  assert.equal(readingSchema.safeParse({ date: '2026-10-15', timeSlot: 'AFTER_LUNCH', value: 601 }).success, false);
});
