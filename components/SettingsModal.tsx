
import React, { useState } from 'react';
import { AppSettings, CalculationMethod, Madhab, PrayerKey } from '../types';
import { METHOD_LABELS, LANGUAGES, ADHAN_SOUNDS } from '../constants';
import { RECITERS } from '../services/quranService';
import { X, Save, Bell, BellOff, Volume2, VolumeX, PlayCircle } from 'lucide-react';
import { translations } from '../services/translations';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSave: (newSettings: AppSettings) => void;
}

export const SettingsModal: React.FC<Props> = ({ isOpen, onClose, settings, onSave }) => {
  const [localSettings, setLocalSettings] = useState<AppSettings>(settings);
  const [activeSection, setActiveSection] = useState<'general' | 'notifications'>('general');
  const t = translations[localSettings.language] || translations['en'];

  React.useEffect(() => {
    setLocalSettings(settings);
  }, [settings, isOpen]);

  const togglePrayerNotif = (key: PrayerKey) => {
    setLocalSettings(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: {
          ...prev.notifications[key],
          enabled: !prev.notifications[key].enabled
        }
      }
    }));
  };

  const togglePrayerSound = (key: PrayerKey) => {
    setLocalSettings(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: {
          ...prev.notifications[key],
          soundEnabled: !prev.notifications[key].soundEnabled
        }
      }
    }));
  };

  const changePrayerSound = (key: PrayerKey, soundId: string) => {
    setLocalSettings(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: {
          ...prev.notifications[key],
          soundId
        }
      }
    }));
  };

  const playSound = (soundId: string) => {
    const url = ADHAN_SOUNDS[soundId]?.url;
    if (url) {
      const audio = new Audio(url);
      audio.play();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl animate-in slide-in-from-bottom-10 duration-300 max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-white z-10">
          <h2 className="text-2xl font-bold text-gray-800">{t.settings.title}</h2>
          <button onClick={onClose} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
            <X size={20} className="text-gray-600" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex px-6 pt-4 gap-4 bg-white">
            <button 
                onClick={() => setActiveSection('general')}
                className={`pb-2 border-b-2 font-semibold text-sm transition-colors ${activeSection === 'general' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
            >
                {t.settings.title}
            </button>
            <button 
                onClick={() => setActiveSection('notifications')}
                className={`pb-2 border-b-2 font-semibold text-sm transition-colors ${activeSection === 'notifications' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
            >
                {t.settings.notifications}
            </button>
        </div>

        <div className="p-6 overflow-y-auto no-scrollbar flex-1 bg-gray-50/50">
            
            {activeSection === 'general' ? (
                <div className="space-y-6">
                    {/* Language Selection */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                            {t.settings.language}
                        </label>
                        <select 
                            value={localSettings.language}
                            onChange={(e) => setLocalSettings({...localSettings, language: e.target.value})}
                            className="w-full p-4 bg-white rounded-xl border border-gray-100 shadow-sm focus:ring-2 focus:ring-emerald-500 text-gray-800"
                        >
                            {Object.entries(LANGUAGES).map(([key, label]) => (
                                <option key={key} value={key}>{label}</option>
                            ))}
                        </select>
                    </div>

                    {/* Reciter Selection */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                            {t.quran.reciter}
                        </label>
                        <select 
                            value={localSettings.reciterId}
                            onChange={(e) => setLocalSettings({...localSettings, reciterId: e.target.value})}
                            className="w-full p-4 bg-white rounded-xl border border-gray-100 shadow-sm focus:ring-2 focus:ring-emerald-500 text-gray-800"
                        >
                            {RECITERS.map((r) => (
                                <option key={r.id} value={r.id}>{r.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Method Selection */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                            {t.settings.method}
                        </label>
                        <select 
                            value={localSettings.method}
                            onChange={(e) => setLocalSettings({...localSettings, method: e.target.value as CalculationMethod})}
                            className="w-full p-4 bg-white rounded-xl border border-gray-100 shadow-sm focus:ring-2 focus:ring-emerald-500 text-gray-800"
                        >
                            {Object.entries(METHOD_LABELS).map(([key, label]) => (
                                <option key={key} value={key}>{label}</option>
                            ))}
                        </select>
                    </div>

                    {/* Madhab Selection */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                            {t.settings.madhab}
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => setLocalSettings({...localSettings, madhab: Madhab.SHAFI})}
                                className={`p-4 rounded-xl font-medium transition-all ${localSettings.madhab === Madhab.SHAFI ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-100'}`}
                            >
                                {t.settings.standard}
                            </button>
                            <button
                                onClick={() => setLocalSettings({...localSettings, madhab: Madhab.HANAFI})}
                                className={`p-4 rounded-xl font-medium transition-all ${localSettings.madhab === Madhab.HANAFI ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-100'}`}
                            >
                                {t.settings.hanafi}
                            </button>
                        </div>
                    </div>

                    {/* Location Toggle */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                            {t.settings.location}
                        </label>
                        <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
                            <span className="text-gray-700">{t.settings.gps}</span>
                            <button 
                                onClick={() => setLocalSettings({...localSettings, useGPS: !localSettings.useGPS})}
                                className={`w-12 h-7 rounded-full transition-colors relative ${localSettings.useGPS ? 'bg-emerald-500' : 'bg-gray-300'}`}
                            >
                                <div className={`w-5 h-5 bg-white rounded-full absolute top-1 transition-transform ${localSettings.useGPS ? 'ltr:left-6 rtl:right-6' : 'ltr:left-1 rtl:right-1'}`} />
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="space-y-4">
                     {/* Request Permission Button */}
                     {('Notification' in window && Notification.permission !== 'granted') && (
                        <button 
                            onClick={() => Notification.requestPermission()}
                            className="w-full mb-4 p-3 bg-blue-50 text-blue-600 rounded-xl text-sm font-medium hover:bg-blue-100 transition-colors"
                        >
                            {t.settings.enableNotif}
                        </button>
                     )}

                     {(['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'] as PrayerKey[]).map((key) => {
                         const config = localSettings.notifications?.[key] || { enabled: true, soundEnabled: true, soundId: 'makkah' };
                         
                         return (
                             <div key={key} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                                 <div className="flex items-center justify-between mb-3">
                                     <span className="font-bold text-gray-800 capitalize">{t.prayers[key]}</span>
                                     <div className="flex gap-2">
                                        <button 
                                            onClick={() => togglePrayerSound(key)}
                                            className={`p-2 rounded-lg transition-colors ${config.soundEnabled ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-400'}`}
                                        >
                                            {config.soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
                                        </button>
                                        <button 
                                            onClick={() => togglePrayerNotif(key)}
                                            className={`p-2 rounded-lg transition-colors ${config.enabled ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-400'}`}
                                        >
                                            {config.enabled ? <Bell size={18} /> : <BellOff size={18} />}
                                        </button>
                                     </div>
                                 </div>
                                 
                                 {config.enabled && config.soundEnabled && (
                                     <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-50">
                                        <select 
                                            value={config.soundId}
                                            onChange={(e) => changePrayerSound(key, e.target.value)}
                                            className="flex-1 bg-gray-50 text-sm p-2 rounded-lg border-none focus:ring-1 focus:ring-emerald-500"
                                        >
                                            {Object.entries(ADHAN_SOUNDS).map(([id, sound]) => (
                                                <option key={id} value={id}>{sound.label}</option>
                                            ))}
                                        </select>
                                        <button 
                                            onClick={() => playSound(config.soundId)}
                                            className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg"
                                            title={t.settings.testSound}
                                        >
                                            <PlayCircle size={20} />
                                        </button>
                                     </div>
                                 )}
                             </div>
                         );
                     })}
                </div>
            )}
        </div>

        <div className="p-6 bg-white border-t border-gray-100">
            <button 
                onClick={() => {
                    onSave(localSettings);
                    onClose();
                }}
                className="w-full bg-emerald-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-emerald-700 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-200"
            >
                <Save size={20} />
                {t.settings.save}
            </button>
        </div>

      </div>
    </div>
  );
};
