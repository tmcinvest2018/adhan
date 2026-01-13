import { PrayerTime, UserLocation, PrayerSettings } from '../../../types';

export interface PrayerCalculatorService {
  calculatePrayerTimes(location: UserLocation, settings: PrayerSettings): Promise<PrayerTime[]>;
  getNextPrayer(prayerTimes: PrayerTime[]): PrayerTime | null;
}