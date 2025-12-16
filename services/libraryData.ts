
import { LibraryBook, BookStructureNode } from '../types';
import { AVAILABLE_BOOKS } from './hadithService';
import { fetchAvailableTafsirEditions } from './quranService';

// --- MOCK DATA FOR SIMULATION (STRONGLY TYPED) ---

// 1. SEERAH STRUCTURE (Expanded)
const MOCK_STRUCTURE_SEERAH: BookStructureNode[] = [
    { id: 'ch1', title: '1. Location and Nature of Arab Tribes' },
    { id: 'ch2', title: '2. Rulership and Princeship among the Arabs' },
    { id: 'ch3', title: '3. Religions of the Arabs' },
    { id: 'ch4', title: '4. The Lineage and Family of Muhammad (ﷺ)' },
    { id: 'ch5', title: '5. The Birth of the Prophet (ﷺ)' },
    { id: 'ch6', title: '6. Life in Makkah' },
    { id: 'ch7', title: '7. The Prophethood and Revelation' },
    { id: 'ch8', title: '8. Phases of the Call (Dawah)' },
    { id: 'ch9', title: '9. Persecution of the Muslims' },
    { id: 'ch10', title: '10. The Migration to Abyssinia' },
    { id: 'ch11', title: '11. The Year of Grief (Am al-Huzn)' },
    { id: 'ch12', title: '12. The Night Journey (Isra and Mi\'raj)' },
    { id: 'ch13', title: '13. The Pledges of Aqabah' },
    { id: 'ch14', title: '14. The Migration (Hijrah) to Madinah' },
    { id: 'ch15', title: '15. Life in Madinah' },
    { id: 'ch16', title: '16. The Battle of Badr' },
    { id: 'ch17', title: '17. The Battle of Uhud' },
    { id: 'ch18', title: '18. The Battle of the Trench (Ahzab)' },
    { id: 'ch19', title: '19. The Treaty of Hudaibiyah' },
    { id: 'ch20', title: '20. The Conquest of Makkah' },
    { id: 'ch21', title: '21. The Battle of Hunain' },
    { id: 'ch22', title: '22. The Farewell Pilgrimage' },
    { id: 'ch23', title: '23. The Death of the Prophet (ﷺ)' }
];

// 2. SEERAH CONTENT (The Text - Placeholder for demo)
const MOCK_CONTENT_SEERAH: Record<string, string> = {
    'ch1': "Beyond a shadow of doubt, the biography of Prophet Muhammad (ﷺ) represents a minute detail of the Divine Message. \n\nThe Arabian Peninsula is enclosed in the west by the Red Sea and Sinai, in the east by the Arabian Gulf, in the south by the Arabian Sea, which is an extension of the Indian Ocean, and in the north by old Syria and part of Iraq.",
    'ch2': "The Arabs were divided into different tribes, each with its own leader or chief. The system of leadership was based on tribal lineage and honor.",
    'ch5': "Muhammad (ﷺ) was born in Bani Hashim lane in Makkah on Monday morning, the ninth of Rabi' Al-Awwal, the same year of the Elephant Event, and forty years of the reign of Kisra (Khosru Nushirwan), i.e. the twentieth or twenty-second of April, 571 A.D., according to the scholar Muhammad Sulaimân Al-Mansourpuri, and the astrologer Mahmoud Pasha.",
    'ch14': "The migration (Hijrah) to Madinah changed the course of history. It marked the beginning of the Islamic Calendar and the establishment of the first Islamic state.",
    'ch16': "The Battle of Badr was the first decisive battle between Truth and Falsehood. Despite being outnumbered, the Muslims were granted victory by the permission of Allah."
};

// --- CATALOG GENERATION ---

export const getLibraryCatalog = async (language: string): Promise<LibraryBook[]> => {
    const catalog: LibraryBook[] = [];

    // 1. QURAN & TAFSIR
    catalog.push({
        id: 'quran_main',
        title: 'The Noble Quran',
        author: 'Allah (SWT)',
        category: 'quran_tafsir',
        description: 'Complete Arabic text with translation and audio.',
        sourceType: 'api_quran',
        coverColor: 'bg-emerald-800',
        structureCdnUrl: 'api_quran_structure', 
        contentCdnUrl: 'api_quran_content'
    });

    // Add Tafsirs as "Books"
    const tafsirs = await fetchAvailableTafsirEditions(language);
    tafsirs.forEach(t => {
        catalog.push({
            id: `tafsir_${t.id}`,
            title: t.name,
            author: t.author,
            category: 'quran_tafsir',
            description: `Complete Tafsir in ${t.language.toUpperCase()}.`,
            sourceType: 'api_quran',
            apiId: t.id,
            coverColor: 'bg-teal-700',
            structureCdnUrl: 'api_quran_structure'
        });
    });

    // 2. HADITH COLLECTIONS
    AVAILABLE_BOOKS.forEach(book => {
        catalog.push({
            id: `hadith_${book.id}`,
            title: book.title,
            author: book.collection === 'six_books' ? 'Imam ' + book.title.split(' ')[1] : 'Various',
            category: 'hadith_collections',
            description: book.arabicTitle,
            sourceType: 'api_hadith',
            apiId: book.id,
            coverColor: 'bg-indigo-700',
            structureCdnUrl: `api_hadith_${book.id}_structure`
        });
    });

    // 3. CLASSICAL TEXTS
    catalog.push({
        id: 'seerah_sealed_nectar',
        title: 'The Sealed Nectar',
        author: 'Safiur Rahman Mubarakpuri',
        category: 'classical_texts',
        description: "A complete authoritative book on the life of Prophet Muhammad (ﷺ).",
        coverColor: 'bg-emerald-700',
        sourceType: 'static_text',
        structureCdnUrl: 'mock_structure_seerah',
        contentCdnUrl: 'mock_content_seerah'
    });
    
    // Note: Hisn Muslim removed from here as it now has a dedicated Tab

    return catalog;
};

// Helper for the simulated service to grab mock data
export const getMockData = (type: 'structure' | 'content', id: string): any => {
    // Seerah Mocks
    if (id === 'mock_structure_seerah') return MOCK_STRUCTURE_SEERAH;
    if (id === 'mock_content_seerah') return MOCK_CONTENT_SEERAH;
    
    // Fallback Mocks if ID doesn't match
    if (type === 'structure') return [
        { id: '1', title: 'Chapter 1: Introduction' }, 
        { id: '2', title: 'Chapter 2: Foundations' }
    ];
    if (type === 'content') return {
        '1': 'This is placeholder content for Chapter 1.',
        '2': 'This is placeholder content for Chapter 2.'
    };
    return null;
}

// NEW: Export helper to search all static text content available in the app bundle
export const getStaticContentForSearch = () => {
    return [
        { id: 'seerah_sealed_nectar', title: 'The Sealed Nectar', content: MOCK_CONTENT_SEERAH }
    ];
}
