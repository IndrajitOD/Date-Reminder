/**
 * Utility to retrieve the complete list of IANA Timezones supported by the browser runtime,
 * dynamically calculating active UTC offsets for the current date (accounting for DST).
 */

const FALLBACK_TIMEZONES = [
  'UTC',
  'Africa/Cairo',
  'Africa/Johannesburg',
  'Africa/Lagos',
  'America/Anchorage',
  'America/Argentina/Buenos_Aires',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Mexico_City',
  'America/New_York',
  'America/Phoenix',
  'America/Sao_Paulo',
  'America/Toronto',
  'America/Vancouver',
  'Asia/Bangkok',
  'Asia/Dhaka',
  'Asia/Dubai',
  'Asia/Hong_Kong',
  'Asia/Jakarta',
  'Asia/Jerusalem',
  'Asia/Karachi',
  'Asia/Kolkata',
  'Asia/Manila',
  'Asia/Riyadh',
  'Asia/Seoul',
  'Asia/Shanghai',
  'Asia/Singapore',
  'Asia/Tokyo',
  'Australia/Adelaide',
  'Australia/Brisbane',
  'Australia/Melbourne',
  'Australia/Perth',
  'Australia/Sydney',
  'Europe/Amsterdam',
  'Europe/Athens',
  'Europe/Berlin',
  'Europe/Dublin',
  'Europe/Istanbul',
  'Europe/Lisbon',
  'Europe/London',
  'Europe/Madrid',
  'Europe/Moscow',
  'Europe/Paris',
  'Europe/Rome',
  'Europe/Stockholm',
  'Europe/Vienna',
  'Europe/Warsaw',
  'Europe/Zurich',
  'Pacific/Auckland',
  'Pacific/Fiji',
  'Pacific/Honolulu'
];

/**
 * Calculates the dynamic UTC offset for a given IANA timezone ID on current date.
 * Returns formatted string e.g. "UTC+05:30", "UTC-05:00", "UTC+00:00"
 */
export function getDynamicUtcOffset(timeZone, date = new Date()) {
  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone,
      timeZoneName: 'shortOffset'
    });
    const parts = formatter.formatToParts(date);
    const tzPart = parts.find(p => p.type === 'timeZoneName');
    if (tzPart && tzPart.value) {
      // Formats like "GMT+5:30" or "GMT-5"
      const val = tzPart.value.replace('GMT', 'UTC');
      if (val === 'UTC') return 'UTC+00:00';
      // Normalize e.g. "UTC-5" -> "UTC-05:00"
      const match = val.match(/^UTC([+-])(\d+)(?::(\d+))?$/);
      if (match) {
        const sign = match[1];
        const hours = match[2].padStart(2, '0');
        const minutes = (match[3] || '00').padStart(2, '0');
        return `UTC${sign}${hours}:${minutes}`;
      }
      return val;
    }
  } catch (err) {}

  // Fallback offset calculation via Date locale strings
  try {
    const tzDate = new Date(date.toLocaleString('en-US', { timeZone }));
    const utcDate = new Date(date.toLocaleString('en-US', { timeZone: 'UTC' }));
    const diffMinutes = Math.round((tzDate.getTime() - utcDate.getTime()) / (1000 * 60));
    const sign = diffMinutes >= 0 ? '+' : '-';
    const absMin = Math.abs(diffMinutes);
    const hours = String(Math.floor(absMin / 60)).padStart(2, '0');
    const minutes = String(absMin % 60).padStart(2, '0');
    return `UTC${sign}${hours}:${minutes}`;
  } catch (e) {
    return 'UTC';
  }
}

/**
 * Returns full sorted array of available IANA timezones with active labels and offset metadata.
 */
export function getIanaTimezoneList() {
  let rawList = [];
  try {
    if (typeof Intl !== 'undefined' && typeof Intl.supportedValuesOf === 'function') {
      rawList = Intl.supportedValuesOf('timeZone');
    }
  } catch (err) {}

  if (!rawList || rawList.length === 0) {
    rawList = FALLBACK_TIMEZONES;
  }

  const now = new Date();
  
  // Format each into { value, label, offset, region }
  return rawList.map(tz => {
    const offset = getDynamicUtcOffset(tz, now);
    const region = tz.includes('/') ? tz.split('/')[0].replace('_', ' ') : 'General';
    const city = tz.includes('/') ? tz.split('/').slice(1).join(' - ').replace(/_/g, ' ') : tz;

    return {
      value: tz,
      label: `${tz} (${offset})`,
      searchKey: `${tz} ${city} ${region} ${offset}`.toLowerCase(),
      offset,
      region,
      city
    };
  });
}
