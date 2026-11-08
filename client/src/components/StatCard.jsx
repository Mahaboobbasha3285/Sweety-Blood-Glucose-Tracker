import { Activity, ArrowDown, ArrowUp, Hash } from 'lucide-react';

const ICONS = { highest: ArrowUp, lowest: ArrowDown, average: Activity, count: Hash };
export default function StatCard({ type, label, value, suffix = 'mg/dl', tone = 'purple' }) {
  const Icon = ICONS[type] || Activity;
  return <article className={`stat-card ${tone}`}><div className="stat-top"><span>{label}</span><span className="stat-icon"><Icon size={17} /></span></div><div className="stat-value">{value ?? '—'}<small>{value === null ? '' : type === 'count' ? ' readings' : suffix}</small></div></article>;
}
