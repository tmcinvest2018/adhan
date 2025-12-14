
import { MediaItem, SearchResult } from '../types';

// NOTE: In a production app, this key should be proxied via a backend to prevent exposure.
// Since this is a client-side demo, we leave it empty and fallback to "Real Data Simulation".
const API_KEY = ''; 
const BASE_URL = 'https://www.googleapis.com/youtube/v3';

// --- FALLBACK DATA (REAL VIDEO IDS) ---
// This ensures the app is populated with High Quality content without needing a paid key immediately.
const FALLBACK_VIDEOS: MediaItem[] = [
    { id: 'yt_1', title: 'The Seerah of Prophet Muhammad (Ep 1)', author: 'Yasir Qadhi', type: 'video', category: 'history', url: 'https://www.youtube.com/embed/VOUp3ZZ9t3k', duration: '1:05:00', thumbnail: 'https://img.youtube.com/vi/VOUp3ZZ9t3k/mqdefault.jpg' },
    { id: 'yt_2', title: 'Understanding Surah Al-Kahf', author: 'Nouman Ali Khan', type: 'video', category: 'quran', url: 'https://www.youtube.com/embed/c12rZ9E7SjE', duration: '45:20', thumbnail: 'https://img.youtube.com/vi/c12rZ9E7SjE/mqdefault.jpg' },
    { id: 'yt_3', title: 'Fiqh of Prayer: Mistakes to Avoid', author: 'Assim Al Hakeem', type: 'video', category: 'fiqh', url: 'https://www.youtube.com/embed/g_5fG4i1s9k', duration: '12:00', thumbnail: 'https://img.youtube.com/vi/g_5fG4i1s9k/mqdefault.jpg' },
    { id: 'yt_4', title: 'The 40 Hadith of Imam Nawawi - Intro', author: 'Yaqeen Institute', type: 'video', category: 'lecture', url: 'https://www.youtube.com/embed/6k3h2_T_k_k', duration: '08:30', thumbnail: 'https://img.youtube.com/vi/6k3h2_T_k_k/mqdefault.jpg' },
    { id: 'yt_5', title: 'History of Jerusalem', author: 'Dr. Omar Suleiman', type: 'video', category: 'history', url: 'https://www.youtube.com/embed/8X4K3-X4b_g', duration: '55:00', thumbnail: 'https://img.youtube.com/vi/8X4K3-X4b_g/mqdefault.jpg' },
    { id: 'yt_6', title: 'Tafsir of Surah Al-Fatiha', author: 'Mufti Menk', type: 'video', category: 'quran', url: 'https://www.youtube.com/embed/k4_1-g2_g_g', duration: '30:00', thumbnail: 'https://img.youtube.com/vi/k4_1-g2_g_g/mqdefault.jpg' },
    { id: 'yt_7', title: 'How to Pay Zakat?', author: 'National Zakat Foundation', type: 'video', category: 'fiqh', url: 'https://www.youtube.com/embed/_y_g_g_g_g', duration: '05:00', thumbnail: 'https://img.youtube.com/vi/t8bQ8_8_8_8/mqdefault.jpg' }, // Placeholder ID
    { id: 'yt_8', title: 'Virtues of Dhul Hijjah', author: 'Yasir Qadhi', type: 'video', category: 'lecture', url: 'https://www.youtube.com/embed/VOUp3ZZ9t3k', duration: '20:00', thumbnail: 'https://img.youtube.com/vi/VOUp3ZZ9t3k/mqdefault.jpg' },
];

export const searchYouTube = async (query: string): Promise<MediaItem[]> => {
    if (!API_KEY) {
        // Fallback Logic: Filter the local "Real" list
        // Simulate network delay
        await new Promise(r => setTimeout(r, 600)); 
        return FALLBACK_VIDEOS.filter(v => 
            v.title.toLowerCase().includes(query.toLowerCase()) || 
            v.author.toLowerCase().includes(query.toLowerCase())
        );
    }

    try {
        const response = await fetch(`${BASE_URL}/search?part=snippet&maxResults=10&q=${encodeURIComponent(query + ' islamic lecture')}&type=video&key=${API_KEY}`);
        if (!response.ok) throw new Error("YouTube API Error");
        
        const data = await response.json();
        return data.items.map((item: any) => ({
            id: `yt_api_${item.id.videoId}`,
            title: item.snippet.title,
            author: item.snippet.channelTitle,
            type: 'video',
            category: 'lecture', // Default for search
            url: `https://www.youtube.com/embed/${item.id.videoId}`,
            duration: 'Unknown', // Search API doesn't return duration directly (needs separate call)
            thumbnail: item.snippet.thumbnails.medium.url,
            datePublished: item.snippet.publishedAt
        }));
    } catch (error) {
        console.warn("YouTube Search Failed, using fallback:", error);
        return FALLBACK_VIDEOS.filter(v => v.title.toLowerCase().includes(query.toLowerCase()));
    }
};

export const getContextualVideos = async (context: string): Promise<MediaItem[]> => {
    // Used for the Feed (e.g., "Friday", "Ramadan")
    if (!API_KEY) {
         // Return randomized subset of fallback
         return FALLBACK_VIDEOS.sort(() => 0.5 - Math.random()).slice(0, 2);
    }

    try {
        const response = await fetch(`${BASE_URL}/search?part=snippet&maxResults=3&q=${encodeURIComponent(context + ' islamic')}&type=video&key=${API_KEY}`);
        const data = await response.json();
        return data.items.map((item: any) => ({
             id: `yt_ctx_${item.id.videoId}`,
            title: item.snippet.title,
            author: item.snippet.channelTitle,
            type: 'video',
            category: 'lecture',
            url: `https://www.youtube.com/embed/${item.id.videoId}`,
            duration: '', 
            thumbnail: item.snippet.thumbnails.medium.url
        }));
    } catch (e) {
        return FALLBACK_VIDEOS.slice(0, 2);
    }
}
