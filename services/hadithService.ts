
import { HadithBookDef, HadithSection, HadithData, SearchResult } from '../types';

const BASE_URL = 'https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1';

// VOLLEDIGE COLLECTIE: De 6 canonieke boeken + belangrijke compilaties
export const AVAILABLE_BOOKS: HadithBookDef[] = [
    { id: 'bukhari', title: 'Sahih al-Bukhari', arabicTitle: 'صحيح البخاري', collection: 'six_books' },
    { id: 'muslim', title: 'Sahih Muslim', arabicTitle: 'صحيح مسلم', collection: 'six_books' },
    { id: 'abudawud', title: 'Sunan Abu Dawud', arabicTitle: 'سنن أبي داود', collection: 'six_books' },
    { id: 'tirmidhi', title: 'Jami at-Tirmidhi', arabicTitle: 'جامع الترمذي', collection: 'six_books' },
    { id: 'nasai', title: 'Sunan an-Nasa\'i', arabicTitle: 'سنن النسائي', collection: 'six_books' },
    { id: 'ibnmajah', title: 'Sunan Ibn Majah', arabicTitle: 'سنن ابن ماجه', collection: 'six_books' },
    { id: 'malik', title: 'Muwatta Malik', arabicTitle: 'موطأ malik', collection: 'other' },
    { id: 'ahmad', title: 'Musnad Ahmad', arabicTitle: 'مسند أحمد', collection: 'other' },
    { id: 'adab', title: 'Al-Adab Al-Mufrad', arabicTitle: 'الأدب المفرد', collection: 'other' },
    { id: 'nawawi40', title: '40 Hadith Nawawi', arabicTitle: 'الأربعون النووية', collection: 'other' },
    { id: 'riyadussalihin', title: 'Riyad as-Salihin', arabicTitle: 'رياض الصالحين', collection: 'other' },
    { id: 'bulugh', title: 'Bulugh al-Maram', arabicTitle: 'بلوغ المرام', collection: 'other' }
];

// BACKUP STRUCTUUR: Om te garanderen dat de belangrijkste hoofdstukken altijd zichtbaar zijn
const STATIC_SECTIONS: Record<string, HadithSection[]> = {
    'bukhari': [
        { id: '1', title: 'Revelation' }, { id: '2', title: 'Belief (Al-Iman)' }, { id: '3', title: 'Knowledge' },
        { id: '4', title: 'Ablution (Wudu)' }, { id: '5', title: 'Bathing (Ghusl)' }, { id: '6', title: 'Menstrual Periods' },
        { id: '8', title: 'Prayers (Salat)' }, { id: '10', title: 'Call to Prayers (Adhan)' }, { id: '11', title: 'Friday Prayer' },
        { id: '13', title: 'The Two Festivals (Eids)' }, { id: '14', title: 'Witr Prayer' }, { id: '15', title: 'Invoking Allah for Rain' },
        { id: '24', title: 'Obligatory Charity Tax (Zakat)' }, { id: '25', title: 'Hajj (Pilgrimage)' }, { id: '30', title: 'Fasting (Saum)' },
        { id: '34', title: 'Sales and Trade' }, { id: '56', title: 'Jihad (Fighting for Allah)' }, { id: '60', title: 'Prophets' },
        { id: '65', title: 'Virtues of the Quran' }, { id: '67', title: 'Marriage (Nikah)' }, { id: '70', title: 'Food & Meals' },
        { id: '77', title: 'Dress' }, { id: '78', title: 'Good Manners (Al-Adab)' }, { id: '81', title: 'To make the Heart Tender (Riqaq)' },
        { id: '97', title: 'Oneness, Uniqueness of Allah (Tawheed)' }
    ],
    'muslim': [
        { id: '1', title: 'Faith (Kitab Al Iman)' }, { id: '2', title: 'Purification (Kitab Al-Taharah)' }, { id: '4', title: 'Prayer (Kitab As-Salat)' },
        { id: '5', title: 'Zakat (Kitab Az-Zakat)' }, { id: '6', title: 'Fasting (Kitab As-Sawm)' }, { id: '7', title: 'Pilgrimage (Kitab Al-Hajj)' },
        { id: '8', title: 'Marriage (Kitab An-Nikah)' }, { id: '10', title: 'Business Transactions' }, { id: '11', title: 'Inheritance' },
        { id: '24', title: 'The Book of Government' }, { id: '32', title: 'Jihad and Expedition' }, { id: '37', title: 'Clothes and Decoration' },
        { id: '41', title: 'Poetry' }, { id: '42', title: 'Dreams' }, { id: '44', title: 'Merits of the Companions' },
        { id: '46', title: 'Destiny (Qadr)' }, { id: '48', title: 'Remembrance (Dhikr) and Supplication' }
    ],
    'nawawi40': [
        { id: '1', title: 'The Complete 40 Hadith Collection' }
    ]
};

