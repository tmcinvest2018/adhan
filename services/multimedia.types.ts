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