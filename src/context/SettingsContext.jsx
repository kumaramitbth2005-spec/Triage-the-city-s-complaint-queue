import React, { createContext, useContext, useReducer, useEffect, useCallback, useState } from 'react';
import { settingsApi, profileApi } from '../api/settingsApi';

// Default preferences
export const defaultPreferences = {
  theme: 'light', // 'light' | 'dark' | 'system'
  language: 'en', // 'en' | 'hi' | 'hinglish'
  compactMode: false,
  general: {
    defaultView: 'Dashboard',
    itemsPerPage: 25,
    autoRefresh: true,
    autoSave: true
  },
  notifications: {
    email: true,
    push: true,
    security: true,
    productUpdates: false,
    activity: true,
    complaint: true,
    system: true,
    marketing: false,
  },
  privacy: {
    profileVisibility: 'Internal Only',
    activityHistory: true,
    dataCollection: true,
    personalization: true,
  },
  accessibility: {
    textSize: 'md', // 'sm' | 'md' | 'lg' | 'xl'
    reduceMotion: false,
    highContrast: false,
    focusIndicators: true,
  },
  search: {
    suggest: true,
    recent: true,
    defaultScope: 'all',
  },
  profile: {
    name: 'Operator',
    username: 'operator_1',
    email: 'operator@municipal.gov',
    phone: '+91 98765 43210',
    bio: 'Municipal complaint desk officer managing ward intake and triage.',
    avatar: null,
    role: 'Complaint Desk Operator',
    zone: 'Zone 1 - Central',
    department: 'Public Works & Sanitation',
  },
  recentSearches: [],
};

const SettingsContext = createContext();

function settingsReducer(state, action) {
  switch (action.type) {
    case 'SET_THEME':
      return { ...state, theme: action.payload };
    case 'SET_LANGUAGE':
      return { ...state, language: action.payload };
    case 'SET_COMPACT_MODE':
      return { ...state, compactMode: action.payload };
    case 'UPDATE_GENERAL':
      return { ...state, general: { ...state.general, ...action.payload } };
    case 'UPDATE_NOTIFICATIONS':
      return { ...state, notifications: { ...state.notifications, ...action.payload } };
    case 'UPDATE_PRIVACY':
      return { ...state, privacy: { ...state.privacy, ...action.payload } };
    case 'UPDATE_ACCESSIBILITY':
      return { ...state, accessibility: { ...state.accessibility, ...action.payload } };
    case 'UPDATE_SEARCH_PREFS':
      return { ...state, search: { ...state.search, ...action.payload } };
    case 'UPDATE_PROFILE':
      return { ...state, profile: { ...state.profile, ...action.payload } };
    case 'ADD_RECENT_SEARCH': {
      const newList = [action.payload, ...state.recentSearches.filter(s => s.id !== action.payload.id)].slice(0, 10);
      return { ...state, recentSearches: newList };
    }
    case 'CLEAR_RECENT_SEARCHES':
      return { ...state, recentSearches: [] };
    case 'LOAD_SERVER_SETTINGS':
      return {
        ...state,
        ...action.payload,
        general: { ...state.general, ...(action.payload.general || {}) },
        notifications: { ...state.notifications, ...(action.payload.notifications || {}) },
        privacy: { ...state.privacy, ...(action.payload.privacy || {}) },
        accessibility: { ...state.accessibility, ...(action.payload.accessibility || {}) },
        search: { ...state.search, ...(action.payload.search || {}) },
      };
    case 'RESET_ALL':
      return defaultPreferences;
    default:
      return state;
  }
}

