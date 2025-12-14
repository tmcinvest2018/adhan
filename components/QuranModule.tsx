
import React, { useState, useEffect, useRef } from 'react';
import { Surah, Ayah, LastRead, QuranContext, TafsirEdition } from '../types';
import { fetchSurahList, fetchSurahContent, fetchAyahTafsir, fetchAvailableTafsirEditions, RECITERS, TRANSLATIONS } from '../services/quranService';
import { Search, BookOpen, Play, Pause, SkipForward, SkipBack, X, Settings as SettingsIcon, Bookmark, ChevronRight, Book } from 'lucide-react';

interface Props {
  t: any; // Translations object
  language: string; // Current app language code
  initialContext?: QuranContext | null; // For navigation from search
}

export const QuranModule: React.FC<Props> = ({ t, language, initialContext }) => {
  // --- STATE ---
  const [view, setView] = useState<'index' | 'reader'>('index');
  const [surahList, setSurahList] = useState<Surah[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Reader State
  const [currentSurah, setCurrentSurah] = useState<Surah | null>(null);
  const [ayahs, setAyahs] = useState<Ayah[]>([]);
  const [currentAyahIndex, setCurrentAyahIndex] = useState(-1); // -1 means not playing
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoadingSurah, setIsLoadingSurah] = useState(false);
  
  // Settings
  const [reciterId, setReciterId] = useState('ar.alafasy');
  const [showSettings, setShowSettings] = useState(false);
  const [activeEditionId, setActiveEditionId] = useState<string | null>(null); // For Tafsir Mode
  const [mode, setMode] = useState<'read' | 'tafsir'>('read');
  
  // Tafsir Data
  const [availableTafsirs, setAvailableTafsirs] = useState<TafsirEdition[]>([]);
  const [selectedTafsirId, setSelectedTafsirId] = useState<string>('');

  // Modal (Tafsir/Translation)
  const [selectedAyah, setSelectedAyah] = useState<Ayah | null>(null);
  const [tafsirText, setTafsirText] = useState<string>('');

  // Refs
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const ayahRefs = useRef<Record<number, HTMLDivElement | null>>({});

  // --- INITIALIZATION ---
  useEffect(() => {
    loadIndex();
    const savedReciter = localStorage.getItem('quran-reciter');
    if(savedReciter) setReciterId(savedReciter);

    // Load Tafsirs
    fetchAvailableTafsirEditions(language).then(list => {
        setAvailableTafsirs(list);
        if (list.length > 0) {
            // Default to first (already sorted by language preference in service)
            setSelectedTafsirId(list[0].id);
        }
    });
  }, [language]);

  // Handle external navigation (Deep Linking from Search/Library)
  useEffect(() => {
      if (initialContext && surahList.length > 0) {
          const surah = surahList.find(s => s.number === initialContext.surah);
          if (surah) {
              const ayahIndex = initialContext.ayah ? initialContext.ayah - 1 : 0;
              
              if (initialContext.mode === 'tafsir' && initialContext.editionId) {
                  setMode('tafsir');
                  setActiveEditionId(initialContext.editionId);
                  setSelectedTafsirId(initialContext.editionId);
              } else {
                  setMode('read');
                  setActiveEditionId(null);
              }

              openSurah(surah, ayahIndex);
          }
      }
  }, [initialContext, surahList]);

  // --- LOADERS ---
  const loadIndex = async () => {
    setLoading(true);
    const list = await fetchSurahList();
    setSurahList(list);
    setLoading(false);
  };

  const openSurah = async (surah: Surah, startAyahIndex: number = 0) => {
    setIsLoadingSurah(true);
    setCurrentSurah(surah);
    setView('reader');
    
    // Determine translation based on app language
    let transId = 'en.sahih';
    if(language === 'nl') transId = 'nl.siregar';
    else if(language === 'tr') transId = 'tr.diyanet';
    else if(language === 'fr') transId = 'fr.hamidullah';
    else if(language === 'id') transId = 'id.indonesian';
    else if(language === 'ur') transId = 'ur.jalandhry';
    else if(language === 'ru') transId = 'ru.kuliev';

    const data = await fetchSurahContent(surah.number, reciterId, transId);
    setAyahs(data);
    setIsLoadingSurah(false);

    // Scroll to startAyah if needed
    if(startAyahIndex > 0) {
        setTimeout(() => {
            const el = ayahRefs.current[startAyahIndex];
            if(el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            setCurrentAyahIndex(startAyahIndex);
            setTimeout(() => setCurrentAyahIndex(-1), 2000); 
        }, 800);
    }
  };

  // --- AUDIO LOGIC ---
  useEffect(() => {
    if(currentAyahIndex !== -1 && ayahs[currentAyahIndex] && audioRef.current) {
        audioRef.current.src = ayahs[currentAyahIndex].audio;
        if(isPlaying) {
            audioRef.current.play().catch(e => console.error("Play error", e));
        }
    }
  }, [currentAyahIndex, currentSurah]);

  useEffect(() => {
      if(audioRef.current) {
          if(isPlaying) audioRef.current.play().catch(() => {});
          else audioRef.current.pause();
      }
  }, [isPlaying]);

  const onAudioEnded = () => {
      if(currentAyahIndex < ayahs.length - 1) {
          setCurrentAyahIndex(prev => prev + 1);
      } else {
          setIsPlaying(false);
          setCurrentAyahIndex(0);
      }
  };

  const playAyah = (index: number) => {
      setCurrentAyahIndex(index);
      setIsPlaying(true);
  };

  // --- TAFSIR LOGIC ---
  const handleAyahClick = async (ayah: Ayah) => {
      setSelectedAyah(ayah);
      
      // Use selected ID from dropdown state, or fallback
      let edition = selectedTafsirId;
      if (!edition && availableTafsirs.length > 0) {
          edition = availableTafsirs[0].id;
          setSelectedTafsirId(edition);
      }
      
      fetchTafsirContent(ayah, edition);
  };

  const fetchTafsirContent = async (ayah: Ayah, editionId: string) => {
      setTafsirText('Loading...');
      const text = await fetchAyahTafsir(currentSurah!.number, ayah.numberInSurah, editionId);
      setTafsirText(text);
  };

  // --- RENDER HELPERS ---
  const renderIndex = () => {
      const filtered = surahList.filter(s => 
          s.englishName.toLowerCase().includes(searchQuery.toLowerCase()) || 
          s.name.includes(searchQuery) ||
          String(s.number).includes(searchQuery)
      );

      const lastReadJson = localStorage.getItem('last-read');
      const lastRead: LastRead | null = lastReadJson ? JSON.parse(lastReadJson) : null;

      return (
          <div className="pb-24 animate-in fade-in">
              <div className="sticky top-0 bg-[#f0fdf4] z-10 py-4 px-1">
                  <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                      <input 
                        type="text" 
                        placeholder={t.quran.search}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white pl-10 pr-4 py-3 rounded-xl border-none shadow-sm focus:ring-2 focus:ring-emerald-500"
                      />
                  </div>
              </div>

              {lastRead && !searchQuery && (
                  <div 
                    onClick={() => {
                        const s = surahList.find(x => x.number === lastRead.surahNumber);
                        if(s) { setMode('read'); openSurah(s, lastRead.ayahNumber - 1); }
                    }}
                    className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-4 rounded-xl mb-6 shadow-lg shadow-emerald-200 cursor-pointer active:scale-[0.98] transition-transform"
                  >
                      <div className="flex items-center gap-3 mb-2">
                          <BookOpen size={20} className="text-emerald-100" />
                          <span className="text-xs font-bold uppercase tracking-wider text-emerald-100">{t.quran.lastRead}</span>
                      </div>
                      <div className="flex justify-between items-end">
                          <div>
                              <h3 className="text-xl font-bold">{lastRead.surahName}</h3>
                              <p className="text-emerald-100 text-sm">{t.quran.ayah} {lastRead.ayahNumber}</p>
                          </div>
                          <div className="bg-white/20 p-2 rounded-full">
                              <ChevronRight size={20} />
                          </div>
                      </div>
                  </div>
              )}

              <div className="space-y-2">
                  {loading ? (
                      <div className="text-center py-10 text-gray-500">{t.quran.loading}</div>
                  ) : (
                      filtered.map(surah => (
                          <div 
                            key={surah.number}
                            onClick={() => { setMode('read'); openSurah(surah); }}
                            className="bg-white p-4 rounded-xl flex items-center gap-4 shadow-sm border border-gray-100 hover:border-emerald-200 transition-colors cursor-pointer"
                          >
                              <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-700 font-bold font-mono">
                                  {surah.number}
                              </div>
                              <div className="flex-1">
                                  <h3 className="font-bold text-gray-800">{surah.englishName}</h3>
                                  <p className="text-xs text-gray-500">{surah.englishNameTranslation} • {surah.numberOfAyahs} {t.quran.ayah}</p>
                              </div>
                              <div className="text-xl font-arabic text-emerald-800">{surah.name}</div>
                          </div>
                      ))
                  )}
              </div>
          </div>
      );
  };

  const renderReader = () => {
      if(!currentSurah) return null;

      return (
          <div className="flex flex-col h-[calc(100vh-140px)]">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                  <button onClick={() => { setView('index'); setIsPlaying(false); }} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200">
                      <X size={20} />
                  </button>
                  <div className="text-center">
                      <h2 className="font-bold text-lg">{currentSurah.englishName} {mode === 'tafsir' ? '(Tafsir)' : ''}</h2>
                      <p className="text-xs text-gray-500">{currentSurah.englishNameTranslation}</p>
                  </div>
                  <button onClick={() => setShowSettings(!showSettings)} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200">
                      <SettingsIcon size={20} />
                  </button>
              </div>

              {/* Settings Dropdown */}
              {showSettings && (
                  <div className="bg-white p-4 rounded-xl shadow-xl border border-gray-100 mb-4 animate-in slide-in-from-top-5">
                      <label className="block text-sm font-semibold mb-2">{t.quran.reciter}</label>
                      <select 
                        value={reciterId} 
                        onChange={(e) => {
                            setReciterId(e.target.value);
                            localStorage.setItem('quran-reciter', e.target.value);
                            openSurah(currentSurah, currentAyahIndex > 0 ? currentAyahIndex : 0);
                        }}
                        className="w-full p-2 bg-gray-50 rounded-lg border-none"
                      >
                          {RECITERS.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                      </select>
                  </div>
              )}

              {/* Content */}
              <div className="flex-1 overflow-y-auto no-scrollbar pr-1 pb-32">
                  {isLoadingSurah ? (
                      <div className="flex items-center justify-center h-64">
                          <p className="text-emerald-600 font-medium animate-pulse">{t.quran.loading}</p>
                      </div>
                  ) : (
                      <div className="space-y-6">
                           {/* Bismillah */}
                           {currentSurah.number !== 1 && currentSurah.number !== 9 && (
                               <div className="text-center text-2xl font-arabic py-4 text-emerald-800 opacity-80">
                                   بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
                               </div>
                           )}

                           {ayahs.map((ayah, index) => (
                               <div 
                                    key={ayah.number} 
                                    ref={(el) => ayahRefs.current[index] = el}
                                    onClick={() => handleAyahClick(ayah)}
                                    className={`p-4 rounded-2xl transition-all duration-500 ${currentAyahIndex === index ? 'bg-emerald-50 border-emerald-200 shadow-md' : 'bg-white border-transparent'}`}
                               >
                                   <div className="flex justify-between items-start mb-4">
                                       <span className="w-8 h-8 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center text-xs font-mono">
                                           {ayah.numberInSurah}
                                       </span>
                                       <button onClick={(e) => { e.stopPropagation(); playAyah(index); }}>
                                           {currentAyahIndex === index && isPlaying ? <Pause size={18} className="text-emerald-600" /> : <Play size={18} className="text-gray-400 hover:text-emerald-600" />}
                                       </button>
                                   </div>
                                   
                                   <p className="text-right font-arabic text-2xl leading-[2.5] text-gray-800 mb-4" dir="rtl">
                                       {ayah.text}
                                   </p>
                                   
                                   <p className="text-sm text-gray-600 leading-relaxed">
                                       {ayah.translation}
                                   </p>

                                   <div className="mt-2 flex items-center gap-1 text-xs text-emerald-600 font-medium opacity-80">
                                       <Book size={14} />
                                       Tap for Tafsir
                                   </div>
                               </div>
                           ))}
                      </div>
                  )}
              </div>

              {/* Player Controls */}
              <div className="fixed bottom-20 left-6 right-6 z-20">
                  <div className="bg-gray-900/90 backdrop-blur-md text-white p-4 rounded-2xl shadow-2xl flex items-center justify-between">
                      <div className="text-xs">
                          <div className="font-bold opacity-90">{currentSurah.englishName}</div>
                          <div className="opacity-60">{t.quran.ayah} {currentAyahIndex > -1 ? ayahs[currentAyahIndex]?.numberInSurah : '-'}</div>
                      </div>
                      <div className="flex items-center gap-4">
                          <button onClick={() => setCurrentAyahIndex(Math.max(0, currentAyahIndex - 1))} className="opacity-70 hover:opacity-100"><SkipBack size={20} /></button>
                          <button 
                            onClick={() => setIsPlaying(!isPlaying)}
                            className="w-10 h-10 bg-white text-gray-900 rounded-full flex items-center justify-center hover:scale-105 transition-transform"
                          >
                              {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-0.5" />}
                          </button>
                          <button onClick={() => setCurrentAyahIndex(Math.min(ayahs.length-1, currentAyahIndex + 1))} className="opacity-70 hover:opacity-100"><SkipForward size={20} /></button>
                      </div>
                  </div>
              </div>
          </div>
      );
  };

  return (
    <div className="animate-in fade-in">
        <audio ref={audioRef} onEnded={onAudioEnded} className="hidden" />
        
        {view === 'index' ? renderIndex() : renderReader()}

        {/* Tafsir Modal */}
        {selectedAyah && (
            <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
                <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom-10 max-h-[85vh] flex flex-col">
                    <div className="flex justify-between items-center mb-4 border-b pb-2">
                        <h3 className="font-bold text-lg">{t.quran.ayah} {selectedAyah.numberInSurah}</h3>
                        <button onClick={() => setSelectedAyah(null)}><X size={20} /></button>
                    </div>
                    
                    <div className="mb-4">
                        <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">Tafsir Source</label>
                        <select 
                            value={selectedTafsirId}
                            onChange={(e) => {
                                setSelectedTafsirId(e.target.value);
                                fetchTafsirContent(selectedAyah, e.target.value);
                            }}
                            className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                        >
                            {availableTafsirs.map(t => (
                                <option key={t.id} value={t.id}>{t.name} ({t.language.toUpperCase()})</option>
                            ))}
                            {availableTafsirs.length === 0 && <option>Loading sources...</option>}
                        </select>
                    </div>

                    <div className="overflow-y-auto flex-1">
                        <p className="font-arabic text-xl text-right mb-4 text-emerald-800" dir="rtl">{selectedAyah.text}</p>
                        <p className="italic text-gray-600 mb-6 border-l-4 border-emerald-200 pl-3">{selectedAyah.translation}</p>
                        
                        <h4 className="font-bold text-sm uppercase tracking-wide text-gray-500 mb-2">{t.quran.tafsir}</h4>
                        <div className="text-sm text-gray-800 leading-relaxed whitespace-pre-line">
                            {tafsirText === 'Loading...' ? (
                                <div className="flex items-center gap-2 text-emerald-600 animate-pulse">
                                    <span>Loading Tafsir...</span>
                                </div>
                            ) : (
                                tafsirText
                            )}
                        </div>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};
