// Helper functions for date operations and countdown calculation

export function calculateDaysRemaining(targetDateStr) {
  if (!targetDateStr) return { days: 0, text: 'No date', status: 'unknown' };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [year, month, day] = targetDateStr.split('-').map(Number);
  let eventDate = new Date(year, month - 1, day);
  eventDate.setHours(0, 0, 0, 0);

  const diffTime = eventDate - today;
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

export function getCategoryBadgeClasses(category) {
  switch (category) {
    case 'Birthday':
      return 'bg-rose-50 text-rose-600 border border-rose-100';
    case 'Anniversary':
      return 'bg-fuchsia-50 text-fuchsia-600 border border-fuchsia-100';
    case 'Bills & Finance':
      return 'bg-amber-50 text-amber-700 border border-amber-100';
    case 'Appointments':
      return 'bg-blue-50 text-blue-600 border border-blue-100';
    case 'Holiday':
    case 'National Day':
      return 'bg-emerald-50 text-emerald-700 border border-emerald-100';
    case 'Festival':
      return 'bg-orange-50 text-orange-700 border border-orange-100';
    case 'Subscription':
      return 'bg-cyan-50 text-cyan-700 border border-cyan-100';
    default:
      return 'bg-slate-100 text-slate-600 border border-slate-200';
  }
}
