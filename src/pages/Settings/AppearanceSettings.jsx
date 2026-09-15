import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useSettings } from '../../context/SettingsContext';

export function AppearanceSettings() {
  const { state, dispatch } = useSettings();

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Appearance</h1>
        <p className="text-gray-500 mt-1">Customize how the application looks.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Theme Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button 
              onClick={() => dispatch({ type: 'SET_THEME', payload: 'light' })}
              className={`p-4 border rounded-xl flex flex-col items-center gap-3 transition-all ${
                state.theme === 'light' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'
              }`}
            >
              <div className="w-16 h-12 bg-white rounded-md border shadow-sm flex items-center justify-center text-xs font-semibold text-gray-700">Ag</div>
              <span className={`font-medium ${state.theme === 'light' ? 'text-blue-700' : 'text-gray-700'}`}>Light</span>
            </button>

            <button 
              onClick={() => dispatch({ type: 'SET_THEME', payload: 'dark' })}
              className={`p-4 border rounded-xl flex flex-col items-center gap-3 transition-all ${
                state.theme === 'dark' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'
              }`}
            >
              <div className="w-16 h-12 bg-gray-900 rounded-md shadow-sm flex items-center justify-center text-xs font-semibold text-white">Ag</div>
              <span className={`font-medium ${state.theme === 'dark' ? 'text-blue-700' : 'text-gray-700'}`}>Dark</span>
            </button>

            <button 
              onClick={() => dispatch({ type: 'SET_THEME', payload: 'system' })}
              className={`p-4 border rounded-xl flex flex-col items-center gap-3 transition-all ${
                state.theme === 'system' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'
              }`}
            >
              <div className="w-16 h-12 bg-gradient-to-r from-white to-gray-900 rounded-md shadow-sm flex items-center justify-center text-xs font-semibold text-gray-400">Ag</div>
              <span className={`font-medium ${state.theme === 'system' ? 'text-blue-700' : 'text-gray-700'}`}>System</span>
            </button>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Density</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
           <div className="flex items-center justify-between py-2">
            <div>
              <div className="font-medium text-gray-700">Compact View</div>
              <div className="text-sm text-gray-500">Reduce spacing between elements to fit more data on screen</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
