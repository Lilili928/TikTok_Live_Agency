import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { X, Send, Sparkles, Copy, Check, Loader2, Settings } from 'lucide-react';

function getDefaultTags(host) {
  const hourGap = Math.max(0, host.hourGoal - host.hourCurrent);
  const dayGap = Math.max(0, host.dayGoal - host.dayCurrent);
  const diamondGap = Math.max(0, host.diamondGoal - host.diamondCurrent);
  const parts = [];
  if (hourGap > 0) parts.push(`${hourGap} 小时`);
  if (dayGap > 0) parts.push(`${dayGap} 天`);
  if (diamondGap > 0 && hourGap === 0) parts.push(`${diamondGap.toLocaleString()} 钻`);
  const gapText = parts.length > 0 ? `还差 ${parts.join(' 和 ')}` : '距离目标很近';
  return [gapText, '准备了激励方案', '任何问题联系我们'];
}

const API_KEY = import.meta.env.VITE_DEEPSEEK_API_KEY;
const API_URL = 'https://api.deepseek.com/v1/chat/completions';

function buildSystemPrompt(host, userPoints) {
  const diamondGap = Math.max(0, host.diamondGoal - host.diamondCurrent);
  const hourGap = Math.max(0, host.hourGoal - host.hourCurrent);
  const dayGap = Math.max(0, host.dayGoal - host.dayCurrent);
  const gaps = [];
  if (diamondGap > 0) gaps.push(`还差 ${diamondGap.toLocaleString()} 钻`);
  if (hourGap > 0) gaps.push(`还差 ${hourGap} 小时`);
  if (dayGap > 0) gaps.push(`还差 ${dayGap} 天`);
  const gapDesc = gaps.length > 0 ? gaps.join('，') : '已达成目标';

  return `你是一个专业的运营人员，说话要精炼、专业，不要啰嗦。需要催主播"${host.name}"抓紧开播冲刺。关键信息：本赛段即将到期，${gapDesc}，激励主播尽快完成直播任务拿奖励。以主播名字开头，文案控制在2-3句话以内，最后加一个合适的emoji。注意：必须是一段完整连贯的自然段落，不要有任何换行、分段或项目符号。`;
}

