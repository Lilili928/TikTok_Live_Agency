import { useState } from 'react';
import { Bell, HelpCircle, ChevronDown, Sun, Moon } from 'lucide-react';
import { motion } from 'framer-motion';

const pageTitles = {
  list: 'Activity management',
  detail: 'Activity registration',
  create: 'Create activity',
};

const segments = [
  { id: 'creator', label: 'Creator Network-ledactivity' },
  { id: 'platform', label: 'Platform activity' },
];

export default function TopBar({ darkMode, setDarkMode, activeTab }) {
  const [activeSegment, setActiveSegment] = useState('platform');
  const showSegments = activeTab === 'list';

  return (
    <header className="h-14 border-b border-gray-200 bg-white flex items-center justify-between px-6 shrink-0 z-10">
      {/* Left: Page title + segment tabs (list page only) */}
      <div className="flex items-center gap-x-6">
        <span className="text-base font-semibold text-slate-800">
          {pageTitles[activeTab] || 'Activity'}
        </span>
        {showSegments && (
          <div className="flex items-center bg-slate-100 rounded-lg p-0.5">
            {segments.map((seg) => (
              <button
                key={seg.id}
                onClick={() => setActiveSegment(seg.id)}
                className="relative text-xs px-3 py-1 rounded transition-colors"
              >
                {activeSegment === seg.id && (
                  <motion.div
                    layoutId="segmentBg"
                    className="absolute inset-0 bg-white rounded-md shadow-sm"
                    transition={{ type: 'tween', ease: 'easeInOut', duration: 0.25 }}
                  />
                )}
                <span className={`relative z-10 ${activeSegment === seg.id ? 'text-slate-800 font-semibold' : 'text-slate-400 hover:text-slate-600'}`}>
                  {seg.label}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Right */}
      <div className="flex items-center gap-4">
        <button className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 transition-colors">
          <span className="text-sm font-medium">JP</span>
          <ChevronDown className="w-3.5 h-3.5" />
        </button>
        <button className="p-1 rounded-lg text-slate-400 hover:text-slate-500 hover:bg-slate-50 transition-all">
          <Bell className="w-[18px] h-[18px]" strokeWidth={1.5} />
        </button>
        <button className="p-1 rounded-lg text-slate-400 hover:text-slate-500 hover:bg-slate-50 transition-all">
          <HelpCircle className="w-[18px] h-[18px]" strokeWidth={1.5} />
        </button>
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="p-1 rounded-lg text-slate-400 hover:text-slate-500 hover:bg-slate-50 transition-all"
        >
          {darkMode ? <Sun className="w-[18px] h-[18px]" strokeWidth={1.5} /> : <Moon className="w-[18px] h-[18px]" strokeWidth={1.5} />}
        </button>
        <div className="w-7 h-7 rounded-full bg-gradient-to-b from-amber-300 to-yellow-400 ring-2 ring-white overflow-hidden flex items-end justify-center">
          <div className="w-[18px] h-[18px] rounded-full bg-amber-100 border-2 border-amber-200 -mb-1" />
        </div>
      </div>
    </header>
  );
}
