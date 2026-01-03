import React, { useState } from 'react';
import { KNOWLEDGE_DB } from '../services/knowledgeData';
import { KnowledgeCategory } from '../types';
import { Search, ChevronRight, BookOpen, Sun, Moon } from 'lucide-react';

interface Props {
  t: any;
}

export const DhikrModule: React.FC<Props> = ({ t }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<KnowledgeCategory | 'all'>('all');

  const filteredItems = KNOWLEDGE_DB.filter(item => {
    const matchesSearch = 
        item.translation.toLowerCase().includes(searchQuery.toLowerCase()) || 
        item.source.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = activeCategory === 'all' || item.category === activeCategory;
    return matchesSearch && matchesCat;
  });

  const categories = [
      { id: 'all', label: 'All', icon: <BookOpen size={16} /> },
      { id: 'dhikr_morning', label: t.dhikr.morning, icon: <Sun size={16} /> },
      { id: 'dhikr_evening', label: t.dhikr.evening, icon: <Moon size={16} /> },
      { id: 'dhikr_prayer', label: t.dhikr.afterPrayer, icon: <ChevronRight size={16} /> },
  ];

  return (
      <div className="space-y-4 animate-in fade-in pb-24">
           {/* Search & Cats */}
           <div className="sticky top-0 bg-[#f0fdf4] z-10 py-4 px-1">
                <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input 
                        type="text" 
                        placeholder={t.dhikr.search}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white pl-10 pr-4 py-3 rounded-xl border-none shadow-sm focus:ring-2 focus:ring-emerald-500"
                    />
                </div>
                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                    {categories.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => setActiveCategory(cat.id as any)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-colors ${activeCategory === cat.id ? 'bg-emerald-600 text-white shadow-md' : 'bg-white text-gray-600 border border-gray-100'}`}
                        >
                            {cat.icon}
                            {cat.label}
                        </button>
                    ))}
                </div>
           </div>

           {/* List */}
            {filteredItems.map(item => (
                <div key={item.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-3">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-lg ${item.category.includes('dhikr') ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                            {item.category.includes('dhikr') ? 'Dhikr' : t.dhikr.hadith}
                        </span>
                        {item.repeat && (
                            <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-full font-medium">
                                {t.dhikr.repeat}: {item.repeat}x
                            </span>
                        )}
                    </div>
                    <p className="text-right font-arabic text-2xl leading-[2.2] text-gray-800 mb-4" dir="rtl">{item.arabic}</p>
                    <p className="text-gray-600 text-sm leading-relaxed mb-3">{item.translation}</p>
                    <div className="border-t border-gray-50 pt-3 flex justify-between items-center">
                        <span className="text-xs text-gray-400 font-medium">{t.dhikr.source}: <span className="text-gray-600">{item.source}</span></span>
                    </div>
                </div>
            ))}
      </div>
  );
};