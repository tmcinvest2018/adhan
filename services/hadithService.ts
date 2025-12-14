
import { HadithBookDef, HadithSection, HadithData, SearchResult } from '../types';

const BASE_URL = 'https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1';

export const AVAILABLE_BOOKS: HadithBookDef[] = [
    { id: 'bukhari', title: 'Sahih al-Bukhari', arabicTitle: 'صحيح البخاري', collection: 'six_books' },
    { id: 'muslim', title: 'Sahih Muslim', arabicTitle: 'صحيح مسلم', collection: 'six_books' },
    { id: 'nasai', title: 'Sunan an-Nasa\'i', arabicTitle: 'سنن النسائي', collection: 'six_books' },
    { id: 'abudawud', title: 'Sunan Abi Dawud', arabicTitle: 'سنن أبي داود', collection: 'six_books' },
    { id: 'tirmidhi', title: 'Jami\' at-Tirmidhi', arabicTitle: 'جامع الترمذي', collection: 'six_books' },
    { id: 'ibnmajah', title: 'Sunan Ibn Majah', arabicTitle: 'سنن ابن ماجه', collection: 'six_books' },
    { id: 'malik', title: 'Muwatta Malik', arabicTitle: 'موطأ مالك', collection: 'other' },
    { id: 'nawawi40', title: '40 Hadith Nawawi', arabicTitle: 'الأربعون النووية', collection: 'other' },
    { id: 'riyadussalihin', title: 'Riyad as-Salihin', arabicTitle: 'رياض الصالحين', collection: 'other' },
    { id: 'adab', title: 'Al-Adab Al-Mufrad', arabicTitle: 'الأدب المفرد', collection: 'other' }
];

const BOOK_MAP: Record<string, string> = {
    'nawawi40': 'nawawi',
};

// Specific overrides for books where the standard naming convention might fail
const EDITION_OVERRIDES: Record<string, string[]> = {
    'bukhari': ['eng-bukhari', 'eng-sahihbukhari', 'ara-bukhari'],
    'muslim': ['eng-muslim', 'eng-sahihmuslim', 'ara-muslim'],
    'malik': ['eng-malik', 'ara-malik'],
    'nawawi': ['eng-nawawi', 'ara-nawawi'],
};

const getEditionConfig = (bookId: string, language: string) => {
    const baseId = BOOK_MAP[bookId] || bookId;
    // The API mostly uses 'ara-{bookId}' and 'eng-{bookId}' as standards
    const arabicEdition = `ara-${baseId}`;
    let langCode = 'eng';
    
    if (language === 'tr') langCode = 'tur';
    else if (language === 'id') langCode = 'ind';
    else if (language === 'ur') langCode = 'urd';
    else if (language === 'bn') langCode = 'ben';
    
    const translationEdition = `${langCode}-${baseId}`;
    return { arabicEdition, translationEdition, baseId };
};

export const fetchSections = async (bookId: string, language: string): Promise<{sections: HadithSection[], editionId: string}> => {
    const { translationEdition, baseId } = getEditionConfig(bookId, language);
    
    // Robust Fallback Strategy:
    // 1. Try Target Language (e.g. tur-bukhari)
    // 2. Try Standard English (eng-bukhari)
    // 3. Try Overrides (e.g. eng-sahihbukhari)
    // 4. Try Arabic (ara-bukhari) - At least show Arabic titles instead of crashing
    
    let candidates = [translationEdition];
    if (!translationEdition.startsWith('eng-')) {
        candidates.push(`eng-${baseId}`);
    }
    
    if (EDITION_OVERRIDES[baseId]) {
        candidates = [...candidates, ...EDITION_OVERRIDES[baseId]];
    }
    
    candidates.push(`ara-${baseId}`); // Last resort

    const uniqueEditions = [...new Set(candidates)];
    
    for (const edition of uniqueEditions) {
        const url = `${BASE_URL}/editions/${edition}/sections.json`;
        try {
            const response = await fetch(url);
            if (response.ok) {
                const data = await response.json();
                
                // Parse Data
                let sections: HadithSection[] = [];
                if (Array.isArray(data)) {
                    // API returns ["Title 1", "Title 2"]
                    sections = data.map((title, idx) => ({ 
                        id: (idx+1).toString(), 
                        title: title || `Section ${idx+1}` 
                    }));
                } else if (typeof data === 'object' && data !== null) {
                    // API returns { "1": "Title", "2": "Title" }
                    sections = Object.entries(data)
                        .map(([id, title]) => ({ id, title: title as string }))
                        .filter(s => s.id !== '0' && s.title !== '') 
                        .sort((a, b) => {
                            const numA = parseFloat(a.id);
                            const numB = parseFloat(b.id);
                            return isNaN(numA) || isNaN(numB) ? a.id.localeCompare(b.id) : numA - numB;
                        });
                }

                if (sections.length > 0) {
                    return { sections, editionId: edition };
                }
            }
        } catch (e) {
            console.warn(`Failed to fetch sections for edition: ${edition}`, e);
            // Continue to next candidate
        }
    }

    console.error(`All section fetches failed for book: ${bookId}`);
    return { sections: [], editionId: '' };
};

