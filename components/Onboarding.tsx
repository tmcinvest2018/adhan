
import React, { useState } from 'react';
import { LANGUAGES } from '../constants';
import { RECITERS } from '../services/quranService';
import { AppSettings, UserCoordinates } from '../types';
import { MapPin, Check, ChevronRight, Globe, Headphones } from 'lucide-react';

interface Props {
  t: any;
  onComplete: () => void;
  onUpdateSettings: (s: Partial<AppSettings>) => void;
  onUpdateLocation: (c: UserCoordinates) => void;
  settings: AppSettings;
}

export const Onboarding: React.FC<Props> = ({ t, onComplete, onUpdateSettings, onUpdateLocation, settings }) => {
  const [step, setStep] = useState(0);

  const handleLanguageSelect = (lang: string) => {
    onUpdateSettings({ language: lang });
    setStep(1);
  };

  const handleReciterSelect = (reciterId: string) => {
    onUpdateSettings({ reciterId });
    setStep(2);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-emerald-50 flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-500">
      
      {/* Step 0: Language */}
      {step === 0 && (
          <div className="w-full max-w-md animate-in slide-in-from-right">
              <div className="w-20 h-20 bg-white rounded-3xl mx-auto mb-8 flex items-center justify-center shadow-lg text-emerald-600">
                  <Globe size={40} />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Select Language</h2>
              <p className="text-gray-500 mb-8">Choose your preferred language / Kies uw taal</p>
              <div className="grid grid-cols-1 gap-3 max-h-[50vh] overflow-y-auto no-scrollbar">
                  {Object.entries(LANGUAGES).map(([code, label]) => (
                      <button 
                        key={code}
                        onClick={() => handleLanguageSelect(code)}
                        className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:border-emerald-500 hover:text-emerald-700 font-medium transition-all"
                      >
                          {label}
                      </button>
                  ))}
              </div>
          </div>
      )}

      {/* Step 1: Reciter Selection */}
      {step === 1 && (
          <div className="w-full max-w-md animate-in slide-in-from-right">
              <div className="w-20 h-20 bg-white rounded-3xl mx-auto mb-8 flex items-center justify-center shadow-lg text-emerald-600">
                  <Headphones size={40} />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">{t.quran.reciter || 'Select Reciter'}</h2>
              <p className="text-gray-500 mb-8">Choose your preferred Quran reciter</p>
              <div className="grid grid-cols-1 gap-3 max-h-[50vh] overflow-y-auto no-scrollbar">
                  {RECITERS.map((reciter) => (
                      <button 
                        key={reciter.id}
                        onClick={() => handleReciterSelect(reciter.id)}
                        className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:border-emerald-500 hover:text-emerald-700 font-medium transition-all text-left"
                      >
                          {reciter.name}
                      </button>
                  ))}
              </div>
          </div>
      )}

      {/* Step 2: Welcome / Bismillah (Previously Step 1) */}
      {step === 2 && (
          <div className="w-full max-w-md animate-in zoom-in duration-700">
              <div className="text-4xl sm:text-5xl font-arabic leading-relaxed text-emerald-800 mb-8 drop-shadow-sm">
                  بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
              </div>
              <h2 className="text-3xl font-bold text-gray-800 mb-2">{t.onboarding.welcome}</h2>
              <p className="text-gray-500 mb-10">{t.onboarding.bismillah}</p>
              
              <button 
                onClick={onComplete}
                className="w-full bg-emerald-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-emerald-200 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                  {t.onboarding.getStarted} <ChevronRight size={20} />
              </button>
          </div>
      )}

      {/* Stepper Dots */}
      <div className="absolute bottom-10 flex gap-2">
          {[0, 1, 2].map(i => (
              <div key={i} className={`w-2 h-2 rounded-full transition-colors ${i === step ? 'bg-emerald-600 w-4' : 'bg-gray-300'}`} />
          ))}
      </div>
    </div>
  );
};
