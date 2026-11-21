import React, { useState, useEffect } from 'react';
import { 
  Bell, BellOff, Mail, MessageSquare, Smartphone, Clock, 
  CheckCircle2, AlertCircle, Save, History, Shield, Download, 
  ExternalLink, Trash2, Calendar, Filter, Sparkles, AlertTriangle, 
  RefreshCw, Check, X, RotateCcw, Search, ChevronRight, PhoneCall
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import CustomSelect from '../components/common/CustomSelect';
import ToggleSwitch from '../components/common/ToggleSwitch';
import SearchableTimezoneSelect from '../components/common/SearchableTimezoneSelect';
import { api } from '../services/apiClient';

export default function SettingsPage() {
  const { 
    currentUser, 
    updateUserSettings, 
    customCategories, 
    globalCategories,
    reminders, 
    showToast 
  } = useApp();
  const navigate = useNavigate();

  const prefs = currentUser?.notificationPreferences || {};

  // 1. Notification Master Preferences States
  const [masterEnabled, setMasterEnabled] = useState(prefs.masterEnabled ?? true);
  const [personalRemindersEnabled, setPersonalRemindersEnabled] = useState(prefs.personalRemindersEnabled ?? true);
  const [globalEventsEnabled, setGlobalEventsEnabled] = useState(prefs.globalEventsEnabled ?? true);

  // Uncategorized granular channels { email, push, whatsapp }
  const [uncategorizedChannels, setUncategorizedChannels] = useState({
    email: prefs.uncategorizedRemindersEnabled?.email ?? (typeof prefs.uncategorizedRemindersEnabled === 'boolean' ? prefs.uncategorizedRemindersEnabled : true),
    push: prefs.uncategorizedRemindersEnabled?.push ?? (typeof prefs.uncategorizedRemindersEnabled === 'boolean' ? prefs.uncategorizedRemindersEnabled : true),
    whatsapp: prefs.uncategorizedRemindersEnabled?.whatsapp ?? false
  });

  // Dynamic Personal Category Channel Preferences: Map of categoryId -> { email, push, whatsapp }
  const [personalCategoryPrefs, setPersonalCategoryPrefs] = useState(() => {
    return prefs.personalCategoryPreferences || {};
  });

  // Dynamic Global Category Channel Preferences: Map of globalCategorySlug/Id -> { email, push, whatsapp }
  const [globalCategoryPrefs, setGlobalCategoryPrefs] = useState(() => {
    return prefs.globalCategoryPreferences || {};
  });

  // Category Search Filters
  const [personalCategorySearch, setPersonalCategorySearch] = useState('');
  const [globalCategorySearch, setGlobalCategorySearch] = useState('');

  // 2. Delivery Channels
  const [emailEnabled, setEmailEnabled] = useState(prefs.channels?.email?.enabled ?? true);
  const [emailAddress, setEmailAddress] = useState(prefs.channels?.email?.address || currentUser?.email || '');
  
  const [browserPushEnabled, setBrowserPushEnabled] = useState(prefs.channels?.push?.enabled ?? true);
  const [pushPermissionStatus, setPushPermissionStatus] = useState(
    typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'unsupported'
  );

  // WhatsApp State
  const [whatsappEnabled, setWhatsappEnabled] = useState(prefs.channels?.whatsapp?.enabled ?? false);
  const [whatsappNumber, setWhatsappNumber] = useState(prefs.channels?.whatsapp?.phoneNumber || currentUser?.phone || '');
  const [whatsappStatus, setWhatsappStatus] = useState(prefs.channels?.whatsapp?.status || 'Coming Soon');
  const [whatsappOptIn, setWhatsappOptIn] = useState(prefs.channels?.whatsapp?.optInConsent ?? false);
  const [isConnectingWhatsApp, setIsConnectingWhatsApp] = useState(false);

  // 3. Application Preferences
  const [timezone, setTimezone] = useState(currentUser?.timezone || 'UTC');
  const [dateFormat, setDateFormat] = useState(currentUser?.dateFormat || 'MMM DD, YYYY');
  const [timeFormat, setTimeFormat] = useState(currentUser?.timeFormat || '12h');
  const [defaultCalendarView, setDefaultCalendarView] = useState(currentUser?.defaultCalendarView || 'month');
  const [firstDayOfWeek, setFirstDayOfWeek] = useState('Sunday');
  const [language, setLanguage] = useState(currentUser?.language || 'English (US)');
  const [theme, setTheme] = useState('Light');

  // 4. Reminder Scheduling Defaults
  const [defaultAdvanceDays, setDefaultAdvanceDays] = useState(
    Array.isArray(prefs.defaultAdvanceDays) ? prefs.defaultAdvanceDays[0] || 3 : 3
  );
  const [defaultRecurrence, setDefaultRecurrence] = useState('none');
  const [morningNotificationTime, setMorningNotificationTime] = useState(prefs.digestTime || '09:00');
  const [eveningNotificationTime, setEveningNotificationTime] = useState('18:00');
  const [quietHoursStart, setQuietHoursStart] = useState('22:00');
  const [quietHoursEnd, setQuietHoursEnd] = useState('07:00');
  const [weekendNotifications, setWeekendNotifications] = useState(true);
  const [dailyDigestEnabled, setDailyDigestEnabled] = useState(true);
  const [maxNotificationsPerDay, setMaxNotificationsPerDay] = useState(5);

  // 5. Notification History (Real data fetched from backend)
  const [logs, setLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(true);
  const [historyStatusFilter, setHistoryStatusFilter] = useState('all');
  const [historyChannelFilter, setHistoryChannelFilter] = useState('all');
  const [historySearch, setHistorySearch] = useState('');
  const [retryingLogId, setRetryingLogId] = useState(null);

  const [saving, setSaving] = useState(false);

  // Fetch real notification history from backend API
  const fetchLogs = async () => {
    try {
      setLogsLoading(true);
      const queryParams = new URLSearchParams();
      if (historyStatusFilter !== 'all') queryParams.append('status', historyStatusFilter);
      if (historyChannelFilter !== 'all') queryParams.append('channel', historyChannelFilter);
      if (historySearch) queryParams.append('search', historySearch);

      const res = await api.getNotificationLogs(queryParams.toString());
      if (res?.data) {
        setLogs(res.data);
      }
    } catch (err) {
      console.warn('Could not load notification logs:', err.message);
    } finally {
      setLogsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [historyStatusFilter, historyChannelFilter]);

  // Sync state when currentUser is loaded
  useEffect(() => {
    if (currentUser) {
      if (currentUser.timezone) setTimezone(currentUser.timezone);
      if (currentUser.dateFormat) setDateFormat(currentUser.dateFormat);
      if (currentUser.timeFormat) setTimeFormat(currentUser.timeFormat);
      if (currentUser.defaultCalendarView) setDefaultCalendarView(currentUser.defaultCalendarView);
    }
  }, [currentUser]);

  // Handle Save
  const handleSaveSettings = async () => {
    if (quietHoursStart === quietHoursEnd) {
      showToast('Quiet hours start and end time cannot be identical.', 'error');
      return;
    }

    try {
      setSaving(true);
      const payload = {
        timezone,
        dateFormat,
        timeFormat,
        defaultCalendarView,
        notificationPreferences: {
          masterEnabled,
          personalRemindersEnabled,
          globalEventsEnabled,
          uncategorizedRemindersEnabled: uncategorizedChannels,
          personalCategoryPreferences: personalCategoryPrefs,
          globalCategoryPreferences: globalCategoryPrefs,
          channels: {
            email: {
              enabled: emailEnabled,
              address: emailAddress,
              verified: true
            },
            push: {
              enabled: browserPushEnabled
            },
            whatsapp: {
              enabled: whatsappEnabled,
              phoneNumber: whatsappNumber,
              verified: false,
              optInConsent: whatsappOptIn,
              status: whatsappStatus
            }
          },
          defaultAdvanceDays: [Number(defaultAdvanceDays)],
          digestTime: morningNotificationTime
        }
      };

      await updateUserSettings(payload);
      showToast('Settings & preferences saved successfully.', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to save settings.', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Helper: Toggle channel for a personal category
  const togglePersonalCategoryChannel = (categoryId, channel) => {
    setPersonalCategoryPrefs(prev => {
      const current = prev[categoryId] || { email: true, push: true, whatsapp: false };
      return {
        ...prev,
        [categoryId]: {
          ...current,
          [channel]: !current[channel]
        }
      };
    });
  };

  // Helper: Batch personal category toggle
  const batchSetPersonalCategories = (channel, value) => {
    setPersonalCategoryPrefs(prev => {
      const updated = { ...prev };
      customCategories.forEach(c => {
        const current = updated[c.id] || { email: true, push: true, whatsapp: false };
        if (channel === 'all') {
          updated[c.id] = { email: value, push: value, whatsapp: value };
        } else {
          updated[c.id] = { ...current, [channel]: value };
        }
      });
      return updated;
    });
    showToast(`Updated all personal category preferences for ${channel.toUpperCase()}`, 'info');
  };

  // Helper: Toggle channel for a global category
  const toggleGlobalCategoryChannel = (categorySlug, channel) => {
    setGlobalCategoryPrefs(prev => {
      const current = prev[categorySlug] || { email: true, push: true, whatsapp: false };
      return {
        ...prev,
        [categorySlug]: {
          ...current,
          [channel]: !current[channel]
        }
      };
    });
  };

  // Helper: Batch global category toggle
  const batchSetGlobalCategories = (channel, value) => {
    setGlobalCategoryPrefs(prev => {
      const updated = { ...prev };
      globalCategories.forEach(c => {
        const slug = c.slug || c.name;
        const current = updated[slug] || { email: true, push: true, whatsapp: false };
        if (channel === 'all') {
          updated[slug] = { email: value, push: value, whatsapp: value };
        } else {
          updated[slug] = { ...current, [channel]: value };
        }
      });
      return updated;
    });
    showToast(`Updated all global category preferences for ${channel.toUpperCase()}`, 'info');
  };

  // WhatsApp Connect Action
  const handleConnectWhatsApp = async () => {
    if (!whatsappNumber || whatsappNumber.trim().length < 8) {
      showToast('Please enter a valid phone number with country code.', 'error');
      return;
    }
    if (!whatsappOptIn) {
      showToast('You must consent to receiving automated WhatsApp reminders.', 'error');
      return;
    }

    try {
      setIsConnectingWhatsApp(true);
      const res = await api.connectWhatsApp({
        phoneNumber: whatsappNumber.trim(),
        optInConsent: whatsappOptIn
      });

      if (res?.data?.status) {
        setWhatsappStatus(res.data.status);
      }
      showToast(res.message || 'WhatsApp status updated', 'info');
    } catch (err) {
      showToast(err.message || 'Failed to initiate WhatsApp connection', 'error');
    } finally {
      setIsConnectingWhatsApp(false);
    }
  };

  // WhatsApp Disconnect Action
  const handleDisconnectWhatsApp = async () => {
    try {
      await api.disconnectWhatsApp();
      setWhatsappStatus('Not Connected');
      setWhatsappEnabled(false);
      showToast('WhatsApp notifications disconnected', 'info');
    } catch (err) {
      showToast(err.message || 'Failed to disconnect WhatsApp', 'error');
    }
  };

  // Retry Failed Notification
  const handleRetryNotification = async (logId) => {
    try {
      setRetryingLogId(logId);
      const res = await api.retryNotification(logId);
      showToast(res.message || 'Retry queued successfully', 'success');
      fetchLogs();
    } catch (err) {
      showToast(err.message || 'Failed to retry notification', 'error');
    } finally {
      setRetryingLogId(null);
    }
  };

  // Export Reminders JSON
  const handleExportReminders = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(reminders, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `DateReminder_Export_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Export file downloaded.', 'success');
  };

  // Filtered categories for display
  const filteredPersonalCategories = customCategories.filter(c => 
    !personalCategorySearch || c.name.toLowerCase().includes(personalCategorySearch.toLowerCase())
  );

  const filteredGlobalCategories = globalCategories.filter(c => 
    !globalCategorySearch || c.name.toLowerCase().includes(globalCategorySearch.toLowerCase())
  );

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* 1. Header with Consistent Typography */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Settings &amp; Preferences
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Personalize your notifications, reminders, timezone and application experience.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            onClick={() => window.location.reload()}
            className="px-3.5 py-2.5 rounded-2xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold transition-colors"
          >
            Reset
          </button>
          <button
            onClick={handleSaveSettings}
            disabled={saving}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-rose-500 to-red-600 text-white font-bold py-2.5 px-5 rounded-2xl shadow-lg shadow-rose-500/25 hover:shadow-rose-500/40 active:scale-95 transition-all text-xs disabled:opacity-50"
          >
            <Save size={15} />
            <span>{saving ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      </div>

      {/* 2. Notification Master Controls */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center">
            <Bell size={20} />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-900 text-base">Notification Preferences</h3>
            <p className="text-xs text-slate-400">Configure core dispatch channels and category behaviors</p>
          </div>
        </div>

        {/* Master Dispatch Switch */}
        <div className="p-4 rounded-2xl bg-rose-50/50 border border-rose-100/80 flex items-center justify-between gap-4">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="text-sm font-extrabold text-slate-900">Master Notifications</span>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-rose-500 text-white px-2 py-0.5 rounded-full">
                Global Switch
              </span>
            </div>
            <p className="text-xs text-slate-500 max-w-xl">
              Turn off to temporarily suppress all notifications without wiping individual channel configurations.
            </p>
          </div>
          <ToggleSwitch checked={masterEnabled} onChange={setMasterEnabled} />
        </div>

        {/* Major Notification Types */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-3">
            <div>
              <span className="text-xs font-bold text-slate-800 block">Personal Reminders</span>
              <span className="text-[11px] text-slate-400">Alerts for your custom dates and birthdays</span>
            </div>
            <ToggleSwitch checked={personalRemindersEnabled} onChange={setPersonalRemindersEnabled} />
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-3">
            <div>
              <span className="text-xs font-bold text-slate-800 block">Global Important Dates</span>
              <span className="text-[11px] text-slate-400">Alerts for subscribed world holidays and cultural events</span>
            </div>
            <ToggleSwitch checked={globalEventsEnabled} onChange={setGlobalEventsEnabled} />
          </div>
        </div>

        {/* Uncategorized Reminders Multi-Channel Preferences */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <span className="text-xs font-bold text-slate-800 block">Uncategorized Reminders</span>
              <span className="text-[11px] text-slate-400">Independent notification delivery rules for reminders without a category</span>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <label className="flex items-center gap-1.5 font-bold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={uncategorizedChannels.email}
                  onChange={(e) => setUncategorizedChannels(prev => ({ ...prev, email: e.target.checked }))}
                  className="rounded text-rose-500 focus:ring-rose-500"
                />
                <span>Email</span>
              </label>

              <label className="flex items-center gap-1.5 font-bold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={uncategorizedChannels.push}
                  onChange={(e) => setUncategorizedChannels(prev => ({ ...prev, push: e.target.checked }))}
                  className="rounded text-rose-500 focus:ring-rose-500"
                />
                <span>Push</span>
              </label>

              <label className="flex items-center gap-1.5 font-bold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={uncategorizedChannels.whatsapp}
                  onChange={(e) => setUncategorizedChannels(prev => ({ ...prev, whatsapp: e.target.checked }))}
                  className="rounded text-rose-500 focus:ring-rose-500"
                />
                <span>WhatsApp</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* 3. DYNAMIC CATEGORY-SPECIFIC NOTIFICATION PREFERENCES (PART 4 REQUIREMENT) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* A. PERSONAL REMINDER CATEGORIES */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm">Personal Reminder Categories</h3>
                <p className="text-[11px] text-slate-400">Fetched dynamically from your MongoDB account</p>
              </div>

              {/* Quick Batch Actions */}
              <div className="flex items-center gap-1 text-[11px]">
                <button
                  onClick={() => batchSetPersonalCategories('all', true)}
                  className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg"
                >
                  Enable All
                </button>
                <button
                  onClick={() => batchSetPersonalCategories('all', false)}
                  className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg"
                >
                  Disable All
                </button>
              </div>
            </div>

            {/* Category Search Filter */}
            <div className="relative mb-3">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search personal categories..."
                value={personalCategorySearch}
                onChange={(e) => setPersonalCategorySearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-rose-500"
              />
            </div>

            {/* Scrollable Category List */}
            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {filteredPersonalCategories.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400">
                  No personal categories match your search.
                </div>
              ) : (
                filteredPersonalCategories.map(cat => {
                  const currentChannels = personalCategoryPrefs[cat.id] || { email: true, push: true, whatsapp: false };
                  const reminderCount = reminders.filter(r => r.categoryId === cat.id || r.categoryName === cat.name).length;

                  return (
                    <div
                      key={cat.id}
                      className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-2 text-xs"
                    >
                      <div>
                        <span className="font-bold text-slate-800 block">{cat.name}</span>
                        <span className="text-[10px] text-slate-400 font-medium">
                          {reminderCount} reminder{reminderCount !== 1 ? 's' : ''}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <label className="flex items-center gap-1 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={currentChannels.email}
                            onChange={() => togglePersonalCategoryChannel(cat.id, 'email')}
                            className="rounded text-rose-500 focus:ring-rose-500 w-3.5 h-3.5"
                          />
                          <span className="text-[11px] font-bold text-slate-600">Email</span>
                        </label>

                        <label className="flex items-center gap-1 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={currentChannels.push}
                            onChange={() => togglePersonalCategoryChannel(cat.id, 'push')}
                            className="rounded text-rose-500 focus:ring-rose-500 w-3.5 h-3.5"
                          />
                          <span className="text-[11px] font-bold text-slate-600">Push</span>
                        </label>

                        <label className="flex items-center gap-1 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={currentChannels.whatsapp}
                            onChange={() => togglePersonalCategoryChannel(cat.id, 'whatsapp')}
                            className="rounded text-rose-500 focus:ring-rose-500 w-3.5 h-3.5"
                          />
                          <span className="text-[11px] font-bold text-slate-600">WhatsApp</span>
                        </label>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-100">
            Stable category IDs are preserved. Renaming a category maintains its notification rules.
          </div>
        </div>

        {/* B. GLOBAL IMPORTANT DATE CATEGORIES */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm">Global Important Date Categories</h3>
                <p className="text-[11px] text-slate-400">Fetched dynamically from the global catalogue</p>
              </div>

              {/* Quick Batch Actions */}
              <div className="flex items-center gap-1 text-[11px]">
                <button
                  onClick={() => batchSetGlobalCategories('all', true)}
                  className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg"
                >
                  Enable All
                </button>
                <button
                  onClick={() => batchSetGlobalCategories('all', false)}
                  className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg"
                >
                  Disable All
                </button>
              </div>
            </div>

            {/* Category Search Filter */}
            <div className="relative mb-3">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search global categories..."
                value={globalCategorySearch}
                onChange={(e) => setGlobalCategorySearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-rose-500"
              />
            </div>

            {/* Scrollable Global Category List */}
            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {filteredGlobalCategories.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400">
                  No global categories match your search.
                </div>
              ) : (
                filteredGlobalCategories.map(cat => {
                  const slug = cat.slug || cat.name;
                  const currentChannels = globalCategoryPrefs[slug] || { email: true, push: true, whatsapp: false };

                  return (
                    <div
                      key={slug}
                      className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-2 text-xs"
                    >
                      <div>
                        <span className="font-bold text-slate-800 block">{cat.name}</span>
                        <span className="text-[10px] text-slate-400 font-medium">
                          {cat.description ? `${cat.description.slice(0, 38)}...` : 'Catalog events'}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <label className="flex items-center gap-1 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={currentChannels.email}
                            onChange={() => toggleGlobalCategoryChannel(slug, 'email')}
                            className="rounded text-rose-500 focus:ring-rose-500 w-3.5 h-3.5"
                          />
                          <span className="text-[11px] font-bold text-slate-600">Email</span>
                        </label>

                        <label className="flex items-center gap-1 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={currentChannels.push}
                            onChange={() => toggleGlobalCategoryChannel(slug, 'push')}
                            className="rounded text-rose-500 focus:ring-rose-500 w-3.5 h-3.5"
                          />
                          <span className="text-[11px] font-bold text-slate-600">Push</span>
                        </label>

                        <label className="flex items-center gap-1 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={currentChannels.whatsapp}
                            onChange={() => toggleGlobalCategoryChannel(slug, 'whatsapp')}
                            className="rounded text-rose-500 focus:ring-rose-500 w-3.5 h-3.5"
                          />
                          <span className="text-[11px] font-bold text-slate-600">WhatsApp</span>
                        </label>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-100">
            Admin additions to the global catalogue will synchronize automatically.
          </div>
        </div>
      </div>

      {/* 4. Delivery Channels & WhatsApp Professional Card (PART 3) */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-slate-100 text-slate-600 flex items-center justify-center">
            <Smartphone size={20} />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-900 text-base">Delivery Channels</h3>
            <p className="text-xs text-slate-400">Configure email, native web push, and WhatsApp alerting</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Email Channel */}
          <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mail size={18} className="text-slate-500" />
                <span className="text-xs font-bold text-slate-800">Email Notifications</span>
              </div>
              <ToggleSwitch checked={emailEnabled} onChange={setEmailEnabled} />
            </div>
            <input
              type="email"
              value={emailAddress}
              onChange={(e) => setEmailAddress(e.target.value)}
              placeholder="name@domain.com"
              className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-800"
            />
          </div>

          {/* Browser Push Channel */}
          <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell size={18} className="text-slate-500" />
                <span className="text-xs font-bold text-slate-800">Browser Push</span>
              </div>
              <ToggleSwitch checked={browserPushEnabled} onChange={setBrowserPushEnabled} />
            </div>
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Permission: <strong>{pushPermissionStatus}</strong></span>
              {pushPermissionStatus !== 'granted' && (
                <button
                  type="button"
                  onClick={async () => {
                    if ('Notification' in window) {
                      const res = await Notification.requestPermission();
                      setPushPermissionStatus(res);
                      showToast(`Push permission: ${res}`, 'info');
                    }
                  }}
                  className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg font-bold text-[11px]"
                >
                  Request Access
                </button>
              )}
            </div>
          </div>
        </div>

        {/* WhatsApp Notifications Integration Card (PART 3 REQUIREMENT) */}
        <div className="p-5 rounded-2xl border border-emerald-100 bg-emerald-50/30 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-sm">
                <MessageSquare size={20} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-extrabold text-slate-900 text-sm">WhatsApp Notifications</h4>
                  <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                    whatsappStatus === 'Connected'
                      ? 'bg-emerald-100 text-emerald-700'
                      : whatsappStatus === 'Coming Soon'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-slate-200 text-slate-700'
                  }`}>
                    {whatsappStatus}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Receive important date reminders directly through WhatsApp.
                </p>
              </div>
            </div>

            <ToggleSwitch
              checked={whatsappEnabled}
              onChange={setWhatsappEnabled}
              disabled={whatsappStatus === 'Coming Soon' || whatsappStatus === 'Not Connected'}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                WhatsApp Phone Number
              </label>
              <input
                type="tel"
                placeholder="+1 555 123 4567"
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                Consent &amp; Opt-in
              </label>
              <label className="flex items-center gap-2 text-xs text-slate-600 pt-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={whatsappOptIn}
                  onChange={(e) => setWhatsappOptIn(e.target.checked)}
                  className="rounded text-emerald-500 focus:ring-emerald-500"
                />
                <span>I consent to receiving automated WhatsApp reminders</span>
              </label>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-emerald-100/60 text-xs">
            <span className="text-slate-500 text-[11px]">
              Ready for Meta WhatsApp Business Platform provider integration.
            </span>

            <div className="flex items-center gap-2">
              {whatsappStatus === 'Connected' ? (
                <button
                  type="button"
                  onClick={handleDisconnectWhatsApp}
                  className="px-3.5 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-rose-600 rounded-xl font-bold text-xs"
                >
                  Disconnect
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleConnectWhatsApp}
                  disabled={isConnectingWhatsApp}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-xs transition-colors"
                >
                  {isConnectingWhatsApp ? 'Connecting...' : 'Connect WhatsApp'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 5. Application Preferences */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-slate-100 text-slate-600 flex items-center justify-center">
            <Calendar size={20} />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-900 text-base">Application Preferences</h3>
            <p className="text-xs text-slate-400">Timezones, calendar view, date format, and localized presentation</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Timezone (IANA) *
            </label>
            <SearchableTimezoneSelect value={timezone} onChange={setTimezone} />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Date Format
            </label>
            <CustomSelect
              className="w-full"
              value={dateFormat}
              onChange={(e) => setDateFormat(e.target.value)}
              options={[
                { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY (e.g. 21/11/2026)' },
                { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY (e.g. 11/21/2026)' },
                { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD (e.g. 2026-11-21)' },
                { value: 'DD MMM YYYY', label: 'DD MMM YYYY (e.g. 21 Nov 2026)' },
                { value: 'MMM DD, YYYY', label: 'MMM DD, YYYY (e.g. Nov 21, 2026)' }
              ]}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Time Format
            </label>
            <CustomSelect
              className="w-full"
              value={timeFormat}
              onChange={(e) => setTimeFormat(e.target.value)}
              options={[
                { value: '12h', label: '12-hour (AM / PM)' },
                { value: '24h', label: '24-hour clock' }
              ]}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Default Calendar View
            </label>
            <CustomSelect
              className="w-full"
              value={defaultCalendarView}
              onChange={(e) => setDefaultCalendarView(e.target.value)}
              options={[
                { value: 'day', label: 'Day' },
                { value: 'week', label: 'Week' },
                { value: 'month', label: 'Month' },
                { value: 'year', label: 'Year' }
              ]}
            />
          </div>
        </div>
      </div>

      {/* 6. Reminder Scheduling Defaults */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-slate-100 text-slate-600 flex items-center justify-center">
            <Clock size={20} />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-900 text-base">Reminder Scheduling Defaults</h3>
            <p className="text-xs text-slate-400">Configure default advance alerts and quiet hours</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Default Advance Notice
            </label>
            <CustomSelect
              className="w-full"
              value={defaultAdvanceDays}
              onChange={(e) => setDefaultAdvanceDays(Number(e.target.value))}
              options={[
                { value: 0, label: 'Same day (0d)' },
                { value: 1, label: '1 day before' },
                { value: 3, label: '3 days before' },
                { value: 7, label: '7 days before' }
              ]}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Default Recurrence
            </label>
            <CustomSelect
              className="w-full"
              value={defaultRecurrence}
              onChange={(e) => setDefaultRecurrence(e.target.value)}
              options={[
                { value: 'none', label: 'None (One-time)' },
                { value: 'daily', label: 'Daily' },
                { value: 'weekly', label: 'Weekly' },
                { value: 'monthly', label: 'Monthly' },
                { value: 'yearly', label: 'Yearly' }
              ]}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Quiet Hours
            </label>
            <div className="flex items-center gap-2">
              <input
                type="time"
                value={quietHoursStart}
                onChange={(e) => setQuietHoursStart(e.target.value)}
                className="px-2.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs w-full text-slate-800"
              />
              <span className="text-xs text-slate-400">to</span>
              <input
                type="time"
                value={quietHoursEnd}
                onChange={(e) => setQuietHoursEnd(e.target.value)}
                className="px-2.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs w-full text-slate-800"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 7. REDESIGNED NOTIFICATION HISTORY (PART 2 REQUIREMENT) */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center">
              <History size={20} />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">Notification History</h3>
              <p className="text-xs text-slate-400">Track your reminder delivery activity across all supported channels.</p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={fetchLogs}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
            >
              <RefreshCw size={13} className={logsLoading ? 'animate-spin' : ''} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100">
          {/* Status Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-1">
            {[
              { id: 'all', label: 'All Statuses' },
              { id: 'delivered', label: 'Delivered' },
              { id: 'failed', label: 'Failed' },
              { id: 'pending', label: 'Pending' },
              { id: 'cancelled', label: 'Cancelled' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setHistoryStatusFilter(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  historyStatusFilter === tab.id
                    ? 'bg-rose-50 text-rose-600 border border-rose-200'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Channel Dropdown & Search */}
          <div className="flex items-center gap-2 ml-auto w-full sm:w-auto pt-2 sm:pt-0">
            <CustomSelect
              size="sm"
              value={historyChannelFilter}
              onChange={(e) => setHistoryChannelFilter(e.target.value)}
              options={[
                { value: 'all', label: 'All Channels' },
                { value: 'email', label: 'Email' },
                { value: 'push', label: 'Browser Push' },
                { value: 'whatsapp', label: 'WhatsApp' }
              ]}
            />

            <input
              type="text"
              placeholder="Search event name..."
              value={historySearch}
              onChange={(e) => setHistorySearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchLogs()}
              className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs w-36 sm:w-48"
            />
          </div>
        </div>

        {/* History Records Display: Structured Table on Desktop, Cards on Mobile */}
        {logsLoading ? (
          <div className="py-12 text-center text-xs text-slate-400">
            <RefreshCw size={24} className="animate-spin text-rose-500 mx-auto mb-2" />
            Loading actual notification dispatch logs...
          </div>
        ) : logs.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-2xl">
            No real notification dispatch records found matching your filters.
          </div>
        ) : (
          <div>
            {/* Desktop Structured Table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
                  <tr>
                    <th className="py-3 px-4">Event Name</th>
                    <th className="py-3 px-4">Channel</th>
                    <th className="py-3 px-4">Scheduled Date</th>
                    <th className="py-3 px-4">Delivered Time</th>
                    <th className="py-3 px-4">Status &amp; Failure Reason</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {logs.map(log => (
                    <tr key={log._id} className="hover:bg-slate-50/60">
                      <td className="py-3 px-4 font-bold text-slate-900">{log.eventName}</td>
                      <td className="py-3 px-4">
                        <span className="capitalize font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px]">
                          {log.channel}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {log.scheduledDate ? new Date(log.scheduledDate).toLocaleString() : 'N/A'}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {log.deliveredAt ? new Date(log.deliveredAt).toLocaleString() : '—'}
                      </td>
                      <td className="py-3 px-4">
                        <div className="space-y-0.5">
                          <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full capitalize ${
                            log.deliveryStatus === 'delivered'
                              ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                              : log.deliveryStatus === 'failed'
                              ? 'bg-rose-50 text-rose-600 border border-rose-100'
                              : 'bg-amber-50 text-amber-700 border border-amber-100'
                          }`}>
                            {log.deliveryStatus}
                          </span>
                          {log.failureReason && (
                            <p className="text-[10px] text-rose-500 leading-tight">{log.failureReason}</p>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        {log.deliveryStatus === 'failed' && (
                          <button
                            onClick={() => handleRetryNotification(log._id)}
                            disabled={retryingLogId === log._id}
                            className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold rounded-lg text-[10px] transition-colors"
                          >
                            {retryingLogId === log._id ? 'Retrying...' : 'Retry'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Stacked Cards */}
            <div className="sm:hidden space-y-2.5">
              {logs.map(log => (
                <div key={log._id} className="p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{log.eventName}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                      log.deliveryStatus === 'delivered'
                        ? 'bg-emerald-50 text-emerald-600'
                        : log.deliveryStatus === 'failed'
                        ? 'bg-rose-50 text-rose-600'
                        : 'bg-amber-50 text-amber-700'
                    }`}>
                      {log.deliveryStatus}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span className="capitalize font-bold bg-slate-200/60 px-1.5 py-0.5 rounded">{log.channel}</span>
                    <span>{log.scheduledDate ? new Date(log.scheduledDate).toLocaleDateString() : ''}</span>
                  </div>

                  {log.failureReason && (
                    <p className="text-[10px] text-rose-500 leading-tight bg-rose-50/50 p-1.5 rounded-lg">
                      {log.failureReason}
                    </p>
                  )}

                  {log.deliveryStatus === 'failed' && (
                    <button
                      onClick={() => handleRetryNotification(log._id)}
                      disabled={retryingLogId === log._id}
                      className="w-full py-1.5 bg-rose-600 text-white font-bold rounded-xl text-xs"
                    >
                      {retryingLogId === log._id ? 'Retrying...' : 'Retry Dispatch'}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 8. Data & Privacy */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-slate-100 text-slate-600 flex items-center justify-center">
            <Shield size={20} />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-900 text-base">Data &amp; Privacy</h3>
            <p className="text-xs text-slate-400">Export personal reminders or manage account credentials</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
          <button
            type="button"
            onClick={handleExportReminders}
            className="inline-flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 px-4 rounded-2xl text-xs transition-colors"
          >
            <Download size={15} />
            <span>Export Reminders (JSON)</span>
          </button>

          <Link
            to="/app/profile"
            className="inline-flex items-center justify-center gap-1.5 text-xs font-bold text-rose-500 hover:text-rose-600"
          >
            <span>Go to Account &amp; Profile Center</span>
            <ChevronRight size={15} />
          </Link>
        </div>
      </div>

      {/* 9. Minimal Footer with Link */}
      <footer className="pt-8 text-center text-xs text-slate-400 space-y-1">
        <p className="font-medium">Created by Indrajit Bhowmick</p>
        <p className="text-[11px]">
          For more information about the creator or Date Reminder, visit the{' '}
          <Link to="/app/about" className="text-rose-500 hover:underline font-semibold">
            About section
          </Link>.
        </p>
      </footer>
    </div>
  );
}
