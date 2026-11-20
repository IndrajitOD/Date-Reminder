import React, { useState, useEffect } from 'react';
import { 
  Calendar, ArrowRight, Menu, X, 
  Sparkles, Heart, Award, Shield, Bell, CheckCircle2
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import AuthModal from '../components/AuthModal';

export default function LandingPage() {
  const { isAuthenticated } = useApp();
  const navigate = useNavigate();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalView, setAuthModalView] = useState('login'); // 'login' | 'register'

  const openSignInModal = () => {
    setAuthModalView('login');
    setAuthModalOpen(true);
    setMobileMenuOpen(false);
  };

  const openSignUpModal = () => {
    setAuthModalView('register');
    setAuthModalOpen(true);
    setMobileMenuOpen(false);
  };

  // Prevent background scrolling while the mobile menu is open & handle Escape
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e) => {
        if (e.key === 'Escape') setMobileMenuOpen(false);
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = 'unset';
        window.removeEventListener('keydown', handleKeyDown);
      };
    } else if (!authModalOpen) {
      document.body.style.overflow = 'unset';
    }
  }, [mobileMenuOpen, authModalOpen]);

  return (
    <div className="min-h-screen bg-[#f4f5f9] flex flex-col text-slate-800">
      {/* 
        Fixed Navbar:
        - Stays fixed to top during scroll
        - Clean white background with backdrop blur & subtle border/shadow
        - High z-index (z-50) so it always floats above content
      */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 sm:h-18 flex items-center justify-between">
          {/* 
            Brand Logo & Name:
            - Purely visual (NO anchor, NO click handlers, NO pointer cursor)
            - Preserves exact branding and styling
          */}
          <div className="flex items-center gap-3 select-none cursor-default" aria-label="Date Reminder">
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
          </div>

          {/* 
            Desktop Navigation:
            - Minimal right side: Optional Preview jump link + Authentication Action buttons
          */}
          <div className="hidden md:flex items-center gap-4">
            <a 
              href="#preview" 
              className="text-sm font-semibold text-slate-500 hover:text-slate-900 px-3 py-2 rounded-xl transition-colors"
            >
              Preview
            </a>

            {isAuthenticated ? (
              <Link
                to="/app"
                className="bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-white font-bold text-sm px-5 py-2.5 rounded-2xl shadow-md shadow-rose-500/25 active:scale-95 transition-all"
              >
                Go to Dashboard
              </Link>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={openSignInModal}
                  className="text-slate-600 hover:text-slate-900 font-semibold text-sm px-4 py-2 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={openSignUpModal}
                  className="bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-white font-bold text-sm px-5 py-2.5 rounded-2xl shadow-md shadow-rose-500/25 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Get Started</span>
                  <ArrowRight size={15} />
                </button>
              </div>
            )}
          </div>

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-700 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-colors active:scale-95 cursor-pointer"
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* 
          Simplified Mobile Menu:
          - Only Sign In and Get Started (or Go to Dashboard if authenticated)
        */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-slate-100 shadow-xl px-5 py-4 space-y-2.5 animate-in slide-in-from-top-2 duration-150">
            {isAuthenticated ? (
              <Link
                to="/app"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-3 text-sm font-bold text-white bg-gradient-to-r from-rose-500 to-red-600 rounded-xl shadow-md shadow-rose-500/25 block"
              >
                Go to Dashboard
              </Link>
            ) : (
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={openSignInModal}
                  className="w-full text-center py-2.5 text-sm font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-xl block transition-colors cursor-pointer"
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={openSignUpModal}
                  className="w-full text-center py-2.5 text-sm font-bold text-white bg-gradient-to-r from-rose-500 to-red-600 rounded-xl shadow-md shadow-rose-500/25 block transition-transform active:scale-98 cursor-pointer"
                >
                  Get Started
                </button>
              </div>
            )}
          </div>
        )}
      </header>

      {/* Main Page Container: Top padding ensures content starts below the fixed navbar */}
      <main className="flex-1 pt-20 sm:pt-24 pb-12">
        {/* Hero Section */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          {/* Introductory badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-600 border border-rose-100 mb-5 shadow-xs">
            <Sparkles size={13} className="stroke-[2.5]" />
            <span>Intelligent Personal Date Alerts</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight max-w-3xl mx-auto leading-[1.12]">
            Never Forget a Date <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-red-600">
              That Matters.
            </span>
          </h1>

          {/* Introductory Description */}
          <p className="mt-4 text-sm sm:text-base text-slate-500 max-w-xl mx-auto leading-relaxed">
            Keep every important moment close. Organize birthdays, anniversaries, and personal milestones in one place, with smart alerts delivered right on time.
          </p>

          {/* Primary CTA Buttons */}
          <div className="mt-7 flex flex-col sm:flex-row items-center justify-center gap-3">
            {isAuthenticated ? (
              <Link
                to="/app"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-rose-500 to-red-600 text-white font-bold py-3.5 px-8 rounded-2xl shadow-lg shadow-rose-500/25 hover:shadow-rose-500/40 active:scale-95 transition-all text-sm"
              >
                <span>Go to Dashboard</span>
                <ArrowRight size={17} />
              </Link>
            ) : (
              <button
                type="button"
                onClick={openSignUpModal}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-rose-500 to-red-600 text-white font-bold py-3.5 px-8 rounded-2xl shadow-lg shadow-rose-500/25 hover:shadow-rose-500/40 active:scale-95 transition-all text-sm cursor-pointer"
              >
                <span>Get Started Free</span>
                <ArrowRight size={17} />
              </button>
            )}
          </div>

          {/* Live Alert Monitor Preview Card */}
          <div className="mt-10 sm:mt-12 max-w-2xl mx-auto text-left" id="preview">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0c0f17] via-[#120d18] to-[#180b15] text-white p-5 sm:p-7 shadow-2xl shadow-slate-900/15 border border-slate-800">
              {/* Radial gradient glow */}
              <div className="absolute top-0 right-0 -mr-16 -mt-16 w-72 h-72 rounded-full bg-gradient-to-br from-rose-600/30 via-red-600/10 to-transparent blur-3xl pointer-events-none" />

              <div className="relative z-10 flex items-center justify-between pb-3.5 border-b border-slate-800/90 mb-4">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500" />
                  </span>
                  <span className="text-xs font-bold uppercase tracking-wider text-rose-400">Live Alert Monitor</span>
                </div>
                <span className="text-xs text-slate-400 font-medium">3 Upcoming Notifications</span>
              </div>

              {/* Event Cards */}
              <div className="relative z-10 space-y-2.5">
                <div className="bg-white/5 hover:bg-white/10 backdrop-blur-md rounded-2xl p-3.5 border border-white/5 flex items-center justify-between gap-3 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
                      <Heart size={16} />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-white text-sm truncate">Mom's Birthday Celebration</h4>
                      <p className="text-xs text-slate-400 mt-0.5">Nov 28 • Notice: 3 days prior</p>
                    </div>
                  </div>
                  <div className="shrink-0 flex items-center gap-2">
                    <span className="text-xs font-bold bg-rose-500 text-white px-2.5 py-1 rounded-xl shadow-xs">
                      In 7 days
                    </span>
                  </div>
                </div>

                <div className="bg-white/5 hover:bg-white/10 backdrop-blur-md rounded-2xl p-3.5 border border-white/5 flex items-center justify-between gap-3 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                      <Award size={16} />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-white text-sm truncate">Health Insurance Renewal</h4>
                      <p className="text-xs text-slate-400 mt-0.5">Dec 01 • Annual Policy Renewal</p>
                    </div>
                  </div>
                  <div className="shrink-0 flex items-center gap-2">
                    <span className="text-xs font-bold bg-amber-500 text-slate-950 px-2.5 py-1 rounded-xl shadow-xs">
                      In 10 days
                    </span>
                  </div>
                </div>

                <div className="bg-white/5 hover:bg-white/10 backdrop-blur-md rounded-2xl p-3.5 border border-white/5 flex items-center justify-between gap-3 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                      <Calendar size={16} />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-white text-sm truncate">Diwali Festival of Lights</h4>
                      <p className="text-xs text-slate-400 mt-0.5">Catalog Subscription • Cultural</p>
                    </div>
                  </div>
                  <div className="shrink-0 flex items-center gap-2">
                    <span className="text-xs font-bold bg-blue-500/80 text-white px-2.5 py-1 rounded-xl shadow-xs">
                      In 14 days
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/80 bg-white py-6 px-4 text-center text-xs text-slate-400">
        <p>© 2026 Date Reminder. All rights reserved.</p>
      </footer>

      {/* Authentication Popup Modal over Landing Page */}
      <AuthModal
        isOpen={authModalOpen}
        initialView={authModalView}
        onClose={() => setAuthModalOpen(false)}
      />
    </div>
  );
}
