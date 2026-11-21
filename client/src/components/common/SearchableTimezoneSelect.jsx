import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Search, ChevronDown, Check, MapPin } from 'lucide-react';
import { 
  INDIAN_REGIONS, 
  getIndianLocationList, 
  OFFICIAL_INDIAN_TIMEZONE, 
  OFFICIAL_INDIAN_OFFSET 
} from '../../utils/indianTimezoneUtils';

/**
 * SearchableTimezoneSelect - Indian Locations & Cities Selector
 * Exclusively displays Indian cities and regional locations across Eastern, Northern,
 * Southern, and Western/Central India.
 * 
 * Maps every selection to the single official civil IANA identifier: 'Asia/Kolkata' (IST UTC+05:30).
 */
export default function SearchableTimezoneSelect({
  value,
  onChange,
  className = '',
  disabled = false
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  // Retain selected location display preference in local state or localStorage
  const [selectedCityLabel, setSelectedCityLabel] = useState(() => {
    return localStorage.getItem('ndr_indian_location_label') || 'India Standard Time (IST)';
  });

  const allLocations = useMemo(() => getIndianLocationList(), []);

  // Filter locations based on search query
  const filteredLocations = useMemo(() => {
    if (!searchQuery.trim()) return null; // When empty, display grouped
    const q = searchQuery.toLowerCase().trim();
    return allLocations.filter(loc => loc.searchKey.includes(q));
  }, [allLocations, searchQuery]);

  // Handle outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('touchstart', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
    };
  }, [isOpen]);

  // Focus search input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSelect = (loc) => {
    setSelectedCityLabel(loc.city === 'India Standard Time' ? 'India Standard Time (IST)' : loc.city);
    localStorage.setItem('ndr_indian_location_label', loc.city === 'India Standard Time' ? 'India Standard Time (IST)' : loc.city);
    // Persist official IANA timezone
    onChange(OFFICIAL_INDIAN_TIMEZONE);
    setIsOpen(false);
    setSearchQuery('');
  };

  return (
    <div ref={containerRef} className={`relative inline-block w-full text-left ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between gap-2.5 px-3.5 py-2.5 bg-white border rounded-xl text-xs sm:text-sm font-medium transition-all shadow-xs cursor-pointer select-none text-left ${
          isOpen ? 'border-rose-500 ring-2 ring-rose-500/20' : 'border-slate-200/90 hover:border-slate-300 hover:bg-slate-50/50'
        } ${disabled ? 'opacity-50 cursor-not-allowed bg-slate-100' : ''}`}
      >
        <div className="flex items-center gap-2 min-w-0">
          <MapPin size={15} className="text-rose-500 shrink-0" />
          <span className="truncate text-slate-800 font-semibold">
            {selectedCityLabel} — IST ({OFFICIAL_INDIAN_OFFSET})
          </span>
        </div>
        <ChevronDown
          size={14}
          className={`shrink-0 stroke-[2.5] text-slate-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-rose-500' : ''
          }`}
        />
      </button>

      {/* Floating Searchable Menu */}
      {isOpen && (
        <div className="absolute left-0 right-0 z-50 mt-1.5 bg-white rounded-2xl border border-slate-100 shadow-2xl shadow-slate-900/15 p-2 space-y-2 animate-in fade-in zoom-in-95 duration-100">
          {/* Search Input Box */}
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Indian city, state, or region (e.g. Kolkata, Mumbai, Bengaluru)..."
              className="w-full pl-8 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 text-slate-800 placeholder:text-slate-400 font-medium"
            />
          </div>

          {/* Info pill about Indian Standard Time */}
          <div className="px-2.5 py-1.5 bg-rose-50/60 rounded-xl border border-rose-100 flex items-center justify-between text-[11px] text-rose-700">
            <span>Official Civil Timezone: <strong>Asia/Kolkata (IST)</strong></span>
            <span className="font-extrabold">{OFFICIAL_INDIAN_OFFSET}</span>
          </div>

          {/* Scrollable Location List */}
          <div className="max-h-60 overflow-y-auto space-y-3 pr-1 text-xs">
            {filteredLocations !== null ? (
              // Filtered Flat Results
              filteredLocations.length === 0 ? (
                <div className="py-6 text-center text-slate-400 font-medium text-xs">
                  No Indian city found matching &quot;{searchQuery}&quot;
                </div>
              ) : (
                <div className="space-y-0.5">
                  {filteredLocations.map(loc => {
                    const isSelected = selectedCityLabel.includes(loc.city);
                    return (
                      <button
                        key={loc.id}
                        type="button"
                        onClick={() => handleSelect(loc)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-rose-50 text-rose-600 font-bold'
                            : 'hover:bg-slate-50 text-slate-700 font-medium'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span className="truncate">{loc.city}</span>
                          <span className="text-[10px] text-slate-400 font-normal">({loc.state})</span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-bold">
                            IST
                          </span>
                          {isSelected && <Check size={14} className="text-rose-500 stroke-[2.5]" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )
            ) : (
              // Grouped by Region
              INDIAN_REGIONS.map(group => (
                <div key={group.region} className="space-y-1">
                  <div className="px-2.5 py-1 text-[10px] font-black tracking-wider uppercase text-slate-400 bg-slate-50 rounded-lg">
                    {group.region}
                  </div>
                  <div className="space-y-0.5">
                    {group.locations.map(loc => {
                      const isDefault = loc.code === 'IST';
                      const isSelected = selectedCityLabel.includes(loc.city);

                      return (
                        <button
                          key={loc.city}
                          type="button"
                          onClick={() => handleSelect({ ...loc, city: isDefault ? 'India Standard Time' : loc.city })}
                          className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-left transition-colors cursor-pointer ${
                            isSelected
                              ? 'bg-rose-50 text-rose-600 font-bold'
                              : 'hover:bg-slate-50 text-slate-700 font-medium'
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <span className="truncate">{loc.city}</span>
                            {!isDefault && (
                              <span className="text-[10px] text-slate-400 font-normal">({loc.state})</span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-bold">
                              IST
                            </span>
                            {isSelected && <Check size={14} className="text-rose-500 stroke-[2.5]" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
