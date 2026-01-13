import { useState, useEffect } from 'react';
import { GetPrayerTimesUseCase } from '../../core/application/usecases/GetPrayerTimes.usecase';
import { AdhanPrayerCalculatorService } from '../../infrastructure/services/AdhanPrayerCalculator.service';
import { PrayerTime, UserLocation, PrayerSettings } from '../../../types';

export const usePrayerTimes = (location: UserLocation | null, settings: PrayerSettings) => {
  const [prayerTimes, setPrayerTimes] = useState<PrayerTime[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (!location) return;
    
    const fetchPrayerTimes = async () => {
      try {
        setLoading(true);
        const calculatorService = new AdhanPrayerCalculatorService();
        const useCase = new GetPrayerTimesUseCase(calculatorService);
        const times = await useCase.execute(location, settings);
        setPrayerTimes(times);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };
    
    fetchPrayerTimes();
  }, [location, settings]);
  
  return { prayerTimes, loading, error };
};