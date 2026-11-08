import { env } from '../config/env.js';

export function isValidDateString(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

export function todayInAppTimezone(now = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: env.APP_TIMEZONE,
    year: 'numeric', month: '2-digit', day: '2-digit'
  }).formatToParts(now);
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  return `${values.year}-${values.month}-${values.day}`;
}

export function toDatabaseDate(dateString) {
  return new Date(`${dateString}T00:00:00.000Z`);
}

export function previousMonthRange(selectedDate) {
  const [year, month] = selectedDate.split('-').map(Number);
  const firstOfSelectedMonth = new Date(Date.UTC(year, month - 1, 1));
  const previousMonthLastDay = new Date(firstOfSelectedMonth.getTime() - 86400000);
  const previousYear = previousMonthLastDay.getUTCFullYear();
  const previousMonth = String(previousMonthLastDay.getUTCMonth() + 1).padStart(2, '0');
  const lastDay = String(previousMonthLastDay.getUTCDate()).padStart(2, '0');
  return {
    start: `${previousYear}-${previousMonth}-01`,
    end: `${previousYear}-${previousMonth}-${lastDay}`
  };
}
