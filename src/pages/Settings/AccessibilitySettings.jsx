import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { useSettings } from '../../context/SettingsContext';

export function AccessibilitySettings() {
  const { state, dispatch } = useSettings();

  const toggleAccessibility = (key) => {
    dispatch({ 
      type: 'UPDATE_ACCESSIBILITY', 
      payload: { [key]: !state.accessibility[key] } 
    });
  };

  const setTextSize = (size) => {
    dispatch({ 
      type: 'UPDATE_ACCESSIBILITY', 
      payload: { textSize: size } 
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Accessibility</h1>
        <p className="text-gray-500 mt-1">Make the application easier to use and read.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Text Size</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 border border-gray-200 rounded-lg p-2 bg-gray-50">
            <button 
              onClick={() => setTextSize('sm')}
              className={`flex-1 py-2 text-center rounded-md transition-colors ${state.accessibility.textSize === 'sm' ? 'bg-white shadow-sm font-medium text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              Small
            </button>
            <button 
              onClick={() => setTextSize('md')}
              className={`flex-1 py-2 text-center rounded-md transition-colors ${state.accessibility.textSize === 'md' ? 'bg-white shadow-sm font-medium text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              Medium
            </button>
            <button 
              onClick={() => setTextSize('lg')}
              className={`flex-1 py-2 text-center rounded-md transition-colors ${state.accessibility.textSize === 'lg' ? 'bg-white shadow-sm font-medium text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              Large
            </button>
            <button 
              onClick={() => setTextSize('xl')}
              className={`flex-1 py-2 text-center rounded-md transition-colors ${state.accessibility.textSize === 'xl' ? 'bg-white shadow-sm font-medium text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              Extra Large
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-3">Adjusts the base font size of the application.</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Display & Motion</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between py-2 border-b border-gray-100">
            <div>
              <div className="font-medium text-gray-700">Reduce Motion</div>
              <div className="text-sm text-gray-500">Minimize animations and transitions</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={state.accessibility.reduceMotion}
                onChange={() => toggleAccessibility('reduceMotion')}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between py-2 border-b border-gray-100">
            <div>
              <div className="font-medium text-gray-700">High Contrast</div>
              <div className="text-sm text-gray-500">Increase color contrast for better readability</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={state.accessibility.highContrast}
                onChange={() => toggleAccessibility('highContrast')}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between py-2">
            <div>
              <div className="font-medium text-gray-700">Focus Indicators</div>
              <div className="text-sm text-gray-500">Always show visible outlines around focused elements</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={state.accessibility.focusIndicators}
                onChange={() => toggleAccessibility('focusIndicators')}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
