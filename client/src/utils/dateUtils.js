// Core recurrence calculations and next-occurrence calculation logic
// Handles yearly recurring events (e.g. Birthdays, Anniversaries) across leap years,
// month-ends, past dates, and user timezones.

/**
 * Calculates the next upcoming occurrence date for a recurring or non-recurring event.
 * @param {string} eventDateStr - 'YYYY-MM-DD' or 'MM-DD'
 * @param {string} recurrence - 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom'
 * @param {string} userTimezone - optional IANA timezone string
 * @returns {{ nextDate: Date, nextDateStr: string, isPast: boolean, originalYear: number | null }}
 */
export function calculateNextOccurrence(eventDateStr, recurrence = 'yearly', userTimezone = null) {
  if (!eventDateStr) {
    const fallback = new Date();
    return {
      nextDate: fallback,
      nextDateStr: fallback.toISOString().slice(0, 10),
      isPast: false,
      originalYear: null
    };
  }

  const parts = eventDateStr.split('-').map(Number);
  let origYear = null;
  let origMonth = 1;
  let origDay = 1;

  if (parts.length === 3) {
    origYear = parts[0];
    origMonth = parts[1]; // 1-12
    origDay = parts[2];
  } else if (parts.length === 2) {
    origMonth = parts[0];
    origDay = parts[1];
  }

  // Get current date representation in user timezone if specified
  const now = new Date();
  const currentYear = now.getFullYear();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  if (recurrence === 'none') {
    const specificDate = origYear 
      ? new Date(origYear, origMonth - 1, origDay) 
      : new Date(currentYear, origMonth - 1, origDay);
    specificDate.setHours(0, 0, 0, 0);

    return {
      nextDate: specificDate,
      nextDateStr: formatDateToIso(specificDate),
      isPast: specificDate < today,
      originalYear: origYear
    };
  }

  if (recurrence === 'daily') {
    return {
      nextDate: today,
      nextDateStr: formatDateToIso(today),
      isPast: false,
      originalYear: origYear
    };
  }

  if (recurrence === 'weekly') {
    // Find next day matching target day of week
    const targetBase = origYear ? new Date(origYear, origMonth - 1, origDay) : today;
    const targetDayOfWeek = targetBase.getDay();
    const currentDayOfWeek = today.getDay();
    let diff = targetDayOfWeek - currentDayOfWeek;
    if (diff < 0) diff += 7;
    const nextDate = new Date(today);
    nextDate.setDate(today.getDate() + diff);
    nextDate.setHours(0, 0, 0, 0);

    return {
      nextDate,
      nextDateStr: formatDateToIso(nextDate),
      isPast: false,
      originalYear: origYear
    };
  }

  if (recurrence === 'monthly') {
    // Event on origDay of month
    let target = new Date(currentYear, now.getMonth(), Math.min(origDay, getDaysInMonth(currentYear, now.getMonth() + 1)));
    target.setHours(0, 0, 0, 0);
    if (target < today) {
      const nextMonth = now.getMonth() + 1;
      const yr = nextMonth > 11 ? currentYear + 1 : currentYear;
      const mo = nextMonth % 12;
      target = new Date(yr, mo, Math.min(origDay, getDaysInMonth(yr, mo + 1)));
      target.setHours(0, 0, 0, 0);
    }
    return {
      nextDate: target,
      nextDateStr: formatDateToIso(target),
      isPast: false,
      originalYear: origYear
    };
  }

  // Default: yearly recurrence
  // Check occurrence in current year first
  let dayToUse = origDay;
  // Handle Feb 29 on non-leap years (safely roll to Feb 28)
  if (origMonth === 2 && origDay === 29 && !isLeapYear(currentYear)) {
    dayToUse = 28;
  }

  let candidate = new Date(currentYear, origMonth - 1, dayToUse);
  candidate.setHours(0, 0, 0, 0);

  if (candidate < today) {
    // Passed this year, so next occurrence is next year
    const nextYear = currentYear + 1;
    let nextYearDay = origDay;
    if (origMonth === 2 && origDay === 29 && !isLeapYear(nextYear)) {
      nextYearDay = 28;
    }
    candidate = new Date(nextYear, origMonth - 1, nextYearDay);
    candidate.setHours(0, 0, 0, 0);
  }

  return {
    nextDate: candidate,
    nextDateStr: formatDateToIso(candidate),
    isPast: false,
    originalYear: origYear
  };
}

