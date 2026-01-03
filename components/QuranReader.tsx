import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Surah, Ayah, AppSettings } from '../types';
import { Play, Pause, Share2, BookOpen, X, Info, SkipBack, SkipForward, Volume2, ChevronsLeft, ChevronsRight, Music, AlertCircle } from 'lucide-react';
import { StudyModal } from './StudyModal';

interface Props {
  surah: Surah;
  ayahs: Ayah[];
  t: any;
  onBack: () => void;
  settings: AppSettings;
  onNextSurah?: () => void;
  onPrevSurah?: () => void;
}

export const QuranReader: React.FC<Props> = ({ surah, ayahs, t, onBack, settings, onNextSurah, onPrevSurah }) => {
  // State
  const [playingIndex, setPlayingIndex] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // Study Modal State
  const [studyAyah, setStudyAyah] = useState<Ayah | null>(null);

  // Refs
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const ayahRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const pressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // --- AUDIO LOGIC ---

  useEffect(() => {
    // Initialize Audio
    if (!audioRef.current) {
        audioRef.current = new Audio();
        
        audioRef.current.onended = () => {
            setPlayingIndex(prev => {
                if (prev === null) return null;
                // Auto Advance within Surah
                if (prev < ayahs.length - 1) {
                    return prev + 1; 
                } else {
                    setIsPlaying(false);
                    return null;
                }
            });
        };
        
        audioRef.current.onerror = () => {
            const err = audioRef.current?.error;
            let msg = t.errors?.fetchQuran || "Audio Fout";
            
            if (err?.code === 1) msg = "Laden geannuleerd";
            else if (err?.code === 2) msg = "Netwerkfout";
            else if (err?.code === 3) msg = "Decoderingsfout";
            else if (err?.code === 4) msg = "Bron niet ondersteund";
            
            console.error("Quran Audio Error Details:", {
                code: err?.code,
                message: err?.message,
                src: audioRef.current?.src
            });

            setErrorMsg(msg);
            setIsPlaying(false);
        };

        audioRef.current.onplay = () => setErrorMsg(null);
    }

    return () => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.src = "";
        }
    };
  }, [ayahs, t]);

  // Handle Playback Change
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (playingIndex !== null && ayahs[playingIndex]) {
        const url = ayahs[playingIndex].audio;
        setHighlightedIndex(playingIndex);
        
        // Scroll to Ayah
        const el = ayahRefs.current[playingIndex];
        if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }

        if (audio.src !== url) {
            setErrorMsg(null);
            
            if (!url || url.trim() === '') {
                setErrorMsg("Geen audio beschikbaar");
                setIsPlaying(false);
                return;
            }

            audio.src = url;
            audio.load();
            if (isPlaying) {
                audio.play().catch(e => {
                    console.warn("Autoplay blocked or interrupted:", e);
                    setIsPlaying(false);
                });
            }
        } else if (isPlaying) {
             audio.play().catch(() => setIsPlaying(false));
        } else {
            audio.pause();
        }
    } else {
        audio.pause();
        setHighlightedIndex(null);
    }
  }, [playingIndex, isPlaying, ayahs]);

  const togglePlay = (index: number) => {
      if (playingIndex === index) {
          setIsPlaying(!isPlaying);
      } else {
          setPlayingIndex(index);
          setIsPlaying(true);
      }
  };

  const handleNextAyah = () => {
      if (playingIndex !== null && playingIndex < ayahs.length - 1) {
          setPlayingIndex(playingIndex + 1);
      } else if (onNextSurah) {
          onNextSurah();
      }
  };

  const handlePrevAyah = () => {
      if (playingIndex !== null && playingIndex > 0) {
          setPlayingIndex(playingIndex - 1);
      } else if (onPrevSurah) {
          onPrevSurah();
      }
  };

  // --- TEXT RENDERING LOGIC ---

  const renderArabicText = useCallback((text: string) => {
      const fontFamily = settings.quranVisuals.fontStyle === 'indopak' 
          ? "'Scheherazade New', serif" 
          : "'Amiri', serif";

      if (!settings.quranVisuals.showTajweed) {
          return <span style={{ fontFamily }}>{text}</span>;
      }

      let processed = text;
      processed = processed.replace(/(ٱللَّه|اللَّه)/g, '<span class="tj-allah">$1</span>');
      processed = processed.replace(/([ن|م]ّ)/g, '<span class="tj-ghunnah">$1</span>');
      processed = processed.replace(/([ق|ط|ب|ج|د][ْ|ۡ])/g, '<span class="tj-qalqalah">$1</span>');

      return (
          <span 
            style={{ fontFamily }}
            dangerouslySetInnerHTML={{ __html: processed }} 
          />
      );
  }, [settings.quranVisuals]);

  // --- INTERACTION LOGIC ---

  const handlePressStart = (ayah: Ayah) => {
      pressTimer.current = setTimeout(() => {
          setStudyAyah(ayah);
      }, 600);
  };

  const handlePressEnd = () => {
      if (pressTimer.current) clearTimeout(pressTimer.current);
  };

  return (
    <div className="flex flex-col h-full bg-white animate-in fade-in relative overflow-hidden">
        {/* Sticky Header */}
        <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-gray-100 px-4 py-3 flex items-center justify-between shadow-sm">
            <button onClick={onBack} className="p-2 -ml-2 hover:bg-emerald-50 text-gray-600 rounded-full transition-colors">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>
            </button>
            <div className="text-center flex-1">
                <h1 className="font-bold text-gray-800 leading-tight">{surah.englishName}</h1>
                <p className="text-[10px] uppercase font-bold text-emerald-600 tracking-wider">
                    {surah.revelationType} • {surah.numberOfAyahs} {t.quran.ayah}s
                </p>
            </div>
            <button 
                onClick={() => alert(t.quran.changeReciterHint)}
                className="p-2 -mr-2 text-gray-400 hover:text-emerald-600 transition-colors"
            >
                <Info size={20} />
            </button>
        </div>

        {/* List Content */}
        <div className="flex-1 overflow-y-auto pb-64 no-scrollbar bg-gray-50/30">
            
            {/* Bismillah */}
            {surah.number !== 1 && surah.number !== 9 && (
                 <div className="text-center py-12 px-6">
                     <span 
                        className="text-4xl text-emerald-900 drop-shadow-sm"
                        style={{ fontFamily: settings.quranVisuals.fontStyle === 'indopak' ? "'Scheherazade New', serif" : "'Amiri', serif" }}
                     >
                        بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
                     </span>
                 </div>
            )}

            {ayahs.map((ayah, index) => (
                <div 
                    key={ayah.number}
                    // Fix: Ensure ref callback returns void to avoid TS error
                    ref={(el) => { ayahRefs.current[index] = el; }}
                    className={`py-8 px-6 border-b border-gray-100 transition-all duration-500 relative group ${highlightedIndex === index ? 'bg-emerald-50/40' : 'bg-white'}`}
                >
                    {highlightedIndex === index && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500 animate-in fade-in" />
                    )}

                    <div className="flex justify-between items-center mb-6">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-mono font-bold transition-colors ${highlightedIndex === index ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
                            {ayah.numberInSurah}
                        </div>
                        <div className="flex gap-1">
                            <button 
                                onClick={() => togglePlay(index)} 
                                className={`p-2 rounded-full transition-all ${playingIndex === index ? 'bg-emerald-100 text-emerald-600' : 'text-gray-400 hover:text-emerald-600 hover:bg-emerald-50'}`}
                            >
                                {playingIndex === index && isPlaying ? <Volume2 size={18} className="animate-pulse" /> : <Play size={18} />}
                            </button>
                            <button onClick={() => setStudyAyah(ayah)} className="p-2 text-gray-400 hover:text-emerald-600 rounded-full hover:bg-emerald-50 transition-colors">
                                <BookOpen size={18} />
                            </button>
                            <button className="p-2 text-gray-400 hover:text-emerald-600 rounded-full hover:bg-emerald-50 transition-colors">
                                <Share2 size={18} />
                            </button>
                        </div>
                    </div>

                    <div 
                        className="text-right mb-8 cursor-pointer select-none"
                        onTouchStart={() => handlePressStart(ayah)}
                        onTouchEnd={handlePressEnd}
                        onMouseDown={() => handlePressStart(ayah)}
                        onMouseUp={handlePressEnd}
                        onMouseLeave={handlePressEnd}
                        onClick={() => togglePlay(index)}
                    >
                        <p 
                            className={`leading-[2.5] tracking-wide transition-colors duration-500 ${highlightedIndex === index ? 'text-emerald-950 font-medium' : 'text-gray-800'}`} 
                            style={{
                                fontSize: `${settings.quranVisuals?.fontSize || 28}px`,
                                direction: 'rtl'
                            }}
                        >
                            {renderArabicText(ayah.text)}
                        </p>
                    </div>

                    <div className="text-left max-w-2xl">
                        <p className={`text-lg leading-relaxed font-serif transition-colors duration-500 ${highlightedIndex === index ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                            {ayah.translation}
                        </p>
                    </div>
                </div>
            ))}
        </div>

        {/* --- PREMIUM FLOATING AUDIO PLAYER BAR --- */}
        {playingIndex !== null && (
            <div className="absolute bottom-4 left-4 right-4 z-40 animate-in slide-in-from-bottom-20 duration-700 ease-out">
                <div className="bg-gradient-to-br from-emerald-900/95 to-teal-950/95 backdrop-blur-2xl text-white p-5 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.4)] border border-white/10 flex flex-col gap-4 overflow-hidden relative">
                    
                    {/* Background Glow */}
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl" />
                    
                    {/* Top Row: Info */}
                    <div className="flex justify-between items-start px-2 relative z-10">
                        <div className="flex gap-3 items-center">
                            <div className="w-10 h-10 bg-emerald-500/20 rounded-2xl flex items-center justify-center text-emerald-300 shadow-inner">
                                {errorMsg ? <AlertCircle size={20} className="text-red-400" /> : <Music size={20} />}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className={`text-[9px] font-black uppercase tracking-[0.2em] mb-0.5 opacity-80 ${errorMsg ? 'text-red-400' : 'text-emerald-400'}`}>
                                    {errorMsg ? errorMsg : `RECITATIE • Vers ${ayahs[playingIndex].numberInSurah}`}
                                </div>
                                <div className="font-bold text-base truncate leading-tight">
                                    Soera {surah.englishName}
                                </div>
                            </div>
                        </div>
                        <button 
                            onClick={() => { setPlayingIndex(null); setIsPlaying(false); }} 
                            className="p-2 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white rounded-full transition-all"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    {/* Controls Row */}
                    <div className="flex items-center justify-between gap-2 px-1 relative z-10">
                        <button 
                            onClick={onPrevSurah}
                            disabled={surah.number === 1}
                            className={`p-3 rounded-2xl transition-all ${surah.number === 1 ? 'opacity-10 cursor-not-allowed' : 'bg-white/5 hover:bg-white/10 active:scale-90 text-emerald-100'}`}
                            title="Vorige Soera"
                        >
                            <ChevronsLeft size={20} />
                        </button>

                        <div className="flex items-center gap-5">
                            <button 
                                onClick={handlePrevAyah}
                                className="p-2 text-white/70 hover:text-white transition-all active:scale-90"
                            >
                                <SkipBack size={24} fill="currentColor" />
                            </button>

                            <button 
                                onClick={() => setIsPlaying(!isPlaying)}
                                className="w-16 h-16 bg-emerald-500 text-white rounded-[2rem] flex items-center justify-center shadow-[0_10px_30px_rgba(16,185,129,0.4)] hover:scale-105 active:scale-95 transition-all ring-4 ring-white/5"
                            >
                                {isPlaying ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-1" />}
                            </button>

                            <button 
                                onClick={handleNextAyah}
                                className="p-2 text-white/70 hover:text-white transition-all active:scale-90"
                            >
                                <SkipForward size={24} fill="currentColor" />
                            </button>
                        </div>

                        <button 
                            onClick={onNextSurah}
                            disabled={surah.number === 114}
                            className={`p-3 rounded-2xl transition-all ${surah.number === 114 ? 'opacity-10 cursor-not-allowed' : 'bg-white/5 hover:bg-white/10 active:scale-90 text-emerald-100'}`}
                            title="Volgende Soera"
                        >
                            <ChevronsRight size={20} />
                        </button>
                    </div>

                    {/* Progress Track */}
                    <div className="px-2 relative z-10">
                        <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-gradient-to-r from-emerald-400 to-teal-400 transition-all duration-700 ease-out shadow-[0_0_10px_rgba(52,211,153,0.5)]"
                                style={{ width: `${((playingIndex + 1) / ayahs.length) * 100}%` }}
                            />
                        </div>
                        <div className="flex justify-between mt-2">
                             <span className="text-[10px] font-mono text-white/30 font-bold uppercase">Ayah {playingIndex + 1}</span>
                             <span className="text-[10px] font-mono text-white/30 font-bold uppercase">{ayahs.length} TOTAAL</span>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* Study Modal */}
        {studyAyah && (
            <StudyModal 
                ayah={studyAyah} 
                surah={surah} 
                onClose={() => setStudyAyah(null)}
                t={t}
            />
        )}

    </div>
  );
};