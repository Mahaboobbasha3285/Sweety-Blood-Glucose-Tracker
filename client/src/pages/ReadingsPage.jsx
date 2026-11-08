import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CalendarDays, ChevronLeft, ChevronRight, Pencil, Plus, Trash2 } from 'lucide-react';
import { api } from '../services/api';
import { formatDate, localDateString } from '../utils/dates';
import { SLOT_LABELS } from '../utils/readings';
import ReadingForm from '../components/ReadingForm';
import EmptyState from '../components/EmptyState';

export default function ReadingsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [date, setDate] = useState('');
  const [data, setData] = useState({ readings: [], pagination: { page: 1, totalPages: 1, total: 0 } });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formOpen, setFormOpen] = useState(searchParams.get('new') === '1');
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState('');
  const page = Number(searchParams.get('page') || 1);

  const loadReadings = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const params = new URLSearchParams({ page: String(page), limit: '10' });
      if (date) {params.set('date', date);}
      setData(await api.getReadings(params.toString()));
    } catch (requestError) { setError(requestError.message); }
    finally { setLoading(false); }
  }, [date, page]);

  useEffect(() => { loadReadings(); }, [loadReadings]);
  useEffect(() => { if (searchParams.get('new') === '1') {setFormOpen(true);} }, [searchParams]);

  function closeForm() { setFormOpen(false); setEditing(null); setSearchParams((current) => { const next = new URLSearchParams(current); next.delete('new'); return next; }); }
  function openCreate() { setEditing(null); setFormOpen(true); }
  function openEdit(reading) { setEditing(reading); setFormOpen(true); }

  async function saveReading(input) {
    setSaving(true);
    try {
      if (editing) {await api.updateReading(editing.id, input);}
      else {await api.createReading(input);}
      closeForm(); setNotice(editing ? 'Reading updated successfully.' : 'Reading added successfully.'); await loadReadings();
    } finally { setSaving(false); }
  }

  async function handleDelete(reading) {
    if (!window.confirm(`Delete the ${SLOT_LABELS[reading.timeSlot]} reading of ${reading.value} mg/dl?`)) {return;}
    setNotice(''); setError('');
    try { await api.deleteReading(reading.id); setNotice('Reading deleted successfully.'); await loadReadings(); }
    catch (deleteError) { setError(deleteError.message); }
  }

  return <div className="page-stack"><section className="page-title-row"><div><span className="eyebrow">YOUR HEALTH JOURNAL</span><h1>Readings</h1><p>Every entry is a small piece of the bigger picture.</p></div><button className="button button-primary" onClick={openCreate}><Plus size={17} /> Add reading</button></section>
    <section className="panel table-panel"><div className="panel-heading readings-toolbar"><div><h3>All readings</h3><p>{data.pagination.total} {data.pagination.total === 1 ? 'entry' : 'entries'} in your journal</p></div><label className="date-control"><CalendarDays size={16} /><input type="date" max={localDateString()} value={date} onChange={(event) => { setDate(event.target.value); setSearchParams({ page: '1' }); }} /><button type="button" className="clear-date" onClick={() => setDate('')} aria-label="Clear date filter">×</button></label></div>
      {notice && <div className="success-message" role="status">{notice}</div>}{error && <div className="form-error" role="alert">{error}</div>}
      {loading ? <div className="loading-panel"><span className="spinner" />Loading readings...</div> : data.readings.length ? <><div className="table-scroll"><table className="readings-table"><thead><tr><th>Date</th><th>Time slot</th><th>Glucose value</th><th className="actions-heading">Actions</th></tr></thead><tbody>{data.readings.map((reading) => <tr key={reading.id}><td>{formatDate(reading.date)}</td><td><span className="slot-cell"><span className={`slot-dot ${reading.timeSlot.toLowerCase()}`} />{SLOT_LABELS[reading.timeSlot]}</span></td><td><strong className="table-value">{reading.value}</strong><span className="table-unit">mg/dl</span></td><td><div className="table-actions"><button className="icon-button" onClick={() => openEdit(reading)} aria-label={`Edit ${SLOT_LABELS[reading.timeSlot]} reading`}><Pencil size={16} /></button><button className="icon-button danger" onClick={() => handleDelete(reading)} aria-label={`Delete ${SLOT_LABELS[reading.timeSlot]} reading`}><Trash2 size={16} /></button></div></td></tr>)}</tbody></table></div><div className="pagination"><span>Page {data.pagination.page} of {Math.max(1, data.pagination.totalPages)}</span><div><button className="icon-button" disabled={page <= 1} onClick={() => setSearchParams({ page: String(page - 1) })} aria-label="Previous page"><ChevronLeft size={17} /></button><button className="icon-button" disabled={page >= data.pagination.totalPages} onClick={() => setSearchParams({ page: String(page + 1) })} aria-label="Next page"><ChevronRight size={17} /></button></div></div></> : <EmptyState title={date ? 'No readings for this date' : 'Your journal is waiting'} description={date ? 'Try another date or clear the filter to see all readings.' : 'Add your first glucose reading and it will appear here.'} />}
    </section>{formOpen && <ReadingForm initialReading={editing} onSubmit={saveReading} onClose={closeForm} saving={saving} />}</div>;
}
