import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowUpDown, Info, X, ChevronLeft, ChevronRight, ChevronDown, Copy } from 'lucide-react';
import { hosts } from '../../data/mockData';
import AIPushModal from './AIPushModal';
import BatchPushModal from './BatchPushModal';

function AIPushButton({ host, onPush }) {
  const [isHovered, setIsHovered] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const triggerRef = useRef(null);

  const handleMouseEnter = () => {
    if (host.targetMet && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setCoords({
        top: rect.top + window.scrollY - 36,
        left: rect.left + window.scrollX + rect.width / 2,
      });
      setIsHovered(true);
    }
  };

  return (
    <div className="inline-block">
      <button
        ref={triggerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => { if (!host.targetMet) onPush(host); }}
        className={`text-sm px-3 py-1.5 rounded-md transition-all font-medium whitespace-nowrap ${
          host.targetMet
            ? 'text-slate-400 bg-slate-100 opacity-60 cursor-not-allowed'
            : 'bg-[#F0F3F6] text-slate-500 hover:bg-[#E2E5E8]'
        }`}
      >
        AI 催播
      </button>
      {isHovered && createPortal(
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'tween', ease: 'easeInOut', duration: 0.2 }}
          style={{ top: `${coords.top}px`, left: `${coords.left}px` }}
          className="fixed -translate-x-1/2 z-[9999] pointer-events-none flex flex-col items-center"
        >
          <span className="bg-slate-800 text-white text-sm px-4 py-2 rounded-lg shadow-lg whitespace-nowrap leading-none">
            该主播已完成任务
          </span>
          <span className="w-1.5 h-1.5 bg-slate-800 rotate-45 -mt-[3px] z-10" />
        </motion.div>,
        document.body
      )}
    </div>
  );
}

