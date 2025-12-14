
import React, { useEffect, useState } from 'react';
import { useCompass } from '../hooks/useCompass';
import { calculateQiblaDirection, calculateDistanceToKaaba } from '../services/geoService';
import { UserCoordinates } from '../types';
import { MapPin, Navigation, RefreshCw, AlertCircle, Loader2, Check } from 'lucide-react';

interface Props {
  coords: UserCoordinates | null;
  t: any;
}

export const QiblaCompass: React.FC<Props> = ({ coords, t }) => {
  const { heading, permissionGranted, needsCalibration, isReady, requestPermission } = useCompass();
  const [qiblaBearing, setQiblaBearing] = useState(0);
  const [distance, setDistance] = useState(0);
  const [showCalibration, setShowCalibration] = useState(false);

  // Calculate Qibla data when coords change
  useEffect(() => {
    if (coords) {
      setQiblaBearing(calculateQiblaDirection(coords));
      setDistance(calculateDistanceToKaaba(coords));
    }
  }, [coords]);

  // Only auto-show calibration ONCE if the sensor explicitly asks for it.
  // We rely more on the manual button now.
  useEffect(() => {
      if (needsCalibration && isReady) {
          setShowCalibration(true);
      }
  }, [needsCalibration, isReady]);

  // Determine alignment
  const diff = Math.abs(heading - qiblaBearing);
  const normalizedDiff = diff > 180 ? 360 - diff : diff;
  const isAligned = normalizedDiff < 4; // +/- 4 degrees tolerance

  // Haptic Feedback on alignment
  useEffect(() => {
    if (isAligned && navigator.vibrate) {
       navigator.vibrate([10, 30, 10]); 
    }
  }, [isAligned]);

  if (!permissionGranted) {
    return (
        <div className="flex flex-col items-center justify-center h-[60vh] text-center px-6 animate-in zoom-in">
            <div className="bg-emerald-100 p-6 rounded-full mb-6 text-emerald-600">
                <Navigation size={48} />
            </div>
            <h2 className="text-2xl font-bold mb-3 text-gray-800">{t.qibla.calibrate}</h2>
            <p className="text-gray-500 mb-8 leading-relaxed">{t.qibla.permission}</p>
            <button 
                onClick={requestPermission} 
                className="bg-emerald-600 text-white px-8 py-4 rounded-2xl font-bold shadow-lg shadow-emerald-200 active:scale-95 transition-transform flex items-center gap-2"
            >
                <Navigation size={20} />
                {t.qibla.start}
            </button>
        </div>
    );
  }

  return (
    <div className="relative flex flex-col items-center justify-start pt-8 pb-20 h-full animate-in fade-in duration-500">
        
        {/* Info Header */}
        <div className="text-center mb-8 z-10 w-full px-4">
            <div className="flex justify-center mb-3">
                 <div className="inline-flex items-center gap-2 bg-white border border-gray-200 px-4 py-1.5 rounded-full shadow-sm">
                    <MapPin size={14} className="text-emerald-600" />
                    <span className="text-xs font-bold text-gray-600">{coords ? 'GPS Active' : 'Waiting...'}</span>
                    <span className="text-xs text-gray-400">|</span>
                    <span className="text-xs font-bold text-gray-800">{distance.toLocaleString()} km</span>
                </div>
            </div>

            <div className="relative">
                <h2 className="text-4xl font-black text-gray-800 tracking-tight flex items-center justify-center gap-2">
                    {Math.round(qiblaBearing)}° <span className="text-lg font-medium text-gray-400">Qibla</span>
                </h2>
                
                {/* Manual Calibration Trigger */}
                <button 
                    onClick={() => setShowCalibration(true)}
                    className="absolute right-0 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-emerald-600 bg-white/50 rounded-full hover:bg-emerald-50 transition-all"
                    title="Handmatig Kalibreren"
                >
                    <RefreshCw size={18} />
                </button>
            </div>
            
            <p className={`text-sm font-medium mt-1 transition-colors duration-300 ${isAligned ? 'text-emerald-600 font-bold' : 'text-gray-400'}`}>
                {isAligned ? t.qibla.aligned.toUpperCase() : t.qibla.instruction}
            </p>
        </div>

        {/* COMPASS COMPONENT */}
        <div className="relative w-72 h-72 sm:w-80 sm:h-80">
            
            {/* Top Indicator (Fixed to Phone) */}
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center">
                <div className={`w-1.5 h-8 rounded-full shadow-sm transition-all duration-300 ${isAligned ? 'bg-emerald-500 h-10 shadow-[0_0_15px_rgba(16,185,129,0.6)]' : 'bg-red-500'}`} />
                <div className={`w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] mt-1 ${isAligned ? 'border-t-emerald-500' : 'border-t-red-500'}`} />
            </div>

            {/* Rotating Rose Container */}
            <div 
                className="w-full h-full relative transition-transform duration-[75ms] ease-linear will-change-transform" 
                // Note: duration reduced for smoother feel with the new vector logic
                style={{ transform: `rotate(${-heading}deg)` }}
            >
                {/* 1. Compass Dial Image / CSS Ring */}
                <div className={`absolute inset-0 rounded-full border-[8px] bg-white transition-colors duration-500 shadow-2xl ${isAligned ? 'border-emerald-500 shadow-emerald-200' : 'border-gray-800 shadow-gray-300'}`}>
                    {/* Ticks */}
                    {[...Array(12)].map((_, i) => (
                        <div 
                            key={i} 
                            className="absolute top-0 left-1/2 -translate-x-1/2 w-[2px] h-3 bg-gray-300 origin-bottom"
                            style={{ transform: `rotate(${i * 30}deg) translateY(8px)` }} 
                        />
                    ))}
                    {/* Cardinal Points */}
                    <span className="absolute top-2 left-1/2 -translate-x-1/2 font-bold text-red-500 text-lg">N</span>
                    <span className="absolute bottom-2 left-1/2 -translate-x-1/2 font-bold text-gray-400 text-sm">S</span>
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 font-bold text-gray-400 text-sm">E</span>
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-gray-400 text-sm">W</span>
                </div>

                {/* 2. Kaaba Marker (Fixed at Qibla Angle on the Dial) */}
                <div 
                    className="absolute w-full h-full"
                    style={{ transform: `rotate(${qiblaBearing}deg)` }}
                >
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 -mt-1 flex flex-col items-center">
                         {/* Kaaba Icon Box */}
                         <div className={`w-14 h-14 rounded-xl flex items-center justify-center shadow-lg transform transition-transform duration-500 ${isAligned ? 'scale-110 bg-emerald-600 ring-4 ring-emerald-200' : 'bg-black ring-2 ring-amber-400'}`}>
                            <div className="w-6 h-7 border-t-[2px] border-amber-400 bg-black/90 rounded-[1px] relative">
                                <div className="absolute top-[6px] w-full h-[1px] bg-amber-400/50"></div>
                            </div>
                         </div>
                         {/* Arrow pointing to Kaaba from center */}
                         <div className={`w-0.5 h-24 bg-gradient-to-b from-emerald-500/50 to-transparent mt-2 ${isAligned ? 'opacity-100' : 'opacity-0'}`} />
                    </div>
                </div>

                {/* Center Pivot */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-gray-800 rounded-full border-2 border-white z-20 shadow-sm" />
            </div>

            {/* Waiting for Sensors Overlay */}
            {!isReady && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-[2px] rounded-full z-40">
                    <div className="bg-white p-4 rounded-full shadow-lg flex flex-col items-center">
                        <Loader2 size={24} className="animate-spin text-emerald-600" />
                        <span className="text-[10px] font-bold text-gray-500 mt-1 uppercase tracking-wide">Aligning...</span>
                    </div>
                </div>
            )}
        </div>

        {/* Calibration Modal / Overlay - NO TIMER, USER CONTROLLED */}
        {showCalibration && isReady && (
            <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/95 backdrop-blur-xl rounded-3xl animate-in fade-in p-6">
                <RefreshCw size={64} className="text-emerald-600 animate-spin-slow mb-6" />
                <h3 className="text-2xl font-black text-gray-800 mb-2">{t.qibla.calibrate}</h3>
                <p className="text-center text-gray-600 mb-8 leading-relaxed">
                    Maak 8-vormige bewegingen met je telefoon totdat de richting stabiel is.
                </p>
                <button 
                    onClick={() => setShowCalibration(false)}
                    className="w-full bg-emerald-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-emerald-200 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                    <Check size={20} />
                    Klaar met kalibreren
                </button>
            </div>
        )}
        
        {/* Accuracy Badge (Only if not calibrating) */}
        {!showCalibration && !isAligned && isReady && (
            <button 
                onClick={() => setShowCalibration(true)}
                className="absolute bottom-6 flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-100 rounded-full animate-in slide-in-from-bottom-2 shadow-sm"
            >
                <AlertCircle size={16} className="text-amber-500" />
                <span className="text-xs font-bold text-amber-700">Niet accuraat? Tik hier.</span>
            </button>
        )}

    </div>
  );
};
