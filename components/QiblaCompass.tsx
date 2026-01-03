
import React, { useEffect, useState } from 'react';
import { useCompass } from '../hooks/useCompass';
import { calculateQiblaDirection, calculateDistanceToKaaba } from '../services/geoService';
import { UserCoordinates } from '../types';
import { MapPin, Navigation, RefreshCw, Smartphone, Activity, CheckCircle2 } from 'lucide-react';

interface Props {
  coords: UserCoordinates | null;
  t: any;
}

export const QiblaCompass: React.FC<Props> = ({ coords, t }) => {
  const { heading, accuracy, pitch, roll, permissionGranted, needsCalibration, isReady, requestPermission } = useCompass();
  const [qiblaBearing, setQiblaBearing] = useState(0);
  const [distance, setDistance] = useState(0);
  const [showCalibration, setShowCalibration] = useState(false);

  useEffect(() => {
    if (coords) {
      setQiblaBearing(calculateQiblaDirection(coords));
      setDistance(calculateDistanceToKaaba(coords));
    }
  }, [coords]);

  // Bepaal of het toestel vlak ligt (tolerantie 15 graden voor optimale sensor werking)
  const isLevel = Math.abs(pitch) < 15 && Math.abs(roll) < 15;
  
  const diff = Math.abs(heading - qiblaBearing);
  const normalizedDiff = diff > 180 ? 360 - diff : diff;
  const isAligned = normalizedDiff < 3 && isLevel; 

  useEffect(() => {
    if (isAligned && navigator.vibrate) {
       navigator.vibrate([15, 30, 15]); 
    }
  }, [isAligned]);

  if (!permissionGranted) {
    return (
        <div className="flex flex-col items-center justify-center h-[70vh] text-center px-8 animate-in fade-in duration-700">
            <div className="w-24 h-24 bg-emerald-50 rounded-[2rem] flex items-center justify-center text-emerald-600 mb-8 shadow-inner">
                <Navigation size={40} className="animate-pulse" />
            </div>
            <h2 className="text-3xl font-black text-gray-800 mb-4">{t.qibla.start}</h2>
            <p className="text-gray-500 mb-10 leading-relaxed max-w-xs">{t.qibla.permission}</p>
            <button 
                onClick={requestPermission} 
                className="w-full max-w-xs bg-emerald-600 text-white py-5 rounded-2xl font-black text-lg shadow-xl shadow-emerald-100 active:scale-95 transition-all"
            >
                Start Kompas
            </button>
        </div>
    );
  }

  return (
    <div className="relative flex flex-col items-center justify-start pt-6 pb-24 h-full overflow-y-auto no-scrollbar animate-in fade-in duration-500">
        
        {/* distance & status header */}
        <div className="text-center mb-4 z-10 w-full px-6 flex-none">
            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-md border border-emerald-100/50 px-5 py-2.5 rounded-full shadow-sm mb-4 transition-all duration-500">
                <MapPin size={14} className="text-emerald-500" />
                <span className="text-xs font-black text-gray-700 tracking-wide">{distance.toLocaleString()} KM <span className="text-gray-400 font-medium">NAAR MEKKA</span></span>
            </div>
            
            <div className="relative h-16 flex flex-col items-center justify-center">
                <h2 className={`text-5xl font-black font-mono tracking-tighter transition-all duration-700 ${isAligned ? 'text-emerald-600 scale-110' : 'text-gray-800'}`}>
                    {Math.round(qiblaBearing)}°
                </h2>
                <div className={`mt-2 flex items-center gap-1.5 px-3 py-1 rounded-full transition-all duration-500 ${isAligned ? 'bg-emerald-100 text-emerald-700' : 'text-gray-400'}`}>
                    {isAligned && <CheckCircle2 size={12} />}
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">
                        {isAligned ? t.qibla.aligned : isLevel ? t.qibla.instruction : 'Houd telefoon vlak'}
                    </span>
                </div>
            </div>
        </div>

        {/* main compass visual */}
        <div className={`relative w-72 h-72 sm:w-80 sm:h-80 shrink-0 aspect-square my-auto transition-all duration-700 ${!isLevel ? 'opacity-40 scale-95 blur-[1px]' : 'opacity-100 scale-100'}`}>
            
            {/* fixed indicator (Top) */}
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-1">
                <div className={`w-1.5 h-12 rounded-full transition-all duration-500 ${isAligned ? 'bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.8)]' : 'bg-red-500'}`} />
                <div className={`w-2 h-2 rounded-full ${isAligned ? 'bg-emerald-400 animate-ping' : 'bg-transparent'}`} />
            </div>

            {/* rotating compass disk */}
            <div 
                className="w-full h-full relative transition-transform duration-75 ease-linear" 
                style={{ transform: `rotate(${-heading}deg)` }}
            >
                {/* Outer Ring */}
                <div className={`absolute inset-0 rounded-full border-[10px] bg-white shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] transition-all duration-700 ${isAligned ? 'border-emerald-500 shadow-emerald-100' : 'border-gray-900 shadow-gray-200'}`}>
                    
                    {/* Directions */}
                    <div className="absolute inset-4 flex flex-col items-center justify-between py-2">
                        <span className="text-sm font-black text-red-600">N</span>
                        <span className="text-sm font-black text-gray-300">S</span>
                    </div>
                    <div className="absolute inset-4 flex items-center justify-between px-2">
                        <span className="text-sm font-black text-gray-300">W</span>
                        <span className="text-sm font-black text-gray-300">E</span>
                    </div>
                    
                    {/* Degree Ticks */}
                    {[...Array(72)].map((_, i) => (
                        <div 
                            key={i} 
                            className={`absolute top-0 left-1/2 -translate-x-1/2 w-0.5 origin-bottom ${i % 9 === 0 ? 'h-4 bg-gray-400' : 'h-2 bg-gray-200'}`} 
                            style={{ transform: `rotate(${i * 5}deg) translateY(8px)` }} 
                        />
                    ))}

                    {/* Kaaba Direction Marker */}
                    <div className="absolute inset-0" style={{ transform: `rotate(${qiblaBearing}deg)` }}>
                        <div className="absolute -top-12 left-1/2 -translate-x-1/2">
                             <div className={`relative w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-500 ${isAligned ? 'bg-emerald-600 shadow-xl' : 'bg-black shadow-lg'}`}>
                                {/* Stylized Kaaba Icon */}
                                <div className="w-8 h-10 relative flex flex-col bg-black border-2 border-emerald-900 rounded-sm overflow-hidden">
                                    <div className="h-2 w-full bg-amber-400 mb-1 opacity-90 shadow-[0_0_5px_rgba(251,191,36,0.5)]" />
                                    <div className="flex-1 flex flex-col gap-1 px-1">
                                        <div className="h-0.5 w-full bg-gray-800" />
                                        <div className="h-0.5 w-2/3 bg-gray-800" />
                                    </div>
                                </div>
                                {/* Glow Effect behind Kaaba when nearing */}
                                {normalizedDiff < 20 && (
                                    <div className="absolute -inset-4 bg-emerald-500/20 blur-xl rounded-full -z-10 animate-pulse" />
                                )}
                             </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Central Bubble Level (Waterpas) */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full bg-white/40 backdrop-blur-md border border-white/50 z-40 flex items-center justify-center shadow-inner">
                <div className="relative w-20 h-20 rounded-full border-2 border-dashed border-gray-100">
                    {/* Target Crosshair */}
                    <div className="absolute top-1/2 left-4 right-4 h-0.5 bg-gray-100 -translate-y-1/2" />
                    <div className="absolute left-1/2 top-4 bottom-4 w-0.5 bg-gray-100 -translate-x-1/2" />
                    
                    {/* Floating Bubble */}
                    <div 
                        className={`absolute w-6 h-6 rounded-full shadow-lg transition-colors duration-300 border-2 border-white ${isLevel ? 'bg-emerald-500 shadow-emerald-200' : 'bg-red-500 shadow-red-200'}`}
                        style={{ 
                            left: `calc(50% + ${Math.max(-30, Math.min(30, roll))}px)`, 
                            top: `calc(50% + ${Math.max(-30, Math.min(30, pitch))}px)`,
                            transform: 'translate(-50%, -50%)'
                        }}
                    >
                        <div className="w-1.5 h-1.5 bg-white/40 rounded-full mt-1 ml-1" />
                    </div>

                    {/* Center Reference Circle */}
                    <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 border-2 rounded-full transition-colors duration-500 ${isLevel ? 'border-emerald-200' : 'border-gray-200'}`} />
                </div>
            </div>
        </div>

        {/* UI Feedback Cards */}
        <div className="mt-8 mb-6 px-6 w-full max-w-sm flex-none">
            {!isLevel && isReady ? (
                <div className="bg-amber-50 border border-amber-100 p-4 rounded-3xl flex items-center gap-4 animate-in slide-in-from-bottom-5">
                    <div className="p-2.5 bg-white rounded-2xl text-amber-500 shadow-sm">
                        <Smartphone size={20} className="animate-bounce" />
                    </div>
                    <div className="flex-1">
                        <p className="text-xs font-black text-amber-800 uppercase tracking-wide">Sensor waarschuwing</p>
                        <p className="text-[11px] text-amber-700/80 leading-tight mt-0.5">Houd uw toestel waterpas voor een nauwkeurige richting.</p>
                    </div>
                </div>
            ) : isReady && (
                <div className={`p-4 rounded-3xl border flex items-center gap-4 transition-all duration-500 ${isAligned ? 'bg-emerald-600 border-emerald-500 text-white shadow-xl shadow-emerald-100' : 'bg-white border-gray-100 text-gray-400 shadow-sm'}`}>
                    <div className={`p-2.5 rounded-2xl shadow-sm ${isAligned ? 'bg-white/20 text-white' : 'bg-gray-50 text-gray-400'}`}>
                        {isAligned ? <CheckCircle2 size={20} /> : <Activity size={20} />}
                    </div>
                    <div className="flex-1">
                        <p className={`text-xs font-black uppercase tracking-wide ${isAligned ? 'text-white' : 'text-gray-800'}`}>Status</p>
                        <p className={`text-[11px] leading-tight mt-0.5 ${isAligned ? 'text-emerald-50' : 'text-gray-400'}`}>
                            {isAligned ? 'Perfect uitgelijnd met de Kaaba.' : 'Kalibreer door uw telefoon te draaien.'}
                        </p>
                    </div>
                </div>
            )}
        </div>

        {/* Calibration Modal */}
        {(needsCalibration || showCalibration) && isReady && (
            <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/95 backdrop-blur-md p-8 text-center animate-in fade-in duration-300">
                <div className="relative mb-10">
                    <RefreshCw size={80} className="text-emerald-600 animate-[spin_3s_linear_infinite]" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Smartphone size={32} className="text-emerald-200" />
                    </div>
                </div>
                <h3 className="text-2xl font-black text-gray-800 mb-3">{t.qibla.calibrate}</h3>
                <p className="text-gray-500 mb-8 leading-relaxed max-w-xs">Beweeg uw telefoon in een '8-figuur' om de sensoren te herstellen.</p>
                
                <div className="bg-emerald-50 px-6 py-4 rounded-3xl flex items-center gap-4 border border-emerald-100 shadow-sm">
                    <div className="w-3 h-3 bg-emerald-500 rounded-full animate-ping" />
                    <div className="text-left">
                        <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Sensor Precisie</p>
                        <p className="text-sm font-bold text-gray-800">{Math.round(accuracy)}° (Laden...)</p>
                    </div>
                </div>

                <button 
                    onClick={() => setShowCalibration(false)} 
                    className="mt-12 text-gray-400 text-sm font-bold uppercase tracking-widest hover:text-emerald-600 transition-colors"
                >
                    Sluiten
                </button>
            </div>
        )}
    </div>
  );
};
