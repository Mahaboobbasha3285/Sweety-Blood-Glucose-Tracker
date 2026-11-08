import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CalendarDays, Plus, Sparkles } from 'lucide-react';
import { api } from '../services/api';
import { localDateString, formatDate } from '../utils/dates';
import { SLOT_LABELS } from '../utils/readings';
import StatCard from '../components/StatCard';
import EmptyState from '../components/EmptyState';

export default function DashboardPage() {
  const [date, setDate] = useState(localDateString());
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    let active = true; setLoading(true); setError('');
    api.getReports(date).then((data) => { if (active) {setReport(data.daily);} })
      .catch((requestError) => { if (active) {setError(requestError.message);} })
      .finally(() => { if (active) {setLoading(false);} });
    return () => { active = false; };
  }, [date]);
  return <div className="page-stack"><section className="welcome-banner"><div className="welcome-copy"><span className="eyebrow light"><Sparkles size={13} /> YOUR PERSONAL HEALTH SPACE</span><h1>A healthier day,<br />one reading at a time.</h1><p>Keep your glucose journal close and your progress in view.</p><Link className="button button-white" to="/readings?new=1"><Plus size={17} /> Add a reading</Link></div><div className="welcome-art"><div className="art-circle art-one" /><div className="art-circle art-two" /><div className="art-card"><span>DAILY CHECK-IN</span><strong>You're doing<br />great.</strong><div className="art-pulse"><span /><span /><span /><span /><span /><span /><span /></div><small>Consistency over perfection</small></div><div className="art-spark">✳</div></div></section>
    <section className="section-block"><div className="section-heading"><div><span className="eyebrow">YOUR OVERVIEW</span><h2>Today's snapshot</h2></div><label className="date-control"><CalendarDays size={16} /><input type="date" value={date} max={localDateString()} onChange={(event) => setDate(event.target.value)} /></label></div>
      {error && <div className="form-error" role="alert">{error}</div>}
      {loading ? <div className="loading-panel"><span className="spinner" />Loading your readings...</div> : <><div className="stats-grid"><StatCard type="highest" label="Highest reading" value={report?.highest} tone="peach" /><StatCard type="lowest" label="Lowest reading" value={report?.lowest} tone="mint" /><StatCard type="average" label="Daily average" value={report?.average} tone="lavender" /><StatCard type="count" label="Readings logged" value={report?.count ?? 0} tone="sky" /></div><div className="panel reading-preview"><div className="panel-heading"><div><h3>Daily readings</h3><p>{formatDate(date)}</p></div><Link to="/readings">View all <ArrowRight size={15} /></Link></div>{report?.readings?.length ? <div className="reading-list">{report.readings.map((reading) => <div className="reading-row" key={reading.id}><span className={`slot-dot ${reading.timeSlot.toLowerCase()}`} /><span className="reading-slot">{SLOT_LABELS[reading.timeSlot]}</span><strong>{reading.value}<small> mg/dl</small></strong></div>)}</div> : <EmptyState title="A fresh page for today" description="No readings recorded for this date yet. Add one whenever you're ready." />}</div></>}
    </section></div>;
}
