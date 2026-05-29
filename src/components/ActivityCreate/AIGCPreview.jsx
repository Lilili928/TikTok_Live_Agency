import { useState } from 'react';
import { motion } from 'framer-motion';
import { Image, MessageSquare, Globe, Copy, Check, Send, Sparkles, Download, Eye, ArrowLeft, Loader2 } from 'lucide-react';

const fadeIn = { initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 }, transition: { type: 'tween', ease: 'easeInOut', duration: 0.25 } };

export default function AIGCPreview({ formData, onBack }) {
  const [copied, setCopied] = useState(false);
  const [published, setPublished] = useState(false);
  const [publishing, setPublishing] = useState(false);

  const copyText = `🎉【${formData.name || '夏日直播盛典'}】火热开启！\n\n🏆 赛段 1 任务：集齐 ${formData.stage1Diamond || 1000}💎 / 直播 ${formData.stage1Hours || 20} 小时 / ${formData.stage1Days || 8} 天达标即可瓜分奖池！\n\n🎁 Stage 1 奖励：${formData.rewardStage1 || 500} 钻石\n🏅 Stage 2 排名赛：前 10 名额外 ${formData.rewardStage2 || 1000} 钻石\n\n⏰ 活动时间：${formData.startDate || '2026-06-01'} — ${formData.endDate || '2026-06-21'}\n\n📲 现在开播，奖励不停！详情请查看公会公告 👇`;

  const handleCopy = () => { navigator.clipboard.writeText(copyText); setCopied(true); setTimeout(() => setCopied(false), 1500); };
  const handlePublish = async () => { setPublishing(true); await new Promise(r => setTimeout(r, 2000)); setPublishing(false); setPublished(true); };

  return (
    <div className="space-y-5">
      <button onClick={onBack} className="flex items-center gap-1 text-sm text-slate-400 hover:text-slate-600 transition-colors">
        <ArrowLeft className="w-3 h-3" />返回编辑表单
      </button>

      <div className="flex items-center gap-1.5 text-xs">
        <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-400 flex items-center justify-center text-xs">1</span>
        <span className="text-slate-400">活动配置表单</span><span className="text-slate-300">→</span>
        <span className="w-5 h-5 rounded-full bg-slate-800 text-white flex items-center justify-center text-xs font-bold">2</span>
        <span className="font-medium text-slate-800">AI预览与宣发</span>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* Poster */}
        <motion.div {...fadeIn} transition={{ ...fadeIn.transition, delay: 0.05 }} className="glass-card p-4 space-y-3">
          <div className="flex items-center gap-1.5"><Image className="w-3.5 h-3.5 text-slate-400" /><h3 className="text-sm font-semibold text-slate-800">AIGC 规则海报</h3></div>
          <div className="aspect-[3/4] rounded-lg bg-gradient-to-b from-white to-slate-50 border border-slate-200 p-4 flex flex-col justify-between relative overflow-hidden">
            <div>
              <div className="flex items-center gap-1 mb-2"><Sparkles className="w-3.5 h-3.5 text-rose-400" /><span className="text-xs text-rose-400 uppercase tracking-wider font-medium">TikTok Live Agency</span></div>
              <h2 className="text-base font-bold text-slate-800">{formData.name || '夏日直播盛典'}</h2>
              <div className="mt-3 space-y-1.5">
                {[{ l: '钻石目标', v: `${formData.stage1Diamond || 1000} 💎` },{ l: '直播时长', v: `${formData.stage1Hours || 20} 小时` },{ l: '开播天数', v: `${formData.stage1Days || 8} 天` }].map(i => (
                  <div key={i.l} className="flex items-center justify-between text-xs"><span className="text-slate-400">{i.l}</span><span className="font-semibold text-slate-700">{i.v}</span></div>
                ))}
              </div>
            </div>
            <div className="text-center"><div className="text-xs text-slate-400">{formData.startDate} — {formData.endDate}</div></div>
          </div>
          <button className="w-full flex items-center justify-center gap-1 py-1.5 rounded-lg bg-slate-100 text-slate-500 text-sm hover:bg-slate-200 transition-colors"><Download className="w-3 h-3" />下载海报</button>
        </motion.div>

        {/* Copy */}
        <motion.div {...fadeIn} transition={{ ...fadeIn.transition, delay: 0.1 }} className="glass-card p-4 space-y-3">
          <div className="flex items-center gap-1.5"><MessageSquare className="w-3.5 h-3.5 text-slate-400" /><h3 className="text-sm font-semibold text-slate-800">AI 群发文案</h3></div>
          <div className="bg-slate-50 rounded-lg p-3.5 border border-slate-100 min-h-[260px]">
            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">{copyText}</p>
          </div>
          <div className="flex gap-1.5">
            <button onClick={handleCopy} className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-slate-100 text-slate-600 text-sm hover:bg-slate-200 transition-colors font-medium">
              {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}{copied ? '已复制' : '一键复制'}
            </button>
            <button className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-500 text-sm hover:bg-slate-200 transition-colors">修改文案</button>
          </div>
        </motion.div>

        {/* H5 */}
        <motion.div {...fadeIn} transition={{ ...fadeIn.transition, delay: 0.15 }} className="glass-card p-4 space-y-3">
          <div className="flex items-center gap-1.5"><Globe className="w-3.5 h-3.5 text-slate-400" /><h3 className="text-sm font-semibold text-slate-800">H5 规则落地页</h3></div>
          <div className="aspect-[9/16] rounded-lg bg-white border border-slate-200 overflow-hidden">
            <div className="h-6 bg-slate-100 flex items-center justify-center border-b border-slate-200">
              <div className="flex gap-1"><div className="w-1 h-1 rounded-full bg-slate-300" /><div className="w-1 h-1 rounded-full bg-slate-300" /><div className="w-1 h-1 rounded-full bg-slate-300" /></div>
            </div>
            <div className="p-3 space-y-2">
              <div className="h-2 bg-slate-200 rounded w-3/4" /><div className="h-2 bg-slate-200 rounded w-1/2" />
              {[1,2,3].map(i => (<div key={i} className="h-6 bg-slate-100 rounded flex items-center px-2 gap-1.5"><div className="w-3 h-3 rounded bg-slate-200" /><div className="h-1.5 bg-slate-200 rounded w-1/2" /></div>))}
              <div className="h-20 bg-slate-100 rounded" />
            </div>
          </div>
          <button className="w-full flex items-center justify-center gap-1 py-1.5 rounded-lg bg-slate-100 text-slate-500 text-sm hover:bg-slate-200 transition-colors"><Eye className="w-3 h-3" />预览 H5</button>
        </motion.div>
      </div>

      {/* Publish */}
      <div className="flex justify-center pt-2">
        <motion.button onClick={handlePublish} disabled={publishing || published} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
          className={`px-8 py-3 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors ${
            published ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-slate-800 text-white hover:bg-slate-700'
          } disabled:opacity-70`}>
          {published ? <><Check className="w-4 h-4" />已全量触达成功！</> : publishing ? <><Loader2 className="w-4 h-4 animate-spin" />正在群发推送中...</> : <><Send className="w-4 h-4" />一键发布并群发</>}
        </motion.button>
      </div>

      {published && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'tween', ease: 'easeInOut', duration: 0.3 }} className="text-center pb-4">
          <div className="inline-flex items-center gap-2 text-emerald-600 bg-emerald-50 px-4 py-2 rounded-full text-sm border border-emerald-200">
            <Sparkles className="w-3.5 h-3.5" />海报 · 文案 · H5 页面已全量发布
          </div>
        </motion.div>
      )}
    </div>
  );
}
