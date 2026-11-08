import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Activity, ChartNoAxesCombined, LayoutDashboard, LogOut, Plus, HeartPulse } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  async function handleLogout() {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      window.alert(error.message);
    }
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="/" aria-label="Sweety home"><span className="brand-mark"><HeartPulse size={22} /></span><span>Sweety<span className="brand-dot">.</span></span></a>
        <div className="side-label">WORKSPACE</div>
        <nav className="side-nav">
          <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}><LayoutDashboard size={18} />Overview</NavLink>
          <NavLink to="/readings" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}><Activity size={18} />Readings</NavLink>
          <NavLink to="/reports" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}><ChartNoAxesCombined size={18} />Reports</NavLink>
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-note"><div className="note-icon"><HeartPulse size={17} /></div><strong>Small steps matter.</strong><span>Every reading helps you understand your health a little better.</span></div>
          <button className="profile-row" onClick={handleLogout}><span className="avatar">{user?.name?.charAt(0)?.toUpperCase() || 'S'}</span><span className="profile-copy"><strong>{user?.name}</strong><small>Sign out</small></span><LogOut size={17} /></button>
        </div>
      </aside>
      <main className="main-area">
        <header className="topbar"><div className="mobile-brand"><HeartPulse size={20} /> Sweety</div><div className="topbar-right"><span className="status-dot" /> Your health space <span className="top-avatar">{user?.name?.charAt(0)?.toUpperCase()}</span></div></header>
        <div className="content-area"><Outlet /></div>
      </main>
      <NavLink className="mobile-add" to="/readings?new=1" aria-label="Add a reading"><Plus size={22} /></NavLink>
    </div>
  );
}
