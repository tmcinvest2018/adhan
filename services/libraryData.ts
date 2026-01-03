
import { LibraryBook, BookStructureNode } from '../types';
import { AVAILABLE_BOOKS } from './hadithService';
import { fetchAvailableTafsirEditions } from './quranService';

// --- EXPANDED STRUCTURES FOR CLASSICAL BOOKS ---

const SEALED_NECTAR_STRUCTURE: BookStructureNode[] = [
    { id: 'ch1', title: 'Location and Nature of Arab Tribes' },
    { id: 'ch2', title: 'Rulership and Princeship among the Arabs' },
    { id: 'ch3', title: 'Religions of the Arabs' },
    { id: 'ch4', title: 'Aspects of Pre-Islamic Arabian Society' },
    { id: 'ch5', title: 'The Lineage and Family of Muhammad (ﷺ)' },
    { id: 'ch6', title: 'Birth and Forty Years prior to Prophethood' },
    { id: 'ch7', title: 'In the Shade of the Message and Prophethood' },
    { id: 'ch8', title: 'Phases and Stages of the Call' },
    { id: 'ch9', title: 'The First Stage: Strife in the Way of the Call' },
    { id: 'ch10', title: 'Second Phase: Open Preaching' },
    { id: 'ch11', title: 'Persecutions' },
    { id: 'ch12', title: 'The House of Al-Arqam' },
    { id: 'ch13', title: 'The First Migration to Abyssinia' },
    { id: 'ch14', title: 'Al-Isra and Al-Miraj' },
    { id: 'ch15', title: 'The First \'Aqabah Pledge' },
    { id: 'ch16', title: 'The Hijrah (Migration) to Madinah' },
    { id: 'ch17', title: 'Life in Madinah' },
    { id: 'ch18', title: 'The Battle of Badr' },
    { id: 'ch19', title: 'The Battle of Uhud' },
    { id: 'ch20', title: 'The Battle of the Trench (Al-Ahzab)' },
    { id: 'ch21', title: 'The Treaty of Hudaibiyah' },
    { id: 'ch22', title: 'The Conquest of Makkah' },
    { id: 'ch23', title: 'The Battle of Hunain' },
    { id: 'ch24', title: 'The Farewell Pilgrimage' },
    { id: 'ch25', title: 'The Journey to Allah (Death)' }
];

const GHAZALI_STRUCTURE: BookStructureNode[] = [
    { id: 'book1', title: 'Book 1: The Book of Knowledge' },
    { id: 'book2', title: 'Book 2: The Foundations of Belief' },
    { id: 'book3', title: 'Book 3: The Mysteries of Purity' },
    { id: 'book4', title: 'Book 4: The Mysteries of Prayer' },
    { id: 'book5', title: 'Book 5: The Mysteries of Zakat' },
    { id: 'book6', title: 'Book 6: The Mysteries of Fasting' },
    { id: 'book7', title: 'Book 7: The Mysteries of Pilgrimage' },
    { id: 'book8', title: 'Book 8: Etiquette of Quran Recitation' },
    { id: 'book9', title: 'Book 9: Invocations and Supplications' },
    { id: 'book10', title: 'Book 10: Arrangement of Litanies' },
    { id: 'book11', title: 'Book 11: On the Manners of Eating' },
    { id: 'book12', title: 'Book 12: On the Manners of Marriage' },
    { id: 'book13', title: 'Book 13: On Earning a Livelihood' },
    { id: 'book14', title: 'Book 14: The Lawful and Prohibited' },
    { id: 'book15', title: 'Book 15: Duties of Brotherhood' },
    { id: 'book21', title: 'Book 21: The Marvels of the Heart' },
    { id: 'book22', title: 'Book 22: Disciplining the Soul' },
    { id: 'book37', title: 'Book 37: Fear and Hope' },
    { id: 'book38', title: 'Book 38: Poverty and Abstinence' },
    { id: 'book40', title: 'Book 40: The Remembrance of Death' }
];

