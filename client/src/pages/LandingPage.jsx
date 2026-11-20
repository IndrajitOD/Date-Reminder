import React, { useState } from 'react';
import { 
  Calendar, Bell, Shield, ArrowRight, Menu, X, 
  Sparkles, CheckCircle2, Heart, Award, ArrowUpRight 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export default function LandingPage() {
  const { isAuthenticated } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#f4f5f9] flex flex-col text-slate-800">
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-600 to-rose-500 flex items-center justify-center text-white shadow-md shadow-rose-500/25">
              <Calendar size={20} className="stroke-[2.5]" />
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight text-slate-900 block leading-tight">
                Date<span className="text-rose-500">Reminder</span>
              </span>
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest block">
                Next-Gen Alerts
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-500">
            <a href="#features" className="hover:text-slate-900 transition-colors">Features</a>
            <a href="#channels" className="hover:text-slate-900 transition-colors">Channels</a>
            <a href="#preview" className="hover:text-slate-900 transition-colors">Preview</a>
          </nav>

          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <Link
                to="/app"
                className="bg-rose-500 hover:bg-rose-600 text-white font-semibold text-sm px-5 py-2.5 rounded-2xl shadow-md shadow-rose-500/20 active:scale-95 transition-all"
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-slate-600 hover:text-slate-900 font-semibold text-sm px-4 py-2 rounded-xl transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="bg-rose-500 hover:bg-rose-600 text-white font-semibold text-sm px-5 py-2.5 rounded-2xl shadow-md shadow-rose-500/25 active:scale-95 transition-all flex items-center gap-1.5"
                >
                  <span>Get Started</span>
                  <ArrowRight size={16} />
                </Link>
              </>
            )}
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-600 rounded-xl"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-slate-100 px-6 py-4 space-y-3">
            <a href="#features" onClick={() => setMobileMenuOpen(false)} className="block text-sm font-semibold text-slate-600">Features</a>
            <a href="#channels" onClick={() => setMobileMenuOpen(false)} className="block text-sm font-semibold text-slate-600">Channels</a>
            <div className="pt-2 flex flex-col gap-2">
              <Link to="/login" className="w-full text-center py-2.5 text-sm font-semibold text-slate-700 bg-slate-100 rounded-xl">Sign In</Link>
              <Link to="/register" className="w-full text-center py-2.5 text-sm font-semibold text-white bg-rose-500 rounded-xl">Get Started</Link>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 pt-12 sm:pt-20 pb-12 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-600 border border-rose-100 mb-6">
          <Sparkles size={14} />
          <span>Intelligent Multi-Channel Date Alerts</span>
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight max-w-3xl mx-auto leading-[1.12]">
          Never Forget a Date <br className="hidden sm:inline" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-red-600">
            That Matters.
          </span>
        </h1>

        <p className="mt-5 text-base sm:text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed">
          Keep every important moment close. Organize birthdays, anniversaries, personal milestones, 
          and special occasions in one place, with reminders delivered through your preferred channels.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/register"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-rose-500 to-red-600 text-white font-bold py-3.5 px-7 rounded-2xl shadow-lg shadow-rose-500/25 hover:shadow-rose-500/40 active:scale-95 transition-all text-sm"
          >
            <span>Get Started Free</span>
            <ArrowRight size={18} />
          </Link>
          <a
            href="#features"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white text-slate-700 font-semibold py-3.5 px-6 rounded-2xl border border-slate-200 hover:bg-slate-50 active:scale-95 transition-all text-sm"
          >
            Explore Features
          </a>
        </div>

        {/* Hero Preview Card (Replicating the reference photo card) */}
        <div className="mt-12 sm:mt-16 max-w-3xl mx-auto" id="preview">
          <div className="relative overflow-hidden rounded-3xl bg-[#0e1017] text-white p-6 sm:p-8 shadow-2xl shadow-slate-900/15 border border-slate-800 text-left">
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-gradient-to-br from-rose-600/40 via-red-600/20 to-transparent blur-3xl pointer-events-none"></div>

            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></span>
                <span className="text-xs font-bold uppercase tracking-wider text-rose-400">Live Alert Monitor</span>
              </div>
              <span className="text-xs text-slate-400">3 Upcoming Notifications</span>
            </div>

            <div className="space-y-3">
              <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
                    <Heart size={18} />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-white text-sm truncate">Mom's Birthday Celebration</h4>
                    <p className="text-xs text-slate-400">Nov 15 • Lead time: 3 days prior</p>
                  </div>
                </div>
                <div className="shrink-0 flex items-center gap-2">
                  <span className="hidden sm:inline-block text-[11px] bg-white/10 px-2.5 py-1 rounded-lg text-slate-300">WhatsApp</span>
                  <span className="text-xs font-bold bg-rose-500 text-white px-3 py-1 rounded-xl">In 14 days</span>
                </div>
              </div>

              <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                    <Award size={18} />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-white text-sm truncate">Health Insurance Premium</h4>
                    <p className="text-xs text-slate-400">Nov 05 • Annual Policy #HI-883921</p>
                  </div>
                </div>
                <div className="shrink-0 flex items-center gap-2">
                  <span className="hidden sm:inline-block text-[11px] bg-white/10 px-2.5 py-1 rounded-lg text-slate-300">Email</span>
                  <span className="text-xs font-bold bg-amber-500 text-slate-950 px-3 py-1 rounded-xl">In 4 days</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Cards Grid */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-12" id="features">
        <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 text-center mb-2">Capabilities</h2>
        <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 text-center mb-10">Built for Effortless Recall</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center mb-4">
              <Calendar size={22} />
            </div>
            <h3 className="font-bold text-base text-slate-900 mb-1">Personal Reminders</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Track birthdays, anniversaries, and custom events with custom advance schedules.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center mb-4">
              <Sparkles size={22} />
            </div>
            <h3 className="font-bold text-base text-slate-900 mb-1">Curated Catalog</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Follow holidays, cultural festivals, and variable lunisolar observances with one tap.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center mb-4">
              <Bell size={22} />
            </div>
            <h3 className="font-bold text-base text-slate-900 mb-1">Multi-Channel</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Automate notices across Email, WhatsApp Business messaging, and Web Push.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-500 flex items-center justify-center mb-4">
              <Shield size={22} />
            </div>
            <h3 className="font-bold text-base text-slate-900 mb-1">Private & Safe</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Your personal data and dates are safely isolated to your account credentials.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-8 px-4 text-center text-xs text-slate-400">
        <p>© 2026 Name Date Reminder. All rights reserved.</p>
      </footer>
    </div>
  );
}
