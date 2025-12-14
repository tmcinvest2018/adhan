import { CalculationMethod, Madhab, AppSettings } from './types';

// Mecca Coordinates
export const KAABA_COORDINATES = {
  latitude: 21.422487,
  longitude: 39.826206,
};

export const ADHAN_SOUNDS: Record<string, { label: string, url: string }> = {
  beep: { label: 'Beep (Short)', url: 'https://cdn.freesound.org/previews/264/264768_4486188-lq.mp3' },
  makkah: { label: 'Makkah', url: 'https://www.islamcan.com/audio/adhan/azan1.mp3' },
  madina: { label: 'Madina', url: 'https://www.islamcan.com/audio/adhan/azan2.mp3' },
  alaqsa: { label: 'Al-Aqsa', url: 'https://www.islamcan.com/audio/adhan/azan3.mp3' },
  misr: { label: 'Egypt', url: 'https://media.sd.ma/assala/adhan/egypt.mp3' },
};

const DEFAULT_NOTIF_CONFIG = {
  enabled: true,
  soundEnabled: true,
  soundId: 'makkah'
};

export const DEFAULT_SETTINGS: AppSettings = {
  method: CalculationMethod.MWL,
  madhab: Madhab.SHAFI,
  useGPS: true,
  language: 'nl',
  notifications: {
    fajr: { ...DEFAULT_NOTIF_CONFIG },
    sunrise: { ...DEFAULT_NOTIF_CONFIG, soundEnabled: false }, // Usually no adhan for sunrise
    dhuhr: { ...DEFAULT_NOTIF_CONFIG },
    asr: { ...DEFAULT_NOTIF_CONFIG },
    maghrib: { ...DEFAULT_NOTIF_CONFIG },
    isha: { ...DEFAULT_NOTIF_CONFIG },
  }
};

export const LANGUAGES = {
  en: 'English',
  nl: 'Nederlands',
  ar: 'العربية',
  tr: 'Türkçe',
  fr: 'Français',
  de: 'Deutsch',
  id: 'Bahasa Indonesia',
  es: 'Español',
  ur: 'اردو',
  ru: 'Русский',
};

export const METHOD_LABELS: Record<CalculationMethod, string> = {
  [CalculationMethod.MWL]: 'Muslim World League',
  [CalculationMethod.ISNA]: 'ISNA (North America)',
  [CalculationMethod.EGYPT]: 'Egypt (General Authority)',
  [CalculationMethod.MAKKAH]: 'Umm Al-Qura (Makkah)',
  [CalculationMethod.KARACHI]: 'Karachi',
  [CalculationMethod.TEHRAN]: 'Tehran',
  [CalculationMethod.SINGAPORE]: 'Singapore',
};