const IBN_KATHIR_STRUCTURE: BookStructureNode[] = [
    { id: 'vol1', title: 'Volume 1: Creation to Prophet Nuh' },
    { id: 'vol2', title: 'Volume 2: Prophets Ibrahim to Musa' },
    { id: 'vol3', title: 'Volume 3: Prophets Dawud to Isa' },
    { id: 'vol4', title: 'Volume 4: The Era of Pre-Islamic Arabs' },
    { id: 'vol5', title: 'Volume 5: The Life of Prophet Muhammad (Makkah)' },
    { id: 'vol6', title: 'Volume 6: The Life of Prophet Muhammad (Madinah)' },
    { id: 'vol7', title: 'Volume 7: The Caliphate of Abu Bakr' },
    { id: 'vol8', title: 'Volume 8: The Caliphate of Umar' },
    { id: 'vol9', title: 'Volume 9: The Caliphate of Uthman & Ali' },
    { id: 'vol10', title: 'Volume 10: The Umayyads & Abbasids' },
    { id: 'vol11', title: 'Volume 11: Signs of the Hour' }
];

const IBN_QAYYIM_STRUCTURE: BookStructureNode[] = [
    { id: 'ch1', title: 'The Rust of the Heart' },
    { id: 'ch2', title: 'Happiness of the Soul' },
    { id: 'ch3', title: 'Types of Dhikr' },
    { id: 'ch4', title: 'Benefits of Remembrance' },
    { id: 'ch5', title: 'The Weeping of the Sinner' },
    { id: 'ch6', title: 'Signs of a Healthy Heart' },
    { id: 'ch7', title: 'Signs of a Dead Heart' },
    { id: 'ch8', title: 'The Medicine for the Heart' }
];

// --- SAMPLE CONTENT SNIPPETS (To allow reading without 50MB bundle) ---

const SAMPLE_TEXT_MAP: Record<string, string> = {
    'ch1': "This chapter discusses the geographical location of the Arabs... \n\n(Full text available in download)",
    'ch2': "The leadership in Arabia was tribal... \n\n(Full text available in download)",
    'book1': "Knowledge is the most noble of things... \n\n(Full text available in download)",
    'vol1': "Allah created the heavens and the earth... \n\n(Full text available in download)"
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
    
    catalog.push({
        id: 'ihya_ulum',
        title: 'Ihya Ulum al-Din',
        author: 'Imam Al-Ghazali',
        category: 'classical_texts',
        description: "The Revival of the Religious Sciences. A masterpiece on Islamic spirituality and ethics.",
        coverColor: 'bg-amber-700',
        sourceType: 'static_text',
        structureCdnUrl: 'mock_structure_ghazali',
        contentCdnUrl: 'mock_content_ghazali'
    });

    catalog.push({
        id: 'bidaya_nihaya',
        title: 'Al-Bidayah wan-Nihayah',
        author: 'Imam Ibn Kathir',
        category: 'classical_texts',
        description: "The Beginning and the End. A comprehensive history of the world.",
        coverColor: 'bg-slate-700',
        sourceType: 'static_text',
        structureCdnUrl: 'mock_structure_ibnkathir',
        contentCdnUrl: 'mock_content_ibnkathir'
    });

    catalog.push({
        id: 'wabil_sayyib',
        title: 'Al-Wabil al-Sayyib',
        author: 'Ibn Qayyim al-Jawziyya',
        category: 'classical_texts',
        description: "The Invocation of God. A treatise on the importance of Dhikr.",
        coverColor: 'bg-blue-800',
        sourceType: 'static_text',
        structureCdnUrl: 'mock_structure_ibnqayyim',
        contentCdnUrl: 'mock_content_ibnqayyim'
    });

    return catalog;
};

// --- DATA ACCESSOR ---

export const getMockData = (type: 'structure' | 'content', id: string): any => {
    // Return full structures
    if (id === 'mock_structure_seerah') return SEALED_NECTAR_STRUCTURE;
    if (id === 'mock_structure_ghazali') return GHAZALI_STRUCTURE;
    if (id === 'mock_structure_ibnkathir') return IBN_KATHIR_STRUCTURE;
    if (id === 'mock_structure_ibnqayyim') return IBN_QAYYIM_STRUCTURE;

    // Return sample content for immediate reading (avoiding 50MB bundle)
    if (type === 'content') return SAMPLE_TEXT_MAP;
    
    return null;
}

export const getStaticContentForSearch = () => {
    // Expanded search index with placeholders
    return [
        { id: 'seerah_sealed_nectar', title: 'The Sealed Nectar', content: SAMPLE_TEXT_MAP },
        { id: 'ihya_ulum', title: 'Ihya Ulum al-Din', content: { ...SAMPLE_TEXT_MAP } },
    ];
}
