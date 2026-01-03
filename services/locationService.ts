
import { UserCoordinates } from '../types';

const PROXY_URL = '/api/mawaqit-proxy';

export const LocationService = {
    /**
     * Resolve a city name to latitude and longitude using Nominatim.
     */
    geocode: async (query: string): Promise<{ lat: number, lng: number, name: string } | null> => {
        try {
            const response = await fetch(`${PROXY_URL}?action=geocode&q=${encodeURIComponent(query)}`);
            if (!response.ok) return null;
            
            const data = await response.json();
            if (Array.isArray(data) && data.length > 0) {
                return {
                    lat: parseFloat(data[0].lat),
                    lng: parseFloat(data[0].lon),
                    name: data[0].display_name
                };
            }
        } catch (error) {
            console.error("Geocode Error:", error);
        }
        return null;
    }
};
