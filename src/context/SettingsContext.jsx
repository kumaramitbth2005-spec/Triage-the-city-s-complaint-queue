import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { settingsApi, profileApi } from '../api/settingsApi';

// Default preferences
const defaultPreferences = {
  theme: 'light', // 'light' | 'dark' | 'system'
  language: 'en', // 'en' | 'hi' | 'hinglish'
  notifications: {
    complaint: true,
    system: true,
    marketing: false,
  },
  search: {
    suggest: true,
    recent: true,
    defaultScope: 'all',
  },
  accessibility: {
    textSize: 'md', // 'sm' | 'md' | 'lg' | 'xl'
    reduceMotion: false,
    highContrast: false,
    focusIndicators: true,
  },
  profile: {
    name: 'Operator',
    avatar: null,
    role: 'Complaint Desk Operator',
    zone: 'Default Zone',
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
    case 'UPDATE_NOTIFICATIONS':
      return { ...state, notifications: { ...state.notifications, ...action.payload } };
    case 'UPDATE_SEARCH_PREFS':
      return { ...state, search: { ...state.search, ...action.payload } };
    case 'UPDATE_ACCESSIBILITY':
      return { ...state, accessibility: { ...state.accessibility, ...action.payload } };
    case 'UPDATE_PROFILE':
      return { ...state, profile: { ...state.profile, ...action.payload } };
    case 'ADD_RECENT_SEARCH': {
      const newList = [action.payload, ...state.recentSearches].slice(0, 10);
      return { ...state, recentSearches: newList };
    }
    case 'CLEAR_RECENT_SEARCHES':
      return { ...state, recentSearches: [] };
    case 'RESET_ALL':
      return defaultPreferences;
    default:
      return state;
  }
}

export function SettingsProvider({ children }) {
  const [state, dispatch] = useReducer(settingsReducer, defaultPreferences, (init) => {
    try {
      const persisted = localStorage.getItem('settings');
      if (persisted) {
        const parsed = JSON.parse(persisted);
        return {
          ...init,
          ...parsed,
          notifications: { ...init.notifications, ...(parsed.notifications || {}) },
          search: { ...init.search, ...(parsed.search || {}) },
          accessibility: { ...init.accessibility, ...(parsed.accessibility || {}) },
          profile: { ...init.profile, ...(parsed.profile || {}) },
          recentSearches: parsed.recentSearches || init.recentSearches,
        };
      }
      return init;
    } catch {
      return init;
    }
  });

  // Fetch from API on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const [settingsRes, profileRes] = await Promise.all([
          settingsApi.get(),
          profileApi.get()
        ]);
        if (settingsRes.data?.data) {
          const s = settingsRes.data.data;
          if (s.theme) dispatch({ type: 'SET_THEME', payload: s.theme });
          if (s.language) dispatch({ type: 'SET_LANGUAGE', payload: s.language });
          if (s.notificationPreferences) dispatch({ type: 'UPDATE_NOTIFICATIONS', payload: s.notificationPreferences });
          if (s.searchPreferences) dispatch({ type: 'UPDATE_SEARCH_PREFS', payload: s.searchPreferences });
          if (s.accessibilityPreferences) dispatch({ type: 'UPDATE_ACCESSIBILITY', payload: s.accessibilityPreferences });
        }
        if (profileRes.data?.data) {
          const p = profileRes.data.data;
          dispatch({ type: 'UPDATE_PROFILE', payload: { name: p.name, avatar: p.avatar, role: p.role, zone: p.zone } });
        }
      } catch (err) {
        console.warn('Failed to load settings from API, using local defaults');
      }
    };
    // Only load if token exists
    if (localStorage.getItem('auth_token')) {
      loadSettings();
    }
  }, []);

  // Persist on change
  useEffect(() => {
    localStorage.setItem('settings', JSON.stringify(state));
    // Apply CSS variables for theme & accessibility
    const root = document.documentElement;
    root.style.setProperty('--sidebar-bg', state.theme === 'dark' ? '#1f2937' : '#ffffff');
    root.style.setProperty('--text-primary', '#475569');
    
    // Accessibility
    root.classList.toggle('reduce-motion', state.accessibility.reduceMotion);
    root.classList.toggle('high-contrast', state.accessibility.highContrast);
    root.classList.toggle('hide-focus', !state.accessibility.focusIndicators);
    
    // Text size
    root.classList.remove('text-sm', 'text-md', 'text-lg', 'text-xl');
    root.classList.add(`text-${state.accessibility.textSize}`);
  }, [state]);

  const updateSetting = useCallback(async (action) => {
    dispatch(action);
    try {
      if (action.type === 'SET_THEME') await settingsApi.update({ theme: action.payload });
      if (action.type === 'SET_LANGUAGE') await settingsApi.update({ language: action.payload });
      if (action.type === 'UPDATE_NOTIFICATIONS') await settingsApi.update({ notificationPreferences: { ...state.notifications, ...action.payload } });
      if (action.type === 'UPDATE_SEARCH_PREFS') await settingsApi.update({ searchPreferences: { ...state.search, ...action.payload } });
      if (action.type === 'UPDATE_ACCESSIBILITY') await settingsApi.update({ accessibilityPreferences: { ...state.accessibility, ...action.payload } });
      if (action.type === 'UPDATE_PROFILE') await profileApi.update(action.payload);
    } catch (err) {
      console.error('Failed to sync setting to backend', err);
    }
  }, [state]);

  return (
    <SettingsContext.Provider value={{ state, dispatch: updateSetting }}>
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
