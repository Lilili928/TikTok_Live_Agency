import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronLeft, ChevronRight, Search, LayoutGrid, X, Check } from 'lucide-react';
import HostTable from './HostTable';
import CountdownTimer from './CountdownTimer';

const stageTabs = [
  { id: 'stage1', label: '赛段一' },
  { id: 'stage2', label: '赛段二' },
  { id: 'overall', label: '主播整体表现' },
];

const goalItems = [
  { pre: '获得 ', num: '10,000', post: ' 颗钻石' },
  { pre: '开播时长 ', num: '35', post: ' 小时' },
  { pre: '有效开播天数 ', num: '8', post: ' 天' },
];

export default function ActivityDetailPage() {
  const [expanded, setExpanded] = useState(false);
  const [activeStage, setActiveStage] = useState('stage1');
  const [reachedFilter, setReachedFilter] = useState('all');
  const [filterOpen, setFilterOpen] = useState(false);
  const filterRef = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (filterRef.current && !filterRef.current.contains(e.target)) setFilterOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filterLabel = reachedFilter === 'yes' ? '是' : reachedFilter === 'no' ? '否' : null;

  return (
    <div className="flex-1 overflow-y-auto scrollbar-thin px-6 py-5 space-y-4">
      {/* Header Card */}
      <div className="bg-white rounded-xl border border-[#E8E8E8] shadow-sm p-5">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-base font-semibold text-slate-800">Music LIVE Quest</h1>
              <span className="text-xs px-2 py-0.5 rounded bg-emerald-50 text-emerald-600 font-medium">进行中</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">01/03/2026 ~ 01/06/2026</p>
          </div>
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 transition-colors"
          >
            {expanded ? '收起' : '展开'}
            <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
              <ChevronDown className="w-4 h-4" />
            </motion.div>
          </button>
        </div>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ type: 'tween', ease: 'easeInOut', duration: 0.25 }}
              className="overflow-hidden"
            >
              <div className="mt-4 pt-4 border-t border-[#E8E8E8] space-y-1.5">
                {goalItems.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm text-slate-600">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />
                    {item}
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Unified White Card */}
      <div className="relative bg-white rounded-xl border border-[#E8E8E8] shadow-sm overflow-visible">
        {/* Card Header: Stage Tabs */}
        <div className="flex items-center border-b border-[#E8E8E8] px-5">
          {stageTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveStage(tab.id)}
              className={`relative text-sm font-medium pb-3 pt-3 mr-6 transition-colors ${
                activeStage === tab.id ? 'text-slate-900' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {tab.label}
              {activeStage === tab.id && (
                <motion.div
                  layoutId="stageTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#34c2c1] rounded-full"
                  transition={{ type: 'tween', ease: 'easeInOut', duration: 0.25 }}
                />
              )}
            </button>
          ))}
        </div>

        {/* Card Body */}
        <div className="p-6">
        {/* Stage Target Banner */}
        <div className="flex items-center justify-between pb-4 mb-5 border-b border-[#E8E8E8]">
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-slate-800 whitespace-nowrap">任务奖励</span>
            <div className="flex items-center gap-2">
              {goalItems.map((item, idx) => (
                <span key={idx} className="text-xs bg-white border border-[#E8E8E8] rounded-full px-2.5 py-1 font-medium whitespace-nowrap">
                  <span className="text-slate-400">{item.pre}</span>
                  <span className="text-slate-800">{item.num}</span>
                  <span className="text-slate-400">{item.post}</span>
                </span>
              ))}
            </div>
          </div>
          <CountdownTimer endDate="2026-06-21T23:59:59" />
        </div>

        {/* Search & Custom Row */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Creator username"
                className="w-56 bg-[#F2F2F2] hover:bg-[#E6E6E6] rounded-lg h-[30px] pl-8 pr-3 text-sm text-slate-700 placeholder-slate-400 focus:outline-none font-medium"
              />
            </div>
            <div className="relative" ref={filterRef}>
              <button
                onClick={() => setFilterOpen(!filterOpen)}
                className="flex items-center gap-1.5 rounded-lg h-[30px] px-3 text-xs transition-colors font-medium bg-[#F2F2F2] hover:bg-[#E6E6E6] text-slate-600 border-none"
              >
                <span>是否达成本赛段目标</span>
                {filterLabel && <span className="font-semibold ml-0.5">{filterLabel}</span>}
                {reachedFilter !== 'all' ? (
                  <X
                    className="h-3 w-3 text-slate-400 hover:text-slate-600"
                    onClick={e => { e.stopPropagation(); setReachedFilter('all'); setFilterOpen(false); }}
                  />
                ) : (
                  <ChevronDown className={`h-3 w-3 text-slate-400 transition-transform ${filterOpen ? 'rotate-180' : ''}`} />
                )}
              </button>
              <AnimatePresence>
                {filterOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -4 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -4 }}
                    transition={{ duration: 0.15, ease: 'easeOut' }}
                    className="absolute left-0 top-full mt-1.5 z-50 w-36 bg-white border border-gray-100 rounded-lg py-1 text-xs text-slate-600 shadow-[0_8px_30px_rgba(0,0,0,0.12),_0_0_1px_rgba(0,0,0,0.20)]"
                  >
                    {[
                      { value: 'all', label: '全部' },
                      { value: 'yes', label: '是' },
                      { value: 'no', label: '否' },
                    ].map(opt => (
                      <div
                        key={opt.value}
                        onClick={() => { setReachedFilter(opt.value); setFilterOpen(false); }}
                        className={`px-3 py-2 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors ${
                          reachedFilter === opt.value ? 'text-slate-800 font-semibold bg-slate-50' : ''
                        }`}
                      >
                        <span>{opt.label}</span>
                        {reachedFilter === opt.value && <Check className="h-3.5 w-3.5 text-slate-600" />}
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
          <button className="flex items-center gap-1.5 text-sm bg-[#F2F2F2] hover:bg-[#E6E6E6] rounded-lg h-[30px] px-3 text-slate-500 transition-colors font-medium">
            <LayoutGrid className="w-3.5 h-3.5" />
            自定义
          </button>
        </div>

        {/* Host Table */}
        <HostTable reachedFilter={reachedFilter} />

        {/* Pagination handled inside HostTable */}
        </div>
      </div>
    </div>
  );
}
