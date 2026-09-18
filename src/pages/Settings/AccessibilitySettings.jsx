import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { useSettings } from '../../context/SettingsContext';
import { CheckCircle2, Type, Zap, Eye, Focus } from 'lucide-react';

export function AccessibilitySettings() {
  const { state, dispatch, saveStatus } = useSettings();

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
          <h1 className="text-2xl font-bold text-gray-900">Accessibility</h1>
          <p className="text-gray-500 mt-1">Enhance readability, reduce motion, and configure high contrast display.</p>
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

      {/* Typography & Text Size */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Type size={18} className="text-blue-600" />
            <span>Text Size & Typography</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {textSizes.map((size) => {
              const isSelected = (accessibility.textSize || 'md') === size.id;
              return (
                <button 
                  key={size.id}
                  type="button"
                  onClick={() => setTextSize(size.id)}
                  className={`p-3 rounded-xl border text-center transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isSelected 
                      ? 'border-blue-600 bg-blue-50 text-blue-700 font-semibold shadow-xs ring-1 ring-blue-600' 
                      : 'border-gray-200 hover:border-blue-300 bg-white text-gray-700'
                  }`}
                  aria-pressed={isSelected}
                >
                  <div className="text-sm font-medium">{size.label}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{size.sample}</div>
                </button>
              );
            })}
          </div>
          <p className="text-xs text-gray-500">Dynamically scales typography across cards, navigation, and queue tables.</p>
        </CardContent>
      </Card>
      
      {/* Visual & Motion Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye size={18} className="text-purple-600" />
            <span>Visual & Motion Enhancements</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="divide-y divide-gray-100">
          {/* Reduce Motion */}
          <div className="flex items-center justify-between py-3.5 first:pt-0">
            <div className="flex items-start gap-3 pr-4">
              <div className="p-2 rounded-lg bg-amber-50 text-amber-600 shrink-0 mt-0.5">
                <Zap size={18} />
              </div>
              <div>
                <div className="font-medium text-sm text-gray-800">Reduce Motion</div>
                <div className="text-xs text-gray-500 leading-relaxed mt-0.5">
                  Disable slide animations and transition effects for users sensitive to motion
                </div>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer shrink-0">
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

          {/* High Contrast */}
          <div className="flex items-center justify-between py-3.5">
            <div className="flex items-start gap-3 pr-4">
              <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 shrink-0 mt-0.5">
                <Eye size={18} />
              </div>
              <div>
                <div className="font-medium text-sm text-gray-800">High Contrast Mode</div>
                <div className="text-xs text-gray-500 leading-relaxed mt-0.5">
                  Boost element contrast borders and text sharpness for elevated visual clarity
                </div>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={!!accessibility.highContrast}
                onChange={() => toggleAccessibility('highContrast')}
                aria-label="Toggle high contrast"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* Focus Indicators */}
          <div className="flex items-center justify-between py-3.5 last:pb-0">
            <div className="flex items-start gap-3 pr-4">
              <div className="p-2 rounded-lg bg-blue-50 text-blue-600 shrink-0 mt-0.5">
                <Focus size={18} />
              </div>
              <div>
                <div className="font-medium text-sm text-gray-800">Keyboard Focus Outlines</div>
                <div className="text-xs text-gray-500 leading-relaxed mt-0.5">
                  Display distinct high-visibility focus borders when navigating via Tab key
                </div>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer shrink-0">
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
