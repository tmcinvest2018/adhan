
import { MediaItem } from '@/types';

// --- HELPERS ---

const PIPED_API_URL = 'https://pipedapi.kavin.rocks';

const getThumbnailUrl = (videoId: string): string => {
    return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
};

const getChannelLogo = (authorName: string): string => {
    const encoded = encodeURIComponent(authorName);
    return `https://ui-avatars.com/api/?name=${encoded}&background=random&color=fff&size=64&font-size=0.5&bold=true`;
};

const formatDuration = (seconds: number): string => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    return `${m}:${s.toString().padStart(2, '0')}`;
}

// --- CHANNEL DATABASE ---
interface ChannelDef {
    id: string; 
    name: string;
    cat: 'quran' | 'lecture' | 'history' | 'fiqh';
    ytId: string;
}

const CHANNELS: ChannelDef[] = [
    { id: 'menk', name: 'Mufti Menk', cat: 'lecture', ytId: 'UCTSLKqAm-S_jZk42Wd-z_DQ' },
    { id: 'yasir_qadhi', name: 'Dr. Yasir Qadhi', cat: 'history', ytId: 'UC37o9G5k650f9f3XjN_V24A' }, 
    { id: 'bayyinah', name: 'Bayyinah TV', cat: 'quran', ytId: 'UCeM7c1D2C6pC5zQ7k1z1u_g' }, 
    { id: 'yaqeen', name: 'Yaqeen Institute', cat: 'lecture', ytId: 'UC3vPWjJ7wA4p_1c7K_3qE1g' },
    { id: 'muslim_lantern', name: 'Muslim Lantern', cat: 'lecture', ytId: 'UC38_4_5_6_7_8_9' }, 
    { id: 'mercifulservant', name: 'Merciful Servant', cat: 'lecture', ytId: 'UCHGA_5_4_3_2_1' },
    { id: 'assim', name: 'Sh. Assim Al-Hakeem', cat: 'fiqh', ytId: 'UCW2L5_H1_4_3_2_1' },
];

// --- FALLBACK CACHE (Offline / Backup) ---
const VIDEO_CACHE: MediaItem[] = [
    { id: 'fawzan_1', title: 'Explanation of Kitab at-Tawheed', author: 'Sh. Saleh Al-Fawzan', type: 'video', category: 'fiqh', url: 'https://www.youtube.com/embed/HuAgBv-2l38', duration: '45:00', thumbnail: '' },
    { id: 'yq_seerah_1', title: 'Seerah of Prophet Muhammad Ep 1', author: 'Dr. Yasir Qadhi', type: 'video', category: 'history', url: 'https://www.youtube.com/embed/VOUp3ZZ9t3k', duration: '1:05:00', thumbnail: '' },
    { id: 'menk_1', title: 'Stop Overthinking & Trust Allah', author: 'Mufti Menk', type: 'video', category: 'lecture', url: 'https://www.youtube.com/embed/1s9q3', duration: '20:00', thumbnail: '' },
];

export const MultimediaService = {
    
    /**
     * Fetch Media via Vercel Serverless Proxy
     */
    getFeedMedia: async (limit: number = 10): Promise<MediaItem[]> => {
        try {
            // Determine API URL (Relative path works in production, but needs full URL for some envs)
            // We use relative '/api/youtube-feed' which Vercel resolves automatically.
            const response = await fetch('/api/youtube-feed');
            
            if (!response.ok) {
                throw new Error('API response not ok');
            }

            const rawItems = await response.json();
            
            if (!Array.isArray(rawItems) || rawItems.length === 0) {
                return VIDEO_CACHE.map(enrichMediaItem);
            }

            // Map and Enrich
            const items = rawItems.map((item: any) => {
                // Try to find category based on author name
                const knownChannel = CHANNELS.find(c => 
                    item.author.toLowerCase().includes(c.name.toLowerCase()) || 
                    c.name.toLowerCase().includes(item.author.toLowerCase())
                );
                
                return enrichMediaItem({
                    ...item,
                    category: knownChannel ? knownChannel.cat : 'lecture',
                    type: 'video',
                    duration: 'New' // API doesn't return duration yet, keep it simple
                });
            });

            return items.slice(0, limit);

        } catch (e) {
            console.warn("Vercel Proxy fetch failed, using fallback cache:", e);
            // Fallback to cache if the API fails (e.g. during local dev without 'vercel dev' running)
            return VIDEO_CACHE.map(enrichMediaItem);
        }
    },

    /**
     * Search Media using Piped API (Privacy-friendly, no API Key)
     */
    searchMedia: async (query: string): Promise<MediaItem[]> => {
        try {
            const response = await fetch(`${PIPED_API_URL}/search?q=${encodeURIComponent(query)}&filter=videos`);
            
            if (response.ok) {
                const data = await response.json();
                if (data.items && Array.isArray(data.items)) {
                    return data.items.map((item: any) => {
                        // Extract ID from URL (usually /watch?v=ID)
                        const videoId = item.url.split('v=')[1] || item.url.replace(/^\//, '');
                        
                        return {
                            id: videoId,
                            title: item.title,
                            author: item.uploaderName,
                            type: 'video',
                            category: 'lecture',
                            url: `https://www.youtube.com/embed/${videoId}`,
                            duration: item.duration ? formatDuration(item.duration) : '',
                            thumbnail: item.thumbnail,
                            channelLogo: item.uploaderAvatar
                        };
                    });
                }
            }
        } catch (e) {
            console.warn("Piped API search failed", e);
        }

        // Fallback: Search local cache if Piped fails
        const qLower = query.toLowerCase();
        const cacheResults = VIDEO_CACHE.filter(item => 
            item.title.toLowerCase().includes(qLower) || 
            item.author.toLowerCase().includes(qLower)
        );
        return cacheResults.map(enrichMediaItem);
    },

    getByCategory: async (category: string): Promise<MediaItem[]> => {
        const results = VIDEO_CACHE.filter(item => item.category === category);
        return results.map(enrichMediaItem);
    }
};

/**
 * Enriches a raw MediaItem with high-quality thumbnails and channel logos
 */
function enrichMediaItem(item: MediaItem): MediaItem {
    // 1. Extract ID
    let videoId = item.id;
    // If ID looks like a URL, extract the ID
    if (videoId.includes('http') || videoId.length > 15) {
        if (item.url.includes('v=')) {
            videoId = item.url.split('v=')[1]?.split('&')[0];
        } else if (item.url.includes('embed/')) {
            videoId = item.url.split('embed/')[1]?.split('?')[0];
        } else if (item.url.includes('youtu.be/')) {
            videoId = item.url.split('youtu.be/')[1]?.split('?')[0];
        }
    }

    // Clean title (remove common YouTube clutter)
    const cleanTitle = item.title.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, "&");

    return {
        ...item,
        id: videoId,
        title: cleanTitle,
        // Ensure thumbnail is high quality
        thumbnail: getThumbnailUrl(videoId),
        // @ts-ignore - injecting logo property dynamically
        channelLogo: getChannelLogo(item.author)
    };
}
