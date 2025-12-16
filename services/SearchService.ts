
import { SearchResult } from '../types';
import { searchAyahs } from './quranService';
import { AVAILABLE_BOOKS, searchHadithStructure } from './hadithService';
import { LibraryService } from './libraryService';
import { getStaticContentForSearch } from './libraryData';
import { MultimediaService } from './multimediaService';

// Matches: "2:255", "2.255", "2 255"
const QURAN_REF_REGEX = /^(\d+)[\s.:](\d+)$/;

// Matches: "Bukhari 1", "Muslim 50"
const HADITH_REF_REGEX = /^([a-z\s'-]+?)\s+(\d+)$/i;

export const SearchService = {

    search: async (query: string, language: string): Promise<SearchResult[]> => {
        const results: SearchResult[] = [];
        const qTrim = query.trim();

        if (!qTrim) return [];

        // 1. NUMBER RESOLUTION (High Priority)
        
        // Quran Reference
        const quranMatch = qTrim.match(QURAN_REF_REGEX);
        if (quranMatch) {
            const surahNum = parseInt(quranMatch[1]);
            const ayahNum = parseInt(quranMatch[2]);
            if (surahNum >= 1 && surahNum <= 114) {
                results.push({
                    id: `nav_quran_${surahNum}_${ayahNum}`,
                    category: 'quran',
                    title: `Open Surah ${surahNum}, Ayah ${ayahNum}`,
                    subtitle: 'Quick Navigation',
                    contentPreview: 'Jump directly to this Ayah.',
                    data: { surah: surahNum, ayah: ayahNum }
                });
            }
        }

        // Hadith Reference
        const hadithMatch = qTrim.match(HADITH_REF_REGEX);
        if (hadithMatch) {
            const bookNameQuery = hadithMatch[1].toLowerCase();
            const hadithNum = hadithMatch[2];
            const book = AVAILABLE_BOOKS.find(b => 
                b.title.toLowerCase().includes(bookNameQuery) || 
                b.id.toLowerCase().includes(bookNameQuery)
            );
            if (book) {
                results.push({
                    id: `nav_hadith_${book.id}_${hadithNum}`,
                    category: 'hadith',
                    title: `${book.title} #${hadithNum}`,
                    subtitle: 'Quick Navigation',
                    contentPreview: `Open Hadith number ${hadithNum}.`,
                    data: { bookId: book.id, sectionId: '1', hadithNum: hadithNum } 
                });
            }
        }

        // 2. KEYWORD SEARCH (Async Parallel)
        const [quranResults, hadithResults, mediaResults] = await Promise.all([
            searchAyahs(qTrim, language).catch(() => []),
            searchHadithStructure(qTrim).catch(() => []),
            // Calls the new AI Search
            MultimediaService.searchMedia(qTrim).then(items => items.map(m => ({
                id: m.id,
                category: 'media' as any,
                title: m.title,
                subtitle: m.author,
                imageUrl: m.thumbnail,
                data: m
            }))).catch(() => [])
        ]);

        // 3. MERGE (Media First for better engagement)
        results.push(...mediaResults);
        results.push(...quranResults);
        results.push(...hadithResults);

        // 4. OFFLINE LIBRARY SEARCH
        const offlineResults = SearchService.searchOfflineContent(qTrim, language);
        results.push(...offlineResults);

        return results;
    },

    searchOfflineContent: (query: string, language: string): SearchResult[] => {
        const results: SearchResult[] = [];
        const lowerQ = query.toLowerCase();
        const downloadedBooks = LibraryService.getAllDownloadedContent();
        const preinstalledBooks = getStaticContentForSearch().map(b => ({
            bookId: b.id,
            content: b.content,
            title: b.title
        }));
        const allContentSources = [...downloadedBooks, ...preinstalledBooks];

        allContentSources.forEach((source) => {
            Object.entries(source.content).forEach(([chapterId, text]) => {
                if (text.toLowerCase().includes(lowerQ)) {
                    const index = text.toLowerCase().indexOf(lowerQ);
                    const start = Math.max(0, index - 20);
                    const end = Math.min(text.length, index + 60);
                    const snippet = "..." + text.substring(start, end) + "...";
                    const displayTitle = (source as any).title || SearchService.formatBookTitle(source.bookId);

                    results.push({
                        id: `lib_match_${source.bookId}_${chapterId}`,
                        category: 'library',
                        title: displayTitle,
                        subtitle: 'Library Result',
                        contentPreview: snippet,
                        data: { bookId: source.bookId, chapterId, text }
                    });
                }
            });
        });
        return results;
    },

    formatBookTitle: (bookId: string) => {
        return bookId.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
};
