
import React, { useState, useEffect, useRef } from 'react';
import { FeedItem, LibraryBook, ChatMessage, MediaItem, SearchResult, QuranContext, HadithData } from '../types';
import { getFeedItems, searchUniversal } from '../services/ilmHubData';
import { getLibraryCatalog } from '../services/libraryData';
import { KNOWLEDGE_DB } from '../services/knowledgeData'; // Import Dhikr DB
import { fetchSections, fetchHadiths } from '../services/hadithService';
import { fetchSurahList } from '../services/quranService'; 
import { searchYouTube } from '../services/youtubeService';
import { DownloadService } from '../services/downloadService';
import { Search, Book, Sparkles, Send, Download, Check, ChevronRight, User, Bot, Library, ScrollText, Home, BookOpen, AlertCircle, Loader2 } from 'lucide-react';

interface Props {
  t: any;
  language: string;
  onNavigateToQuran: (context: QuranContext) => void;
  onNavigateToTab: (tab: 'ai') => void;
}

export const IlmHubModule: React.FC<Props> = ({ t, language, onNavigateToQuran, onNavigateToTab }) => {
  const [activeTab, setActiveTab] = useState<'feed' | 'library' | 'media' | 'ai'>('feed');
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [loadingFeed, setLoadingFeed] = useState(true);
  
  // Search
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  
  // Library State
  const [catalog, setCatalog] = useState<LibraryBook[]>([]);
  const [libView, setLibView] = useState<'categories' | 'books' | 'chapters' | 'reader'>('categories');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedBook, setSelectedBook] = useState<LibraryBook | null>(null);
  const [bookSections, setBookSections] = useState<any[]>([]); // HadithSection or Surah or AdhkarCategory
  const [selectedSection, setSelectedSection] = useState<any | null>(null);
  const [sectionContent, setSectionContent] = useState<any[] | string>([]); 
  const [loadingLib, setLoadingLib] = useState(false);

  // Media State
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [mediaCategory, setMediaCategory] = useState<'all' | 'quran' | 'lecture' | 'fiqh'>('all');

  // Offline/Download State
  const [downloadedItems, setDownloadedItems] = useState<Set<string>>(new Set());
  const [processingDownload, setProcessingDownload] = useState<string | null>(null);

  // AI State
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
      { id: 'welcome', role: 'assistant', text: "As-salamu alaykum. I am Al-Noor, your AI research assistant. Ask me about Islamic history, theology, or etiquette.", timestamp: Date.now() }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load Feed
  useEffect(() => {
      const load = async () => {
          setLoadingFeed(true);
          const items = await getFeedItems(new Date());
          setFeedItems(items);
          setLoadingFeed(false);
          const cat = await getLibraryCatalog(language);
          setCatalog(cat);
      };
      load();
  }, [language]);

  const checkOfflineStatus = async (id: string) => {
      const isOffline = await DownloadService.isAvailableOffline(id);
      if (isOffline) {
          setDownloadedItems(prev => new Set(prev).add(id));
      }
  };

  useEffect(() => {
      if (activeTab === 'media' && mediaItems.length === 0) {
          searchYouTube('').then(items => {
              setMediaItems(items);
              items.forEach(i => checkOfflineStatus(i.id));
          });
      }
  }, [activeTab]);

  useEffect(() => {
      if(scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isTyping]);

  const toggleDownload = async (id: string, data: any, type: 'book' | 'media') => {
      setProcessingDownload(id);
      const isDownloaded = downloadedItems.has(id);
      try {
          if (isDownloaded) {
              await DownloadService.removeOfflineContent(id);
              setDownloadedItems(prev => {
                  const next = new Set(prev);
                  next.delete(id);
                  return next;
              });
          } else {
              let dataToSave = data;
              if (type === 'book' && selectedBook) {
                  dataToSave = {
                      ...selectedBook,
                      offlineSectionTitle: selectedSection?.title,
                      offlineContent: sectionContent
                  };
              }
              await DownloadService.saveForOffline(id, dataToSave);
              setDownloadedItems(prev => new Set(prev).add(id));
          }
      } catch (e) {
          alert("Could not save content offline.");
      } finally {
          setProcessingDownload(null);
      }
  };

  useEffect(() => {
      const delayDebounceFn = setTimeout(async () => {
          if (searchQuery.length >= 2) {
              const results = await searchUniversal(searchQuery, language);
              setSearchResults(results);
          } else {
              setSearchResults([]);
          }
      }, 500);
      return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, language]);

  const handleSearchItemClick = (item: SearchResult) => {
      if (item.category === 'quran') {
          onNavigateToQuran(item.data); 
      } else if (item.category === 'library') {
        setActiveTab('library');
      } else if (item.category === 'media') {
           alert(`Playing: ${item.title}`);
      } else if (item.category === 'hadith') {
           setActiveTab('library');
      }
  };

  const handleSendMessage = async () => {
      if(!chatInput.trim()) return;
      
      const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: chatInput, timestamp: Date.now() };
      setMessages(prev => [...prev, userMsg]);
      setChatInput('');
      setIsTyping(true);

      setTimeout(() => {
          setIsTyping(false);
          const aiMsg: ChatMessage = { 
              id: (Date.now()+1).toString(), 
              role: 'assistant', 
              text: `Here is a summary regarding "${userMsg.text}":\n\nBased on general Islamic principles, this topic is often discussed in the context of [Context]. Scholars have mentioned that sincerity (Ikhlas) is key.\n\n${t.ilmhub.ai.disclaimer}`,
              sources: [
                  { title: "Quran 2:255", url: "#" },
                  { title: "Sahih Bukhari (Book of Knowledge)", url: "#" }
              ],
              timestamp: Date.now()
          };
          setMessages(prev => [...prev, aiMsg]);
      }, 1500);
  };

  // --- LIBRARY LOGIC ---

  const openBook = async (book: LibraryBook) => {
      setSelectedBook(book);
      setLoadingLib(true);

      if (book.sourceType === 'api_quran') {
          if (book.id === 'quran_main') {
              onNavigateToQuran({ surah: 1 });
              setLoadingLib(false);
              return;
          }
          const surahs = await fetchSurahList();
          setBookSections(surahs);
          setLibView('chapters');
      } 
      else if (book.sourceType === 'api_hadith' && book.apiId) {
          const { sections } = await fetchSections(book.apiId, language);
          setBookSections(sections);
          setLibView('chapters');
      }
      else if (book.id === 'hisn_muslim') {
          // GENERATE ADHKAR CATEGORIES from KNOWLEDGE_DB
          const cats = [
              { id: 'dhikr_morning', title: 'Morning Adhkar' },
              { id: 'dhikr_evening', title: 'Evening Adhkar' },
              { id: 'dhikr_prayer', title: 'After Prayer Adhkar' },
              { id: 'hadith_general', title: 'General Hadith' },
              { id: 'hadith_prayer', title: 'Prayer Hadith' }
          ];
          setBookSections(cats);
          setLibView('chapters');
      }
      else if (book.sourceType === 'static_text' && book.chapters) {
          setBookSections(book.chapters);
          setLibView('chapters');
      }
      
      setLoadingLib(false);
  };

  const openSection = async (section: any) => {
      setSelectedSection(section);
      setLoadingLib(true);

      // Hadith API
      if (selectedBook?.sourceType === 'api_hadith' && selectedBook.apiId) {
          const hadiths = await fetchHadiths(selectedBook.apiId, section.id, language);
          setSectionContent(hadiths);
          setLibView('reader');
          checkOfflineStatus(`${selectedBook.id}_${section.id}`);
      }
      // Quran API (External Nav)
      else if (selectedBook?.sourceType === 'api_quran') {
           onNavigateToQuran({ 
               surah: section.number, 
               mode: 'tafsir', 
               editionId: selectedBook.apiId 
           });
           setLoadingLib(false);
           return;
      }
      // Adhkar (Local DB)
      else if (selectedBook?.id === 'hisn_muslim') {
          // Filter KNOWLEDGE_DB for this category
          const items = KNOWLEDGE_DB.filter(k => k.category === section.id);
          // Map to HadithData structure for uniform Reader
          const mappedItems = items.map((k, idx) => ({
              hadithnumber: idx + 1,
              text: k.translation,
              arabicText: k.arabic,
              translationText: k.translation, // Redundant but safe
              grades: [],
              reference: { book: 1, hadith: idx + 1 }
          }));
          setSectionContent(mappedItems);
          setLibView('reader');
      }
      // Static Text
      else if (selectedBook?.sourceType === 'static_text') {
          setSectionContent(section.content);
          setLibView('reader');
          checkOfflineStatus(`${selectedBook.id}_${section.id}`);
      }

      setLoadingLib(false);
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
                <div className="flex gap-2">
                    {feedItems.find(i => i.type === 'daily_wisdom')?.tags.map(tag => (
                        <span key={tag} className="bg-white/20 px-3 py-1 rounded-full text-xs font-medium">{tag}</span>
                    ))}
                </div>
            </div>
            <h3 className="font-bold text-gray-800 text-lg px-2">Timeline</h3>
            {feedItems.filter(i => i.type !== 'daily_wisdom').map(item => (
                <div key={item.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-3">
                    <div className="flex gap-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${item.type === 'reminder' ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'}`}>
                            {item.type === 'reminder' ? <Sparkles size={20} /> : <Book size={20} />}
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-800">{item.title}</h4>
                            <p className="text-gray-600 text-sm mt-1 leading-relaxed">{item.content}</p>
                        </div>
                    </div>
                </div>
            ))}
        </div>
      );
  };

  // --- BREADCRUMB COMPONENT ---
  const Breadcrumb = () => (
      <div className="flex items-center gap-2 text-xs font-medium text-gray-500 mb-4 px-1 overflow-x-auto whitespace-nowrap">
          {/* Level 1: Library Root */}
          <button onClick={() => setLibView('categories')} className="hover:text-emerald-600 flex items-center shrink-0">
              <Home size={12} className="mr-1" /> Library
          </button>
          
          {/* Level 2: Book List */}
          {selectedCategory && libView !== 'categories' && (
              <>
                  <ChevronRight size={10} className="shrink-0" />
                  <button onClick={() => setLibView('books')} className="hover:text-emerald-600 shrink-0">
                    {selectedCategory === 'quran_tafsir' ? 'Quran' : selectedCategory === 'hadith_collections' ? 'Hadith' : 'Classical'}
                  </button>
              </>
          )}

          {/* Level 3: Chapter List (Inside a Book) */}
          {selectedBook && (libView === 'chapters' || libView === 'reader') && (
              <>
                <ChevronRight size={10} className="shrink-0" />
                <button onClick={() => setLibView('chapters')} className="hover:text-emerald-600 shrink-0 max-w-[120px] truncate">
                    {selectedBook.title}
                </button>
              </>
          )}

          {/* Level 4: Reader (Inside a Chapter) */}
          {selectedSection && libView === 'reader' && (
              <>
                <ChevronRight size={10} className="shrink-0" />
                <span className="text-emerald-600 font-bold shrink-0 max-w-[120px] truncate">
                    {selectedSection.title || selectedSection.englishName}
                </span>
              </>
          )}
      </div>
  );

  const renderLibrary = () => {
      // 1. Categories View
      if (libView === 'categories') {
          const categories = [
              { id: 'quran_tafsir', title: 'Quran & Tafsir', icon: <BookOpen size={24} />, color: 'bg-emerald-600' },
              { id: 'hadith_collections', title: 'Hadith Collections', icon: <Library size={24} />, color: 'bg-indigo-600' },
              { id: 'classical_texts', title: 'Classical Texts & Dua', icon: <ScrollText size={24} />, color: 'bg-amber-600' }
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
                   <div className="mt-8">
                        <div className="relative shadow-sm rounded-xl">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input 
                                type="text" 
                                placeholder={t.ilmhub.library.search}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-white pl-10 pr-4 py-3.5 rounded-xl border-none shadow-sm focus:ring-2 focus:ring-emerald-500"
                            />
                        </div>
                        {searchQuery && renderSearchResults()}
                   </div>
              </div>
          );
      }

      // 2. Books View (Level 2)
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
                              className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 cursor-pointer hover:border-emerald-500 transition-all flex flex-col h-40 justify-between group"
                          >
                                <div>
                                    <div className={`w-8 h-8 rounded-lg mb-3 ${book.coverColor || 'bg-gray-500'} flex items-center justify-center text-white`}>
                                        <Book size={16} />
                                    </div>
                                    <h4 className="font-bold text-gray-800 leading-tight group-hover:text-emerald-700 line-clamp-2">{book.title}</h4>
                                </div>
                                <p className="text-xs text-gray-500 truncate">{book.author}</p>
                          </div>
                      ))}
                  </div>
              </div>
          );
      }

      // 3. Chapters View (Level 3)
      if (libView === 'chapters') {
           return (
              <div className="animate-in slide-in-from-right pb-24 h-full flex flex-col">
                   <Breadcrumb />
                   <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex-1 flex flex-col">
                        <div className="p-4 bg-gray-50 border-b border-gray-100">
                            <h2 className="font-bold text-lg">{selectedBook?.title}</h2>
                            <p className="text-xs text-gray-500">Select a Chapter</p>
                        </div>
                        <div className="divide-y divide-gray-50 overflow-y-auto flex-1">
                            {loadingLib ? (
                                <div className="p-8 text-center"><Loader2 className="animate-spin inline text-emerald-500" /></div>
                            ) : (
                                bookSections.length > 0 ? (
                                    bookSections.map((section: any) => (
                                        <div 
                                            key={section.id || section.number}
                                            onClick={() => openSection(section)}
                                            className="p-4 hover:bg-emerald-50 cursor-pointer flex justify-between items-center"
                                        >
                                            <span className="text-sm font-medium text-gray-700">
                                                <span className="text-emerald-600 font-bold mr-3">{section.id || section.number}.</span>
                                                {section.title || section.englishName}
                                            </span>
                                            <ChevronRight size={16} className="text-gray-300" />
                                        </div>
                                    ))
                                ) : (
                                    <div className="flex flex-col items-center justify-center p-10 text-center text-gray-400">
                                        <AlertCircle size={32} className="mb-2 opacity-50" />
                                        <p>Unable to load chapters.</p>
                                        <button onClick={() => openBook(selectedBook!)} className="mt-4 text-emerald-600 font-bold text-sm hover:underline">Retry</button>
                                    </div>
                                )
                            )}
                        </div>
                   </div>
              </div>
           );
      }

      // 4. Reader View (Level 4 - Content)
      if (libView === 'reader') {
          const contentId = `${selectedBook?.id}_${selectedSection?.id}`;
          const isDownloaded = downloadedItems.has(contentId);
          const isProcessing = processingDownload === contentId;

          const getGradeColor = (grade: string) => {
              const g = grade.toLowerCase();
              if (g.includes('sahih')) return 'bg-emerald-100 text-emerald-800 border-emerald-200';
              if (g.includes('hasan')) return 'bg-amber-100 text-amber-800 border-amber-200';
              if (g.includes('da\'if') || g.includes('weak')) return 'bg-red-100 text-red-800 border-red-200';
              return 'bg-gray-100 text-gray-600 border-gray-200';
          };

          return (
              <div className="animate-in slide-in-from-right pb-24 h-full flex flex-col">
                  <Breadcrumb />
                  <div className="flex justify-between items-center mb-4 px-1">
                        <h2 className="font-bold text-lg text-gray-800 truncate max-w-[200px]">{selectedSection?.title || 'Chapter'}</h2>
                        <button 
                            onClick={() => toggleDownload(contentId, sectionContent, 'book')}
                            disabled={isProcessing}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${isDownloaded ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                        >
                            {isProcessing ? <Loader2 size={14} className="animate-spin" /> : (
                                isDownloaded ? <><Check size={14} /> Saved</> : <><Download size={14} /> Save Offline</>
                            )}
                        </button>
                  </div>

                  <div className="bg-white p-2 rounded-3xl shadow-sm border border-gray-100 flex-1 overflow-y-auto">
                      {Array.isArray(sectionContent) ? (
                          <div className="space-y-4 pb-10">
                              {sectionContent.map((h: any, i: number) => (
                                  <div key={i} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden">
                                      {/* Hadith Number Tag */}
                                      <div className="absolute top-0 left-0 bg-gray-50 text-gray-400 px-3 py-1 rounded-br-xl text-xs font-mono font-bold border-b border-r border-gray-100">
                                          #{h.hadithnumber}
                                      </div>

                                      {/* Content Container */}
                                      <div className="mt-4">
                                          {/* Arabic Text */}
                                          {h.arabicText && (
                                              <p className="text-right font-arabic text-2xl sm:text-3xl leading-[2.2] text-gray-800 mb-6" dir="rtl">
                                                  {h.arabicText}
                                              </p>
                                          )}
                                          
                                          {/* Translation */}
                                          <p className="text-left text-gray-700 text-sm sm:text-base leading-relaxed font-sans border-l-4 border-emerald-500/30 pl-4">
                                              {h.translationText || h.text}
                                          </p>
                                      </div>

                                      {/* Metadata Footer (Grades) */}
                                      {h.grades && h.grades.length > 0 && (
                                          <div className="mt-6 pt-4 border-t border-gray-50 flex flex-wrap gap-2">
                                              {h.grades.map((g: any, idx: number) => (
                                                  <span key={idx} className={`text-[10px] uppercase font-bold px-2 py-1 rounded border ${getGradeColor(g.grade)}`}>
                                                      {g.name}: {g.grade}
                                                  </span>
                                              ))}
                                          </div>
                                      )}
                                  </div>
                              ))}
                              {sectionContent.length === 0 && (
                                  <div className="text-center py-10 text-gray-400">No content available for this section.</div>
                              )}
                          </div>
                      ) : (
                          <div className="prose prose-emerald max-w-none text-gray-700 whitespace-pre-line leading-loose p-4">
                              {sectionContent}
                          </div>
                      )}
                  </div>
              </div>
          );
      }
      return null;
  };
  
  const renderSearchResults = () => {
       if (searchResults.length === 0) return null;
       return (
           <div className="mt-4 bg-white rounded-xl shadow-lg border border-gray-100 absolute w-full z-20 left-0">
               {searchResults.slice(0, 5).map(item => (
                   <div key={item.id} onClick={() => handleSearchItemClick(item)} className="p-3 border-b border-gray-50 last:border-0 hover:bg-gray-50 cursor-pointer">
                       <p className="font-bold text-sm text-gray-800">{item.title}</p>
                       <p className="text-xs text-gray-500">{item.category}</p>
                   </div>
               ))}
           </div>
       )
  };

  const renderMedia = () => {
    const categories = [
        { id: 'all', label: 'All' },
        { id: 'quran', label: t.ilmhub.media.cat_quran },
        { id: 'lecture', label: t.ilmhub.media.cat_lecture },
        { id: 'fiqh', label: t.ilmhub.media.cat_fiqh }
    ];

    const filteredMedia = mediaItems.filter(m => mediaCategory === 'all' || m.category === mediaCategory);

    return (
        <div className="animate-in fade-in pb-24 space-y-4">
             <div className="sticky top-0 bg-[#f0fdf4] z-10 py-4 px-1 overflow-x-auto no-scrollbar">
                <div className="flex gap-2">
                    {categories.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => setMediaCategory(cat.id as any)}
                            className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-colors ${mediaCategory === cat.id ? 'bg-purple-600 text-white shadow-md' : 'bg-white text-gray-600 border border-gray-100'}`}
                        >
                            {cat.label}
                        </button>
                    ))}
                </div>
             </div>

             <div className="grid gap-4">
                 {filteredMedia.map(media => {
                     const isDownloaded = downloadedItems.has(media.id);
                     const isProcessing = processingDownload === media.id;
                     return (
                         <div key={media.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                             <div className="aspect-video relative bg-black">
                                    <iframe 
                                        src={media.url} 
                                        className="w-full h-full absolute inset-0"
                                        title={media.title}
                                        frameBorder="0"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                    ></iframe>
                            </div>
                            <div className="p-4">
                                    <h4 className="font-bold text-gray-800 truncate">{media.title}</h4>
                                    <div className="flex justify-between items-center mt-2">
                                        <div className="flex items-center gap-2">
                                            <p className="text-xs text-gray-500">{media.author}</p>
                                        </div>
                                        <button 
                                            onClick={() => toggleDownload(media.id, media, 'media')}
                                            disabled={isProcessing}
                                            className={`p-2 rounded-full transition-colors ${isDownloaded ? 'text-emerald-600 bg-emerald-50' : 'text-gray-400 hover:bg-gray-100'}`}
                                        >
                                            {isProcessing ? <Loader2 size={16} className="animate-spin" /> : (
                                                isDownloaded ? <Check size={16} /> : <Download size={16} />
                                            )}
                                        </button>
                                    </div>
                            </div>
                         </div>
                     );
                 })}
             </div>
        </div>
    );
  };

  const renderAI = () => (
      <div className="flex flex-col h-[calc(100vh-180px)] animate-in fade-in">
          <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-4 rounded-t-2xl shadow-md">
              <h2 className="font-bold flex items-center gap-2">
                  <Bot size={20} /> Al-Noor Assistant
              </h2>
              <p className="text-xs text-emerald-100 opacity-80 mt-1">Powered by AI (Demo)</p>
          </div>
          <div className="flex-1 bg-white border-x border-gray-100 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
              {messages.map(msg => (
                  <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>
                          {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                      </div>
                      <div className={`max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed ${msg.role === 'user' ? 'bg-emerald-600 text-white rounded-tr-none' : 'bg-gray-100 text-gray-800 rounded-tl-none'}`}>
                          <div className="whitespace-pre-wrap">{msg.text}</div>
                      </div>
                  </div>
              ))}
              {isTyping && (
                  <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center"><Bot size={16} /></div>
                      <div className="bg-gray-50 p-3 rounded-2xl rounded-tl-none">
                          <div className="flex gap-1">
                              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75" />
                              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150" />
                          </div>
                      </div>
                  </div>
              )}
          </div>

          <div className="bg-white p-3 border-t border-gray-100 rounded-b-2xl">
              <div className="flex gap-2">
                  <input 
                      type="text" 
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder={t.ilmhub.ai.placeholder}
                      className="flex-1 bg-gray-50 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500"
                  />
                  <button 
                    onClick={handleSendMessage}
                    disabled={!chatInput.trim() || isTyping}
                    className="bg-emerald-600 text-white p-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-emerald-700 transition-colors"
                  >
                      <Send size={20} />
                  </button>
              </div>
          </div>
      </div>
  );

  return (
    <div className="h-full">
         <div className="flex p-1 bg-gray-200/50 rounded-xl mb-4 mx-1 sticky top-0 z-20 backdrop-blur">
            {(['feed', 'library', 'media', 'ai'] as const).map(tabKey => (
                <button 
                    key={tabKey}
                    onClick={() => setActiveTab(tabKey)}
                    className={`flex-1 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all ${activeTab === tabKey ? 'bg-white text-emerald-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    {t.ilmhub.tabs[tabKey]}
                </button>
            ))}
         </div>

         {activeTab === 'feed' && renderFeed()}
         {activeTab === 'library' && renderLibrary()}
         {activeTab === 'media' && renderMedia()}
         {activeTab === 'ai' && renderAI()}
    </div>
  );
};
