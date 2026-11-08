import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { HeartPulse, LockKeyhole, Mail, UserRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const { user, register, login, loading } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState(''); const [email, setEmail] = useState(''); const [password, setPassword] = useState('');
  const [error, setError] = useState(''); const [submitting, setSubmitting] = useState(false);
  if (loading) {return <div className="page-loader"><span className="spinner" />Loading...</div>;}
  if (user) {return <Navigate to="/dashboard" replace />;}
  async function handleSubmit(event) {
    event.preventDefault(); setError(''); setSubmitting(true);
    try { await register({ name, email, password }); await login({ email, password }); navigate('/dashboard'); }
    catch (submitError) { setError(submitError.message); }
    finally { setSubmitting(false); }
  }
  return <div className="auth-page"><div className="auth-visual"><div className="auth-brand"><span className="brand-mark"><HeartPulse size={22} /></span>Sweety<span className="brand-dot">.</span></div><div className="visual-copy"><span className="eyebrow light">YOUR HEALTH, IN YOUR HANDS</span><h1>Make room for<br /><em>better habits.</em></h1><p>One simple place for your daily readings, gentle insights and progress over time.</p><div className="visual-orbit"><div className="orbit-ring ring-one" /><div className="orbit-ring ring-two" /><div className="orbit-center"><HeartPulse size={42} /></div><span className="orbit-bubble bubble-one">4 slots <small>per day</small></span><span className="orbit-bubble bubble-two">Your journey</span></div></div><div className="visual-footer">Start with one reading. Build from there.</div></div><div className="auth-panel"><div className="auth-form-wrap"><div className="mobile-auth-brand"><HeartPulse size={22} /> Sweety</div><span className="eyebrow">GET STARTED</span><h2>Create your account.</h2><p className="auth-subtitle">A few details and your glucose journal is ready.</p><form onSubmit={handleSubmit} className="auth-form"><label>Your name<div className="input-icon"><UserRound size={17} /><input autoComplete="name" placeholder="Your full name" value={name} onChange={(event) => setName(event.target.value)} minLength={2} maxLength={100} required /></div></label><label>Email address<div className="input-icon"><Mail size={17} /><input type="email" autoComplete="email" placeholder="you@example.com" value={email} onChange={(event) => setEmail(event.target.value)} required /></div></label><label>Password<div className="input-icon"><LockKeyhole size={17} /><input type="password" autoComplete="new-password" placeholder="At least 8 characters" value={password} onChange={(event) => setPassword(event.target.value)} minLength={8} maxLength={72} required /></div></label>{error && <div className="form-error" role="alert">{error}</div>}<button className="button button-primary button-wide" disabled={submitting}>{submitting ? 'Creating account...' : 'Create account'}</button></form><p className="auth-switch">Already have an account? <Link to="/login">Sign in</Link></p><p className="privacy-note">Your health data is private and only visible to you.</p></div></div></div>;
}
