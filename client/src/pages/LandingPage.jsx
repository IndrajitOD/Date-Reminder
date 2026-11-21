import React, { useState, useEffect } from 'react';
import { 
  Calendar, ArrowRight, Menu, X, 
  Sparkles, Globe, CalendarDays, Bell, Tag, Clock
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import AuthModal from '../components/AuthModal';

export default function LandingPage() {
  const { isAuthenticated } = useApp();

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

  const featureCards = [
    {
      icon: Calendar,
      title: 'Personal Reminders',
      description: 'Save birthdays, anniversaries, appointments, deadlines, and all the dates that matter to you.'
    },
    {
      icon: Globe,
      title: 'Important Dates',
      description: 'Explore festivals, holidays, awareness days, and special occasions from around the world.'
    },
    {
      icon: CalendarDays,
      title: 'Smart Calendar',
      description: 'View your personal reminders and important global events together in one convenient calendar.'
    },
    {
      icon: Bell,
      title: 'Timely Notifications',
      description: 'Stay informed with reminders before your important dates through supported notification channels.'
    },
    {
      icon: Tag,
      title: 'Custom Categories',
      description: 'Keep your dates organized with predefined categories or create your own.'
    },
    {
      icon: Clock,
      title: 'Flexible Scheduling',
      description: 'Choose reminder timings and recurring schedules that suit your needs.'
    }
  ];

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
            </div>
          </div>

          {/* 
            Desktop Navigation:
            - Simplified right side: Sign In + Get Started (or Go to Dashboard)
            - No "Preview" link
          */}
          <div className="hidden md:flex items-center gap-2 sm:gap-3">
            {isAuthenticated ? (
              <Link
                to="/app"
                className="bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-white font-bold text-sm px-5 py-2.5 rounded-2xl shadow-md shadow-rose-500/25 active:scale-95 transition-all"
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
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
              </>
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
      <main className="flex-1 pt-24 sm:pt-28 pb-16">
        {/* 1. Hero Section */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
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

          {/* Primary CTA Button */}
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
        </section>

        {/* 2. Feature Showcase Section */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-16 sm:pt-20">
          <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
              Everything Important, Never Forgotten.
            </h2>
            <p className="mt-3 text-sm sm:text-base text-slate-500 leading-relaxed">
              One simple place to organize your important dates and receive timely reminders.
            </p>
          </div>

          {/* 6 Feature Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {featureCards.map((card, idx) => {
              const Icon = card.icon;
              return (
                <div
                  key={idx}
                  className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs hover:shadow-md hover:border-rose-200 transition-all duration-200 flex flex-col justify-between group"
                >
                  <div>
                    {/* Pink/Red Accent Icon Badge */}
                    <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center mb-5 group-hover:scale-105 group-hover:bg-rose-100/80 transition-all duration-200 shadow-xs">
                      <Icon size={22} className="stroke-[2.2]" />
                    </div>

                    {/* Dark Navy Heading */}
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight mb-2">
                      {card.title}
                    </h3>

                    {/* Muted Description */}
                    <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                      {card.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      {/* 3. Footer */}
      <footer className="border-t border-slate-200/80 bg-white py-6 px-4 text-center text-xs text-slate-500 font-medium">
        <p>Created with ❤️ by Indrajit Bhowmick</p>
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
