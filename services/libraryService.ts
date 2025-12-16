
import { LibraryBook, BookStructureNode } from '../types';
import { getMockData } from './libraryData';
import { fetchSurahList } from './quranService';
import { fetchSections } from './hadithService';

const STORAGE_KEY_STRUCTURE = 'nurprayer_structure_';
const STORAGE_KEY_CONTENT = 'nurprayer_content_';

export const LibraryService = {
  
  /**
   * STEP 1: Fetch and Cache the Book Structure (Index)
   * This retrieves the list of chapters/surahs.
   */
  fetchAndCacheStructure: async (book: LibraryBook, language: string): Promise<BookStructureNode[]> => {
    // 1. Check Local Cache (Optional: remove this if you want fresh data every time during dev)
    const cached = localStorage.getItem(`${STORAGE_KEY_STRUCTURE}${book.id}`);
    if (cached) {
        // return JSON.parse(cached); // Uncomment to use cache
    }

    let structure: BookStructureNode[] = [];

    try {
        if (book.sourceType === 'api_quran') {
            const surahs = await fetchSurahList();
            structure = surahs.map(s => ({
                id: s.number.toString(),
                title: `${s.number}. ${s.englishName}`,
                number: s.number,
                // Reliable Audio Source
                audioUrl: `https://download.quranicaudio.com/quran/mishaari_raashid_al_3afaasee/${s.number.toString().padStart(3, '0')}.mp3`
            }));
        } 
        else if (book.sourceType === 'api_hadith' && book.apiId) {
            const { sections } = await fetchSections(book.apiId, language);
            structure = sections.map(s => ({
                id: s.id,
                title: s.title
            }));
        }
        else if (book.sourceType === 'static_text') {
            // Force load from Mock Data
            // In a real app, this would be: await fetch(book.structureCdnUrl).then(r => r.json())
            const mock = getMockData('structure', book.structureCdnUrl || '');
            structure = mock || [];
        }
    } catch (e) {
        console.error("Structure fetch error", e);
        return [];
    }

    // 3. Save to Cache
    if (structure.length > 0) {
        try {
            localStorage.setItem(`${STORAGE_KEY_STRUCTURE}${book.id}`, JSON.stringify(structure));
        } catch (e) {
            console.warn("Quota exceeded for structure cache");
        }
    }

    return structure;
  },

  /**
   * STEP 2: Check if heavy content is downloaded
   */
  isContentDownloaded: (bookId: string): boolean => {
    // We check if the KEY exists in localStorage
    return !!localStorage.getItem(`${STORAGE_KEY_CONTENT}${bookId}`);
  },

  /**
   * STEP 3: Download Content (Heavy)
   * This simulates downloading the big JSON text file and saving it.
   */
  downloadContent: (book: LibraryBook, onProgress: (progress: number) => void): Promise<void> => {
    return new Promise((resolve, reject) => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10; 
        onProgress(progress);

        if (progress >= 100) {
          clearInterval(interval);
          try {
            // Retrieve the Mock Content Data
            const mockContent = getMockData('content', book.contentCdnUrl || '');
            
            if (mockContent) {
                // Save it to LocalStorage simulating a file save
                localStorage.setItem(`${STORAGE_KEY_CONTENT}${book.id}`, JSON.stringify(mockContent));
                resolve();
            } else {
                reject(new Error("No content found on server"));
            }
          } catch (e) {
            console.error("Storage quota exceeded or save failed", e);
            reject(e);
          }
        }
      }, 100); // 1 second total download time
    });
  },

  /**
   * STEP 4: Get Content (Read)
   * Retrieves the specific chapter text from the big downloaded object.
   */
  getContent: (bookId: string): any | null => {
      const data = localStorage.getItem(`${STORAGE_KEY_CONTENT}${bookId}`);
      return data ? JSON.parse(data) : null;
  },

  /**
   * Helper for SearchService: Get all downloaded books for indexing/scanning
   */
  getAllDownloadedContent: (): Array<{ bookId: string, content: Record<string, string> }> => {
      const results = [];
      for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith(STORAGE_KEY_CONTENT)) {
              const bookId = key.replace(STORAGE_KEY_CONTENT, '');
              const contentStr = localStorage.getItem(key);
              if (contentStr) {
                  try {
                      const content = JSON.parse(contentStr);
                      // Only process static text books which are simple Key-Value pairs
                      if (typeof content === 'object' && !Array.isArray(content)) {
                          results.push({ bookId, content });
                      }
                  } catch (e) {
                      // ignore parse errors
                  }
              }
          }
      }
      return results;
  }
};
