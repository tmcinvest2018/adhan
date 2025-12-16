
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Surah, Ayah } from '../types';
import { Play, Pause, MoreHorizontal, Share2, Bookmark, BookOpen, X, Info } from 'lucide-react';
import { StudyModal } from './StudyModal';

interface Props {
  surah: Surah;
  ayahs: Ayah[];
  t: any;
  onBack: () => void;
  reciterId: string;
}

export const QuranReader: React.FC<Props> = ({ surah, ayahs, t, onBack, reciterId }) => {
  // State
  const [playingIndex, setPlayingIndex] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState<number | null>(null);
  
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
                // Auto Advance
                if (prev < ayahs.length - 1) {
                    return prev + 1; 
                } else {
                    setIsPlaying(false);
                    return null;
                }
            });
        };
        
        audioRef.current.onerror = (e) => {
            console.error("Audio Error", e);
            setIsPlaying(false);
        };
    }
  }, [ayahs]);

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
            audio.src = url;
            audio.load();
            audio.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
        } else if (!isPlaying) {
             audio.play();
             setIsPlaying(true);
        }
    } else {
        audio.pause();
        setIsPlaying(false);
        setHighlightedIndex(null);
    }
  }, [playingIndex, ayahs]);

  // Pause toggle
  useEffect(() => {
      if (audioRef.current) {
          if (isPlaying && audioRef.current.paused) audioRef.current.play();
          if (!isPlaying && !audioRef.current.paused) audioRef.current.pause();
      }
  }, [isPlaying]);

  const togglePlay = (index: number) => {
      if (playingIndex === index) {
          setIsPlaying(!isPlaying);
      } else {
          setPlayingIndex(index);
          setIsPlaying(true);
      }
  };

  // --- INTERACTION LOGIC ---

  const handlePressStart = (ayah: Ayah) => {
      pressTimer.current = setTimeout(() => {
          setStudyAyah(ayah);
      }, 600); // 600ms long press
  };

  const handlePressEnd = () => {
      if (pressTimer.current) {
          clearTimeout(pressTimer.current);
      }
  };

  return (
    <div className="flex flex-col h-full bg-white animate-in fade-in relative">
        {/* Sticky Header */}
        <div className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-gray-100 px-4 py-3 flex items-center justify-between shadow-sm">
            <button onClick={onBack} className="p-2 -ml-2 hover:bg-gray-100 rounded-full">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>
            </button>
            <div className="text-center">
                <h1 className="font-bold text-gray-800">{surah.englishName}</h1>
                <p className="text-xs text-gray-500">{surah.englishNameTranslation} • {surah.numberOfAyahs} Ayahs</p>
            </div>
            <div className="w-10"></div> {/* Spacer */}
        </div>

        {/* List Content */}
        <div className="flex-1 overflow-y-auto pb-32 no-scrollbar">
            
            {/* Bismillah */}
            {surah.number !== 1 && surah.number !== 9 && (
                 <div className="text-center py-8">
                     <span className="font-arabic text-3xl text-emerald-800">بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ</span>
                 </div>
            )}

            {ayahs.map((ayah, index) => (
                <div 
                    key={ayah.number}
                    ref={(el) => ayahRefs.current[index] = el}
                    className={`py-6 px-4 border-b border-gray-50 transition-colors duration-500 ${highlightedIndex === index ? 'bg-emerald-50/60' : 'bg-white'}`}
                >
                    {/* Action Bar (Top of Ayah) */}
                    <div className="flex justify-between items-center mb-4">
                        <div className="bg-gray-100 text-gray-500 w-8 h-8 rounded-full flex items-center justify-center text-xs font-mono font-bold">
                            {ayah.numberInSurah}
                        </div>
                        <div className="flex gap-1">
                            <button onClick={() => togglePlay(index)} className="p-2 text-gray-400 hover:text-emerald-600 rounded-full hover:bg-emerald-50">
                                {playingIndex === index && isPlaying ? <Pause size={18} /> : <Play size={18} />}
                            </button>
                            <button onClick={() => setStudyAyah(ayah)} className="p-2 text-gray-400 hover:text-emerald-600 rounded-full hover:bg-emerald-50">
                                <BookOpen size={18} />
                            </button>
                            <button className="p-2 text-gray-400 hover:text-emerald-600 rounded-full hover:bg-emerald-50">
                                <Share2 size={18} />
                            </button>
                        </div>
                    </div>

                    {/* Arabic Text (Interactive) */}
                    <div 
                        className="text-right mb-6 cursor-pointer select-none"
                        onTouchStart={() => handlePressStart(ayah)}
                        onTouchEnd={handlePressEnd}
                        onMouseDown={() => handlePressStart(ayah)}
                        onMouseUp={handlePressEnd}
                        onMouseLeave={handlePressEnd}
                    >
                        <p className={`font-arabic text-3xl leading-[2.5] ${highlightedIndex === index ? 'text-emerald-900' : 'text-gray-800'}`} dir="rtl">
                            {ayah.text}
                        </p>
                    </div>

                    {/* Translation */}
                    <div className="text-left">
                        <p className="text-gray-600 text-lg leading-relaxed font-serif">
                            {ayah.translation}
                        </p>
                    </div>
                </div>
            ))}
        </div>

        {/* Global Player Bar (Bottom) */}
        {playingIndex !== null && (
            <div className="absolute bottom-6 left-4 right-4 bg-gray-900 text-white p-4 rounded-2xl shadow-2xl flex items-center justify-between z-30 animate-in slide-in-from-bottom-5">
                <div>
                     <div className="text-xs text-gray-400 uppercase tracking-wide flex items-center gap-1">
                        Now Playing
                        <button onClick={() => alert(t.quran.changeReciterHint)} className="hover:text-emerald-400">
                            <Info size={10} />
                        </button>
                     </div>
                     <div className="font-bold text-sm">Ayah {ayahs[playingIndex].numberInSurah}</div>
                </div>
                <div className="flex gap-4 items-center">
                    <button onClick={() => togglePlay(playingIndex)} className="w-10 h-10 bg-white text-gray-900 rounded-full flex items-center justify-center">
                        {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-0.5" />}
                    </button>
                    <button onClick={() => { setPlayingIndex(null); setIsPlaying(false); }} className="text-gray-400 hover:text-white">
                        <X size={20} />
                    </button>
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
