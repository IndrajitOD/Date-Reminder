import React, { useState } from 'react';
import { 
  Bell, Calendar, Clock, Plus, ArrowUpRight, 
  Sparkles, CheckCircle2, ChevronRight, Globe, Shield, Heart,
  Tag, ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { calculateDaysRemaining, formatDisplayDate, getCategoryBadgeClasses } from '../utils/dateUtils';
import ReminderModal from '../components/ReminderModal';

export default function DashboardPage() {
  const { currentUser, reminders, globalEvents, toggleEventSubscription } = useApp();
  const [modalOpen, setModalOpen] = useState(false);

  const totalPersonalReminders = reminders.length;
  const subscribedGlobalCount = globalEvents.filter(c => c.subscribed).length;

  const todayReminders = reminders.filter(r => {
    const diff = calculateDaysRemaining(r.date);
    return diff.status === 'today';
  });

  const upcomingReminders = [...reminders]
    .map(r => ({ ...r, countdown: calculateDaysRemaining(r.date) }))
    .filter(r => r.countdown.status !== 'past')
    .sort((a, b) => a.countdown.days - b.countdown.days);

  const nearestReminder = upcomingReminders[0];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Welcome back, {currentUser?.name?.split(' ')[0] || 'Friend'} 👋
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-rose-500 to-red-600 text-white font-bold py-3 px-5 rounded-2xl shadow-lg shadow-rose-500/25 hover:shadow-rose-500/40 active:scale-95 transition-all text-sm self-start sm:self-auto"
        >
          <Plus size={18} className="stroke-[2.5]" />
          <span>Quick Add Reminder</span>
        </button>
      </div>

      {/* Overview Cards */}
      <div>
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 px-1">
          System Overview
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm">
            <div className="w-11 h-11 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center mb-3">
              <Bell size={20} className="stroke-[2.2]" />
            </div>
            <p className="text-2xl font-black text-slate-900">{totalPersonalReminders}</p>
            <p className="text-xs font-semibold text-slate-400 mt-0.5">Personal Reminders</p>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm">
            <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center mb-3">
              <Clock size={20} className="stroke-[2.2]" />
            </div>
            <p className="text-2xl font-black text-slate-900">{todayReminders.length}</p>
            <p className="text-xs font-semibold text-slate-400 mt-0.5">Events Today</p>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm">
            <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center mb-3">
              <Globe size={20} className="stroke-[2.2]" />
            </div>
            <p className="text-2xl font-black text-slate-900">{subscribedGlobalCount}</p>
            <p className="text-xs font-semibold text-slate-400 mt-0.5">Global Subscriptions</p>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm">
            <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center mb-3">
              <CheckCircle2 size={20} className="stroke-[2.2]" />
            </div>
            <p className="text-2xl font-black text-slate-900">
              {currentUser?.notificationPreferences?.masterEnabled ? 'Active' : 'Muted'}
            </p>
            <p className="text-xs font-semibold text-slate-400 mt-0.5">Master Status</p>
          </div>
        </div>
      </div>

      {/* Immediate Attention Card (Premium SaaS dark obsidian with glowing crimson & rich typography hierarchy) */}
      <div className="relative overflow-hidden rounded-[24px] bg-gradient-to-br from-[#0b0e17] via-[#120d18] to-[#1a0c16] text-white p-6 sm:p-8 shadow-2xl shadow-slate-950/20 border border-slate-800/80">
        {/* Subtle decorative radiant glow */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-gradient-to-br from-rose-600/25 via-red-600/10 to-transparent blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-1/3 -mb-20 w-64 h-64 rounded-full bg-rose-950/30 blur-2xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            {/* Pulsing indicator tag */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/15 border border-rose-500/25 text-rose-400 text-xs font-bold tracking-wider uppercase">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
              </span>
              <span>Immediate Attention</span>
              {upcomingReminders.length > 0 && (
                <span className="ml-1 text-[11px] font-black px-1.5 py-0.2 rounded-md bg-rose-500 text-white">
                  {upcomingReminders.length}
                </span>
              )}
            </div>
            
            {nearestReminder ? (
              <div className="space-y-2.5">
                <div>
                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white line-clamp-1">
                    {nearestReminder.title}
                  </h2>
                  {nearestReminder.notes && (
                    <p className="text-xs sm:text-sm text-slate-300/80 line-clamp-1 mt-1 font-medium">
                      {nearestReminder.notes}
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2.5 pt-1 text-xs text-slate-300">
                  <span className="inline-flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-xl font-semibold text-white border border-white/10 shadow-xs backdrop-blur-md">
                    <Calendar size={13} className="text-rose-400 stroke-[2.2]" />
                    {formatDisplayDate(nearestReminder.date)}
                  </span>
                  <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-rose-500 to-red-600 text-white px-3 py-1.5 rounded-xl font-bold shadow-md shadow-rose-500/25">
                    <Clock size={13} className="stroke-[2.2]" />
                    {nearestReminder.countdown.text}
                  </span>
                  {nearestReminder.categoryName && (
                    <span className="inline-flex items-center gap-1 bg-white/5 border border-white/10 text-slate-200 px-2.5 py-1.5 rounded-xl font-medium">
                      <Tag size={12} className="text-slate-400" />
                      {nearestReminder.categoryName}
                    </span>
                  )}
                  {nearestReminder.channels && nearestReminder.channels.length > 0 && (
                    <span className="text-xs text-slate-400 font-medium pl-1 hidden sm:inline">
                      Via {nearestReminder.channels.join(', ')}
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-1">
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                  All Caught Up! 🎉
                </h2>
                <p className="text-sm text-slate-400">
                  You have no pending urgent dates. Add a birthday, anniversary, or bill to activate smart tracking.
                </p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 shrink-0 pt-2 lg:pt-0">
            <button
              onClick={() => setModalOpen(true)}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 bg-white text-slate-900 font-bold px-6 py-3.5 rounded-xl shadow-lg shadow-black/20 hover:bg-slate-100 active:scale-95 transition-all text-sm group"
            >
              <Plus size={16} className="text-rose-600 stroke-[3] group-hover:rotate-90 transition-transform" />
              <span>Add Reminder</span>
            </button>
            <Link
              to="/app/important-dates"
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 text-white font-semibold px-5 py-3.5 rounded-xl backdrop-blur-md border border-white/15 active:scale-95 transition-all text-sm"
            >
              <Globe size={16} className="text-rose-400" />
              <span>Explore Catalog</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Two Columns Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col: Upcoming Reminders */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="font-extrabold text-base text-slate-900 tracking-tight">
              Upcoming Reminders
            </h3>
            <Link to="/app/reminders" className="text-xs font-bold text-rose-500 hover:text-rose-600 flex items-center gap-1">
              View all ({reminders.length}) <ChevronRight size={14} />
            </Link>
          </div>

          <div className="space-y-3">
            {upcomingReminders.slice(0, 4).map((rem) => (
              <div
                key={rem.id}
                className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-100 shadow-xs hover:border-slate-200 transition-all flex items-center justify-between gap-4"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${getCategoryBadgeClasses(rem.categoryName)}`}>
                      {rem.categoryName}
                    </span>
                    {rem.personName && (
                      <span className="text-xs text-slate-400 font-medium">
                        for {rem.personName}
                      </span>
                    )}
                    <span className="text-[11px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-medium">
                      {rem.recurrence}
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm sm:text-base truncate">
                    {rem.title}
                  </h4>
                  <p className="text-xs text-slate-400 flex items-center gap-2 mt-1">
                    <span className="inline-flex items-center gap-1">
                      <Calendar size={13} className="text-slate-400" />
                      {formatDisplayDate(rem.date)}
                    </span>
                    <span>•</span>
                    <span>Via {rem.channels.join(', ')}</span>
                  </p>
                </div>

                <div className="shrink-0 text-right">
                  <span className={`inline-block px-3 py-1 rounded-xl text-xs font-extrabold ${
                    rem.countdown.days <= 3 
                      ? 'bg-rose-50 text-rose-600 border border-rose-100' 
                      : 'bg-slate-100 text-slate-600'
                  }`}>
                    {rem.countdown.text}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Col: Quick Actions & Global Catalog Spotlight */}
        <div className="space-y-4">
          <div className="bg-white rounded-3xl p-5 border border-slate-100 space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Quick Actions
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs font-bold">
              <Link to="/app/reminders?new=1" className="p-3 rounded-2xl bg-slate-50 hover:bg-rose-50 hover:text-rose-600 text-slate-700 transition-colors flex flex-col gap-1.5">
                <Plus size={16} className="text-rose-500" />
                <span>Add Reminder</span>
              </Link>
              <Link to="/app/important-dates" className="p-3 rounded-2xl bg-slate-50 hover:bg-rose-50 hover:text-rose-600 text-slate-700 transition-colors flex flex-col gap-1.5">
                <Globe size={16} className="text-blue-500" />
                <span>Explore Dates</span>
              </Link>
              <Link to="/app/calendar" className="p-3 rounded-2xl bg-slate-50 hover:bg-rose-50 hover:text-rose-600 text-slate-700 transition-colors flex flex-col gap-1.5">
                <Calendar size={16} className="text-amber-500" />
                <span>Open Calendar</span>
              </Link>
              <Link to="/app/settings" className="p-3 rounded-2xl bg-slate-50 hover:bg-rose-50 hover:text-rose-600 text-slate-700 transition-colors flex flex-col gap-1.5">
                <Shield size={16} className="text-emerald-500" />
                <span>Notifications</span>
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-slate-100 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-extrabold text-sm text-slate-900">Follow Global Dates</h4>
              <Link to="/app/important-dates" className="text-xs font-bold text-rose-500 hover:text-rose-600">
                View all
              </Link>
            </div>
            <div className="space-y-2.5">
              {globalEvents.slice(0, 3).map(ev => (
                <div key={ev.id} className="flex items-center justify-between gap-2 pb-2.5 border-b border-slate-100 last:border-none last:pb-0">
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">{ev.name}</p>
                    <p className="text-[11px] text-slate-400">{formatDisplayDate(ev.date)} • {ev.country}</p>
                  </div>
                  <button
                    onClick={() => toggleEventSubscription(ev.id)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold shrink-0 transition-colors ${
                      ev.subscribed 
                        ? 'bg-rose-50 text-rose-600 border border-rose-100' 
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    {ev.subscribed ? 'Following' : '+ Follow'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {modalOpen && (
        <ReminderModal onClose={() => setModalOpen(false)} />
      )}
    </div>
  );
}
