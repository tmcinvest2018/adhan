import { useState, useEffect, useMemo } from 'react';
import { PrayerTimes, Coordinates, CalculationMethod, Madhab } from 'adhan';
import { AppSettings, PrayerTimesData, PrayerTimeDisplay, UserCoordinates, PrayerKey } from '../types';
import { translations } from '../services/translations';
import { isBefore } from 'date-fns';

export const usePrayerTimes = (settings: AppSettings, coords: UserCoordinates | null) => {
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimesData | null>(null);
  const [nextPrayer, setNextPrayer] = useState<PrayerTimeDisplay | null>(null);
  const [formattedPrayers, setFormattedPrayers] = useState<PrayerTimeDisplay[]>([]);
  // Ticker to force update every minute so "Next" prayer updates automatically
  const [ticker, setTicker] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setTicker(t => t + 1);
    }, 60000); // Check every minute
    return () => clearInterval(timer);
  }, []);

  const adhanCoordinates = useMemo(() => {
    if (!coords) return null;
    return new Coordinates(coords.latitude, coords.longitude);
  }, [coords]);

  const adhanParams = useMemo(() => {
    // Map our enum to adhan library methods
    let method = CalculationMethod.MuslimWorldLeague();
    switch (settings.method) {
        case 'NorthAmerica': method = CalculationMethod.NorthAmerica(); break;
        case 'Egyptian': method = CalculationMethod.Egyptian(); break;
        case 'Makkah': method = CalculationMethod.UmmAlQura(); break;
        case 'Karachi': method = CalculationMethod.Karachi(); break;
        case 'Tehran': method = CalculationMethod.Tehran(); break;
        case 'Singapore': method = CalculationMethod.Singapore(); break;
        default: method = CalculationMethod.MuslimWorldLeague();
    }
    
    if (settings.madhab === 'Hanafi') {
        method.madhab = Madhab.Hanafi;
    } else {
        method.madhab = Madhab.Shafi;
    }
    
    return method;
  }, [settings.method, settings.madhab]);

  useEffect(() => {
    if (!adhanCoordinates) return;

    const date = new Date();
    const prayer = new PrayerTimes(adhanCoordinates, date, adhanParams);
    const t = translations[settings.language] || translations['en'];

    const data: PrayerTimesData = {
        fajr: prayer.fajr,
        sunrise: prayer.sunrise,
        dhuhr: prayer.dhuhr,
        asr: prayer.asr,
        maghrib: prayer.maghrib,
        isha: prayer.isha
    };

    setPrayerTimes(data);

    // Determine current/next prayer
    const prayerKeys: PrayerKey[] = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'];
    const list: PrayerTimeDisplay[] = prayerKeys.map(key => ({
        name: t.prayers[key],
        originalKey: key,
        time: (prayer as any)[key],
        isNext: false,
        isCurrent: false
    }));

    const now = new Date();
    let nextIndex = -1;
    let foundNext = false;

    // Determine next prayer for TODAY
    for(let i=0; i<list.length; i++) {
        if(isBefore(now, list[i].time)) {
            list[i].isNext = true;
            nextIndex = i;
            foundNext = true;
            break;
        }
    }

    // Determine current prayer (one before next)
    if (foundNext && nextIndex > 0) {
        list[nextIndex - 1].isCurrent = true;
    } else if (foundNext && nextIndex === 0) {
        // Next is Fajr today.
    } else if (!foundNext) {
        // All prayers for today passed. 
        // 1. Highlight Isha as current (last completed)
        list[list.length -1].isCurrent = true;
    }

    setFormattedPrayers(list);
    
    if (foundNext) {
        setNextPrayer(list[nextIndex]);
    } else {
        // All prayers for today passed. Calculate Tomorrow's Fajr.
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const nextDayPrayer = new PrayerTimes(adhanCoordinates, tomorrow, adhanParams);
        
        const tomorrowFajr: PrayerTimeDisplay = {
            name: t.prayers['fajr'],
            originalKey: 'fajr',
            time: nextDayPrayer.fajr,
            isNext: true,
            isCurrent: false
        };
        
        setNextPrayer(tomorrowFajr);
    }

  }, [adhanCoordinates, adhanParams, settings, ticker]); 

  return { prayerTimes, formattedPrayers, nextPrayer };
};