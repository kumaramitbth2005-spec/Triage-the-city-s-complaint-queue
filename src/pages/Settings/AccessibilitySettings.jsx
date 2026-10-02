import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { useSettings } from '../../context/SettingsContext';
import { useTranslation } from '../../context/LanguageContext';
import { CheckCircle2, Type, Zap, Eye, Focus } from 'lucide-react';

export function AccessibilitySettings() {
  const { state, dispatch, saveStatus } = useSettings();
  const { t } = useTranslation();

  const accessibility = state.accessibility || {
    textSize: 'md',
    reduceMotion: false,
    highContrast: false,
    focusIndicators: true,
  };

  const toggleAccessibility = (key) => {
    dispatch({ 
      type: 'UPDATE_ACCESSIBILITY', 
      payload: { [key]: !accessibility[key] } 
    });
  };

  const setTextSize = (size) => {
    dispatch({ 
      type: 'UPDATE_ACCESSIBILITY', 
      payload: { textSize: size } 
    });
  };

  const textSizes = [
    { id: 'sm', label: 'Small', sample: '14px' },
    { id: 'md', label: 'Default', sample: '16px' },
    { id: 'lg', label: 'Large', sample: '18px' },
    { id: 'xl', label: 'Extra Large', sample: '20px' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('accessibilityTitle', 'Accessibility')}</h1>
          <p className="text-gray-500 mt-1">{t('accessibilityDesc', 'Enhance readability, reduce motion, and configure high contrast display.')}</p>
        </div>
        {saveStatus === 'saving' && (
          <span className="text-xs font-medium text-blue-600 animate-pulse">{t('saving', 'Saving...')}</span>
        )}
        {saveStatus === 'saved' && (
          <span className="text-xs font-medium text-emerald-600 flex items-center gap-1">
            <CheckCircle2 size={14} /> {t('saved', 'Saved ✓')}
          </span>
        )}
      </div>

      {/* Typography & Text Size */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Type size={18} className="text-blue-600" />
            <span>Text Size & Typography</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {textSizes.map((size) => {
              const isSelected = accessibility.textSize === size.id;
              return (
                <button
                  key={size.id}
                  type="button"
                  onClick={() => setTextSize(size.id)}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    isSelected 
                      ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/40 shadow-xs ring-1 ring-blue-600' 
                      : 'border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600 bg-white dark:bg-slate-900'
                  }`}
                  aria-pressed={isSelected}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-sm text-gray-800 dark:text-white">{size.label}</span>
                    {isSelected && <CheckCircle2 size={16} className="text-blue-600" />}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-slate-400">Sample preview</div>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Motion & Visual Preferences */}
      <Card>
        <CardHeader>
          <CardTitle>Display & Motion Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between py-2">
            <div className="flex items-start gap-3">
              <Zap size={18} className="text-gray-500 mt-0.5" />
              <div>
                <div className="font-medium text-gray-800 dark:text-white">Reduce Motion</div>
                <div className="text-xs text-gray-500 dark:text-slate-400">Minimize animations and transition effects throughout the interface</div>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={!!accessibility.reduceMotion}
                onChange={() => toggleAccessibility('reduceMotion')}
                aria-label="Toggle reduce motion"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between py-3 border-t border-gray-100">
            <div className="flex items-start gap-3">
              <Eye size={18} className="text-gray-500 mt-0.5" />
              <div>
                <div className="font-medium text-gray-800 dark:text-white">High Contrast Mode</div>
                <div className="text-xs text-gray-500 dark:text-slate-400">Increase color contrast for better legibility on badges and borders</div>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={!!accessibility.highContrast}
                onChange={() => toggleAccessibility('highContrast')}
                aria-label="Toggle high contrast mode"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between py-3 border-t border-gray-100">
            <div className="flex items-start gap-3">
              <Focus size={18} className="text-gray-500 mt-0.5" />
              <div>
                <div className="font-medium text-gray-800 dark:text-white">Enhanced Focus Indicators</div>
                <div className="text-xs text-gray-500 dark:text-slate-400">Highlight active buttons and inputs clearly for keyboard navigation</div>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={accessibility.focusIndicators !== false}
                onChange={() => toggleAccessibility('focusIndicators')}
                aria-label="Toggle focus indicators"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
