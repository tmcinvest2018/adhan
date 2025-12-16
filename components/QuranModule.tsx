
import React, { useState, useEffect } from 'react';
import { Surah, Ayah, LastRead, QuranContext } from '../types';
import { fetchSurahList, fetchSurahContent } from '../services/quranService';
import { QuranReader } from './QuranReader';
import { Search, BookOpen, ChevronRight } from 'lucide-react';

interface Props {
  t: any; 
  language: string; 
  reciterId: string;
  initialContext?: QuranContext | null; 
}

export const QuranModule: React.FC<Props> = ({ t, language, reciterId, initialContext }) => {
  // --- STATE ---
  const [view, setView] = useState<'index' | 'reader'>('index');
  const [surahList, setSurahList] = useState<Surah[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Reader State
  const [currentSurah, setCurrentSurah] = useState<Surah | null>(null);
  const [ayahs, setAyahs] = useState<Ayah[]>([]);
  const [isLoadingSurah, setIsLoadingSurah] = useState(false);
  
  // --- INITIALIZATION ---
  useEffect(() => {
    loadIndex();
  }, [language]);

  // Handle external navigation (Deep Linking from Search/Library)
  useEffect(() => {
      if (initialContext && surahList.length > 0) {
          const surah = surahList.find(s => s.number === initialContext.surah);
          if (surah) {
              const ayahIndex = initialContext.ayah ? initialContext.ayah - 1 : 0;
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
    
    // Save Last Read
    const lastRead: LastRead = {
        surahNumber: surah.number,
        surahName: surah.englishName,
        ayahNumber: 1,
        timestamp: Date.now()
    };
    localStorage.setItem('last-read', JSON.stringify(lastRead));
  };

  // --- RENDER INDEX ---
  const renderIndex = () => {
      const filtered = surahList.filter(s => 
          s.englishName.toLowerCase().includes(searchQuery.toLowerCase()) || 
          s.name.includes(searchQuery) ||
          String(s.number).includes(searchQuery)
      );

      const lastReadJson = localStorage.getItem('last-read');
      const lastRead: LastRead | null = lastReadJson ? JSON.parse(lastReadJson) : null;

      return (
          <div className="pb-24 animate-in fade-in h-full flex flex-col">
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

              <div className="flex-1 overflow-y-auto no-scrollbar">
                  {lastRead && !searchQuery && (
                      <div 
                        onClick={() => {
                            const s = surahList.find(x => x.number === lastRead.surahNumber);
                            if(s) openSurah(s, lastRead.ayahNumber - 1);
                        }}
                        className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-4 rounded-xl mb-6 shadow-lg shadow-emerald-200 cursor-pointer active:scale-[0.98] transition-transform mx-1 mt-1"
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

                  <div className="space-y-2 px-1">
                      {loading ? (
                          <div className="text-center py-10 text-gray-500">{t.quran.loading}</div>
                      ) : (
                          filtered.map(surah => (
                              <div 
                                key={surah.number}
                                onClick={() => openSurah(surah)}
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
          </div>
      );
  };

  if (view === 'reader' && currentSurah) {
      if (isLoadingSurah) {
          return (
              <div className="flex flex-col items-center justify-center h-full">
                   <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mb-4"></div>
                   <p className="text-emerald-800 font-medium">{t.quran.loading}</p>
              </div>
          );
      }
      return (
          <QuranReader 
            surah={currentSurah}
            ayahs={ayahs}
            t={t}
            onBack={() => setView('index')}
            reciterId={reciterId}
          />
      );
  }

  return renderIndex();
};
