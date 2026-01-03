import { SearchResult, SearchCategory } from '../types';
import { searchAyahs } from './quranService';
import { AVAILABLE_BOOKS, searchHadithStructure } from './hadithService';
import { LibraryService } from './libraryService';
import { getStaticContentForSearch } from './libraryData';
import { MultimediaService } from './multimediaService';
import { HISN_DB } from './hisnData';

// Reguliere expressies voor snelle navigatie
const QURAN_REF_REGEX = /^(\d+)[\s.:](\d+)$/;
const HADITH_REF_REGEX = /^([a-z\s'-]+?)\s+(\d+)$/i;

export const SearchService = {
    /**
     * Hoofdfunctie voor universeel zoeken over alle bronnen
     */
    search: async (query: string, language: string): Promise<SearchResult[]> => {
        const results: SearchResult[] = [];
        const qTrim = query.trim();

        if (!qTrim || qTrim.length < 2) return [];

        // 1. DIRECTE NAVIGATIE (Prioriteit 1)
        
        // Koran Referentie (bijv. "2:255")
        const quranMatch = qTrim.match(QURAN_REF_REGEX);
        if (quranMatch) {
            const surahNum = parseInt(quranMatch[1]);
            const ayahNum = parseInt(quranMatch[2]);
            if (surahNum >= 1 && surahNum <= 114) {
                results.push({
                    id: `nav_quran_${surahNum}_${ayahNum}`,
                    category: 'quran',
                    title: `Soera ${surahNum}, Vers ${ayahNum}`,
                    subtitle: 'Directe Navigatie',
                    contentPreview: 'Klik om direct naar dit vers te gaan in de Koran.',
                    data: { surah: surahNum, ayah: ayahNum }
                });
            }
        }

        // Hadith Referentie (bijv. "Bukhari 1")
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
                    subtitle: 'Directe Navigatie',
                    contentPreview: `Spring naar overlevering nummer ${hadithNum}.`,
                    data: { bookId: book.id, hadithNum: hadithNum } 
                });
            }
        }

        // 2. PARALLEL ZOEKEN IN BRONNEN (Prioriteit 2)
        try {
            const [quranResults, hadithResults, mediaResults, hisnResults] = await Promise.all([
                searchAyahs(qTrim, language).catch(() => []),
                searchHadithStructure(qTrim).catch(() => []),
                MultimediaService.searchMedia(qTrim).then(items => items.map(m => ({
                    id: `media_${m.id}`,
                    category: 'media' as any,
                    title: m.title,
                    subtitle: m.author,
                    imageUrl: m.thumbnail,
                    data: m
                }))).catch(() => []),
                SearchService.searchHisn(qTrim).catch(() => [])
            ]);

            results.push(...hisnResults);
            results.push(...quranResults);
            results.push(...hadithResults);
            results.push(...mediaResults);

            // 3. DOORZOEK OFFLINE BIBLIOTHEEK (Prioriteit 3)
            const offlineResults = SearchService.searchOfflineContent(qTrim, language);
            results.push(...offlineResults);

        } catch (e) {
            console.error("Fout tijdens universeel zoeken", e);
        }

        return results;
    },

    searchHisn: async (query: string): Promise<SearchResult[]> => {
        const lowerQ = query.toLowerCase();
        return HISN_DB.filter(c => 
            c.title.toLowerCase().includes(lowerQ) || 
            String(c.id) === query
        ).map(c => ({
            id: `hisn_${c.id}`,
            category: 'library',
            title: `Hisnul Muslim: ${c.title}`,
            subtitle: `Hoofdstuk ${c.id}`,
            data: { hisnChapter: c }
        }));
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
                if (typeof text === 'string' && text.toLowerCase().includes(lowerQ)) {
                    const index = text.toLowerCase().indexOf(lowerQ);
                    const start = Math.max(0, index - 40);
                    const end = Math.min(text.length, index + 120);
                    const snippet = "..." + text.substring(start, end).replace(/\n/g, ' ') + "...";
                    const displayTitle = (source as any).title || chapterId;

                    results.push({
                        id: `lib_match_${source.bookId}_${chapterId}`,
                        category: 'library',
                        title: displayTitle,
                        subtitle: 'Gevonden in tekst',
                        contentPreview: snippet,
                        data: { bookId: source.bookId, chapterId, text }
                    });
                }
            });
        });
        return results;
    }
};