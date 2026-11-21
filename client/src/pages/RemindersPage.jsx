import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, Plus, Trash2, Edit3, Calendar, Clock, User, Bell, Tag, FolderPlus, 
  X, MoreVertical, Copy, Archive, CheckCircle2, RotateCcw, Download, Eye,
  LayoutGrid, List, CheckSquare, Square, Filter, RefreshCw, AlertTriangle
} from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { 
  calculateDaysRemaining, 
  calculateNextOccurrence, 
  formatDisplayDate, 
  getCategoryBadgeClasses,
  getPriorityBadge 
} from '../utils/dateUtils';
import ReminderModal from '../components/ReminderModal';
import CustomSelect from '../components/common/CustomSelect';

export default function RemindersPage() {
  const { 
    reminders, 
    deleteReminder, 
    updateReminder,
    bulkActionReminders,
    customCategories, 
    suggestedCategories,
    addCategory, 
    deleteCategory,
    showToast
  } = useApp();

  const [searchParams, setSearchParams] = useSearchParams();

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('active'); // 'active' | 'upcoming' | 'today' | 'past' | 'completed' | 'archived' | 'all'
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedPriority, setSelectedPriority] = useState('All');
  const [selectedChannel, setSelectedChannel] = useState('All');
  const [selectedRecurrence, setSelectedRecurrence] = useState('All');
  const [sortBy, setSortBy] = useState('next-asc');

  // Display Mode (remembered in localStorage)
  const [viewMode, setViewMode] = useState(() => {
    return localStorage.getItem('ndr_reminder_view_mode') || 'grid';
  });

  const handleSetViewMode = (mode) => {
    setViewMode(mode);
    localStorage.setItem('ndr_reminder_view_mode', mode);
  };

  // Modals & Drawers
  const [editingItem, setEditingItem] = useState(null);
  const [duplicatingItem, setDuplicatingItem] = useState(null);
  const [viewingDetailsItem, setViewingDetailsItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatColor, setNewCatColor] = useState('#e11d48');

  // Destructive Confirmation Dialog
  const [confirmDialog, setConfirmDialog] = useState(null); // { title, message, onConfirm, isDestructive }

  // Action Menu open tracking (reminderId)
  const [activeMenuId, setActiveMenuId] = useState(null);

  // Bulk Selection (Set of IDs)
  const [selectedIds, setSelectedIds] = useState(new Set());

  // Handle URL Param ?new=1
  useEffect(() => {
    if (searchParams.get('new') === '1') {
      setEditingItem(null);
      setDuplicatingItem(null);
      setIsModalOpen(true);
      searchParams.delete('new');
      setSearchParams(searchParams);
    }
  }, [searchParams, setSearchParams]);

  // Close 3-dot dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.reminder-action-menu-container')) {
        setActiveMenuId(null);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleCreateCategory = (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    addCategory(newCatName.trim(), newCatColor);
    setNewCatName('');
  };

  // Category filter options
  const allCategoryOptions = [
    'All',
    'Uncategorized',
    ...customCategories.map(c => c.name),
    ...suggestedCategories.filter(s => !customCategories.some(c => c.name === s))
  ];

  // Bulk actions
  const toggleSelectReminder = (id) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSelectAll = (filteredList) => {
    if (selectedIds.size === filteredList.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredList.map(r => r.id)));
    }
  };

  // CSV Export
  const handleExportCsv = (itemsToExport) => {
    if (itemsToExport.length === 0) {
      showToast('No reminders found to export', 'info');
      return;
    }

    const headers = ['Title', 'Person Name', 'Category', 'Original Date', 'Next Occurrence', 'Recurrence', 'Priority', 'Status', 'Channels', 'Notes'];
    const rows = itemsToExport.map(item => {
      const { nextDateStr } = calculateNextOccurrence(item.date, item.recurrence);
      const statusText = item.isArchived ? 'Archived' : item.isCompleted ? 'Completed' : 'Active';
      return [
        `"${(item.title || '').replace(/"/g, '""')}"`,
        `"${(item.personName || '').replace(/"/g, '""')}"`,
        `"${(item.categoryName || 'Uncategorized').replace(/"/g, '""')}"`,
        `"${item.date || ''}"`,
        `"${nextDateStr || ''}"`,
        `"${item.recurrence || 'yearly'}"`,
        `"${item.priority || 'normal'}"`,
        `"${statusText}"`,
        `"${(item.channels || ['Email']).join(', ')}"`,
        `"${(item.notes || '').replace(/"/g, '""')}"`
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `DateReminder_Personal_Reminders_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Exported ${itemsToExport.length} reminders to CSV`, 'success');
  };

  // Filtering & Sorting
  const filteredReminders = reminders
    .filter(item => {
      // 1. Search Query
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || 
        item.title.toLowerCase().includes(q) || 
        (item.personName && item.personName.toLowerCase().includes(q)) ||
        (item.notes && item.notes.toLowerCase().includes(q)) ||
        (item.categoryName && item.categoryName.toLowerCase().includes(q));

      // 2. Status / Timeline Filter
      const countdown = calculateDaysRemaining(item.date, item.recurrence);
      let matchesStatus = true;
      if (statusFilter === 'active') {
        matchesStatus = !item.isArchived && !item.isCompleted;
      } else if (statusFilter === 'upcoming') {
        matchesStatus = !item.isArchived && !item.isCompleted && countdown.status !== 'past';
      } else if (statusFilter === 'today') {
        matchesStatus = !item.isArchived && countdown.status === 'today';
      } else if (statusFilter === 'past') {
        matchesStatus = !item.isArchived && countdown.status === 'past';
      } else if (statusFilter === 'completed') {
        matchesStatus = !!item.isCompleted && !item.isArchived;
      } else if (statusFilter === 'archived') {
        matchesStatus = !!item.isArchived;
      } else if (statusFilter === 'all') {
        matchesStatus = true;
      }

      // 3. Category Filter
      const matchesCategory = 
        selectedCategory === 'All' ? true :
        selectedCategory === 'Uncategorized' ? (!item.categoryId || item.categoryName === 'Uncategorized') :
        item.categoryName === selectedCategory;

      // 4. Priority Filter
      const itemPriority = (item.priority || 'normal').toLowerCase();
      const matchesPriority = selectedPriority === 'All' ? true : itemPriority === selectedPriority.toLowerCase();

      // 5. Channel Filter
      const matchesChannel = selectedChannel === 'All' ? true : 
        (item.channels || []).some(c => c.toLowerCase() === selectedChannel.toLowerCase());

      // 6. Recurrence Filter
      const itemRecurrence = (item.recurrence || 'yearly').toLowerCase();
      const matchesRecurrence = selectedRecurrence === 'All' ? true : itemRecurrence === selectedRecurrence.toLowerCase();

      return matchesSearch && matchesStatus && matchesCategory && matchesPriority && matchesChannel && matchesRecurrence;
    })
    .sort((a, b) => {
      const nextA = calculateNextOccurrence(a.date, a.recurrence).nextDate;
      const nextB = calculateNextOccurrence(b.date, b.recurrence).nextDate;

      if (sortBy === 'next-asc') {
        return nextA - nextB;
      } else if (sortBy === 'next-desc') {
        return nextB - nextA;
      } else if (sortBy === 'title') {
        return a.title.localeCompare(b.title);
      } else if (sortBy === 'priority') {
        const order = { critical: 4, high: 3, normal: 2, low: 1 };
        return (order[b.priority || 'normal'] || 2) - (order[a.priority || 'normal'] || 2);
      }
      return 0;
    });

  const hasActiveFilters = 
    searchQuery || 
    statusFilter !== 'active' || 
    selectedCategory !== 'All' || 
    selectedPriority !== 'All' || 
    selectedChannel !== 'All' || 
    selectedRecurrence !== 'All';

  const clearAllFilters = () => {
    setSearchQuery('');
    setStatusFilter('active');
    setSelectedCategory('All');
    setSelectedPriority('All');
    setSelectedChannel('All');
    setSelectedRecurrence('All');
    setSortBy('next-asc');
  };

  return (
    <div className="space-y-6">
      {/* 1. Header with Proper Alignment */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">My Dates</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Organize personal dates, birthdays, anniversaries, and custom categories.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
          {/* Export CSV button */}
          <button
            onClick={() => handleExportCsv(filteredReminders)}
            className="inline-flex items-center justify-center gap-2 bg-white text-slate-700 font-bold py-2.5 px-3.5 rounded-2xl border border-slate-200 hover:bg-slate-50 transition-colors text-xs"
            title="Export filtered personal reminders to CSV"
          >
            <Download size={15} className="text-slate-500" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>

          {/* Manage Categories button */}
          <button
            onClick={() => setShowCategoryManager(true)}
            className="inline-flex items-center justify-center gap-2 bg-white text-slate-700 font-bold py-2.5 px-3.5 rounded-2xl border border-slate-200 hover:bg-slate-50 transition-colors text-xs"
          >
            <Tag size={15} className="text-slate-500" />
            <span className="hidden sm:inline">Categories</span>
          </button>

          {/* Add Reminder Primary CTA */}
          <button
            onClick={() => { setEditingItem(null); setDuplicatingItem(null); setIsModalOpen(true); }}
            className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-rose-500 to-red-600 text-white font-bold py-2.5 px-4 rounded-2xl shadow-lg shadow-rose-500/25 hover:shadow-rose-500/40 active:scale-95 transition-all text-xs"
          >
            <Plus size={16} className="stroke-[2.5]" />
            <span>Add Reminder</span>
          </button>
        </div>
      </div>

      {/* 2. Status Navigation Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200 overflow-x-auto no-scrollbar gap-2">
        <div className="flex items-center gap-1 min-w-max pb-2">
          {[
            { id: 'active', label: 'Active Reminders' },
            { id: 'upcoming', label: 'Upcoming' },
            { id: 'today', label: 'Today' },
            { id: 'past', label: 'Past Dates' },
            { id: 'completed', label: 'Completed' },
            { id: 'archived', label: 'Archived' },
            { id: 'all', label: 'All Records' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => { setStatusFilter(tab.id); setSelectedIds(new Set()); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                statusFilter === tab.id
                  ? 'bg-rose-50 text-rose-600 border border-rose-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* View Switcher Controls (Desktop & Mobile) */}
        <div className="flex items-center gap-1 pb-2">
          <button
            onClick={() => handleSetViewMode('grid')}
            className={`p-1.5 rounded-xl border transition-all ${
              viewMode === 'grid'
                ? 'bg-rose-50 border-rose-200 text-rose-600'
                : 'bg-white border-slate-200 text-slate-400 hover:text-slate-600'
            }`}
            title="Grid View"
          >
            <LayoutGrid size={15} />
          </button>
          <button
            onClick={() => handleSetViewMode('list')}
            className={`p-1.5 rounded-xl border transition-all ${
              viewMode === 'list'
                ? 'bg-rose-50 border-rose-200 text-rose-600'
                : 'bg-white border-slate-200 text-slate-400 hover:text-slate-600'
            }`}
            title="List View"
          >
            <List size={15} />
          </button>
        </div>
      </div>

      {/* 3. Search and Multi-filter Control Panel */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-100 shadow-xs space-y-3">
        {/* Search Input */}
        <div className="relative">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by title, contact person, category, notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-800 text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X size={15} />
            </button>
          )}
        </div>

        {/* Filters Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 pt-1">
          {/* Category */}
          <CustomSelect
            size="sm"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            options={allCategoryOptions.map(c => ({
              value: c,
              label: c === 'All' ? 'All Categories' : c
            }))}
          />

          {/* Priority */}
          <CustomSelect
            size="sm"
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            options={[
              { value: 'All', label: 'All Priorities' },
              { value: 'critical', label: 'Critical' },
              { value: 'high', label: 'High' },
              { value: 'normal', label: 'Normal' },
              { value: 'low', label: 'Low' }
            ]}
          />

          {/* Recurrence */}
          <CustomSelect
            size="sm"
            value={selectedRecurrence}
            onChange={(e) => setSelectedRecurrence(e.target.value)}
            options={[
              { value: 'All', label: 'All Recurrences' },
              { value: 'yearly', label: 'Yearly' },
              { value: 'monthly', label: 'Monthly' },
              { value: 'weekly', label: 'Weekly' },
              { value: 'daily', label: 'Daily' },
              { value: 'none', label: 'One-time' }
            ]}
          />

          {/* Channel */}
          <CustomSelect
            size="sm"
            value={selectedChannel}
            onChange={(e) => setSelectedChannel(e.target.value)}
            options={[
              { value: 'All', label: 'All Channels' },
              { value: 'email', label: 'Email' },
              { value: 'push', label: 'Browser Push' },
              { value: 'whatsapp', label: 'WhatsApp' }
            ]}
          />

          {/* Sort Control */}
          <CustomSelect
            size="sm"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            options={[
              { value: 'next-asc', label: 'Next Event: Soonest' },
              { value: 'next-desc', label: 'Next Event: Furthest' },
              { value: 'title', label: 'Alphabetical' },
              { value: 'priority', label: 'Highest Priority' }
            ]}
          />

          {/* Clear Filters Button */}
          {hasActiveFilters ? (
            <button
              onClick={clearAllFilters}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
            >
              <RotateCcw size={13} />
              <span>Clear Filters</span>
            </button>
          ) : (
            <div className="hidden lg:block text-right self-center text-[11px] text-slate-400 font-medium pr-1">
              {filteredReminders.length} reminder{filteredReminders.length !== 1 ? 's' : ''}
            </div>
          )}
        </div>
      </div>

      {/* 4. Bulk Action Bar (Visible when 1+ selected) */}
      {selectedIds.size > 0 && (
        <div className="bg-slate-900 text-white rounded-2xl px-4 py-3 flex flex-wrap items-center justify-between gap-3 shadow-lg shadow-slate-900/10 animate-in fade-in">
          <div className="flex items-center gap-3 text-xs font-bold">
            <span className="bg-rose-500 text-white px-2 py-0.5 rounded-full text-[11px]">
              {selectedIds.size}
            </span>
            <span>Selected</span>
            <button
              onClick={() => setSelectedIds(new Set())}
              className="text-slate-400 hover:text-white underline text-xs ml-1"
            >
              Deselect All
            </button>
          </div>

          <div className="flex items-center gap-2">
            {statusFilter === 'archived' ? (
              <button
                onClick={() => {
                  bulkActionReminders(Array.from(selectedIds), 'restore');
                  setSelectedIds(new Set());
                }}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-bold transition-colors"
              >
                Restore Selected
              </button>
            ) : (
              <button
                onClick={() => {
                  bulkActionReminders(Array.from(selectedIds), 'archive');
                  setSelectedIds(new Set());
                }}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-bold transition-colors"
              >
                Archive Selected
              </button>
            )}

            <button
              onClick={() => {
                bulkActionReminders(Array.from(selectedIds), 'complete');
                setSelectedIds(new Set());
              }}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-bold transition-colors"
            >
              Mark Completed
            </button>

            <button
              onClick={() => {
                setConfirmDialog({
                  title: 'Confirm Bulk Deletion',
                  message: `Are you sure you want to permanently delete these ${selectedIds.size} selected reminder(s)? This action cannot be undone.`,
                  isDestructive: true,
                  onConfirm: () => {
                    bulkActionReminders(Array.from(selectedIds), 'delete');
                    setSelectedIds(new Set());
                  }
                });
              }}
              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 rounded-xl text-xs font-bold transition-colors"
            >
              Delete Selected
            </button>
          </div>
        </div>
      )}

      {/* 5. Reminders Content Area (Grid or List View) */}
      {filteredReminders.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 border border-slate-100 text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-500 mx-auto flex items-center justify-center">
            <Calendar size={28} />
          </div>
          <h3 className="font-extrabold text-slate-900 text-lg">No reminders found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {hasActiveFilters 
              ? 'No dates matched your filter criteria. Try clearing some filters.'
              : 'You have no dates scheduled here yet. Click "Add Reminder" to create one.'}
          </p>
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        /* --- GRID VIEW (Desktop 2-column or 3-column, Mobile 1-column) --- */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-4">
          {filteredReminders.map((item) => {
            const nextOcc = calculateNextOccurrence(item.date, item.recurrence);
            const countdown = calculateDaysRemaining(item.date, item.recurrence);
            const isUrgent = countdown.days <= 3 && countdown.status !== 'past';
            const priorityBadge = getPriorityBadge(item.priority);
            const isSelected = selectedIds.has(item.id);

            return (
              <div
                key={item.id}
                className={`bg-white rounded-3xl p-5 border transition-all flex flex-col justify-between gap-4 relative group ${
                  isSelected 
                    ? 'border-rose-400 ring-2 ring-rose-500/20 shadow-md' 
                    : item.isArchived 
                    ? 'border-slate-200 opacity-75 bg-slate-50/50' 
                    : 'border-slate-100 shadow-xs hover:shadow-md hover:border-slate-200'
                }`}
              >
                <div>
                  {/* Top Bar: Selection Box + Category + Countdown + 3-Dot Menu */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleSelectReminder(item.id)}
                        className={`text-slate-400 hover:text-rose-500 transition-colors p-0.5 rounded-md ${
                          isSelected ? 'text-rose-500' : ''
                        }`}
                        title="Select reminder for bulk actions"
                      >
                        {isSelected ? <CheckSquare size={16} className="text-rose-600" /> : <Square size={16} />}
                      </button>

                      <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${getCategoryBadgeClasses(item.categoryName)}`}>
                        {item.categoryName}
                      </span>

                      {/* Subtle Priority Badge */}
                      {item.priority && item.priority !== 'normal' && (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${priorityBadge.classes}`}>
                          {priorityBadge.label}
                        </span>
                      )}

                      {item.isCompleted && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-600 border border-emerald-100">
                          Completed
                        </span>
                      )}

                      {item.isArchived && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-200 text-slate-600">
                          Archived
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 reminder-action-menu-container relative">
                      <span className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full ${
                        isUrgent 
                          ? 'bg-rose-50 text-rose-600 border border-rose-100' 
                          : countdown.status === 'today'
                          ? 'bg-rose-500 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {countdown.text}
                      </span>

                      {/* Three-dot action menu */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMenuId(activeMenuId === item.id ? null : item.id);
                        }}
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                        title="More actions"
                      >
                        <MoreVertical size={16} />
                      </button>

                      {/* Dropdown Menu */}
                      {activeMenuId === item.id && (
                        <div className="absolute right-0 top-8 z-30 w-44 bg-white rounded-2xl shadow-xl border border-slate-100 py-1.5 text-xs font-semibold text-slate-700 animate-in fade-in zoom-in-95">
                          <button
                            onClick={() => {
                              setViewingDetailsItem(item);
                              setActiveMenuId(null);
                            }}
                            className="w-full px-3 py-2 flex items-center gap-2 hover:bg-slate-50 text-left"
                          >
                            <Eye size={14} className="text-slate-400" />
                            <span>View Details</span>
                          </button>
                          <button
                            onClick={() => {
                              setEditingItem(item);
                              setDuplicatingItem(null);
                              setIsModalOpen(true);
                              setActiveMenuId(null);
                            }}
                            className="w-full px-3 py-2 flex items-center gap-2 hover:bg-slate-50 text-left"
                          >
                            <Edit3 size={14} className="text-slate-400" />
                            <span>Edit Reminder</span>
                          </button>
                          <button
                            onClick={() => {
                              setDuplicatingItem(item);
                              setEditingItem(null);
                              setIsModalOpen(true);
                              setActiveMenuId(null);
                            }}
                            className="w-full px-3 py-2 flex items-center gap-2 hover:bg-slate-50 text-left"
                          >
                            <Copy size={14} className="text-slate-400" />
                            <span>Duplicate</span>
                          </button>

                          <div className="my-1 border-t border-slate-100" />

                          {item.isCompleted ? (
                            <button
                              onClick={() => {
                                updateReminder(item.id, { isCompleted: false });
                                setActiveMenuId(null);
                              }}
                              className="w-full px-3 py-2 flex items-center gap-2 hover:bg-slate-50 text-left text-slate-600"
                            >
                              <RotateCcw size={14} className="text-slate-400" />
                              <span>Mark Active</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                updateReminder(item.id, { isCompleted: true });
                                setActiveMenuId(null);
                              }}
                              className="w-full px-3 py-2 flex items-center gap-2 hover:bg-slate-50 text-left text-emerald-600"
                            >
                              <CheckCircle2 size={14} />
                              <span>Mark Completed</span>
                            </button>
                          )}

                          {item.isArchived ? (
                            <button
                              onClick={() => {
                                updateReminder(item.id, { isArchived: false });
                                setActiveMenuId(null);
                              }}
                              className="w-full px-3 py-2 flex items-center gap-2 hover:bg-slate-50 text-left text-blue-600"
                            >
                              <RotateCcw size={14} />
                              <span>Restore</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                updateReminder(item.id, { isArchived: true });
                                setActiveMenuId(null);
                              }}
                              className="w-full px-3 py-2 flex items-center gap-2 hover:bg-slate-50 text-left text-slate-600"
                            >
                              <Archive size={14} />
                              <span>Archive</span>
                            </button>
                          )}

                          <div className="my-1 border-t border-slate-100" />

                          <button
                            onClick={() => {
                              setActiveMenuId(null);
                              setConfirmDialog({
                                title: 'Delete Reminder',
                                message: `Are you sure you want to delete "${item.title}"? This cannot be undone.`,
                                isDestructive: true,
                                onConfirm: () => deleteReminder(item.id)
                              });
                            }}
                            className="w-full px-3 py-2 flex items-center gap-2 hover:bg-rose-50 text-left text-rose-600"
                          >
                            <Trash2 size={14} />
                            <span>Delete</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="font-extrabold text-slate-900 text-base leading-snug">
                    {item.title}
                  </h3>

                  {/* Contact Person */}
                  {item.personName && (
                    <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-1 font-medium">
                      <User size={13} className="text-slate-400" />
                      {item.personName}
                    </p>
                  )}

                  {/* Date & Next Occurrence Information */}
                  <div className="flex flex-wrap items-center gap-y-1 gap-x-3 mt-2.5 text-xs text-slate-600 font-semibold">
                    <div className="flex items-center gap-1.5">
                      <Calendar size={14} className="text-rose-500" />
                      <span>{formatDisplayDate(nextOcc.nextDateStr)}</span>
                      {nextOcc.originalYear && (
                        <span className="text-[10px] text-slate-400 font-normal">
                          (Orig: {nextOcc.originalYear})
                        </span>
                      )}
                    </div>

                    <span className="text-[10px] text-slate-500 font-medium bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100 capitalize">
                      {item.recurrence || 'Yearly'}
                    </span>
                  </div>

                  {/* Notes snippet */}
                  {item.notes && (
                    <p className="text-xs text-slate-500 mt-2.5 bg-slate-50 p-2.5 rounded-xl line-clamp-2 border border-slate-100">
                      {item.notes}
                    </p>
                  )}
                </div>

                {/* Card Footer: Channels & Direct Quick Actions */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    {(item.channels || ['Email']).map(ch => (
                      <span key={ch} className="bg-rose-50 text-rose-600 font-bold px-2 py-0.5 rounded-md text-[10px]">
                        {ch}
                      </span>
                    ))}
                    <span className="text-[10px] text-slate-400">({item.reminderDaysBefore || 3}d prior)</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setEditingItem(item);
                        setDuplicatingItem(null);
                        setIsModalOpen(true);
                      }}
                      className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit3 size={15} />
                    </button>
                    <button
                      onClick={() => {
                        setConfirmDialog({
                          title: 'Delete Reminder',
                          message: `Are you sure you want to delete "${item.title}"?`,
                          isDestructive: true,
                          onConfirm: () => deleteReminder(item.id)
                        });
                      }}
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
      ) : (
        /* --- LIST VIEW (Structured Table / Clean Stack) --- */
        <div className="bg-white rounded-3xl border border-slate-100 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3.5 px-4 w-10">
                    <input
                      type="checkbox"
                      checked={selectedIds.size === filteredReminders.length && filteredReminders.length > 0}
                      onChange={() => handleSelectAll(filteredReminders)}
                      className="rounded text-rose-500 focus:ring-rose-500"
                    />
                  </th>
                  <th className="py-3.5 px-4">Title & Contact</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Next Occurrence</th>
                  <th className="py-3.5 px-4">Countdown</th>
                  <th className="py-3.5 px-4">Recurrence</th>
                  <th className="py-3.5 px-4">Priority</th>
                  <th className="py-3.5 px-4">Channels</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredReminders.map(item => {
                  const nextOcc = calculateNextOccurrence(item.date, item.recurrence);
                  const countdown = calculateDaysRemaining(item.date, item.recurrence);
                  const priorityBadge = getPriorityBadge(item.priority);
                  const isSelected = selectedIds.has(item.id);

                  return (
                    <tr 
                      key={item.id} 
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isSelected ? 'bg-rose-50/30' : item.isArchived ? 'bg-slate-50/50 opacity-75' : ''
                      }`}
                    >
                      <td className="py-3 px-4">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectReminder(item.id)}
                          className="rounded text-rose-500 focus:ring-rose-500"
                        />
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900">
                        <div>{item.title}</div>
                        {item.personName && (
                          <div className="text-[11px] text-slate-400 font-normal">{item.personName}</div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${getCategoryBadgeClasses(item.categoryName)}`}>
                          {item.categoryName}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-700">
                        {formatDisplayDate(nextOcc.nextDateStr)}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                          countdown.days <= 3 && countdown.status !== 'past'
                            ? 'bg-rose-50 text-rose-600 border border-rose-100'
                            : 'bg-slate-100 text-slate-600'
                        }`}>
                          {countdown.text}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-500 capitalize">
                        {item.recurrence || 'Yearly'}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${priorityBadge.classes}`}>
                          {priorityBadge.label}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-1">
                          {(item.channels || ['Email']).map(c => (
                            <span key={c} className="text-[10px] bg-slate-100 text-slate-600 font-bold px-1.5 py-0.5 rounded">
                              {c}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => {
                              setEditingItem(item);
                              setDuplicatingItem(null);
                              setIsModalOpen(true);
                            }}
                            className="p-1 text-slate-400 hover:text-slate-700 rounded"
                            title="Edit"
                          >
                            <Edit3 size={15} />
                          </button>
                          <button
                            onClick={() => {
                              setConfirmDialog({
                                title: 'Delete Reminder',
                                message: `Are you sure you want to delete "${item.title}"?`,
                                isDestructive: true,
                                onConfirm: () => deleteReminder(item.id)
                              });
                            }}
                            className="p-1 text-slate-400 hover:text-rose-500 rounded"
                            title="Delete"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 6. View Details Dialog */}
      {viewingDetailsItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={() => setViewingDetailsItem(null)} />
          <div className="relative w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-base text-slate-900">Reminder Details</h3>
              <button onClick={() => setViewingDetailsItem(null)} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400 uppercase font-bold text-[10px] block">Title</span>
                <span className="text-base font-extrabold text-slate-900">{viewingDetailsItem.title}</span>
              </div>

              {viewingDetailsItem.personName && (
                <div>
                  <span className="text-slate-400 uppercase font-bold text-[10px] block">Contact / Person</span>
                  <span className="text-sm font-semibold text-slate-800">{viewingDetailsItem.personName}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-slate-400 uppercase font-bold text-[10px] block">Next Occurrence</span>
                  <span className="text-sm font-semibold text-slate-800">
                    {formatDisplayDate(calculateNextOccurrence(viewingDetailsItem.date, viewingDetailsItem.recurrence).nextDateStr)}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 uppercase font-bold text-[10px] block">Original Stored Date</span>
                  <span className="text-sm font-semibold text-slate-800">{viewingDetailsItem.date}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-slate-400 uppercase font-bold text-[10px] block">Category</span>
                  <span className="text-sm font-semibold text-slate-800">{viewingDetailsItem.categoryName}</span>
                </div>

                <div>
                  <span className="text-slate-400 uppercase font-bold text-[10px] block">Recurrence Rule</span>
                  <span className="text-sm font-semibold text-slate-800 capitalize">{viewingDetailsItem.recurrence || 'Yearly'}</span>
                </div>
              </div>

              <div>
                <span className="text-slate-400 uppercase font-bold text-[10px] block">Notification Channels</span>
                <div className="flex gap-1.5 mt-1">
                  {(viewingDetailsItem.channels || ['Email']).map(c => (
                    <span key={c} className="bg-rose-50 text-rose-600 font-bold px-2 py-0.5 rounded-md text-[10px]">
                      {c}
                    </span>
                  ))}
                  <span className="text-slate-400 self-center">({viewingDetailsItem.reminderDaysBefore || 3} days before)</span>
                </div>
              </div>

              {viewingDetailsItem.notes && (
                <div>
                  <span className="text-slate-400 uppercase font-bold text-[10px] block">Notes</span>
                  <p className="bg-slate-50 p-3 rounded-2xl text-slate-700 mt-1 whitespace-pre-wrap">
                    {viewingDetailsItem.notes}
                  </p>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setViewingDetailsItem(null)}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. Destructive Action Confirmation Dialog */}
      {confirmDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs" onClick={() => setConfirmDialog(null)} />
          <div className="relative w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 flex items-center justify-center">
                <AlertTriangle size={20} />
              </div>
              <h3 className="font-extrabold text-base text-slate-900">{confirmDialog.title}</h3>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              {confirmDialog.message}
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                onClick={() => setConfirmDialog(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  confirmDialog.onConfirm();
                  setConfirmDialog(null);
                }}
                className={`px-4 py-2 text-white font-bold text-xs rounded-xl shadow-sm ${
                  confirmDialog.isDestructive ? 'bg-rose-600 hover:bg-rose-700' : 'bg-slate-900 hover:bg-slate-800'
                }`}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 8. Reminder Modal (Add / Edit / Duplicate) */}
      {isModalOpen && (
        <ReminderModal
          onClose={() => { 
            setEditingItem(null); 
            setDuplicatingItem(null); 
            setIsModalOpen(false); 
          }}
          editData={editingItem || duplicatingItem}
          isDuplicate={!!duplicatingItem}
        />
      )}

      {/* 9. Category Management Drawer */}
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
