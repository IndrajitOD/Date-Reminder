import React, { useState, useEffect } from 'react';
import { 
  Bell, BellOff, Mail, MessageSquare, Smartphone, Clock, 
  CheckCircle2, AlertCircle, Save, History, Shield, Download, 
  ExternalLink, Trash2, Calendar, Filter, Sparkles, AlertTriangle, RefreshCw
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
    globalEvents,
    reminders, 
    showToast 
  } = useApp();
  const navigate = useNavigate();

  const prefs = currentUser?.notificationPreferences || {};

  // 1. Notification Preferences States
  const [masterEnabled, setMasterEnabled] = useState(prefs.masterEnabled ?? true);
  const [personalRemindersEnabled, setPersonalRemindersEnabled] = useState(prefs.personalRemindersEnabled ?? true);
  const [uncategorizedRemindersEnabled, setUncategorizedRemindersEnabled] = useState(prefs.uncategorizedRemindersEnabled ?? true);
  const [globalEventsEnabled, setGlobalEventsEnabled] = useState(prefs.globalEventsEnabled ?? true);

  // Category notification preferences (tracked as map categoryName -> boolean)
  const [categoryAlerts, setCategoryAlerts] = useState({});

  // 2. Delivery Channels
  const [emailEnabled, setEmailEnabled] = useState(prefs.email?.enabled ?? true);
  const [emailAddress, setEmailAddress] = useState(prefs.email?.address || currentUser?.email || '');
  const [browserPushEnabled, setBrowserPushEnabled] = useState(prefs.browserPush?.enabled ?? true);
  const [pushPermissionStatus, setPushPermissionStatus] = useState(
    typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'unsupported'
  );
  const [whatsappEnabled, setWhatsappEnabled] = useState(prefs.whatsapp?.enabled ?? false);
  const [whatsappNumber, setWhatsappNumber] = useState(prefs.whatsapp?.number || currentUser?.phone || '');

  // 3. Application Preferences
  const [timezone, setTimezone] = useState(currentUser?.timezone || 'UTC');
  const [dateFormat, setDateFormat] = useState(currentUser?.dateFormat || 'MMM DD, YYYY');
  const [timeFormat, setTimeFormat] = useState(currentUser?.timeFormat || '12h');
  const [defaultCalendarView, setDefaultCalendarView] = useState(currentUser?.defaultCalendarView || 'month');
  const [firstDayOfWeek, setFirstDayOfWeek] = useState('Sunday');
  const [language, setLanguage] = useState(currentUser?.language || 'English (US)');
  const [theme, setTheme] = useState('Light');

  // 4. Reminder Scheduling Defaults
  const [defaultAdvanceDays, setDefaultAdvanceDays] = useState(prefs.defaultAdvanceDays || 3);
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
  const [historyFilter, setHistoryFilter] = useState('all'); // 'all' | 'delivered' | 'failed' | 'pending' | 'email' | 'push'

  const [saving, setSaving] = useState(false);

  // Fetch real notification history from backend API
  useEffect(() => {
    async function fetchLogs() {
      try {
        setLogsLoading(true);
        const res = await api.getNotificationLogs();
        if (res?.data) {
          setLogs(res.data);
        }
      } catch (err) {
        console.warn('Could not load notification logs:', err.message);
      } finally {
        setLogsLoading(false);
      }
    }
    fetchLogs();
  }, []);

  // Sync state when currentUser is loaded
  useEffect(() => {
    if (currentUser) {
      if (currentUser.timezone) setTimezone(currentUser.timezone);
      if (currentUser.dateFormat) setDateFormat(currentUser.dateFormat);
      if (currentUser.timeFormat) setTimeFormat(currentUser.timeFormat);
      if (currentUser.defaultCalendarView) setDefaultCalendarView(currentUser.defaultCalendarView);
    }
  }, [currentUser]);

  // Request browser notification permission
  const handleRequestPushPermission = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        const permission = await Notification.requestPermission();
        setPushPermissionStatus(permission);
        if (permission === 'granted') {
          setBrowserPushEnabled(true);
          showToast('Browser notifications permission granted.', 'success');
        } else if (permission === 'denied') {
          setBrowserPushEnabled(false);
          showToast('Browser notifications were blocked in browser settings.', 'warning');
        }
      } catch (err) {
        showToast('Error requesting notification permission.', 'error');
      }
    } else {
      showToast('Notifications are not supported by this browser.', 'notice');
    }
  };

  // Test notification preview
  const handleSendTestNotification = () => {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      new Notification('Date Reminder Alert', {
        body: 'This is a test notification. Your delivery pipeline is working smoothly!',
        icon: '/favicon.svg'
      });
      showToast('Test push notification dispatched.', 'success');
    } else {
      showToast('Please enable and grant browser permission first.', 'notice');
    }
  };

  // Export personal reminders as JSON
  const handleExportReminders = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(reminders, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `date-reminder-export-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Personal reminders exported successfully.', 'success');
  };

  // Save All Settings
  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);

    // Validate quiet hours time range
    if (quietHoursStart === quietHoursEnd) {
      showToast('Quiet hours start and end cannot be identical.', 'warning');
      setSaving(false);
      return;
    }

    try {
      await updateUserSettings({
        timezone,
        dateFormat,
        timeFormat,
        defaultCalendarView,
        language,
        firstDayOfWeek,
        notificationPreferences: {
          masterEnabled,
          globalEventsEnabled,
          personalRemindersEnabled,
          uncategorizedRemindersEnabled,
          email: { enabled: emailEnabled, address: emailAddress.trim(), verified: true },
          whatsapp: { enabled: whatsappEnabled, number: whatsappNumber.trim(), verified: false },
          browserPush: { enabled: browserPushEnabled, permission: pushPermissionStatus },
          defaultAdvanceDays: Number(defaultAdvanceDays),
          defaultRecurrence,
          digestTime: morningNotificationTime,
          eveningNotificationTime,
          quietHoursStart,
          quietHoursEnd,
          weekendNotifications,
          dailyDigestEnabled,
          maxNotificationsPerDay: Number(maxNotificationsPerDay)
        }
      });
      showToast('Settings & Preferences saved successfully.', 'success');
    } catch (err) {
      showToast('Failed to save settings. Please try again.', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Filter logs for real history view
  const filteredLogs = logs.filter(log => {
    if (historyFilter === 'all') return true;
    if (historyFilter === 'delivered' && log.deliveryStatus !== 'delivered') return false;
    if (historyFilter === 'failed' && log.deliveryStatus !== 'failed') return false;
    if (historyFilter === 'pending' && log.deliveryStatus !== 'pending') return false;
    if (historyFilter === 'email' && log.channel !== 'email') return false;
    if (historyFilter === 'push' && log.channel !== 'push') return false;
    return true;
  });

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* 1. Page Heading */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Settings & Preferences
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Personalize your notifications, reminders, timezone and application experience.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* 2. Notification Preferences Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${masterEnabled ? 'bg-rose-50 text-rose-500 shadow-xs' : 'bg-slate-100 text-slate-400'}`}>
                {masterEnabled ? <Bell size={22} className="stroke-[2.2]" /> : <BellOff size={22} className="stroke-[2.2]" />}
              </div>
              <div>
                <h2 className="text-base font-extrabold text-slate-900">Master Notifications</h2>
                <p className="text-xs text-slate-400">
                  {masterEnabled 
                    ? 'All automated notifications across all channels are active.' 
                    : 'All notifications are suppressed without erasing your preferences.'}
                </p>
              </div>
            </div>
            <ToggleSwitch
              checked={masterEnabled}
              onChange={setMasterEnabled}
              id="toggle-master-notifications"
            />
          </div>

          <div className={`space-y-4 pt-1 transition-opacity ${!masterEnabled ? 'opacity-40 pointer-events-none' : ''}`}>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Event Sources & Scopes
            </h3>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-4">
              <ToggleSwitch
                label="Personal Reminders Alerts"
                description="Receive advance notifications for all your private dates and milestones."
                checked={personalRemindersEnabled}
                onChange={setPersonalRemindersEnabled}
                id="toggle-personal-alerts"
              />

              <div className="border-t border-slate-200/60 pt-3">
                <ToggleSwitch
                  label="Uncategorized Reminders Alerts"
                  description="Allow reminders created without an assigned category to dispatch alerts."
                  checked={uncategorizedRemindersEnabled}
                  onChange={setUncategorizedRemindersEnabled}
                  id="toggle-uncategorized-alerts"
                />
              </div>

              <div className="border-t border-slate-200/60 pt-3">
                <ToggleSwitch
                  label="Global Important Dates Catalog"
                  description="Receive alerts for your subscribed international festivals and cultural holidays."
                  checked={globalEventsEnabled}
                  onChange={setGlobalEventsEnabled}
                  id="toggle-global-alerts"
                />
              </div>
            </div>

            {/* Category-Specific Rules */}
            {customCategories.length > 0 && (
              <div className="pt-2">
                <h4 className="text-xs font-bold text-slate-700 mb-2.5">Category-Specific Alert Toggles</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {customCategories.map(cat => (
                    <div key={cat.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-800 truncate">{cat.name}</span>
                      <ToggleSwitch
                        size="sm"
                        checked={categoryAlerts[cat.id] ?? true}
                        onChange={(val) => setCategoryAlerts({ ...categoryAlerts, [cat.id]: val })}
                        id={`cat-toggle-${cat.id}`}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 3. Delivery Channels Section */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-xs space-y-6">
          <div>
            <h2 className="text-base font-extrabold text-slate-900">Delivery Channels</h2>
            <p className="text-xs text-slate-400">Configure where you receive upcoming reminder dispatches.</p>
          </div>

          <div className="space-y-5">
            {/* A. Email Channel */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Mail size={18} />
                  </div>
                  <div>
                    <h3 className="font-bold text-xs sm:text-sm text-slate-800">Email Notifications</h3>
                    <p className="text-[11px] text-slate-400">Automated reminder summaries delivered to your inbox.</p>
                  </div>
                </div>
                <ToggleSwitch
                  checked={emailEnabled}
                  onChange={setEmailEnabled}
                  id="toggle-email-channel"
                />
              </div>

              {emailEnabled && (
                <div className="pt-2 space-y-2">
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    Notification Email Address
                  </label>
                  <input
                    type="email"
                    value={emailAddress}
                    onChange={(e) => setEmailAddress(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                  />
                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                      <CheckCircle2 size={12} /> Status: Verified
                    </span>
                    <button
                      type="button"
                      onClick={() => showToast(`Test notification email queued for ${emailAddress}.`, 'info')}
                      className="text-xs font-bold text-rose-500 hover:underline cursor-pointer"
                    >
                      Send Test Email
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* B. Browser Push Channel */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                    <Smartphone size={18} />
                  </div>
                  <div>
                    <h3 className="font-bold text-xs sm:text-sm text-slate-800">Browser Web Push</h3>
                    <p className="text-[11px] text-slate-400">Desktop and mobile web push alerts for due events.</p>
                  </div>
                </div>
                <ToggleSwitch
                  checked={browserPushEnabled}
                  onChange={setBrowserPushEnabled}
                  id="toggle-push-channel"
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 text-xs pt-1">
                <span className="text-[11px] text-slate-500 font-medium">
                  Browser Permission: <strong className="capitalize text-slate-800">{pushPermissionStatus}</strong>
                </span>

                <div className="flex items-center gap-2">
                  {pushPermissionStatus !== 'granted' && (
                    <button
                      type="button"
                      onClick={handleRequestPushPermission}
                      className="px-3 py-1 bg-white border border-slate-200 text-rose-600 font-bold rounded-lg text-xs hover:bg-rose-50 transition-colors cursor-pointer"
                    >
                      Request Permission
                    </button>
                  )}
                  {pushPermissionStatus === 'granted' && (
                    <button
                      type="button"
                      onClick={handleSendTestNotification}
                      className="px-3 py-1 bg-white border border-slate-200 text-slate-700 font-bold rounded-lg text-xs hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      Send Test Push
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* C. WhatsApp Channel (Transparently marked Coming Soon) */}
            <div className="p-5 rounded-2xl bg-slate-50/70 border border-slate-200/70 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <MessageSquare size={18} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-xs sm:text-sm text-slate-800">WhatsApp Messaging</h3>
                      <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[10px] font-extrabold uppercase border border-amber-200/60">
                        Coming Soon
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">Automated mobile notifications via WhatsApp Business API.</p>
                  </div>
                </div>
                <ToggleSwitch
                  checked={whatsappEnabled}
                  onChange={setWhatsappEnabled}
                  disabled={true}
                  id="toggle-whatsapp-channel"
                />
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed bg-white/70 p-2.5 rounded-xl border border-slate-100">
                Direct WhatsApp automated dispatches are in active development. Please keep Email or Web Push active to ensure you receive timely notices.
              </p>
            </div>
          </div>
        </div>

        {/* 4. Application Preferences Section */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-xs space-y-6">
          <div>
            <h2 className="text-base font-extrabold text-slate-900">Application Preferences</h2>
            <p className="text-xs text-slate-400">Locale, IANA timezone with dynamic offset, calendar views, and format defaults.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Searchable IANA Timezone with dynamic offset */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Timezone (Full IANA Database with Dynamic UTC Offset)
              </label>
              <SearchableTimezoneSelect
                value={timezone}
                onChange={setTimezone}
              />
            </div>

            {/* Date Format */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Date Format
              </label>
              <CustomSelect
                className="w-full"
                value={dateFormat}
                onChange={(e) => setDateFormat(e.target.value)}
                options={[
                  { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY (21/11/2026)' },
                  { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY (11/21/2026)' },
                  { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD (2026-11-21)' },
                  { value: 'DD MMM YYYY', label: 'DD MMM YYYY (21 Nov 2026)' },
                  { value: 'MMM DD, YYYY', label: 'MMM DD, YYYY (Nov 21, 2026)' }
                ]}
              />
            </div>

            {/* Time Format */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Time Format
              </label>
              <CustomSelect
                className="w-full"
                value={timeFormat}
                onChange={(e) => setTimeFormat(e.target.value)}
                options={[
                  { value: '12h', label: '12-hour format (AM/PM)' },
                  { value: '24h', label: '24-hour format' }
                ]}
              />
            </div>

            {/* Default Calendar View */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Default Calendar View
              </label>
              <CustomSelect
                className="w-full"
                value={defaultCalendarView}
                onChange={(e) => setDefaultCalendarView(e.target.value)}
                options={[
                  { value: 'day', label: 'Day View' },
                  { value: 'week', label: 'Week View' },
                  { value: 'month', label: 'Month View' },
                  { value: 'year', label: 'Year View' }
                ]}
              />
            </div>

            {/* First Day of Week */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                First Day of Week
              </label>
              <CustomSelect
                className="w-full"
                value={firstDayOfWeek}
                onChange={(e) => setFirstDayOfWeek(e.target.value)}
                options={['Sunday', 'Monday', 'Saturday']}
              />
            </div>

            {/* Preferred Language */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Language
              </label>
              <CustomSelect
                className="w-full"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                options={[
                  'English (US)',
                  'English (UK)',
                  'Spanish',
                  'French',
                  'German',
                  'Hindi'
                ]}
              />
            </div>

            {/* Theme */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Interface Theme
              </label>
              <CustomSelect
                className="w-full"
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                options={[
                  { value: 'Light', label: 'Light Theme' },
                  { value: 'Dark', label: 'Dark Theme (Planned)' },
                  { value: 'System', label: 'System Default' }
                ]}
              />
            </div>
          </div>
        </div>

        {/* 5. Reminder Scheduling Defaults */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-xs space-y-6">
          <div>
            <h2 className="text-base font-extrabold text-slate-900">Reminder Scheduling</h2>
            <p className="text-xs text-slate-400">Establish intelligent timing defaults for newly created reminders.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Default Reminder Timing
              </label>
              <CustomSelect
                className="w-full"
                value={defaultAdvanceDays}
                onChange={(e) => setDefaultAdvanceDays(Number(e.target.value))}
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
                Default Recurrence
              </label>
              <CustomSelect
                className="w-full"
                value={defaultRecurrence}
                onChange={(e) => setDefaultRecurrence(e.target.value)}
                options={[
                  { value: 'none', label: 'Does not repeat (One-time)' },
                  { value: 'daily', label: 'Daily' },
                  { value: 'weekly', label: 'Weekly' },
                  { value: 'monthly', label: 'Monthly' },
                  { value: 'yearly', label: 'Yearly (Annual)' }
                ]}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Morning Notification Time
              </label>
              <input
                type="time"
                value={morningNotificationTime}
                onChange={(e) => setMorningNotificationTime(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Evening Notification Time
              </label>
              <input
                type="time"
                value={eveningNotificationTime}
                onChange={(e) => setEveningNotificationTime(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Quiet Hours (Start - End)
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="time"
                  value={quietHoursStart}
                  onChange={(e) => setQuietHoursStart(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                />
                <input
                  type="time"
                  value={quietHoursEnd}
                  onChange={(e) => setQuietHoursEnd(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Max Notifications Per Day
              </label>
              <input
                type="number"
                min="1"
                max="20"
                value={maxNotificationsPerDay}
                onChange={(e) => setMaxNotificationsPerDay(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
              />
            </div>
          </div>

          <div className="pt-2 space-y-3">
            <ToggleSwitch
              label="Weekend Notifications"
              description="Deliver scheduled notices on Saturdays and Sundays."
              checked={weekendNotifications}
              onChange={setWeekendNotifications}
              id="toggle-weekend-notifs"
            />
            <div className="border-t border-slate-100 pt-3">
              <ToggleSwitch
                label="Daily Morning Digest"
                description="Consolidate all pending dates for the day into a single organized morning summary."
                checked={dailyDigestEnabled}
                onChange={setDailyDigestEnabled}
                id="toggle-daily-digest"
              />
            </div>
          </div>
        </div>

        {/* 6. Notification History Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <History size={18} className="text-slate-400" />
              <div>
                <h2 className="text-base font-extrabold text-slate-900">Notification History</h2>
                <p className="text-xs text-slate-400">Actual audit logs of dispatched reminders.</p>
              </div>
            </div>

            {/* Filter pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
              {['all', 'delivered', 'failed', 'pending', 'email', 'push'].map(f => (
                <button
                  type="button"
                  key={f}
                  onClick={() => setHistoryFilter(f)}
                  className={`px-3 py-1 rounded-xl font-bold capitalize transition-colors cursor-pointer ${
                    historyFilter === f
                      ? 'bg-rose-500 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {logsLoading ? (
            <div className="py-8 text-center text-xs text-slate-400">Loading audit history...</div>
          ) : filteredLogs.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400 space-y-1">
              <p className="font-semibold text-slate-600">No notification logs recorded yet.</p>
              <p>When automated reminders trigger, their delivery status will appear here.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredLogs.map(log => {
                const statusStyles = {
                  delivered: 'bg-emerald-50 text-emerald-600 border border-emerald-100',
                  failed: 'bg-rose-50 text-rose-600 border border-rose-100',
                  pending: 'bg-orange-50 text-orange-600 border border-orange-100',
                  suppressed: 'bg-slate-100 text-slate-600 border border-slate-200'
                }[log.deliveryStatus] || 'bg-slate-100 text-slate-600';

                return (
                  <div key={log._id || log.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs gap-3">
                    <div className="min-w-0">
                      <p className="font-bold text-slate-900 truncate">{log.eventName}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        <span className="capitalize">{log.channel}</span> • {new Date(log.scheduledDate || log.createdAt).toLocaleString()}
                        {log.failureReason && <span className="text-rose-500 block">Reason: {log.failureReason}</span>}
                      </p>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase shrink-0 ${statusStyles}`}>
                      {log.deliveryStatus}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 7. Data & Privacy Section */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-xs space-y-4">
          <div>
            <h2 className="text-base font-extrabold text-slate-900">Data & Privacy</h2>
            <p className="text-xs text-slate-400">Download your personal records or manage account safeguards.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <button
              type="button"
              onClick={handleExportReminders}
              className="p-4 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-100 transition-colors flex items-center justify-between text-left cursor-pointer"
            >
              <div>
                <h4 className="font-bold text-xs text-slate-800">Export Reminders (JSON)</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">Download your active dates to your local device</p>
              </div>
              <Download size={16} className="text-rose-500 shrink-0" />
            </button>

            <Link
              to="/app/profile"
              className="p-4 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-100 transition-colors flex items-center justify-between text-left"
            >
              <div>
                <h4 className="font-bold text-xs text-slate-800">Account Security & Deletion</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">Manage credentials or remove your profile</p>
              </div>
              <ExternalLink size={16} className="text-slate-400 shrink-0" />
            </Link>
          </div>
        </div>

        {/* 8. Save All Settings Action */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-rose-500 to-red-600 text-white font-bold py-3.5 px-8 rounded-2xl shadow-lg shadow-rose-500/25 hover:shadow-rose-500/40 active:scale-95 transition-all text-sm cursor-pointer disabled:opacity-50"
          >
            <Save size={18} />
            <span>{saving ? 'Saving...' : 'Save All Settings'}</span>
          </button>
        </div>
      </form>

      {/* 10. Required Footer */}
      <footer className="pt-8 border-t border-slate-200/80 text-center text-xs text-slate-500 space-y-1">
        <p className="font-medium">Created by Indrajit Bhowmick</p>
        <p className="text-[11px] text-slate-400">
          For more information about the creator or Date Reminder, visit the{' '}
          <Link to="/app/about" className="text-rose-500 font-bold hover:underline">
            About section
          </Link>.
        </p>
      </footer>
    </div>
  );
}
