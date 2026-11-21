/**
 * Indian Locations & Cities Timezone Configuration
 * 
 * India officially operates on a single civil timezone:
 * Asia/Kolkata — IST (UTC+05:30).
 * 
 * All ~36 Indian cities and locations are grouped by region and map to the exact
 * underlying IANA timezone: 'Asia/Kolkata'.
 */

export const INDIAN_REGIONS = [
  {
    region: 'Default Standard',
    locations: [
      { city: 'India Standard Time', state: 'National', code: 'IST' }
    ]
  },
  {
    region: 'Eastern India',
    locations: [
      { city: 'Kolkata', state: 'West Bengal' },
      { city: 'Howrah', state: 'West Bengal' },
      { city: 'Siliguri', state: 'West Bengal' },
      { city: 'Durgapur', state: 'West Bengal' },
      { city: 'Asansol', state: 'West Bengal' },
      { city: 'Patna', state: 'Bihar' },
      { city: 'Bhubaneswar', state: 'Odisha' },
      { city: 'Cuttack', state: 'Odisha' },
      { city: 'Guwahati', state: 'Assam' }
    ]
  },
  {
    region: 'Northern India',
    locations: [
      { city: 'New Delhi', state: 'Delhi NCR' },
      { city: 'Chandigarh', state: 'Punjab & Haryana' },
      { city: 'Jaipur', state: 'Rajasthan' },
      { city: 'Lucknow', state: 'Uttar Pradesh' },
      { city: 'Dehradun', state: 'Uttarakhand' },
      { city: 'Shimla', state: 'Himachal Pradesh' },
      { city: 'Srinagar', state: 'Jammu & Kashmir' },
      { city: 'Amritsar', state: 'Punjab' },
      { city: 'Varanasi', state: 'Uttar Pradesh' }
    ]
  },
  {
    region: 'Southern India',
    locations: [
      { city: 'Bengaluru', state: 'Karnataka' },
      { city: 'Chennai', state: 'Tamil Nadu' },
      { city: 'Hyderabad', state: 'Telangana' },
      { city: 'Kochi', state: 'Kerala' },
      { city: 'Thiruvananthapuram', state: 'Kerala' },
      { city: 'Coimbatore', state: 'Tamil Nadu' },
      { city: 'Mysuru', state: 'Karnataka' },
      { city: 'Visakhapatnam', state: 'Andhra Pradesh' },
      { city: 'Madurai', state: 'Tamil Nadu' }
    ]
  },
  {
    region: 'Western & Central India',
    locations: [
      { city: 'Mumbai', state: 'Maharashtra' },
      { city: 'Pune', state: 'Maharashtra' },
      { city: 'Ahmedabad', state: 'Gujarat' },
      { city: 'Surat', state: 'Gujarat' },
      { city: 'Vadodara', state: 'Gujarat' },
      { city: 'Goa', state: 'Goa' },
      { city: 'Nagpur', state: 'Maharashtra' },
      { city: 'Nashik', state: 'Maharashtra' },
      { city: 'Indore', state: 'Madhya Pradesh' }
    ]
  }
];

export const OFFICIAL_INDIAN_TIMEZONE = 'Asia/Kolkata';
export const OFFICIAL_INDIAN_OFFSET = 'UTC+05:30';

/**
 * Returns a flattened list of all Indian cities/locations for searching & selection.
 * Each item contains:
 * - id: e.g. "kolkata", "new-delhi", "ist"
 * - city: e.g. "Kolkata"
 * - state: e.g. "West Bengal"
 * - region: e.g. "Eastern India"
 * - label: e.g. "Kolkata — IST (UTC+05:30)"
 * - tzValue: "Asia/Kolkata" (the actual IANA identifier saved)
 */
export function getIndianLocationList() {
  const list = [];

  INDIAN_REGIONS.forEach(group => {
    group.locations.forEach(loc => {
      const isDefault = loc.code === 'IST';
      const label = isDefault 
        ? `India Standard Time (IST) — (UTC+05:30)`
        : `${loc.city} — IST (UTC+05:30)`;

      list.push({
        id: loc.city.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        city: loc.city,
        state: loc.state,
        region: group.region,
        label,
        tzValue: OFFICIAL_INDIAN_TIMEZONE,
        offset: OFFICIAL_INDIAN_OFFSET,
        searchKey: `${loc.city} ${loc.state} ${group.region} ist utc+05:30`.toLowerCase()
      });
    });
  });

  return list;
}
