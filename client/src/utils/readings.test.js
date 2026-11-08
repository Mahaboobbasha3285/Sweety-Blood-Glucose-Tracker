import { describe, expect, it } from 'vitest';
import { validateReading } from './readings';

describe('validateReading', () => {
  it('requires a glucose value', () => {
    expect(validateReading({ date: '2026-10-15', timeSlot: 'AFTER_LUNCH', value: '' })).toBe('Please enter a glucose value.');
  });
  it('accepts whole numbers from 40 through 600', () => {
    expect(validateReading({ date: '2026-10-15', timeSlot: 'AFTER_LUNCH', value: '40' })).toBe('');
    expect(validateReading({ date: '2026-10-15', timeSlot: 'AFTER_LUNCH', value: '600' })).toBe('');
  });
  it('rejects decimal and out-of-range values', () => {
    expect(validateReading({ date: '2026-10-15', timeSlot: 'AFTER_LUNCH', value: '40.5' })).toContain('between 40 and 600');
    expect(validateReading({ date: '2026-10-15', timeSlot: 'AFTER_LUNCH', value: '601' })).toContain('between 40 and 600');
  });
  it('rejects a future date', () => {
    expect(validateReading({ date: '2999-01-01', timeSlot: 'AFTER_LUNCH', value: '100' })).toBe('Date cannot be in the future.');
  });
});
