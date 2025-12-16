import { MediaItem } from '../types';

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

// --- FALLBACK CACHE (Offline / Backup) ---
const VIDEO_CACHE: MediaItem[] = [
    { id: 'fawzan_1', title: 'Explanation of Kitab at-Tawheed', author: 'Sh. Saleh Al-Fawzan', type: 'video', category: 'fiqh', url: 'https://www.youtube.com/embed/HuAgBv-2l38', duration: '45:00', thumbnail: '' },
    { id: 'yq_seerah_1', title: 'Seerah of Prophet Muhammad Ep 1', author: 'Dr. Yasir Qadhi', type: 'video', category: 'history', url: 'https://www.youtube.com/embed/VOUp3ZZ9t3k', duration: '1:05:00', thumbnail: '' },
    { id: 'menk_1', title: 'Stop Overthinking & Trust Allah', author: 'Mufti Menk', type: 'video', category: 'lecture', url: 'https://www.youtube.com/embed/1s9q3', duration: '20:00', thumbnail: '' },
    { id: 'ys_1', title: 'The Story of Prophet Yusuf', author: 'Yasir Qadhi', type: 'video', category: 'quran', url: 'https://www.youtube.com/embed/98765', duration: '30:00', thumbnail: '' },
    { id: 'ml_1', title: 'Proofs of Prophethood', author: 'Muslim Lantern', type: 'video', category: 'lecture', url: 'https://www.youtube.com/embed/12345', duration: '15:00', thumbnail: '' }
];

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

export const MultimediaService = {
    
    /**
     * Get Feed Media
     * Currently returns cached/fallback data to ensure stability.
     */
    getFeedMedia: async (limit: number = 10): Promise<MediaItem[]> => {
        // Return enriched fallback data
        return VIDEO_CACHE.map(enrichMediaItem).slice(0, limit);
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
                            category: 'lecture', // Default category
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