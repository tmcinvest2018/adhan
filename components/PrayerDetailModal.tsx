import React from 'react';
import { PrayerKey } from '../types';
import { PRAYER_CONTEXT, getItemsByIds } from '../services/knowledgeData';
import { X, BookOpen, Volume2, VolumeX, Info } from 'lucide-react';

interface Props {
  prayerKey: PrayerKey | null;
  onClose: () => void;
  t: any;
}

export const PrayerDetailModal: React.FC<Props> = ({ prayerKey, onClose, t }) => {
  if (!prayerKey) return null;

  const context = PRAYER_CONTEXT[prayerKey];
  const items = getItemsByIds(context.relatedItemIds);

  const getRecitationIcon = () => {
      if(context.recitationType === 'loud') return <Volume2 size={20} className="text-emerald-600" />;
      if(context.recitationType === 'silent') return <VolumeX size={20} className="text-gray-500" />;
      return null;
  };

  const getRecitationLabel = () => {
    if(context.recitationType === 'loud') return t.dhikr.loud;
    if(context.recitationType === 'silent') return t.dhikr.silent;
    if(context.recitationType === 'mixed') return t.dhikr.mixed;
    return t.dhikr.none;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-3xl p-0 shadow-2xl animate-in slide-in-from-bottom-10 max-h-[85vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="bg-emerald-600 p-6 text-white flex justify-between items-start">
            <div>
                <span className="inline-flex items-center gap-1 bg-white/20 px-2 py-1 rounded text-xs font-semibold uppercase tracking-wider mb-2">
                    <Info size={12} /> {t.dhikr.contextTitle}
                </span>
                <h2 className="text-3xl font-bold capitalize">{t.prayers[prayerKey]}</h2>
            </div>
            <button onClick={onClose} className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors">
                <X size={20} />
            </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 space-y-6">
            
            {/* Fiqh Section */}
            <div>
                <h3 className="text-gray-400 font-bold text-xs uppercase tracking-widest mb-3">{t.dhikr.fiqh}</h3>
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                        <div className="text-gray-500 text-xs mb-1">{t.dhikr.rakahs}</div>
                        <div className="font-bold text-gray-800 text-sm">{context.rakahSummary}</div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                        <div className="text-gray-500 text-xs mb-1">{t.dhikr.recitation}</div>
                        <div className="font-bold text-gray-800 text-sm flex items-center gap-2">
                            {getRecitationIcon()}
                            {getRecitationLabel()}
                        </div>
                    </div>
                </div>
                {context.sunnahInfo && (
                     <div className="mt-4 bg-emerald-50/50 p-4 rounded-xl border border-emerald-100 text-sm text-emerald-800">
                         <strong>{t.dhikr.sunnah}:</strong> {context.sunnahInfo}
                     </div>
                )}
            </div>

            {/* Related Dhikr/Hadith Section */}
            <div>
                <h3 className="text-gray-400 font-bold text-xs uppercase tracking-widest mb-3">{t.dhikr.recommendedDhikr}</h3>
                <div className="space-y-3">
                    {items.map(item => (
                        <div key={item.id} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
                            <div className="flex justify-between mb-2">
                                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${item.category.includes('hadith') ? 'bg-amber-100 text-amber-700' : 'bg-blue-50 text-blue-600'}`}>
                                    {item.category.includes('hadith') ? t.dhikr.hadith : 'Dhikr'}
                                </span>
                                {item.repeat && (
                                    <span className="text-xs text-gray-400 bg-gray-100 px-2 rounded-full">{item.repeat}x</span>
                                )}
                            </div>
                            <p className="text-right font-arabic text-xl leading-loose mb-3 text-gray-800" dir="rtl">{item.arabic}</p>
                            <p className="text-sm text-gray-600 mb-2 italic">{item.translation}</p>
                            <p className="text-xs text-gray-400 font-medium">{t.dhikr.source}: {item.source}</p>
                        </div>
                    ))}
                    {items.length === 0 && (
                        <p className="text-gray-400 text-sm italic">No specific records found for this prayer.</p>
                    )}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};