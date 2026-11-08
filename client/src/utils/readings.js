import { localDateString } from './dates';

export const SLOT_LABELS = {
  MORNING_FASTING: 'Morning (fasting)',
  AFTER_BREAKFAST: 'After breakfast',
  AFTER_LUNCH: 'After lunch',
  AFTER_DINNER: 'After dinner'
};

export const SLOT_ORDER = Object.keys(SLOT_LABELS);

export function validateReading({ date, timeSlot, value }) {
  if (value === '' || value === null || value === undefined) {
    return 'Please enter a glucose value.';
  }
  const numericValue = Number(value);
  if (!Number.isInteger(numericValue) || numericValue < 40 || numericValue > 600) {
    return 'Value must be between 40 and 600 mg/dl.';
  }
  if (!date || date > localDateString()) {
    return 'Date cannot be in the future.';
  }
  if (!SLOT_ORDER.includes(timeSlot)) {
    return 'Please select a time slot.';
  }
  return '';
}
