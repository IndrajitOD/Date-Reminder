import React, { useState, useEffect } from 'react';
import { 
  User, Mail, Phone, Globe, Calendar, Clock, 
  ShieldCheck, AlertCircle, Edit3, Trash2, LogOut, 
  CheckCircle2, Camera, RefreshCw, KeyRound, Sparkles,
  ExternalLink, X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { 
  updateFirebaseProfile, 
  sendFirebaseEmailVerification, 
  resetPasswordWithFirebase, 
  deleteFirebaseUser 
} from '../services/authService';
import { api } from '../services/apiClient';
import ProfileAvatar from '../components/common/ProfileAvatar';
import CustomSelect from '../components/common/CustomSelect';

export function ProfilePage() {
  const { currentUser, logout, showToast } = useApp();
  const navigate = useNavigate();

  // Edit Personal Info state
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    timezone: 'UTC',
    language: 'English (US)',
    dateFormat: 'MMM DD, YYYY',
    timeFormat: '12h'
  });

  const [saving, setSaving] = useState(false);
  const [verifyingEmail, setVerifyingEmail] = useState(false);
  const [sendingReset, setSendingReset] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Dialog States
  const [showSignOutDialog, setShowSignOutDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  // Populate form with actual user info
  useEffect(() => {
    if (currentUser) {
      setFormData({
        name: currentUser.name || '',
        phone: currentUser.phone || '',
        timezone: currentUser.timezone || 'UTC',
        language: currentUser.language || 'English (US)',
        dateFormat: currentUser.dateFormat || 'MMM DD, YYYY',
        timeFormat: currentUser.timeFormat || '12h'
      });
    }
  }, [currentUser]);

  // Handle Edit Submit
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      // 1. Update Firebase display name if changed
      if (formData.name && formData.name !== currentUser?.name) {
        await updateFirebaseProfile({ displayName: formData.name });
      }

      // 2. Persist to MongoDB through backend API
      const res = await api.updateProfile({
        name: formData.name,
        phoneNumber: formData.phone,
        timezone: formData.timezone,
        language: formData.language,
        dateFormat: formData.dateFormat,
        timeFormat: formData.timeFormat
      });

      // 3. Update client cache
      if (currentUser) {
        currentUser.name = formData.name;
        currentUser.phone = formData.phone;
        currentUser.timezone = formData.timezone;
        currentUser.language = formData.language;
        currentUser.dateFormat = formData.dateFormat;
        currentUser.timeFormat = formData.timeFormat;
        localStorage.setItem('ndr_user', JSON.stringify(currentUser));
      }

      setIsEditing(false);
      showToast('Profile updated successfully.', 'success');
    } catch (err) {
      console.error('Update profile error:', err);
      showToast(err.message || 'Failed to update profile.', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Profile Picture Upload Handler (Base64 data URL with validation)
  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      showToast('Image size exceeds 2MB limit. Please choose a smaller photo.', 'error');
      return;
    }

    // Validate format
    if (!file.type.startsWith('image/')) {
      showToast('Please upload a valid image file (PNG, JPG, WEBP).', 'error');
      return;
    }

    setUploadingAvatar(true);
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const photoURL = reader.result;
        // Update Firebase
        await updateFirebaseProfile({ photoURL });
        // Update MongoDB
        await api.updateProfile({ profilePicture: photoURL });
        
        if (currentUser) {
          currentUser.photoURL = photoURL;
          localStorage.setItem('ndr_user', JSON.stringify(currentUser));
        }
        showToast('Profile picture updated successfully.', 'success');
      } catch (err) {
        console.error('Avatar update failed:', err);
        showToast('Failed to upload profile picture.', 'error');
      } finally {
        setUploadingAvatar(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // Remove Avatar Handler
  const handleRemoveAvatar = async () => {
    setUploadingAvatar(true);
    try {
      await updateFirebaseProfile({ photoURL: '' });
      await api.updateProfile({ profilePicture: '' });
      if (currentUser) {
        currentUser.photoURL = '';
        localStorage.setItem('ndr_user', JSON.stringify(currentUser));
      }
      showToast('Profile picture removed.', 'info');
    } catch (err) {
      showToast('Failed to remove profile picture.', 'error');
    } finally {
      setUploadingAvatar(false);
    }
  };

  // Send Verification Email
  const handleSendVerification = async () => {
    setVerifyingEmail(true);
    try {
      await sendFirebaseEmailVerification();
      showToast(`Verification link sent to ${currentUser?.email}. Please check your inbox.`, 'success');
    } catch (err) {
      showToast(err.message || 'Failed to dispatch verification email.', 'error');
    } finally {
      setVerifyingEmail(false);
    }
  };

  // Send Password Reset Email
  const handlePasswordReset = async () => {
    if (!currentUser?.email) return;
    setSendingReset(true);
    try {
      await resetPasswordWithFirebase(currentUser.email);
      showToast(`Password reset link sent to ${currentUser.email}.`, 'success');
    } catch (err) {
      showToast(err.message || 'Failed to dispatch reset link.', 'error');
    } finally {
      setSendingReset(false);
    }
  };

  // Sign Out Handler
  const handleConfirmSignOut = async () => {
    await logout();
    navigate('/');
  };

  // Delete Account Handler (Clean backend purge + Firebase user deletion)
  const handleDeleteAccount = async () => {
    if (deleteConfirmationText !== 'DELETE') {
      showToast('Please type DELETE to confirm.', 'error');
      return;
    }

    setIsDeleting(true);
    try {
      // 1. Purge all user documents in MongoDB
      await api.deleteAccount();

      // 2. Delete user record in Firebase
      await deleteFirebaseUser();

      // 3. Clear client local state
      localStorage.clear();
      showToast('Account and all associated records permanently deleted.', 'info');
      navigate('/');
    } catch (err) {
      console.error('Account deletion failure:', err);
      if (err.code === 'auth/requires-recent-login') {
        showToast('For security, please sign out and log back in before deleting your account.', 'warning');
      } else {
        showToast(err.message || 'Account deletion failed. Please try again.', 'error');
      }
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const isGoogleAccount = currentUser?.providers?.includes('google.com') || currentUser?.providerId === 'google.com';

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Account Profile</h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Manage your personal identity, security credentials, and active system preferences.
        </p>
      </div>

      {/* 1. Profile Header Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-slate-100/90">
          <div className="flex items-center gap-5">
            {/* Avatar with Camera upload overlay */}
            <div className="relative group shrink-0">
              <ProfileAvatar user={currentUser} size="lg" />
              <label 
                className="absolute inset-0 bg-slate-950/40 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white cursor-pointer"
                title="Change Photo"
              >
                <Camera size={18} />
                <span className="text-[9px] font-bold mt-1">Upload</span>
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/webp"
                  onChange={handleAvatarChange}
                  disabled={uploadingAvatar}
                  className="hidden"
                />
              </label>
            </div>

            <div className="space-y-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 truncate">
                  {currentUser?.name || 'User Profile'}
                </h2>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
                  <CheckCircle2 size={12} /> Active Member
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 truncate" title={currentUser?.email}>
                {currentUser?.email}
              </p>
              
              {/* Email verified indicator */}
              <div className="pt-1 flex items-center gap-2 text-xs">
                {currentUser?.emailVerified ? (
                  <span className="text-emerald-600 font-semibold flex items-center gap-1 text-xs">
                    <CheckCircle2 size={13} /> Email Verified
                  </span>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-amber-600 font-semibold flex items-center gap-1 text-xs">
                      <AlertCircle size={13} /> Unverified Email
                    </span>
                    <button
                      onClick={handleSendVerification}
                      disabled={verifyingEmail}
                      className="text-xs text-rose-500 font-bold hover:underline cursor-pointer disabled:opacity-50"
                    >
                      {verifyingEmail ? 'Sending...' : 'Verify Now'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2.5 self-start sm:self-auto shrink-0">
            {currentUser?.photoURL && (
              <button
                type="button"
                onClick={handleRemoveAvatar}
                disabled={uploadingAvatar}
                className="px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:text-rose-600 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Remove Photo
              </button>
            )}
            <button
              type="button"
              onClick={() => setIsEditing(!isEditing)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <Edit3 size={14} />
              <span>{isEditing ? 'Close Edit' : 'Edit Profile'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Personal Information Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-xs space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-black text-slate-900 tracking-tight">Personal Information</h3>
            <p className="text-xs text-slate-400">Your profile contact details and system locale settings.</p>
          </div>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="text-xs font-bold text-rose-600 hover:underline cursor-pointer flex items-center gap-1"
            >
              <Edit3 size={13} /> Edit
            </button>
          )}
        </div>

        {isEditing ? (
          <form onSubmit={handleSaveProfile} className="space-y-4 pt-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="e.g. Alex Morgan"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="e.g. +1 555-0192"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Timezone
                </label>
                <CustomSelect
                  className="w-full"
                  value={formData.timezone}
                  onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                  options={[
                    'UTC',
                    'America/New_York (UTC-5)',
                    'America/Chicago (UTC-6)',
                    'America/Los_Angeles (UTC-8)',
                    'Europe/London (UTC+0)',
                    'Europe/Paris (UTC+1)',
                    'Asia/Kolkata (IST, UTC+5:30)',
                    'Asia/Dubai (GST, UTC+4)',
                    'Asia/Tokyo (JST, UTC+9)',
                    'Australia/Sydney (AEST, UTC+10)'
                  ]}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Preferred Language
                </label>
                <CustomSelect
                  className="w-full"
                  value={formData.language}
                  onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                  options={[
                    'English (US)',
                    'English (UK)',
                    'Spanish',
                    'French',
                    'German',
                    'Hindi',
                    'Japanese'
                  ]}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Date Format
                </label>
                <CustomSelect
                  className="w-full"
                  value={formData.dateFormat}
                  onChange={(e) => setFormData({ ...formData, dateFormat: e.target.value })}
                  options={[
                    { value: 'MMM DD, YYYY', label: 'MMM DD, YYYY (Nov 21, 2026)' },
                    { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY (21/11/2026)' },
                    { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD (2026-11-21)' }
                  ]}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Time Format
                </label>
                <CustomSelect
                  className="w-full"
                  value={formData.timeFormat}
                  onChange={(e) => setFormData({ ...formData, timeFormat: e.target.value })}
                  options={[
                    { value: '12h', label: '12-hour format (AM/PM)' },
                    { value: '24h', label: '24-hour format' }
                  ]}
                />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-3">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-red-600 text-white text-xs font-bold shadow-md shadow-rose-500/25 hover:shadow-rose-500/40 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <span className="text-slate-400 block mb-1 font-semibold uppercase tracking-wider text-[10px]">
                Full Name
              </span>
              <span className="font-bold text-slate-900 text-sm">
                {currentUser?.name || 'Not added'}
              </span>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <span className="text-slate-400 block mb-1 font-semibold uppercase tracking-wider text-[10px]">
                Email Address
              </span>
              <span className="font-bold text-slate-900 text-sm truncate block" title={currentUser?.email}>
                {currentUser?.email || 'Not added'}
              </span>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <span className="text-slate-400 block mb-1 font-semibold uppercase tracking-wider text-[10px]">
                Phone Number
              </span>
              <span className={`font-bold text-sm ${currentUser?.phone ? 'text-slate-900' : 'text-slate-400 italic'}`}>
                {currentUser?.phone || 'Not added'}
              </span>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <span className="text-slate-400 block mb-1 font-semibold uppercase tracking-wider text-[10px]">
                Timezone
              </span>
              <span className="font-bold text-slate-900 text-sm">
                {currentUser?.timezone || 'UTC'}
              </span>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <span className="text-slate-400 block mb-1 font-semibold uppercase tracking-wider text-[10px]">
                Preferred Language
              </span>
              <span className="font-bold text-slate-900 text-sm">
                {currentUser?.language || 'English (US)'}
              </span>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <span className="text-slate-400 block mb-1 font-semibold uppercase tracking-wider text-[10px]">
                Date & Time Format
              </span>
              <span className="font-bold text-slate-900 text-sm">
                {currentUser?.dateFormat || 'MMM DD, YYYY'} • {currentUser?.timeFormat || '12h'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* 3. Account Security Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-xs space-y-6">
        <div>
          <h3 className="text-lg font-black text-slate-900 tracking-tight">Account Security</h3>
          <p className="text-xs text-slate-400">Authentication providers and login credentials.</p>
        </div>

        <div className="space-y-4">
          {/* Email Verification status */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Mail size={16} className="text-rose-500" />
                <h4 className="font-bold text-sm text-slate-800">Email Verification</h4>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {currentUser?.emailVerified 
                  ? 'Your primary email is confirmed and securely linked to your account.' 
                  : 'Your email address has not been confirmed yet.'}
              </p>
            </div>
            {!currentUser?.emailVerified && (
              <button
                onClick={handleSendVerification}
                disabled={verifyingEmail}
                className="px-4 py-2 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 font-bold rounded-xl text-xs transition-colors shrink-0 cursor-pointer disabled:opacity-50"
              >
                {verifyingEmail ? 'Sending...' : 'Resend Verification'}
              </button>
            )}
          </div>

          {/* Connected Authentication Provider */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <KeyRound size={16} className="text-rose-500" />
                <h4 className="font-bold text-sm text-slate-800">Connected Login Method</h4>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {isGoogleAccount ? 'Single Sign-On through Google OAuth' : 'Standard Email & Secure Password'}
              </p>
            </div>
            <span className="px-3 py-1 bg-white border border-slate-200 rounded-xl text-xs font-extrabold text-slate-700 capitalize shadow-xs">
              {isGoogleAccount ? 'Google' : 'Email/Password'}
            </span>
          </div>

          {/* Password Reset (For non-Google accounts) */}
          {!isGoogleAccount && (
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="font-bold text-sm text-slate-800">Password Management</h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Dispatch an automated recovery email to reset your master password.
                </p>
              </div>
              <button
                onClick={handlePasswordReset}
                disabled={sendingReset}
                className="px-4 py-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors shrink-0 cursor-pointer disabled:opacity-50"
              >
                {sendingReset ? 'Sending...' : 'Reset Password'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 4. Account Activity Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-xs space-y-4">
        <div>
          <h3 className="text-lg font-black text-slate-900 tracking-tight">Account Activity</h3>
          <p className="text-xs text-slate-400">Timestamps for authentication audits and profile updates.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <span className="text-slate-400 block mb-1 font-semibold uppercase tracking-wider text-[10px]">
              Account Created
            </span>
            <span className="font-bold text-slate-800 text-xs">
              {currentUser?.createdAt 
                ? new Date(currentUser.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                : (currentUser?.creationTime ? new Date(currentUser.creationTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Unknown')}
            </span>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <span className="text-slate-400 block mb-1 font-semibold uppercase tracking-wider text-[10px]">
              Last Login
            </span>
            <span className="font-bold text-slate-800 text-xs">
              {currentUser?.lastSignInTime
                ? new Date(currentUser.lastSignInTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                : 'Active session'}
            </span>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <span className="text-slate-400 block mb-1 font-semibold uppercase tracking-wider text-[10px]">
              Last Profile Update
            </span>
            <span className="font-bold text-slate-800 text-xs">
              {currentUser?.updatedAt
                ? new Date(currentUser.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                : 'Current'}
            </span>
          </div>
        </div>
      </div>

      {/* 5. Account Management (Sign Out & Destruction) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-xs space-y-5">
        <div>
          <h3 className="text-lg font-black text-slate-900 tracking-tight">Account Management</h3>
          <p className="text-xs text-slate-400">Session termination and account deletion controls.</p>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
          <div>
            <h4 className="font-bold text-sm text-slate-800">Sign Out</h4>
            <p className="text-xs text-slate-400">Securely disconnect from Date Reminder on this device.</p>
          </div>
          <button
            onClick={() => setShowSignOutDialog(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 font-bold text-xs transition-colors cursor-pointer shrink-0"
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-rose-50/50 border border-rose-100">
          <div>
            <h4 className="font-bold text-sm text-rose-950">Delete Account</h4>
            <p className="text-xs text-rose-800/80">
              Permanently delete your profile and all associated personal reminders. This cannot be undone.
            </p>
          </div>
          <button
            onClick={() => {
              setDeleteConfirmationText('');
              setShowDeleteDialog(true);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-600/20 active:scale-95 transition-all cursor-pointer shrink-0"
          >
            <Trash2 size={14} />
            <span>Delete Account</span>
          </button>
        </div>
      </div>

      {/* Sign Out Confirmation Modal */}
      {showSignOutDialog && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div 
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity" 
            onClick={() => setShowSignOutDialog(false)} 
          />
          <div className="relative w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-slate-100 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto shadow-xs">
              <LogOut size={22} className="stroke-[2.2]" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="font-black text-base text-slate-900">Sign Out</h3>
              <p className="text-xs text-slate-500">
                Are you sure you want to end your current session?
              </p>
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                onClick={() => setShowSignOutDialog(false)}
                className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSignOut}
                className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-rose-500 to-red-600 text-white text-xs font-bold shadow-md shadow-rose-500/20 hover:shadow-rose-500/30 active:scale-95 transition-all cursor-pointer"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Account Deletion Confirmation Modal */}
      {showDeleteDialog && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div 
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity" 
            onClick={() => !isDeleting && setShowDeleteDialog(false)} 
          />
          <div className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-100 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto shadow-xs">
              <AlertCircle size={24} className="stroke-[2.2]" />
            </div>

            <div className="text-center space-y-1.5">
              <h3 className="font-black text-lg text-slate-900">Permanently Delete Account?</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                This action is <strong>irreversible</strong>. All your personal reminders, custom categories, and notification preferences will be permanently erased.
              </p>
            </div>

            <div className="space-y-2 pt-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider text-center">
                Type <span className="text-rose-600 font-black">DELETE</span> to confirm
              </label>
              <input
                type="text"
                value={deleteConfirmationText}
                onChange={(e) => setDeleteConfirmationText(e.target.value)}
                placeholder="DELETE"
                className="w-full text-center px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold tracking-widest focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
              />
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                disabled={isDeleting}
                onClick={() => setShowDeleteDialog(false)}
                className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Keep Account
              </button>
              <button
                disabled={deleteConfirmationText !== 'DELETE' || isDeleting}
                onClick={handleDeleteAccount}
                className="flex-1 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-600/20 active:scale-95 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isDeleting ? 'Erasing...' : 'Delete Permanently'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
