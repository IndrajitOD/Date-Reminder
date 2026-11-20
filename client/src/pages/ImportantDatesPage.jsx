import React, { useState } from 'react';
import { 
  Search, Globe, Plus, Calendar, Info, CheckCircle2, 
  Sparkles, Heart, Flag, BookOpen, Award, GraduationCap, Trophy, Smile 
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { calculateDaysRemaining, formatDisplayDate, getCategoryBadgeClasses } from '../utils/dateUtils';
import CustomSelect from '../components/common/CustomSelect';

export default function ImportantDatesPage() {
  const { 
    globalCategories, 
    globalEvents, 
    toggleEventSubscription,
    subscribeEntireCategory 
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPrimaryCategory, setSelectedPrimaryCategory] = useState('All');
  const [selectedCountry, setSelectedCountry] = useState('All');

  const countries = ['All', 'Global', 'India', 'International'];

  // Map icons dynamically
  const getCategoryIcon = (iconName) => {
    switch (iconName) {
      case 'Sparkles': return <Sparkles size={18} className="text-rose-500" />;
      case 'Heart': return <Heart size={18} className="text-pink-500" />;
      case 'Flag': return <Flag size={18} className="text-blue-500" />;
      case 'Globe': return <Globe size={18} className="text-emerald-500" />;
      case 'BookOpen': return <BookOpen size={18} className="text-amber-500" />;
      case 'Award': return <Award size={18} className="text-purple-500" />;
      case 'GraduationCap': return <GraduationCap size={18} className="text-cyan-500" />;
      case 'Trophy': return <Trophy size={18} className="text-orange-500" />;
      case 'Smile': return <Smile size={18} className="text-yellow-500" />;
      default: return <Sparkles size={18} className="text-rose-500" />;
    }
  };

  const filteredEvents = globalEvents.filter(ev => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = 
      ev.name.toLowerCase().includes(q) ||
      ev.description.toLowerCase().includes(q) ||
      ev.subCategory.toLowerCase().includes(q);

    const matchesCategory = 
      selectedPrimaryCategory === 'All' || ev.primaryCategory === selectedPrimaryCategory;

    const matchesCountry = 
      selectedCountry === 'All' || ev.country === selectedCountry;

    return matchesSearch && matchesCategory && matchesCountry;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Important Dates</h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
          Curated global catalogue maintained by system administrators. Browse, search, and subscribe to events or entire categories.
        </p>
      </div>

      {/* 9 Primary Global Categories Showcase Cards */}
      <div>
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 px-1">
          Primary Event Categories
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {globalCategories.map(cat => {
            const count = globalEvents.filter(e => e.primaryCategory === cat.name).length;
            const isSelected = selectedPrimaryCategory === cat.name;

            return (
              <div 
                key={cat.slug}
                onClick={() => setSelectedPrimaryCategory(isSelected ? 'All' : cat.name)}
                className={`bg-white rounded-3xl p-4 border cursor-pointer transition-all flex items-start justify-between gap-3 ${
                  isSelected ? 'border-rose-500 ring-2 ring-rose-500/10 shadow-sm' : 'border-slate-100 hover:border-slate-200'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center shrink-0">
                    {getCategoryIcon(cat.icon)}
                  </div>
                  <div>
                    <h4 className="font-bold text-xs sm:text-sm text-slate-900">{cat.name}</h4>
                    <p className="text-[11px] text-slate-400 line-clamp-1">{cat.description}</p>
                    <span className="text-[10px] font-bold text-rose-500 mt-1 inline-block">
                      {count} {count === 1 ? 'event' : 'events'}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    subscribeEntireCategory(cat.name);
                  }}
                  className="text-[10px] font-bold bg-slate-100 hover:bg-rose-50 hover:text-rose-600 px-2.5 py-1 rounded-xl shrink-0 transition-colors"
                  title="Subscribe to all events in this category"
                >
                  Follow All
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-100 shadow-xs space-y-3">
        <div className="relative">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search dates, festivals, or categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-800 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
          />
        </div>

        <div className="flex flex-wrap gap-2.5 pt-1">
          <CustomSelect
            size="sm"
            value={selectedPrimaryCategory}
            onChange={(e) => setSelectedPrimaryCategory(e.target.value)}
            options={[
              { value: 'All', label: 'All 9 Categories' },
              ...globalCategories.map(c => ({ value: c.name, label: c.name }))
            ]}
          />

          <CustomSelect
            size="sm"
            value={selectedCountry}
            onChange={(e) => setSelectedCountry(e.target.value)}
            options={countries.map(c => ({
              value: c,
              label: c === 'All' ? 'All Countries' : c
            }))}
          />
        </div>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredEvents.map((item) => {
          const countdown = calculateDaysRemaining(item.date);

          return (
            <div
              key={item.id}
              className={`bg-white rounded-3xl p-5 border transition-all flex flex-col justify-between gap-4 ${
                item.subscribed ? 'border-rose-200 shadow-sm' : 'border-slate-100 shadow-xs'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${getCategoryBadgeClasses(item.primaryCategory)}`}>
                    {item.primaryCategory}
                  </span>
                  <span className="text-[11px] text-slate-400 font-semibold flex items-center gap-1">
                    <Globe size={12} /> {item.country}
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 text-base leading-snug">
                  {item.name}
                </h3>

                <div className="flex items-center gap-2 mt-2 text-xs text-slate-600 font-semibold">
                  <Calendar size={14} className="text-rose-500" />
                  <span>{formatDisplayDate(item.date)}</span>
                  <span className="text-[10px] text-slate-400 font-medium bg-slate-50 px-2 py-0.5 rounded-md">
                    {countdown.text}
                  </span>
                </div>

                <p className="text-xs text-slate-500 mt-2 line-clamp-3 leading-relaxed">
                  {item.description}
                </p>

                {item.historicalContext && (
                  <p className="text-[11px] text-slate-400 mt-1 italic line-clamp-2">
                    {item.historicalContext}
                  </p>
                )}

                {item.isVariableDate && (
                  <span className="inline-block mt-2 text-[10px] text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md font-semibold">
                    Variable lunisolar date (Calculated annually)
                  </span>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  {item.subscribed ? 'Alerts active' : 'Not subscribed'}
                </span>

                <button
                  onClick={() => toggleEventSubscription(item.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    item.subscribed
                      ? 'bg-rose-50 text-rose-600 border border-rose-100 hover:bg-rose-100'
                      : 'bg-slate-900 hover:bg-slate-800 text-white shadow-xs'
                  }`}
                >
                  {item.subscribed ? (
                    <>
                      <CheckCircle2 size={14} /> Subscribed
                    </>
                  ) : (
                    <>
                      <Plus size={14} /> Subscribe
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
