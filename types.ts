
export enum CalculationMethod {
  MWL = 'MuslimWorldLeague',
  ISNA = 'NorthAmerica',
  EGYPT = 'Egyptian',
  MAKKAH = 'Makkah',
  KARACHI = 'Karachi',
  TEHRAN = 'Tehran',
  SINGAPORE = 'Singapore',
}

export enum Madhab {
  SHAFI = 'Shafi', // Standard (Shafi, Maliki, Ja'fari, Hanbali)
  HANAFI = 'Hanafi',
}

export interface UserCoordinates {
  latitude: number;
  longitude: number;
}

export interface NotificationConfig {
  enabled: boolean;
  soundEnabled: boolean;
  soundId: string; // 'makkah', 'madina', 'beep', etc.
}

export type PrayerKey = 'fajr' | 'sunrise' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';

export interface AppSettings {
  method: CalculationMethod;
  madhab: Madhab;
  manualLocation?: UserCoordinates; // If null, use GPS
  useGPS: boolean;
  language: string;
  reciterId: string; // New Reciter Setting
  notifications: Record<PrayerKey, NotificationConfig>;
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
  originalKey: PrayerKey; // Used for icon mapping
  time: Date;
  isNext: boolean;
  isCurrent: boolean;
}

// --- QURAN TYPES ---

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
  translation?: string; // Merged manually
  tafsir?: string; // Merged manually
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

// --- DHIKR & HADITH TYPES ---

export type KnowledgeCategory = 'dhikr_morning' | 'dhikr_evening' | 'dhikr_prayer' | 'hadith_general' | 'hadith_prayer';

export interface KnowledgeItem {
  id: string;
  category: KnowledgeCategory;
  arabic: string;
  translation: string;
  transliteration?: string;
  source: string; // e.g. "Sahih Bukhari 123" or "Quran 2:255"
  repeat?: number;
}

export interface PrayerContext {
  prayerKey: PrayerKey;
  rakahSummary: string; // e.g. "2 Sunnah, 2 Fard"
  recitationType: 'loud' | 'silent' | 'mixed' | 'none'; // Jahr or Sirr
  sunnahInfo?: string;
  relatedItemIds: string[]; // IDs of Dhikr/Hadith relevant to this prayer
}

// --- HADITH SERVICE TYPES ---

export interface HadithBookDef {
  id: string;
  title: string;
  arabicTitle: string;
  collection: string; // 'six_books', 'other'
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

// --- ILMHUB (KNOWLEDGE CENTER) TYPES ---

export type MediaType = 'text' | 'video' | 'audio';

export interface FeedItem {
  id: string;
  type: 'daily_wisdom' | 'featured_text' | 'reminder' | 'media_highlight';
  mediaType: MediaType;
  title: string;
  content: string;
  mediaUrl?: string; // YouTube ID or MP3 URL
  thumbnailUrl?: string;
  source?: string;
  dateStr?: string; // e.g. "Friday, 12 Rajab"
  tags: string[];
}

export interface LibraryCategory {
    id: 'quran_tafsir' | 'hadith_collections' | 'classical_texts';
    title: string;
    icon: any;
}

// New Layered Architecture Types
export interface BookStructureNode {
    id: string;
    title: string; // Chapter Title / Surah Name
    number?: number; // Surah Number / Chapter Number
    audioUrl?: string; // For Quran Surah playback
    sections?: BookStructureNode[]; // Sub-chapters (Bab)
    pageStart?: number;
}

export interface LibraryBook {
  id: string;
  title: string;
  author: string;
  category: 'quran_tafsir' | 'hadith_collections' | 'classical_texts';
  description?: string;
  coverColor?: string;
  
  // Logic Flags
  sourceType: 'api_quran' | 'api_hadith' | 'static_text';
  apiId?: string; // For API calls (e.g., 'bukhari', 'en.ibnkathir')
  
  // Offline Architecture 2.0
  structureCdnUrl?: string; // URL to fetch the Index (Chapters/Surahs)
  contentCdnUrl?: string; // URL to fetch the full text content
  
  // Fallback/Legacy
  content?: string; 
  chapters?: any[];
}

export interface MediaItem {
    id: string;
    title: string;
    author: string;
    type: 'video' | 'audio';
    category: 'quran' | 'lecture' | 'history' | 'fiqh';
    url: string; // YouTube Embed URL or Audio File URL
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
    url?: string; // Internal link or external
  }>;
  timestamp: number;
}

// --- UNIVERSAL SEARCH TYPES ---

export type SearchCategory = 'all' | 'quran' | 'hadith' | 'library' | 'media';

export interface SearchResult {
    id: string;
    category: SearchCategory;
    title: string;
    subtitle: string;
    contentPreview?: string;
    imageUrl?: string; // For video thumbnails
    data?: any; // To hold specific data (e.g., Surah number, Video URL)
}

export interface QuranContext {
    surah: number;
    ayah?: number;
    mode?: 'read' | 'tafsir'; // New: Open directly in tafsir mode
    editionId?: string; // e.g. 'en.ibnkathir'
}
