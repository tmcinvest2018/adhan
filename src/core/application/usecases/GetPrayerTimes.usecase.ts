import { PrayerCalculatorService } from '../../domain/services/PrayerCalculator.service';
import { PrayerTime, UserLocation, PrayerSettings } from '../../../types';

export class GetPrayerTimesUseCase {
  constructor(private calculator: PrayerCalculatorService) {}
  
  async execute(location: UserLocation, settings: PrayerSettings): Promise<PrayerTime[]> {
    // Business logic for calculating prayer times
    const times = await this.calculator.calculatePrayerTimes(location, settings);
    
    // Additional business logic for validation, caching, etc.
    return this.validateAndFormat(times, settings);
  }
  
  private validateAndFormat(times: PrayerTime[], settings: PrayerSettings): PrayerTime[] {
    // Validation and formatting logic
    const now = new Date();
    let nextPrayerFound = false;
    
    return times.map((prayer, index) => {
      const isNext = !nextPrayerFound && prayer.time > now;
      if (isNext) nextPrayerFound = true;
      
      return {
        ...prayer,
        isNext,
        isCurrent: !nextPrayerFound && index === times.length - 1 // Last prayer of the day
      };
    });
  }
}