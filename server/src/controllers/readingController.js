import { readingSchema, listReadingsSchema, readingIdSchema } from '../validators/readings.js';
import { createReading, listReadings, updateReading, deleteReading } from '../services/readingService.js';

export async function getReadings(req, res) {
  const query = listReadingsSchema.parse(req.query);
  return res.json(await listReadings(req.user.id, query));
}

export async function postReading(req, res) {
  const input = readingSchema.parse(req.body);
  return res.status(201).json({ reading: await createReading(req.user.id, input) });
}

export async function putReading(req, res) {
  const input = readingSchema.parse(req.body);
  const readingId = readingIdSchema.parse(req.params.id);
  return res.json({ reading: await updateReading(req.user.id, readingId, input) });
}

export async function removeReading(req, res) {
  const readingId = readingIdSchema.parse(req.params.id);
  return res.json(await deleteReading(req.user.id, readingId));
}
