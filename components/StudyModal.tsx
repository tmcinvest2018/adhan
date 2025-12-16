
import React, { useState, useEffect } from 'react';
import { Ayah, Surah } from '../types';
import { TafseerService } from '../services/tafseerService';
import { X, Book, Languages, AlignLeft, ChevronDown } from 'lucide-react';

interface Props {
  ayah: Ayah | null;
  surah: Surah | null;
  onClose: () => void;
  t: any;
}

type Tab = 'translation' | 'tafseer' | 'words';

export const StudyModal: React.FC<Props> = ({ ayah, surah, onClose, t }) => {
  const [activeTab, setActiveTab] = useState<Tab>('tafseer');
  const [tafseerId, setTafseerId] = useState('en.ibnkathir');
  const [tafseerContent, setTafseerContent] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (ayah && surah && activeTab === 'tafseer') {
        loadTafseer();
    }
  }, [ayah, surah, activeTab, tafseerId]);

  const loadTafseer = async () => {
      if (!ayah || !surah) return;
      setLoading(true);
      
      // 1. Ensure Map is ready (FIX B1 Logic)
      await TafseerService.prepareTafseerMap(tafseerId, surah.number);
      
      // 2. Get Synchronized Text
      const text = TafseerService.getTafseerByAyahId(tafseerId, surah.number, ayah.numberInSurah);
      setTafseerContent(text);
      setLoading(false);
  };

  if (!ayah || !surah) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white w-full max-w-lg h-[85vh] sm:h-[800px] sm:rounded-3xl rounded-t-3xl shadow-2xl flex flex-col animate-in slide-in-from-bottom-10 overflow-hidden">
        
        {/* Header */}
        <div className="bg-emerald-600 p-4 text-white flex justify-between items-center shadow-md z-10">
            <div>
                <h3 className="font-bold text-lg">{surah.englishName} {surah.number}:{ayah.numberInSurah}</h3>
                <p className="text-emerald-100 text-xs">Study Mode</p>
            </div>
            <button onClick={onClose} className="p-2 bg-white/20 rounded-full hover:bg-white/30">
                <X size={20} />
            </button>
        </div>

        {/* Ayah Preview */}
        <div className="bg-gray-50 p-4 border-b border-gray-100">
            <p className="font-arabic text-2xl text-right text-gray-800 leading-loose" dir="rtl">{ayah.text}</p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100">
            <button 
                onClick={() => setActiveTab('translation')}
                className={`flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 border-b-2 transition-colors ${activeTab === 'translation' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-gray-500'}`}
            >
                <Languages size={16} /> Translation
            </button>
            <button 
                onClick={() => setActiveTab('tafseer')}
                className={`flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 border-b-2 transition-colors ${activeTab === 'tafseer' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-gray-500'}`}
            >
                <Book size={16} /> Tafsir
            </button>
            <button 
                onClick={() => setActiveTab('words')}
                className={`flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 border-b-2 transition-colors ${activeTab === 'words' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-gray-500'}`}
            >
                <AlignLeft size={16} /> Word by Word
            </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-5 bg-white">
            
            {activeTab === 'translation' && (
                <div className="space-y-4">
                    <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                        <span className="text-xs font-bold text-emerald-600 uppercase mb-2 block">Sahih International</span>
                        <p className="text-gray-800 text-lg leading-relaxed">{ayah.translation}</p>
                    </div>
                    {/* Mock Alternative */}
                    <div className="p-4 rounded-xl border border-gray-100">
                        <span className="text-xs font-bold text-gray-500 uppercase mb-2 block">Dr. Mustafa Khattab</span>
                        <p className="text-gray-600 text-lg leading-relaxed">{ayah.translation}</p>
                    </div>
                </div>
            )}

            {activeTab === 'tafseer' && (
                <div>
                     {/* Tafsir Selector */}
                     <div className="mb-4 relative">
                        <select 
                            value={tafseerId}
                            onChange={(e) => setTafseerId(e.target.value)}
                            className="w-full appearance-none bg-gray-50 border border-gray-200 text-gray-700 py-3 px-4 pr-8 rounded-xl leading-tight focus:outline-none focus:bg-white focus:border-emerald-500 font-medium"
                        >
                            {TafseerService.getAvailableTafseers().map(tf => (
                                <option key={tf.id} value={tf.id}>{tf.name}</option>
                            ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                            <ChevronDown size={16} />
                        </div>
                     </div>

                     {loading ? (
                         <div className="space-y-3 animate-pulse">
                             <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                             <div className="h-4 bg-gray-200 rounded w-full"></div>
                             <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                         </div>
                     ) : (
                         <div className="prose prose-emerald max-w-none text-gray-800 leading-loose text-base">
                             {tafseerContent}
                         </div>
                     )}
                </div>
            )}

            {activeTab === 'words' && (
                <div className="text-center py-10">
                    <p className="text-gray-400 italic">Word-by-word analysis coming in next update.</p>
                </div>
            )}

        </div>
      </div>
    </div>
  );
};
