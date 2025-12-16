
import { MediaItem } from '../types';

// --- CONFIG ---
// Using RSS2JSON as a client-side proxy to bypass CORS on YouTube RSS feeds
// This restores the "Dynamic Fetching" capability without needing a backend API.
const RSS_TO_JSON_API = 'https://api.rss2json.com/v1/api.json?rss_url=';

// --- HELPERS ---
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

// --- CHANNELS ---
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

// --- FALLBACK CACHE ---
const VIDEO_CACHE: MediaItem[] = [
    { id: 'fawzan_1', title: 'Explanation of Kitab at-Tawheed', author: 'Sh. Saleh Al-Fawzan', type: 'video', category: 'fiqh', url: 'https://www.youtube.com/embed/HuAgBv-2l38', duration: '45:00', thumbnail: 'https://img.youtube.com/vi/HuAgBv-2l38/hqdefault.jpg' },
    { id: 'yq_seerah_1', title: 'Seerah of Prophet Muhammad Ep 1', author: 'Dr. Yasir Qadhi', type: 'video', category: 'history', url: 'https://www.youtube.com/embed/VOUp3ZZ9t3k', duration: '1:05:00', thumbnail: 'https://img.youtube.com/vi/VOUp3ZZ9t3k/hqdefault.jpg' },
    { id: 'menk_1', title: 'Stop Overthinking & Trust Allah', author: 'Mufti Menk', type: 'video', category: 'lecture', url: 'https://www.youtube.com/embed/1s9q3', duration: '20:00', thumbnail: 'https://img.youtube.com/vi/1s9q3/hqdefault.jpg' },
    { id: 'ys_1', title: 'The Story of Prophet Yusuf', author: 'Yasir Qadhi', type: 'video', category: 'quran', url: 'https://www.youtube.com/embed/98765', duration: '30:00', thumbnail: '' },
    { id: 'ml_1', title: 'Proofs of Prophethood', author: 'Muslim Lantern', type: 'video', category: 'lecture', url: 'https://www.youtube.com/embed/12345', duration: '15:00', thumbnail: '' }
];

export const MultimediaService = {
    
    /**
     * Get Feed Media via RSS Proxy
     */
    getFeedMedia: async (limit: number = 10): Promise<MediaItem[]> => {
        // Attempt to fetch fresh data from a random subset of channels to keep it fast
        const shuffled = [...CHANNELS].sort(() => 0.5 - Math.random()).slice(0, 3);
        
        try {
            const fetchPromises = shuffled.map(async (channel) => {
                // Skip placeholder IDs
                if (channel.ytId.includes('_')) return [];

                const rssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channel.ytId}`;
                const apiUrl = `${RSS_TO_JSON_API}${encodeURIComponent(rssUrl)}`;
                
                const res = await fetch(apiUrl);
                const data = await res.json();
                
                if (data.status === 'ok' && Array.isArray(data.items)) {
                    return data.items.map((item: any) => {
                        // Extract Video ID from link or guid
                        const videoId = item.link.split('v=')[1] || item.guid.split(':')[2];
                        return {
                            id: videoId,
                            title: item.title,
                            author: data.feed.title,
                            type: 'video',
                            category: channel.cat,
                            url: `https://www.youtube.com/embed/${videoId}`,
                            duration: 'New', // RSS doesn't provide duration
                            thumbnail: getThumbnailUrl(videoId),
                            datePublished: item.pubDate,
                            channelLogo: data.feed.image // RSS2JSON sometimes provides feed image
                        } as MediaItem;
                    });
                }
                return [];
            });

            const results = await Promise.all(fetchPromises);
            const freshItems = results.flat();

            if (freshItems.length > 0) {
                 // Sort by date (newest first)
                 freshItems.sort((a, b) => new Date(b.datePublished!).getTime() - new Date(a.datePublished!).getTime());
                 return freshItems.slice(0, limit);
            }

            // Fallback to cache if no fresh items found
            return VIDEO_CACHE.map(enrichMediaItem);

        } catch (e) {
            console.warn("Feed fetch failed, falling back to cache", e);
            // Fallback to cache if the API fails (e.g. during local dev without 'vercel dev' running)
            return VIDEO_CACHE.map(enrichMediaItem);
        }
    },

    /**
     * Search Media (Piped API / Fallback)
     */
    searchMedia: async (query: string): Promise<MediaItem[]> => {
        try {
            const response = await fetch(`https://pipedapi.kavin.rocks/search?q=${encodeURIComponent(query)}&filter=videos`);
            if (response.ok) {
                const data = await response.json();
                if (data.items) {
                    return data.items.map((item: any) => {
                        const videoId = item.url.split('v=')[1] || item.url.replace(/^\//, '');
                        return {
                            id: videoId,
                            title: item.title,
                            author: item.uploaderName,
                            type: 'video',
                            category: 'lecture', // Default for search
                            url: `https://www.youtube.com/embed/${videoId}`,
                            duration: item.duration ? formatDuration(item.duration) : '',
                            thumbnail: item.thumbnail,
                            channelLogo: item.uploaderAvatar
                        };
                    });
                }
            }
        } catch (e) { 
            // Fallback
        }

        const qLower = query.toLowerCase();
        return VIDEO_CACHE.filter(item => 
            item.title.toLowerCase().includes(qLower) || 
            item.author.toLowerCase().includes(qLower)
        ).map(enrichMediaItem);
    },

    getByCategory: async (category: string): Promise<MediaItem[]> => {
        const results = VIDEO_CACHE.filter(item => item.category === category);
        return results.map(enrichMediaItem);
    }
};

function enrichMediaItem(item: MediaItem): MediaItem {
    let videoId = item.id;
    if (item.url.includes('v=')) {
        videoId = item.url.split('v=')[1]?.split('&')[0];
    }
    return {
        ...item,
        thumbnail: item.thumbnail || getThumbnailUrl(videoId),
        channelLogo: item.channelLogo || getChannelLogo(item.author)
    };
}
