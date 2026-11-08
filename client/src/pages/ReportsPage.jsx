import { useEffect, useMemo, useState } from 'react';
import { CalendarDays, ChartNoAxesCombined, TrendingUp } from 'lucide-react';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { api } from '../services/api';
import { formatDate, formatRange, localDateString } from '../utils/dates';
import { SLOT_LABELS } from '../utils/readings';
import StatCard from '../components/StatCard';
import EmptyState from '../components/EmptyState';

function ReportPanel({ title, subtitle, report }) {
  return <article className="panel report-panel"><div className="report-panel-heading"><div><span className="eyebrow">{title}</span><h3>{report ? formatRange(report.range.start, report.range.end) : subtitle}</h3></div><span className="report-icon"><ChartNoAxesCombined size={18} /></span></div><div className="report-stats"><div><span>Highest</span><strong>{report?.highest ?? '—'}<small>{report?.highest === null ? '' : ' mg/dl'}</small></strong></div><div><span>Lowest</span><strong>{report?.lowest ?? '—'}<small>{report?.lowest === null ? '' : ' mg/dl'}</small></strong></div><div><span>Average</span><strong>{report?.average ?? '—'}<small>{report?.average === null ? '' : ' mg/dl'}</small></strong></div><div><span>Readings</span><strong>{report?.count ?? 0}</strong></div></div>{report?.count === 0 && <p className="report-empty">No readings in this period yet.</p>}</article>;
}

export default function ReportsPage() {
  const [date, setDate] = useState(localDateString()); const [reports, setReports] = useState(null); const [loading, setLoading] = useState(true); const [error, setError] = useState('');
  useEffect(() => {
    let active = true; setLoading(true); setError('');
    api.getReports(date).then((data) => { if (active) {setReports(data);} }).catch((requestError) => { if (active) {setError(requestError.message);} }).finally(() => { if (active) {setLoading(false);} });
    return () => { active = false; };
  }, [date]);
  const chartData = useMemo(() => (reports?.daily?.readings || []).map((reading) => ({ slot: SLOT_LABELS[reading.timeSlot].replace(' (fasting)', ''), value: reading.value })), [reports]);
  return <div className="page-stack"><section className="page-title-row"><div><span className="eyebrow">PATTERNS & PROGRESS</span><h1>Your reports</h1><p>A little perspective on the numbers you record.</p></div><label className="date-control"><CalendarDays size={16} /><input type="date" value={date} max={localDateString()} onChange={(event) => setDate(event.target.value)} /></label></section>
    {error && <div className="form-error" role="alert">{error}</div>}
    {loading ? <div className="loading-panel"><span className="spinner" />Preparing your reports...</div> : reports && <><section className="reports-grid"><ReportPanel title="DAILY REPORT" report={reports.daily} /><ReportPanel title="MONTH TO DATE" report={reports.monthToDate} /><ReportPanel title="PREVIOUS MONTH" report={reports.previousMonth} /></section><section className="panel chart-panel"><div className="panel-heading"><div><h3>Daily glucose pattern</h3><p>{formatDate(date)} · Readings by time slot</p></div><span className="chart-heading-icon"><TrendingUp size={18} /></span></div>{chartData.length ? <div className="chart-wrap"><ResponsiveContainer width="100%" height="100%"><LineChart data={chartData} margin={{ top: 12, right: 12, left: -18, bottom: 4 }}><CartesianGrid strokeDasharray="3 5" vertical={false} stroke="#edf0f6" /><XAxis dataKey="slot" axisLine={false} tickLine={false} tick={{ fill: '#8a91a3', fontSize: 11 }} /><YAxis domain={['dataMin - 20', 'dataMax + 20']} axisLine={false} tickLine={false} tick={{ fill: '#8a91a3', fontSize: 11 }} /><Tooltip contentStyle={{ border: '1px solid #edf0f6', borderRadius: 12, boxShadow: '0 8px 28px rgba(30,40,70,.08)' }} formatter={(value) => [`${value} mg/dl`, 'Glucose']} /><Line type="monotone" dataKey="value" stroke="#7865d8" strokeWidth={3} dot={{ r: 5, fill: '#fff', stroke: '#7865d8', strokeWidth: 3 }} activeDot={{ r: 7 }} /></LineChart></ResponsiveContainer></div> : <EmptyState title="Your chart will grow here" description="Record a few readings in a day to see your daily pattern." />}</section><p className="report-disclaimer">Sweety is a tracking tool, not a medical device. Use your healthcare professional's guidance to interpret your readings.</p></>}
  </div>;
}
