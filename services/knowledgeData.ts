import { KnowledgeItem, PrayerContext, PrayerKey } from '../types';

// --- DATABASE ---

export const KNOWLEDGE_DB: KnowledgeItem[] = [
    // --- AFTER PRAYER DHIKR (SHARED) ---
    {
        id: 'd_istighfar',
        category: 'dhikr_prayer',
        arabic: "أَسْتَغْفِرُ اللهَ (3x)",
        translation: "I ask Allah for forgiveness.",
        source: "Muslim 591",
        repeat: 3
    },
    {
        id: 'd_antasalam',
        category: 'dhikr_prayer',
        arabic: "اللَّهُمَّ أَنْتَ السَّلاَمُ، وَمِنْكَ السَّلاَمُ، تَبَارَكْتَ يَا ذَا الْجَلاَلِ وَالإِكْرَامِ",
        translation: "O Allah, You are Peace and from You is peace. Blessed are You, O Owner of Majesty and Honor.",
        source: "Muslim 591",
        repeat: 1
    },
    {
        id: 'd_ayatulkursi',
        category: 'dhikr_prayer',
        arabic: "ٱللَّهُ لَاۤ إِلَـٰهَ إِلَّا هُوَ ٱلۡحَیُّ ٱلۡقَیُّومُ...",
        translation: "Allah - there is no deity except Him, the Ever-Living, the Sustainer of [all] existence... (Ayatul Kursi)",
        source: "Quran 2:255",
        repeat: 1
    },
    {
        id: 'd_tasbih_33',
        category: 'dhikr_prayer',
        arabic: "سُبْحَانَ اللهِ (33x) ، الْحَمْدُ لِلَّهِ (33x) ، اللهُ أَكْبَرُ (33x)",
        translation: "Glory is to Allah (33x), All praise is to Allah (33x), Allah is the Greatest (33x).",
        source: "Muslim 597",
        repeat: 33
    },

    // --- FAJR SPECIFIC ---
    {
        id: 'h_fajr_sunnah',
        category: 'hadith_prayer',
        arabic: "رَكْعَتَا الْفَجْرِ خَيْرٌ مِنَ الدُّنْيَا وَمَا فِيهَا",
        translation: "The two Sunnah Rak'ahs before Fajr are better than the world and all that it contains.",
        source: "Muslim 725",
        repeat: 1
    },

    // --- DHUHR SPECIFIC ---
    {
        id: 'h_dhuhr_gates',
        category: 'hadith_prayer',
        arabic: "إِنَّهَا سَاعَةٌ تُفْتَحُ فِيهَا أَبْوَابُ السَّمَاءِ، وَأُحِبُّ أَنْ يَصْعَدَ لِي فِيهَا عَمَلٌ صَالِحٌ",
        translation: "It is an hour in which the gates of heaven are opened, and I love that a righteous deed should be raised up for me in it.",
        source: "Tirmidhi 478",
        repeat: 1
    },

    // --- ASR SPECIFIC ---
    {
        id: 'h_asr_middle',
        category: 'hadith_prayer',
        arabic: "حَافِظُوا عَلَى الصَّلَوَاتِ وَالصَّلَاةِ الْوُسْطَىٰ",
        translation: "Maintain with care the [obligatory] prayers and [in particular] the middle prayer (Asr).",
        source: "Quran 2:238",
        repeat: 1
    },

    // --- MORNING / EVENING ---
    {
        id: 'd_m_entered',
        category: 'dhikr_morning',
        arabic: "أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ لَا إِلَهَ إِلَّا اللهُ",
        translation: "We have entered the morning and at this very time the whole kingdom belongs to Allah, and all praise is due to Allah.",
        source: "Muslim 2723",
        repeat: 1
    },
    {
        id: 'd_e_entered',
        category: 'dhikr_evening',
        arabic: "أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ لَا إِلَهَ إِلَّا اللهُ",
        translation: "We have entered the evening and at this very time the whole kingdom belongs to Allah, and all praise is due to Allah.",
        source: "Muslim 2723",
        repeat: 1
    }
];


// --- CONTEXT MAPPING ---

export const PRAYER_CONTEXT: Record<PrayerKey, PrayerContext> = {
    fajr: {
        prayerKey: 'fajr',
        rakahSummary: "2 Sunnah, 2 Fard",
        recitationType: "loud",
        sunnahInfo: "The 2 Sunnah rak'ahs before Fard are highly emphasized.",
        relatedItemIds: ['h_fajr_sunnah', 'd_istighfar', 'd_antasalam']
    },
    sunrise: {
        prayerKey: 'sunrise',
        rakahSummary: "No Prayer (Forbidden Time)",
        recitationType: "none",
        sunnahInfo: "Wait 15-20 mins after sunrise for Ishraq prayer (2 Rakahs).",
        relatedItemIds: ['d_m_entered']
    },
    dhuhr: {
        prayerKey: 'dhuhr',
        rakahSummary: "4 Sunnah, 4 Fard, 2 Sunnah",
        recitationType: "silent",
        sunnahInfo: "Pray 4 Rak'ahs before Fard and 2 after.",
        relatedItemIds: ['h_dhuhr_gates', 'd_istighfar', 'd_antasalam', 'd_ayatulkursi', 'd_tasbih_33']
    },
    asr: {
        prayerKey: 'asr',
        rakahSummary: "4 Sunnah (Optional), 4 Fard",
        recitationType: "silent",
        sunnahInfo: "The 'Middle Prayer' mentioned in Quran.",
        relatedItemIds: ['h_asr_middle', 'd_istighfar', 'd_antasalam', 'd_ayatulkursi', 'd_tasbih_33']
    },
    maghrib: {
        prayerKey: 'maghrib',
        rakahSummary: "3 Fard, 2 Sunnah",
        recitationType: "loud",
        sunnahInfo: "First 2 Rak'ahs of Fard are loud.",
        relatedItemIds: ['d_e_entered', 'd_istighfar', 'd_antasalam', 'd_ayatulkursi', 'd_tasbih_33']
    },
    isha: {
        prayerKey: 'isha',
        rakahSummary: "4 Fard, 2 Sunnah, Witr (1, 3, or more)",
        recitationType: "loud",
        sunnahInfo: "First 2 Rak'ahs of Fard are loud. Witr is the last prayer of the night.",
        relatedItemIds: ['d_istighfar', 'd_antasalam', 'd_ayatulkursi', 'd_tasbih_33']
    }
};

// Helper to get items
export const getItemsByIds = (ids: string[]): KnowledgeItem[] => {
    return KNOWLEDGE_DB.filter(item => ids.includes(item.id));
};

export const getItemsByCategory = (cat: string): KnowledgeItem[] => {
    return KNOWLEDGE_DB.filter(item => item.category === cat);
}