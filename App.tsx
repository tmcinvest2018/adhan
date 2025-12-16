
import React, { useState, useEffect } from 'react';
import { AppSettings, UserCoordinates, PrayerKey, QuranContext } from './types';
import { DEFAULT_SETTINGS } from './constants';
import { usePrayerTimes } from './hooks/usePrayerTimes';
import { useNotifications } from './hooks/useNotifications';
import { calculateQiblaDirection, calculateDistanceToKaaba } from './services/geoService';
import { PrayerCard } from './components/PrayerCard';
import { SettingsModal } from './components/SettingsModal';
import { QuranModule } from './components/QuranModule';
import { IlmHubModule } from './components/IlmHubModule'; 
import { TrackerModule } from './components/TrackerModule';
import { QiblaCompass } from './components/QiblaCompass'; 
import { PrayerDetailModal } from './components/PrayerDetailModal';
import { Onboarding } from './components/Onboarding';
import { Compass, Clock, Settings as SettingsIcon, MapPin, Loader2, AlertTriangle, Hourglass, GraduationCap, ArrowLeft, BarChart3 } from 'lucide-react';
import { translations } from './services/translations';
import { nl, enUS, ar, tr, fr, de, id, es, ru } from 'date-fns/locale';

const LOCALE_MAP: Record<string, any> = {
  nl, en: enUS, ar, tr, fr, de, id, es, ru, ur: ar 
};

const ISLAMIC_MONTHS_NL = [
  "Muharram", "Safar", "Rabi' al-Awwal", "Rabi' al-Thani",
  "Djoemada al-Awwal", "Djoemada al-Thani", "Radjab", "Sha'ban",
  "Ramadan", "Shawwal", "Dhoe al-Qi'dah", "Dhoe al-Hijjah"
];

const ISLAMIC_MONTHS_EN = [
  "Muharram", "Safar", "Rabi' al-Awwal", "Rabi' al-Thani",
  "Jumada al-Awwal", "Jumada al-Thani", "Rajab", "Sha'ban",
  "Ramadan", "Shawwal", "Dhu al-Qi'dah", "Dhu al-Hijjah"
];