async function callDeepSeek(systemPrompt, userMessage) {
  if (!API_KEY) {
    console.warn('VITE_DEEPSEEK_API_KEY not set — using mock fallback');
    await new Promise(r => setTimeout(r, 1200 + Math.random() * 800));
    const name = '主播';
    return `${name}，活动倒计时中，距离目标只差最后一步了，专属激励已就位，今晚开播冲刺一下吧！💪`;
  }

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${API_KEY}` },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage || '请生成催播话术' },
      ],
      temperature: 0.8,
      max_tokens: 600,
    }),
  });
  if (!response.ok) throw new Error(`DeepSeek API error: ${response.status}`);
  const data = await response.json();
  return data.choices[0].message.content;
}

export default function AIPushModal({ host, onClose }) {
  // tags state
  const [tags, setTags] = useState(() => getDefaultTags(host));
  const [isAdding, setIsAdding] = useState(false);
  const [newTagText, setNewTagText] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const inputRef = useRef(null);

  // modal state
  const [script, setScript] = useState('');
  const [editable, setEditable] = useState('');
  const [loading, setLoading] = useState(false);
  const [polishing, setPolishing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  // Focus input when expanding
  useEffect(() => {
    if (isAdding && inputRef.current) inputRef.current.focus();
  }, [isAdding]);

  const handleGenerate = useCallback(async () => {
    setLoading(true);
    try {
      const points = editable.trim() || '无特殊要点';
      const result = await callDeepSeek(buildSystemPrompt(host, points), points);
      setScript(result);
      setEditable(result);
    } catch (e) { console.error(e); }
    setLoading(false);
  }, [host, editable]);

  const handlePolish = useCallback(async () => {
    if (!editable.trim()) return;
    setPolishing(true);
    try {
      const result = await callDeepSeek(buildSystemPrompt(host, editable), editable);
      setScript(result);
      setEditable(result);
    } catch (e) { console.error(e); }
    setPolishing(false);
  }, [editable, host]);

  const handleCopy = () => { navigator.clipboard.writeText(editable); setCopied(true); setTimeout(() => setCopied(false), 1500); };
  const handleSend = async () => { setSending(true); await new Promise(r => setTimeout(r, 1500)); setSending(false); setSent(true); setTimeout(onClose, 2000); };

  const addTag = () => {
    const trimmed = newTagText.trim();
    if (trimmed && tags.length < 10) {
      setTags(prev => [...prev, trimmed]);
      setEditable(prev => prev + (prev ? '，' : '') + trimmed + '，');
    }
    setNewTagText('');
    setIsAdding(false);
  };

  const removeTag = (tagToRemove) => {
    setTags(prev => prev.filter(t => t !== tagToRemove));
    setEditable(prev => prev.replace(new RegExp(tagToRemove + '，?', 'g'), '').replace(/，$/, '').trim());
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ type: 'tween', ease: 'easeInOut', duration: 0.2 }}
      className="fixed inset-0 bg-black/25 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ opacity: 0, y: 12, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -12, scale: 0.97 }}
        transition={{ type: 'tween', ease: 'easeInOut', duration: 0.25 }}
        onClick={e => e.stopPropagation()}
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
              <p className="text-xs text-slate-400 mt-0.5">给 {host.name} 的个性化话术</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-700"><X className="w-5 h-5" /></button>
        </div>

        {/* Data Gap */}
        <div className="px-6 py-3 bg-[#F2F2F2] border-b border-[#E8E8E8]">
          <div className="flex items-center gap-5 text-xs">
            <span className="text-slate-400">钻石<span className="ml-1.5 text-slate-700 font-medium">{host.diamondCurrent}/{host.diamondGoal}</span></span>
            <span className="text-slate-400">时长<span className="ml-1.5 text-slate-700 font-medium">{host.hourCurrent}/{host.hourGoal}h</span></span>
            <span className="text-slate-400">天数<span className="ml-1.5 text-slate-700 font-medium">{host.dayCurrent}/{host.dayGoal}d</span></span>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
          {/* Header row */}
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-3">
              <span className="text-xs font-medium text-slate-700">催播话术</span>
              {editable && <button onClick={() => { setEditable(''); setScript(''); }} className="text-xs text-slate-400 hover:text-slate-600 transition-colors">清空</button>}
            </div>
            <div className="flex items-center gap-2">
              {loading ? (
                <span className="text-xs flex items-center gap-1 text-violet-500"><Loader2 className="w-2.5 h-2.5 animate-spin" />AI 生成中...</span>
              ) : polishing ? (
                <span className="text-xs flex items-center gap-1 text-violet-500"><Loader2 className="w-2.5 h-2.5 animate-spin" />润色中...</span>
              ) : !editable.trim() ? (
                <button onClick={handleGenerate} className="flex items-center gap-1 text-xs text-violet-600 hover:text-violet-700 transition-colors font-medium"><Sparkles className="w-3 h-3" />AI 生成</button>
              ) : (
                <button onClick={handlePolish} className="flex items-center gap-1 text-xs text-violet-600 hover:text-violet-700 transition-colors font-medium"><Sparkles className="w-3 h-3" />AI 润色</button>
              )}
            </div>
          </div>

          {/* Textarea */}
          <div className="relative flex-1">
            <textarea
              value={editable}
              onChange={e => setEditable(e.target.value)}
              className="w-full h-full bg-violet-50/30 border border-[#E8E8E8] rounded-xl p-3.5 pb-10 text-sm text-slate-700 leading-relaxed resize-none focus:outline-none focus:border-violet-300"
              placeholder={loading ? '✨ DeepSeek AI 正在全力生成中...' : '输入或选择常用语，一键生成催播话术…'}
            />

            {/* Tags area */}
            <div className="absolute bottom-3 left-3 right-3">
              <Reorder.Group axis="x" values={tags} onReorder={setTags} as="div" className="flex flex-wrap items-center gap-1.5">
                <AnimatePresence mode="popLayout">
                  {tags.map(tag => (
                    <Reorder.Item key={tag} value={tag} as="div" layout className="relative">
                      <motion.div layout>
                        <button
                          onClick={() => {
                            if (isEditing) {
                              removeTag(tag);
                            } else if (editable.includes(tag)) {
                              setEditable(prev => prev.replace(new RegExp(tag + '，?', 'g'), '').replace(/，$/, '').trim());
                            } else {
                              const suffix = editable && !editable.endsWith('，') ? '，' : '';
                              setEditable(prev => prev + suffix + tag + '，');
                            }
                          }}
                          className={`text-xs px-2.5 h-6 flex items-center rounded-full border transition-colors select-none ${
                            isEditing
                              ? 'bg-rose-50 border-rose-200 text-rose-500 cursor-pointer'
                              : editable.includes(tag)
                                ? 'bg-violet-50 border-violet-300 text-violet-600'
                                : 'bg-gray-50 border-gray-200 text-slate-600 hover:border-violet-300 hover:text-violet-600 cursor-grab active:cursor-grabbing'
                          }`}
                        >
                          {tag}
                          {isEditing && <span className="ml-1 text-rose-400">&times;</span>}
                        </button>
                      </motion.div>
                    </Reorder.Item>
                  ))}
                  {/* + button */}
                  <motion.div key="plus-btn" layout>
                    {isAdding ? (
                      <motion.div layout initial={{ width: 28 }} animate={{ width: 140 }} transition={{ type: 'spring', stiffness: 300, damping: 25 }}>
                        <input
                          ref={inputRef}
                          type="text"
                          value={newTagText}
                          onChange={e => setNewTagText(e.target.value.slice(0, 20))}
                          onKeyDown={e => { if (e.key === 'Enter') addTag(); if (e.key === 'Escape') { setIsAdding(false); setNewTagText(''); } }}
                          onBlur={() => { if (!newTagText.trim()) { setIsAdding(false); setNewTagText(''); } }}
                          placeholder="输入标签，回车添加"
                          className="w-full h-6 px-3 text-xs bg-white border border-violet-300 rounded-full focus:outline-none focus:border-violet-500 placeholder-slate-400"
                        />
                      </motion.div>
                    ) : (
                      <button
                        onClick={() => setIsAdding(true)}
                        className="w-6 h-6 flex items-center justify-center bg-gray-50 border border-gray-200 rounded-full text-slate-400 hover:text-slate-600 hover:bg-gray-100 transition-all cursor-pointer leading-none"
                      >
                        <span className="text-sm -mt-px">+</span>
                      </button>
                    )}
                  </motion.div>
                  {/* Settings button */}
                  <motion.div key="settings-btn" layout>
                    <button
                      onClick={() => setIsEditing(!isEditing)}
                      className={`w-6 h-6 flex items-center justify-center rounded-full border transition-all cursor-pointer leading-none ${
                        isEditing
                          ? 'bg-violet-100 border-violet-300 text-violet-600'
                          : 'bg-gray-50 border-gray-200 text-slate-400 hover:text-slate-600 hover:bg-gray-100'
                      }`}
                    >
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
            <button onClick={handleSend} disabled={loading || sending || sent} className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-violet-600 text-white text-sm font-medium hover:bg-violet-700 transition-colors disabled:opacity-50">
              {sent ? <><Check className="w-3 h-3" />已发送</> : sending ? <><Loader2 className="w-3 h-3 animate-spin" />发送中...</> : <><Send className="w-3 h-3" />确认发送</>}
            </button>
          </div>
        </div>

        {/* Success overlay */}
        <AnimatePresence>
          {sent && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
              className="absolute inset-0 bg-white/95 flex items-center justify-center rounded-2xl">
              <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'tween', ease: 'easeInOut', duration: 0.3 }} className="text-center">
                <div className="w-14 h-14 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-2.5"><Send className="w-6 h-6 text-emerald-500" /></div>
                <p className="text-sm font-semibold text-emerald-600">催播已发送！</p>
                <p className="text-xs text-slate-400 mt-1">已通过飞书/WhatsApp 触达主播</p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </motion.div>
    </motion.div>
  );
}
