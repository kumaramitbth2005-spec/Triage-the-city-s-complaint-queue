import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { useSettings } from '../../context/SettingsContext';

export function LanguageSettings() {
  const { state, dispatch } = useSettings();

  const languages = [
    { code: 'en', name: 'English (US)', flag: '🇺🇸' },
    { code: 'hi', name: 'हिंदी (Hindi)', flag: '🇮🇳' },
    { code: 'hinglish', name: 'Hinglish', flag: '💬' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Language & Region</h1>
        <p className="text-gray-500 mt-1">Select your preferred language for the interface.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Display Language</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {languages.map((lang) => (
              <label 
                key={lang.code}
                className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all ${
                  state.language === lang.code 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <input 
                  type="radio" 
                  name="language" 
                  value={lang.code}
                  checked={state.language === lang.code}
                  onChange={(e) => dispatch({ type: 'SET_LANGUAGE', payload: e.target.value })}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <span className="text-2xl ml-4 mr-3">{lang.flag}</span>
                <span className="font-medium text-gray-900">{lang.name}</span>
              </label>
            ))}
          </div>
        </CardContent>
      </Card>
      
      <p className="text-sm text-gray-500">
        Changes will be saved automatically and applied immediately across the application.
      </p>
    </div>
  );
}