export default function App() {
  const [activeTab, setActiveTab] = useState<'prayers' | 'qibla' | 'ilmhub' | 'quran' | 'tracker'>('prayers');
  
  // Settings & Storage
  const [settings, setSettings] = useState<AppSettings>(() => {
      const saved = localStorage.getItem('nur-settings');
      let parsed = saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
      if (!parsed.notifications) {
          parsed = { ...parsed, notifications: DEFAULT_SETTINGS.notifications };
      }
      if (!parsed.reciterId) {
          parsed = { ...parsed, reciterId: DEFAULT_SETTINGS.reciterId };
      }
      return parsed;
  });

  const [onboarded, setOnboarded] = useState(() => localStorage.getItem('nurprayer_onboarded') === 'true');

  const [coords, setCoords] = useState<UserCoordinates | null>(null);
  const [loadingLoc, setLoadingLoc] = useState(false);
  const [errorLoc, setErrorLoc] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [timeLeft, setTimeLeft] = useState('');
  
  const [selectedPrayerInfo, setSelectedPrayerInfo] = useState<PrayerKey | null>(null);
  const [quranContext, setQuranContext] = useState<QuranContext | null>(null);

  const t = translations[settings.language] || translations['en'];
  const isRtl = ['ar', 'ur'].includes(settings.language);
  const dateLocale = LOCALE_MAP[settings.language] || enUS;

  const { prayerTimes, formattedPrayers, nextPrayer } = usePrayerTimes(settings, coords);
  
  useNotifications(prayerTimes, settings);

  useEffect(() => {
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
    document.documentElement.lang = settings.language;
  }, [isRtl, settings.language]);

  useEffect(() => {
    // Only fetch GPS if onboarded or settings demand it
    if (onboarded && settings.useGPS) {
        setLoadingLoc(true);
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setCoords({
                    latitude: pos.coords.latitude,
                    longitude: pos.coords.longitude
                });
                setLoadingLoc(false);
                setErrorLoc(null);
            },
            (err) => {
                console.error(err);
                setErrorLoc(t.errors.location);
                setLoadingLoc(false);
            }
        );
    }
  }, [settings.useGPS, onboarded]);

  useEffect(() => {
    if (!nextPrayer) {
        setTimeLeft('');
        return;
    }
    const interval = setInterval(() => {
        const now = new Date();
        const diff = nextPrayer.time.getTime() - now.getTime();
        if (diff <= 0) {
            setTimeLeft('00:00:00');
        } else {
            const h = Math.floor(diff / 3600000);
            const m = Math.floor((diff % 3600000) / 60000);
            const s = Math.floor((diff % 60000) / 1000);
            setTimeLeft(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`);
        }
    }, 1000);
    return () => clearInterval(interval);
  }, [nextPrayer]);

  const handleSaveSettings = (newSettings: AppSettings) => {
      setSettings(newSettings);
      localStorage.setItem('nur-settings', JSON.stringify(newSettings));
  };

  const completeOnboarding = () => {
      localStorage.setItem('nurprayer_onboarded', 'true');
      setOnboarded(true);
  };

  const getHijriDate = () => {
    try {
        if (settings.language === 'ar' || settings.language === 'ur') {
            return new Intl.DateTimeFormat(settings.language + '-u-ca-islamic-umalqura', {
                day: 'numeric', month: 'long', year: 'numeric'
            }).format(new Date());
        }
        const parts = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura', {
            day: 'numeric', month: 'numeric', year: 'numeric'
        }).formatToParts(new Date());

        const day = parts.find(p => p.type === 'day')?.value;
        const monthStr = parts.find(p => p.type === 'month')?.value;
        const year = parts.find(p => p.type === 'year')?.value;

        if (day && monthStr && year) {
            const monthIndex = parseInt(monthStr, 10) - 1;
            const months = settings.language === 'nl' ? ISLAMIC_MONTHS_NL : ISLAMIC_MONTHS_EN;
            const cleanYear = year.replace(/\D/g, '');
            return `${day} ${months[monthIndex] || months[0]} ${cleanYear} ${settings.language === 'nl' ? 'Hijri' : 'AH'}`;
        }
        return '';
    } catch (e) { return ''; }
  };

  const renderPrayers = () => (
    <div className="h-full flex flex-col animate-in fade-in duration-500 w-full">
        {/* Top Hero Card */}
        <div className="flex-none bg-gradient-to-br from-emerald-600 to-teal-800 rounded-2xl p-4 text-white shadow-lg shadow-emerald-200/50 mb-3 relative overflow-hidden w-full">
            <div className={`absolute top-0 w-32 h-32 bg-white opacity-5 rounded-full -mt-10 ${isRtl ? 'left-0 -ml-10' : 'right-0 -mr-10'}`} />
            <div className={`absolute bottom-0 w-24 h-24 bg-white opacity-5 rounded-full -mb-10 ${isRtl ? 'right-0 -mr-10' : 'left-0 -ml-10'}`} />
            
            <div className="relative z-10 flex justify-between items-center">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <p className="text-emerald-100 text-[10px] font-bold uppercase tracking-wider">{t.status.nextPrayer}</p>
                         {coords && (
                            <div className="flex items-center text-emerald-200 text-[10px] gap-0.5 opacity-80">
                                <MapPin size={8} />
                                <span>GPS</span>
                            </div>
                        )}
                    </div>
                    <h1 className="text-2xl font-bold leading-none mb-2">{nextPrayer ? nextPrayer.name : t.status.done}</h1>
                    {nextPrayer && timeLeft && (
                        <div className="flex items-center gap-1.5 text-emerald-50 bg-black/10 w-fit px-2 py-0.5 rounded-lg backdrop-blur-sm">
                            <Hourglass size={10} className="animate-pulse" />
                            <span className="font-mono font-medium text-xs tracking-wide">{timeLeft}</span>
                        </div>
                    )}
                </div>
                {nextPrayer && (
                    <div className="bg-white/20 backdrop-blur-md px-3 py-2 rounded-xl border border-white/10 shadow-lg text-center min-w-[80px]">
                         <span className="text-2xl font-bold font-mono tracking-tight leading-none block">
                            {nextPrayer.time.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                         </span>
                    </div>
                )}
            </div>
        </div>

        {/* Prayer List */}
        <div className="flex-1 flex flex-col justify-between min-h-0 pb-1 gap-1 w-full">
            {formattedPrayers.map((p) => (
                <PrayerCard 
                    key={p.originalKey} 
                    prayer={p} 
                    t={t} 
                    locale={dateLocale}
                    onInfoClick={setSelectedPrayerInfo}
                    className="flex-1 w-full" 
                />
            ))}
        </div>
    </div>
  );

  const renderContent = () => {
    if (activeTab === 'prayers') return renderPrayers();
    if (activeTab === 'tracker') return <TrackerModule t={t} />;
    if (activeTab === 'qibla') return <QiblaCompass coords={coords} t={t} />;
    if (activeTab === 'quran') return (
        <div className="h-full flex flex-col w-full">
            <button onClick={() => setActiveTab('ilmhub')} className="flex items-center gap-2 p-2 text-gray-500 hover:text-emerald-600 font-medium">
                <ArrowLeft size={20} /> Back to IlmHub
            </button>
            <div className="flex-1 overflow-hidden w-full">
                <QuranModule 
                    t={t} 
                    language={settings.language} 
                    reciterId={settings.reciterId}
                    initialContext={quranContext} 
                />
            </div>
        </div>
    );
    if (activeTab === 'ilmhub') return (
        <div className="h-full overflow-y-auto no-scrollbar w-full">
            <IlmHubModule 
                t={t} 
                language={settings.language} 
                onNavigateToQuran={(ctx) => {
                    setQuranContext(ctx);
                    setActiveTab('quran');
                }}
                onNavigateToTab={() => {}}
            />
        </div>
    );
    return null;
  }

  // ONBOARDING INTERCEPT
  if (!onboarded) {
      return (
          <Onboarding 
            t={t} 
            settings={settings}
            onComplete={completeOnboarding}
            onUpdateSettings={(s) => setSettings(prev => ({ ...prev, ...s }))}
            onUpdateLocation={(c) => setCoords(c)}
          />
      );
  }

  return (
    <div className={`h-screen flex flex-col bg-[#f0fdf4] ${isRtl ? 'rtl' : 'ltr'} overflow-hidden w-full`} dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex-none bg-[#f0fdf4] z-10 w-full shadow-sm border-b border-emerald-50/50">
          <div className="px-4 py-3 flex justify-between items-center max-w-lg mx-auto w-full">
            <div className="flex flex-col">
                <span className="text-sm font-bold text-gray-800 leading-tight">
                    {new Date().toLocaleDateString(settings.language, { weekday: 'short', day: 'numeric', month: 'long' })}
                </span>
                <span className="text-xs text-emerald-600 font-medium leading-tight opacity-90">
                    {getHijriDate()}
                </span>
            </div>
            <button 
                onClick={() => setIsSettingsOpen(true)}
                className="p-2 bg-white rounded-full shadow-sm text-gray-500 hover:text-emerald-600 transition-colors border border-gray-100"
            >
                <SettingsIcon size={20} />
            </button>
          </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-lg mx-auto relative flex flex-col min-h-0 px-4 pt-3">
         {loadingLoc && !coords && activeTab === 'prayers' ? (
             <div className="flex flex-col items-center justify-center h-full text-emerald-600">
                 <Loader2 size={32} className="animate-spin mb-4" />
                 <p className="font-medium">Locatie bepalen...</p>
             </div>
         ) : (
            renderContent()
         )}
      </main>

      {/* Bottom Navigation */}
      <div className="flex-none p-4 pb-safe-area-bottom w-full max-w-lg mx-auto bg-[#f0fdf4] z-20">
        <div className="bg-white/90 backdrop-blur-md border border-gray-200/50 rounded-2xl shadow-xl shadow-gray-200/50 p-1.5 flex justify-between">
            <button 
                onClick={() => setActiveTab('prayers')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all duration-300 ${activeTab === 'prayers' ? 'bg-emerald-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-100'}`}
            >
                <Clock size={20} />
                <span className="font-medium text-xs sm:text-sm hidden sm:inline">{t.tabs.prayers}</span>
            </button>

            <button 
                onClick={() => setActiveTab('tracker')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all duration-300 ${activeTab === 'tracker' ? 'bg-emerald-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-100'}`}
            >
                <BarChart3 size={20} />
                <span className="font-medium text-xs sm:text-sm hidden sm:inline">{t.tabs.tracker}</span>
            </button>
            
            <button 
                onClick={() => setActiveTab('ilmhub')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all duration-300 ${activeTab === 'ilmhub' ? 'bg-emerald-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-100'}`}
            >
                <GraduationCap size={20} />
                <span className="font-medium text-xs sm:text-sm hidden sm:inline">{t.ilmhub.title.split(' ')[0]}</span>
            </button>
            
            <button 
                onClick={() => setActiveTab('qibla')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all duration-300 ${activeTab === 'qibla' ? 'bg-emerald-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-100'}`}
            >
                <Compass size={20} />
                <span className="font-medium text-xs sm:text-sm hidden sm:inline">{t.tabs.qibla}</span>
            </button>
        </div>
      </div>

      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSave={handleSaveSettings}
      />
      
      <PrayerDetailModal 
        prayerKey={selectedPrayerInfo}
        onClose={() => setSelectedPrayerInfo(null)}
        t={t}
      />
    </div>
  );
}
