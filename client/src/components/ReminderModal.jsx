import React, { useState } from 'react';
import { X, Calendar, User, Tag, Clock, Bell, AlertCircle, Plus } from 'lucide-react';
import { useApp } from '../context/AppContext';
import CustomSelect from './common/CustomSelect';

export default function ReminderModal({ onClose, editData = null }) {
  const { 
    addReminder, 
    updateReminder, 
    customCategories, 
    suggestedCategories,
    addCategory 
  } = useApp();

  const [title, setTitle] = useState(editData?.title || '');
  const [personName, setPersonName] = useState(editData?.personName || '');
  const [date, setDate] = useState(editData?.date || '');
  const [categoryName, setCategoryName] = useState(editData?.categoryName || 'Uncategorized');
  const [recurrence, setRecurrence] = useState(editData?.recurrence || 'yearly');
  const [notes, setNotes] = useState(editData?.notes || '');
  const [reminderDaysBefore, setReminderDaysBefore] = useState(editData?.reminderDaysBefore || 3);
  const [channels, setChannels] = useState(editData?.channels || ['Email']);
  const [error, setError] = useState('');
  
  // Quick custom category add in modal
  const [showNewCatInput, setShowNewCatInput] = useState(false);
  const [newCatName, setNewCatName] = useState('');

  // Combined options: Uncategorized + User Custom + Suggestions
  const availableCategories = [
    'Uncategorized',
    ...customCategories.map(c => c.name),
    ...suggestedCategories.filter(s => !customCategories.some(c => c.name === s))
  ];

  const handleCreateInlineCategory = (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    addCategory(newCatName.trim());
    setCategoryName(newCatName.trim());
    setNewCatName('');
    setShowNewCatInput(false);
  };

  const toggleChannel = (channelName) => {
    if (channels.includes(channelName)) {
      if (channels.length === 1) {
        setError('At least one notification channel must remain active.');
        return;
      }
      setChannels(channels.filter(c => c !== channelName));
    } else {
      setChannels([...channels, channelName]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !date) {
      setError('Please provide a title and event date.');
      return;
    }

    // Match categoryId if from custom categories and is a valid MongoDB ObjectId
    const matchedCategory = customCategories.find(c => c.name === categoryName);
    const validCatId = matchedCategory && /^[0-9a-fA-F]{24}$/.test(matchedCategory.id) ? matchedCategory.id : null;

    const payload = {
      title: title.trim(),
      personName: personName.trim(),
      date,
      categoryName: categoryName === 'Uncategorized' ? 'Uncategorized' : categoryName,
      categoryId: validCatId,
      recurrence,
      notes: notes.trim(),
      reminderDaysBefore: Number(reminderDaysBefore),
      channels
    };

    if (editData?.id) {
      updateReminder(editData.id, payload);
    } else {
      addReminder(payload);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity" 
        onClick={onClose} 
      />

      {/* Modal Box */}
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl shadow-slate-950/20 border border-slate-100 flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-lg text-slate-900">
              {editData ? 'Edit Reminder' : 'New Reminder'}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Automated multi-channel alerting schedule</p>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-3 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 text-xs font-semibold flex items-center gap-2">
            <AlertCircle size={15} />
            <span>{error}</span>
          </div>
        )}

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Title *
            </label>
            <input
              type="text"
              placeholder="e.g. Mom's Birthday, Car Insurance"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-800 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Person Name (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Eleanor Johnson"
                value={personName}
                onChange={(e) => setPersonName(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-800 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Category
                </label>
                <button
                  type="button"
                  onClick={() => setShowNewCatInput(!showNewCatInput)}
                  className="text-xs font-bold text-rose-500 hover:text-rose-600 flex items-center gap-0.5"
                >
                  <Plus size={13} /> {showNewCatInput ? 'Close' : 'New'}
                </button>
              </div>

              {showNewCatInput ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="New category..."
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                  />
                  <button
                    type="button"
                    onClick={handleCreateInlineCategory}
                    className="px-3 py-2 bg-rose-500 text-white rounded-xl text-xs font-bold"
                  >
                    Add
                  </button>
                </div>
              ) : (
                <CustomSelect
                  className="w-full"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  options={availableCategories}
                />
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Date *
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-800 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Recurrence Rule
              </label>
              <CustomSelect
                className="w-full"
                value={recurrence}
                onChange={(e) => setRecurrence(e.target.value)}
                options={[
                  { value: 'none', label: 'Does not repeat (One-time)' },
                  { value: 'daily', label: 'Daily' },
                  { value: 'weekly', label: 'Weekly' },
                  { value: 'monthly', label: 'Monthly' },
                  { value: 'yearly', label: 'Yearly (Annual)' },
                  { value: 'custom', label: 'Custom schedule' }
                ]}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Reminder Timing
              </label>
              <CustomSelect
                className="w-full"
                value={reminderDaysBefore}
                onChange={(e) => setReminderDaysBefore(Number(e.target.value))}
                options={[
                  { value: 0, label: 'On event day (0 days before)' },
                  { value: 1, label: '1 day before' },
                  { value: 3, label: '3 days before' },
                  { value: 7, label: '7 days before' }
                ]}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Notification Channels
              </label>
              <div className="flex gap-2 pt-1">
                {['Email', 'WhatsApp', 'Push'].map((ch) => (
                  <button
                    type="button"
                    key={ch}
                    onClick={() => toggleChannel(ch)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                      channels.includes(ch)
                        ? 'bg-rose-500 text-white shadow-sm shadow-rose-500/20'
                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                    }`}
                  >
                    {ch}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Personal Notes
            </label>
            <textarea
              rows={2}
              placeholder="Gift ideas, reservation references, policy number, etc."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-800 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
            />
          </div>

          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-rose-500 to-red-600 text-white font-bold text-xs shadow-md shadow-rose-500/25 active:scale-95 transition-all"
            >
              {editData ? 'Save Changes' : 'Create Reminder'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
