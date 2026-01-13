import React, { useState, useEffect } from 'react';
import { usePrayerTimes } from '../../shared/hooks/usePrayerTimes.hook';
import { PrayerCard } from '../../shared/ui/PrayerCard.component';
import { UserLocation, PrayerSettings } from '../../../types';
import { Loader2 } from 'lucide-react';

interface PrayerTimesContainerProps {
  location: UserLocation | null;
  settings: PrayerSettings;
  onPrayerSelect: (prayer: any) => void;
}

export const PrayerTimesContainer: React.FC<PrayerTimesContainerProps> = ({
  location,
  settings,
  onPrayerSelect
}) => {
  const { prayerTimes, loading, error } = usePrayerTimes(location, settings);
  const [selectedPrayer, setSelectedPrayer] = useState<string | null>(null);
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="animate-spin text-emerald-600" size={32} />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">
        Error: {error}
      </div>
    );
  }
  
  return (
    <div className="space-y-3">
      {prayerTimes.map(prayer => (
        <PrayerCard
          key={prayer.id}
          prayer={prayer}
          isSelected={selectedPrayer === prayer.id}
          onClick={() => {
            setSelectedPrayer(prayer.id);
            onPrayerSelect(prayer);
          }}
        />
      ))}
    </div>
  );
};