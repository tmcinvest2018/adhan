import React from 'react';
import { PrayerTimeDisplay, PrayerKey } from '../types';
import { format } from 'date-fns';
import { Bell, BellOff, Sun, Moon, CloudSun, Sunset, Info } from 'lucide-react';

interface Props {
  prayer: PrayerTimeDisplay;
  t: any;
  locale: any;
  onInfoClick?: (key: PrayerKey) => void;
}

const getIcon = (key: string) => {
    switch(key) {
        case 'fajr': return <Moon className="w-5 h-5" />;
        case 'sunrise': return <Sun className="w-5 h-5" />;
        case 'dhuhr': return <Sun className="w-5 h-5" />;
        case 'asr': return <CloudSun className="w-5 h-5" />;
        case 'maghrib': return <Sunset className="w-5 h-5" />;
        case 'isha': return <Moon className="w-5 h-5" />;
        default: return <Sun className="w-5 h-5" />;
    }
}

export const PrayerCard: React.FC<Props> = ({ prayer, t, locale, onInfoClick }) => {
  // Reduced padding (p-3), margin (mb-2) for compactness
  const baseClasses = "flex items-center justify-between p-3 mb-2 rounded-2xl transition-all duration-300";
  const activeClasses = "bg-emerald-600 text-white shadow-lg shadow-emerald-200 transform scale-[1.01]"; // Reduced scale slightly
  const nextClasses = "bg-emerald-100 border-2 border-emerald-500 text-emerald-900";
  const normalClasses = "bg-white text-gray-700 shadow-sm border border-gray-100 hover:bg-gray-50";

  let className = baseClasses;
  if (prayer.isCurrent) {
    className += ` ${activeClasses}`;
  } else if (prayer.isNext) {
    className += ` ${nextClasses}`;
  } else {
    className += ` ${normalClasses}`;
  }

  return (
    <div className={className}>
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-full ${prayer.isCurrent ? 'bg-white/20' : 'bg-emerald-50 text-emerald-600'}`}>
            {getIcon(prayer.originalKey)}
        </div>
        <div>
          <div className="flex items-center gap-2">
            {/* Reduced font size to text-base */}
            <h3 className="font-semibold text-base">{prayer.name}</h3>
            {onInfoClick && (
                <button 
                    onClick={(e) => { e.stopPropagation(); onInfoClick(prayer.originalKey); }}
                    className={`p-1 rounded-full hover:bg-black/10 transition-colors ${prayer.isCurrent ? 'text-white/80' : 'text-gray-400 hover:text-emerald-600'}`}
                >
                    <Info size={14} />
                </button>
            )}
          </div>
          {prayer.isNext && <span className="text-[10px] font-medium uppercase tracking-wider opacity-80">{t.status.next}</span>}
          {prayer.isCurrent && <span className="text-[10px] font-medium uppercase tracking-wider opacity-80">{t.status.current}</span>}
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        {/* Reduced time font size to text-xl */}
        <span className="text-xl font-bold tracking-tight">
            {format(prayer.time, 'HH:mm', { locale })}
        </span>
        <button className={`opacity-80 hover:opacity-100 ${prayer.isCurrent ? 'text-white' : 'text-gray-400'}`}>
             {prayer.originalKey === 'sunrise' ? <BellOff size={16} /> : <Bell size={16} />}
        </button>
      </div>
    </div>
  );
};