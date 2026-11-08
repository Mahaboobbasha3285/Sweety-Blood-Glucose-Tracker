import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const password = process.env.SEED_DEMO_PASSWORD;
  if (!password || password.length < 8) {
    throw new Error('Set SEED_DEMO_PASSWORD to a password of at least 8 characters before running the seed.');
  }
  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.upsert({
    where: { email: 'demo@sweety.local' },
    update: { name: 'Sweety Demo', passwordHash },
    create: { name: 'Sweety Demo', email: 'demo@sweety.local', passwordHash }
  });
  const today = new Date();
  const timezone = process.env.APP_TIMEZONE || 'Asia/Kolkata';
  const dateParts = new Intl.DateTimeFormat('en-CA', { timeZone: timezone, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(today);
  const dateValues = Object.fromEntries(dateParts.map(({ type, value }) => [type, value]));
  const date = new Date(`${dateValues.year}-${dateValues.month}-${dateValues.day}T00:00:00.000Z`);
  const samples = [
    { timeSlot: 'MORNING_FASTING', glucoseValue: 96 },
    { timeSlot: 'AFTER_BREAKFAST', glucoseValue: 132 },
    { timeSlot: 'AFTER_LUNCH', glucoseValue: 145 },
    { timeSlot: 'AFTER_DINNER', glucoseValue: 128 }
  ];
  for (const sample of samples) {
    await prisma.reading.upsert({
      where: { user_date_slot_unique: { userId: user.id, readingDate: date, timeSlot: sample.timeSlot } },
      update: { glucoseValue: sample.glucoseValue },
      create: { userId: user.id, readingDate: date, ...sample }
    });
  }
  console.log('Demo account ready: demo@sweety.local');
}

main().catch((error) => {
  console.error('Seed failed:', error);
  process.exitCode = 1;
}).finally(async () => {
  await prisma.$disconnect();
});
