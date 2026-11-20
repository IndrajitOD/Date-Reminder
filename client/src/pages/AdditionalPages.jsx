import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, ChevronLeft, ChevronRight, Filter, 
  Plus, CheckCircle2, Trash2, Edit3, X, Globe, User, RotateCcw
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatDisplayDate, getCategoryBadgeClasses, calculateDaysRemaining } from '../utils/dateUtils';
import ReminderModal from '../components/ReminderModal';
import CustomSelect from '../components/common/CustomSelect';

export function CalendarViewPage() {
  const { 
    reminders, 
    globalEvents, 
    deleteReminder, 
    toggleEventSubscription,
    customCategories 
  } = useApp();

  const [currentDate, setCurrentDate] = useState(new Date(2026, 10, 1)); // Default to Nov 2026
  const [calendarView, setCalendarView] = useState('month'); // 'day', 'week', 'month', 'year'
  
  // Filtering states
  const [sourceFilter, setSourceFilter] = useState('all'); // 'all', 'personal', 'global'
  const [categoryFilter, setCategoryFilter] = useState('all');
  
  // Selected Date Detail Drawer
  const [selectedDateEvents, setSelectedDateEvents] = useState(null);
  const [selectedDateStr, setSelectedDateStr] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Combine unified events
  const combinedEvents = [
    ...reminders.map(r => ({ ...r, eventType: 'personal', title: r.title, date: r.date, category: r.categoryName })),
    ...globalEvents.map(g => ({ ...g, eventType: 'global', title: g.name, date: g.date, category: g.primaryCategory }))
  ];

  // Apply filters
  const filteredEvents = combinedEvents.filter(ev => {
    if (sourceFilter === 'personal' && ev.eventType !== 'personal') return false;
    if (sourceFilter === 'global' && ev.eventType !== 'global') return false;
    if (categoryFilter !== 'all' && ev.category !== categoryFilter) return false;
    return true;
  });

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Navigation handlers
  const handlePrev = () => {
    if (calendarView === 'month') {
      setCurrentDate(new Date(year, month - 1, 1));
    } else if (calendarView === 'year') {
      setCurrentDate(new Date(year - 1, 0, 1));
    } else if (calendarView === 'week') {
      setCurrentDate(new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000));
    } else {
      setCurrentDate(new Date(currentDate.getTime() - 24 * 60 * 60 * 1000));
    }
  };

  const handleNext = () => {
    if (calendarView === 'month') {
      setCurrentDate(new Date(year, month + 1, 1));
    } else if (calendarView === 'year') {
      setCurrentDate(new Date(year + 1, 0, 1));
    } else if (calendarView === 'week') {
      setCurrentDate(new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000));
    } else {
      setCurrentDate(new Date(currentDate.getTime() + 24 * 60 * 60 * 1000));
    }
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Dynamic Navigation Label based on active view and date
  const getNavigationLabel = () => {
    if (calendarView === 'month') {
      return `${monthNames[month]} ${year}`;
    }
    if (calendarView === 'year') {
      return `${year}`;
    }
    if (calendarView === 'week') {
      const startOfWeek = new Date(currentDate);
      startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);

      const startMonth = monthNames[startOfWeek.getMonth()].slice(0, 3);
      const endMonth = monthNames[endOfWeek.getMonth()].slice(0, 3);

      if (startOfWeek.getMonth() === endOfWeek.getMonth()) {
        return `${startMonth} ${startOfWeek.getDate()} - ${endOfWeek.getDate()}, ${startOfWeek.getFullYear()}`;
      }
      return `${startMonth} ${startOfWeek.getDate()} - ${endMonth} ${endOfWeek.getDate()}, ${endOfWeek.getFullYear()}`;
    }
    // Day view
    return currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const openDateDetail = (dateString, eventsOnDate) => {
    setSelectedDateStr(dateString);
    setSelectedDateEvents(eventsOnDate);
  };

  // Build Month Grid Data
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sunday
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // Check if current view is showing today's period
  const isViewingToday = (() => {
    const today = new Date();
    if (calendarView === 'month') {
      return today.getMonth() === month && today.getFullYear() === year;
    }
    if (calendarView === 'year') {
      return today.getFullYear() === year;
    }
    return today.toDateString() === currentDate.toDateString();
  })();

  return (
    <div className="space-y-6">
      {/* Header & View Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Interactive Calendar</h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Unified chronological schedule merging your private personal reminders and global catalog dates.
          </p>
        </div>

        {/* View Switchers & Navigation Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="bg-white p-1 rounded-2xl border border-slate-200/80 shadow-xs flex items-center">
            {['month', 'week', 'day', 'year'].map(v => (
              <button
                key={v}
                onClick={() => setCalendarView(v)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                  calendarView === v ? 'bg-rose-500 text-white shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {v}
              </button>
            ))}
          </div>

          {/* Jump to Today Button */}
          <button
            onClick={handleToday}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-2xl border text-xs font-bold transition-all shadow-xs ${
              isViewingToday
                ? 'bg-rose-50 border-rose-200 text-rose-600'
                : 'bg-white border-slate-200/80 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
            }`}
            title="Jump back to current date"
          >
            <RotateCcw size={13} className={isViewingToday ? 'text-rose-500' : 'text-slate-400'} />
            <span>Today</span>
          </button>

          {/* Previous / Dynamic Label / Next Stepper */}
          <div className="flex items-center bg-white px-1.5 py-1 rounded-2xl border border-slate-200/80 shadow-xs">
            <button 
              onClick={handlePrev} 
              className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              aria-label="Previous period"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="px-3 py-1 text-xs font-extrabold text-slate-800 min-w-[110px] text-center select-none">
              {getNavigationLabel()}
            </span>
            <button 
              onClick={handleNext} 
              className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              aria-label="Next period"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Filter Control Bar */}
      <div className="bg-white rounded-3xl p-4 border border-slate-100 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <CalendarIcon size={18} className="text-rose-500" />
          <span className="text-base font-extrabold text-slate-900">
            {getNavigationLabel()}
          </span>
          <span className="text-xs text-slate-400 font-semibold ml-1">
            ({filteredEvents.length} events)
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-bold uppercase tracking-wider text-[11px]">Source:</span>
            <CustomSelect
              size="sm"
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              options={[
                { value: 'all', label: 'All Dates' },
                { value: 'personal', label: 'My Personal Dates' },
                { value: 'global', label: 'Pre-stored Global Dates' }
              ]}
            />
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-bold uppercase tracking-wider text-[11px]">Category:</span>
            <CustomSelect
              size="sm"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              options={[
                { value: 'all', label: 'All Categories' },
                { value: 'Uncategorized', label: 'Uncategorized' },
                ...customCategories.map(c => ({ value: c.name, label: c.name })),
                { value: 'Celebrations & Festivals', label: 'Celebrations & Festivals' },
                { value: 'Love & Relationships', label: 'Love & Relationships' },
                { value: 'National & Public Holidays', label: 'National & Public Holidays' },
                { value: 'International & Awareness Days', label: 'International & Awareness' },
                { value: 'Historical & Memorial Days', label: 'Historical & Memorial' },
                { value: 'Entertainment & Pop Culture', label: 'Entertainment & Pop Culture' }
              ]}
            />
          </div>
        </div>
      </div>

      {/* View: MONTH VIEW */}
      {calendarView === 'month' && (
        <div className="bg-white rounded-3xl p-4 sm:p-6 border border-slate-100 shadow-xs overflow-hidden">
          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-1 text-center font-bold text-xs text-slate-400 uppercase tracking-wider mb-2">
            <span>Sun</span>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
          </div>

          {/* Month Cells Grid */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {/* Empty offset padding cells */}
            {Array.from({ length: firstDayIndex }).map((_, idx) => (
              <div key={`empty-${idx}`} className="h-20 sm:h-28 rounded-2xl bg-slate-50/40 border border-transparent"></div>
            ))}

            {daysArray.map((day) => {
              const formattedDay = day < 10 ? `0${day}` : `${day}`;
              const formattedMonth = month + 1 < 10 ? `0${month + 1}` : `${month + 1}`;
              const dateStr = `${year}-${formattedMonth}-${formattedDay}`;

              const dayEvents = filteredEvents.filter(e => e.date === dateStr);
              const isToday = new Date().toISOString().slice(0, 10) === dateStr;
              const isSelected = selectedDateStr === dateStr;

              return (
                <div
                  key={day}
                  onClick={() => openDateDetail(dateStr, dayEvents)}
                  className={`h-22 sm:h-28 rounded-2xl p-1.5 sm:p-2 border transition-all cursor-pointer flex flex-col justify-between group ${
                    isSelected
                      ? 'border-rose-500 bg-rose-50/40 ring-2 ring-rose-500/30 shadow-xs'
                      : isToday 
                        ? 'border-rose-400 bg-rose-50/20' 
                        : 'border-slate-100 hover:border-slate-300 bg-white hover:bg-slate-50/80'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span 
                      className={`inline-flex items-center justify-center text-xs font-black transition-all ${
                        isToday 
                          ? 'w-6 h-6 rounded-full bg-rose-500 text-white shadow-xs font-bold' 
                          : isSelected
                            ? 'w-6 h-6 rounded-full bg-slate-900 text-white font-bold'
                            : 'text-slate-700 group-hover:text-slate-900 pl-0.5'
                      }`}
                    >
                      {day}
                    </span>

                    {/* Prominent Event Indicators */}
                    {dayEvents.length > 0 && (
                      <div className="flex items-center gap-1">
                        {dayEvents.slice(0, 3).map((ev, dotIdx) => (
                          <span
                            key={dotIdx}
                            className={`w-2 h-2 rounded-full ring-1 ring-white ${
                              ev.eventType === 'personal' ? 'bg-rose-500 shadow-xs' : 'bg-blue-500'
                            }`}
                            title={`${ev.title} (${ev.eventType})`}
                          />
                        ))}
                        {dayEvents.length > 3 && (
                          <span className="text-[9px] font-black text-rose-500 leading-none">
                            +{dayEvents.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Event Chips / Labels */}
                  <div className="space-y-1 overflow-hidden mt-1">
                    {dayEvents.slice(0, 2).map((ev, i) => (
                      <div
                        key={i}
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md truncate flex items-center gap-1 ${
                          ev.eventType === 'personal'
                            ? 'bg-rose-100/90 text-rose-900 border border-rose-200/60'
                            : 'bg-slate-100 text-slate-700 border border-slate-200/60'
                        }`}
                        title={ev.title}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${ev.eventType === 'personal' ? 'bg-rose-500' : 'bg-blue-500'}`} />
                        <span className="truncate">{ev.title}</span>
                      </div>
                    ))}
                    {dayEvents.length > 2 && (
                      <span className="text-[9px] font-extrabold text-slate-400 block px-1 leading-tight">
                        +{dayEvents.length - 2} more
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* View: WEEK VIEW */}
      {calendarView === 'week' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-4">
          <h3 className="font-extrabold text-sm text-slate-800">7-Day Week Schedule</h3>
          <div className="grid grid-cols-1 sm:grid-cols-7 gap-3">
            {Array.from({ length: 7 }).map((_, idx) => {
              const dayDate = new Date(currentDate.getTime() + idx * 24 * 60 * 60 * 1000);
              const dateStr = dayDate.toISOString().slice(0, 10);
              const events = filteredEvents.filter(e => e.date === dateStr);

              return (
                <div key={idx} className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col gap-2 min-h-36">
                  <div className="text-center pb-2 border-b border-slate-200/60">
                    <p className="text-[10px] font-bold uppercase text-slate-400">
                      {dayDate.toLocaleDateString('en-US', { weekday: 'short' })}
                    </p>
                    <p className="text-base font-black text-slate-900">{dayDate.getDate()}</p>
                  </div>
                  <div className="space-y-1.5 flex-1">
                    {events.map((ev, i) => (
                      <div key={i} className="p-1.5 rounded-xl bg-white border border-slate-100 text-[11px] font-bold text-slate-800">
                        {ev.title}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* View: DAY VIEW */}
      {calendarView === 'day' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-4">
          <h3 className="font-extrabold text-sm text-slate-800">
            Events for {currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </h3>
          {filteredEvents.filter(e => e.date === currentDate.toISOString().slice(0, 10)).length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">No events scheduled for this specific day.</p>
          ) : (
            <div className="space-y-3">
              {filteredEvents.filter(e => e.date === currentDate.toISOString().slice(0, 10)).map((ev, i) => (
                <div key={i} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${getCategoryBadgeClasses(ev.category)}`}>
                      {ev.category}
                    </span>
                    <h4 className="font-bold text-slate-900 text-sm mt-1">{ev.title}</h4>
                    {ev.notes && <p className="text-xs text-slate-400 mt-0.5">{ev.notes}</p>}
                  </div>
                  <span className="text-xs font-bold text-rose-500 uppercase">{ev.eventType}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* View: YEAR VIEW */}
      {calendarView === 'year' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-4">
          <h3 className="font-extrabold text-sm text-slate-800">Year Overview {year}</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {monthNames.map((mName, mIdx) => {
              const monthEvents = filteredEvents.filter(e => {
                if (!e.date) return false;
                const [y, m] = e.date.split('-').map(Number);
                return y === year && m === mIdx + 1;
              });

              return (
                <div 
                  key={mName}
                  onClick={() => {
                    setCurrentDate(new Date(year, mIdx, 1));
                    setCalendarView('month');
                  }}
                  className="p-4 rounded-2xl bg-slate-50 hover:bg-rose-50/50 border border-slate-100 hover:border-rose-200 transition-all cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-sm text-slate-800">{mName}</span>
                    <span className="text-xs font-bold text-rose-500">{monthEvents.length}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    {monthEvents.length === 1 ? '1 scheduled date' : `${monthEvents.length} scheduled dates`}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Selected Date Detail Drawer Modal */}
      {selectedDateStr && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={() => setSelectedDateStr(null)} />
          <div className="relative w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl border border-slate-100 space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-extrabold text-base text-slate-900">
                  {formatDisplayDate(selectedDateStr)}
                </h3>
                <p className="text-xs text-slate-400">Scheduled events on this date</p>
              </div>
              <button onClick={() => setSelectedDateStr(null)} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg">
                <X size={18} />
              </button>
            </div>

            {selectedDateEvents && selectedDateEvents.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-xs text-slate-400">No events recorded on this date.</p>
                <button
                  onClick={() => {
                    setSelectedDateStr(null);
                    setIsModalOpen(true);
                  }}
                  className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 bg-rose-500 text-white rounded-xl text-xs font-bold"
                >
                  <Plus size={14} /> Add Event for This Date
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {selectedDateEvents && selectedDateEvents.map((ev, i) => (
                  <div key={i} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${getCategoryBadgeClasses(ev.category)}`}>
                          {ev.category}
                        </span>
                        <span className="text-[10px] text-slate-400 uppercase font-semibold">
                          {ev.eventType}
                        </span>
                      </div>
                      <h4 className="font-bold text-slate-900 text-sm">{ev.title}</h4>
                      {ev.notes && <p className="text-xs text-slate-500 mt-1">{ev.notes}</p>}
                      {ev.description && <p className="text-xs text-slate-500 mt-1">{ev.description}</p>}
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {ev.eventType === 'personal' ? (
                        <>
                          <button
                            onClick={() => {
                              setSelectedDateStr(null);
                              setEditingItem(ev);
                              setIsModalOpen(true);
                            }}
                            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
                            title="Edit"
                          >
                            <Edit3 size={15} />
                          </button>
                          <button
                            onClick={() => {
                              deleteReminder(ev.id);
                              setSelectedDateStr(null);
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg"
                            title="Delete"
                          >
                            <Trash2 size={15} />
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => toggleEventSubscription(ev.id)}
                          className={`text-xs font-bold px-3 py-1 rounded-xl ${
                            ev.subscribed ? 'bg-rose-50 text-rose-600' : 'bg-slate-900 text-white'
                          }`}
                        >
                          {ev.subscribed ? 'Unfollow' : 'Follow'}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {isModalOpen && (
        <ReminderModal
          onClose={() => { setEditingItem(null); setIsModalOpen(false); }}
          editData={editingItem}
        />
      )}
    </div>
  );
}

export function ProfilePage() {
  const { currentUser } = useApp();

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Account Profile</h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-0.5">Manage your user details and preferences.</p>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-xs space-y-6">
        <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-rose-600 to-rose-500 text-white font-black text-2xl flex items-center justify-center shadow-lg shadow-rose-500/25">
            {currentUser?.name?.charAt(0) || 'U'}
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">{currentUser?.name}</h3>
            <p className="text-xs text-slate-400">{currentUser?.email}</p>
            <span className="inline-block mt-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full">
              Active Member
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="bg-slate-50 p-4 rounded-2xl">
            <span className="text-slate-400 block mb-1">Full Name</span>
            <span className="font-bold text-slate-800 text-sm">{currentUser?.name}</span>
          </div>
          <div className="bg-slate-50 p-4 rounded-2xl">
            <span className="text-slate-400 block mb-1">Email</span>
            <span className="font-bold text-slate-800 text-sm">{currentUser?.email}</span>
          </div>
          <div className="bg-slate-50 p-4 rounded-2xl">
            <span className="text-slate-400 block mb-1">Phone Number</span>
            <span className="font-bold text-slate-800 text-sm">{currentUser?.phone}</span>
          </div>
          <div className="bg-slate-50 p-4 rounded-2xl">
            <span className="text-slate-400 block mb-1">Timezone</span>
            <span className="font-bold text-slate-800 text-sm">{currentUser?.timezone}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
