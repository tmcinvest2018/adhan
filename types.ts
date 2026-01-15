export enum CalculationMethod {
  MWL = 'MuslimWorldLeague',
  ISNA = 'NorthAmerica',
  EGYPT = 'Egyptian',
  MAKKAH = 'Makkah',
  KARACHI = 'Karachi',
  TEHRAN = 'Tehran',
  SINGAPORE = 'Singapore',
  TURKEY = 'Turkey',
  DUBAI = 'Dubai',
  KUWAIT = 'Kuwait',
  QATAR = 'Qatar',
  FRANCE = 'France',
  RUSSIA = 'Russia',
}

export enum Madhab {
  SHAFI = 'Shafi',
  HANAFI = 'Hanafi',
}

export interface UserCoordinates {
  latitude: number;
  longitude: number;
}

export interface NotificationConfig {
  enabled: boolean;
  soundEnabled: boolean;
  soundId: string;
}

export type PrayerKey = 'fajr' | 'sunrise' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';

export interface AppSettings {
  method: CalculationMethod;
  madhab: Madhab;
  useGPS: boolean;
  manualLocationName?: string;
  manualCoordinates?: UserCoordinates;
  language: string;
  reciterId: string;
  notifications: Record<PrayerKey, NotificationConfig>;
  quranVisuals: QuranVisuals;
}

export interface PrayerTimesData {
  fajr: Date;
  sunrise: Date;
  dhuhr: Date;
  asr: Date;
  maghrib: Date;
  isha: Date;
}

export interface PrayerTimeDisplay {
  name: string;
  originalKey: PrayerKey;
  time: Date;
  isNext: boolean;
  isCurrent: boolean;
}

export interface Surah {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: string;
}

export interface Ayah {
  number: number;
  audio: string;
  audioSecondary: string[];
  text: string;
  numberInSurah: number;
  juz: number;
  manzil: number;
  page: number;
  ruku: number;
  hizbQuarter: number;
  sajda: boolean | any;
  translation?: string;
  tafsir?: string;
}

export interface TafsirEdition {
    id: string;
    name: string;
    author: string;
    language: string;
}

export interface LastRead {
  surahNumber: number;
  ayahNumber: number;
  surahName: string;
  timestamp: number;
}

export type KnowledgeCategory = 'dhikr_morning' | 'dhikr_evening' | 'dhikr_prayer' | 'hadith_general' | 'hadith_prayer';

export interface KnowledgeItem {
  id: string;
  category: KnowledgeCategory;
  arabic: string;
  translation: string;
  transliteration?: string;
  source: string;
  repeat?: number;
}

export interface PrayerContext {
  prayerKey: PrayerKey;
  rakahSummary: string;
  recitationType: 'loud' | 'silent' | 'mixed' | 'none';
  sunnahInfo?: string;
  relatedItemIds: string[];
}

export interface HadithBookDef {
  id: string;
  title: string;
  arabicTitle: string;
  collection: string;
}

export interface HadithSection {
  id: string;
  title: string;
  number?: string;
}

export interface HadithData {
  hadithnumber: number | string;
  arabicnumber: number | string;
  text: string;
  arabicText?: string;
  translationText?: string;
  grades?: Array<{
    name: string;
    grade: string;
  }>;
  reference?: {
    book: number;
    hadith: number;
  };
}

export type MediaType = 'text' | 'video' | 'audio';

export interface FeedItem {
  id: string;
  type: 'daily_wisdom' | 'featured_text' | 'reminder' | 'media_highlight';
  mediaType: MediaType;
  title: string;
  content: string;
  mediaUrl?: string;
  thumbnailUrl?: string;
  source?: string;
  dateStr?: string;
  tags: string[];
}

export interface BookStructureNode {
    id: string;
    title: string;
    number?: number;
    audioUrl?: string;
    sections?: BookStructureNode[];
    pageStart?: number;
}

export interface LibraryBook {
  id: string;
  title: string;
  author: string;
  category: 'quran_tafsir' | 'hadith_collections' | 'classical_texts';
  description?: string;
  coverColor?: string;
  sourceType: 'api_quran' | 'api_hadith' | 'static_text';
  apiId?: string;
  structureCdnUrl?: string;
  contentCdnUrl?: string;
  content?: string;
  chapters?: any[];
}

export interface MediaItem {
    id: string;
    title: string;
    author: string;
    type: 'video' | 'audio';
    category: 'quran' | 'lecture' | 'history' | 'fiqh';
    url: string;
    duration: string;
    thumbnail?: string;
    datePublished?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  sources?: Array<{
    title: string;
    url?: string;
  }>;
  timestamp: number;
}

export type SearchCategory = 'all' | 'quran' | 'hadith' | 'library' | 'media';

export interface SearchResult {
    id: string;
    category: SearchCategory;
    title: string;
    subtitle: string;
    contentPreview?: string;
    imageUrl?: string;
    data?: any;
}

export interface QuranContext {
    surah: number;
    ayah?: number;
    mode?: 'read' | 'tafsir';
    editionId?: string;
}

export interface Mosque {
  id: string;
  slug: string;
  name: string;
  address: string;
  image?: string;
  label: string;
}

// --- UKHUWWAH MODULE TYPES ---

export type UkhuwwahRole = 'wakeel' | 'nasir' | 'muakhi';
export type Gender = 'brother' | 'sister';

export interface UkhuwwahProfile {
    id: string;
    name: string;
    role: UkhuwwahRole;
    gender: Gender;
    mosqueId?: string; // If affiliated/checked-in
    mosqueName?: string;
    isVerified: boolean; // Approved by Wakeel
    bio?: string;
    avatarColor?: string;
}

export interface ConnectionRequest {
    id: string;
    fromId: string;
    fromName: string;
    toId: string; // Nasir ID or Wakeel ID (for verification)
    type: 'mentorship' | 'verification';
    status: 'pending' | 'accepted' | 'rejected';
    timestamp: number;
}

// --- MISSING TYPES FOR BUILD ---

export interface UserLocation {
  latitude: number;
  longitude: number;
  name?: string;
}

export interface PrayerSettings {
  calculationMethod: string;
  madhab: string;
  adjustments: Partial<Record<string, number>>;
}

export interface PrayerTime {
  fajr: Date;
  sunrise: Date;
  dhuhr: Date;
  asr: Date;
  maghrib: Date;
  isha: Date;
}

export interface PrayerTimeDisplayWithStringTime {
  name: string;
  time: string;
  isNext: boolean;
  isCurrent: boolean;
  timeLeft?: string;
}

export interface QuranVisuals {
    fontStyle: 'uthmani' | 'indopak';
    fontSize: number;
    showTajweed: boolean;
}