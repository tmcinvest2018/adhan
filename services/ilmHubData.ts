
import { FeedItem, LibraryBook, MediaItem, SearchResult, SearchCategory } from '../types';
import { searchAyahs } from './quranService';
import { AVAILABLE_BOOKS, searchHadithStructure, fetchDailyHadith } from './hadithService';
import { searchYouTube, getContextualVideos } from './youtubeService';

// --- STATIC BACKUP LIBRARY (For immediate results) ---
export const STATIC_LIBRARY_BOOKS: LibraryBook[] = [
    {
        id: 'ghazali_knowledge',
        title: 'The Book of Knowledge',
        author: 'Al-Ghazali (Ihya Ulum al-Din)',
        category: 'classical_texts',
        description: "Excerpts from the first book of the Revival of the Religious Sciences.",
        sourceType: 'static_text',
        content: `Knowledge is the most noble of things...`
    },
    // ... (Keep existing static entries as cache/fallback)
];

// --- DYNAMIC CONTEXTUAL FEED ---

export const getFeedItems = async (date: Date): Promise<FeedItem[]> => {
    const day = date.getDay(); // 0 = Sunday, 5 = Friday
    const hour = date.getHours();
    const items: FeedItem[] = [];

    // 1. Time Context (Static logic)
    if (hour >= 5 && hour < 12) {
        items.push({
            id: 'ctx_morning_adhkar',
            type: 'reminder',
            mediaType: 'text',
            title: 'Morning Remembrance',
            content: 'Start your day with the morning Adhkar to seek Allah\'s protection and barakah.',
            tags: ['Sunnah', 'Dhikr'],
            dateStr: 'Morning'
        });
    }

    // 2. Fetch Daily Hadith (Live API)
    try {
        const hadith = await fetchDailyHadith();
        if (hadith) {
             items.push({
                id: 'daily_wisdom_live',
                type: 'daily_wisdom',
                mediaType: 'text',
                title: 'Daily Hadith (Riyad as-Salihin)',
                content: `"${hadith.text.substring(0, 150)}..."`,
                tags: ['Hadith', 'Sunnah'],
                dateStr: 'Today'
            });
        }
    } catch (e) {
        // Fallback
        items.push({
            id: 'daily_wisdom_static',
            type: 'daily_wisdom',
            mediaType: 'text',
            title: 'Wisdom of the Day',
            content: '"He who follows a path in pursuit of knowledge, Allah will make easy for him a path to Paradise."',
            tags: ['Hadith'],
            dateStr: 'Today'
        });
    }

    // 3. Contextual Video (Live API Fallback/Sim)
    let contextTerm = 'islamic lecture';
    if(day === 5) contextTerm = 'jummah khutbah';
    
    const videos = await getContextualVideos(contextTerm);
    if(videos.length > 0) {
        items.push({
            id: `feat_video_${videos[0].id}`,
            type: 'media_highlight',
            mediaType: 'video',
            title: videos[0].title,
            content: `Watch this relevant video: ${videos[0].title}`,
            mediaUrl: videos[0].url,
            source: videos[0].author,
            tags: ['Video', 'Lecture']
        });
    }

    // 4. Friday Specific
    if (day === 5) {
        items.push({
            id: 'fri_kahf_audio',
            type: 'media_highlight',
            mediaType: 'audio',
            title: 'It\'s Jumu\'ah: Listen to Al-Kahf',
            content: 'Prophet Muhammad (ﷺ) said: "Whoever reads Surah Al-Kahf on the day of Jumu’ah, will have a light that will shine from him from one Friday to the next."',
            mediaUrl: 'https://download.quranicaudio.com/quran/mishaari_raashid_al_3afaasee/018.mp3',
            source: 'Sunan al-Bayhaqi',
            tags: ['Sunnah', 'Friday', 'Quran']
        });
    }

    return items;
};

// --- UNIVERSAL SEARCH SERVICE (FEDERATED) ---

export const searchUniversal = async (query: string, language: string): Promise<SearchResult[]> => {
    const qLower = query.toLowerCase();

    // Execute searches in parallel
    const [quranResults, youtubeResults, hadithResults] = await Promise.all([
        searchAyahs(query, language).catch(() => []),
        searchYouTube(query).catch(() => []),
        searchHadithStructure(query).catch(() => [])
    ]);

    // Local Library Search (Sync)
    const libResults: SearchResult[] = STATIC_LIBRARY_BOOKS
        .filter(b => b.title.toLowerCase().includes(qLower) || b.author.toLowerCase().includes(qLower))
        .map(b => ({
            id: `lib_${b.id}`,
            category: 'library' as SearchCategory,
            title: b.title,
            subtitle: b.author,
            contentPreview: b.description,
            data: b
        }));

    // Transform YouTube Results to SearchResult format
    const formattedVideoResults: SearchResult[] = youtubeResults.map(v => ({
        id: v.id,
        category: 'media' as SearchCategory,
        title: v.title,
        subtitle: v.author,
        imageUrl: v.thumbnail,
        data: v
    }));

    // Combine all
    return [
        ...quranResults,
        ...formattedVideoResults,
        ...hadithResults,
        ...libResults
    ];
};
