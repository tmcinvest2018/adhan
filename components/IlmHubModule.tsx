
import React, { useState, useEffect, useRef } from 'react';
import { FeedItem, LibraryBook, ChatMessage, MediaItem, SearchResult, QuranContext, BookStructureNode, HadithData } from '../types';
import { getFeedItems } from '../services/ilmHubData';
import { getLibraryCatalog } from '../services/libraryData';
import { LibraryService } from '../services/libraryService';
import { fetchHadiths } from '../services/hadithService';
import { SearchService } from '../services/SearchService'; 
import { MultimediaService } from '../services/multimediaService';
import { HisnService, HisnSection, HisnItem } from '../services/hisnService';
import { MediaCard } from './MediaCard';
import { Search, Book, Sparkles, Send, ChevronRight, Bot, Library, ScrollText, Home, BookOpen, Loader2, Play, Pause, ArrowLeft, X, Shield, Repeat, CheckCircle2, AlertCircle, HelpCircle } from 'lucide-react';

interface Props {
  t: any;
  language: string;
  onNavigateToQuran: (context: QuranContext) => void;
  onNavigateToTab: (tab: 'ai') => void;
}

export const IlmHubModule: React.FC<Props> = ({ t, language, onNavigateToQuran, onNavigateToTab }) => {
  const [activeTab, setActiveTab] = useState<'feed' | 'hisn' | 'library' | 'media' | 'ai'>('feed');
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [loadingFeed, setLoadingFeed] = useState(true);
  
  // Library State
  const [catalog, setCatalog] = useState<LibraryBook[]>([]);
  const [libView, setLibView] = useState<'categories' | 'books' | 'structure' | 'reader'>('categories');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedBook, setSelectedBook] = useState<LibraryBook | null>(null);
  
  // Index Layer (Structure)
  const [bookStructure, setBookStructure] = useState<BookStructureNode[]>([]);
  const [loadingStructure, setLoadingStructure] = useState(false);
  
  // Reader Layer (Content)
  // Changed type definition to explicitly support HadithData array
  const [sectionContent, setSectionContent] = useState<HadithData[] | string | any[]>([]); 
  const [selectedSectionTitle, setSelectedSectionTitle] = useState('');
  
  // --- HISN MUSLIM STATE ---
  const [hisnView, setHisnView] = useState<'chapters' | 'items'>('chapters');
  const [hisnChapters, setHisnChapters] = useState<HisnSection[]>([]);
  const [selectedChapter, setSelectedChapter] = useState<HisnSection | null>(null);
  const [hisnItems, setHisnItems] = useState<HisnItem[]>([]);
  const [loadingHisn, setLoadingHisn] = useState(false);

  // Download State
  const [downloadProgress, setDownloadProgress] = useState<number>(0);
  const [isDownloading, setIsDownloading] = useState(false);

  // Audio State
  const [playingAudioUrl, setPlayingAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Media State
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);

  // AI State
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
      { id: 'welcome', role: 'assistant', text: "As-salamu alaykum. I am Al-Noor, your AI research assistant.", timestamp: Date.now() }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // SEARCH STATE
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // --- INITIALIZATION ---
  useEffect(() => {
      const load = async () => {
          setLoadingFeed(true);
          const items = await getFeedItems(new Date());
          setFeedItems(items);
          
          const media = await MultimediaService.getFeedMedia(20);
          setMediaItems(media);

          const cat = await getLibraryCatalog(language);
          setCatalog(cat);
          setLoadingFeed(false);

          // Initial load of Hisn chapters
          const chapters = await HisnService.getChapters();
          setHisnChapters(chapters);
      };
      load();
  }, [language]);

  // --- HANDLER FUNCTIONS ---

  const toggleAudio = (url: string) => {
      if (playingAudioUrl === url) {
          if (audioRef.current) {
              audioRef.current.pause();
              setPlayingAudioUrl(null);
              setIsPlaying(false);
          }
      } else {
          if (audioRef.current) {
              audioRef.current.pause();
          }
          audioRef.current = new Audio(url);
          audioRef.current.play();
          setPlayingAudioUrl(url);
          setIsPlaying(true);
          
          audioRef.current.onended = () => {
              setPlayingAudioUrl(null);
              setIsPlaying(false);
          };
      }
  };

  const openBook = async (book: LibraryBook) => {
    setSelectedBook(book);
    setLibView('structure');
    setLoadingStructure(true);
    
    if (book.sourceType === 'static_text' && book.contentCdnUrl && !LibraryService.isContentDownloaded(book.id)) {
        setIsDownloading(true);
        try {
            await LibraryService.downloadContent(book, (progress) => setDownloadProgress(progress));
        } catch (e) {
            console.error(e);
        } finally {
            setIsDownloading(false);
        }
    }

    const structure = await LibraryService.fetchAndCacheStructure(book, language);
    setBookStructure(structure);
    setLoadingStructure(false);
  };

  const handleChapterClick = async (node: BookStructureNode) => {
      if (!selectedBook) return;

      if (selectedBook.sourceType === 'api_quran') {
          const surahNum = node.number || parseInt(node.id);
          onNavigateToQuran({ surah: surahNum });
          return;
      }

      if (selectedBook.sourceType === 'api_hadith' && selectedBook.apiId) {
           setSelectedSectionTitle(node.title);
           setLibView('reader');
           setSectionContent([]); // Clear previous content, treat as loading if empty
           
           try {
               const hadiths = await fetchHadiths(selectedBook.apiId, node.id, language);
               // Store the raw array of objects to enable rich rendering
               setSectionContent(hadiths);
           } catch(e) {
               setSectionContent("Failed to load hadiths.");
           }
           return;
      }

      setSelectedSectionTitle(node.title);
      setLibView('reader');
      
      const fullContent = LibraryService.getContent(selectedBook.id);
      if (fullContent && fullContent[node.id]) {
          setSectionContent(fullContent[node.id]);
      } else {
           if (selectedBook.sourceType === 'static_text') {
               setSectionContent("Content not found. Please ensure the book is fully downloaded.");
           } else {
               setSectionContent("Content unavailable.");
           }
      }
  };

  const handleSendMessage = async () => {
      if (!chatInput.trim()) return;
      
      const userMsg: ChatMessage = {
          id: Date.now().toString(),
          role: 'user',
          text: chatInput,
          timestamp: Date.now()
      };
      
      setMessages(prev => [...prev, userMsg]);
      setChatInput('');
      setIsTyping(true);
      
      setTimeout(() => {
          if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }, 100);

      try {
          const response = await fetch(`https://text.pollinations.ai/${encodeURIComponent("You are a helpful Islamic assistant. Answer briefly: " + userMsg.text)}`);
          const text = await response.text();
          
          const aiMsg: ChatMessage = {
              id: (Date.now() + 1).toString(),
              role: 'assistant',
              text: text,
              timestamp: Date.now()
          };
          setMessages(prev => [...prev, aiMsg]);
      } catch (e) {
          setMessages(prev => [...prev, { id: Date.now().toString(), role: 'assistant', text: "Sorry, I am having trouble connecting right now.", timestamp: Date.now() }]);
      } finally {
          setIsTyping(false);
           setTimeout(() => {
              if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
          }, 100);
      }
  };

  const handleSearchResultClick = (result: SearchResult) => {
      if (result.category === 'quran') {
          if (result.data?.surah) {
              onNavigateToQuran({ surah: result.data.surah, ayah: result.data.ayah });
          }
      } else if (result.category === 'hadith') {
          if (result.data?.bookId) {
             const book = catalog.find(b => b.apiId === result.data.bookId);
             if (book) {
                 setActiveTab('library');
                 setSelectedCategory('hadith_collections');
                 openBook(book); 
             }
          }
      } else if (result.category === 'library') {
          if (result.data?.bookId) {
              const book = catalog.find(b => b.id === result.data.bookId);
              if (book) {
                  setActiveTab('library');
                  setSelectedCategory(book.category);
                  openBook(book).then(() => {
                       if (result.data?.chapterId) {
                           handleChapterClick({ id: result.data.chapterId, title: "Search Result" }); 
                       }
                  });
              }
          }
      } else if (result.category === 'media') {
         setActiveTab('media');
      }
      
      setSearchQuery('');
      setSearchResults([]);
  };

  // --- HISN LOGIC ---

  const openHisnChapter = async (chapter: HisnSection) => {
      setSelectedChapter(chapter);
      setHisnView('items');
      setLoadingHisn(true);
      setHisnItems([]); 

      const items = await HisnService.getDuas(chapter.id, chapter.title);
      setHisnItems(items);
      setLoadingHisn(false);
  };

  const handleHisnBack = () => {
      setHisnView('chapters');
      setHisnItems([]);
      setSelectedChapter(null);
  };

  // --- SEARCH ---
  useEffect(() => {
      const delayDebounceFn = setTimeout(async () => {
          if (searchQuery.length > 2) {
              setIsSearching(true);
              const results = await SearchService.search(searchQuery, language);
              setSearchResults(results);
              setIsSearching(false);
          } else {
              setSearchResults([]);
          }
      }, 500);
      return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, language]);

  const clearSearch = () => { setSearchQuery(''); setSearchResults([]); };
  
  // --- UI HELPERS ---
  const getGradeColor = (grade: string) => {
      const g = grade.toLowerCase();
      if (g.includes('sahih') || g.includes('authentic')) return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      if (g.includes('hasan') || g.includes('good')) return 'bg-blue-100 text-blue-800 border-blue-200';
      if (g.includes('da') && g.includes('if') || g.includes('weak')) return 'bg-red-100 text-red-800 border-red-200';
      return 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const getGradeIcon = (grade: string) => {
      const g = grade.toLowerCase();
      if (g.includes('sahih')) return <CheckCircle2 size={12} />;
      if (g.includes('da')) return <AlertCircle size={12} />;
      return <HelpCircle size={12} />;
  };

  // --- RENDERERS ---

  const renderHisn = () => {
      if (hisnView === 'chapters') {
          const filteredChapters = hisnChapters.filter(c => 
              c.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
              c.id.includes(searchQuery)
          );

          return (
              <div className="animate-in fade-in pb-24">
                  <div className="sticky top-0 bg-[#f0fdf4] z-10 py-4 px-1">
                      <div className="bg-amber-600 text-white p-6 rounded-3xl shadow-lg flex items-center justify-between">
                          <div>
                              <h2 className="text-2xl font-bold">Hisnul Muslim</h2>
                              <p className="text-white/80 text-sm mt-1">Fortress of the Muslim</p>
                          </div>
                          <div className="bg-white/20 p-3 rounded-full">
                              <Shield size={24} />
                          </div>
                      </div>
                  </div>
                  
                  {hisnChapters.length === 0 ? (
                      <div className="flex flex-col items-center justify-center p-10 gap-2">
                          <Loader2 className="animate-spin text-amber-600" />
                          <p className="text-gray-400 text-sm">Loading Book Index...</p>
                      </div>
                  ) : (
                      <div className="grid gap-2 px-1">
                          {filteredChapters.map(chapter => (
                              <div 
                                  key={chapter.id}
                                  onClick={() => openHisnChapter(chapter)}
                                  className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:border-amber-400 cursor-pointer flex items-center gap-4 transition-all active:scale-[0.99]"
                              >
                                  <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-700 font-bold font-mono flex items-center justify-center text-sm shadow-inner">
                                      {chapter.id}
                                  </div>
                                  <div className="font-medium text-gray-800 flex-1 line-clamp-2">{chapter.title}</div>
                                  <ChevronRight size={16} className="text-gray-400" />
                              </div>
                          ))}
                      </div>
                  )}
              </div>
          );
      }

      return (
          <div className="animate-in slide-in-from-right pb-24 h-full flex flex-col">
              <div className="sticky top-0 bg-[#f0fdf4] z-10 py-4 px-1 border-b border-gray-100 mb-2 shadow-sm">
                  <button onClick={handleHisnBack} className="flex items-center gap-2 text-gray-600 hover:text-amber-700 mb-2 font-medium">
                      <ArrowLeft size={18} /> Back to Chapters
                  </button>
                  <h2 className="font-bold text-lg text-gray-800 leading-tight pr-4">
                      <span className="text-amber-600 mr-2">#{selectedChapter?.id}</span>
                      {selectedChapter?.title}
                  </h2>
              </div>

              {loadingHisn ? (
                  <div className="flex flex-col items-center justify-center p-10 gap-4">
                      <Loader2 className="animate-spin text-amber-600" size={32} />
                      <p className="text-gray-500">Loading Content...</p>
                  </div>
              ) : hisnItems.length === 0 ? (
                  <div className="text-center p-10 text-gray-400 flex flex-col items-center gap-4">
                      <BookOpen size={40} className="opacity-20" />
                      <p>Content unavailable for this section.</p>
                      <button onClick={handleHisnBack} className="text-emerald-600 text-sm font-bold">Go Back</button>
                  </div>
              ) : (
                  <div className="space-y-6 px-1 pt-2">
                      {hisnItems.map((item, idx) => (
                          <div key={idx} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                              <div className="p-5 bg-[#fcfcfc] border-b border-gray-50">
                                  <p className="text-right font-arabic text-2xl sm:text-3xl leading-[2.2] text-gray-800" dir="rtl">
                                      {item.arabic_text}
                                  </p>
                              </div>

                              <div className="p-5">
                                  <p className="text-gray-700 text-base leading-relaxed mb-6 font-serif">
                                      {item.translation}
                                  </p>

                                  <div className="flex items-center gap-3 bg-gray-100 text-gray-600 px-4 py-3 rounded-xl mb-4 text-sm font-medium">
                                      <div className="bg-white p-1.5 rounded-full shadow-sm">
                                          <Repeat size={14} className="text-emerald-600" />
                                      </div>
                                      <span>Recommended: {item.recommended_repeat_count} time{item.recommended_repeat_count > 1 ? 's' : ''}</span>
                                  </div>

                                  <div className="text-[11px] uppercase tracking-wider text-gray-400 font-bold border-t border-gray-50 pt-3 flex items-center gap-1">
                                      <Book size={12} />
                                      {item.reference_source}
                                  </div>
                              </div>
                          </div>
                      ))}
                  </div>
              )}
          </div>
      );
  }

  const Breadcrumb = () => (
      <div className="flex items-center gap-2 text-xs font-medium text-gray-500 mb-4 px-1 overflow-x-auto whitespace-nowrap">
          <button onClick={() => setLibView('categories')} className="hover:text-emerald-600 flex items-center shrink-0">
              <Home size={12} className="mr-1" /> Library
          </button>
          {selectedCategory && libView !== 'categories' && (
              <>
                  <ChevronRight size={10} className="shrink-0" />
                  <button onClick={() => setLibView('books')} className="hover:text-emerald-600 shrink-0 capitalize">
                    {selectedCategory.replace('_', ' ')}
                  </button>
              </>
          )}
          {selectedBook && (libView === 'structure' || libView === 'reader') && (
              <>
                <ChevronRight size={10} className="shrink-0" />
                <button onClick={() => setLibView('structure')} className="hover:text-emerald-600 shrink-0 max-w-[120px] truncate font-bold">
                    {selectedBook.title}
                </button>
              </>
          )}
      </div>
  );

  const renderLibrary = () => {
    if (libView === 'categories') {
        const categories = [
            { id: 'quran_tafsir', title: 'Quran & Tafsir', icon: <BookOpen size={24} />, color: 'bg-emerald-600' },
            { id: 'hadith_collections', title: 'Hadith Collections', icon: <Library size={24} />, color: 'bg-indigo-600' },
            { id: 'classical_texts', title: 'Classical Texts', icon: <ScrollText size={24} />, color: 'bg-amber-600' }
        ];

        return (
            <div className="animate-in fade-in pb-24">
                    <div className="sticky top-0 bg-[#f0fdf4] z-10 py-4 px-1">
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Library</h2>
                    </div>
                    <div className="grid gap-4">
                        {categories.map(cat => (
                            <div 
                                key={cat.id}
                                onClick={() => { setSelectedCategory(cat.id); setLibView('books'); }}
                                className={`${cat.color} text-white p-6 rounded-3xl shadow-lg cursor-pointer hover:scale-[1.02] transition-transform flex items-center justify-between`}
                            >
                                <div>
                                    <h3 className="text-xl font-bold">{cat.title}</h3>
                                    <p className="text-white/80 text-sm mt-1">Browse Collection</p>
                                </div>
                                <div className="bg-white/20 p-3 rounded-full">{cat.icon}</div>
                            </div>
                        ))}
                    </div>
            </div>
        );
    }
    
    if (libView === 'books') {
        const books = catalog.filter(b => b.category === selectedCategory);
        return (
            <div className="animate-in slide-in-from-right pb-24 h-full flex flex-col">
                <Breadcrumb />
                <div className="grid grid-cols-2 gap-3">
                    {books.map(book => (
                        <div 
                            key={book.id}
                            onClick={() => openBook(book)}
                            className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 cursor-pointer hover:border-emerald-500 transition-all flex flex-col h-48 justify-between group"
                        >
                                <div>
                                    <div className={`w-8 h-8 rounded-lg mb-3 ${book.coverColor || 'bg-gray-500'} flex items-center justify-center text-white`}>
                                        <Book size={16} />
                                    </div>
                                    <h4 className="font-bold text-gray-800 leading-tight group-hover:text-emerald-700 line-clamp-2">{book.title}</h4>
                                </div>
                                <div className="flex justify-between items-end">
                                    <p className="text-xs text-gray-500 truncate max-w-[80px]">{book.author}</p>
                                    <div className="bg-gray-50 p-2 rounded-full text-gray-400 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
                                        <ChevronRight size={16} />
                                    </div>
                                </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (libView === 'structure') {
            return (
            <div className="animate-in slide-in-from-right pb-24 h-full flex flex-col relative">
                    <Breadcrumb />
                    {isDownloading && (
                        <div className="absolute inset-0 z-50 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center rounded-2xl animate-in fade-in">
                            <Loader2 size={40} className="animate-spin text-emerald-600 mb-4" />
                            <h3 className="font-bold text-gray-800">Downloading Book...</h3>
                            <div className="w-48 h-2 bg-gray-200 rounded-full mt-2 overflow-hidden">
                                <div className="h-full bg-emerald-500 transition-all duration-300" style={{ width: `${downloadProgress}%` }} />
                            </div>
                            <p className="text-xs text-gray-500 mt-2">{Math.round(downloadProgress)}%</p>
                        </div>
                    )}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex-1 flex flex-col">
                        <div className="p-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                            <h2 className="font-bold text-lg truncate max-w-[70%]">{selectedBook?.title}</h2>
                            <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full font-bold">Chapters</span>
                        </div>
                        <div className="divide-y divide-gray-50 overflow-y-auto flex-1">
                            {loadingStructure ? (
                                <div className="flex flex-col items-center justify-center h-48 text-gray-400">
                                    <Loader2 className="animate-spin mb-2" size={24} />
                                    <span className="text-sm">Loading Index...</span>
                                </div>
                            ) : bookStructure.length === 0 ? (
                                <div className="p-8 text-center text-gray-400">No chapters found.</div>
                            ) : (
                                bookStructure.map((node) => (
                                    <div 
                                        key={node.id}
                                        className={`p-4 hover:bg-emerald-50 cursor-pointer flex justify-between items-center group transition-colors ${playingAudioUrl === node.audioUrl ? 'bg-emerald-50' : ''}`}
                                    >
                                        <div 
                                            className="flex-1 flex items-center gap-3"
                                            onClick={() => handleChapterClick(node)}
                                        >
                                            <span className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full text-xs font-bold text-gray-500 group-hover:bg-emerald-200 group-hover:text-emerald-800">
                                                {node.number || node.id.replace(/\D/g, '') || '#'}
                                            </span>
                                            <span className="text-sm font-medium text-gray-700 group-hover:text-emerald-800 line-clamp-1">
                                                {node.title}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {node.audioUrl && (
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); toggleAudio(node.audioUrl!); }}
                                                    className={`p-2 rounded-full transition-all ${playingAudioUrl === node.audioUrl ? 'bg-emerald-600 text-white shadow-md scale-110' : 'bg-gray-100 text-gray-400 hover:text-emerald-600 hover:bg-emerald-100'}`}
                                                >
                                                    {playingAudioUrl === node.audioUrl ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}
                                                </button>
                                            )}
                                            <button onClick={() => handleChapterClick(node)} className="p-2 text-gray-300 hover:text-emerald-600 hover:bg-emerald-50 rounded-full">
                                                <ChevronRight size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
            </div>
            );
    }

    if (libView === 'reader') {
        const isHadithArray = Array.isArray(sectionContent) && sectionContent.length > 0 && (sectionContent[0] as HadithData).hadithnumber !== undefined;

        return (
            <div className="animate-in slide-in-from-right pb-24 h-full flex flex-col">
                <div className="bg-white border-b border-gray-100 p-4 flex items-center gap-3 sticky top-0 z-10">
                    <button onClick={() => setLibView('structure')} className="p-2 hover:bg-gray-100 rounded-full">
                        <ArrowLeft size={20} className="text-gray-600" />
                    </button>
                    <h2 className="font-bold text-gray-800 truncate">{selectedSectionTitle}</h2>
                </div>
                
                <div className="bg-white p-4 flex-1 overflow-y-auto bg-gray-50/50">
                     {Array.isArray(sectionContent) && sectionContent.length === 0 ? (
                         <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                             <Loader2 size={32} className="animate-spin text-emerald-600 mb-4" />
                             <p>Loading Content...</p>
                         </div>
                     ) : isHadithArray ? (
                         <div className="space-y-6">
                             {(sectionContent as HadithData[]).map((hadith, idx) => (
                                <div key={idx} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                    <div className="bg-gray-50 border-b border-gray-100 px-4 py-2 flex justify-between items-center">
                                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Hadith #{hadith.hadithnumber}</span>
                                        <button className="text-gray-400 hover:text-emerald-600"><BookOpen size={16} /></button>
                                    </div>
                                    <div className="p-5">
                                        {hadith.arabicText && (
                                            <p className="text-right font-arabic text-2xl leading-[2.2] text-gray-800 mb-6" dir="rtl">
                                                {hadith.arabicText}
                                            </p>
                                        )}
                                        <p className="text-gray-700 leading-relaxed text-sm mb-4 font-serif">
                                            {hadith.translationText || hadith.text}
                                        </p>
                                        
                                        {/* GRADING & SOURCE SECTION */}
                                        {hadith.grades && hadith.grades.length > 0 && (
                                            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-50">
                                                {hadith.grades.map((grade, gIdx) => (
                                                    <div key={gIdx} className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getGradeColor(grade.grade)}`}>
                                                        {getGradeIcon(grade.grade)}
                                                        <span>{grade.name}: {grade.grade}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                             ))}
                         </div>
                     ) : (
                         // Fallback for static text books
                         <div className="prose prose-emerald max-w-none text-gray-700 whitespace-pre-line leading-loose text-lg pb-10">
                              {typeof sectionContent === 'string' ? sectionContent : 'Content Loaded'} 
                         </div>
                     )}
                </div>
            </div>
        );
    }
    return null;
  };

  const renderFeed = () => {
    if (loadingFeed) return <div className="flex justify-center h-64"><Loader2 className="animate-spin text-emerald-600" size={32} /></div>;
    return (
      <div className="space-y-4 animate-in fade-in pb-24">
          <div className="bg-emerald-600 text-white p-6 rounded-3xl shadow-lg mb-2">
              <h2 className="text-sm font-medium opacity-80 uppercase tracking-wider mb-1">{t.ilmhub.feed.daily}</h2>
              <div className="text-xl font-bold font-serif italic mb-4 leading-relaxed">
                  {feedItems.find(i => i.type === 'daily_wisdom')?.content}
              </div>
          </div>
          {feedItems.filter(i => i.type !== 'daily_wisdom').map(item => (
              item.type === 'media_highlight' ? (
                  <MediaCard 
                    key={item.id} 
                    item={{
                        id: item.id,
                        title: item.title,
                        author: item.source || '',
                        type: item.mediaType,
                        category: item.tags[0] as any || 'lecture',
                        url: item.mediaUrl || '',
                        thumbnail: item.thumbnailUrl
                    }} 
                  />
              ) : (
                  <div key={item.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex gap-4">
                     <div className="bg-blue-50 text-blue-600 w-10 h-10 rounded-full flex items-center justify-center shrink-0">
                         <Sparkles size={18} />
                     </div>
                     <div>
                         <h4 className="font-bold text-gray-800">{item.title}</h4>
                         <p className="text-gray-600 text-sm mt-1">{item.content}</p>
                     </div>
                  </div>
              )
          ))}
      </div>
    );
  };

  const renderMedia = () => (
      <div className="animate-in fade-in pb-24 grid gap-4">
          {mediaItems.length === 0 ? <div className="text-center p-10 text-gray-400">Loading media...</div> : mediaItems.map(media => (
                <MediaCard key={media.id} item={media} />
            ))}
      </div>
  );

  const renderAI = () => (
      <div className="flex flex-col h-[calc(100vh-180px)] animate-in fade-in">
          <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-4 rounded-t-2xl shadow-md">
              <h2 className="font-bold flex items-center gap-2"><Bot size={20} /> Al-Noor Assistant</h2>
          </div>
          <div className="flex-1 bg-white border-x border-gray-100 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
              {messages.map(msg => (
                  <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                      <div className={`p-3 rounded-2xl text-sm ${msg.role === 'user' ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-800'}`}>
                          {msg.text}
                      </div>
                  </div>
              ))}
              {isTyping && <div className="text-gray-400 text-xs animate-pulse">Al-Noor is typing...</div>}
          </div>
          <div className="bg-white p-3 border-t border-gray-100 rounded-b-2xl flex gap-2">
              <input value={chatInput} onChange={(e) => setChatInput(e.target.value)} placeholder="Type a message..." className="flex-1 bg-gray-50 border-none rounded-xl px-4 py-3" />
              <button onClick={handleSendMessage} className="bg-emerald-600 text-white p-3 rounded-xl"><Send size={20} /></button>
          </div>
      </div>
  );

  const renderSearchResults = () => (
      <div className="animate-in fade-in pb-24 space-y-4">
          <div className="flex justify-between items-center px-1">
              <h3 className="font-bold text-gray-500 text-xs uppercase tracking-wider">Search Results</h3>
              {isSearching && <Loader2 size={16} className="animate-spin text-emerald-600" />}
          </div>
          
          {searchResults.length === 0 && !isSearching && (
              <div className="text-center py-10 text-gray-400">
                  <Search size={48} className="mx-auto mb-4 opacity-20" />
                  <p>No results found for "{searchQuery}"</p>
                  <p className="text-xs mt-1">Try "Bukhari 1" or "Surah 2"</p>
              </div>
          )}

          {searchResults.map((result) => {
              if (result.category === 'media') {
                  return (
                      <div key={result.id} onClick={() => handleSearchResultClick(result)}>
                          <MediaCard item={result.data as MediaItem} />
                      </div>
                  );
              }
              return (
                  <div 
                    key={result.id} 
                    onClick={() => handleSearchResultClick(result)}
                    className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 cursor-pointer hover:border-emerald-500 transition-colors"
                  >
                      <div className="flex justify-between items-start mb-1">
                          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${result.category === 'quran' ? 'bg-emerald-100 text-emerald-700' : 'bg-indigo-100 text-indigo-700'}`}>
                              {result.category}
                          </span>
                      </div>
                      <h4 className="font-bold text-gray-800">{result.title}</h4>
                      <p className="text-sm text-gray-600 line-clamp-2 mt-1">{result.contentPreview || result.subtitle}</p>
                  </div>
              );
          })}
      </div>
  );

  // --- MAIN RENDER ---
  return (
    <div className="h-full flex flex-col">
         {/* Persistent Search Bar */}
         <div className="sticky top-0 bg-[#f0fdf4] z-30 pt-4 pb-2 px-1">
              <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input 
                      type="text" 
                      placeholder="Search Quran, Hadith, or Library..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-white pl-10 pr-10 py-3 rounded-xl border-none shadow-sm focus:ring-2 focus:ring-emerald-500"
                  />
                  {searchQuery && (
                      <button onClick={clearSearch} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                          <X size={16} />
                      </button>
                  )}
              </div>
         </div>

         {/* Content Area */}
         <div className="flex-1 overflow-y-auto no-scrollbar">
             {searchQuery.length > 0 ? (
                 renderSearchResults()
             ) : (
                 <>
                    {/* Tabs - Only show when NOT in deep views */}
                    {activeTab !== 'hisn' || hisnView === 'chapters' ? (
                        <div className="flex p-1 bg-gray-200/50 rounded-xl mb-4 mx-1 sticky top-0 z-20 backdrop-blur">
                            {(['feed', 'hisn', 'library', 'media', 'ai'] as const).map(tabKey => (
                                <button 
                                    key={tabKey}
                                    onClick={() => { setActiveTab(tabKey); setHisnView('chapters'); }}
                                    className={`flex-1 py-2 rounded-lg text-[10px] sm:text-xs font-bold transition-all ${activeTab === tabKey ? 'bg-white text-emerald-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                >
                                    {t.ilmhub.tabs[tabKey]}
                                </button>
                            ))}
                        </div>
                    ) : null}

                    {activeTab === 'feed' && renderFeed()}
                    {activeTab === 'hisn' && renderHisn()}
                    {activeTab === 'library' && renderLibrary()}
                    {activeTab === 'media' && renderMedia()}
                    {activeTab === 'ai' && renderAI()}
                 </>
             )}
         </div>
    </div>
  );
};
