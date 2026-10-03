import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Loader2, ArrowRight, Settings, Inbox, Sparkles, MapPin, Layers, LayoutDashboard, Shield, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { searchService } from '../../services/searchService';
import { useSettings } from '../../context/SettingsContext';
import { Badge } from '../ui/Badge';

export function GlobalSearch({ isMobileExpanded = false, onCloseMobile }) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState({});
  const inputRef = useRef(null);
  const containerRef = useRef(null);
  const { state, dispatch } = useSettings();
  const navigate = useNavigate();

  // Auto-focus when opened on mobile
  useEffect(() => {
    if (isMobileExpanded) {
      inputRef.current?.focus();
      setIsOpen(true);
    }
  }, [isMobileExpanded]);

  // Keyboard shortcut (Ctrl+K / Cmd+K)
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
        if (onCloseMobile) onCloseMobile();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.addEventListener('mousedown', handleClickOutside);
  }, [onCloseMobile]);

  // Debounced search
  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setResults({});
      setIsLoading(false);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      if (state?.search?.suggest === false) return;
      setIsLoading(true);
      try {
        const scope = state?.search?.defaultScope || 'all';
        const res = await searchService.search(query, scope);
        setResults(res || {});
      } catch (error) {
        console.error("Search failed", error);
      } finally {
        setIsLoading(false);
      }
    }, 250);

    return () => clearTimeout(delayDebounceFn);
  }, [query, state?.search?.defaultScope, state?.search?.suggest]);

  const handleSelect = (item) => {
    if (state?.search?.recent !== false) {
      dispatch({ 
        type: 'ADD_RECENT_SEARCH', 
        payload: { query: item.title, id: item.id, route: item.route } 
      });
    }
    setIsOpen(false);
    setQuery('');
    if (onCloseMobile) onCloseMobile();
    
    const targetRoute = item.route.startsWith('/') 
      ? item.route 
      : `/dashboard/${item.route}`;
    navigate(targetRoute);
  };

  const handleSearchSubmit = (e) => {
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
      if (onCloseMobile) onCloseMobile();
      navigate(`/dashboard/complaints?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const hasResults = Object.keys(results).length > 0 && Object.values(results).some(arr => arr.length > 0);

  const getItemIcon = (type, item) => {
    if (type === 'setting' || item?.id?.startsWith('SET-')) return <Settings size={15} className="text-blue-600" />;
    if (type === 'complaint' || item?.id?.startsWith('CMP-')) return <Inbox size={15} className="text-amber-600" />;
    if (type === 'cluster' || item?.id?.startsWith('CLU-')) return <Layers size={15} className="text-purple-600" />;
    if (item?.route?.includes('map')) return <MapPin size={15} className="text-emerald-600" />;
    return <Sparkles size={15} className="text-indigo-600" />;
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      <form onSubmit={handleSearchSubmit} className="relative w-full flex items-center">
        <Search className="absolute left-3 text-gray-400 pointer-events-none" size={17} />
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
              handleSearchSubmit(e);
            } else if (e.key === 'Escape') {
              setIsOpen(false);
              if (onCloseMobile) onCloseMobile();
            }
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Search complaints, wards, settings... (Ctrl+K)" 
          className="w-full h-10 pl-9 pr-12 rounded-xl bg-gray-100 border border-transparent focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-xs sm:text-sm transition-all"
        />
        <div className="absolute right-3 flex items-center gap-1.5">
          {isLoading && <Loader2 className="animate-spin text-gray-400" size={15} />}
          {!isLoading && query && (
            <button 
              type="button" 
              onClick={() => { setQuery(''); inputRef.current?.focus(); }} 
              className="text-gray-400 hover:text-gray-600 p-0.5 rounded cursor-pointer"
              aria-label="Clear search query"
            >
              <X size={15} />
            </button>
          )}
          {!query && (
            <span className="hidden sm:inline-block text-[10px] text-gray-400 font-semibold border border-gray-200 bg-white rounded px-1.5 py-0.5 shadow-2xs">
              Ctrl K
            </span>
          )}
        </div>
      </form>

      {/* Results Dropdown */}
      {isOpen && (query.trim().length >= 2 || (state.search?.recent && state.recentSearches?.length > 0)) && (
        <div className={isMobileExpanded
          ? "fixed left-3 right-3 top-16 mt-1 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-gray-200/90 dark:border-slate-800 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150 max-h-[75vh] flex flex-col"
          : "absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-gray-200/90 dark:border-slate-800 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150 max-h-[75vh] flex flex-col"
        }>
          <div className="overflow-y-auto p-2.5 space-y-3 divide-y divide-gray-100">
            
            {/* Recent Searches */}
            {!query && state.search?.recent && state.recentSearches?.length > 0 && (
              <div className="px-2 pt-1">
                <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Recent Searches</h3>
                <div className="space-y-1">
                  {state.recentSearches.map((recent, idx) => (
                    <button 
                      key={idx} 
                      type="button"
                      onClick={() => handleSelect(recent)}
                      className="w-full text-left px-3 py-2 text-xs sm:text-sm text-gray-700 hover:bg-gray-50 rounded-lg flex justify-between items-center group transition-colors cursor-pointer"
                    >
                      <span className="flex items-center gap-2 truncate">
                        <Search size={13} className="text-gray-400 shrink-0" />
                        <span className="truncate">{recent.query}</span>
                      </span>
                      <ArrowRight size={13} className="text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {query && !isLoading && !hasResults && (
              <div className="py-10 text-center text-gray-500 text-xs sm:text-sm px-4">
                No matching results found for "<strong className="text-gray-800">{query}</strong>"
              </div>
            )}

            {/* Grouped Results */}
            {hasResults && Object.entries(results).map(([type, items]) => {
              if (!items || items.length === 0) return null;
              return (
                <div key={type} className="px-2 pt-2 first:pt-0">
                  <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                    {type === 'setting' ? 'Settings & Preferences' : `${type}s`}
                  </h3>
                  <div className="space-y-1">
                    {items.map(item => (
                      <button 
                        key={item.id} 
                        type="button"
                        onClick={() => handleSelect(item)}
                        className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-blue-50/80 focus:bg-blue-50/80 focus:outline-none transition-colors group flex items-start gap-3 cursor-pointer"
                      >
                        <div className="p-2 bg-slate-100 rounded-lg group-hover:bg-blue-100/70 transition-colors shrink-0 mt-0.5">
                          {getItemIcon(type, item)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 justify-between">
                            <span className="font-semibold text-gray-900 text-xs sm:text-sm truncate">{item.title}</span>
                            {item.id && (
                              <Badge variant="outline" className="text-[10px] shrink-0 font-mono">
                                {item.id}
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 truncate mt-0.5">{item.description}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Search Footer */}
          <div className="bg-slate-50 p-3 border-t border-gray-100 flex justify-between items-center text-[11px] text-gray-500">
            <span>Press <kbd className="bg-white border border-gray-200 rounded px-1.5 py-0.5 font-mono shadow-2xs">Esc</kbd> to close</span>
            <span className="text-blue-600 font-medium">Instant Navigation</span>
          </div>
        </div>
      )}
    </div>
  );
}
