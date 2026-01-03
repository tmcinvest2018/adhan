
import React, { useState, useEffect } from 'react';
import { AppSettings, CalculationMethod, Madhab, PrayerKey } from '../types';
import { METHOD_LABELS, LANGUAGES, ADHAN_SOUNDS } from '../constants';
import { LocationService } from '../services/locationService';
import { X, Save, Bell, BellOff, Volume2, VolumeX, PlayCircle, MapPin, Search, Loader2, Globe, Navigation, AlertCircle } from 'lucide-react';
import { translations } from '../services/translations';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSave: (newSettings: AppSettings) => void;
}

export const SettingsModal: React.FC<Props> = ({ isOpen, onClose, settings, onSave }) => {
  const [localSettings, setLocalSettings] = useState<AppSettings>(settings);
  const [activeSection, setActiveSection] = useState<'general' | 'notifications' | 'quran'>('general');
  const [cityInput, setCityInput] = useState(settings.manualLocationName || '');
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);
  
  const t = translations[localSettings.language] || translations['en'];

  useEffect(() => {
    setLocalSettings(settings);
    setCityInput(settings.manualLocationName || '');
  }, [settings, isOpen]);

  const handleResolveCity = async () => {
      if (!cityInput.trim()) return;
      setIsGeocoding(true);
      setGeoError(null);
      const result = await LocationService.geocode(cityInput);
      if (result) {
          setLocalSettings(prev => ({
              ...prev,
              useGPS: false,
              manualLocationName: result.name,
              manualCoordinates: { latitude: result.lat, longitude: result.lng }
          }));
          setCityInput(result.name);
      } else {
          setGeoError("Stad niet gevonden.");
      }
      setIsGeocoding(false);
  };

  const togglePrayerNotif = (key: PrayerKey) => {
    setLocalSettings(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: { ...prev.notifications[key], enabled: !prev.notifications[key].enabled }
      }
    }));
  };

  const togglePrayerSound = (key: PrayerKey) => {
    setLocalSettings(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: { ...prev.notifications[key], soundEnabled: !prev.notifications[key].soundEnabled }
      }
    }));
  };

  const changePrayerSound = (key: PrayerKey, soundId: string) => {
    setLocalSettings(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: { ...prev.notifications[key], soundId }
      }
    }));
  };

  const playSound = (soundId: string) => {
    const url = ADHAN_SOUNDS[soundId]?.url;
    if (url) new Audio(url).play();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl animate-in slide-in-from-bottom-10 duration-300 max-h-[90vh] flex flex-col overflow-hidden">
        
        <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-white">
          <h2 className="text-2xl font-bold text-gray-800">{t.settings.title}</h2>
          <button onClick={onClose} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"><X size={20} className="text-gray-600" /></button>
        </div>

        <div className="flex px-6 pt-4 gap-4 bg-white border-b border-gray-100 overflow-x-auto no-scrollbar">
            <button onClick={() => setActiveSection('general')} className={`pb-2 border-b-2 font-bold text-sm transition-all whitespace-nowrap ${activeSection === 'general' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-gray-400'}`}>Algemeen</button>
            <button onClick={() => setActiveSection('notifications')} className={`pb-2 border-b-2 font-bold text-sm transition-all whitespace-nowrap ${activeSection === 'notifications' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-gray-400'}`}>Meldingen</button>
            <button onClick={() => setActiveSection('quran')} className={`pb-2 border-b-2 font-bold text-sm transition-all whitespace-nowrap ${activeSection === 'quran' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-gray-400'}`}>Koran</button>
        </div>

        <div className="p-6 overflow-y-auto no-scrollbar flex-1 bg-gray-50/50">
            {activeSection === 'general' && (
                <div className="space-y-6">
                    {/* Location Header */}
                    <div className="bg-gradient-to-br from-emerald-800 to-teal-900 text-white p-5 rounded-2xl shadow-sm mb-2">
                        <div className="flex items-center gap-3 mb-2">
                            <MapPin size={20} className="text-emerald-400" />
                            <h3 className="font-bold">Locatie Instellingen</h3>
                        </div>
                        <p className="text-xs text-emerald-100/70 mb-3">Huidige bron: <span className="font-bold text-white">{localSettings.useGPS ? "GPS (Auto)" : "Handmatig"}</span></p>
                        <div className="flex gap-2">
                            <button 
                                onClick={() => setLocalSettings({...localSettings, useGPS: true})} 
                                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${localSettings.useGPS ? 'bg-emerald-500 text-white shadow-md' : 'bg-white/10 text-emerald-200'}`}
                            >
                                <Navigation size={14} className="inline mr-1" /> GPS
                            </button>
                            <button 
                                onClick={() => setLocalSettings({...localSettings, useGPS: false})} 
                                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${!localSettings.useGPS ? 'bg-emerald-500 text-white shadow-md' : 'bg-white/10 text-emerald-200'}`}
                            >
                                <Search size={14} className="inline mr-1" /> Handmatig
                            </button>
                        </div>
                    </div>

                    {/* Manual Location Input */}
                    {!localSettings.useGPS && (
                        <div className="animate-in slide-in-from-top-2 duration-300">
                             <label className="block text-[10px] font-black text-gray-400 mb-2 uppercase tracking-widest">Zoek Stad</label>
                             <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <input 
                                        type="text" 
                                        value={cityInput}
                                        onChange={(e) => setCityInput(e.target.value)}
                                        placeholder="Bijv. Amsterdam..."
                                        className="w-full p-4 bg-white rounded-2xl border border-gray-100 shadow-sm font-medium pr-12"
                                    />
                                    {isGeocoding && <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-500 animate-spin" size={20} />}
                                </div>
                                <button 
                                    onClick={handleResolveCity}
                                    className="p-4 bg-emerald-600 text-white rounded-2xl hover:bg-emerald-700 transition-all shadow-md"
                                >
                                    <Search size={20} />
                                </button>
                             </div>
                             {geoError && <p className="text-[10px] text-red-500 mt-2 font-bold flex items-center gap-1"><AlertCircle size={10} /> {geoError}</p>}
                             {localSettings.manualLocationName && !localSettings.useGPS && (
                                 <div className="mt-3 p-3 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center gap-3">
                                     <div className="p-2 bg-white rounded-lg text-emerald-600 shadow-sm"><Check size={16} /></div>
                                     <div>
                                         <p className="text-[10px] uppercase font-black text-emerald-600">Geselecteerd</p>
                                         <p className="text-sm font-bold text-gray-800 line-clamp-1">{localSettings.manualLocationName}</p>
                                     </div>
                                 </div>
                             )}
                        </div>
                    )}

                    <div>
                        <label className="block text-xs font-black text-gray-400 mb-2 uppercase tracking-widest">{t.settings.language}</label>
                        <select value={localSettings.language} onChange={(e) => setLocalSettings({...localSettings, language: e.target.value})} className="w-full p-4 bg-white rounded-2xl border border-gray-100 shadow-sm font-bold">
                            {Object.entries(LANGUAGES).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-black text-gray-400 mb-2 uppercase tracking-widest">{t.settings.method}</label>
                        <select value={localSettings.method} onChange={(e) => setLocalSettings({...localSettings, method: e.target.value as CalculationMethod})} className="w-full p-4 bg-white rounded-2xl border border-gray-100 shadow-sm font-bold">
                            {Object.entries(METHOD_LABELS).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-black text-gray-400 mb-2 uppercase tracking-widest">{t.settings.madhab}</label>
                        <div className="grid grid-cols-2 gap-3">
                            <button onClick={() => setLocalSettings({...localSettings, madhab: Madhab.SHAFI})} className={`p-4 rounded-2xl font-bold transition-all ${localSettings.madhab === Madhab.SHAFI ? 'bg-emerald-600 text-white' : 'bg-white text-gray-600 border border-gray-100'}`}>{t.settings.standard}</button>
                            <button onClick={() => setLocalSettings({...localSettings, madhab: Madhab.HANAFI})} className={`p-4 rounded-2xl font-bold transition-all ${localSettings.madhab === Madhab.HANAFI ? 'bg-emerald-600 text-white' : 'bg-white text-gray-600 border border-gray-100'}`}>{t.settings.hanafi}</button>
                        </div>
                    </div>
                </div>
            )}
            
            {activeSection === 'notifications' && (
                <div className="space-y-4">
                     {(['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'] as PrayerKey[]).map((key) => {
                         const config = localSettings.notifications?.[key] || { enabled: true, soundEnabled: true, soundId: 'makkah' };
                         return (
                             <div key={key} className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 flex flex-col gap-4">
                                 <div className="flex items-center justify-between">
                                     <span className="font-black text-gray-800 capitalize">{t.prayers[key]}</span>
                                     <div className="flex gap-2">
                                        <button onClick={() => togglePrayerSound(key)} className={`p-2.5 rounded-xl ${config.soundEnabled ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-400'}`}>{config.soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}</button>
                                        <button onClick={() => togglePrayerNotif(key)} className={`p-2.5 rounded-xl ${config.enabled ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-400'}`}>{config.enabled ? <Bell size={20} /> : <BellOff size={20} />}</button>
                                     </div>
                                 </div>
                                 {config.enabled && config.soundEnabled && (
                                     <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-2xl">
                                        <select value={config.soundId} onChange={(e) => changePrayerSound(key, e.target.value)} className="flex-1 bg-transparent text-sm font-bold p-2 border-none">
                                            {Object.entries(ADHAN_SOUNDS).map(([id, sound]) => <option key={id} value={id}>{sound.label}</option>)}
                                        </select>
                                        <button onClick={() => playSound(config.soundId)} className="bg-white p-2 text-emerald-600 rounded-xl shadow-sm"><PlayCircle size={22} /></button>
                                     </div>
                                 )}
                             </div>
                         );
                     })}
                </div>
            )}

            {activeSection === 'quran' && (
                <div className="space-y-6">
                    <div className="bg-emerald-900 p-8 rounded-[2.5rem] text-center text-white text-3xl font-arabic" dir="rtl">بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ</div>
                    <div>
                        <label className="block text-xs font-black text-gray-400 mb-2 uppercase">{t.settings.fontSize}: {localSettings.quranVisuals.fontSize}px</label>
                        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
                            <input type="range" min="20" max="50" step="2" value={localSettings.quranVisuals.fontSize} onChange={(e) => setLocalSettings({ ...localSettings, quranVisuals: { ...localSettings.quranVisuals, fontSize: Number(e.target.value) } })} className="flex-1 accent-emerald-600 h-1.5 bg-gray-100 rounded-full appearance-none cursor-pointer" />
                        </div>
                    </div>
                </div>
            )}
        </div>

        <div className="p-6 bg-white border-t border-gray-100">
            <button onClick={() => { onSave(localSettings); onClose(); }} className="w-full bg-emerald-600 text-white py-4.5 rounded-2xl font-black text-lg shadow-lg flex items-center justify-center gap-2"><Save size={20} /> Instellingen Opslaan</button>
        </div>
      </div>
    </div>
  );
};

const Check = ({ size }: { size: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
);
