import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { useSettings } from '../../context/SettingsContext';
import { CheckCircle2, Globe2 } from 'lucide-react';
import { useTranslation } from '../../context/LanguageContext';

export function LanguageSettings() {
  const { state, dispatch, saveStatus } = useSettings();
  const { t } = useTranslation();

  const languages = [
    { 
      code: 'en', 
      name: 'English', 
      nativeName: 'English (US & India)', 
      flag: '🌐',
      description: 'Standard English interface and labels' 
    },
    { 
      code: 'hi', 
      name: 'Hindi', 
      nativeName: 'हिंदी (Hindi)', 
      flag: '🇮🇳',
      description: 'नगरपालिका और नागरिक सेवाओं के लिए पूर्ण हिंदी इंटरफ़ेस' 
    },
    { 
      code: 'hinglish', 
      name: 'Hinglish', 
      nativeName: 'Hinglish (Colloquial)', 
      flag: '💬',
      description: 'Everyday conversational Hindi in Latin script' 
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Language & Region</h1>
          <p className="text-gray-500 mt-1">Select your preferred display and voice transcription language.</p>
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
          <CardTitle className="flex items-center gap-2">
            <Globe2 size={18} className="text-blue-600" />
            <span>Display Language</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {languages.map((lang) => {
              const isSelected = state.language === lang.code;

              return (
                <label 
                  key={lang.code}
                  className={`flex items-start p-4 border rounded-xl cursor-pointer transition-all duration-150 ${
                    isSelected 
                      ? 'border-blue-500 bg-blue-50/50 shadow-xs ring-1 ring-blue-500' 
                      : 'border-gray-200 hover:bg-gray-50/70 hover:border-gray-300'
                  }`}
                >
                  <input 
                    type="radio" 
                    name="language" 
                    value={lang.code}
                    checked={isSelected}
                    onChange={(e) => dispatch({ type: 'SET_LANGUAGE', payload: e.target.value })}
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 mt-1"
                  />
                  <div className="text-2xl ml-3.5 mr-3">{lang.flag}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-sm text-gray-900">{lang.nativeName}</span>
                      {isSelected && (
                        <CheckCircle2 size={16} className="text-blue-600" />
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">{lang.description}</p>
                  </div>
                </label>
              );
            })}
          </div>
        </CardContent>
      </Card>
      
      <p className="text-xs text-gray-500 leading-relaxed px-1">
        Language changes apply immediately across sidebar menus, headers, settings, and modal dialogues. Voice intake will also adapt speech recognition to the selected language tag.
      </p>
    </div>
  );
}
