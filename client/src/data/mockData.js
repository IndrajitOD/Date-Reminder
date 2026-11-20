// Curated standard global categories matching the 9 primary specifications
export const PRIMARY_GLOBAL_CATEGORIES = [
  {
    name: 'Celebrations & Festivals',
    slug: 'celebrations',
    icon: 'Sparkles',
    description: 'Major cultural, religious, and spiritual celebrations around the globe.'
  },
  {
    name: 'Love & Relationships',
    slug: 'love',
    icon: 'Heart',
    description: 'Days celebrating romance, affection, friendship, and family bonds.'
  },
  {
    name: 'National & Public Holidays',
    slug: 'national',
    icon: 'Flag',
    description: 'Official national days, independence celebrations, and sovereign milestones.'
  },
  {
    name: 'International & Awareness Days',
    slug: 'awareness',
    icon: 'Globe',
    description: 'Global observances for health, human rights, and planet conservation.'
  },
  {
    name: 'Historical & Memorial Days',
    slug: 'historical',
    icon: 'BookOpen',
    description: 'Solemn memorials, peace milestones, and historic anniversaries.'
  },
  {
    name: 'Famous Personalities',
    slug: 'personalities',
    icon: 'Award',
    description: 'Honoring legendary scientists, leaders, artists, and innovators.'
  },
  {
    name: 'Education & Career',
    slug: 'education',
    icon: 'GraduationCap',
    description: 'Days dedicated to students, teachers, engineering, and vocational paths.'
  },
  {
    name: 'Sports & Entertainment',
    slug: 'sports',
    icon: 'Trophy',
    description: 'World sports tournaments, cinema, music, and performance arts.'
  },
  {
    name: 'Fun & Unusual Days',
    slug: 'fun',
    icon: 'Smile',
    description: 'Lighthearted and quirky celebrations (e.g. Emoji Day, Pizza Day).'
  }
];

export const INITIAL_GLOBAL_EVENTS = [
  {
    id: 'gev-1',
    name: "New Year's Day",
    date: '2027-01-01',
    primaryCategory: 'Celebrations & Festivals',
    subCategory: 'Global New Year',
    country: 'Global',
    description: 'First day of the year on the modern Gregorian calendar.',
    historicalContext: 'Observed globally with gatherings and fireworks for centuries.',
    isVariableDate: false,
    subscribed: true
  },
  {
    id: 'gev-2',
    name: 'Valentine’s Day',
    date: '2027-02-14',
    primaryCategory: 'Love & Relationships',
    subCategory: 'Romance & Love',
    country: 'Global',
    description: 'Annual celebration honoring love, affection, and cherished bonds.',
    historicalContext: 'Originating from ancient festivals and St. Valentine traditions.',
    isVariableDate: false,
    subscribed: true
  },
  {
    id: 'gev-3',
    name: 'Republic Day (India)',
    date: '2027-01-26',
    primaryCategory: 'National & Public Holidays',
    subCategory: 'Constitution Day',
    country: 'India',
    description: 'Marks the date on which the Constitution of India came into effect in 1950.',
    historicalContext: 'Celebrated with grand military and cultural parades in New Delhi.',
    isVariableDate: false,
    subscribed: false
  },
  {
    id: 'gev-4',
    name: 'International Women’s Day',
    date: '2027-03-08',
    primaryCategory: 'International & Awareness Days',
    subCategory: 'Human Rights',
    country: 'Global',
    description: 'Focal point in the women’s rights movement, celebrating gender equality.',
    historicalContext: 'Recognized by the United Nations since 1977.',
    isVariableDate: false,
    subscribed: true
  },
  {
    id: 'gev-5',
    name: 'World Health Day',
    date: '2027-04-07',
    primaryCategory: 'International & Awareness Days',
    subCategory: 'Global Health',
    country: 'Global',
    description: 'Organized by the WHO to focus attention on critical global public health issues.',
    historicalContext: 'First convened at the First Health Assembly in 1948.',
    isVariableDate: false,
    subscribed: false
  },
  {
    id: 'gev-6',
    name: 'Mother’s Day',
    date: '2027-05-09',
    primaryCategory: 'Love & Relationships',
    subCategory: 'Family Honor',
    country: 'International',
    description: 'Celebration honoring motherhood and maternal bonds (Second Sunday in May).',
    historicalContext: 'Variable date calculated annually on the Gregorian calendar.',
    isVariableDate: true,
    subscribed: true
  },
  {
    id: 'gev-7',
    name: 'World Emoji Day',
    date: '2027-07-17',
    primaryCategory: 'Fun & Unusual Days',
    subCategory: 'Digital Culture',
    country: 'Global',
    description: 'Unusual celebration of electronic messaging and digital icons.',
    historicalContext: 'Created in 2014 by Emojipedia founder Jeremy Burge.',
    isVariableDate: false,
    subscribed: false
  },
  {
    id: 'gev-8',
    name: 'Independence Day (India)',
    date: '2027-08-15',
    primaryCategory: 'National & Public Holidays',
    subCategory: 'Sovereignty',
    country: 'India',
    description: 'Commemorates the nation’s independence from British colonial rule in 1947.',
    historicalContext: 'National holiday celebrated nationwide with flag hoisting ceremonies.',
    isVariableDate: false,
    subscribed: false
  },
  {
    id: 'gev-9',
    name: 'Teachers’ Day',
    date: '2027-09-05',
    primaryCategory: 'Education & Career',
    subCategory: 'Educators',
    country: 'India',
    description: 'Birth anniversary of Dr. Sarvepalli Radhakrishnan, philosopher and second President.',
    historicalContext: 'Students show appreciation to their mentors and educators.',
    isVariableDate: false,
    subscribed: false
  },
  {
    id: 'gev-10',
    name: 'Durga Puja (Maha Ashtami)',
    date: '2026-10-19',
    primaryCategory: 'Celebrations & Festivals',
    subCategory: 'Cultural & Religious',
    country: 'India',
    description: 'Grand cultural festival honoring the victory of Goddess Durga over Mahishasura.',
    historicalContext: 'Lunisolar calendar date; inscription on UNESCO Intangible Cultural Heritage list.',
    isVariableDate: true,
    subscribed: true
  },
  {
    id: 'gev-11',
    name: 'Diwali (Deepavali)',
    date: '2026-11-08',
    primaryCategory: 'Celebrations & Festivals',
    subCategory: 'Festival of Lights',
    country: 'India',
    description: 'Spiritual festival symbolizing the triumph of light over darkness and good over evil.',
    historicalContext: 'Lunisolar astronomical date celebrated worldwide with illumination and sweets.',
    isVariableDate: true,
    subscribed: true
  },
  {
    id: 'gev-12',
    name: 'Christmas Day',
    date: '2026-12-25',
    primaryCategory: 'Celebrations & Festivals',
    subCategory: 'Holiday',
    country: 'Global',
    description: 'Celebrated worldwide with gift-giving, family meals, and charity.',
    historicalContext: 'Centuries-old festival of peace and goodwill.',
    isVariableDate: false,
    subscribed: true
  }
];