export const fetchHadiths = async (bookId: string, sectionId: string, language: string): Promise<HadithData[]> => {
    const { arabicEdition, translationEdition, baseId } = getEditionConfig(bookId, language);
    
    const fetchEdition = (eid: string) => 
        fetch(`${BASE_URL}/editions/${eid}/sections/${sectionId}.json`)
        .then(r => r.ok ? r.json() : null)
        .catch(() => null);

    // Fetch Arabic (Source of Truth for Text) and Translation in parallel
    const [arabicRes, transRes] = await Promise.all([
        fetchEdition(arabicEdition),
        fetchEdition(translationEdition)
    ]);
    
    let finalTransRes = transRes;
    
    // Fallback to English if target translation is missing
    if (!finalTransRes && !translationEdition.startsWith('eng')) {
        finalTransRes = await fetchEdition(`eng-${baseId}`);
        // If standard english fails, try override english if available
        if (!finalTransRes && EDITION_OVERRIDES[baseId]) {
             const engOverride = EDITION_OVERRIDES[baseId].find(e => e.startsWith('eng'));
             if (engOverride) {
                 finalTransRes = await fetchEdition(engOverride);
             }
        }
    }

    const arabicList: HadithData[] = arabicRes?.hadiths || [];
    const transList: HadithData[] = finalTransRes?.hadiths || [];

    if (arabicList.length === 0 && transList.length === 0) return [];

    // Case 1: Only Translation available (Rare)
    if (arabicList.length === 0) {
        return transList.map(h => ({ 
            ...h, 
            arabicText: '', 
            translationText: h.text,
            grades: h.grades || []
        }));
    }

    // Case 2: Only Arabic available
    if (transList.length === 0) {
        return arabicList.map(h => ({ 
            ...h, 
            arabicText: h.text, 
            translationText: '', // Empty string to indicate missing translation
            grades: h.grades || []
        }));
    }

    // Case 3: Merge (Most common)
    return arabicList.map((aItem, index) => {
        // Try to match exact number
        let tItem = transList.find(t => t.hadithnumber === aItem.hadithnumber);
        
        // Fallback to index if numbers don't match
        if (!tItem && index < transList.length) {
            tItem = transList[index];
        }
        
        return {
            ...aItem,
            arabicText: aItem.text,
            translationText: tItem ? tItem.text : '',
            // Prefer grades from translation as they are often more structured in this API, 
            // but fallback to Arabic entry grades.
            grades: (tItem?.grades && tItem.grades.length > 0) ? tItem.grades : (aItem.grades || [])
        };
    });
};

export const searchHadithStructure = async (query: string): Promise<SearchResult[]> => {
    const results: SearchResult[] = [];
    const qLower = query.toLowerCase();

    AVAILABLE_BOOKS.forEach(book => {
        if(book.title.toLowerCase().includes(qLower) || book.arabicTitle.includes(query)) {
            results.push({
                id: `had_book_${book.id}`,
                category: 'hadith',
                title: book.title,
                subtitle: book.arabicTitle,
                contentPreview: "Hadith Collection",
                data: { bookId: book.id }
            });
        }
    });

    return results;
}

export const fetchDailyHadith = async (): Promise<HadithData | null> => {
    try {
        const randSection = Math.floor(Math.random() * 50) + 1; 
        const hadiths = await fetchHadiths('riyadussalihin', randSection.toString(), 'en');
        if(hadiths.length > 0) {
            return hadiths[Math.floor(Math.random() * hadiths.length)];
        }
        return null;
    } catch(e) {
        return null;
    }
}
