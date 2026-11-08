import { Droplet } from 'lucide-react';
export default function EmptyState({ title = 'No readings yet', description = 'Add your first glucose reading to start seeing your trends.' }) {
  return <div className="empty-state"><div className="empty-icon"><Droplet size={24} /></div><strong>{title}</strong><p>{description}</p></div>;
}