export const SUGGESTED_PERSONAL_CATEGORIES = [
  'Birthday',
  'Anniversary',
  'Family',
  'Friends',
  'Work',
  'Education',
  'Examination',
  'Meeting',
  'Appointment',
  'Payment',
  'Insurance Renewal',
  'Travel',
  'Deadline',
  'Other'
];

export const INITIAL_USER_CUSTOM_CATEGORIES = [
  { id: 'cat-1', name: 'Family', color: '#e11d48', icon: 'Heart' },
  { id: 'cat-2', name: 'Work', color: '#3b82f6', icon: 'Briefcase' },
  { id: 'cat-3', name: 'Bills & Finance', color: '#f59e0b', icon: 'CreditCard' }
];

export const INITIAL_PERSONAL_REMINDERS = [
  {
    id: 'rem-1',
    title: "Mom's Birthday Celebration",
    personName: 'Eleanor Johnson',
    date: '2026-11-15',
    categoryName: 'Family',
    categoryId: 'cat-1',
    recurrence: 'yearly',
    notes: 'Order fresh peonies and book table for 6 at Bistro Jardin.',
    channels: ['Email', 'Push'],
    reminderDaysBefore: 3,
    isActive: true
  },
  {
    id: 'rem-2',
    title: 'Health Insurance Premium Renewal',
    personName: '',
    date: '2026-11-05',
    categoryName: 'Bills & Finance',
    categoryId: 'cat-3',
    recurrence: 'yearly',
    notes: 'Policy #HI-883921. Verify deductible and pay online.',
    channels: ['Email'],
    reminderDaysBefore: 5,
    isActive: true
  },
  {
    id: 'rem-3',
    title: 'Wedding Anniversary',
    personName: 'Sophie & Alex',
    date: '2026-12-10',
    categoryName: 'Family',
    categoryId: 'cat-1',
    recurrence: 'yearly',
    notes: '5th anniversary. Reserved weekend chalet in the mountains.',
    channels: ['Email', 'WhatsApp'],
    reminderDaysBefore: 7,
    isActive: true
  },
  {
    id: 'rem-4',
    title: 'Dentist Hygiene Checkup',
    personName: 'Dr. Wayne Vance',
    date: '2026-11-20',
    categoryName: 'Uncategorized',
    categoryId: null,
    recurrence: 'none',
    notes: 'Downtown Dental Studio, Suite 402 at 2:30 PM.',
    channels: ['Push'],
    reminderDaysBefore: 1,
    isActive: true
  },
  {
    id: 'rem-5',
    title: 'Quarterly Cloud Domain Renewal',
    personName: '',
    date: '2026-12-01',
    categoryName: 'Bills & Finance',
    categoryId: 'cat-3',
    recurrence: 'yearly',
    notes: 'Primary DNS cluster and SSL renewals.',
    channels: ['Email'],
    reminderDaysBefore: 3,
    isActive: true
  }
];

export const MOCK_USER = {
  id: 'usr-101',
  name: 'Alex Johnson',
  email: 'alex.johnson@example.com',
  phone: '+1 (555) 234-5678',
  timezone: 'America/New_York (UTC-5)',
  dateFormat: 'MMM DD, YYYY',
  timeFormat: '12h',
  defaultCalendarView: 'month',
  country: 'United States',
  notificationPreferences: {
    masterEnabled: true,
    globalEventsEnabled: true,
    personalRemindersEnabled: true,
    uncategorizedRemindersEnabled: true,
    email: { enabled: true, address: 'alex.johnson@example.com', verified: true },
    whatsapp: { enabled: false, number: '+1 (555) 234-5678', verified: false },
    browserPush: { enabled: true, permission: 'granted' },
    defaultAdvanceDays: 3,
    digestTime: '09:00'
  }
};