export function SettingsProvider({ children }) {
  const [saveStatus, setSaveStatus] = useState('idle'); // 'idle' | 'saving' | 'saved' | 'error'

  const [state, dispatch] = useReducer(settingsReducer, defaultPreferences, (init) => {
    try {
      const persisted = localStorage.getItem('settings');
      if (persisted) {
        const parsed = JSON.parse(persisted);
        return {
          ...init,
          ...parsed,
          general: { ...init.general, ...(parsed.general || {}) },
          notifications: { ...init.notifications, ...(parsed.notifications || {}) },
          privacy: { ...init.privacy, ...(parsed.privacy || {}) },
          accessibility: { ...init.accessibility, ...(parsed.accessibility || {}) },
          search: { ...init.search, ...(parsed.search || {}) },
          profile: { ...init.profile, ...(parsed.profile || {}) },
          recentSearches: parsed.recentSearches || init.recentSearches,
        };
      }
      return init;
    } catch {
      return init;
    }
  });

  // Apply Theme & DOM styling instantly
  useEffect(() => {
    const root = document.documentElement;
    const mediaQuery = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;

    const applyTheme = () => {
      const isSystemDark = mediaQuery ? mediaQuery.matches : false;
      const isDark = state.theme === 'dark' || (state.theme === 'system' && isSystemDark);

      root.classList.toggle('dark', isDark);
      root.setAttribute('data-theme', isDark ? 'dark' : 'light');
      root.style.setProperty('--sidebar-bg', isDark ? '#1e293b' : '#ffffff');
      root.style.setProperty('--text-primary', isDark ? '#f8fafc' : '#475569');
    };

    applyTheme();

    if (state.theme === 'system' && mediaQuery) {
      const handler = () => applyTheme();
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    }
  }, [state.theme]);

  // Apply Accessibility, Density, and Text Size classes
  useEffect(() => {
    const root = document.documentElement;

    // Compact mode
    root.classList.toggle('compact-mode', !!state.compactMode);

    // Accessibility
    root.classList.toggle('reduce-motion', !!state.accessibility?.reduceMotion);
    root.classList.toggle('high-contrast', !!state.accessibility?.highContrast);
    root.classList.toggle('hide-focus', !state.accessibility?.focusIndicators);

    // Text size
    root.classList.remove('text-sm', 'text-md', 'text-lg', 'text-xl');
    root.classList.add(`text-${state.accessibility?.textSize || 'md'}`);
  }, [state.compactMode, state.accessibility]);

  // Persist to localStorage immediately
  useEffect(() => {
    localStorage.setItem('settings', JSON.stringify(state));
  }, [state]);

  // Fetch from backend API on initial mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const [settingsRes, profileRes] = await Promise.all([
          settingsApi.get().catch(() => null),
          profileApi.get().catch(() => null)
        ]);

        if (settingsRes?.data?.data) {
          const s = settingsRes.data.data;
          dispatch({
            type: 'LOAD_SERVER_SETTINGS',
            payload: {
              theme: s.theme || state.theme,
              language: s.language || state.language,
              compactMode: s.compactMode !== undefined ? s.compactMode : state.compactMode,
              general: s.general || state.general,
              notifications: s.notifications || s.notificationPreferences || state.notifications,
              privacy: s.privacy || state.privacy,
              accessibility: s.accessibility || s.accessibilityPreferences || state.accessibility,
            }
          });
        }

        if (profileRes?.data?.data) {
          const p = profileRes.data.data;
          dispatch({
            type: 'UPDATE_PROFILE',
            payload: {
              name: p.name || state.profile.name,
              username: p.username || state.profile.username,
              email: p.email || state.profile.email,
              phone: p.phone || state.profile.phone,
              bio: p.bio || state.profile.bio,
              avatar: p.avatar !== undefined ? p.avatar : state.profile.avatar,
              role: p.role || state.profile.role,
              zone: p.zone || state.profile.zone,
              department: p.department || state.profile.department,
            }
          });
        }
      } catch (err) {
        console.warn('Backend unavailable, operating seamlessly on local cached preferences.');
      }
    };

    if (localStorage.getItem('auth_token')) {
      loadSettings();
    }
  }, []);

  // Update Setting action dispatcher that syncs to backend with saving feedback
  const updateSetting = useCallback(async (action) => {
    dispatch(action);
    setSaveStatus('saving');

    try {
      if (action.type === 'SET_THEME') {
        await settingsApi.updateTheme(action.payload);
      } else if (action.type === 'SET_LANGUAGE') {
        await settingsApi.updateLanguage(action.payload);
      } else if (action.type === 'SET_COMPACT_MODE') {
        await settingsApi.update({ compactMode: action.payload });
      } else if (action.type === 'UPDATE_GENERAL') {
        await settingsApi.update({ general: { ...state.general, ...action.payload } });
      } else if (action.type === 'UPDATE_NOTIFICATIONS') {
        await settingsApi.updateNotifications({ ...state.notifications, ...action.payload });
      } else if (action.type === 'UPDATE_PRIVACY') {
        await settingsApi.updatePrivacy({ ...state.privacy, ...action.payload });
      } else if (action.type === 'UPDATE_ACCESSIBILITY') {
        await settingsApi.updateAccessibility({ ...state.accessibility, ...action.payload });
      } else if (action.type === 'UPDATE_SEARCH_PREFS') {
        await settingsApi.update({ search: { ...state.search, ...action.payload } });
      } else if (action.type === 'UPDATE_PROFILE') {
        await profileApi.update(action.payload);
      }
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (err) {
      console.warn('Backend sync failed, state persisted locally.', err);
      setSaveStatus('idle');
    }
  }, [state]);

  return (
    <SettingsContext.Provider value={{ 
      state, 
      dispatch: updateSetting, 
      saveStatus,
      setSaveStatus
    }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within SettingsProvider');
  }
  return context;
}
