
import { Surah, Ayah, SearchResult, TafsirEdition } from '../types';

const BASE_URL = 'https://api.alquran.cloud/v1';

// Cache for Surah List
let surahListCache: Surah[] | null = null;
// Cache for Tafsir List
let tafsirListCache: TafsirEdition[] | null = null;

export const fetchSurahList = async (): Promise<Surah[]> => {
  if (surahListCache) return surahListCache;
  
  try {
    const response = await fetch(`${BASE_URL}/surah`);
    const data = await response.json();
    if (data.code === 200) {
      surahListCache = data.data;
      return data.data;
    }
    throw new Error('API Error');
  } catch (error) {
    console.error('Error fetching surah list:', error);
    return [];
  }
};

export const fetchAvailableTafsirEditions = async (language: string): Promise<TafsirEdition[]> => {
    let list: TafsirEdition[] = [];

    if (tafsirListCache) {
         list = tafsirListCache;
    } else {
        try {
            const response = await fetch(`${BASE_URL}/edition?type=tafsir&format=text`);
            const data = await response.json();

            if (data.code === 200 && Array.isArray(data.data)) {
                list = data.data.map((e: any) => ({
                    id: e.identifier,
                    name: e.englishName, 
                    author: e.name, 
                    language: e.language
                }));
            }
        } catch (e) {
            console.warn("Failed to fetch dynamic tafsirs, using fallback.", e);
        }
        
        if (!list.find(x => x.id === 'en.ibnkathir')) {
            list.push({ id: 'en.ibnkathir', name: 'Tafsir Ibn Kathir', author: 'Hafiz Ibn Kathir', language: 'en' });
        }
        if (!list.find(x => x.id === 'ar.jalalayn')) {
            list.push({ id: 'ar.jalalayn', name: 'Tafsir al-Jalalayn', author: 'Jalal al-Din', language: 'ar' });
        }
        
        tafsirListCache = list;
    }

    return sortTafsirs(list, language);
};

const sortTafsirs = (list: TafsirEdition[], language: string): TafsirEdition[] => {
    return [...list].sort((a, b) => {
        if (a.language === language && b.language !== language) return -1;
        if (a.language !== language && b.language === language) return 1;
        if (language !== 'ar') {
            if (a.id === 'en.ibnkathir' && b.id !== 'en.ibnkathir') return -1;
            if (a.id !== 'en.ibnkathir' && b.id === 'en.ibnkathir') return 1;
            if (a.language === 'en' && b.language !== 'en') return -1;
            if (a.language !== 'en' && b.language === 'en') return 1;
        }
        return a.name.localeCompare(b.name);
    });
}

export const fetchSurahContent = async (
    surahNumber: number, 
    reciterId: string = 'ar.alafasy',
    translationId: string = 'en.asahibehim',
    tafsirId: string | null = null 
): Promise<Ayah[]> => {
  try {
    const editions = [reciterId, translationId];
    
    const response = await fetch(`${BASE_URL}/surah/${surahNumber}/editions/${editions.join(',')}`);
    const data = await response.json();
    
    if (data.code === 200 && data.data.length >= 2) {
      const audioData = data.data[0].ayahs;
      const translationData = data.data[1].ayahs;

      const merged: Ayah[] = audioData.map((ayah: any, index: number) => ({
        ...ayah,
        translation: translationData[index].text,
        audio: ayah.audio,
      }));

      return merged;
    }
    throw new Error('Failed to load Surah');
  } catch (error) {
    console.error(error);
    return [];
  }
};

export const fetchAyahTafsir = async (surahNumber: number, ayahNumber: number, editionId: string = 'en.ibnkathir'): Promise<string> => {
    try {
        // IMPORTANT: Fetch specific Ayah ONLY.
        const response = await fetch(`${BASE_URL}/ayah/${surahNumber}:${ayahNumber}/${editionId}`);
        const data = await response.json();
        
        if(data.code === 200 && data.data) {
            // Some editions return array, some object. AlQuran Cloud usually returns object for single ayah fetch.
            // Ensure we are getting the 'text' property which contains the Tafsir.
            if (data.data.text && data.data.text !== data.data.content) {
                 return data.data.text; 
            }
            // Fallback if text is same as ayah content (unlikely for Tafsir editions, but possible for translations)
            return data.data.text;
        }
        return "Tafsir text unavailable for this specific Ayah.";
    } catch(e) {
        console.error("Tafsir Fetch Error", e);
        return "Error loading Tafsir. Please check internet connection.";
    }
}

export const searchAyahs = async (query: string, language: string): Promise<SearchResult[]> => {
    if (!query || query.length < 3) return [];

    try {
        let edition = 'en.sahih';
        if (language === 'nl') edition = 'nl.siregar';
        else if (language === 'fr') edition = 'fr.hamidullah';
        else if (language === 'id') edition = 'id.indonesian';
        if (/[\u0600-\u06FF]/.test(query)) edition = 'quran-simple-clean';

        const response = await fetch(`${BASE_URL}/search/${encodeURIComponent(query)}/all/${edition}`);
        const data = await response.json();

        if (data.code === 200 && data.data && data.data.matches) {
            return data.data.matches.slice(0, 10).map((match: any) => ({
                id: `quran_${match.surah.number}_${match.numberInSurah}`,
                category: 'quran',
                title: `Surah ${match.surah.englishName} ${match.surah.number}:${match.numberInSurah}`,
                subtitle: match.text, 
                data: {
                    surah: match.surah.number,
                    ayah: match.numberInSurah
                }
            }));
        }
        return [];
    } catch (e) {
        console.error("Quran Search Error", e);
        return [];
    }
};

export const RECITERS = [
    { id: 'ar.alafasy', name: 'Mishary Rashid Alafasy' },
    { id: 'ar.abdulbasitmurattal', name: 'Abdul Basit (Murattal)' },
    { id: 'ar.hudhaify', name: 'Ali Al-Hudhaify' },
    { id: 'ar.husary', name: 'Mahmoud Khalil Al-Husary' },
    { id: 'ar.sudais', name: 'Abdur-Rahman as-Sudais' },
];

export const TRANSLATIONS = [
    { id: 'en.sahih', name: 'English (Sahih International)' },
    { id: 'nl.siregar', name: 'Dutch (Sofian S. Siregar)' },
    { id: 'fr.hamidullah', name: 'French (Hamidullah)' },
    { id: 'tr.diyanet', name: 'Turkish (Diyanet Isleri)' },
    { id: 'id.indonesian', name: 'Indonesian' },
    { id: 'ur.jalandhry', name: 'Urdu (Jalandhry)' },
    { id: 'ru.kuliev', name: 'Russian (Kuliev)' },
];
