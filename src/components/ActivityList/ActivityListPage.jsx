import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trophy, Swords, Library, Sparkles, AlertTriangle, Search, ChevronDown,
  ChevronLeft, ChevronRight, ArrowUpDown, CreditCard, MoreHorizontal, Plus,
} from 'lucide-react';
import { diagnosticCards, activities, aiDiagnosis } from '../../data/mockData';

const fadeUp = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  transition: { type: 'tween', ease: 'easeInOut', duration: 0.25 },
};

function AIDiagnosisPopover({ activityId, onClose }) {
  const dx = aiDiagnosis[activityId];
  if (!dx) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: 6, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 6, scale: 0.97 }}
      transition={{ type: 'tween', ease: 'easeInOut', duration: 0.2 }}
      className="absolute right-0 top-full mt-2 w-80 bg-white border border-[#E8E8E8] rounded-xl p-4 shadow-sm z-50"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <AIBadge />
          <h4 className="text-sm font-semibold text-slate-800">智能诊断</h4>
        </div>
        <button onClick={onClose} className="text-slate-300 hover:text-slate-500 text-xs">ESC</button>
      </div>
      <div className="space-y-2.5">
        <div><div className="text-xs text-slate-400 mb-0.5">诊断结论</div><p className="text-sm text-slate-700">{dx.summary}</p></div>
        <div><div className="text-xs text-slate-400 mb-0.5">数据洞察</div><p className="text-xs text-slate-500">{dx.analysis}</p></div>
        <div><div className="text-xs text-slate-400 mb-0.5">AI 优化建议</div>
          <ul className="space-y-1">{dx.suggestions.map((s, i) => (
            <li key={i} className="text-xs text-slate-600 flex gap-1.5"><span className="text-violet-500 shrink-0 mt-0.5">&bull;</span>{s}</li>
          ))}</ul>
        </div>
      </div>
    </motion.div>
  );
}

const iconMap = { Trophy, Swords, Library };

const healthConfig = {
  healthy:   { bg: 'bg-white',       text: 'text-slate-800', border: 'border-gray-200',   label: 'Stable' },
  warning:   { bg: 'bg-amber-50/50', text: 'text-amber-700', border: 'border-amber-200', label: 'At Risk' },
  danger:    { bg: 'bg-rose-50/50',  text: 'text-rose-700',  border: 'border-rose-100/60',  label: 'Critical' },
};

