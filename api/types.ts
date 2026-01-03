
export type MediaType = 'text' | 'video' | 'audio';

export interface MediaItem {
  id: string;
  title: string;
  author: string;
  type: 'video' | 'audio';
  category: 'quran' | 'lecture' | 'history' | 'fiqh';
  url: string;
  duration: string;
  thumbnail?: string;
  published?: string;
}
