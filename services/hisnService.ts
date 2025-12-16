
import { HISN_DB } from './hisnData';

export interface HisnSection {
    id: string;
    title: string;
    hadith_count: number;
}

export interface HisnItem {
    id: string;
    category_id: string;
    category_title: string;
    arabic_text: string;
    translation: string;
    reference_source: string;
    recommended_repeat_count: number;
}

export const HisnService = {
    
    /**
     * Get Categories
     * Returns the full list from local database.
     */
    getChapters: async (): Promise<HisnSection[]> => {
        return HISN_DB.map(chapter => ({
            id: String(chapter.id),
            title: String(chapter.title),
            hadith_count: Array.isArray(chapter.hadiths) ? chapter.hadiths.length : 0
        }));
    },

    /**
     * Get Items for Specific Chapter
     * Fetches directly from local const with strict type sanitization.
     */
    getDuas: async (categoryId: string, categoryTitle: string): Promise<HisnItem[]> => {
        // Find Chapter (Handle type mismatches in ID)
        const chapter = HISN_DB.find((c) => String(c.id) === String(categoryId));

        if (!chapter || !Array.isArray(chapter.hadiths)) {
            return [];
        }

        // Map to internal HisnItem format
        return chapter.hadiths.map((h: any) => {
            // Handle multiple possible property names from different data versions
            // and force conversion to string to prevent [object Object] errors.
            const rawEn = h.text_en || h.translation || h.text || "";
            const rawAr = h.text_ar || h.arabic || "";
            const rawRef = h.reference || h.source || "";

            const textEn = typeof rawEn === 'string' ? rawEn : String(rawEn);
            const textAr = typeof rawAr === 'string' ? rawAr : String(rawAr);
            const textRef = typeof rawRef === 'string' ? rawRef : String(rawRef);

            const repeat = HisnService.extractRepeatCount(textEn);
            const cleanTrans = HisnService.cleanText(textEn);

            return {
                id: h.id ? String(h.id) : Math.random().toString(),
                category_id: String(categoryId),
                category_title: String(categoryTitle),
                arabic_text: textAr,
                translation: cleanTrans,
                reference_source: textRef || "Hisnul Muslim",
                recommended_repeat_count: repeat
            };
        });
    },

    extractRepeatCount: (text: string): number => {
        if (!text || typeof text !== 'string') return 1;
        const t = text.toLowerCase();
        if (t.includes('(3 times)') || t.includes('three times') || t.includes('3x')) return 3;
        if (t.includes('(4 times)')) return 4;
        if (t.includes('(7 times)')) return 7;
        if (t.includes('(10 times)')) return 10;
        if (t.includes('(33 times)')) return 33;
        if (t.includes('(100 times)')) return 100;
        return 1;
    },

    cleanText: (text: string): string => {
        if (!text || typeof text !== 'string') return "";
        return text
            .replace(/\(\d+ times\)/gi, '')
            .replace(/\(three times\)/gi, '')
            .trim();
    }
};
