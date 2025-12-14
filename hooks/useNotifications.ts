import { useEffect, useRef } from 'react';
import { AppSettings, PrayerTimesData, PrayerKey } from '../types';
import { ADHAN_SOUNDS } from '../constants';
import { translations } from '../services/translations';

export const useNotifications = (
  prayerTimes: PrayerTimesData | null,
  settings: AppSettings
) => {
  const lastNotifiedRef = useRef<string | null>(null);

  // Request permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    if (!prayerTimes) return;

    const checkTime = () => {
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      const t = translations[settings.language] || translations['en'];

      const keys: PrayerKey[] = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'];

      keys.forEach((key) => {
        const time = prayerTimes[key];
        if (!time) return;

        // Check if it's the exact minute
        if (
          time.getHours() === currentHour &&
          time.getMinutes() === currentMinute
        ) {
          // Construct a unique key for today+prayer to avoid double firing
          const notificationKey = `${now.toDateString()}-${key}`;

          if (lastNotifiedRef.current !== notificationKey) {
            // Check settings for this prayer
            const config = settings.notifications?.[key];
            
            // If settings exist and enabled
            if (config && config.enabled) {
              
              // 1. Send Notification
              if ('Notification' in window && Notification.permission === 'granted') {
                new Notification(t.appTitle, {
                  body: `${t.status.current}: ${t.prayers[key]}`,
                  icon: '/icon.png' // Assuming an icon exists or default
                });
              }

              // 2. Play Sound
              if (config.soundEnabled) {
                const soundData = ADHAN_SOUNDS[config.soundId];
                if (soundData) {
                  const audio = new Audio(soundData.url);
                  audio.play().catch(e => console.warn("Audio play blocked", e));
                }
              }
            }

            // Mark as notified
            lastNotifiedRef.current = notificationKey;
          }
        }
      });
    };

    // Check every 5 seconds to be safe, though checking every minute in parent is also fine.
    // We do this to catch the minute transition accurately.
    const interval = setInterval(checkTime, 5000);
    return () => clearInterval(interval);

  }, [prayerTimes, settings]);
};