const FALLBACK_HADITHS: HadithData[] = [
    {
        hadithnumber: 1,
        arabicnumber: 1,
        text: "Actions are judged by intentions, so each man will have what he intended.",
        arabicText: "إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ",
        translationText: "Actions are judged by intentions...",
        grades: [{ name: "Grade", grade: "Sahih" }]
    }
];

export const fetchSections = async (bookId: string, language: string): Promise<{sections: HadithSection[], editionId: string}> => {
    const edition = `eng-${bookId}`; 
    try {
        const response = await fetch(`${BASE_URL}/editions/${edition}/sections.json`);
        if (response.ok) {
            const data = await response.json();
            let sections: HadithSection[] = [];
            
            // De API structuur kan variabel zijn: een plat object {"1": "Title"} of een object met metadata.
            const raw = data.sections || data;
            
            if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
                sections = Object.entries(raw)
                    .filter(([id, title]) => 
                        id !== '0' && 
                        id !== 'metadata' && 
                        title !== '' && 
                        title !== null && 
                        typeof title === 'string'
                    )
                    .map(([id, title]) => ({ id, title: title as string }));
            } else if (Array.isArray(raw)) {
                sections = raw.map((s: any) => ({
                    id: String(s.id || s.number),
                    title: String(s.title || s.englishTitle || `Hoofdstuk ${s.id}`)
                }));
            }

            if (sections.length > 0) {
                // Sorteer hoofdstukken numeriek
                sections.sort((a, b) => parseInt(a.id) - parseInt(b.id));
                return { sections, editionId: edition };
            }
        }
    } catch (e) {
        console.error(`Fout bij laden secties voor ${bookId}:`, e);
    }
    
    // Gebruik statische lijst indien beschikbaar, anders een gegenereerde fallback
    const fallback = STATIC_SECTIONS[bookId] || Array.from({length: 40}, (_, i) => ({ id: String(i+1), title: `Hoofdstuk ${i+1}` }));
    return { sections: fallback, editionId: edition };
};

export const fetchHadiths = async (bookId: string, sectionId: string, language: string): Promise<HadithData[]> => {
    try {
        const engEdition = `eng-${bookId}`;
        const araEdition = `ara-${bookId}`;

        // Haal parallel Engels en Arabisch op
        const [engRes, araRes] = await Promise.all([
            fetch(`${BASE_URL}/editions/${engEdition}/sections/${sectionId}.json`),
            fetch(`${BASE_URL}/editions/${araEdition}/sections/${sectionId}.json`).catch(() => null)
        ]);

        if (engRes.ok) {
            const engData = await engRes.json();
            const araData = araRes && araRes.ok ? await araRes.json() : null;
            
            if (engData && engData.hadiths) {
                return engData.hadiths.map((h: any, idx: number) => {
                    const arabicMatch = araData?.hadiths?.[idx];
                    return {
                        hadithnumber: h.hadithnumber || h.number || (idx + 1),
                        arabicnumber: h.arabicnumber || arabicMatch?.hadithnumber || '',
                        text: h.text,
                        arabicText: arabicMatch?.text || undefined,
                        grades: h.grades || [],
                        reference: h.reference || { book: parseInt(sectionId), hadith: h.hadithnumber }
                    };
                });
            }
        }
    } catch (e) {
        console.error(`Fout bij laden Hadiths voor ${bookId} sectie ${sectionId}:`, e);
    }
    return FALLBACK_HADITHS;
};

export const searchHadithStructure = async (query: string): Promise<SearchResult[]> => {
    const q = query.toLowerCase();
    return AVAILABLE_BOOKS.filter(b => 
        b.title.toLowerCase().includes(q) || 
        b.arabicTitle.includes(query)
    ).map(b => ({
        id: `had_book_${b.id}`,
        category: 'hadith',
        title: b.title,
        subtitle: b.arabicTitle,
        data: { bookId: b.id }
    }));
};

export const fetchDailyHadith = async (): Promise<HadithData | null> => {
    try {
        const response = await fetch(`${BASE_URL}/editions/eng-nawawi40/sections/1.json`);
        if (response.ok) {
             const data = await response.json();
             if (data && data.hadiths && data.hadiths.length > 0) {
                 return data.hadiths[Math.floor(Math.random() * data.hadiths.length)];
             }
        }
    } catch(e) {}
    return FALLBACK_HADITHS[0];
};
