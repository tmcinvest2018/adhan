
import React, { useEffect, useState } from 'react';
import { Play, Pause, SkipBack, SkipForward, X, FastForward, Rewind, MoreHorizontal } from 'lucide-react';

interface Props {
  title: string;
  subtitle: string;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  onPlayPause: () => void;
  onClose: () => void;
  onSeek: (time: number) => void;
  onSkipForward: () => void;
  onSkipBack: () => void;
  onNext?: () => void;
  onPrev?: () => void;
  hasNext: boolean;
  hasPrev: boolean;
}

const formatTime = (seconds: number) => {
  if (!seconds || isNaN(seconds)) return "00:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
};

export const AudioPlayer: React.FC<Props> = ({
  title,
  subtitle,
  isPlaying,
  currentTime,
  duration,
  onPlayPause,
  onClose,
  onSeek,
  onSkipForward,
  onSkipBack,
  onNext,
  onPrev,
  hasNext,
  hasPrev
}) => {
  // Local state for dragging the slider (to prevent stuttering)
  const [isDragging, setIsDragging] = useState(false);
  const [localTime, setLocalTime] = useState(currentTime);

  useEffect(() => {
    if (!isDragging) {
      setLocalTime(currentTime);
    }
  }, [currentTime, isDragging]);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalTime(Number(e.target.value));
  };

  const handleSliderUp = () => {
    setIsDragging(false);
    onSeek(localTime);
  };

  const progressPercent = duration ? (localTime / duration) * 100 : 0;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 animate-in slide-in-from-bottom-5 duration-300">
      <div className="bg-white/95 backdrop-blur-xl border-t border-gray-200 shadow-[0_-8px_30px_rgba(0,0,0,0.12)] pb-safe-area-bottom">
        
        {/* Progress Bar (Full Width Top) */}
        <div className="relative w-full h-1.5 bg-gray-200 cursor-pointer group">
           <div 
             className="absolute top-0 left-0 h-full bg-emerald-500 rounded-r-full transition-all duration-100 ease-linear"
             style={{ width: `${progressPercent}%` }}
           />
           <input
              type="range"
              min="0"
              max={duration || 0}
              value={localTime}
              onChange={handleSliderChange}
              onMouseDown={() => setIsDragging(true)}
              onTouchStart={() => setIsDragging(true)}
              onMouseUp={handleSliderUp}
              onTouchEnd={handleSliderUp}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
           />
        </div>

        <div className="max-w-lg mx-auto p-4">
            {/* Header: Title & Close */}
            <div className="flex justify-between items-start mb-4">
                <div className="flex-1 mr-4 overflow-hidden">
                    <h3 className="font-bold text-gray-900 truncate text-base">{title}</h3>
                    <p className="text-xs text-gray-500 truncate">{subtitle}</p>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-[10px] font-mono font-medium text-gray-400 bg-gray-100 px-2 py-1 rounded-md">
                        {formatTime(localTime)} / {formatTime(duration)}
                    </span>
                    <button onClick={onClose} className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded-full hover:bg-gray-100">
                        <X size={20} />
                    </button>
                </div>
            </div>

            {/* Controls Row */}
            <div className="flex items-center justify-between gap-2 sm:gap-6 px-2">
                
                {/* Previous Group */}
                <div className="flex items-center gap-1 sm:gap-3">
                     <button 
                        onClick={onPrev} 
                        disabled={!hasPrev}
                        className={`p-2 rounded-full transition-colors ${hasPrev ? 'text-gray-600 hover:bg-gray-100 hover:text-emerald-700' : 'text-gray-300'}`}
                     >
                        <SkipBack size={20} fill={hasPrev ? "currentColor" : "none"} />
                     </button>
                     <button onClick={onSkipBack} className="p-2 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-full transition-colors hidden sm:block">
                        <Rewind size={20} />
                     </button>
                </div>

                {/* Main Play Button */}
                <button 
                    onClick={onPlayPause}
                    className="w-14 h-14 bg-emerald-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-emerald-200 hover:scale-105 active:scale-95 transition-all"
                >
                    {isPlaying ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" className="ml-1" />}
                </button>

                {/* Next Group */}
                <div className="flex items-center gap-1 sm:gap-3">
                     <button onClick={onSkipForward} className="p-2 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-full transition-colors hidden sm:block">
                        <FastForward size={20} />
                     </button>
                     <button 
                        onClick={onNext} 
                        disabled={!hasNext}
                        className={`p-2 rounded-full transition-colors ${hasNext ? 'text-gray-600 hover:bg-gray-100 hover:text-emerald-700' : 'text-gray-300'}`}
                     >
                        <SkipForward size={20} fill={hasNext ? "currentColor" : "none"} />
                     </button>
                </div>

            </div>
            
            {/* Mobile Seek buttons (Only visible on small screens) */}
            <div className="flex justify-between items-center mt-4 sm:hidden px-4">
                 <button onClick={onSkipBack} className="text-xs font-medium text-gray-500 flex items-center gap-1">
                    <Rewind size={14} /> -10s
                 </button>
                 <button onClick={onSkipForward} className="text-xs font-medium text-gray-500 flex items-center gap-1">
                    +10s <FastForward size={14} />
                 </button>
            </div>

        </div>
      </div>
    </div>
  );
};
