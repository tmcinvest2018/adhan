
import { LibraryBook, MediaItem } from '../types';

const CACHE_NAME = 'nurprayer-ilmhub-v1';

export const DownloadService = {
  /**
   * Generates a unique cache key for an item
   */
  getKey: (id: string) => `https://nurprayer.app/offline-content/${id}`,

  /**
   * Checks if an item is currently cached
   */
  isAvailableOffline: async (id: string): Promise<boolean> => {
    if (!('caches' in window)) return false;
    try {
      const cache = await caches.open(CACHE_NAME);
      const response = await cache.match(DownloadService.getKey(id));
      return !!response;
    } catch (e) {
      console.error('Cache check failed', e);
      return false;
    }
  },

  /**
   * Saves content to cache.
   * For Books: Saves the full JSON object including content.
   * For Media: Saves metadata. (Actual YouTube video downloading is blocked by CORS/TOS).
   */
  saveForOffline: async (id: string, data: any): Promise<void> => {
    if (!('caches' in window)) throw new Error("Cache API not supported");
    
    const cache = await caches.open(CACHE_NAME);
    
    // Create a JSON response
    const jsonResponse = new Response(JSON.stringify(data), {
      headers: { 'Content-Type': 'application/json' }
    });

    await cache.put(DownloadService.getKey(id), jsonResponse);
  },

  /**
   * Removes content from cache
   */
  removeOfflineContent: async (id: string): Promise<void> => {
    if (!('caches' in window)) return;
    const cache = await caches.open(CACHE_NAME);
    await cache.delete(DownloadService.getKey(id));
  },

  /**
   * Retrieves content from cache
   */
  getOfflineContent: async <T>(id: string): Promise<T | null> => {
    if (!('caches' in window)) return null;
    try {
      const cache = await caches.open(CACHE_NAME);
      const response = await cache.match(DownloadService.getKey(id));
      if (!response) return null;
      return await response.json();
    } catch (e) {
      return null;
    }
  }
};
