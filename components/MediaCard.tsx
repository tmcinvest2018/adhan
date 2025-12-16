
import React, { useState } from 'react';
import { MediaItem } from '../types';
import { Play, Headphones, Video, ExternalLink, AlertCircle } from 'lucide-react';

interface Props {
  item: MediaItem;
  className?: string;
}

export const MediaCard: React.FC<Props> = ({ item, className = '' }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [playError, setPlayError] = useState(false);

  // 1. ROBUST ID EXTRACTION
  const getVideoId = (url: string) => {
      if (!url) return '';
      // If the ID is already clean (e.g. from RSS)
      if (!url.includes('/') && url.length > 5 && url.length < 20) return url;
      
      try {
          if (url.includes('/embed/')) return url.split('/embed/')[1].split('?')[0];
          if (url.includes('v=')) return url.split('v=')[1]?.split('&')[0];
          if (url.includes('youtu.be/')) return url.split('youtu.be/')[1].split('?')[0];
      } catch(e) {
          return '';
      }
      return url; // Fallback
  };

  const videoId = getVideoId(item.url);

  // 2. DETERMINISTIC THUMBNAIL
  const thumbnailSrc = imgError || !item.thumbnail 
      ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
      : item.thumbnail;

  // 3. CHANNEL LOGO
  // @ts-ignore - access injected property from MultimediaService
  const logoSrc = item.channelLogo || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.author)}&background=random&color=fff&size=64&bold=true`;

  // 4. EMBED URL FIX: Added 'origin' to satisfy YouTube security in sandboxed iframes
  const origin = window.location.origin;
  const embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&playsinline=1&modestbranding=1&rel=0&controls=1&origin=${origin}`;

  const handleOpenExternal = (e: React.MouseEvent) => {
      e.stopPropagation();
      window.open(`https://www.youtube.com/watch?v=${videoId}`, '_blank');
  };

  if (isPlaying) {
      return (
          <div className={`bg-black rounded-2xl overflow-hidden aspect-video shadow-lg animate-in fade-in relative ${className}`}>
              {item.type === 'video' && !playError ? (
                  <iframe 
                      src={embedUrl} 
                      title={item.title}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                      allowFullScreen
                      frameBorder="0"
                      onError={() => setPlayError(true)}
                  />
              ) : (
                  // AUDIO PLAYER OR ERROR FALLBACK
                  <div className="w-full h-full flex flex-col items-center justify-center bg-gray-900 text-white p-6 relative text-center">
                      {playError ? (
                          <>
                            <AlertCircle size={32} className="text-amber-500 mb-2" />
                            <h3 className="font-bold text-sm mb-4">Video kan niet in de app worden afgespeeld.</h3>
                          </>
                      ) : (
                          <>
                            <Headphones size={48} className="mb-4 text-emerald-400" />
                            <h3 className="font-bold text-lg mb-2 line-clamp-1">{item.title}</h3>
                          </>
                      )}
                      
                      {item.type === 'audio' && !playError && (
                           <audio controls autoPlay className="w-full max-w-sm">
                               <source src={item.url} type="audio/mpeg" />
                           </audio>
                      )}

                      <div className="flex gap-3 mt-6">
                        <button 
                            onClick={handleOpenExternal}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2"
                        >
                            <ExternalLink size={14} /> Open in YouTube
                        </button>
                        <button 
                            onClick={() => setIsPlaying(false)} 
                            className="text-gray-400 hover:text-white text-xs underline"
                        >
                            Sluiten
                        </button>
                      </div>
                  </div>
              )}
          </div>
      );
  }

  return (
    <div 
        className={`bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-all cursor-pointer group flex flex-col ${className}`}
        onClick={() => setIsPlaying(true)}
    >
      {/* Thumbnail Container */}
      <div className="relative aspect-video bg-gray-100 overflow-hidden">
          <img 
              src={thumbnailSrc} 
              alt={item.title} 
              onError={() => setImgError(true)}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
          />
          
          {/* Overlay Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-60" />

          {/* Play Button */}
          <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform border border-white/30">
                  <Play size={20} className="ml-1 text-white" fill="currentColor" />
              </div>
          </div>

          {/* Type Badge */}
          <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded-lg flex items-center gap-1">
              {item.type === 'video' ? <Video size={10} /> : <Headphones size={10} />}
              <span>{item.type === 'video' ? 'Video' : 'Audio'}</span>
          </div>

          {/* External Link Quick Action */}
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={handleOpenExternal} className="p-1.5 bg-black/60 backdrop-blur-md text-white rounded-lg hover:bg-emerald-600">
                  <ExternalLink size={12} />
              </button>
          </div>

          {/* Duration Badge */}
          {item.duration && (
              <div className="absolute bottom-2 right-2 bg-black/70 text-white text-[10px] font-bold px-2 py-1 rounded">
                  {item.duration}
              </div>
          )}
      </div>

      {/* Info Section */}
      <div className="p-4 flex gap-3">
          {/* Channel Logo */}
          <div className="flex-shrink-0">
              <img 
                  src={logoSrc} 
                  alt={item.author} 
                  className="w-10 h-10 rounded-full border border-gray-100 shadow-sm"
              />
          </div>

          <div className="flex-1 min-w-0">
              <h3 className="font-bold text-gray-800 leading-tight line-clamp-2 text-sm mb-1 group-hover:text-emerald-700 transition-colors">
                  {item.title}
              </h3>
              <div className="flex items-center gap-2">
                  <p className="text-xs text-gray-500 font-medium truncate">
                      {item.author}
                  </p>
                  <span className="text-[10px] text-gray-300">•</span>
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${item.type === 'video' ? 'text-red-500' : 'text-purple-500'}`}>
                      {item.category}
                  </span>
              </div>
          </div>
      </div>
    </div>
  );
};