function ProgressBar({ current, goal }) {
  const pct = Math.min((current / goal) * 100, 100);
  const completed = current >= goal;
  return (
    <div className="flex flex-col justify-center w-full max-w-[160px] text-left">
      {completed ? (
        <div className="text-xs leading-none">
          <span className="font-medium text-slate-600">{current.toLocaleString()}</span>
          <span className="text-slate-300 mx-1">/</span>
          <span className="text-slate-400">{goal.toLocaleString()}</span>
        </div>
      ) : (
        <div className="flex flex-col gap-y-1">
          <div className="text-xs leading-none">
            <span className="font-medium text-slate-600">{current.toLocaleString()}</span>
            <span className="text-slate-300 mx-1">/</span>
            <span className="text-slate-400">{goal.toLocaleString()}</span>
          </div>
          <div className="w-full h-1 bg-[#F2F2F2] rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ type: 'tween', ease: 'easeInOut', duration: 0.6 }}
              className="h-full rounded-full bg-[#ABB4BE]"
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default function HostTable({ reachedFilter = 'all' }) {
  const [pushModalHost, setPushModalHost] = useState(null);
  const [batchModalOpen, setBatchModalOpen] = useState(false);
  const [selected, setSelected] = useState(new Set());
  const [copyToast, setCopyToast] = useState(false);

  const handleCopy = (name) => {
    navigator.clipboard.writeText(name);
    setCopyToast(true);
    setTimeout(() => setCopyToast(false), 2000);
  };
  const allSelected = hosts.length > 0 && selected.size === hosts.length;

  const pageSize = 10;
  const [currentPage, setCurrentPage] = useState(1);

  const filteredHosts = hosts.filter(h => {
    if (reachedFilter === 'yes') return h.targetMet === true;
    if (reachedFilter === 'no') return h.targetMet === false;
    return true;
  });

  const totalPages = Math.ceil(filteredHosts.length / pageSize);
  const paginatedHosts = filteredHosts.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Reset to page 1 when filter changes
  useEffect(() => { setCurrentPage(1); }, [reachedFilter]);

  const toggleAll = () => {
    if (allSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(hosts.map(h => h.id)));
    }
  };

  const toggleOne = (id) => {
    const next = new Set(selected);
    if (next.has(id)) { next.delete(id); } else { next.add(id); }
    setSelected(next);
  };

  return (
    <>
      <AnimatePresence>
        {copyToast && (
          <motion.div
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            transition={{ type: 'tween', ease: 'easeInOut', duration: 0.2 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-[9999] bg-slate-800 text-white text-sm px-4 py-2 rounded-lg shadow-lg"
          >
            复制成功
          </motion.div>
        )}
      </AnimatePresence>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[1100px]">
          <thead>
            <tr className="bg-gray-50/50 border-b border-[#E8E8E8]">
              <th className="w-10 px-3 py-2.5">
                <input type="checkbox" checked={allSelected} onChange={toggleAll} className="accent-[#111827] w-3.5 h-3.5" />
              </th>
              <th className="text-left text-xs text-slate-500 font-medium px-4 py-2.5 min-w-[180px]">主播信息</th>
              <th className="text-left text-xs text-slate-500 font-medium px-4 py-2.5 min-w-[140px]">是否达成本赛段目标</th>
              <th className="text-left text-xs text-slate-500 font-medium px-4 py-2.5 min-w-[200px]">
                <span className="inline-flex items-center gap-1">钻石总数 <ArrowUpDown className="w-3 h-3" /> <Info className="w-3 h-3" /></span>
              </th>
              <th className="text-left text-xs text-slate-500 font-medium px-4 py-2.5 min-w-[200px]">
                <span className="inline-flex items-center gap-1">开播时长 <ArrowUpDown className="w-3 h-3" /> <Info className="w-3 h-3" /></span>
              </th>
              <th className="text-left text-xs text-slate-500 font-medium px-4 py-2.5 min-w-[200px]">
                <span className="inline-flex items-center gap-1">有效开播天数 <ArrowUpDown className="w-3 h-3" /> <Info className="w-3 h-3" /></span>
              </th>
              <th className="text-left text-xs text-slate-500 font-medium px-4 py-2.5 min-w-[150px]">
                <span className="inline-flex items-center gap-1"><Sparkles className="w-3.5 h-3.5 text-slate-500" />AI 预测</span>
              </th>
              <th className="text-left text-xs text-slate-500 font-medium px-4 py-2.5 sticky right-0 z-20 bg-gray-50/50 border-l border-[#E8E8E8] shadow-[0_0_1px_0_rgba(0,0,0,0.20),_0_8px_20px_0_rgba(0,0,0,0.12)]">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedHosts.map((host, idx) => (
              <motion.tr
                key={host.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: 'tween', ease: 'easeInOut', duration: 0.2, delay: idx * 0.04 }}
                className="border-b border-[#E8E8E8] hover:bg-slate-50/30 transition-colors"
              >
                {/* Checkbox */}
                <td className="px-3 py-2.5">
                  <input type="checkbox" checked={selected.has(host.id)} onChange={() => toggleOne(host.id)} className="accent-[#111827] w-3.5 h-3.5" />
                </td>

                {/* 主播信息 */}
                <td className="px-4 py-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-semibold text-white"
                      style={{ background: '#ABB4BE' }}>
                      {host.avatar}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-medium text-slate-600">{host.name}</span>
                        <button onClick={() => handleCopy(host.name)} className="text-slate-400 hover:text-slate-600 transition-colors">
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="text-xs text-slate-400">@{host.name.toLowerCase()}</div>
                    </div>
                  </div>
                </td>

                {/* 是否达成本赛段目标 */}
                <td className="px-4 py-2.5">
                  {host.targetMet ? (
                    <span className="inline-flex text-xs px-2 py-0.5 rounded-full font-medium bg-white text-slate-800 border border-gray-200">是</span>
                  ) : (
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-slate-100 text-slate-400">否</span>
                  )}
                </td>

                {/* 钻石总数 */}
                <td className="px-4 py-2.5">
                  <ProgressBar current={host.diamondCurrent} goal={host.diamondGoal} />
                </td>

                {/* 开播时长 */}
                <td className="px-4 py-2.5">
                  <ProgressBar current={host.hourCurrent} goal={host.hourGoal} />
                </td>

                {/* 有效开播天数 */}
                <td className="px-4 py-2.5">
                  <ProgressBar current={host.dayCurrent} goal={host.dayGoal} />
                </td>

                {/* AI 预测 */}
                <td className="px-4 py-2.5">
                  {host.prediction === 'pass' ? (
                    <span className="inline-flex text-xs px-2 py-0.5 rounded-full font-medium bg-white text-slate-800 border border-gray-200">Stable</span>
                  ) : (
                    <span className="inline-flex text-xs px-2 py-0.5 rounded-full font-medium bg-rose-50/50 text-rose-700 border border-rose-100/60">Critical</span>
                  )}
                </td>

                {/* Action */}
                <td className="px-4 py-2.5 sticky right-0 z-10 bg-white border-l border-[#E8E8E8] shadow-[0_0_1px_0_rgba(0,0,0,0.20),_0_8px_20px_0_rgba(0,0,0,0.12)]">
                  <AIPushButton host={host} onPush={(h) => setPushModalHost(h)} />
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="pt-4 border-t border-[#E8E8E8] mt-5">
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-400 font-medium">Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, filteredHosts.length)} of {filteredHosts.length}</span>
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-400 mr-1 font-medium">共{totalPages}页</span>
            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="w-7 h-7 flex items-center justify-center rounded-md text-xs text-slate-400 font-medium hover:bg-slate-50 transition-colors disabled:opacity-30"><ChevronLeft className="w-3.5 h-3.5" /></button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => setCurrentPage(p)} className={`w-7 h-7 flex items-center justify-center rounded-md text-xs transition-colors ${
                p === currentPage ? 'bg-[#E6F5F5] text-[#00C3C2] font-medium' : 'text-slate-800 hover:bg-slate-50'
              }`}>{p}</button>
            ))}
            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="w-7 h-7 flex items-center justify-center rounded-md text-xs text-slate-400 font-medium hover:bg-slate-50 transition-colors disabled:opacity-30"><ChevronRight className="w-3.5 h-3.5" /></button>
            <div className="relative ml-1">
              <select className="appearance-none bg-[#F0F3F6] border border-gray-200 rounded-md py-1.5 pl-2 pr-7 text-xs text-slate-800 focus:outline-none cursor-pointer font-medium">
                <option>10条/页</option>
                <option>20条/页</option>
                <option>50条/页</option>
              </select>
              <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {pushModalHost && <AIPushModal host={pushModalHost} onClose={() => setPushModalHost(null)} />}
      </AnimatePresence>

      <AnimatePresence>
        {selected.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 12 }}
            transition={{ type: 'tween', ease: 'easeInOut', duration: 0.25 }}
            style={{ boxShadow: '0 0 1px 0 rgba(0, 0, 0, 0.20), 0 20px 32px 0 rgba(0, 0, 0, 0.12)' }}
            className="absolute bottom-12 left-1/2 -translate-x-1/2 z-40 flex items-center justify-between w-[640px] px-4 py-2.5 bg-[#111827] rounded-xl text-white text-sm"
          >
            <div className="flex items-center gap-x-2.5">
              <span className="text-slate-100 font-light ml-0.5">已选择 {selected.size} 位主播</span>
              <span className="w-px h-4 bg-slate-600 ml-2.5" />
              <button onClick={() => setBatchModalOpen(true)} className="flex items-center gap-1.5 h-[28px] px-3.5 rounded-md text-white text-sm font-medium transition-all hover:bg-white/12 active:bg-white/16">
                <Sparkles className="h-4 w-4" />批量催播
              </button>
            </div>
            <div className="flex items-center gap-x-2.5">
              <span className="w-px h-4 bg-slate-600" />
              <button onClick={() => setSelected(new Set())} className="flex items-center gap-1.5 h-[28px] px-3.5 rounded-md text-white text-sm font-medium transition-all hover:bg-white/12 active:bg-white/16"><X className="h-[18px] w-[18px]" />取消选择</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {batchModalOpen && (
          <BatchPushModal
            hosts={filteredHosts.filter(h => selected.has(h.id))}
            onClose={() => setBatchModalOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
