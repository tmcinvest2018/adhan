
import React, { useState } from 'react';
import { MediaItem } from '../types';
import { Play, Mic, Video, X } from 'lucide-react';

interface Props {
  item: MediaItem;
  isPlaying?: boolean;
  onPlay?: () => void;
}

export const MediaCard: React.FC<Props> = ({ item, isPlaying = false, onPlay }) => {
  const [imgError, setImgError] = useState(false);

  const displayImage = imgError || !item.thumbnail 
    ? 'https://via.placeholder.com/320x180?text=NurPrayer+Media' 
    : item.thumbnail;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden group hover:border-emerald-200 transition-all">
      {isPlaying ? (
        <div className="relative aspect-video bg-black">
             <iframe 
                src={item.url} 
                title={item.title}
                className="w-full h-full absolute inset-0"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
                referrerPolicy="strict-origin-when-cross-origin"
             />
        </div>
      ) : (
        <div 
            className="relative aspect-video bg-gray-100 cursor-pointer overflow-hidden"
            onClick={onPlay}
        >
          <img 
            src={displayImage} 
            alt={item.title} 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            onError={() => setImgError(true)}
          />
          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors flex items-center justify-center">
            <div className="w-14 h-14 bg-white/95 rounded-full flex items-center justify-center shadow-2xl text-emerald-600 group-hover:scale-110 transition-transform ring-4 ring-white/20">
                <Play size={24} fill="currentColor" className="ml-1" />
            </div>
          </div>
          <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg">
              {item.duration || 'VIDEO'}
          </div>
        </div>
      )}
      
      <div className="p-4">
        <div className="flex items-start gap-4">
            <div className={`p-2.5 rounded-2xl shrink-0 shadow-sm ${item.type === 'audio' ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'}`}>
                {item.type === 'audio' ? <Mic size={20} /> : <Video size={20} />}
            </div>
            <div className="flex-1 min-w-0">
                <h3 className="font-bold text-gray-800 text-sm leading-snug mb-1 line-clamp-2 group-hover:text-emerald-700 transition-colors">
                    {item.title}
                </h3>
                <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    <span className="text-emerald-600">{item.author}</span>
                    <span className="opacity-30">•</span>
                    <span className="bg-gray-100 px-1.5 py-0.5 rounded">{item.category}</span>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};
