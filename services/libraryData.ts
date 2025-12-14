
import { LibraryBook } from '../types';
import { AVAILABLE_BOOKS } from './hadithService';
import { fetchAvailableTafsirEditions } from './quranService';

// --- STATIC CLASSICAL TEXTS (Simulated) ---
export const CLASSICAL_TEXTS: LibraryBook[] = [
    {
        id: 'seerah_sealed_nectar',
        title: 'The Sealed Nectar (Ar-Raheeq Al-Makhtum)',
        author: 'Safiur Rahman Mubarakpuri',
        category: 'classical_texts',
        description: "A complete authoritative book on the life of Prophet Muhammad (ﷺ).",
        coverColor: 'bg-emerald-700',
        sourceType: 'static_text',
        chapters: [
            {
                id: 'ch1',
                title: 'Location and Nature of Arab Tribes',
                content: `Beyond a shadow of doubt, the biography of Prophet Muhammad (ﷺ) represent a minute detail of the Divine Message...`
            },
            {
                id: 'ch2',
                title: 'The Birth of the Prophet',
                content: `Muhammad (ﷺ) was born in Bani Hashim lane in Makkah on Monday morning, the ninth of Rabi' Al-Awwal...`
            }
        ]
    },
    {
        id: 'fiqh_bulugh',
        title: 'Bulugh al-Maram',
        author: 'Ibn Hajar al-Asqalani',
        category: 'classical_texts',
        description: "Attainment of the Objective According to Evidence of the Ordinances.",
        coverColor: 'bg-blue-700',
        sourceType: 'static_text',
        chapters: [
            {
                id: 'ch1',
                title: 'The Book of Purification',
                content: `Narrated Abu Huraira: The Prophet (ﷺ) said regarding the sea, "Its water is purifying and its dead (animals) are lawful to eat."`
            }
        ]
    }
];

export const getLibraryCatalog = async (language: string): Promise<LibraryBook[]> => {
    const catalog: LibraryBook[] = [];

    // 0. ADHKAR & DUAS (Integrate DhikrModule here)
    catalog.push({
        id: 'hisn_muslim',
        title: 'Hisn al-Muslim (Adhkar & Dua)',
        author: 'Saeed bin Ali bin Wahf Al-Qahtani',
        category: 'classical_texts', // Or separate category
        description: 'Fortress of the Muslim - Daily Adhkar and Supplications.',
        sourceType: 'static_text',
        coverColor: 'bg-amber-600',
        // Chapters will be dynamically mapped in UI from knowledgeData
    });

    // 1. QURAN & TAFSIR
    catalog.push({
        id: 'quran_main',
        title: 'The Noble Quran',
        author: 'Allah (SWT)',
        category: 'quran_tafsir',
        description: 'Complete Arabic text with translation and audio.',
        sourceType: 'api_quran',
        coverColor: 'bg-emerald-800'
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
            coverColor: 'bg-teal-700'
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
            coverColor: 'bg-indigo-700'
        });
    });

    // 3. CLASSICAL TEXTS
    CLASSICAL_TEXTS.forEach(book => catalog.push(book));

    return catalog;
};
