
import { MediaItem } from '@/types';
import { GoogleGenAI } from "@google/genai";

const RSS_TO_JSON_API = 'https://api.rss2json.com/v1/api.json?rss_url=';
const YOUTUBE_RSS_BASE = 'https://www.youtube.com/feeds/videos.xml?channel_id=';

const CHANNELS = [
    { id: 'menk', ytId: 'UCTSLKqAm-S_jZk42Wd-z_DQ', name: 'Mufti Menk' },
    { id: 'bayyinah', ytId: 'UCeM7c1D2C6pC5zQ7k1z1u_g', name: 'Nouman Ali Khan' },
    { id: 'yaqeen', ytId: 'UC3vPWjJ7wA4p_1c7K_3qE1g', name: 'Yaqeen Institute' },
    { id: 'yasir_qadhi', ytId: 'UC37o9G5k650f9f3XjN_V24A', name: 'Yasir Qadhi' },
    { id: 'mercifulservant', ytId: 'UC7E3pIn5P2pP360jXo_tIBA', name: 'MercifulServant' }
];

const FALLBACK_MEDIA: MediaItem[] = [
    {
        id: 'P9p8_6_C8_c',
        title: 'The Purpose of Life',
        author: 'Mufti Menk',
        type: 'video',
        category: 'lecture',
        url: `https://www.youtube.com/embed/P9p8_6_C8_c?autoplay=1&rel=0&enablejsapi=1`,
        duration: '12:45',
        thumbnail: 'https://img.youtube.com/vi/P9p8_6_C8_c/mqdefault.jpg',
        datePublished: new Date().toISOString()
    }
];

const sanitizeVideoId = (id: string): string => {
    if (!id) return '';
    let clean = id.trim();
    if (clean.includes('v=')) {
        clean = clean.split('v=')[1].split('&')[0];
    } else if (clean.includes('youtu.be/')) {
        clean = clean.split('youtu.be/')[1].split('?')[0];
    } else if (clean.includes('embed/')) {
        clean = clean.split('embed/')[1].split('?')[0];
    }
    return clean.split(/[?&]/)[0];
};

const constructMediaItem = (videoId: string, title: string, author: string, category: any = 'lecture'): MediaItem => {
    const cleanId = sanitizeVideoId(videoId);
    const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
    
    return {
        id: cleanId,
        title: title || 'Islamic Lecture',
        author: author || 'Scholar',
        type: 'video',
        category: category,
        url: `https://www.youtube.com/embed/${cleanId}?autoplay=1&rel=0&origin=${encodeURIComponent(origin)}&enablejsapi=1`,
        duration: 'VIDEO',
        thumbnail: `https://img.youtube.com/vi/${cleanId}/mqdefault.jpg`,
        datePublished: new Date().toISOString()
    };
};

export const MultimediaService = {
    getFeedMedia: async (limit: number = 12): Promise<MediaItem[]> => {
        try {
            const feedPromises = CHANNELS.map(async (channel) => {
                try {
                    const proxyUrl = `${RSS_TO_JSON_API}${encodeURIComponent(YOUTUBE_RSS_BASE + channel.ytId)}`;
                    const response = await fetch(proxyUrl, { cache: 'no-store' });
                    const data = await response.json();
                    
                    if (!data.items) return [];

                    return data.items.slice(0, 3).map((item: any) => {
                        let videoId = '';
                        if (item.link && item.link.includes('v=')) {
                            videoId = item.link.split('v=')[1].split('&')[0];
                        } else {
                            videoId = item.link.split('/').pop() || '';
                        }
                        return constructMediaItem(videoId, item.title, channel.name);
                    });
                } catch (e) {
                    return [];
                }
            });

            const results = await Promise.all(feedPromises);
            const combined = [...results.flat(), ...FALLBACK_MEDIA]
                .filter((v, i, a) => a.findIndex(t => t.id === v.id) === i)
                .sort(() => 0.5 - Math.random())
                .slice(0, limit);

            return combined;
        } catch (e) {
            return FALLBACK_MEDIA;
        }
    },

    searchMedia: async (query: string): Promise<MediaItem[]> => {
        if (!query || query.length < 2) return [];
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const prompt = `Find 8 real Islamic YouTube video IDs for: "${query}". Return strictly JSON array: [{"id": "ID", "title": "TITLE", "channel": "CHANNEL"}]`;
            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: prompt,
            });
            const text = response.text || "";
            const jsonMatch = text.match(/\[[\s\S]*\]/);
            if (!jsonMatch) throw new Error();
            const videoList = JSON.parse(jsonMatch[0]);
            return videoList.map((v: any) => constructMediaItem(v.id, v.title, v.channel));
        } catch (e) {
            return FALLBACK_MEDIA.filter(m => m.title.toLowerCase().includes(query.toLowerCase()));
        }
    }
};
