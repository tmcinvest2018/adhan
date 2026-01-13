import React, { useState, useEffect } from 'react';
import { PrayerTimesContainer } from './modules/prayer-times/PrayerTimes.container';
import { AIInterfaceContainer } from './modules/ai-interface/AIInterface.container';
import { StateManagerService } from './infrastructure/persistence/StateManager.service';
import { UserLocation, PrayerSettings } from '../types';
import { Clock, GraduationCap, Settings } from 'lucide-react';

const stateManager = new StateManagerService();

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'prayer' | 'ai' | 'settings'>('prayer');
  const [location, setLocation] = useState<UserLocation | null>(null);
  const [settings, setSettings] = useState<PrayerSettings>(stateManager.getDefaultState().settings);
  const [loadingLocation, setLoadingLocation] = useState(true);
  
  useEffect(() => {
    // Load settings from state manager
    const savedState = stateManager.getState();
    if (savedState.settings) {
      setSettings(savedState.settings);
    }
    
    // Get user location
    if (settings.useGPS && navigator.geolocation) {
      setLoadingLocation(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          });
          setLoadingLocation(false);
        },
        (error) => {
          console.error('Error getting location:', error);
          // Fallback to manual coordinates if provided in settings
          if (settings.manualCoordinates) {
            setLocation(settings.manualCoordinates);
          }
          setLoadingLocation(false);
        },
        { enableHighAccuracy: true }
      );
    } else if (settings.manualCoordinates) {
      setLocation(settings.manualCoordinates);
      setLoadingLocation(false);
    }
  }, [settings]);

  const handlePrayerSelect = (prayer: any) => {
    console.log('Selected prayer:', prayer);
  };

  return (
    <div className="h-screen flex flex-col bg-[#f0fdf4] max-w-lg mx-auto">
      <header className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-4 shadow-md">
        <h1 className="text-2xl font-bold text-center">NurPrayer</h1>
        <p className="text-emerald-100 text-center text-sm">Your Islamic Companion</p>
      </header>

      <main className="flex-1 p-4 overflow-y-auto">
        {activeTab === 'prayer' && (
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Clock size={24} className="text-emerald-600" /> Prayer Times
            </h2>
            {loadingLocation ? (
              <div className="text-center py-8 text-gray-500">Getting your location...</div>
            ) : (
              <PrayerTimesContainer 
                location={location} 
                settings={settings} 
                onPrayerSelect={handlePrayerSelect} 
              />
            )}
          </div>
        )}

        {activeTab === 'ai' && (
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <GraduationCap size={24} className="text-emerald-600" /> Al-Noor AI
            </h2>
            <div className="h-[500px]">
              <AIInterfaceContainer />
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Settings size={24} className="text-emerald-600" /> Settings
            </h2>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
              <p className="text-gray-600">Settings interface coming soon...</p>
            </div>
          </div>
        )}
      </main>

      <nav className="bg-white border-t border-gray-200 p-3 flex justify-around">
        <button
          className={`flex flex-col items-center p-2 rounded-lg ${activeTab === 'prayer' ? 'text-emerald-600 bg-emerald-50' : 'text-gray-500'}`}
          onClick={() => setActiveTab('prayer')}
        >
          <Clock size={20} />
          <span className="text-xs mt-1">Prayers</span>
        </button>
        <button
          className={`flex flex-col items-center p-2 rounded-lg ${activeTab === 'ai' ? 'text-emerald-600 bg-emerald-50' : 'text-gray-500'}`}
          onClick={() => setActiveTab('ai')}
        >
          <GraduationCap size={20} />
          <span className="text-xs mt-1">AI</span>
        </button>
        <button
          className={`flex flex-col items-center p-2 rounded-lg ${activeTab === 'settings' ? 'text-emerald-600 bg-emerald-50' : 'text-gray-500'}`}
          onClick={() => setActiveTab('settings')}
        >
          <Settings size={20} />
          <span className="text-xs mt-1">Settings</span>
        </button>
      </nav>
    </div>
  );
};

export default App;