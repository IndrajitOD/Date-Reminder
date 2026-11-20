import React, { useState, useEffect, useRef } from 'react';
import { Calendar, Mail, Lock, User, ArrowRight, AlertCircle, CheckCircle2, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { resetPasswordWithFirebase } from '../services/authService';

function parseFirebaseError(err) {
  const code = err?.code || '';
  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Incorrect email or password.';
    case 'auth/email-already-in-use':
      return 'An account with this email already exists.';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/popup-closed-by-user':
      return 'Sign-in popup was closed before completion.';
    case 'auth/popup-blocked':
      return 'Sign-in popup was blocked by your browser. Please allow popups.';
    case 'auth/network-request-failed':
      return 'Network connection failed. Please try again.';
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Please try again later.';
    default:
      return err?.message || 'Authentication error. Please try again.';
  }
}

function GoogleIcon() {
  return (
    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  );
}

/**
 * AuthModal - Popup Dialog over Landing Page
 * Supports seamless switching between 'login', 'register', and 'forgot' views.
 */
export default function AuthModal({ isOpen, onClose, initialView = 'login' }) {
  const navigate = useNavigate();
  const { login, register, signInWithGoogle } = useApp();
  
  const [view, setView] = useState(initialView); // 'login' | 'register' | 'forgot'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);

  const modalRef = useRef(null);

  // Sync initial view when opened
  useEffect(() => {
    if (isOpen) {
      setView(initialView);
      setError('');
      setForgotSent(false);
    }
  }, [isOpen, initialView]);

  // Prevent background scrolling and handle Escape key
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e) => {
        if (e.key === 'Escape') onClose();
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = 'unset';
        window.removeEventListener('keydown', handleKeyDown);
      };
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Sign In Handler
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }

    setLoading(true);
    try {
      await login(email.trim(), password);
      onClose();
      navigate('/app');
    } catch (err) {
      setError(parseFirebaseError(err));
    } finally {
      setLoading(false);
    }
  };

  // Sign Up Handler
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name || !email || !password) {
      setError('Please fill in all required fields.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (confirmPassword && password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await register(email.trim(), password, name.trim());
      onClose();
      navigate('/app');
    } catch (err) {
      setError(parseFirebaseError(err));
    } finally {
      setLoading(false);
    }
  };

  // Google Sign-In Handler
  const handleGoogleSignIn = async () => {
    setError('');
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
      onClose();
      navigate('/app');
    } catch (err) {
      setError(parseFirebaseError(err));
    } finally {
      setGoogleLoading(false);
    }
  };

  // Forgot Password Handler
  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email) {
      setError('Please enter your registered email address.');
      return;
    }

    setLoading(true);
    try {
      await resetPasswordWithFirebase(email.trim());
      setForgotSent(true);
    } catch (err) {
      setError(parseFirebaseError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[90] flex items-center justify-center p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      {/* Dark translucent backdrop (clicking backdrop closes modal) */}
      <div 
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog Box (clicks inside DO NOT close) */}
      <div 
        ref={modalRef}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100 my-auto animate-in zoom-in-95 fade-in duration-150 z-10 max-h-[90vh] overflow-y-auto"
      >
        {/* Top Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
          aria-label="Close dialog"
        >
          <X size={18} />
        </button>

        {/* Modal Brand Header */}
        <div className="text-center mb-5">
          <div className="inline-flex w-11 h-11 rounded-2xl bg-gradient-to-tr from-rose-600 to-rose-500 items-center justify-center text-white shadow-md shadow-rose-500/25 mb-3">
            <Calendar size={22} className="stroke-[2.5]" />
          </div>
          <h2 id="auth-modal-title" className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {view === 'login' && 'Welcome Back'}
            {view === 'register' && 'Create Your Account'}
            {view === 'forgot' && 'Reset Password'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {view === 'login' && 'Sign in to access your smart reminders'}
            {view === 'register' && 'Start organizing your milestones with intelligent alerts'}
            {view === 'forgot' && "Enter your email to receive a recovery link"}
          </p>
        </div>

        {/* Inline Error Banner */}
        {error && (
          <div className="mb-4 flex items-center gap-2 p-3 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 text-xs font-semibold animate-in fade-in duration-150">
            <AlertCircle size={16} className="shrink-0" />
            <span className="flex-1">{error}</span>
          </div>
        )}

        {/* ================= VIEW: SIGN IN ================= */}
        {view === 'login' && (
          <div className="space-y-4">
            {/* Continue with Google button */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={googleLoading || loading}
              className="w-full flex items-center justify-center gap-3 bg-slate-50 hover:bg-slate-100 border border-slate-200/90 text-slate-700 font-bold py-2.5 px-4 rounded-xl text-xs shadow-xs active:scale-98 transition-all disabled:opacity-60"
            >
              <GoogleIcon />
              <span>{googleLoading ? 'Connecting to Google...' : 'Continue with Google'}</span>
            </button>

            <div className="relative flex items-center justify-center">
              <div className="border-t border-slate-100 w-full" />
              <span className="bg-white px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest absolute">
                Or sign in with email
              </span>
            </div>

            <form onSubmit={handleLoginSubmit} className="space-y-3 pt-1">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1" htmlFor="modal-email">
                  Email Address
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    id="modal-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider" htmlFor="modal-password">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => { setError(''); setView('forgot'); }}
                    className="text-xs font-semibold text-rose-500 hover:text-rose-600"
                  >
                    Forgot?
                  </button>
                </div>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    id="modal-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || googleLoading}
                className="w-full mt-2 flex items-center justify-center gap-2 bg-gradient-to-r from-rose-500 to-red-600 text-white font-bold py-3 rounded-xl shadow-md shadow-rose-500/25 hover:shadow-rose-500/40 active:scale-95 transition-all text-xs disabled:opacity-60"
              >
                <span>{loading ? 'Signing in...' : 'Sign In'}</span>
                {!loading && <ArrowRight size={15} />}
              </button>
            </form>

            <p className="text-center text-xs text-slate-400 pt-2">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => { setError(''); setView('register'); }}
                className="font-bold text-rose-500 hover:text-rose-600 underline"
              >
                Create account
              </button>
            </p>
          </div>
        )}

        {/* ================= VIEW: SIGN UP ================= */}
        {view === 'register' && (
          <div className="space-y-4">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={googleLoading || loading}
              className="w-full flex items-center justify-center gap-3 bg-slate-50 hover:bg-slate-100 border border-slate-200/90 text-slate-700 font-bold py-2.5 px-4 rounded-xl text-xs shadow-xs active:scale-98 transition-all disabled:opacity-60"
            >
              <GoogleIcon />
              <span>{googleLoading ? 'Connecting to Google...' : 'Continue with Google'}</span>
            </button>

            <div className="relative flex items-center justify-center">
              <div className="border-t border-slate-100 w-full" />
              <span className="bg-white px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest absolute">
                Or register with email
              </span>
            </div>

            <form onSubmit={handleRegisterSubmit} className="space-y-3 pt-1">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1" htmlFor="reg-name">
                  Full Name
                </label>
                <div className="relative">
                  <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    id="reg-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Alex Morgan"
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1" htmlFor="reg-email">
                  Email Address
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    id="reg-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1" htmlFor="reg-password">
                  Password (min 6 chars)
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    id="reg-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || googleLoading}
                className="w-full mt-2 flex items-center justify-center gap-2 bg-gradient-to-r from-rose-500 to-red-600 text-white font-bold py-3 rounded-xl shadow-md shadow-rose-500/25 hover:shadow-rose-500/40 active:scale-95 transition-all text-xs disabled:opacity-60"
              >
                <span>{loading ? 'Creating account...' : 'Create Account'}</span>
                {!loading && <ArrowRight size={15} />}
              </button>
            </form>

            <p className="text-center text-xs text-slate-400 pt-2">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => { setError(''); setView('login'); }}
                className="font-bold text-rose-500 hover:text-rose-600 underline"
              >
                Sign In
              </button>
            </p>
          </div>
        )}

        {/* ================= VIEW: FORGOT PASSWORD ================= */}
        {view === 'forgot' && (
          <div className="space-y-4">
            {forgotSent ? (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-800 text-center text-xs space-y-2 animate-in fade-in duration-150">
                <CheckCircle2 size={24} className="text-emerald-500 mx-auto" />
                <p className="font-bold text-sm">Recovery Link Sent</p>
                <p className="leading-relaxed">
                  If an account exists for <strong className="text-emerald-900">{email}</strong>, a password reset link was dispatched.
                </p>
                <button
                  type="button"
                  onClick={() => { setForgotSent(false); setView('login'); }}
                  className="mt-2 inline-block font-bold text-rose-600 hover:underline"
                >
                  Return to Sign In
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1" htmlFor="forgot-email">
                    Registered Email
                  </label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      id="forgot-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      required
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-rose-500 to-red-600 text-white font-bold py-3 rounded-xl shadow-md shadow-rose-500/25 hover:shadow-rose-500/40 active:scale-95 transition-all text-xs disabled:opacity-60"
                >
                  {loading ? 'Sending email...' : 'Send Recovery Email'}
                </button>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => { setError(''); setView('login'); }}
                    className="text-xs font-semibold text-slate-500 hover:text-slate-800"
                  >
                    Cancel and return to Sign In
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
