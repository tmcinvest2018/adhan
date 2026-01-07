// app/debug-page.tsx
'use client';

import { useState, useEffect } from 'react';
import { AppSettings, UserCoordinates } from '@/types';
import { DEFAULT_SETTINGS } from '@/constants';
import { translations } from '@/services/translations';

export default function DebugApp() {
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

  return (
    <div className="min-h-screen flex flex-col bg-[#f0fdf4] ltr overflow-hidden w-full" dir={'ltr'}>
      <div className="flex-none bg-[#f0fdf4] z-10 w-full shadow-sm border-b border-emerald-50/50">
          <div className="px-4 py-3 flex justify-between items-center max-w-lg mx-auto w-full">
            <div className="flex flex-col">
                <span className="text-sm font-bold text-gray-800 leading-tight">
                    {new Date().toLocaleDateString(settings.language, { weekday: 'short', day: 'numeric', month: 'long' })}
                </span>
                <span className="text-xs text-emerald-600 font-medium leading-tight opacity-90">
                    Debug Mode - Loading...
                </span>
            </div>
          </div>
      </div>

      <main className="flex-1 w-full max-w-lg mx-auto relative flex flex-col min-h-0 px-4 pt-3 pb-24">
        <div className="flex flex-col items-center justify-center h-full">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Debug Page</h1>
          <p className="text-gray-600 mb-2">Settings loaded: {settings ? 'Yes' : 'No'}</p>
          <p className="text-gray-600 mb-2">Coordinates: {coords ? `${coords.latitude}, ${coords.longitude}` : 'None'}</p>
          <p className="text-gray-600 mb-2">Loading: {loadingLoc ? 'Yes' : 'No'}</p>
          <p className="text-gray-600 mb-4">Language: {settings.language}</p>
          
          <div className="bg-gray-100 p-4 rounded-lg">
            <h2 className="font-bold mb-2">Translations:</h2>
            <pre className="text-xs">{JSON.stringify({
              prayers: t.prayers,
              nav: t.nav,
              status: t.status
            }, null, 2)}</pre>
          </div>
        </div>
      </main>
    </div>
  );
}