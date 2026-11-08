import { prisma } from '../config/prisma.js';
import { AppError } from '../utils/errors.js';
import { todayInAppTimezone, toDatabaseDate } from '../utils/date.js';

const SLOT_LABELS = {
  MORNING_FASTING: 'Morning (fasting)',
  AFTER_BREAKFAST: 'After breakfast',
  AFTER_LUNCH: 'After lunch',
  AFTER_DINNER: 'After dinner'
};

function duplicateSlotError(timeSlot) {
  const label = SLOT_LABELS[timeSlot];
  const article = label.startsWith('After ') ? 'an' : 'a';
  return new AppError(`You already have ${article} ${label} reading for this date.`, 409, 'DUPLICATE_SLOT');
}

function mapReading(reading) {
  return {
    id: reading.id,
    date: reading.readingDate.toISOString().slice(0, 10),
    timeSlot: reading.timeSlot,
    value: reading.glucoseValue,
    createdAt: reading.createdAt,
    updatedAt: reading.updatedAt
  };
}

function validateReadingDate(date) {
  if (date > todayInAppTimezone()) {
    throw new AppError('Date cannot be in the future.', 400, 'FUTURE_DATE');
  }
}

async function validateDailyLimit(userId, date, timeSlot, excludedId = undefined) {
  const readingDate = toDatabaseDate(date);
  const count = await prisma.reading.count({
    where: { userId, readingDate, ...(excludedId ? { id: { not: excludedId } } : {}) }
  });
  if (count >= 4) {
    throw new AppError('You can add only 4 readings per day.', 409, 'DAILY_LIMIT_REACHED');
  }
  const existingForSlot = await prisma.reading.findFirst({
    where: { userId, readingDate, timeSlot, ...(excludedId ? { id: { not: excludedId } } : {}) }
  });
  if (existingForSlot) {
    throw duplicateSlotError(timeSlot);
  }
}

export async function createReading(userId, input) {
  await validateReadingDate(input.date);
  await validateDailyLimit(userId, input.date, input.timeSlot);
  try {
    const reading = await prisma.reading.create({
      data: {
        userId,
        readingDate: toDatabaseDate(input.date),
        timeSlot: input.timeSlot,
        glucoseValue: input.value
      }
    });
    return mapReading(reading);
  } catch (error) {
    if (error?.code === 'P2002') {
      throw duplicateSlotError(input.timeSlot);
    }
    throw error;
  }
}

export async function listReadings(userId, { page, limit, date }) {
  const where = { userId, ...(date ? { readingDate: toDatabaseDate(date) } : {}) };
  const [items, total] = await prisma.$transaction([
    prisma.reading.findMany({
      where,
      orderBy: [{ readingDate: 'desc' }, { timeSlot: 'asc' }],
      skip: (page - 1) * limit,
      take: limit
    }),
    prisma.reading.count({ where })
  ]);
  return { readings: items.map(mapReading), pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
}

export async function updateReading(userId, readingId, input) {
  const existing = await prisma.reading.findFirst({ where: { id: readingId, userId } });
  if (!existing) {
    throw new AppError('Reading not found.', 404, 'READING_NOT_FOUND');
  }
  await validateReadingDate(input.date);
  await validateDailyLimit(userId, input.date, input.timeSlot, readingId);
  try {
    const updated = await prisma.reading.update({
      where: { id: readingId },
      data: {
        readingDate: toDatabaseDate(input.date),
        timeSlot: input.timeSlot,
        glucoseValue: input.value
      }
    });
    return mapReading(updated);
  } catch (error) {
    if (error?.code === 'P2002') {
      throw duplicateSlotError(input.timeSlot);
    }
    throw error;
  }
}

export async function deleteReading(userId, readingId) {
  const existing = await prisma.reading.findFirst({ where: { id: readingId, userId }, select: { id: true } });
  if (!existing) {
    throw new AppError('Reading not found.', 404, 'READING_NOT_FOUND');
  }
  await prisma.reading.delete({ where: { id: readingId } });
  return { message: 'Reading deleted successfully.' };
}
