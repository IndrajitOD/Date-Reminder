import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, AlertCircle, Info, AlertTriangle, 
  Bell, X 
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

/**
 * ToastConfig for each status type:
 * SUCCESS — Green
 * ERROR   — Red
 * INFO    — Blue
 * WARNING — Orange
 * NOTICE  — Yellow
 */
const TOAST_STYLES = {
  success: {
    icon: CheckCircle2,
    badgeBg: 'bg-emerald-50 text-emerald-600 border border-emerald-200/60',
    barBg: 'bg-emerald-500',
    iconColor: 'text-emerald-500',
    titleDefault: 'Success'
  },
  error: {
    icon: AlertCircle,
    badgeBg: 'bg-rose-50 text-rose-600 border border-rose-200/60',
    barBg: 'bg-rose-500',
    iconColor: 'text-rose-500',
    titleDefault: 'Error'
  },
  info: {
    icon: Info,
    badgeBg: 'bg-blue-50 text-blue-600 border border-blue-200/60',
    barBg: 'bg-blue-500',
    iconColor: 'text-blue-500',
    titleDefault: 'Information'
  },
  warning: {
    icon: AlertTriangle,
    badgeBg: 'bg-orange-50 text-orange-600 border border-orange-200/60',
    barBg: 'bg-orange-500',
    iconColor: 'text-orange-500',
    titleDefault: 'Warning'
  },
  notice: {
    icon: Bell,
    badgeBg: 'bg-amber-50 text-amber-600 border border-amber-200/60',
    barBg: 'bg-amber-400',
    iconColor: 'text-amber-500',
    titleDefault: 'Notice'
  }
};

export default function GlobalToastContainer() {
  const { toasts, dismissToast } = useApp();

  if (!toasts || toasts.length === 0) return null;

  return (
    <div 
      aria-live="polite"
      aria-label="Notification alerts"
      className="fixed top-5 left-1/2 -translate-x-1/2 z-[100] flex flex-col items-center gap-2 pointer-events-none w-full max-w-md px-4"
    >
      {toasts.map((toast) => {
        const type = TOAST_STYLES[toast.type] ? toast.type : 'info';
        const config = TOAST_STYLES[type];
        const Icon = config.icon;

        return (
          <div
            key={toast.id}
            role="alert"
            className="pointer-events-auto w-full bg-white/95 backdrop-blur-md text-slate-800 rounded-2xl border border-slate-100 shadow-xl shadow-slate-900/10 p-3 sm:p-3.5 flex items-start gap-3 transition-all duration-200 animate-in slide-in-from-top-4 fade-in duration-200"
          >
            {/* Status Icon */}
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${config.badgeBg}`}>
              <Icon size={17} className={`stroke-[2.5] ${config.iconColor}`} />
            </div>

            {/* Message Body */}
            <div className="flex-1 min-w-0 pt-0.5">
              {toast.title && (
                <p className="text-xs font-bold text-slate-900 leading-tight">
                  {toast.title}
                </p>
              )}
              <p className="text-xs font-medium text-slate-700 leading-relaxed break-words">
                {toast.message}
              </p>
            </div>

            {/* Dismiss Button */}
            <button
              onClick={() => dismissToast(toast.id)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors shrink-0"
              aria-label="Close notification"
            >
              <X size={14} className="stroke-[2.5]" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
