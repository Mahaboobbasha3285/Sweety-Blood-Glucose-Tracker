import { prisma } from '../config/prisma.js';
import { toDatabaseDate, previousMonthRange } from '../utils/date.js';

function summarize(readings) {
  if (readings.length === 0) {
    return { highest: null, lowest: null, average: null, count: 0 };
  }
  const values = readings.map((reading) => reading.glucoseValue);
  const sum = values.reduce((total, value) => total + value, 0);
  return {
    highest: Math.max(...values),
    lowest: Math.min(...values),
    average: Math.round((sum / values.length) * 10) / 10,
    count: values.length
  };
}

async function fetchReadings(userId, start, end) {
  return prisma.reading.findMany({
    where: {
      userId,
      readingDate: { gte: toDatabaseDate(start), lte: toDatabaseDate(end) }
    },
    orderBy: [{ readingDate: 'asc' }, { timeSlot: 'asc' }]
  });
}

export async function getReports(userId, selectedDate) {
  const [year, month] = selectedDate.split('-').map(Number);
  const monthStart = `${year}-${String(month).padStart(2, '0')}-01`;
  const previous = previousMonthRange(selectedDate);
  const [dailyReadings, monthToDateReadings, monthlyReadings] = await Promise.all([
    fetchReadings(userId, selectedDate, selectedDate),
    fetchReadings(userId, monthStart, selectedDate),
    fetchReadings(userId, previous.start, previous.end)
  ]);
  const daily = dailyReadings.map((reading) => ({
    id: reading.id,
    date: reading.readingDate.toISOString().slice(0, 10),
    timeSlot: reading.timeSlot,
    value: reading.glucoseValue
  }));
  return {
    selectedDate,
    daily: { range: { start: selectedDate, end: selectedDate }, ...summarize(dailyReadings), readings: daily },
    monthToDate: { range: { start: monthStart, end: selectedDate }, ...summarize(monthToDateReadings) },
    previousMonth: { range: previous, ...summarize(monthlyReadings) }
  };
}
