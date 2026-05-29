import { useState, useCallback } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { X, Send, Sparkles, Loader2, Check, Copy, Settings, ChevronDown } from 'lucide-react';
import { callDeepSeek } from '../../utils/deepseek';

function buildSystemPrompt(activeTargets) {
  const names = activeTargets.map(h => h.name).join('、');
  return `你是一个专业的运营人员，说话要精炼、专业，不要啰嗦。请以"亲爱的主播你好"开头，生成一条催播话术，控制在2-3句话以内，最后加一个合适的emoji。注意：必须是一段完整连贯的自然段落，不要出现具体主播名字。`;
}

const defaultTags = ['活动剩余天数提醒', '准备了激励方案', '任何问题联系我们'];

export default function BatchPushModal({ hosts, onClose }) {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [polishing, setPolishing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [tags, setTags] = useState([...defaultTags]);
  const [isAdding, setIsAdding] = useState(false);
  const [newTagText, setNewTagText] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [showHostList, setShowHostList] = useState(false);

  const [targetMode, setTargetMode] = useState('all-incomplete');
  const allIncomplete = hosts.filter(h => !h.targetMet);
  const predictedFail = allIncomplete.filter(h => h.prediction === 'fail');
  const activeTargets = targetMode === 'predicted-fail' ? predictedFail : allIncomplete;
  const completedCount = hosts.length - allIncomplete.length;

  useState(() => {
    if (activeTargets.length > 0) {
      callDeepSeek(buildSystemPrompt(activeTargets), '请生成批量催播话术').then(r => { setText(r); setLoading(false); });
    } else {
      setText('所选主播均已完成任务，无需催播。');
      setLoading(false);
    }
  });

  const handleGenerate = useCallback(async () => {
    setLoading(true);
    try { const r = await callDeepSeek(buildSystemPrompt(activeTargets), '请生成批量催播话术'); setText(r); } catch (e) { console.error(e); }
    setLoading(false);
  }, [activeTargets]);

  const handlePolish = useCallback(async () => {
    if (!text.trim()) return;
    setPolishing(true);
    try {
      const r = await callDeepSeek(
        `你是一个专业的 TikTok 直播公会运营总监，说话精炼专业。`,
        `润色以下催播话术，使其更专业精炼，控制在2-3句话以内，以"亲爱的主播你好"开头，不要出现具体主播名字：${text}`
      );
      setText(r);
    } catch (e) { console.error(e); }
    setPolishing(false);
  }, [text]);

  const handleSend = async () => { setSending(true); await new Promise(r => setTimeout(r, 1500)); setSending(false); setSent(true); setTimeout(onClose, 2000); };
  const handleCopy = () => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500); };

  const addTag = () => {
    const trimmed = newTagText.trim();
    if (trimmed && tags.length < 10) { setTags(prev => [...prev, trimmed]); setText(prev => prev + (prev ? '，' : '') + trimmed + '，'); }
    setNewTagText(''); setIsAdding(false);
  };
  const removeTag = (t) => { setTags(prev => prev.filter(x => x !== t)); };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ type: 'tween', ease: 'easeInOut', duration: 0.2 }}
      className="fixed inset-0 bg-black/25 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ opacity: 0, y: 12, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -12, scale: 0.97 }}
        transition={{ type: 'tween', ease: 'easeInOut', duration: 0.25 }}
        className="relative bg-white border border-[#E8E8E8] rounded-2xl w-[640px] h-[400px] flex flex-col overflow-hidden shadow-sm"
      >
        {/* Header */}
        <div className="flex items-center justify-between pl-4 pr-5 pt-3 pb-3.5 border-b border-[#E8E8E8]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-violet-600" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-800">AI 智能催播</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                将对{targetMode === 'predicted-fail' ? '预测未达标' : '任务未完成'}的 {activeTargets.length} 位主播进行批量催播
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-700"><X className="w-5 h-5" /></button>
        </div>

        {/* Data */}
        <div className="px-6 py-3 bg-[#F2F2F2] border-b border-[#E8E8E8]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-xs">
              <span className="text-xs font-medium text-slate-700">催播对象</span>
              <div className="flex items-center gap-1.5">
                <button onClick={() => setTargetMode('all-incomplete')} className={`px-2.5 py-0.5 rounded-full border transition-colors ${targetMode === 'all-incomplete' ? 'bg-white border-gray-300 text-slate-700 font-medium' : 'bg-transparent border-transparent text-slate-400 hover:text-slate-600'}`}>任务未完成</button>
                <button onClick={() => setTargetMode('predicted-fail')} className={`px-2.5 py-0.5 rounded-full border transition-colors ${targetMode === 'predicted-fail' ? 'bg-white border-gray-300 text-slate-700 font-medium' : 'bg-transparent border-transparent text-slate-400 hover:text-slate-600'}`}>预测未达标</button>
              </div>
            </div>
            <button onClick={() => setShowHostList(true)} className="text-xs text-slate-400 hover:text-slate-600 transition-colors">查看名单</button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-3">
              <span className="text-xs font-medium text-slate-700">催播话术</span>
              {text && <button onClick={() => setText('')} className="text-xs text-slate-400 hover:text-slate-600 transition-colors">清空</button>}
            </div>
            <div className="flex items-center gap-2">
              {loading ? (
                <span className="text-xs flex items-center gap-1 text-violet-500"><Loader2 className="w-2.5 h-2.5 animate-spin" />AI 生成中...</span>
              ) : polishing ? (
                <span className="text-xs flex items-center gap-1 text-violet-500"><Loader2 className="w-2.5 h-2.5 animate-spin" />润色中...</span>
              ) : !text.trim() ? (
                activeTargets.length > 0 && <button onClick={handleGenerate} className="flex items-center gap-1 text-xs text-violet-600 hover:text-violet-700 transition-colors font-medium"><Sparkles className="w-3 h-3" />AI 生成</button>
              ) : (
                <button onClick={handlePolish} className="flex items-center gap-1 text-xs text-violet-600 hover:text-violet-700 transition-colors font-medium"><Sparkles className="w-3 h-3" />AI 润色</button>
              )}
            </div>
          </div>

          <div className="relative flex-1">
            <textarea value={text} onChange={e => setText(e.target.value)}
              className="w-full h-full bg-violet-50/30 border border-[#E8E8E8] rounded-xl p-3.5 pb-10 text-sm text-slate-700 leading-relaxed resize-none focus:outline-none focus:border-violet-300"
              placeholder={loading ? '✨ DeepSeek AI 正在全力生成中...' : '输入或选择常用语，一键生成催播话术…'}
            />
            <div className="absolute bottom-3 left-3 right-3">
              <Reorder.Group axis="x" values={tags} onReorder={setTags} as="div" className="flex flex-wrap items-center gap-1.5">
                <AnimatePresence mode="popLayout">
                  {tags.map(tag => (
                    <Reorder.Item key={tag} value={tag} as="div" layout>
                      <motion.div layout>
                        <button
                          onClick={() => { isEditing ? removeTag(tag) : (text.includes(tag) ? setText(prev => prev.replace(new RegExp(tag + '，?', 'g'), '').replace(/，$/, '')) : setText(prev => prev + (prev && !prev.endsWith('，') ? '，' : '') + tag + '，')); }}
                          className={`text-xs px-2.5 h-6 flex items-center rounded-full border transition-colors select-none ${isEditing ? 'bg-rose-50 border-rose-200 text-rose-500 cursor-pointer' : text.includes(tag) ? 'bg-violet-50 border-violet-300 text-violet-600' : 'bg-white border-gray-200 text-slate-500 hover:border-violet-300 hover:text-violet-600'}`}
                        >
                          {tag}{isEditing && <span className="ml-1 text-rose-400">&times;</span>}
                        </button>
                      </motion.div>
                    </Reorder.Item>
                  ))}
                  <motion.div key="plus-btn" layout>
                    {isAdding ? (
                      <motion.div layout initial={{ width: 28 }} animate={{ width: 140 }} transition={{ type: 'spring', stiffness: 300, damping: 25 }}>
                        <input type="text" value={newTagText} onChange={e => setNewTagText(e.target.value.slice(0, 20))}
                          onKeyDown={e => { if (e.key === 'Enter') addTag(); if (e.key === 'Escape') { setIsAdding(false); setNewTagText(''); } }}
                          onBlur={() => { if (!newTagText.trim()) { setIsAdding(false); setNewTagText(''); } }}
                          placeholder="输入标签，回车添加" className="w-full h-6 px-3 text-xs bg-white border border-violet-300 rounded-full focus:outline-none focus:border-violet-500 placeholder-slate-400" />
                      </motion.div>
                    ) : (
                      <button onClick={() => setIsAdding(true)} className="w-6 h-6 flex items-center justify-center bg-gray-50 border border-gray-200 rounded-full text-slate-400 hover:text-slate-600 hover:bg-gray-100 transition-all cursor-pointer leading-none"><span className="text-sm -mt-px">+</span></button>
                    )}
                  </motion.div>
                  <motion.div key="settings-btn" layout>
                    <button onClick={() => setIsEditing(!isEditing)} className={`w-6 h-6 flex items-center justify-center rounded-full border transition-all cursor-pointer leading-none ${isEditing ? 'bg-violet-100 border-violet-300 text-violet-600' : 'bg-gray-50 border-gray-200 text-slate-400 hover:text-slate-600 hover:bg-gray-100'}`}>
                      <Settings className="w-3.5 h-3.5" />
                    </button>
                  </motion.div>
                </AnimatePresence>
              </Reorder.Group>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="px-4 py-5 border-t border-[#E8E8E8] flex items-center gap-3">
          <button onClick={handleCopy} className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#F2F2F2] text-slate-600 hover:bg-[#E6E6E6] text-sm transition-colors font-medium">
            {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}{copied ? '已复制' : '一键复制'}
          </button>
          <div className="flex items-center gap-3 ml-auto">
            <button onClick={onClose} className="flex items-center px-3.5 py-1.5 rounded-lg bg-[#F2F2F2] text-slate-600 hover:bg-[#E6E6E6] text-sm transition-colors font-medium">取消</button>
            <button onClick={handleSend} disabled={loading || sending || sent || activeTargets.length === 0} className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-violet-600 text-white text-sm font-medium hover:bg-violet-700 transition-colors disabled:opacity-50">
              {sent ? <><Check className="w-3 h-3" />已发送</> : sending ? <><Loader2 className="w-3 h-3 animate-spin" />发送中...</> : <><Send className="w-3 h-3" />确认发送</>}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {/* Host List Modal */}
        <AnimatePresence>
          {showHostList && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ type: 'tween', ease: 'easeInOut', duration: 0.2 }}
              className="fixed inset-0 bg-black/25 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
              onClick={() => setShowHostList(false)}
            >
              <motion.div
                initial={{ opacity: 0, y: 12, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -12, scale: 0.97 }}
                transition={{ type: 'tween', ease: 'easeInOut', duration: 0.25 }}
                onClick={e => e.stopPropagation()}
                className="bg-white border border-[#E8E8E8] rounded-2xl w-[1200px] h-[660px] flex flex-col overflow-hidden shadow-sm"
              >
                <div className="flex items-center justify-between pl-4 pr-5 pt-3 pb-3.5 border-b border-[#E8E8E8]">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-800">催播名单</h3>
                    <p className="text-xs text-slate-400 mt-0.5">共 {activeTargets.length} 位主播</p>
                  </div>
                  <button onClick={() => setShowHostList(false)} className="text-slate-500 hover:text-slate-700"><X className="w-5 h-5" /></button>
                </div>
                <div className="flex-1 overflow-auto p-6">
                  <div className="bg-white rounded-xl border border-[#E8E8E8] overflow-hidden">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gray-50/50 border-b border-[#E8E8E8]">
                          <th className="text-left text-xs text-slate-500 font-medium px-4 py-2.5 min-w-[200px]">主播</th>
                          <th className="text-left text-xs text-slate-500 font-medium px-4 py-2.5 min-w-[140px]">主播 ID</th>
                          <th className="text-left text-xs text-slate-500 font-medium px-4 py-2.5 min-w-[320px]">数据缺口</th>
                          <th className="text-left text-xs text-slate-500 font-medium px-4 py-2.5 min-w-[120px]">是否达成</th>
                          <th className="text-left text-xs text-slate-500 font-medium px-4 py-2.5 min-w-[160px]">AI 预测</th>
                          <th className="text-left text-xs text-slate-500 font-medium px-4 py-2.5 border-l border-[#E8E8E8]">操作</th>
                        </tr>
                      </thead>
                      <tbody>
                        {activeTargets.map(h => (
                          <tr key={h.id} className="border-b border-[#E8E8E8] hover:bg-slate-50/30 transition-colors">
                            <td className="px-4 py-2.5">
                              <div className="flex items-center gap-2.5">
                                <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-semibold text-white" style={{ background: '#C3C3C3' }}>{h.avatar}</div>
                                <span className="text-sm font-medium text-slate-600">{h.name}</span>
                              </div>
                            </td>
                            <td className="px-4 py-2.5 text-xs text-slate-500">{h.id}</td>
                            <td className="px-4 py-2.5 text-xs">
                              <span className="text-slate-400">钻石<span className="ml-1.5 text-slate-700 font-medium">{h.diamondCurrent}/{h.diamondGoal}</span></span>
                              <span className="text-slate-400 mx-3">时长<span className="ml-1.5 text-slate-700 font-medium">{h.hourCurrent}/{h.hourGoal}h</span></span>
                              <span className="text-slate-400">天数<span className="ml-1.5 text-slate-700 font-medium">{h.dayCurrent}/{h.dayGoal}d</span></span>
                            </td>
                            <td className="px-4 py-2.5">{h.targetMet ? <span className="inline-flex text-xs px-2 py-0.5 rounded-full font-medium bg-white text-slate-800 border border-gray-200">是</span> : <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-slate-100 text-slate-400">否</span>}</td>
                            <td className="px-4 py-2.5">
                              {h.prediction === 'pass' ? (
                                <span className="inline-flex text-xs px-2 py-0.5 rounded-full font-medium bg-white text-slate-800 border border-gray-200">预测稳过</span>
                              ) : (
                                <span className="inline-flex text-xs px-2 py-0.5 rounded-full font-medium bg-rose-50/50 text-rose-700 border border-rose-100/60">预测未达标</span>
                              )}
                            </td>
                            <td className="px-4 py-2.5 border-l border-[#E8E8E8]">
                              <button onClick={() => {/* remove from targets */}} className="text-xs px-2.5 py-1 rounded-md bg-[#F2F2F2] text-slate-500 hover:bg-[#E6E6E6] transition-colors font-medium">删除</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {sent && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
              className="absolute inset-0 bg-white/95 flex items-center justify-center rounded-2xl">
              <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'tween', ease: 'easeInOut', duration: 0.3 }} className="text-center">
                <div className="w-14 h-14 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-2.5"><Send className="w-6 h-6 text-emerald-500" /></div>
                <p className="text-sm font-semibold text-emerald-600">批量催播已发送！</p>
                <p className="text-xs text-slate-400 mt-1">已触达 {activeTargets.length} 位主播</p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