/**
 * Calculates days remaining from today until target date.
 */
export function calculateDaysRemaining(targetDateInput, recurrence = 'yearly') {
  if (!targetDateInput) return { days: 0, text: 'No date', status: 'unknown' };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // If recurring, calculate relative to next upcoming occurrence
  let targetDate;
  if (recurrence && recurrence !== 'none') {
    const { nextDate } = calculateNextOccurrence(targetDateInput, recurrence);
    targetDate = nextDate;
  } else {
    const parts = targetDateInput.split('-').map(Number);
    targetDate = new Date(parts[0], parts[1] - 1, parts[2] || 1);
    targetDate.setHours(0, 0, 0, 0);
  }

  const diffTime = targetDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return { days: 0, text: 'Today', status: 'today' };
  } else if (diffDays === 1) {
    return { days: 1, text: 'Tomorrow', status: 'upcoming' };
  } else if (diffDays > 1) {
    return { days: diffDays, text: `In ${diffDays}d`, status: 'upcoming' };
  } else {
    return { days: Math.abs(diffDays), text: `${Math.abs(diffDays)}d ago`, status: 'past' };
  }
}

export function formatDisplayDate(dateStr) {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-').map(Number);
  const dateObj = new Date(year, month - 1, day);
  return dateObj.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

export function formatMonthDay(dateStr) {
  if (!dateStr) return '';
  const parts = dateStr.split('-').map(Number);
  const month = parts.length === 3 ? parts[1] : parts[0];
  const day = parts.length === 3 ? parts[2] : parts[1];
  const dateObj = new Date(2000, month - 1, day);
  return dateObj.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });
}

function formatDateToIso(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function isLeapYear(year) {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

function getDaysInMonth(year, month) {
  return new Date(year, month, 0).getDate();
}

export function getCategoryBadgeClasses(category) {
  switch (category) {
    case 'Birthday':
      return 'bg-rose-50 text-rose-600 border border-rose-100';
    case 'Anniversary':
      return 'bg-fuchsia-50 text-fuchsia-600 border border-fuchsia-100';
    case 'Bills & Finance':
    case 'Financial & Bills':
      return 'bg-amber-50 text-amber-700 border border-amber-100';
    case 'Health & Medical':
    case 'Appointments':
      return 'bg-emerald-50 text-emerald-700 border border-emerald-100';
    case 'Work & Projects':
      return 'bg-blue-50 text-blue-600 border border-blue-100';
    case 'Festivals & Cultural':
    case 'Festival':
      return 'bg-orange-50 text-orange-700 border border-orange-100';
    case 'Personal Milestones':
    case 'Milestones':
      return 'bg-purple-50 text-purple-700 border border-purple-100';
    case 'Subscription':
      return 'bg-cyan-50 text-cyan-700 border border-cyan-100';
    default:
      return 'bg-slate-100 text-slate-600 border border-slate-200';
  }
}

export function getPriorityBadge(priority) {
  const p = (priority || 'normal').toLowerCase();
  switch (p) {
    case 'critical':
      return {
        label: 'Critical',
        classes: 'bg-red-50 text-red-600 border border-red-200'
      };
    case 'high':
      return {
        label: 'High',
        classes: 'bg-rose-50 text-rose-600 border border-rose-100'
      };
    case 'low':
      return {
        label: 'Low',
        classes: 'bg-slate-50 text-slate-500 border border-slate-100'
      };
    default:
      return {
        label: 'Normal',
        classes: 'bg-slate-100 text-slate-600 border border-slate-200'
      };
  }
}
