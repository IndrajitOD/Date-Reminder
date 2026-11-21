import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Search, ChevronDown, Check, Globe } from 'lucide-react';
import { getIanaTimezoneList } from '../../utils/timezoneUtils';

/**
 * SearchableTimezoneSelect - Searchable IANA Timezone Dropdown
 * Displays dynamically calculated UTC offsets, groups by region or shows filtered city matches.
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

  const allTimezones = useMemo(() => getIanaTimezoneList(), []);

  // Filter timezones based on query
  const filteredTimezones = useMemo(() => {
    if (!searchQuery.trim()) return allTimezones;
    const q = searchQuery.toLowerCase().trim();
    return allTimezones.filter(tz => tz.searchKey.includes(q));
  }, [allTimezones, searchQuery]);

  const selectedItem = useMemo(() => {
    return allTimezones.find(tz => tz.value === value) || {
      value: value || 'UTC',
      label: value || 'UTC'
    };
  }, [allTimezones, value]);

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

  const handleSelect = (tzValue) => {
    onChange(tzValue);
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
          <Globe size={15} className="text-rose-500 shrink-0" />
          <span className="truncate text-slate-800 font-semibold">{selectedItem.label}</span>
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
              placeholder="Search city, country or timezone (e.g. Kolkata, London, New York)..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
            />
          </div>

          {/* Scrollable list */}
          <div className="max-h-60 overflow-y-auto divide-y divide-slate-50">
            {filteredTimezones.length === 0 ? (
              <div className="px-3 py-4 text-xs text-slate-400 text-center">
                No matching timezone found for "{searchQuery}"
              </div>
            ) : (
              filteredTimezones.slice(0, 150).map((tz) => {
                const isSelected = tz.value === value;
                return (
                  <button
                    type="button"
                    key={tz.value}
                    onClick={() => handleSelect(tz.value)}
                    className={`w-full flex items-center justify-between gap-2 px-3 py-2 text-left text-xs transition-colors cursor-pointer rounded-xl ${
                      isSelected
                        ? 'bg-rose-50 font-bold text-rose-600'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium">{tz.value}</p>
                      <p className="text-[10px] text-slate-400">{tz.region} • {tz.city}</p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                        {tz.offset}
                      </span>
                      {isSelected && <Check size={14} className="text-rose-500 stroke-[2.5]" />}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
