import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { useSettings } from '../../context/SettingsContext';
import { Sun, Moon, Monitor, CheckCircle2 } from 'lucide-react';
import { useTranslation } from '../../context/LanguageContext';

export function ThemeSettings() {
  const { state, dispatch, saveStatus } = useSettings();
  const { t } = useTranslation();

  const themes = [
    {
      id: 'light',
      name: 'Light',
      description: 'Clean bright interface with crisp borders',
      icon: Sun,
      previewBg: 'bg-slate-100',
      previewCard: 'bg-white border-slate-200 text-slate-800',
      previewAccent: 'bg-blue-600',
    },
    {
      id: 'dark',
      name: 'Dark',
      description: 'Sleek dark mode that reduces eye strain',
      icon: Moon,
      previewBg: 'bg-slate-900',
      previewCard: 'bg-slate-800 border-slate-700 text-slate-100',
      previewAccent: 'bg-blue-500',
    },
    {
      id: 'system',
      name: 'System',
      description: 'Automatically synchronizes with your device theme',
      icon: Monitor,
      previewBg: 'bg-gradient-to-r from-slate-100 to-slate-900',
      previewCard: 'bg-slate-200 border-slate-400 text-slate-900',
      previewAccent: 'bg-blue-600',
    }
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Theme</h1>
          <p className="text-gray-500 mt-1">Customize the visual theme and appearance of the application.</p>
        </div>
        {saveStatus === 'saving' && (
          <span className="text-xs font-medium text-blue-600 animate-pulse">Saving...</span>
        )}
        {saveStatus === 'saved' && (
          <span className="text-xs font-medium text-emerald-600 flex items-center gap-1">
            <CheckCircle2 size={14} /> Saved ✓
          </span>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Theme Mode</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {themes.map((themeOption) => {
              const Icon = themeOption.icon;
              const isSelected = state.theme === themeOption.id;

              return (
                <button
                  key={themeOption.id}
                  type="button"
                  onClick={() => dispatch({ type: 'SET_THEME', payload: themeOption.id })}
                  className={`p-5 rounded-xl border-2 text-left transition-all duration-200 flex flex-col justify-between relative group focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/50 shadow-md ring-1 ring-blue-600'
                      : 'border-gray-200 hover:border-blue-300 hover:shadow-sm bg-white'
                  }`}
                  aria-pressed={isSelected}
                >
                  {/* Theme visual mockup preview */}
                  <div className={`w-full h-24 rounded-lg ${themeOption.previewBg} p-2.5 flex flex-col justify-between mb-4 border border-black/5`}>
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-2 rounded bg-gray-400/40" />
                      <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                    </div>
                    <div className={`p-2 rounded-md ${themeOption.previewCard} border text-[10px] font-medium shadow-xs flex items-center justify-between`}>
                      <span>Dashboard</span>
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <Icon size={18} className={isSelected ? 'text-blue-600' : 'text-gray-500'} />
                        <span className={`font-semibold text-base ${isSelected ? 'text-blue-700' : 'text-gray-800'}`}>
                          {themeOption.name}
                        </span>
                      </div>
                      {isSelected && (
                        <CheckCircle2 size={18} className="text-blue-600 fill-blue-50" />
                      )}
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      {themeOption.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="p-4 bg-blue-50/70 border border-blue-100 rounded-xl flex items-start gap-3">
        <Monitor className="text-blue-600 shrink-0 mt-0.5" size={18} />
        <div className="text-xs text-blue-900 leading-relaxed">
          <strong>Instant Synchronization:</strong> Theme changes apply across all layouts, modals, topbars, sidebars, and cards immediately. "System" mode automatically responds whenever your device switches between daylight and night themes.
        </div>
      </div>
    </div>
  );
}
