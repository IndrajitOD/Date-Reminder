import React, { useState } from 'react';
import { 
  Mail, MessageSquare, Smartphone, Clock, CheckCircle2, 
  AlertCircle, Save, Bell, BellOff, History 
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import CustomSelect from '../components/common/CustomSelect';

export default function SettingsPage() {
  const { currentUser, updateUserSettings } = useApp();
  const prefs = currentUser?.notificationPreferences || {};

  // Master Notification Switch (Suppresses all alerts when false)
  const [masterEnabled, setMasterEnabled] = useState(prefs.masterEnabled ?? true);
  const [globalEventsEnabled, setGlobalEventsEnabled] = useState(prefs.globalEventsEnabled ?? true);
  const [personalRemindersEnabled, setPersonalRemindersEnabled] = useState(prefs.personalRemindersEnabled ?? true);
  const [uncategorizedRemindersEnabled, setUncategorizedRemindersEnabled] = useState(prefs.uncategorizedRemindersEnabled ?? true);

  // Channels
  const [emailEnabled, setEmailEnabled] = useState(prefs.email?.enabled ?? true);
  const [emailAddress, setEmailAddress] = useState(prefs.email?.address || currentUser.email || '');

  const [whatsappEnabled, setWhatsappEnabled] = useState(prefs.whatsapp?.enabled ?? false);
  const [whatsappNumber, setWhatsappNumber] = useState(prefs.whatsapp?.number || currentUser.phone || '');

  const [browserPushEnabled, setBrowserPushEnabled] = useState(prefs.browserPush?.enabled ?? true);
  
  // Timing & Preferences
  const [defaultAdvanceDays, setDefaultAdvanceDays] = useState(prefs.defaultAdvanceDays || 3);
  const [digestTime, setDigestTime] = useState(prefs.digestTime || '09:00');
  const [timezone, setTimezone] = useState(currentUser?.timezone || 'America/New_York (UTC-5)');
  const [dateFormat, setDateFormat] = useState(currentUser?.dateFormat || 'MMM DD, YYYY');
  const [timeFormat, setTimeFormat] = useState(currentUser?.timeFormat || '12h');
  const [defaultCalendarView, setDefaultCalendarView] = useState(currentUser?.defaultCalendarView || 'month');

  // Realistic notification delivery audit logs
  const [logs] = useState([
    { id: 1, event: "Mom's Birthday Celebration", channel: 'Email', scheduled: '2026-11-12 09:00', status: 'delivered' },
    { id: 2, event: "Health Insurance Premium", channel: 'Email', scheduled: '2026-10-31 09:00', status: 'delivered' },
    { id: 3, event: "Diwali (Festival of Lights)", channel: 'Push', scheduled: '2026-11-05 09:00', status: 'delivered' }
  ]);

  const timezones = [
    'America/New_York (UTC-5)',
    'America/Chicago (UTC-6)',
    'America/Los_Angeles (UTC-8)',
    'Europe/London (UTC+0)',
    'Europe/Paris (UTC+1)',
    'Asia/Kolkata (IST, UTC+5:30)',
    'Asia/Dubai (GST, UTC+4)',
    'Asia/Tokyo (JST, UTC+9)',
    'Australia/Sydney (AEST, UTC+10)'
  ];

  const handleSave = (e) => {
    e.preventDefault();
    updateUserSettings({
      timezone,
      dateFormat,
      timeFormat,
      defaultCalendarView,
      notificationPreferences: {
        masterEnabled,
        globalEventsEnabled,
        personalRemindersEnabled,
        uncategorizedRemindersEnabled,
        email: { enabled: emailEnabled, address: emailAddress.trim(), verified: true },
        whatsapp: { enabled: whatsappEnabled, number: whatsappNumber.trim(), verified: false },
        browserPush: { enabled: browserPushEnabled, permission: browserPushEnabled ? 'granted' : 'denied' },
        defaultAdvanceDays: Number(defaultAdvanceDays),
        digestTime
      }
    });
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Notification & Application Settings</h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
          Master switch controls, independent personal & global notification rules, channels, and delivery history.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-4">
        {/* Master Notification Switch */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-100 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${masterEnabled ? 'bg-rose-50 text-rose-500' : 'bg-slate-100 text-slate-400'}`}>
              {masterEnabled ? <Bell size={22} /> : <BellOff size={22} />}
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-900">Master Notification Switch</h3>
              <p className="text-xs text-slate-400">
                {masterEnabled ? 'All automated notification dispatches are currently active.' : 'All notification dispatches are suppressed.'}
              </p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={masterEnabled}
              onChange={(e) => setMasterEnabled(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-500"></div>
          </label>
        </div>

        {/* Independent Source Notification Switches */}
        <div className={`bg-white rounded-3xl p-5 sm:p-6 border border-slate-100 shadow-xs space-y-4 ${!masterEnabled ? 'opacity-50 pointer-events-none' : ''}`}>
          <h4 className="font-extrabold text-sm text-slate-900">Independent Event Alert Controls</h4>
          
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <p className="font-bold text-xs text-slate-800">Personal Reminders Alerts</p>
              <p className="text-[11px] text-slate-400">Enable/disable notifications for all your private dates</p>
            </div>
            <input
              type="checkbox"
              checked={personalRemindersEnabled}
              onChange={(e) => setPersonalRemindersEnabled(e.target.checked)}
              className="w-4 h-4 text-rose-500 rounded border-slate-300 focus:ring-rose-500"
            />
          </div>

          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <p className="font-bold text-xs text-slate-800">Uncategorized Reminders Alerts</p>
              <p className="text-[11px] text-slate-400">Allow reminders without a specified category to send notices</p>
            </div>
            <input
              type="checkbox"
              checked={uncategorizedRemindersEnabled}
              onChange={(e) => setUncategorizedRemindersEnabled(e.target.checked)}
              className="w-4 h-4 text-rose-500 rounded border-slate-300 focus:ring-rose-500"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold text-xs text-slate-800">Global Events Catalog Alerts</p>
              <p className="text-[11px] text-slate-400">Receive notices for subscribed national & cultural holidays</p>
            </div>
            <input
              type="checkbox"
              checked={globalEventsEnabled}
              onChange={(e) => setGlobalEventsEnabled(e.target.checked)}
              className="w-4 h-4 text-rose-500 rounded border-slate-300 focus:ring-rose-500"
            />
          </div>
        </div>

        {/* Channels */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-100 shadow-xs space-y-4">
          <h4 className="font-extrabold text-sm text-slate-900">Delivery Channels</h4>

          {/* Email */}
          <div className="space-y-3 pb-3 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Mail size={18} className="text-blue-500" />
                <span className="font-bold text-xs text-slate-800">Email Delivery</span>
              </div>
              <input
                type="checkbox"
                checked={emailEnabled}
                onChange={(e) => setEmailEnabled(e.target.checked)}
                className="w-4 h-4 text-rose-500 rounded border-slate-300"
              />
            </div>
            <input
              type="email"
              value={emailAddress}
              onChange={(e) => setEmailAddress(e.target.value)}
              disabled={!emailEnabled}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-rose-500/20 disabled:opacity-50"
            />
          </div>

          {/* WhatsApp */}
          <div className="space-y-3 pb-3 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <MessageSquare size={18} className="text-emerald-500" />
                <span className="font-bold text-xs text-slate-800">WhatsApp Messaging</span>
              </div>
              <input
                type="checkbox"
                checked={whatsappEnabled}
                onChange={(e) => setWhatsappEnabled(e.target.checked)}
                className="w-4 h-4 text-rose-500 rounded border-slate-300"
              />
            </div>
            <input
              type="tel"
              value={whatsappNumber}
              onChange={(e) => setWhatsappNumber(e.target.value)}
              disabled={!whatsappEnabled}
              placeholder="+1 (555) 234-5678"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-rose-500/20 disabled:opacity-50"
            />
            <p className="text-[11px] text-amber-600 bg-amber-50 p-2 rounded-xl">
              Requires phone handshake verification before automated messages can dispatch.
            </p>
          </div>

          {/* Browser Push */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Smartphone size={18} className="text-purple-500" />
              <span className="font-bold text-xs text-slate-800">Browser Web Push</span>
            </div>
            <input
              type="checkbox"
              checked={browserPushEnabled}
              onChange={(e) => setBrowserPushEnabled(e.target.checked)}
              className="w-4 h-4 text-rose-500 rounded border-slate-300"
            />
          </div>
        </div>

        {/* Preferences: Timezone, Formats */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-100 shadow-xs space-y-4">
          <h4 className="font-extrabold text-sm text-slate-900">Application Preferences</h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Timezone
              </label>
              <CustomSelect
                className="w-full"
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                options={timezones}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Morning Digest Time
              </label>
              <input
                type="time"
                value={digestTime}
                onChange={(e) => setDigestTime(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-rose-500/20"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Date Format
              </label>
              <CustomSelect
                className="w-full"
                value={dateFormat}
                onChange={(e) => setDateFormat(e.target.value)}
                options={[
                  { value: 'MMM DD, YYYY', label: 'MMM DD, YYYY' },
                  { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
                  { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' }
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
                  { value: '12h', label: '12-hour (AM/PM)' },
                  { value: '24h', label: '24-hour' }
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
                  { value: 'month', label: 'Month View' },
                  { value: 'week', label: 'Week View' },
                  { value: 'day', label: 'Day View' },
                  { value: 'year', label: 'Year View' }
                ]}
              />
            </div>
          </div>
        </div>

        {/* Notification History Log Table */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-100 shadow-xs space-y-3">
          <div className="flex items-center gap-2">
            <History size={16} className="text-slate-400" />
            <h4 className="font-extrabold text-sm text-slate-900">Recent Notification History</h4>
          </div>

          <div className="space-y-2">
            {logs.map(log => (
              <div key={log.id} className="p-3 rounded-2xl bg-slate-50 flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-slate-800">{log.event}</p>
                  <p className="text-[11px] text-slate-400">{log.channel} • {log.scheduled}</p>
                </div>
                <span className="font-bold text-[10px] bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full uppercase">
                  {log.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <button
          type="submit"
          className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-rose-500 to-red-600 text-white font-bold py-3.5 px-6 rounded-2xl shadow-lg shadow-rose-500/25 hover:shadow-rose-500/40 active:scale-95 transition-all text-sm"
        >
          <Save size={18} />
          <span>Save All Settings</span>
        </button>
      </form>
    </div>
  );
}
