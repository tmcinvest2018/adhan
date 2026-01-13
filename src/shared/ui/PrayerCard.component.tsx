import React from 'react';
import { PrayerTime } from '../../../types';

interface PrayerCardProps {
  prayer: PrayerTime;
  isSelected?: boolean;
  onClick?: () => void;
}

export const PrayerCard: React.FC<PrayerCardProps> = ({ 
  prayer, 
  isSelected = false, 
  onClick 
}) => {
  return (
    <div 
      className={`p-4 rounded-xl border shadow-sm transition-all duration-200 ${
        isSelected 
          ? 'border-emerald-500 bg-emerald-50 scale-[1.02]' 
          : 'border-gray-200 bg-white hover:bg-gray-50'
      }`}
      onClick={onClick}
    >
      <div className="flex justify-between items-center">
        <h3 className="font-bold text-lg text-gray-800">{prayer.name}</h3>
        {prayer.isNext && (
          <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-1 rounded-full font-medium">
            Next
          </span>
        )}
      </div>
      <p className="text-gray-600 mt-1">
        {prayer.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </p>
      {prayer.isCurrent && (
        <div className="mt-2 text-xs text-emerald-600 font-medium">
          Currently in progress
        </div>
      )}
    </div>
  );
};