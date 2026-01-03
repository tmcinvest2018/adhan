
import { useState, useEffect, useMemo } from 'react';
import { PrayerTimes, Coordinates, CalculationMethod, Madhab } from 'adhan';
import { AppSettings, PrayerTimesData, PrayerTimeDisplay, UserCoordinates, PrayerKey } from '../types';
import { translations } from '../services/translations';
import { isBefore, addDays } from 'date-fns';

export const usePrayerTimes = (settings: AppSettings, coords: UserCoordinates | null) => {
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimesData | null>(null);
  const [nextPrayer, setNextPrayer] = useState<PrayerTimeDisplay | null>(null);
  const [formattedPrayers, setFormattedPrayers] = useState<PrayerTimeDisplay[]>([]);
  const [ticker, setTicker] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setTicker(t => t + 1);
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  const adhanCoordinates = useMemo(() => {
    if (!coords) return null;
    return new Coordinates(coords.latitude, coords.longitude);
  }, [coords]);

  const adhanParams = useMemo(() => {
    let method = CalculationMethod.MuslimWorldLeague();
    switch (settings.method) {
        case 'NorthAmerica': method = CalculationMethod.NorthAmerica(); break;
        case 'Egyptian': method = CalculationMethod.Egyptian(); break;
        case 'Makkah': method = CalculationMethod.UmmAlQura(); break;
        case 'Karachi': method = CalculationMethod.Karachi(); break;
        case 'Tehran': method = CalculationMethod.Tehran(); break;
        case 'Singapore': method = CalculationMethod.Singapore(); break;
        case 'Turkey': method = CalculationMethod.Turkey(); break;
        case 'Dubai': method = CalculationMethod.Dubai(); break;
        case 'Kuwait': method = CalculationMethod.Kuwait(); break;
        case 'Qatar': method = CalculationMethod.Qatar(); break;
        // France and Russia are not standard methods in this version of adhan-js.
        // Fallbacking to MWL or closest approximation.
        case 'France': method = CalculationMethod.MuslimWorldLeague(); break; 
        case 'Russia': method = CalculationMethod.MuslimWorldLeague(); break;
        default: method = CalculationMethod.MuslimWorldLeague();
    }
    method.madhab = settings.madhab === 'Hanafi' ? Madhab.Hanafi : Madhab.Shafi;
    return method;
  }, [settings.method, settings.madhab]);

  useEffect(() => {
    if (!adhanCoordinates) return;

    const t = translations[settings.language] || translations['en'];
    const now = new Date();
    
    const prayer = new PrayerTimes(adhanCoordinates, now, adhanParams);
    const data: PrayerTimesData = {
        fajr: prayer.fajr,
        sunrise: prayer.sunrise,
        dhuhr: prayer.dhuhr,
        asr: prayer.asr,
        maghrib: prayer.maghrib,
        isha: prayer.isha
    };

    setPrayerTimes(data);

    const prayerKeys: PrayerKey[] = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'];
    const list: PrayerTimeDisplay[] = prayerKeys.map(key => ({
        name: t.prayers[key],
        originalKey: key,
        time: (data as any)[key],
        isNext: false,
        isCurrent: false
    }));

    let nextIndex = -1;
    let foundNext = false;

    for(let i=0; i<list.length; i++) {
        if(isBefore(now, list[i].time)) {
            list[i].isNext = true;
            nextIndex = i;
            foundNext = true;
            break;
        }
    }

    if (foundNext && nextIndex > 0) {
        list[nextIndex - 1].isCurrent = true;
    } else if (!foundNext) {
        list[list.length - 1].isCurrent = true;
    }

    setFormattedPrayers(list);
    
    if (foundNext) {
        setNextPrayer(list[nextIndex]);
    } else {
        const tomorrowFajrDate = addDays(data.fajr, 1);
        setNextPrayer({
            name: t.prayers['fajr'],
            originalKey: 'fajr',
            time: tomorrowFajrDate,
            isNext: true,
            isCurrent: false
        });
    }

  }, [adhanCoordinates, adhanParams, settings, ticker]); 

  return { prayerTimes, formattedPrayers, nextPrayer };
};
