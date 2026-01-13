import { PrayerCalculatorService } from '../../core/domain/services/PrayerCalculator.service';
import { PrayerTime, UserLocation, PrayerSettings } from '../../../types';
import { PrayerTimes, Coordinates, CalculationMethod, Madhab } from 'adhan';

export class AdhanPrayerCalculatorService implements PrayerCalculatorService {
  async calculatePrayerTimes(location: UserLocation, settings: PrayerSettings): Promise<PrayerTime[]> {
    const coords = new Coordinates(location.latitude, location.longitude);
    
    // Convert settings to adhan parameters
    let method = CalculationMethod.MuslimWorldLeague();
    switch (settings.calculationMethod) {
      case 'MuslimWorldLeague':
        method = CalculationMethod.MuslimWorldLeague();
        break;
      case 'NorthAmerica':
        method = CalculationMethod.NorthAmerica();
        break;
      case 'Egyptian':
        method = CalculationMethod.Egyptian();
        break;
      case 'Makkah':
        method = CalculationMethod.UmmAlQura();
        break;
      case 'Karachi':
        method = CalculationMethod.Karachi();
        break;
      case 'Tehran':
        method = CalculationMethod.Tehran();
        break;
      case 'Singapore':
        method = CalculationMethod.Singapore();
        break;
      case 'Turkey':
        method = CalculationMethod.Turkey();
        break;
      case 'Dubai':
        method = CalculationMethod.Dubai();
        break;
      case 'Kuwait':
        method = CalculationMethod.Kuwait();
        break;
      case 'Qatar':
        method = CalculationMethod.Qatar();
        break;
      default:
        method = CalculationMethod.MuslimWorldLeague();
    }
    
    method.madhab = settings.madhab === 'Hanafi' ? Madhab.Hanafi : Madhab.Shafi;
    
    const prayer = new PrayerTimes(coords, new Date(), method);
    
    // Format to domain entity
    return [
      { id: 'fajr', name: 'Fajr', time: prayer.fajr, isNext: false, isCurrent: false },
      { id: 'sunrise', name: 'Sunrise', time: prayer.sunrise, isNext: false, isCurrent: false },
      { id: 'dhuhr', name: 'Dhuhr', time: prayer.dhuhr, isNext: false, isCurrent: false },
      { id: 'asr', name: 'Asr', time: prayer.asr, isNext: false, isCurrent: false },
      { id: 'maghrib', name: 'Maghrib', time: prayer.maghrib, isNext: false, isCurrent: false },
      { id: 'isha', name: 'Isha', time: prayer.isha, isNext: false, isCurrent: false },
    ];
  }
  
  getNextPrayer(prayerTimes: PrayerTime[]): PrayerTime | null {
    const now = new Date();
    return prayerTimes.find(p => p.time > now) || null;
  }
}