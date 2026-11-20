import React, { useState, useEffect } from 'react';
import { 
  Search, Plus, Trash2, Edit3, Calendar, Clock, User, Bell, Tag, FolderPlus, X 
} from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { calculateDaysRemaining, formatDisplayDate, getCategoryBadgeClasses } from '../utils/dateUtils';
import ReminderModal from '../components/ReminderModal';
import CustomSelect from '../components/common/CustomSelect';

export default function RemindersPage() {
  const { 
    reminders, 
    deleteReminder, 
    customCategories, 
    suggestedCategories,
    addCategory, 
    deleteCategory 
  } = useApp();

  const [searchParams, setSearchParams] = useSearchParams();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedTimeline, setSelectedTimeline] = useState('all');
  const [sortBy, setSortBy] = useState('date-asc');
  const [editingItem, setEditingItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Category Manager Drawer / Modal
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatColor, setNewCatColor] = useState('#e11d48');

  useEffect(() => {
    if (searchParams.get('new') === '1') {
      setIsModalOpen(true);
      searchParams.delete('new');
      setSearchParams(searchParams);
    }
  }, [searchParams, setSearchParams]);

  const handleCreateCategory = (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    addCategory(newCatName.trim(), newCatColor);
    setNewCatName('');
  };

  // Distinct category filters including Uncategorized
  const allCategoryOptions = [
    'All',
    'Uncategorized',
    ...customCategories.map(c => c.name),
    ...suggestedCategories.filter(s => !customCategories.some(c => c.name === s))
  ];

  const filteredReminders = reminders
    .filter(item => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = 
        item.title.toLowerCase().includes(q) || 
        (item.personName && item.personName.toLowerCase().includes(q)) ||
        (item.notes && item.notes.toLowerCase().includes(q));

      const matchesCategory = 
        selectedCategory === 'All' ? true :
        selectedCategory === 'Uncategorized' ? (!item.categoryId || item.categoryName === 'Uncategorized') :
        item.categoryName === selectedCategory;

      const countdown = calculateDaysRemaining(item.date);
      const matchesTimeline = 
        selectedTimeline === 'all' ? true :
        selectedTimeline === 'upcoming' ? countdown.status !== 'past' :
        selectedTimeline === 'past' ? countdown.status === 'past' : true;

      return matchesSearch && matchesCategory && matchesTimeline;
    })
    .sort((a, b) => {
      if (sortBy === 'date-asc') {
        return new Date(a.date) - new Date(b.date);
      } else if (sortBy === 'date-desc') {
        return new Date(b.date) - new Date(a.date);
      } else {
        return a.title.localeCompare(b.title);
      }
    });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">My Dates</h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Manage your personal dates, birthdays, anniversaries, and custom categories.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            onClick={() => setShowCategoryManager(true)}
            className="inline-flex items-center justify-center gap-2 bg-white text-slate-700 font-bold py-3 px-4 rounded-2xl border border-slate-200 hover:bg-slate-50 transition-colors text-sm"
          >
            <Tag size={16} className="text-slate-500" />
            <span>Manage Categories</span>
          </button>

          <button
            onClick={() => { setEditingItem(null); setIsModalOpen(true); }}
            className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-rose-500 to-red-600 text-white font-bold py-3 px-5 rounded-2xl shadow-lg shadow-rose-500/25 hover:shadow-rose-500/40 active:scale-95 transition-all text-sm"
          >
            <Plus size={18} className="stroke-[2.5]" />
            <span>Add Reminder</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-100 shadow-xs space-y-3">
        <div className="relative">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by title, contact name, or notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-800 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
          />
        </div>

        <div className="flex flex-wrap gap-2.5 pt-1">
          <CustomSelect
            size="sm"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            options={allCategoryOptions.map(c => ({
              value: c,
              label: c === 'All' ? 'All Categories' : c
            }))}
          />

          <CustomSelect
            size="sm"
            value={selectedTimeline}
            onChange={(e) => setSelectedTimeline(e.target.value)}
            options={[
              { value: 'all', label: 'All Dates' },
              { value: 'upcoming', label: 'Upcoming Only' },
              { value: 'past', label: 'Past Only' }
            ]}
          />

          <div className="ml-auto">
            <CustomSelect
              size="sm"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              options={[
                { value: 'date-asc', label: 'Date: Nearest first' },
                { value: 'date-desc', label: 'Date: Farthest first' },
                { value: 'title', label: 'Alphabetical' }
              ]}
            />
          </div>
        </div>
      </div>

      {/* Reminders List */}
      {filteredReminders.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 border border-slate-100 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
            <Calendar size={24} />
          </div>
          <h3 className="font-extrabold text-slate-800 text-base">No personal reminders found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">Try modifying your category filter or search query.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredReminders.map((item) => {
            const countdown = calculateDaysRemaining(item.date);
            const isUrgent = countdown.days <= 3 && countdown.status !== 'past';

            return (
              <div
                key={item.id}
                className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs hover:shadow-md hover:border-slate-200 transition-all flex flex-col justify-between gap-4"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${getCategoryBadgeClasses(item.categoryName)}`}>
                      {item.categoryName}
                    </span>
                    <span className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full ${
                      isUrgent 
                        ? 'bg-rose-50 text-rose-600 border border-rose-100' 
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      {countdown.text}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-base leading-snug">
                    {item.title}
                  </h3>

                  {item.personName && (
                    <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-1 font-medium">
                      <User size={13} className="text-slate-400" />
                      {item.personName}
                    </p>
                  )}

                  <div className="flex items-center gap-2 mt-2 text-xs text-slate-600 font-semibold">
                    <Calendar size={14} className="text-rose-500" />
                    <span>{formatDisplayDate(item.date)}</span>
                    <span className="text-[10px] text-slate-400 font-medium bg-slate-50 px-2 py-0.5 rounded-md">
                      {item.recurrence}
                    </span>
                  </div>

                  {item.notes && (
                    <p className="text-xs text-slate-400 mt-2 bg-slate-50 p-2.5 rounded-xl line-clamp-2">
                      {item.notes}
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    {item.channels.map(ch => (
                      <span key={ch} className="bg-rose-50 text-rose-600 font-bold px-2 py-0.5 rounded-md text-[10px]">
                        {ch}
                      </span>
                    ))}
                    <span className="text-[10px] text-slate-400">({item.reminderDaysBefore}d)</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => { setEditingItem(item); setIsModalOpen(true); }}
                      className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit3 size={15} />
                    </button>
                    <button
                      onClick={() => deleteReminder(item.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Reminder Create/Edit Modal */}
      {isModalOpen && (
        <ReminderModal
          onClose={() => { setEditingItem(null); setIsModalOpen(false); }}
          editData={editingItem}
        />
      )}

      {/* Category Management Drawer */}
      {showCategoryManager && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={() => setShowCategoryManager(false)} />
          <div className="relative w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-base text-slate-900">Manage Custom Categories</h3>
              <button onClick={() => setShowCategoryManager(false)} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateCategory} className="flex gap-2">
              <input
                type="text"
                placeholder="Category name (e.g. My College Friends)..."
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-rose-500/20"
              />
              <button
                type="submit"
                className="px-4 py-2.5 rounded-xl bg-rose-500 text-white font-bold text-xs shadow-sm hover:bg-rose-600"
              >
                Create
              </button>
            </form>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {customCategories.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4">No custom categories created yet.</p>
              ) : (
                customCategories.map(cat => (
                  <div key={cat.id} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
                    <span className="font-bold text-slate-800">{cat.name}</span>
                    <button
                      onClick={() => deleteCategory(cat.id)}
                      className="text-slate-400 hover:text-rose-500 p-1"
                      title="Delete category (moves items to Uncategorized)"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))
              )}
            </div>
            <p className="text-[11px] text-slate-400 leading-tight">
              Deleting a custom category will safely migrate its reminders to <strong>Uncategorized</strong> without deleting them.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
