
import React, { useState, useEffect, useRef, useMemo } from 'react';
// REMOVED: import { GoogleGenAI } from "@google/genai";
import { FeedItem, LibraryBook, ChatMessage, MediaItem, QuranContext, BookStructureNode, HadithData, SearchResult, PrayerTimeDisplay, UserCoordinates } from '../types';
import { getFeedItems } from '../services/ilmHubData';
import { getLibraryCatalog } from '../services/libraryData';
import { LibraryService } from '../services/libraryService';
import { fetchHadiths } from '../services/hadithService';
import { MultimediaService } from '../services/multimediaService';
import { SearchService } from '../services/SearchService';
import { HisnService, HisnSection, HisnItem } from '../services/hisnService';
import { calculateQiblaDirection } from '../services/geoService';
import { useCompass } from '../hooks/useCompass';
import { MediaCard } from './MediaCard';
import { AudioPlayer } from './AudioPlayer';
import { Search, Book, Sparkles, Send, ChevronRight, Bot, Library, ScrollText, Home, BookOpen, Loader2, Play, Pause, ArrowLeft, X, Shield, Repeat, CheckCircle2, AlertCircle, HelpCircle, Compass, Clock, Video, FileText, RefreshCw } from 'lucide-react';

interface FeedHeaderProps {
  nextPrayer?: PrayerTimeDisplay | null;
  coords?: UserCoordinates | null;
  onNavigateToTab: (tab: any) => void;
}

