import React, { useState } from 'react';

/**
 * ProfileAvatar - Displays user profile picture with automatic broken-image fallback
 * to a clean, initials-based colored circular avatar.
 */
export default function ProfileAvatar({ user, size = 'md', className = '' }) {
  const [imgError, setImgError] = useState(false);

  const sizeClasses = {
    sm: 'w-10 h-10 text-xs rounded-2xl',
    md: 'w-14 h-14 text-lg rounded-2xl',
    lg: 'w-20 h-20 text-2xl rounded-3xl'
  }[size] || 'w-14 h-14 text-lg rounded-2xl';

  const initials = (user?.name?.trim()?.charAt(0) || user?.email?.trim()?.charAt(0) || 'U').toUpperCase();

  if (user?.photoURL && !imgError) {
    return (
      <img
        src={user.photoURL}
        alt={user.name || 'User avatar'}
        onError={() => setImgError(true)}
        className={`${sizeClasses} object-cover border border-slate-200/90 shadow-xs shrink-0 ${className}`}
      />
    );
  }

  return (
    <div
      className={`${sizeClasses} bg-gradient-to-tr from-rose-600 to-rose-500 text-white font-black flex items-center justify-center shadow-md shadow-rose-500/20 shrink-0 select-none ${className}`}
      aria-label={user?.name || 'User'}
    >
      {initials}
    </div>
  );
}
