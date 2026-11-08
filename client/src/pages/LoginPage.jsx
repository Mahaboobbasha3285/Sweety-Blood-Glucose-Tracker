import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { HeartPulse, LockKeyhole, Mail } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { user, login, loading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  if (loading) {return <div className="page-loader"><span className="spinner" />Loading...</div>;}
  if (user) {return <Navigate to="/dashboard" replace />;}

  async function handleSubmit(event) {
    event.preventDefault(); setError(''); setSubmitting(true);
    try { await login({ email, password }); navigate('/dashboard'); }
    catch (submitError) { setError(submitError.message); }
    finally { setSubmitting(false); }
  }

  return <div className="auth-page"><div className="auth-visual"><div className="auth-brand"><span className="brand-mark"><HeartPulse size={22} /></span>Sweety<span className="brand-dot">.</span></div><div className="visual-copy"><span className="eyebrow light">A HEALTHIER ROUTINE STARTS HERE</span><h1>Know your numbers.<br /><em>Own your day.</em></h1><p>A calmer, clearer way to keep track of your blood glucose and your progress.</p><div className="visual-orbit"><div className="orbit-ring ring-one" /><div className="orbit-ring ring-two" /><div className="orbit-center"><HeartPulse size={42} /></div><span className="orbit-bubble bubble-one">96 <small>mg/dl</small></span><span className="orbit-bubble bubble-two">Daily care</span></div></div><div className="visual-footer">A little consistency goes a long way.</div></div><div className="auth-panel"><div className="auth-form-wrap"><div className="mobile-auth-brand"><HeartPulse size={22} /> Sweety</div><span className="eyebrow">WELCOME BACK</span><h2>Good to see you.</h2><p className="auth-subtitle">Sign in to continue to your health dashboard.</p><form onSubmit={handleSubmit} className="auth-form"><label>Email address<div className="input-icon"><Mail size={17} /><input type="email" autoComplete="email" placeholder="you@example.com" value={email} onChange={(event) => setEmail(event.target.value)} required /></div></label><label>Password<div className="input-icon"><LockKeyhole size={17} /><input type="password" autoComplete="current-password" placeholder="Enter your password" value={password} onChange={(event) => setPassword(event.target.value)} required /></div></label>{error && <div className="form-error" role="alert">{error}</div>}<button className="button button-primary button-wide" disabled={submitting}>{submitting ? 'Signing in...' : 'Sign in'}</button></form><p className="auth-switch">New to Sweety? <Link to="/register">Create an account</Link></p><p className="privacy-note">Your health data is private and only visible to you.</p></div></div></div>;
}
