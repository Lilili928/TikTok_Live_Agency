import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Send, Loader2 } from 'lucide-react';
import { aiPresetCommands } from '../../data/mockData';

export default function AICopilotChat({ onPresetSelect }) {
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [typingText, setTypingText] = useState('');
  const [messages, setMessages] = useState([]);
  const inputRef = useRef(null);

  const genResponse = (msg) => {
    if (msg.includes('端午') || msg.includes('3万')) return `✅ 已收到指令！正在为你自动配置"端午粽情·开播狂欢礼"活动：\n\n📋 自动配置清单：\n• 活动命名：端午粽情·开播狂欢礼\n• 主播圈选：近期开播低迷组 (24人) + 高潜力新秀组 (12人)\n• Stage 1 指标：💎1,200钻 · ⏱️20小时 · 📅8天\n• 奖励预算：¥30,000 钻 (含税)\n• ROI 预测：+24% 利润率，预计总流水 ¥87,000\n\n🔧 左侧表单已自动填充完成，右侧沙盘已同步更新。请审阅并调整！`;
    if (msg.includes('新主播') || msg.includes('1.5万')) return `✅ 已配置"新星闪耀·冷启动激励"活动：\n\n• 圈选：高潜力新秀组 (12人)\n• Stage 1 门槛：💎500钻 · ⏱️10小时 · 📅5天\n• ROI 预测：+32% 利润率\n\n左侧表单已填妥，请检查！`;
    return `✅ 收到指令！已根据"${msg.slice(0, 20)}..."自动配置活动参数。左侧表单已填充，右侧ROI沙盘已更新，请审核。`;
  };

  const handleSend = (text) => {
    const msg = text || input;
    if (!msg.trim()) return;
    setMessages(prev => [...prev, { role: 'user', text: msg }]);
    setInput(''); setTyping(true); setTypingText('');
    const resp = genResponse(msg);
    let idx = 0;
    const timer = setInterval(() => {
      if (idx < resp.length) { setTypingText(resp.slice(0, idx + 1)); idx++; }
      else { clearInterval(timer); setTyping(false); setMessages(prev => [...prev, { role: 'ai', text: resp }]); setTypingText(''); onPresetSelect(msg); }
    }, 12);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-5 h-5 text-violet-500" />
          <span className="text-sm font-semibold text-slate-800">AI Copilot 极速配置</span>
        </div>
        <button className="border border-gray-200 text-slate-600 rounded-md py-1 px-3 text-xs hover:bg-gray-50 transition-colors">选择模板</button>
      </div>

      <AnimatePresence>
        {messages.length > 0 && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            transition={{ type: 'tween', ease: 'easeInOut', duration: 0.25 }}
            className="mb-2.5 space-y-1.5 max-h-44 overflow-y-auto scrollbar-thin">
            {messages.map((m, i) => (
              <div key={i} className={`text-sm p-2 rounded-lg ${m.role === 'user' ? 'bg-teal-50 text-teal-700 ml-8' : 'bg-slate-50 text-slate-600 mr-4'}`}>{m.text}</div>
            ))}
            {typing && (
              <div className="text-sm p-2 rounded-lg bg-slate-50 text-slate-600 mr-4">
                {typingText}<span className="inline-block w-0.5 h-3 bg-tiktok-teal animate-pulse ml-0.5" />
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-wrap gap-1 mb-2.5">
        {aiPresetCommands.map(cmd => (
          <button key={cmd.value} onClick={() => handleSend(cmd.label)} disabled={typing}
            className="text-xs px-2 py-1 rounded-md bg-slate-50 border border-slate-200 text-slate-500 hover:border-teal-300 hover:text-teal-600 transition-colors disabled:opacity-50">{cmd.label}</button>
        ))}
      </div>

      <div className="relative">
        <textarea ref={inputRef} value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }} disabled={typing}
          placeholder="描述你的活动需求，AI 自动填单..."
          rows={3}
          className="w-full bg-slate-50 border border-slate-200 rounded-lg py-3 pl-4 pr-[44px] pb-[44px] text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:border-violet-300 transition-colors disabled:opacity-50 resize-none h-auto"
          style={{ minHeight: 'auto' }} />
        <button onClick={() => handleSend()} disabled={typing || !input.trim()}
          className="absolute right-4 bottom-4 w-7 h-7 flex items-center justify-center rounded-md bg-violet-600 text-white hover:bg-violet-700 transition-colors disabled:opacity-50">
          {typing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
        </button>
      </div>
    </div>
  );
}
