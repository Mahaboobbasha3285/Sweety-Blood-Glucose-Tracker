import { reportDateSchema } from '../validators/readings.js';
import { getReports } from '../services/reportService.js';

export async function reports(req, res) {
  const { date } = reportDateSchema.parse(req.query);
  return res.json(await getReports(req.user.id, date));
}
