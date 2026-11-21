import React from 'react';

/**
 * ToggleSwitch - Accessible SaaS custom toggle switch
 * Rose-500 accent when active, light-gray when disabled, smooth spring animation.
 */
export default function ToggleSwitch({
  checked,
  onChange,
  disabled = false,
  label,
  description,
  id,
  size = 'md',
  className = ''
}) {
  const switchSizes = size === 'sm' ? 'w-9 h-5' : 'w-11 h-6';
  const knobSizes = size === 'sm' 
    ? (checked ? 'translate-x-4 h-3.5 w-3.5' : 'translate-x-0.5 h-3.5 w-3.5')
    : (checked ? 'translate-x-5 h-4.5 w-4.5' : 'translate-x-0.5 h-4.5 w-4.5');

  return (
    <div className={`flex items-center justify-between gap-3 ${className}`}>
      {(label || description) && (
        <div className="flex-1 min-w-0 pr-2">
          {label && (
            <label 
              htmlFor={id} 
              className={`text-xs font-bold text-slate-900 block select-none ${disabled ? 'opacity-50' : 'cursor-pointer'}`}
            >
              {label}
            </label>
          )}
          {description && (
            <p className="text-[11px] text-slate-400 mt-0.5 leading-normal">
              {description}
            </p>
          )}
        </div>
      )}

      <button
        type="button"
        role="switch"
        id={id}
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={`relative inline-flex shrink-0 items-center rounded-full transition-colors duration-200 ease-in-out cursor-pointer focus:outline-none focus:ring-2 focus:ring-rose-500/25 ${switchSizes} ${
          checked ? 'bg-rose-500' : 'bg-slate-200'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <span
          aria-hidden="true"
          className={`pointer-events-none inline-block rounded-full bg-white shadow-md transform ring-0 transition duration-200 ease-in-out ${knobSizes}`}
        />
      </button>
    </div>
  );
}
