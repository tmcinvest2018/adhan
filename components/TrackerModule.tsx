
import React from 'react';
import { CheckSquare, Square, Flame } from 'lucide-react';

interface Props {
  t: any;
}

export const TrackerModule: React.FC<Props> = ({ t }) => {
  // Static mock data for demo visual layer
  const habits = [
    { id: 1, title: '5 Daily Prayers', completed: 5, total: 5, color: 'bg-emerald-500' },
    { id: 2, title: 'Read Quran (1 page)', completed: 1, total: 1, color: 'bg-teal-500' },
    { id: 3, title: 'Morning Dhikr', completed: 1, total: 1, color: 'bg-blue-500' },
    { id: 4, title: 'Evening Dhikr', completed: 0, total: 1, color: 'bg-indigo-500' },
    { id: 5, title: 'Sunnah Prayers', completed: 4, total: 12, color: 'bg-amber-500' },
  ];

  const weekDays = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const currentDayIndex = 3; // Mocking Thursday as current

  return (
    <div className="flex flex-col h-full animate-in fade-in space-y-6 pb-24 w-full">
      
      {/* Header Card */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-6">
            <div>
                <h2 className="text-2xl font-bold text-gray-800">{t.tracker.weekly}</h2>
                <p className="text-gray-500 text-sm">Keep up the consistency!</p>
            </div>
            <div className="flex items-center gap-1.5 bg-orange-50 text-orange-600 px-3 py-1.5 rounded-full font-bold text-sm">
                <Flame size={18} fill="currentColor" />
                <span>12 {t.tracker.days}</span>
            </div>
        </div>

        {/* Week Strip */}
        <div className="flex justify-between">
            {weekDays.map((day, idx) => {
                const isCurrent = idx === currentDayIndex;
                const isPast = idx < currentDayIndex;
                return (
                    <div key={idx} className="flex flex-col items-center gap-2">
                        <span className="text-xs font-bold text-gray-400">{day}</span>
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold transition-all ${isCurrent ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200 scale-110' : isPast ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-400'}`}>
                            {12 + idx}
                        </div>
                    </div>
                );
            })}
        </div>
      </div>

      {/* Habits List */}
      <div>
          <h3 className="font-bold text-gray-800 text-lg mb-4 px-1">{t.tracker.habits}</h3>
          <div className="space-y-3">
              {habits.map(habit => {
                  const isComplete = habit.completed === habit.total;
                  const percent = (habit.completed / habit.total) * 100;
                  
                  return (
                      <div key={habit.id} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 relative overflow-hidden group hover:border-emerald-200 transition-colors">
                          {/* Progress Bar Side Indicator */}
                          <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${isComplete ? 'bg-emerald-500' : 'bg-orange-400'}`} />
                          
                          <div 
                             className={`flex-shrink-0 w-6 h-6 rounded-md flex items-center justify-center cursor-pointer transition-colors ${isComplete ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-300'}`}
                          >
                             {isComplete ? <CheckSquare size={20} /> : <Square size={20} />}
                          </div>

                          <div className="flex-1">
                              <h4 className="font-bold text-gray-800">{habit.title}</h4>
                              <div className="flex items-center gap-2 mt-1">
                                  <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                      <div className={`h-full rounded-full ${isComplete ? 'bg-emerald-500' : 'bg-orange-400'}`} style={{ width: `${percent}%` }} />
                                  </div>
                                  <span className="text-xs font-medium text-gray-500">{habit.completed}/{habit.total}</span>
                              </div>
                          </div>
                      </div>
                  );
              })}
          </div>
      </div>
    </div>
  );
};
