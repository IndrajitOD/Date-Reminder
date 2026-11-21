import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  MOCK_USER, 
  INITIAL_PERSONAL_REMINDERS, 
  INITIAL_GLOBAL_EVENTS, 
  INITIAL_USER_CUSTOM_CATEGORIES,
  PRIMARY_GLOBAL_CATEGORIES,
  SUGGESTED_PERSONAL_CATEGORIES
} from '../data/mockData';
import { 
  registerWithFirebase, 
  loginWithFirebase, 
  loginWithGoogle,
  logoutFromFirebase, 
  subscribeToAuthChanges 
} from '../services/authService';
import { api } from '../services/apiClient';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('ndr_user');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return null;
  });

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return !!localStorage.getItem('ndr_user');
  });

  const [authLoading, setAuthLoading] = useState(true);

  // Personal Reminders
  const [reminders, setReminders] = useState(() => {
    const saved = localStorage.getItem('ndr_reminders');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return INITIAL_PERSONAL_REMINDERS;
  });

  // Custom Categories
  const [customCategories, setCustomCategories] = useState(() => {
    const saved = localStorage.getItem('ndr_categories');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return INITIAL_USER_CUSTOM_CATEGORIES;
  });

  // Predefined Global Events Catalog
  const [globalEvents, setGlobalEvents] = useState(() => {
    const saved = localStorage.getItem('ndr_global_events');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return INITIAL_GLOBAL_EVENTS;
  });

  // Global Notification Toasts Array
  const [toasts, setToasts] = useState([]);

  // Dismiss a toast by id
  const dismissToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Add toast with auto-dismiss
  const showToast = (message, type = 'info', title = null, duration = 4000) => {
    const id = Date.now() + Math.random();
    const newToast = { id, message, type, title };
    setToasts((prev) => [newToast, ...prev].slice(0, 4)); // Stack max 4 toasts

    if (duration > 0) {
      setTimeout(() => {
        dismissToast(id);
      }, duration);
    }
  };

  // Sync data with backend MongoDB when authenticated
  const loadDataFromBackend = async () => {
    try {
      const [remRes, catRes, evRes, subRes] = await Promise.allSettled([
        api.getReminders(),
        api.getCategories(),
        api.getGlobalEvents(),
        api.getSubscriptions()
      ]);

      if (remRes.status === 'fulfilled' && remRes.value?.data) {
        if (remRes.value.data.length > 0) {
          setReminders(remRes.value.data.map(r => ({
            ...r,
            id: r._id,
            date: r.eventDate,
            channels: r.notificationChannels?.map(c => c.charAt(0).toUpperCase() + c.slice(1)) || ['Email'],
            reminderDaysBefore: r.reminderSchedules?.[0] ?? 3
          })));
        }
      }

      if (catRes.status === 'fulfilled' && catRes.value?.data) {
        if (catRes.value.data.length > 0) {
          setCustomCategories(catRes.value.data.map(c => ({
            ...c,
            id: c._id
          })));
        }
      }

      if (evRes.status === 'fulfilled' && evRes.value?.data && evRes.value.data.length > 0) {
        const userSubs = subRes.status === 'fulfilled' ? subRes.value?.data || [] : [];
        const subEventIds = new Set(userSubs.map(s => s.eventId));
        setGlobalEvents(evRes.value.data.map(g => ({
          ...g,
          id: g._id,
          subscribed: subEventIds.has(g._id)
        })));
      }
    } catch (err) {
      console.warn('Backend sync standby (will use cached/local state):', err.message);
    }
  };

  // Listen to live Firebase Auth state
  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges(async (fbUser) => {
      if (fbUser) {
        const idToken = await fbUser.getIdToken();
        const providers = fbUser.providerData.map(p => p.providerId);
        
        const userObj = {
          id: fbUser.uid,
          firebaseUid: fbUser.uid,
          name: fbUser.displayName || fbUser.email?.split('@')[0] || 'User',
          email: fbUser.email || '',
          photoURL: fbUser.photoURL || '',
          phone: fbUser.phoneNumber || '',
          emailVerified: fbUser.emailVerified || false,
          providerId: fbUser.providerData?.[0]?.providerId || 'password',
          providers: providers.length > 0 ? providers : ['password'],
          creationTime: fbUser.metadata?.creationTime || '',
          lastSignInTime: fbUser.metadata?.lastSignInTime || '',
          token: idToken,
          timezone: currentUser?.timezone || 'UTC',
          dateFormat: currentUser?.dateFormat || 'MMM DD, YYYY',
          timeFormat: currentUser?.timeFormat || '12h',
          defaultCalendarView: currentUser?.defaultCalendarView || 'month',
          language: currentUser?.language || 'English (US)',
          notificationPreferences: currentUser?.notificationPreferences || {
            masterEnabled: true,
            globalEventsEnabled: true,
            personalRemindersEnabled: true,
            uncategorizedRemindersEnabled: true,
            email: { enabled: true, address: fbUser.email, verified: true },
            whatsapp: { enabled: false, number: '', verified: false },
            browserPush: { enabled: true, permission: 'granted' },
            defaultAdvanceDays: 3,
            digestTime: '09:00'
          }
        };

        // Attempt to fetch extra profile attributes from MongoDB
        try {
          const profileRes = await api.getProfile();
          if (profileRes?.data) {
            userObj.name = profileRes.data.name || userObj.name;
            userObj.phone = profileRes.data.phoneNumber || userObj.phone;
            userObj.timezone = profileRes.data.timezone || userObj.timezone;
            userObj.language = profileRes.data.language || userObj.language;
            userObj.dateFormat = profileRes.data.dateFormat || userObj.dateFormat;
            userObj.timeFormat = profileRes.data.timeFormat || userObj.timeFormat;
            userObj.createdAt = profileRes.data.createdAt || userObj.creationTime;
            userObj.updatedAt = profileRes.data.updatedAt;
            if (profileRes.data.profilePicture) {
              userObj.photoURL = profileRes.data.profilePicture;
            }
          }
        } catch (profileErr) {
          console.warn('Could not retrieve DB profile info:', profileErr.message);
        }

        setCurrentUser(userObj);
        setIsAuthenticated(true);
        localStorage.setItem('ndr_user', JSON.stringify(userObj));
        localStorage.setItem('ndr_auth', 'true');

        // Fetch user reminders & categories from MongoDB
        loadDataFromBackend();
      } else {
        setIsAuthenticated(false);
        setCurrentUser(null);
        localStorage.removeItem('ndr_user');
        localStorage.setItem('ndr_auth', 'false');
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Save changes to localStorage for offline cache
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('ndr_user', JSON.stringify(currentUser));
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('ndr_reminders', JSON.stringify(reminders));
  }, [reminders]);

  useEffect(() => {
    localStorage.setItem('ndr_categories', JSON.stringify(customCategories));
  }, [customCategories]);

  useEffect(() => {
    localStorage.setItem('ndr_global_events', JSON.stringify(globalEvents));
  }, [globalEvents]);

  const login = async (email, password) => {
    const user = await loginWithFirebase(email, password);
    showToast('Signed in successfully.', 'success');
    return user;
  };

  const signInWithGoogle = async () => {
    const user = await loginWithGoogle();
    showToast('Signed in successfully with Google.', 'success');
    return user;
  };

  const register = async (email, password, displayName) => {
    const user = await registerWithFirebase(email, password, displayName);
    showToast('Your account has been created.', 'success');
    return user;
  };

  const logout = async () => {
    await logoutFromFirebase();
    showToast('Signed out successfully.', 'success');
  };

  // --- Personal Reminders Actions ---
  const addReminder = async (newReminder) => {
    const tempId = `rem-${Date.now()}`;
    const createdLocal = {
      ...newReminder,
      id: tempId,
      isActive: true
    };
    setReminders(prev => [createdLocal, ...prev]);
    showToast(`Created reminder: "${createdLocal.title}"`, 'success');

    // Sync with MongoDB backend if available
    try {
      const res = await api.createReminder({
        title: newReminder.title,
        personName: newReminder.personName,
        eventDate: newReminder.date,
        categoryId: newReminder.categoryId,
        categoryName: newReminder.categoryName,
        recurrence: newReminder.recurrence,
        reminderSchedules: [newReminder.reminderDaysBefore || 3],
        notificationChannels: newReminder.channels?.map(c => c.toLowerCase()) || ['email'],
        notes: newReminder.notes
      });
      if (res?.data?._id) {
        setReminders(prev => prev.map(r => r.id === tempId ? { ...r, id: res.data._id, _id: res.data._id } : r));
      }
    } catch (err) {
      console.warn('Backend sync failed, saved locally:', err.message);
    }

    return createdLocal;
  };

  const updateReminder = async (id, updatedFields) => {
    setReminders(prev => prev.map(r => r.id === id ? { ...r, ...updatedFields } : r));
    showToast('Reminder updated successfully', 'success');

    try {
      await api.updateReminder(id, {
        ...(updatedFields.title && { title: updatedFields.title }),
        ...(updatedFields.personName !== undefined && { personName: updatedFields.personName }),
        ...(updatedFields.date && { eventDate: updatedFields.date }),
        ...(updatedFields.categoryName && { categoryName: updatedFields.categoryName }),
        ...(updatedFields.categoryId !== undefined && { categoryId: updatedFields.categoryId }),
        ...(updatedFields.recurrence && { recurrence: updatedFields.recurrence }),
        ...(updatedFields.notes !== undefined && { notes: updatedFields.notes })
      });
    } catch (err) {
      console.warn('Backend update failed:', err.message);
    }
  };

  const deleteReminder = async (id) => {
    setReminders(prev => prev.filter(r => r.id !== id));
    showToast('Reminder deleted', 'info');

    try {
      await api.deleteReminder(id);
    } catch (err) {
      console.warn('Backend delete failed:', err.message);
    }
  };

  // --- Category Actions ---
  const addCategory = async (name, color = '#e11d48', icon = 'Tag') => {
    if (!name.trim()) return;
    const exists = customCategories.some(c => c.name.toLowerCase() === name.trim().toLowerCase());
    if (exists) {
      showToast('Category already exists', 'error');
      return;
    }
    const tempId = `cat-${Date.now()}`;
    const created = { id: tempId, name: name.trim(), color, icon };
    setCustomCategories(prev => [...prev, created]);
    showToast(`Category "${created.name}" created`, 'success');

    try {
      const res = await api.createCategory({ name: name.trim(), color, icon });
      if (res?.data?._id) {
        setCustomCategories(prev => prev.map(c => c.id === tempId ? { ...c, id: res.data._id } : c));
      }
    } catch (err) {
      console.warn('Backend category sync failed:', err.message);
    }

    return created;
  };

  const updateCategory = async (id, newFields) => {
    const oldCat = customCategories.find(c => c.id === id);
    setCustomCategories(prev => prev.map(c => c.id === id ? { ...c, ...newFields } : c));

    if (newFields.name && oldCat && oldCat.name !== newFields.name) {
      setReminders(prev => prev.map(r => r.categoryId === id ? { ...r, categoryName: newFields.name } : r));
    }
    showToast('Category updated', 'success');

    try {
      await api.updateCategory(id, newFields);
    } catch (err) {
      console.warn('Backend category update failed:', err.message);
    }
  };

  const deleteCategory = async (id) => {
    const catToDelete = customCategories.find(c => c.id === id);
    setCustomCategories(prev => prev.filter(c => c.id !== id));
    setReminders(prev => prev.map(r => r.categoryId === id ? { ...r, categoryId: null, categoryName: 'Uncategorized' } : r));
    showToast(`Category "${catToDelete?.name || ''}" deleted. Reminders moved to Uncategorized.`, 'info');

    // Only call API if it is a real MongoDB ObjectId (24 hex characters)
    if (/^[0-9a-fA-F]{24}$/.test(id)) {
      try {
        await api.deleteCategory(id);
      } catch (err) {
        console.warn('Backend category delete failed:', err.message);
      }
    }
  };

  // --- Global Event Subscriptions ---
  const toggleEventSubscription = async (eventId) => {
    let nextState = false;
    setGlobalEvents(prev => prev.map(item => {
      if (item.id === eventId) {
        nextState = !item.subscribed;
        showToast(
          nextState ? `Subscribed to ${item.name}` : `Unsubscribed from ${item.name}`,
          nextState ? 'success' : 'info'
        );
        return { ...item, subscribed: nextState };
      }
      return item;
    }));

    try {
      if (nextState) {
        await api.subscribeEvent({ subscriptionType: 'event', eventId });
      } else {
        await api.unsubscribeEvent({ subscriptionType: 'event', eventId });
      }
    } catch (err) {
      console.warn('Subscription sync failed:', err.message);
    }
  };

  const subscribeEntireCategory = async (categoryName) => {
    setGlobalEvents(prev => prev.map(item => {
      if (item.primaryCategory === categoryName) {
        return { ...item, subscribed: true };
      }
      return item;
    }));
    showToast(`Subscribed to all events in "${categoryName}"`, 'success');

    try {
      await api.subscribeEvent({ subscriptionType: 'category', categoryName });
    } catch (err) {
      console.warn('Category subscription sync failed:', err.message);
    }
  };

  const updateUserSettings = async (updatedUser) => {
    setCurrentUser(prev => ({ ...prev, ...updatedUser }));
    showToast('Preferences updated successfully', 'success');

    try {
      if (updatedUser.notificationPreferences) {
        await api.updateNotificationPreferences(updatedUser.notificationPreferences);
      }
    } catch (err) {
      console.warn('Settings sync failed:', err.message);
    }
  };

  return (
    <AppContext.Provider
      value={{
        isAuthenticated,
        setIsAuthenticated,
        currentUser,
        authLoading,
        login,
        signInWithGoogle,
        register,
        logout,
        reminders,
        addReminder,
        updateReminder,
        deleteReminder,
        customCategories,
        addCategory,
        updateCategory,
        deleteCategory,
        suggestedCategories: SUGGESTED_PERSONAL_CATEGORIES,
        globalCategories: PRIMARY_GLOBAL_CATEGORIES,
        globalEvents,
        toggleEventSubscription,
        subscribeEntireCategory,
        updateUserSettings,
        toasts,
        dismissToast,
        showToast
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
