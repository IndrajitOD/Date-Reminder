import React from 'react';
import { 
  ArrowLeft, Construction, Sparkles, LayoutDashboard, 
  Calendar, Bell, HeartHandshake, Mail
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AboutPage() {
  return (
    <div className="min-h-[75vh] flex items-center justify-center p-4">
      <div className="relative w-full max-w-lg bg-white rounded-3xl p-8 sm:p-10 border border-slate-100 shadow-xl shadow-slate-900/5 text-center space-y-6 overflow-hidden">
        {/* Soft background decorative glow */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-gradient-to-br from-rose-500/10 via-red-500/5 to-transparent blur-2xl pointer-events-none" />

        {/* Development Badge Icon */}
        <div className="relative z-10 w-20 h-20 rounded-3xl bg-gradient-to-tr from-rose-500 to-red-600 text-white flex items-center justify-center mx-auto shadow-xl shadow-rose-500/25">
          <Construction size={36} className="stroke-[2.2] animate-bounce-short" />
        </div>

        {/* Text Content */}
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 border border-rose-200/60 text-rose-600 text-xs font-bold uppercase tracking-wider">
            <Sparkles size={13} className="stroke-[2.5]" />
            <span>Work in Progress</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Still in Development
          </h1>

          <p className="text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
            The comprehensive About section, feature documentation, and support center are currently being crafted. Please return to the dashboard to manage your reminders.
          </p>
        </div>

        {/* Quick Return Action Button */}
        <div className="relative z-10 pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/app"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-rose-500 to-red-600 text-white font-bold py-3.5 px-6 rounded-2xl shadow-lg shadow-rose-500/25 hover:shadow-rose-500/40 active:scale-95 transition-all text-sm"
          >
            <LayoutDashboard size={18} className="stroke-[2.2]" />
            <span>Return to Dashboard</span>
          </Link>

          <Link
            to="/app/reminders"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold py-3.5 px-5 rounded-2xl border border-slate-200/80 active:scale-95 transition-all text-sm"
          >
            <Bell size={16} className="text-rose-500" />
            <span>My Reminders</span>
          </Link>
        </div>

        {/* Footer info note */}
        <div className="relative z-10 pt-4 border-t border-slate-100 text-[11px] text-slate-400 font-medium">
          Date Reminder v1.2.0 • Intelligent date tracking & smart alerts
        </div>
      </div>
    </div>
  );
}
