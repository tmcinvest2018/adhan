
import { FeedItem, LibraryBook, MediaItem, SearchResult, SearchCategory } from '../types';
import { searchAyahs } from './quranService';
import { AVAILABLE_BOOKS, searchHadithStructure, fetchDailyHadith } from './hadithService';
import { MultimediaService } from './multimediaService';

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
];

// --- STANDARD FEED DATA ---

export const getFeedItems = async (date: Date): Promise<FeedItem[]> => {
    const items: FeedItem[] = [];

    // 1. FETCH DAILY HADITH (Live API)
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

    // 2. FEATURED CONTENT (Mock Data)
    items.push({
        id: 'feat_1',
        type: 'featured_text',
        mediaType: 'text',
        title: 'The Virtue of Patience (Sabr)',
        content: 'Patience is not just about waiting, but how you behave while waiting. In the Quran, Allah says "Indeed, Allah is with the patient." (2:153)',
        tags: ['Character', 'Quran'],
        dateStr: 'Featured'
    });

    // 3. MEDIA HIGHLIGHTS
    const mediaItems = await MultimediaService.getFeedMedia(3);
    mediaItems.forEach(m => {
        items.push({
            id: `feat_media_${m.id}`,
            type: 'media_highlight',
            mediaType: m.type as 'video'|'audio',
            title: m.title,
            content: m.author,
            mediaUrl: m.url,
            source: m.author,
            thumbnailUrl: m.thumbnail,
            tags: [m.category, m.type]
        });
    });

    // 4. GENERAL REMINDERS
    items.push({
        id: 'rem_1',
        type: 'reminder',
        mediaType: 'text',
        title: 'Have you read Surah Al-Kahf?',
        content: 'It is recommended to read Surah Al-Kahf on Fridays.',
        tags: ['Sunnah', 'Friday'],
        dateStr: 'Weekly'
    });

    return items;
};