const FeedHeader: React.FC<FeedHeaderProps> = ({ nextPrayer, coords, onNavigateToTab }) => {
  const { heading, isReady, permissionGranted, requestPermission } = useCompass();
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    if (!nextPrayer) {
      setTimeLeft('');
      return;
    }
    const updateTimer = () => {
      const now = new Date();
      const diff = nextPrayer.time.getTime() - now.getTime();
      if (diff <= 0) {
        setTimeLeft('00:00:00');
      } else {
        const h = Math.floor(diff / 3600000);
        const m = Math.floor((diff % 3600000) / 60000);
        const s = Math.floor((diff % 60000) / 1000);
        setTimeLeft(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`);
      }
    };
    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [nextPrayer]);

  const qiblaBearing = useMemo(() => coords ? calculateQiblaDirection(coords) : 0, [coords]);
  const needleRotation = qiblaBearing - heading;

  return (
    <div className="flex gap-2 mb-4 px-1">
      <div 
        onClick={() => onNavigateToTab('prayers')}
        className="flex-1 bg-gradient-to-br from-emerald-600 to-teal-700 text-white p-3 rounded-2xl shadow-lg shadow-emerald-100 active:scale-[0.98] transition-transform cursor-pointer relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -mr-4 -mt-4 blur-xl" />
        <div className="flex justify-between items-start mb-2">
          <div className="bg-white/20 p-1.5 rounded-lg"><Clock size={16} /></div>
          <span className="text-[10px] font-bold uppercase tracking-wider bg-black/20 px-2 py-0.5 rounded-full">Volgende</span>
        </div>
        <div>
          <div className="text-xl font-bold leading-none mb-1 truncate">{nextPrayer ? nextPrayer.name : 'Klaar'}</div>
          <div className="text-emerald-100 font-mono text-sm tracking-wide">{timeLeft || '--:--:--'}</div>
        </div>
      </div>
      <div 
        onClick={() => { if (!permissionGranted) requestPermission(); onNavigateToTab('qibla'); }}
        className="flex-1 bg-white border border-gray-100 p-3 rounded-2xl shadow-sm active:scale-[0.98] transition-transform cursor-pointer flex flex-col justify-between"
      >
        <div className="flex justify-between items-start mb-2">
          <div className="bg-emerald-50 text-emerald-600 p-1.5 rounded-lg"><Compass size={16} /></div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Qibla</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full border-2 border-gray-200 relative flex items-center justify-center bg-gray-50 overflow-hidden">
            <div className="w-0.5 h-full absolute top-0" style={{ transform: `rotate(${needleRotation}deg)`, transition: isReady ? 'transform 0.1s linear' : 'none' }}>
              <div className="w-1.5 h-1.5 bg-red-500 rounded-full absolute top-1 left-1/2 -translate-x-1/2 shadow-sm" />
            </div>
          </div>
          <div>
            <div className="text-lg font-bold text-gray-800 leading-none">{Math.round(qiblaBearing)}°</div>
            <div className="text-[10px] text-gray-400 font-medium truncate max-w-[60px]">Richting</div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface Props {
  t: any;
  language: string;
  onNavigateToQuran: (context: QuranContext) => void;
  onNavigateToTab: (tab: any) => void;
  nextPrayer?: PrayerTimeDisplay | null;
  coords?: UserCoordinates | null;
}

export const IlmHubModule: React.FC<Props> = ({ t, language, onNavigateToQuran, onNavigateToTab, nextPrayer, coords }) => {
  const [activeTab, setActiveTab] = useState<'feed' | 'hisn' | 'library' | 'media' | 'ai'>('feed');
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [loadingFeed, setLoadingFeed] = useState(true);
  const [catalog, setCatalog] = useState<LibraryBook[]>([]);
  const [libView, setLibView] = useState<'categories' | 'books' | 'structure' | 'reader'>('categories');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedBook, setSelectedBook] = useState<LibraryBook | null>(null);
  const [bookStructure, setBookStructure] = useState<BookStructureNode[]>([]);
  const [loadingStructure, setLoadingStructure] = useState(false);
  const [sectionContent, setSectionContent] = useState<HadithData[] | string | any[]>([]); 
  const [selectedSectionTitle, setSelectedSectionTitle] = useState('');
  const [hisnView, setHisnView] = useState<'chapters' | 'items'>('chapters');
  const [hisnChapters, setHisnChapters] = useState<HisnSection[]>([]);
  const [selectedChapter, setSelectedChapter] = useState<HisnSection | null>(null);
  const [hisnItems, setHisnItems] = useState<HisnItem[]>([]);
  const [loadingHisn, setLoadingHisn] = useState(false);
  
  // Universal Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [globalResults, setGlobalResults] = useState<SearchResult[]>([]);
  
  // Media State
  const [playingMediaId, setPlayingMediaId] = useState<string | null>(null);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [isLoadingMedia, setIsLoadingMedia] = useState(false);

  const [downloadProgress, setDownloadProgress] = useState<number>(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const [playingTrackIndex, setPlayingTrackIndex] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([{ id: 'welcome', role: 'assistant', text: "As-salamu alaykum. Ik ben Al-Noor, uw Islamitische kennisassistent. Ik gebruik de Koran, Sunnah en klassieke teksten om uw vragen te beantwoorden.", timestamp: Date.now() }]);
  const [isTyping, setIsTyping] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<MediaItem[]>([]);
  const [aiSources, setAiSources] = useState<SearchResult[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  const loadMedia = async () => {
    setIsLoadingMedia(true);
    try {
        const media = await MultimediaService.getFeedMedia(20);
        setMediaItems(media);
    } catch(e) {
        console.error("Failed to load media", e);
    }
    setIsLoadingMedia(false);
  };

  useEffect(() => {
    const load = async () => {
      setLoadingFeed(true);
      const items = await getFeedItems(new Date());
      setFeedItems(items);
      await loadMedia();
      const cat = await getLibraryCatalog(language);
      setCatalog(cat);
      const hisn = await HisnService.getChapters();
      setHisnChapters(hisn);
      setLoadingFeed(false);
    };
    load();
  }, [language]);

  // Execute Search only on Enter or button click
  const executeSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (searchQuery.trim().length < 2) return;
    
    setIsSearching(true);
    setShowSearchResults(true);
    setPlayingMediaId(null); 
    try {
        const results = await SearchService.search(searchQuery, language);
        setGlobalResults(results);
    } catch (err) {
        console.error("Search Error", err);
    }
    setIsSearching(false);
  };

  const handleSearchResultClick = (result: SearchResult) => {
    if (result.category === 'media') {
        setPlayingMediaId(result.id.replace('media_', ''));
        return;
    }
    
    setShowSearchResults(false);
    setSearchQuery('');
    
    if (result.category === 'quran' && result.data) {
        onNavigateToQuran(result.data);
    } else if (result.category === 'library' && result.data?.hisnChapter) {
        setActiveTab('hisn'); setHisnView('items'); openHisnChapter(result.data.hisnChapter);
    } else if (result.category === 'hadith' && result.data?.bookId) {
      const book = catalog.find(b => b.apiId === result.data.bookId || b.id.includes(result.data.bookId));
      if (book) { setActiveTab('library'); openBook(book); }
    } else if (result.category === 'library' && result.data?.bookId) {
        const book = catalog.find(b => b.id === result.data.bookId);
        if (book) { setActiveTab('library'); openBook(book); }
    }
  };

  const closeSearchResults = () => {
      setShowSearchResults(false);
      setSearchQuery('');
      setGlobalResults([]);
      setPlayingMediaId(null);
  };

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.ontimeupdate = () => setCurrentTime(audioRef.current?.currentTime || 0);
      audioRef.current.onloadedmetadata = () => setDuration(audioRef.current?.duration || 0);
      audioRef.current.onended = () => { setIsPlaying(false); handleNextTrack(); };
    }
  }, []);

  const handleNextTrack = () => {
    setPlayingTrackIndex(prev => (prev !== null && prev < bookStructure.length - 1 && bookStructure[prev+1].audioUrl) ? (playTrack(prev+1), prev+1) : prev);
  };

  const playTrack = (index: number) => {
    if (!bookStructure[index]?.audioUrl) return;
    if (playingTrackIndex === index && audioRef.current) {
      if (isPlaying) audioRef.current.pause();
      else audioRef.current.play();
      setIsPlaying(!isPlaying);
      return;
    }
    if (audioRef.current) {
      setPlayingTrackIndex(index);
      audioRef.current.src = bookStructure[index].audioUrl!;
      audioRef.current.play().then(() => setIsPlaying(true));
      setPlayingMediaId(null); 
    }
  };

  const openBook = async (book: LibraryBook) => {
    setSelectedBook(book); setLibView('structure'); setLoadingStructure(true);
    if (playingTrackIndex !== null && selectedBook?.id !== book.id) { if (audioRef.current) audioRef.current.pause(); setIsPlaying(false); setPlayingTrackIndex(null); }
    if (book.sourceType === 'static_text' && book.contentCdnUrl && !LibraryService.isContentDownloaded(book.id)) {
      setIsDownloading(true); await LibraryService.downloadContent(book, setDownloadProgress).finally(() => setIsDownloading(false));
    }
    const structure = await LibraryService.fetchAndCacheStructure(book, language);
    setBookStructure(structure);
    setLoadingStructure(false);
  };

  const handleChapterClick = async (node: BookStructureNode) => {
    if (!selectedBook) return;
    if (selectedBook.sourceType === 'api_quran') { onNavigateToQuran({ surah: node.number || parseInt(node.id) }); return; }
    setSelectedSectionTitle(node.title); setLibView('reader'); setSectionContent([]); 
    if (selectedBook.sourceType === 'api_hadith' && selectedBook.apiId) {
      try { 
        const hadiths = await fetchHadiths(selectedBook.apiId, node.id, language);
        setSectionContent(hadiths); 
      } catch(e) { setSectionContent("Er is een fout opgetreden bij het laden van de hadiths."); }
    } else {
      const content = LibraryService.getContent(selectedBook.id);
      setSectionContent(content?.[node.id] || "Inhoud niet gevonden.");
    }
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;
    const userMsgText = chatInput;
    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: userMsgText, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setIsTyping(true);
    setAiSuggestions([]);
    setAiSources([]);

    try {
      // --- RAG STEP 1: RETRIEVAL ---
      // Execute a search against our internal databases to find grounding context
      const [searchResults, videoResults] = await Promise.all([
          SearchService.search(userMsgText, language),
          MultimediaService.searchMedia(userMsgText)
      ]);

      // Prioritize content: Text sources (Quran, Hadith, Hisn) then Media
      const textSources = searchResults.filter(r => r.category !== 'media').slice(0, 8);
      setAiSources(textSources);
      setAiSuggestions(videoResults.slice(0, 3));

      // --- RAG STEP 2: CONTEXT CONSTRUCTION ---
      let contextString = "### RAG DATA CONTEXT ###\n";

      if (textSources.length === 0 && videoResults.length === 0) {
          contextString += "No specific internal documents found. Rely on general Islamic principles within the defined Scholar Persona.\n";
      } else {
          textSources.forEach((r, idx) => {
              contextString += `[SOURCE ${idx+1}] Type: ${r.category.toUpperCase()} | Title: ${r.title}\n`;
              contextString += `Excerpt: "${r.contentPreview || r.subtitle || 'No preview available'}"\n`;
              if (r.data && r.category === 'quran') {
                 contextString += `Reference: Surah ${r.data.surah}, Ayah ${r.data.ayah}\n`;
              }
              if (r.data && r.category === 'hadith') {
                 contextString += `Reference: Book ${r.data.bookId}, Hadith ${r.data.hadithNum}\n`;
              }
              contextString += `---\n`;
          });

          if (videoResults.length > 0) {
              contextString += "\n[AVAILABLE MEDIA RESOURCES]\n";
              videoResults.slice(0, 3).forEach(v => {
                  contextString += `- Video: ${v.title} by ${v.author}\n`;
              });
          }
      }

      // --- RAG STEP 3: LOCAL AI PROCESSING ---
      // Use local AI service with client-side model
      const { localAIService } = await import('../services/LocalAIService');

      // Set up progress callback to provide visual feedback
      localAIService.setProgressCallback((progress) => {
        if (progress.type === 'starting') {
          setIsTyping(true);
        } else if (progress.type === 'progress') {
          // Could update a progress bar or status message here
          console.log('AI Model Progress:', progress);
        } else if (progress.type === 'initialized') {
          console.log('AI Model Ready:', progress.message);
        }
      });

      // Initialize the service if not already done
      await localAIService.initialize();

      const responseText = await localAIService.sendMessage(contextString, userMsgText);

      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'assistant', text: responseText, timestamp: Date.now() }]);
      if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    } catch (err) {
        console.error(err);
        setMessages(prev => [...prev, { id: Date.now().toString(), role: 'assistant', text: "Er is een technische fout opgetreden bij het raadplegen van de kennisbank.", timestamp: Date.now() }]);
    }
    setIsTyping(false);
  };

  const openHisnChapter = async (chapter: HisnSection) => {
    setSelectedChapter(chapter); setHisnView('items'); setLoadingHisn(true); setHisnItems([]); 
    const items = await HisnService.getDuas(chapter.id, chapter.title);
    setHisnItems(items); setLoadingHisn(false);
  };

  const getGradeColor = (grade: string) => {
    const g = grade.toLowerCase();
    if (g.includes('sahih') || g.includes('authentic')) return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    if (g.includes('hasan') || g.includes('good')) return 'bg-blue-100 text-blue-800 border-blue-200';
    if ((g.includes('da') && g.includes('if')) || g.includes('weak')) return 'bg-red-100 text-red-800 border-red-200';
    return 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const Breadcrumb = () => (
    <div className="sticky top-0 z-10 bg-[#f0fdf4]/95 backdrop-blur-sm py-3 px-2 mb-2 border-b border-gray-100 flex items-center gap-2 text-xs font-medium text-gray-500 overflow-x-auto whitespace-nowrap shadow-sm">
      <button onClick={() => setLibView('categories')} className="hover:text-emerald-600 flex items-center shrink-0 py-1"><Home size={14} className="mr-1" /> Bibliotheek</button>
      {selectedCategory && libView !== 'categories' && (
        <><ChevronRight size={12} className="shrink-0 text-gray-300" /><button onClick={() => setLibView('books')} className="hover:text-emerald-600 shrink-0 capitalize py-1">{selectedCategory.replace('_', ' ')}</button></>
      )}
      {selectedBook && (libView === 'structure' || libView === 'reader') && (
        <><ChevronRight size={12} className="shrink-0 text-gray-300" /><button onClick={() => setLibView('structure')} className="hover:text-emerald-600 shrink-0 max-w-[120px] truncate font-bold py-1">{selectedBook.title}</button></>
      )}
    </div>
  );

  return (
    <div className="h-full flex flex-col relative bg-[#f0fdf4] overflow-hidden">
      <div className="flex-1 flex flex-col min-h-0">
        
        {/* Navigation Tabs */}
        <div className="flex-none p-1 bg-gray-200/50 rounded-2xl mb-2 mx-1 mt-1 border border-white/20">
            <div className="flex items-center gap-1">
                {(['feed', 'hisn', 'library', 'media', 'ai'] as const).map(tabKey => (
                <button 
                    key={tabKey} 
                    onClick={() => { setActiveTab(tabKey); setHisnView('chapters'); setLibView('categories'); setShowSearchResults(false); setPlayingMediaId(null); }} 
                    className={`flex-1 py-2.5 rounded-xl text-[10px] sm:text-xs font-bold transition-all ${activeTab === tabKey && !showSearchResults ? 'bg-white text-emerald-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    {t.ilmhub.tabs[tabKey]}
                </button>
                ))}
            </div>
        </div>

        {/* Universal Search Bar */}
        <div className="px-1 mb-4 flex-none">
            <form onSubmit={executeSearch} className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <Sparkles className="text-amber-500 animate-pulse" size={18} />
                </div>
                <input 
                    id="stable-universal-search"
                    key="stable-search-input"
                    type="text" 
                    placeholder="Zoek in alle bronnen (Druk op Enter)..." 
                    value={searchQuery} 
                    onChange={(e) => setSearchQuery(e.target.value)} 
                    className="w-full bg-white ltr:pl-10 rtl:pr-10 ltr:pr-12 rtl:pl-12 py-3.5 rounded-2xl border-none shadow-sm focus:ring-2 focus:ring-emerald-500 transition-all text-sm font-medium" 
                />
                <div className="absolute ltr:right-2 rtl:left-2 top-1/2 -translate-y-1/2 flex items-center">
                    {searchQuery && (
                        <button type="button" onClick={() => { setSearchQuery(''); setShowSearchResults(false); setPlayingMediaId(null); }} className="p-2 text-gray-300 hover:text-gray-500">
                            <X size={18} />
                        </button>
                    )}
                    <button type="submit" className="p-2.5 bg-emerald-100 text-emerald-600 rounded-xl hover:bg-emerald-200 transition-colors">
                        {isSearching ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
                    </button>
                </div>
            </form>
        </div>

        {/* Content Area */}
        <div className="flex-1 min-h-0 relative">
            {showSearchResults ? (
                <div className="animate-in fade-in pb-24 px-1 h-full overflow-y-auto no-scrollbar">
                    <div className="flex items-center justify-between mb-6 sticky top-0 bg-[#f0fdf4] py-2 z-10">
                        <button onClick={closeSearchResults} className="flex items-center gap-2 text-emerald-600 font-bold bg-white px-4 py-2 rounded-xl shadow-sm border border-emerald-100">
                            <ArrowLeft size={18} /> Terug naar {t.ilmhub.tabs[activeTab]}
                        </button>
                        <span className="text-xs font-bold text-gray-400">{globalResults.length} resultaten</span>
                    </div>
                    {globalResults.length === 0 && !isSearching && (
                        <div className="flex flex-col items-center justify-center py-20 text-gray-400 text-center">
                            <Search size={48} className="mb-4 opacity-10" />
                            <p className="font-bold">Geen directe matches gevonden.</p>
                            <button onClick={() => { setActiveTab('ai'); setChatInput(searchQuery); setShowSearchResults(false); }} className="mt-4 text-emerald-600 bg-white px-6 py-3 rounded-2xl shadow-sm font-bold border border-emerald-50">
                                Vraag het aan AI Al-Noor
                            </button>
                        </div>
                    )}
                    <div className="space-y-8">
                        {['quran', 'hadith', 'library', 'media'].map(cat => {
                            const items = globalResults.filter(r => r.category === cat);
                            if (items.length === 0) return null;
                            const labelMap: any = { quran: 'Heilige Koran', hadith: 'Hadith', library: 'Boeken', media: 'Media' };
                            const iconMap: any = { quran: <BookOpen size={16}/>, hadith: <Library size={16}/>, library: <FileText size={16}/>, media: <Video size={16}/> };
                            return (
                                <div key={cat} className="space-y-3">
                                    <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-400 flex items-center gap-2 px-2">
                                        <span className="p-1.5 bg-gray-100 rounded-lg">{iconMap[cat]}</span>
                                        {labelMap[cat]}
                                    </h3>
                                    <div className="grid gap-2">
                                        {items.map(r => (
                                            cat === 'media' ? (
                                                <MediaCard 
                                                    key={r.id} 
                                                    item={r.data} 
                                                    isPlaying={playingMediaId === r.data.id} 
                                                    onPlay={() => setPlayingMediaId(r.data.id)} 
                                                />
                                            ) : (
                                                <div key={r.id} onClick={() => handleSearchResultClick(r)} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm active:scale-[0.98] transition-all flex gap-4 hover:border-emerald-200">
                                                    {r.imageUrl ? <img src={r.imageUrl} className="w-16 h-12 rounded-xl object-cover shrink-0 shadow-sm" /> : <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">{iconMap[cat]}</div>}
                                                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                                                        <h4 className="font-bold text-sm text-gray-800 truncate">{r.title}</h4>
                                                        <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed italic">{r.contentPreview || r.subtitle}</p>
                                                    </div>
                                                    <div className="self-center text-gray-300"><ChevronRight size={18} /></div>
                                                </div>
                                            )
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ) : (
              <>
                {activeTab === 'feed' && (
                    <div className="space-y-4 animate-in fade-in pb-24 h-full overflow-y-auto no-scrollbar">
                        <FeedHeader nextPrayer={nextPrayer} coords={coords} onNavigateToTab={onNavigateToTab} />
                        <div className="bg-emerald-600 text-white p-6 rounded-3xl shadow-lg mb-2 mx-1 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
                            <h2 className="text-xs font-bold opacity-70 uppercase mb-2 tracking-widest">{t.ilmhub.feed.daily}</h2>
                            <div className="text-lg font-bold font-serif italic leading-relaxed">
                                {feedItems.find(i => i.type === 'daily_wisdom')?.content}
                            </div>
                        </div>
                        <div className="grid gap-4 px-1 pb-10">
                            {feedItems.filter(i => i.type !== 'daily_wisdom').map(item => 
                                item.type === 'media_highlight' ? (
                                    <MediaCard 
                                        key={item.id} 
                                        item={{ id: item.id.replace('feat_media_', ''), title: item.title, author: item.source || '', type: item.mediaType as 'video' | 'audio', category: item.tags[0] as any || 'lecture', url: item.mediaUrl || '', thumbnail: item.thumbnailUrl, duration: '' }} 
                                        isPlaying={playingMediaId === item.id.replace('feat_media_', '')}
                                        onPlay={() => setPlayingMediaId(item.id.replace('feat_media_', ''))}
                                    />
                                ) : (
                                    <div key={item.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex gap-4 group hover:border-emerald-200 transition-colors">
                                        <div className="bg-blue-50 text-blue-600 w-10 h-10 rounded-full flex items-center justify-center shrink-0 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors"><Sparkles size={18} /></div>
                                        <div><h4 className="font-bold text-gray-800">{item.title}</h4><p className="text-gray-600 text-sm mt-1 leading-relaxed">{item.content}</p></div>
                                    </div>
                                )
                            )}
                        </div>
                    </div>
                )}
                {activeTab === 'hisn' && (
                    hisnView === 'chapters' ? (
                        <div className="animate-in fade-in pb-24 h-full flex flex-col overflow-y-auto no-scrollbar">
                            <div className="bg-amber-600 text-white p-6 rounded-3xl shadow-lg flex items-center justify-between mx-1 mb-4 shrink-0">
                                <div><h2 className="text-2xl font-bold">Hisnul Muslim</h2><p className="text-white/80 text-sm mt-1">Vesting van de Moslim</p></div>
                                <div className="bg-white/20 p-3 rounded-full"><Shield size={24} /></div>
                            </div>
                            <div className="grid gap-2 px-1 pb-10">
                                {hisnChapters.map(chapter => (
                                    <div key={chapter.id} onClick={() => openHisnChapter(chapter)} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:border-amber-400 cursor-pointer flex items-center gap-4 transition-all active:scale-[0.99]">
                                        <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-700 font-bold font-mono flex items-center justify-center text-sm shrink-0">{chapter.id}</div>
                                        <div className="font-medium text-gray-800 flex-1 line-clamp-2">{chapter.title}</div>
                                        <ChevronRight size={16} className="text-gray-400 shrink-0" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="animate-in slide-in-from-right pb-24 h-full flex flex-col overflow-hidden">
                            <div className="sticky top-0 bg-[#f0fdf4] z-10 py-4 px-1 border-b border-gray-100 mb-2 shadow-sm flex items-center gap-4 shrink-0">
                                <button onClick={() => setHisnView('chapters')} className="p-2 bg-white rounded-xl shadow-sm text-gray-600 hover:text-amber-700 active:scale-95 transition-all"><ArrowLeft size={18} /></button>
                                <h2 className="font-bold text-lg text-gray-800 leading-tight pr-4 truncate"><span className="text-amber-600 mr-2">#{selectedChapter?.id}</span>{selectedChapter?.title}</h2>
                            </div>
                            <div className="space-y-6 px-2 pt-2 overflow-y-auto no-scrollbar flex-1 pb-20">
                                {hisnItems.map((item, idx) => (
                                    <div key={idx} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                                        <div className="p-5 bg-[#fcfcfc] border-b border-gray-50"><p className="text-right font-arabic text-2xl leading-[2.2] text-gray-800" dir="rtl">{item.arabic_text}</p></div>
                                        <div className="p-5"><p className="text-gray-700 text-base leading-relaxed mb-6 font-serif">{item.translation}</p><div className="flex items-center gap-3 bg-gray-100 text-gray-600 px-4 py-3 rounded-xl mb-4 text-sm font-medium"><div className="bg-white p-1.5 rounded-full shadow-sm"><Repeat size={14} className="text-emerald-600" /></div><span>Aanbevolen: {item.recommended_repeat_count} keer</span></div></div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )
                )}
                {activeTab === 'library' && (
                    <div className="h-full flex flex-col min-h-0">
                        {libView === 'categories' ? (
                            <div className="animate-in fade-in pb-24 h-full overflow-y-auto no-scrollbar">
                                <div className="py-2 px-1"><h2 className="text-2xl font-bold text-gray-800 mb-2">Bibliotheek</h2></div>
                                <div className="grid gap-4 px-1">{[{ id: 'quran_tafsir', title: 'Koran & Tafsir', icon: <BookOpen size={24} />, color: 'bg-emerald-600' }, { id: 'hadith_collections', title: 'Hadith Collecties', icon: <Library size={24} />, color: 'bg-indigo-600' }, { id: 'classical_texts', title: 'Klassieke Teksten', icon: <ScrollText size={24} />, color: 'bg-amber-600' }].map(cat => <div key={cat.id} onClick={() => { setSelectedCategory(cat.id); setLibView('books'); }} className={`${cat.color} text-white p-6 rounded-3xl shadow-lg cursor-pointer flex items-center justify-between active:scale-[0.98] transition-transform`}><div><h3 className="text-xl font-bold">{cat.title}</h3><p className="text-white/80 text-sm mt-1">Blader door collectie</p></div><div className="bg-white/20 p-3 rounded-full">{cat.icon}</div></div>)}</div>
                            </div>
                        ) : libView === 'books' ? (
                            <div className="animate-in slide-in-from-right pb-24 h-full flex flex-col"><Breadcrumb /><div className="grid grid-cols-2 gap-3 mt-1 px-1 overflow-y-auto no-scrollbar pb-10">{catalog.filter(b => b.category === selectedCategory).map(book => (<div key={book.id} onClick={() => openBook(book)} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col h-48 justify-between active:scale-[0.98] transition-transform"><div><div className={`w-8 h-8 rounded-lg mb-3 ${book.coverColor || 'bg-gray-500'} flex items-center justify-center text-white`}><Book size={16} /></div><h4 className="font-bold text-gray-800 leading-tight line-clamp-2">{book.title}</h4></div><div className="bg-gray-50 p-2 rounded-full text-gray-400 w-fit self-end"><ChevronRight size={16} /></div></div>))}</div></div>
                        ) : libView === 'structure' ? (
                            <div className="animate-in slide-in-from-right pb-24 h-full flex flex-col relative"><Breadcrumb />{isDownloading && <div className="absolute inset-0 z-50 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center rounded-2xl"><Loader2 size={40} className="animate-spin text-emerald-600 mb-4" /><h3 className="font-bold text-gray-800">Boek downloaden...</h3></div>}<div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex-1 flex flex-col mx-1 min-h-0"><div className="p-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center"><h2 className="font-bold text-lg truncate">{selectedBook?.title}</h2></div><div className="divide-y divide-gray-50 overflow-y-auto flex-1 no-scrollbar">{loadingStructure ? (<div className="flex flex-col items-center justify-center p-12 text-gray-400"><Loader2 className="animate-spin mb-4" size={32} /><span>Index laden...</span></div>) : bookStructure.map((node, index) => (<div key={node.id} className="p-4 hover:bg-emerald-50 cursor-pointer flex justify-between items-center transition-colors"><div className="flex-1 flex items-center gap-3" onClick={() => handleChapterClick(node)}><span className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full text-xs font-bold text-gray-500 shrink-0">{node.number || '#'}</span><span className="text-sm font-medium text-gray-700 line-clamp-1">{node.title}</span></div><div className="flex items-center gap-2">{node.audioUrl && <button onClick={(e) => { e.stopPropagation(); playTrack(index); }} className={`p-2 rounded-full ${playingTrackIndex === index ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-400'}`}>{playingTrackIndex === index && isPlaying ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}</button>}<ChevronRight size={16} className="text-gray-300" /></div></div>))}</div></div></div>
                        ) : (
                            <div className="animate-in slide-in-from-right pb-24 h-full flex flex-col"><Breadcrumb /><div className="bg-white p-4 flex-1 overflow-y-auto bg-gray-50/50 mx-1 rounded-2xl shadow-inner no-scrollbar">{Array.isArray(sectionContent) && sectionContent.length === 0 ? (<div className="flex flex-col items-center justify-center h-64 text-gray-400"><Loader2 size={32} className="animate-spin text-emerald-600 mb-4" /><p>Inhoud laden...</p></div>) : Array.isArray(sectionContent) && (sectionContent[0] as HadithData).hadithnumber !== undefined ? (<div className="space-y-6">{(sectionContent as HadithData[]).map((hadith, idx) => (<div key={idx} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"><div className="bg-gray-50 border-b border-gray-100 px-4 py-2 flex justify-between items-center"><span className="text-xs font-bold text-gray-500 uppercase">Hadith #{hadith.hadithnumber}</span></div><div className="p-5">{hadith.arabicText && (<p className="text-right font-arabic text-2xl leading-[2.2] text-gray-800 mb-6" dir="rtl">{hadith.arabicText}</p>)}<p className="text-gray-700 leading-relaxed text-sm mb-4 font-serif">{hadith.translationText || hadith.text}</p>{hadith.grades && hadith.grades.length > 0 && (<div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-50">{hadith.grades.map((grade, gIdx) => (<div key={gIdx} className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase border ${getGradeColor(grade.grade)}`}>{grade.grade}<span>{grade.name}</span></div>))}</div>)}</div></div>))}</div>) : (<div className="prose prose-emerald max-w-none text-gray-700 whitespace-pre-line leading-loose text-lg pb-10">{typeof sectionContent === 'string' ? sectionContent : 'Inhoud geladen'}</div>)}</div></div>
                        )}
                    </div>
                )}
                {activeTab === 'media' && (
                    <div className="pb-24 px-1 space-y-4 pt-2 h-full overflow-y-auto no-scrollbar relative">
                        <div className="flex justify-between items-center px-1 mb-2">
                            <h2 className="text-xl font-bold text-gray-800">Video Bibliotheek</h2>
                            <button 
                                onClick={loadMedia}
                                className={`p-2 rounded-xl bg-white border border-gray-100 shadow-sm text-emerald-600 transition-transform active:rotate-180 ${isLoadingMedia ? 'animate-spin' : ''}`}
                            >
                                <RefreshCw size={18} />
                            </button>
                        </div>
                        
                        {isLoadingMedia && mediaItems.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                                <Loader2 className="animate-spin mb-4" size={40} />
                                <p className="font-bold">Media ophalen...</p>
                            </div>
                        ) : mediaItems.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-gray-400 text-center">
                                <Video size={48} className="mb-4 opacity-10" />
                                <p className="font-bold">Geen media gevonden.</p>
                                <button onClick={loadMedia} className="mt-4 text-emerald-600 font-bold underline">Opnieuw proberen</button>
                            </div>
                        ) : (
                            mediaItems.map(m => (
                                <MediaCard 
                                    key={m.id} 
                                    item={m} 
                                    isPlaying={playingMediaId === m.id} 
                                    onPlay={() => setPlayingMediaId(m.id)} 
                                />
                            ))
                        )}
                    </div>
                )}
                {activeTab === 'ai' && (
                    <div className="flex flex-col h-full pb-4 mx-1">
                        <div className="flex-1 bg-white rounded-3xl shadow-inner border border-gray-100 overflow-y-auto p-4 space-y-4 no-scrollbar" ref={scrollRef}>
                            {messages.map(m => (
                                <div key={m.id} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
                                    <div className={`p-4 rounded-2xl max-w-[90%] text-sm leading-relaxed shadow-sm ${m.role === 'user' ? 'bg-emerald-600 text-white rounded-tr-none' : 'bg-gray-100 text-gray-800 rounded-tl-none'}`}>
                                        {m.text}
                                    </div>
                                    {m.role === 'assistant' && aiSources.length > 0 && messages[messages.length-1].id === m.id && (
                                        <div className="mt-3 w-full animate-in fade-in slide-in-from-top-2">
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1 mb-2">Bronnen gebruikt:</p>
                                            <div className="flex flex-wrap gap-2">
                                                {aiSources.map(s => (
                                                    <button key={s.id} onClick={() => handleSearchResultClick(s)} className="bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-full text-[11px] font-bold text-emerald-700 flex items-center gap-1.5 hover:bg-emerald-100 transition-colors shadow-sm"><FileText size={12} /> {s.title}</button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    {m.role === 'assistant' && aiSuggestions.length > 0 && messages[messages.length-1].id === m.id && (
                                        <div className="mt-4 w-full space-y-2 animate-in fade-in slide-in-from-top-4">
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Aanbevolen Video's:</p>
                                            <div className="grid grid-cols-1 gap-3">
                                                {aiSuggestions.map(v => (
                                                    <MediaCard 
                                                        key={v.id} 
                                                        item={v} 
                                                        isPlaying={playingMediaId === v.id} 
                                                        onPlay={() => setPlayingMediaId(v.id)} 
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                            {isTyping && <div className="text-gray-400 text-[10px] font-bold animate-pulse px-2 flex items-center gap-2"><Bot size={14} /> Al-Noor analyseert...</div>}
                        </div>
                        <div className="p-2 bg-white border border-gray-100 rounded-2xl mt-3 flex gap-2 shadow-sm flex-none">
                            <input value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSendMessage()} placeholder="Stel uw vraag..." className="flex-1 bg-transparent border-none rounded-xl px-3 py-2 outline-none focus:ring-0 text-sm" />
                            <button onClick={handleSendMessage} className="bg-emerald-600 text-white p-2.5 rounded-xl hover:bg-emerald-700 transition-colors shadow-md"><Send size={18} /></button>
                        </div>
                    </div>
                )}
              </>
            )}
        </div>
      </div>
      
      {playingTrackIndex !== null && (
        <AudioPlayer 
            title={bookStructure[playingTrackIndex]?.title || 'Onbekend'} subtitle={selectedBook?.title || 'Audio'} 
            isPlaying={isPlaying} currentTime={currentTime} duration={duration} 
            onPlayPause={() => playTrack(playingTrackIndex)} 
            onClose={() => { if (audioRef.current) audioRef.current.pause(); setIsPlaying(false); setPlayingTrackIndex(null); }} 
            onSeek={t => { if (audioRef.current) audioRef.current.currentTime = t; }} 
            onSkipForward={() => { if (audioRef.current) audioRef.current.currentTime += 10; }} 
            onSkipBack={() => { if (audioRef.current) audioRef.current.currentTime -= 10; }} 
            hasNext={playingTrackIndex < bookStructure.length - 1} hasPrev={playingTrackIndex > 0} 
        />
      )}
    </div>
  );
};
