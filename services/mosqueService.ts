import { Mosque } from '../types';

/**
 * MosqueService handles communication with the Mawaqit API via a proxy.
 * It provides methods for searching mosques and fetching prayer times.
 */

const PROXY_URL = '/api/mawaqit-proxy';

const safeString = (val: any): string => {
    if (typeof val === 'string') return val;
    if (typeof val === 'number') return String(val);
    return '';
};

export const MosqueService = {
    /**
     * Search for mosques using a text query (city or name).
     */
    search: async (query: string): Promise<Mosque[]> => {
        try {
            const q = query.trim();
            if (!q) return [];

            const response = await fetch(`${PROXY_URL}?q=${encodeURIComponent(q)}`);
            
            if (!response.ok) {
                if (response.status === 404) console.error("Proxy not found at /api/mawaqit-proxy");
                return [];
            }

            const data = await response.json();
            
            // Mawaqit API often returns a list in 'mosques' key or as a direct array
            const results = data.mosques || (Array.isArray(data) ? data : []);
            
            return results.map((m: any) => ({
                id: m.uuid || m.id || m.slug,
                slug: m.slug,
                name: safeString(m.name || m.label),
                address: safeString(m.address || m.city || ''),
                image: m.image ? (m.image.startsWith('http') ? m.image : `https://mawaqit.net${m.image}`) : undefined,
                label: `${m.name} (${m.city || ''})`
            }));
        } catch (error) {
            console.error("MosqueService Search Error:", error);
            return [];
        }
    },

    /**
     * Search for mosques near specific coordinates.
     */
    searchNearby: async (lat: number, lng: number): Promise<Mosque[]> => {
        try {
            const response = await fetch(`${PROXY_URL}?lat=${lat}&lng=${lng}`);
            if (!response.ok) return [];

            const data = await response.json();
            const results = data.mosques || (Array.isArray(data) ? data : []);

            return results.map((m: any) => ({
                id: m.uuid || m.id || m.slug,
                slug: m.slug,
                name: safeString(m.name || m.label),
                address: safeString(m.address || m.city || ''),
                image: m.image ? (m.image.startsWith('http') ? m.image : `https://mawaqit.net${m.image}`) : undefined,
                label: `${m.name} (${m.city || ''})`
            }));
        } catch (error) {
            console.error("MosqueService Nearby Search Error:", error);
            return [];
        }
    },

    /**
     * Fetch complete prayer time data for a specific mosque.
     */
    fetchMosqueData: async (slug: string): Promise<any | null> => {
        try {
            const response = await fetch(`${PROXY_URL}?slug=${slug}`);
            if (!response.ok) return null;
            return await response.json();
        } catch (error) {
            console.error("MosqueService Fetch Data Error:", error);
            return null;
        }
    },

    /**
     * Convert a city name to coordinates using Nominatim via proxy.
     */
    geocode: async (query: string): Promise<{ lat: number, lng: number } | null> => {
        try {
            const response = await fetch(`${PROXY_URL}?action=geocode&q=${encodeURIComponent(query)}`);
            if (!response.ok) return null;
            
            const data = await response.json();
            if (Array.isArray(data) && data.length > 0) {
                return {
                    lat: parseFloat(data[0].lat),
                    lng: parseFloat(data[0].lon)
                };
            }
        } catch (error) {
            console.error("MosqueService Geocode Error:", error);
        }
        return null;
    },

    /**
     * Helper to extract prayer times for today from Mawaqit JSON response.
     */
    extractTimesForToday: (data: any): { adhan: Record<string, string>, iqama: Record<string, string> } | null => {
        if (!data) return null;
        const now = new Date();
        const start = new Date(now.getFullYear(), 0, 0);
        const diff = (now.getTime() - start.getTime()) + ((start.getTimezoneOffset() - now.getTimezoneOffset()) * 60 * 1000);
        const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));

        // Mawaqit data usually has a 'calendar' array or 'times' array
        let todayTimes = data.calendar?.[dayOfYear - 1] || data.calendar?.[dayOfYear] || data.times;
        if (!todayTimes || todayTimes.length < 5) return null;

        const adhan = { 
            fajr: todayTimes[0], 
            sunrise: todayTimes[1], 
            dhuhr: todayTimes[2], 
            asr: todayTimes[3], 
            maghrib: todayTimes[4], 
            isha: todayTimes[5] 
        };

        const iqamaConfigs = data.config?.iqama || [];
        const iqama: Record<string, string> = {}; 

        const addMinutes = (timeStr: string, minStr: string) => {
             if (!timeStr || !minStr) return timeStr;
             const min = parseInt(minStr.replace('+', ''));
             if (isNaN(min)) return timeStr;
             const [h, m] = timeStr.split(':').map(Number);
             const d = new Date(); 
             d.setHours(h, m + min, 0, 0);
             return `${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}`;
        };

        ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'].forEach((key, index) => {
            const config = iqamaConfigs[index];
            const adhanTime = (adhan as any)[key];
            if (config && adhanTime) {
                if (config.startsWith('+') || config.startsWith('-')) iqama[key] = addMinutes(adhanTime, config);
                else if (config.includes(':')) iqama[key] = config;
                else iqama[key] = adhanTime;
            } else { 
                iqama[key] = adhanTime; 
            }
        });
        
        iqama['sunrise'] = '';
        return { adhan, iqama };
    }
};