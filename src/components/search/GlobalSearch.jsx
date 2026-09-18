import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Loader2, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { searchService } from '../../services/searchService';
import { useSettings } from '../../context/SettingsContext';
import { Badge } from '../ui/Badge';

export function GlobalSearch() {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState({});
  const inputRef = useRef(null);
  const containerRef = useRef(null);
  const { state, dispatch } = useSettings();
  const navigate = useNavigate();

  // Keyboard shortcut (Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.addEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search
  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setResults({});
      setIsLoading(false);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      if (!state.search.suggest) return; // Respect suggestion preference
      setIsLoading(true);
      try {
        const res = await searchService.search(query, state.search.defaultScope);
        setResults(res);
      } catch (error) {
        console.error("Search failed", error);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [query, state.search.defaultScope, state.search.suggest]);

  const handleSelect = (item) => {
    // Add to recent searches
    if (state.search.recent) {
      dispatch({ type: 'ADD_RECENT_SEARCH', payload: { query: item.title, id: item.id, route: item.route } });
    }
    setIsOpen(false);
    setQuery('');
    const targetRoute = item.route.startsWith('/dashboard') 
      ? item.route 
      : (item.route.startsWith('/') ? `/dashboard${item.route}` : `/dashboard/${item.route}`);
    navigate(targetRoute);
  };

  const hasResults = Object.keys(results).length > 0;

  return (
    <div className="relative w-full" ref={containerRef}>
      <div className="relative w-full flex items-center">
        <Search className="absolute left-3 text-gray-400" size={18} />
        <input 
          ref={inputRef}
          type="text" 
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              if (hasResults && isOpen) {
                const firstCategory = Object.keys(results)[0];
                if (results[firstCategory] && results[firstCategory].length > 0) {
                  handleSelect(results[firstCategory][0]);
                  return;
                }
              }
              if (query.trim()) {
                setIsOpen(false);
                navigate(`/dashboard/complaints?q=${encodeURIComponent(query.trim())}`);
              }
            } else if (e.key === 'Escape') {
              setIsOpen(false);
            }
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Search complaints, wards... (Ctrl+K)" 
          className="w-full h-10 pl-10 pr-12 rounded-lg bg-gray-100 border border-transparent focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none text-sm transition-all"
        />
        <div className="absolute right-3 flex items-center gap-1">
          {isLoading && <Loader2 className="animate-spin text-gray-400" size={16} />}
          {!isLoading && query && (
            <button onClick={() => setQuery('')} className="text-gray-400 hover:text-gray-600">
              <X size={16} />
            </button>
          )}
          {!query && <span className="text-[10px] text-gray-400 font-semibold border border-gray-200 rounded px-1.5 py-0.5">Ctrl K</span>}
        </div>
      </div>

      {/* Dropdown */}
      {isOpen && (query.trim().length >= 2 || (state.search.recent && state.recentSearches.length > 0)) && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200 max-h-[80vh] flex flex-col">
          <div className="overflow-y-auto p-2 space-y-4">
            
            {!query && state.search.recent && state.recentSearches.length > 0 && (
              <div className="px-2 pt-2">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Recent Searches</h3>
                <div className="space-y-1">
                  {state.recentSearches.map((recent, idx) => (
                    <button 
                      key={idx} 
                      onClick={() => handleSelect(recent)}
                      className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md flex justify-between items-center group transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <Search size={14} className="text-gray-400" />
                        {recent.query}
                      </span>
                      <ArrowRight size={14} className="text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {query && !isLoading && !hasResults && (
              <div className="p-8 text-center text-gray-500 text-sm">
                No results found for "{query}"
              </div>
            )}

            {hasResults && Object.entries(results).map(([type, items]) => (
              <div key={type} className="px-2">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 mt-2 capitalize">{type}s</h3>
                <div className="space-y-1">
                  {items.map(item => (
                    <button 
                      key={item.id} 
                      onClick={() => handleSelect(item)}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-blue-50 focus:bg-blue-50 focus:outline-none transition-colors group flex items-start gap-3"
                    >
                      <div className="p-2 bg-gray-100 rounded-md group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors shrink-0">
                        {type === 'complaint' && <Search size={16} />}
                        {type === 'cluster' && <Search size={16} />}
                        {type === 'setting' && <Search size={16} />}
                        {(type === 'locality' || type === 'department') && <Search size={16} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 justify-between">
                          <div className="font-medium text-gray-900 text-sm truncate">{item.title}</div>
                          <Badge variant="outline" className="text-[10px]">{item.id}</Badge>
                        </div>
                        <div className="text-xs text-gray-500 truncate mt-0.5">{item.description}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
          
          <div className="bg-gray-50 p-3 border-t border-gray-100 flex justify-between items-center text-xs text-gray-500">
            <span>Press <kbd className="bg-white border rounded px-1">Esc</kbd> to close</span>
            <span>Search in: <span className="font-semibold capitalize">{state.search.defaultScope}</span></span>
          </div>
        </div>
      )}
    </div>
  );
}