export default function ActivityListPage({ onNavigateToCreate, onNavigateToDetail }) {
  const [activeTab, setActiveTab] = useState('management');
  const [hoveredHealth, setHoveredHealth] = useState(null);

  return (
    <div className="flex-1 overflow-y-auto scrollbar-thin px-6 py-5 space-y-4">
      {/* 三张新建卡片 */}
      <section>
        <div className="grid grid-cols-3 gap-3">
          {diagnosticCards.map((card, idx) => {
            const Icon = iconMap[card.icon];
            const iconColors = {
              Trophy: 'bg-slate-100 text-slate-500',
              Swords: 'bg-slate-100 text-slate-500',
              Library: 'bg-slate-100 text-slate-500',
            };
            return (
              <motion.div
                key={card.id}
                {...fadeUp} transition={{ ...fadeUp.transition, delay: idx * 0.06 }}
                whileHover={{ y: -1 }}
                onClick={() => { if (card.id === 'pk' || card.id === 'leaderboard') onNavigateToCreate(card.id === 'pk' ? 'dragon_boat_low_mid' : null); }}
                className="glass-card py-3 px-4 cursor-pointer group flex flex-col overflow-hidden"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-lg ${iconColors[card.icon]} flex items-center justify-center shrink-0`}>
                    <Icon className="w-4.5 h-4.5" strokeWidth={1.5} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-semibold text-slate-800">{card.title}</h3>
                      {card.aiBadge && (
                        <span className="text-xs text-[#00C3C2] bg-[#EFF9F9] px-1.5 py-0.5 rounded flex items-center gap-1 shrink-0">
                          <Sparkles className="w-3 h-3 text-[#00C3C2]" />AI 推荐
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-400 mt-0.5">{card.desc}</p>
                  </div>
                  <Plus className="w-5 h-5 text-slate-400 shrink-0" strokeWidth={1.5} />
                </div>
                {card.aiBadge && (
                  <div className="max-h-0 group-hover:max-h-[60px] group-hover:mt-2 opacity-0 group-hover:opacity-100 transition-all duration-300 ease-out overflow-hidden">
                    <div className="self-start bg-[#EFF9F9] border border-[#00C3C2]/20 rounded-lg py-1.5 px-2.5">
                      <p className="text-xs text-[#00C3C2] leading-snug">
                        本周公会开播率下降15%，点击一键创建促活PK赛（AI推荐度 98%）
                      </p>
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ============================================================ */}
      {/*  统一表格卡片                                                    */}
      {/* ============================================================ */}
      <section className="bg-white rounded-xl border border-[#E8E8E8] shadow-sm overflow-hidden">
        {/* Card Header: Local Tabs */}
        <div className="flex items-center border-b border-[#E8E8E8] px-5">
          {[
            { id: 'registration', label: 'Activity registration' },
            { id: 'management', label: 'Activity management' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative text-sm font-medium pb-3 pt-3 mr-6 transition-colors ${
                activeTab === tab.id ? 'text-slate-900' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <motion.div
                  layoutId="unifiedCardTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-tiktok-teal rounded-full"
                  transition={{ type: 'tween', ease: 'easeInOut', duration: 0.25 }}
                />
              )}
            </button>
          ))}
        </div>

        {/* Card Body: Filters + Table */}
        <div className="px-5 py-4">
          {/* Filter Row */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center">
              <div className="relative">
                <select className="appearance-none bg-[#F0F3F6] hover:bg-[#E2E5E8] border-r-[2px] border-[#E8E8E8] rounded-l-lg h-[30px] pl-3 pr-7 text-sm text-slate-500 focus:outline-none cursor-pointer font-medium">
                  <option>Activity name</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
              </div>
              <div className="relative">
                <input type="text" placeholder="Search"
                  className="w-48 bg-[#F0F3F6] hover:bg-[#E2E5E8] rounded-r-lg h-[30px] pl-3 pr-9 text-sm text-slate-700 placeholder-slate-400 focus:outline-none" />
                <Search className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              </div>
            </div>
            <div className="relative">
              <select className="appearance-none bg-[#F0F3F6] hover:bg-[#E2E5E8] rounded-lg h-[30px] pl-3 pr-7 text-sm text-slate-500 focus:outline-none focus:border-slate-300 cursor-pointer font-medium">
                <option>Activity type</option>
                <option>Please select</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
            </div>
            <div className="relative">
              <select className="appearance-none bg-[#F0F3F6] hover:bg-[#E2E5E8] rounded-lg h-[30px] pl-3 pr-7 text-sm text-slate-500 focus:outline-none focus:border-slate-300 cursor-pointer font-medium">
                <option>Status</option>
                <option>Please select</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* Table */}
          <div className="w-full overflow-x-auto">
          <table className="w-full min-w-[1130px]">
            <thead>
              <tr className="bg-gray-50/50 border-b border-[#E8E8E8]">
                <th className="text-left text-xs text-slate-500 font-medium px-4 py-2.5 min-w-[240px]">Activity name</th>
                <th className="text-left text-xs text-slate-500 font-medium px-4 py-2.5 min-w-[160px]">
                  <span className="inline-flex items-center gap-1">Activity type <ArrowUpDown className="w-3 h-3" /></span>
                </th>
                <th className="text-left text-xs text-slate-500 font-medium px-4 py-2.5 min-w-[280px]">
                  <span className="inline-flex items-center gap-1">Dates <ArrowUpDown className="w-3 h-3" /></span>
                </th>
                <th className="text-left text-xs text-slate-500 font-medium px-4 py-2.5 min-w-[120px]">Registration</th>
                <th className="text-left text-xs text-slate-500 font-medium px-4 py-2.5 min-w-[180px]">Created by</th>
                <th className="text-left text-xs text-slate-500 font-medium px-4 py-2.5 min-w-[120px]">
                  <span className="inline-flex items-center gap-1"><Sparkles className="w-3.5 h-3.5 text-slate-500" />AI Status</span>
                </th>
                <th className="text-left text-xs text-slate-500 font-medium px-4 py-2.5 sticky right-0 z-20 bg-[#fafafa] border-l border-[#E8E8E8] shadow-[0_0_1px_0_rgba(0,0,0,0.20),_0_8px_20px_0_rgba(0,0,0,0.12)]">Action</th>
              </tr>
            </thead>
            <tbody>
              {activities.map((act) => {
                const hc = healthConfig[act.health];
                return (
                  <motion.tr
                    key={act.id}
                    {...fadeUp}
                    className="border-b border-[#E8E8E8] hover:bg-slate-50/30 transition-colors"
                  >
                    {/* Activity name */}
                    <td className="px-4 py-2.5 min-w-[240px]">
                      <div className="text-sm font-medium text-slate-800">{act.name}</div>
                      <div className="flex items-center gap-1 mt-0.5 text-xs text-slate-400">
                        <CreditCard className="w-3 h-3" />
                        <span>{act.id}</span>
                      </div>
                    </td>

                    {/* Activity type */}
                    <td className="px-4 py-2.5 min-w-[160px]">
                      <span className="inline-flex text-xs px-2 py-0.5 rounded-full font-medium bg-white border border-gray-200 text-slate-800 whitespace-nowrap">{act.type}</span>
                    </td>

                    {/* Dates */}
                    <td className="px-4 py-2.5 min-w-[280px]">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs">
                          <span className="w-10 text-center py-0.5 rounded bg-[#F0F3F6] text-slate-400 font-medium text-[11px] inline-block">Start</span>
                          <span className="font-semibold text-slate-800">{act.startDate.split(' (')[0]}</span>
                          <span className="text-slate-400">({act.startDate.split('(')[1]}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <span className="w-10 text-center py-0.5 rounded bg-[#F0F3F6] text-slate-400 font-medium text-[11px] inline-block">End</span>
                          <span className="font-semibold text-slate-800">{act.endDate.split(' (')[0]}</span>
                          <span className="text-slate-400">({act.endDate.split('(')[1]}</span>
                        </div>
                      </div>
                    </td>

                    {/* Registration */}
                    <td className="px-4 py-2.5 min-w-[120px]">
                      <span className="text-sm font-semibold text-slate-800">
                        {act.access}
                      </span>
                    </td>

                    {/* Created by */}
                    <td className="px-4 py-2.5 min-w-[180px]">
                      <div className="text-sm font-semibold text-slate-800">{act.creator}</div>
                      <div className="text-xs text-slate-400 mt-0.5">{act.creatorTime}</div>
                    </td>

                    {/* AI Status */}
                    <td className="px-4 py-2.5 min-w-[120px] relative">
                      <div
                        onMouseEnter={() => setHoveredHealth(act.id)}
                        onMouseLeave={() => setHoveredHealth(null)}
                        className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium cursor-pointer ${hc.bg} ${hc.text} border ${hc.border}`}
                      >
                        {hc.label}
                      </div>
                      <AnimatePresence>
                        {hoveredHealth === act.id && act.health !== 'healthy' && (
                          <AIDiagnosisPopover activityId={act.id} onClose={() => setHoveredHealth(null)} />
                        )}
                      </AnimatePresence>
                    </td>

                    {/* Action */}
                    <td className="px-4 py-2.5 sticky right-0 z-10 bg-white border-l border-[#E8E8E8] shadow-[0_0_1px_0_rgba(0,0,0,0.20),_0_8px_20px_0_rgba(0,0,0,0.12)]">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => onNavigateToDetail && onNavigateToDetail()}
                          className="text-sm px-3 py-1.5 rounded-md bg-[#F0F3F6] text-slate-500 hover:bg-[#E2E5E8] transition-colors font-medium"
                        >
                          Details
                        </button>
                        <button className="text-sm px-3 py-1.5 rounded-md bg-[#F0F3F6] text-slate-500 hover:bg-[#E2E5E8] transition-colors font-medium">
                          Rankings
                        </button>
                        <button className="w-[30px] h-[30px] flex items-center justify-center rounded-md bg-[#F0F3F6] text-slate-400 hover:text-slate-500 hover:bg-[#E2E5E8] transition-colors">
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
          </div>
        </div>

        {/* Card Footer: Pagination */}
        <div className="flex items-center justify-between px-5 pt-3 pb-5 border-t border-[#E8E8E8]">
          <span className="text-xs text-slate-400 font-medium">Showing 1 to 5 of 20</span>
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-400 mr-1 font-medium">共11页</span>
            <button className="w-7 h-7 flex items-center justify-center rounded-md text-xs text-slate-400 font-medium hover:bg-slate-50 transition-colors"><ChevronLeft className="w-4 h-4" /></button>
            {['1', '2', '3', '4', '...', '10', '11'].map((p) => (
              <button key={p} className={`w-7 h-7 flex items-center justify-center rounded-md text-xs transition-colors ${
                p === '1' ? 'bg-[#E6F5F5] text-[#00C3C2] font-medium' : 'text-slate-800 hover:bg-slate-50'
              }`}>{p}</button>
            ))}
            <button className="w-7 h-7 flex items-center justify-center rounded-md text-xs text-slate-400 font-medium hover:bg-slate-50 transition-colors"><ChevronRight className="w-4 h-4" /></button>
            <div className="relative ml-1">
              <select className="appearance-none bg-[#F0F3F6] border border-gray-200 rounded-md py-1.5 pl-2 pr-7 text-xs text-slate-800 focus:outline-none cursor-pointer font-medium">
                <option>10条/页</option>
                <option>20条/页</option>
                <option>50条/页</option>
              </select>
              <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
