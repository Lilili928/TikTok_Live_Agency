import { useState } from 'react';
import { motion } from 'framer-motion';
import { Image, MessageSquare, Globe, Copy, Check, Send, Sparkles, Download, Eye, ArrowLeft, Loader2, PenLine } from 'lucide-react';
import { callDeepSeek } from '../../utils/deepseek';

const fadeIn = { initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 }, transition: { type: 'tween', ease: 'easeInOut', duration: 0.25 } };

export default function AIGCPreview({ formData, onBack }) {
  const [copied, setCopied] = useState(false);
  const [published, setPublished] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [posterRatio, setPosterRatio] = useState('3:4');

  const copyText = `🎉【${formData.name || '夏日直播盛典'}】火热开启！\n\n🏆 赛段 1 任务：集齐 ${formData.stage1Diamond || 1000}💎 / 直播 ${formData.stage1Hours || 20} 小时 / ${formData.stage1Days || 8} 天达标即可瓜分奖池！\n\n🎁 Stage 1 奖励：${formData.rewardStage1 || 500} 钻石\n🏅 Stage 2 排名赛：前 10 名额外 ${formData.rewardStage2 || 1000} 钻石\n\n⏰ 活动时间：${formData.startDate || '2026-06-01'} — ${formData.endDate || '2026-06-21'}\n\n📲 现在开播，奖励不停！详情请查看公会公告 👇`;

  const [copyTextState, setCopyTextState] = useState(copyText);
  const [isPolishingCopy, setIsPolishingCopy] = useState(false);
  const [isEditingCopy, setIsEditingCopy] = useState(false);

  const handleAIPolishCopy = async () => {
    if (isPolishingCopy) return;
    setIsPolishingCopy(true);
    try {
      const sp = 'You are a Douyin Live operations copywriter. Polish the following campaign copy to be more engaging, professional, and appealing to streamers. Keep the same structure and information. Output ONLY the polished copy text. No markdown. No explanation.';
      const polished = await callDeepSeek(sp, copyTextState);
      if (polished?.trim()) setCopyTextState(polished.trim());
    } catch (e) { console.error('Copy polish failed:', e); }
    finally { setIsPolishingCopy(false); }
  };

  const handleCopy = () => { navigator.clipboard.writeText(copyTextState); setCopied(true); setTimeout(() => setCopied(false), 1500); };
  const handlePublish = async () => { setPublishing(true); await new Promise(r => setTimeout(r, 2000)); setPublishing(false); setPublished(true); };

  return (
    <div className="space-y-9">
      <div className="max-w-7xl mx-auto">
        <button onClick={onBack} className="flex items-center gap-1 text-sm text-slate-400 hover:text-slate-600 transition-colors -ml-[40px]">
          <ArrowLeft className="w-4 h-4" />返回编辑表单
        </button>

        <div className="flex gap-6 justify-center mt-5">
        {/* Poster Card */}
        <motion.div {...fadeIn} transition={{ ...fadeIn.transition, delay: 0.05 }}
          className="glass-card rounded-2xl p-5 h-[560px] shrink-0 flex flex-col w-[364px]">
          {/* Header */}
          <div className="flex items-center justify-between shrink-0 mb-4 pl-1">
            <h3 className="text-base font-semibold text-slate-800">AIGC 规则海报</h3>
            <div className="flex items-center bg-slate-100 rounded-md p-0.5">
              {['3:4', '9:16'].map(r => (
                <button key={r} onClick={() => setPosterRatio(r)}
                  className={`text-xs px-2.5 py-1 rounded transition-colors ${
                    (r === '3:4' ? posterRatio === '3:4' : posterRatio === '9:16') ? 'bg-white text-slate-800 shadow-sm font-medium' : 'text-slate-400 hover:text-slate-600'
                  }`}>{r}</button>
              ))}
            </div>
          </div>
          {/* Content — fill */}
          <div className="flex-1 flex justify-center min-h-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <div className="w-full h-full rounded-lg bg-gradient-to-b from-white to-slate-50 border border-slate-200 py-4 px-5 flex flex-col justify-between relative overflow-hidden">
              <div>
                <div className="flex items-center gap-1 mb-2"><Sparkles className="w-3.5 h-3.5 text-rose-400" /><span className="text-sm text-rose-400 uppercase tracking-wider font-medium">TikTok Live Agency</span></div>
                <h2 className="text-base font-bold text-slate-800">{formData.name || '夏日直播盛典'}</h2>
                <div className="mt-6 space-y-1.5">
                  {[{ l: '钻石目标', v: `${formData.stage1Diamond || 1000} 💎` },{ l: '直播时长', v: `${formData.stage1Hours || 20} 小时` },{ l: '开播天数', v: `${formData.stage1Days || 8} 天` }].map(i => (
                    <div key={i.l} className="flex items-center justify-between text-sm"><span className="text-slate-400">{i.l}</span><span className="font-semibold text-slate-700">{i.v}</span></div>
                  ))}
                </div>
              </div>
              <div className="text-center"><div className="text-xs text-slate-400">{formData.startDate} — {formData.endDate}</div></div>
            </div>
          </div>
          {/* Bottom button */}
          <div className="h-[32px] shrink-0 flex items-center justify-center mt-4">
            <button className="w-full h-[32px] flex items-center justify-center gap-2 rounded-lg bg-slate-100 text-slate-600 text-sm hover:bg-slate-200 transition-colors font-medium"><Download className="w-4 h-4" />下载海报</button>
          </div>
        </motion.div>

        {/* Copy Card */}
        <motion.div {...fadeIn} transition={{ ...fadeIn.transition, delay: 0.1 }}
          className="glass-card rounded-2xl p-5 w-[364px] h-[560px] shrink-0 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between shrink-0 mb-4 pl-1">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-semibold text-slate-800">AI 群发文案</h3>
            </div>
            <div className="flex items-center gap-3 pr-1">
              <button onClick={() => setIsEditingCopy(!isEditingCopy)}
                className={`flex items-center gap-1 text-sm transition-colors ${isEditingCopy ? 'text-[#34C2C1] font-medium' : 'text-slate-400 hover:text-slate-600'}`}>
                <PenLine className="w-3.5 h-3.5" />{isEditingCopy ? '完成' : '编辑'}
              </button>
              <button onClick={handleAIPolishCopy} disabled={isPolishingCopy}
                className="flex items-center gap-1 text-sm text-[#2CB4C1] hover:text-[#249ea8] transition-colors disabled:opacity-50">
                <Sparkles className="w-3.5 h-3.5" />{isPolishingCopy ? '润色中' : 'AI润色'}
              </button>
            </div>
          </div>
          {/* Content — fill */}
          <div className="flex-1 overflow-y-auto min-h-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <div className="bg-slate-50 rounded-lg py-4 px-5 border border-slate-100 h-full">
              {isEditingCopy ? (
                <textarea value={copyTextState} onChange={e => setCopyTextState(e.target.value)}
                  className="w-full h-full bg-transparent resize-none outline-none text-sm text-slate-600 leading-relaxed" />
              ) : (
                <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">{copyTextState}</p>
              )}
            </div>
          </div>
          {/* Bottom button */}
          <div className="h-[32px] shrink-0 flex items-center mt-4">
            <button onClick={handleCopy} className="w-full h-[32px] flex items-center justify-center gap-2 rounded-lg bg-slate-100 text-slate-600 text-sm hover:bg-slate-200 transition-colors font-medium">
              {copied ? <Check className="w-3.5 h-3.5 text-slate-600" /> : <Copy className="w-3.5 h-3.5" />}{copied ? '已复制' : '一键复制'}
            </button>
          </div>
        </motion.div>

        {/* H5 Card */}
        <motion.div {...fadeIn} transition={{ ...fadeIn.transition, delay: 0.15 }}
          className="glass-card rounded-2xl p-5 w-[364px] h-[560px] shrink-0 flex flex-col">
          {/* Header */}
          <div className="flex items-center gap-2 shrink-0 mb-4 pl-1">
            <h3 className="text-base font-semibold text-slate-800">H5 规则落地页</h3>
          </div>
          {/* Content — fill */}
          <div className="flex-1 flex justify-center min-h-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <div className="aspect-[9/16] h-full rounded-lg bg-white border border-slate-200 overflow-hidden">
              <div className="h-6 bg-slate-100 flex items-center justify-center border-b border-slate-200">
                <div className="flex gap-1"><div className="w-1 h-1 rounded-full bg-slate-300" /><div className="w-1 h-1 rounded-full bg-slate-300" /><div className="w-1 h-1 rounded-full bg-slate-300" /></div>
              </div>
              <div className="p-3 space-y-2">
                <div className="h-2 bg-slate-200 rounded w-3/4" /><div className="h-2 bg-slate-200 rounded w-1/2" />
                {[1,2,3].map(i => (<div key={i} className="h-6 bg-slate-100 rounded flex items-center px-2 gap-1.5"><div className="w-4 h-4 rounded bg-slate-200" /><div className="h-1.5 bg-slate-200 rounded w-1/2" /></div>))}
                <div className="h-20 bg-slate-100 rounded" />
              </div>
            </div>
          </div>
          {/* Bottom button */}
          <div className="h-[32px] shrink-0 flex items-center justify-center mt-4">
            <button className="w-full h-[32px] flex items-center justify-center gap-2 rounded-lg bg-slate-100 text-slate-600 text-sm hover:bg-slate-200 transition-colors font-medium"><Eye className="w-4 h-4" />预览 H5</button>
          </div>
        </motion.div>
      </div>

        {/* Publish */}
        <div className="flex justify-center pt-9">
          <motion.button onClick={handlePublish} disabled={publishing || published} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
            className={`h-9 pl-4 pr-5 rounded-md text-white text-base font-medium transition-all flex items-center gap-2 ${
              'bg-[#34c2c1] hover:bg-[#2da9a8]'
            } disabled:opacity-70`}>
            {published ? <><Check className="w-4 h-4" />发布成功</> : publishing ? <><Loader2 className="w-3.5 h-3.5 animate-spin" />发布中...</> : <><Send className="w-3.5 h-3.5" />一键发布</>}
          </motion.button>
        </div>

      </div>
    </div>
  );
}
