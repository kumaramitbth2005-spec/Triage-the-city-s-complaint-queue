import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useSettings } from '../../context/SettingsContext';

export function SearchSettings() {
  const { state, dispatch } = useSettings();

  const toggleSearchPref = (key) => {
    dispatch({ 
      type: 'UPDATE_SEARCH_PREFS', 
      payload: { [key]: !state.search[key] } 
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Search Preferences</h1>
        <p className="text-gray-500 mt-1">Customize how the global search behaves.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Behavior</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between py-2 border-b border-gray-100">
            <div>
              <div className="font-medium text-gray-700">Search Suggestions</div>
              <div className="text-sm text-gray-500">Show predictive suggestions as you type</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={state.search.suggest} 
                onChange={() => toggleSearchPref('suggest')} 
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between py-2 border-b border-gray-100">
            <div>
              <div className="font-medium text-gray-700">Save Recent Searches</div>
              <div className="text-sm text-gray-500">Remember your past queries for quick access</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={state.search.recent} 
                onChange={() => toggleSearchPref('recent')} 
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between py-2">
            <div>
              <div className="font-medium text-gray-700">Default Search Scope</div>
              <div className="text-sm text-gray-500">Where search looks by default</div>
            </div>
            <select 
              value={state.search.defaultScope}
              onChange={(e) => dispatch({ type: 'UPDATE_SEARCH_PREFS', payload: { defaultScope: e.target.value }})}
              className="form-select w-40 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              <option value="all">Everywhere</option>
              <option value="complaints">Complaints Only</option>
              <option value="clusters">Clusters Only</option>
            </select>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700">Clear Search History</p>
              <p className="text-sm text-gray-500">Remove all previously saved searches ({state.recentSearches.length} items)</p>
            </div>
            <Button 
              variant="outline" 
              onClick={() => dispatch({ type: 'CLEAR_RECENT_SEARCHES' })}
              disabled={state.recentSearches.length === 0}
            >
              Clear History
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
