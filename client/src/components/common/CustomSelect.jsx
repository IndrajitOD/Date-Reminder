import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

/**
 * CustomSelect - Custom-rendered Dropdown Menu
 * 
 * Replaces native OS select popups with a pixel-perfect custom SaaS dropdown:
 * - Pure white floating menu with smooth shadow & rounded corners (rounded-2xl)
 * - Soft rose hover state (hover:bg-rose-50/70 hover:text-rose-600)
 * - Highlighted active/selected state with rose checkmark & rose background
 * - Accessible keyboard navigation (Escape to close) & outside-click detection
 * - Standard synthetic event emission for seamless onChange handler compatibility
 */
export default function CustomSelect({
  value,
  onChange,
  options = [],
  placeholder = 'Select an option',
  className = '',
  disabled = false,
  id,
  name,
  'aria-label': ariaLabel,
  size = 'md', // 'sm' | 'md'
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Normalize options to { value, label } objects
  const normalizedOptions = options.map((opt) => {
    if (typeof opt === 'object' && opt !== null) {
      return { value: opt.value, label: opt.label ?? String(opt.value) };
    }
    return { value: opt, label: String(opt) };
  });

  const selectedOption = normalizedOptions.find(
    (opt) => String(opt.value) === String(value)
  );

  // Close when clicking outside
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

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleSelect = (val) => {
    if (onChange) {
      // Create synthetic event matching standard HTML select onChange structure
      onChange({
        target: {
          value: val,
          name: name || id
        }
      });
    }
    setIsOpen(false);
  };

  const sizeButtonClasses =
    size === 'sm'
      ? 'py-2 pl-3 pr-8 text-xs font-semibold'
      : 'py-2.5 pl-3.5 pr-9 text-xs sm:text-sm font-medium';

  return (
    <div
      ref={containerRef}
      className={`relative inline-block text-left ${className.includes('w-full') ? 'w-full' : ''}`}
    >
      {/* Trigger Button */}
      <button
        type="button"
        id={id}
        name={name}
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between gap-2 bg-white border text-slate-800 rounded-xl transition-all duration-150 shadow-xs cursor-pointer select-none text-left
          ${isOpen ? 'border-rose-500 ring-2 ring-rose-500/20 bg-white' : 'border-slate-200/90 hover:border-slate-300 hover:bg-slate-50/50'}
          ${disabled ? 'opacity-50 cursor-not-allowed bg-slate-100' : ''}
          ${sizeButtonClasses} ${className}`}
      >
        <span className="truncate block">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          size={14}
          className={`shrink-0 stroke-[2.5] text-slate-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-rose-500' : ''
          }`}
        />
      </button>

      {/* Floating Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 z-50 mt-1.5 min-w-[200px] w-full max-h-60 overflow-y-auto bg-white rounded-2xl border border-slate-100 shadow-xl shadow-slate-900/10 py-1.5 focus:outline-none">
          {normalizedOptions.length === 0 ? (
            <div className="px-3 py-2 text-xs text-slate-400 text-center">No options available</div>
          ) : (
            normalizedOptions.map((opt) => {
              const isSelected = String(opt.value) === String(value);
              return (
                <button
                  type="button"
                  key={String(opt.value)}
                  onClick={() => handleSelect(opt.value)}
                  className={`w-full flex items-center justify-between gap-2 px-3.5 py-2 text-left text-xs transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-rose-50 font-bold text-rose-600'
                      : 'text-slate-700 font-medium hover:bg-rose-50/50 hover:text-slate-900'
                  }`}
                >
                  <span className="truncate">{opt.label}</span>
                  {isSelected && <Check size={14} className="text-rose-500 shrink-0 stroke-[2.5]" />}
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
