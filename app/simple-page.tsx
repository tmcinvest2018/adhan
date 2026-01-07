// app/simple-page.tsx
'use client';

import { useState, useEffect } from 'react';
import { AppSettings, UserCoordinates } from '@/types';
import { DEFAULT_SETTINGS } from '@/constants';
import { translations } from '@/services/translations';

export default function SimpleApp() {
  // Settings & Storage
  const [settings, setSettings] = useState<AppSettings>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('nur_settings');
      return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
    }
    return DEFAULT_SETTINGS;
  });

  const [coords, setCoords] = useState<UserCoordinates | null>(null);
  const [loadingLoc, setLoadingLoc] = useState(true);

  // Initialize
  useEffect(() => {
    // Check saved coordinates
    const savedCoords = localStorage.getItem('nur_coords');
    if (savedCoords) {
      try {
        setCoords(JSON.parse(savedCoords));
      } catch (e) {
        console.error('Error parsing saved coordinates:', e);
      }
      setLoadingLoc(false);
    } else if (settings.useGPS) {
      // Try to get location
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const coords = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
            setCoords(coords);
            localStorage.setItem('nur_coords', JSON.stringify(coords));
            setLoadingLoc(false);
          },
          (err) => {
            console.error('Geolocation error:', err);
            // Use manual location if GPS fails
            if (settings.manualCoordinates) {
              setCoords(settings.manualCoordinates);
            }
            setLoadingLoc(false);
          },
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
        );
      } else {
        console.error('Geolocation is not supported');
        setLoadingLoc(false);
      }
    } else if (settings.manualCoordinates) {
      setCoords(settings.manualCoordinates);
      setLoadingLoc(false);
    } else {
      setLoadingLoc(false);
    }
  }, [settings]);

  // Save settings when they change
  useEffect(() => {
    try {
      localStorage.setItem('nur_settings', JSON.stringify(settings));
    } catch (e) {
      console.error('Error saving settings to localStorage:', e);
    }
  }, [settings]);

  // Translation function
  const t = translations[settings.language as keyof typeof translations] || translations.en;

  // Hardcoded prayer times for testing
  const nextPrayer = { name: 'Dhuhr', time: new Date() };
  const formattedPrayers = [
    { name: 'Fajr', time: new Date(), originalKey: 'fajr' },
    { name: 'Dhuhr', time: new Date(), originalKey: 'dhuhr' },
    { name: 'Asr', time: new Date(), originalKey: 'asr' },
    { name: 'Maghrib', time: new Date(), originalKey: 'maghrib' },
    { name: 'Isha', time: new Date(), originalKey: 'isha' }
  ];
  const timeLeft = '1h 30m';

  return (
    <div className="min-h-screen flex flex-col bg-[#f0fdf4] ltr overflow-hidden w-full" dir={'ltr'}>
      <div className="flex-none bg-[#f0fdf4] z-10 w-full shadow-sm border-b border-emerald-50/50">
          <div className="px-4 py-3 flex justify-between items-center max-w-lg mx-auto w-full">
            <div className="flex flex-col">
                <span className="text-sm font-bold text-gray-800 leading-tight">
                    {new Date().toLocaleDateString(settings.language, { weekday: 'short', day: 'numeric', month: 'long' })}
                </span>
                <span className="text-xs text-emerald-600 font-medium leading-tight opacity-90">
                    Simple Test Page
                </span>
            </div>
          </div>
      </div>

      <main className="flex-1 w-full max-w-lg mx-auto relative flex flex-col min-h-0 px-4 pt-3 pb-24">
        {loadingLoc && !coords ? (
          <div className="flex flex-col items-center justify-center flex-1 text-emerald-600">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mb-4"></div>
            <p className="font-medium">Locatie bepalen...</p>
          </div>
        ) : (
          <div className="h-full flex flex-col animate-in fade-in duration-500 w-full">
            <div className="flex-none bg-gradient-to-br from-emerald-600 to-teal-800 rounded-2xl p-4 text-white shadow-lg shadow-emerald-200/50 mb-3 relative overflow-hidden w-full">
              <div className="absolute top-0 w-32 h-32 bg-white opacity-5 rounded-full -mt-10 right-0 -mr-10" />
              <div className="absolute bottom-0 w-24 h-24 bg-white opacity-5 rounded-full -mb-10 left-0 -ml-10" />

              <div className="relative z-10 flex justify-between items-center">
                <div className="flex-1">
                  <div className="flex flex-col gap-0.5 mb-1">
                    <p className="text-emerald-100 text-[10px] font-bold uppercase tracking-wider">{t.status?.nextPrayer || 'Next Prayer'}</p>
                    <div className="flex items-center text-emerald-200 text-[10px] gap-1 opacity-90 font-medium italic">
                      <span className="truncate max-w-[150px]">{settings.useGPS ? "Mijn Locatie (GPS)" : (settings.manualLocationName || "Handmatig")}</span>
                    </div>
                  </div>
                  <h1 className="text-2xl font-bold leading-none mb-2">{nextPrayer ? nextPrayer.name : (t.status?.done || 'Done')}</h1>
                  {nextPrayer && timeLeft && (
                    <div className="flex items-center gap-1.5 text-emerald-50 bg-black/10 w-fit px-2 py-0.5 rounded-lg backdrop-blur-sm">
                      <span className="font-mono font-medium text-xs tracking-wide">{timeLeft}</span>
                    </div>
                  )}
                </div>
                {nextPrayer && (
                  <div className="bg-white/20 backdrop-blur-md px-3 py-2 rounded-xl border border-white/10 shadow-lg text-center min-w-[80px]">
                    <span className="text-2xl font-bold font-mono tracking-tight leading-none block">
                      {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex-1 flex flex-col justify-between min-h-0 pb-1 gap-1 w-full">
              {formattedPrayers.map((p) => (
                <div key={p.originalKey} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-800 capitalize">{p.name}</h3>
                    <p className="text-sm text-gray-500">
                      {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-mono">
                      {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-emerald-100/50 shadow-lg z-20">
        <div className="flex justify-around items-center max-w-lg mx-auto w-full px-2 py-2">
          <button className="flex flex-col items-center gap-1 p-2 rounded-xl text-emerald-600 bg-emerald-50">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
            <span className="text-xs font-medium">{t.nav?.prayers || 'Prayers'}</span>
          </button>
          <button className="flex flex-col items-center gap-1 p-2 rounded-xl text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon>
            </svg>
            <span className="text-xs font-medium">{t.nav?.qibla || 'Qibla'}</span>
          </button>
        </div>
      </nav>
    </div>
  );
}