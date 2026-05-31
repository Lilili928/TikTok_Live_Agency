import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Send, Loader2, CheckCircle2, RotateCcw, PenLine } from 'lucide-react';
import { callDeepSeek } from '../../utils/deepseek';

const DEEPSEEK_KEY = '';

const SYSTEM_PROMPT = `You are a highly experienced Douyin (TikTok) Live Streamer Operations Expert.
Your task is to design a highly professional streamer incentive campaign based on the user's raw requirements.

CRITICAL: Output strictly in JSON format. Do not wrap in \`\`\`json. Must be directly parseable by JSON.parse().

JSON SCHEMA:
{
  "basicInfo": {
    "activityName": "string",
    "visibleRange": "private" | "public" | "association_only",
    "streamerSelection": { "type": "rule" | "username" | "all", "rules": ["string"] },
    "needRegistration": boolean
  },
  "stages": [{
    "gameplayMode": "target" | "ranking",
    "taskType": "custom" | "streamer_growth" | "streamer_active",
    "indicators": [{ "name": "string", "phases": [number] }],
    "competitionDates": ["YYYY-MM-DD", "YYYY-MM-DD"]
  }],
  "rewards": [{ "stageIndex": 0, "condition": "string", "rewardContent": "string" }]
}`;

const DEFAULT_HISTORY = [
  '端午腰部主播促活，预算3万钻',
  '新主播冷启动激励，预算1.5万钻',
  '头部主播冲榜赛，预算5万钻',
  '全员开播时长激励，预算2万钻',
  '新晋主播成长激励，预算8千钻',
  '儿童节联名直播活动，预算1万钻',
  '周末冲刺PK赛，预算6千钻',
];

/* ── Dynamic CoT text generator ── */
function generateDynamicCoTTexts(input) {
  const budgetMatch = input.match(/(\d+\.?\d*)万/);
  const budget = budgetMatch ? `${budgetMatch[0]}` : '合理预算';
  const isDuanwu = input.includes('端午');
  const isNewStreamer = input.includes('新主播') || input.includes('新晋');
  const isHead = input.includes('头部');
  const targetGroup = isHead ? '头部大主播' : isNewStreamer ? '新签约主播' : '活跃腰部主播';
  const theme = isDuanwu ? '端午黄金周' : '本月运营周期';

  return {
    step1: '基本信息分析',
    step1Desc: `分析${theme}流量走势，定向筛查公会${targetGroup}基础表现…`,
    step2: '活动赛段设计',
    step2Desc: `规划专属赛道，对齐${budget}预算，设计多阶段梯度挑战任务…`,
    step3: '主播奖励设计',
    step3Desc: '精准测算ROI利润率方案，匹配千川流量券、专属推荐位与流水分成奖励…',
    step4Loading: '正在填表…',
    step4LoadingDesc: '正在同步赛段指标与规则，自动填充活动表单配置…',
    step4Done: '填单完成，快去看看吧！',
    step4DoneDesc: '表单数据已全部配置成功，快去右侧看看成果吧！',
    successBanner: `✨ 已成功为您配置活动：${isDuanwu ? '端午促活计划' : isNewStreamer ? '新星成长计划' : isHead ? '头部冲榜计划' : '直播激励计划'}`,
  };
}

/* ── TypewriterText component ── */
function TypewriterText({ text, delay = 25, onDone }) {
  const [chars, setChars] = useState(0);
  useEffect(() => {
    setChars(0);
    if (!text) return;
    let i = 0;
    const timer = setInterval(() => {
      i++;
      setChars(i);
      if (i >= text.length) { clearInterval(timer); onDone?.(); }
    }, delay);
    return () => clearInterval(timer);
  }, [text, delay]);

  return <span>{text.slice(0, chars)}{chars < text.length && <span className="inline-block w-0.5 h-3 bg-slate-400 animate-pulse ml-px align-middle" />}</span>;
}

/* ── Milestone steps generator ── */
function getMilestoneSteps(coTTexts) {
  return [
    { title: coTTexts.step1, desc: coTTexts.step1Desc },
    { title: coTTexts.step2, desc: coTTexts.step2Desc },
    { title: coTTexts.step3, desc: coTTexts.step3Desc },
  ];
}

export default function AICopilotChat({ onPresetSelect, onAIConfig }) {
  const [userInput, setUserInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [thinkingStep, setThinkingStep] = useState(0);
  const [activePill, setActivePill] = useState('');
  const [history, setHistory] = useState(() => {
    try {
      const saved = localStorage.getItem('aicopilot_history');
      return saved ? JSON.parse(saved) : DEFAULT_HISTORY;
    } catch { return DEFAULT_HISTORY; }
  });
  const [coTTexts, setCoTTexts] = useState(null);
  const [successBanner, setSuccessBanner] = useState('');
  const [refinements, setRefinements] = useState([]);
  const [lastJSON, setLastJSON] = useState('');
  const inputRef = useRef(null);
  const scrollRef = useRef(null);
  const stepTimerRef = useRef(null);

  // Sync history to localStorage
  useEffect(() => { localStorage.setItem('aicopilot_history', JSON.stringify(history)); }, [history]);

  // Auto-scroll to bottom on new steps
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [thinkingStep, isSuccess, refinements, history]);

  // Cleanup timers
  useEffect(() => () => { if (stepTimerRef.current) clearInterval(stepTimerRef.current); }, []);

  const addToHistory = useCallback((msg) => {
    setHistory(prev => { const f = prev.filter(h => h !== msg); return [msg, ...f].slice(0, 6); });
  }, []);

  const clearTimers = () => { if (stepTimerRef.current) { clearInterval(stepTimerRef.current); stepTimerRef.current = null; } };

  const advanceStep = (step) => {
    setThinkingStep(step);
    return new Promise(r => setTimeout(r, 900));
  };

  const startAIAnalysis = async (input) => {
    const msg = input || userInput;
    if (!msg.trim() || isThinking) return;
    if (inputRef.current) inputRef.current.blur();

    const isRefine = isSuccess;
    addToHistory(msg);
    setActivePill(msg);
    setUserInput('');
    setIsThinking(true);
    setIsSuccess(false);
    setThinkingStep(0);

    if (isRefine) {
      setThinkingStep(4); // keep first 4 steps green
    }

    // Build messages with context for refinement
    let userPrompt = msg;
    if (isRefine && lastJSON) {
      userPrompt = `请根据我以下的补充微调要求，在上一轮生成的活动配置 JSON 的基础上进行修改，并务必输出修改/微调后的最新完整 JSON 数据，不要输出任何解释：\n\n上一轮JSON：${lastJSON}\n\n微调要求：${msg}`;
    }

    // Add refinement to array if refining
    let refId = null;
    if (isRefine) {
      refId = `${Date.now()}`;
      setRefinements(prev => [...prev, { id: refId, query: msg, status: 'loading', desc: `正在根据补充诉求："${msg.slice(0, 30)}${msg.length > 30 ? '…' : ''}"微调赛道指标与奖励配置…` }]);
    }

    // CoT stepping
    const texts = generateDynamicCoTTexts(msg);
    setCoTTexts(texts);
    setSuccessBanner(texts.successBanner);

    if (!isRefine) {
      await advanceStep(0);
      await advanceStep(1);
      await advanceStep(2);
      await advanceStep(3);
    }

    // Call DeepSeek
    try {
      const response = await callDeepSeek(SYSTEM_PROMPT, userPrompt);
      const jsonMatch = response.match(/\{[\s\S]*"basicInfo"[\s\S]*"rewards"[\s\S]*\}/);
      if (jsonMatch) {
        const jsonStr = jsonMatch[0];
        setLastJSON(jsonStr);
        const parsed = JSON.parse(jsonStr);
        setIsThinking(false);
        setIsSuccess(true);
        setThinkingStep(isRefine ? 4 : 4);
        // Update last refinement to success
        if (refId) {
          setRefinements(prev => prev.map(r => r.id === refId ? { ...r, status: 'success', desc: `活动方案已根据补充诉求"${r.query.slice(0, 30)}${r.query.length > 30 ? '…' : ''}"成功微调就绪，请核对！` } : r));
        }
        if (!isRefine) {
          setSuccessBanner(texts.successBanner.replace('✨ 已成功为您配置活动：', `✨ 已成功为您配置活动：${parsed.basicInfo?.activityName || '新活动'}`));
        }
        setTimeout(() => onAIConfig?.(parsed), 300);
      } else {
        setIsThinking(false);
        setIsSuccess(true);
        if (refId) {
          setRefinements(prev => prev.map(r => r.id === refId ? { ...r, status: 'success', desc: `活动方案已根据补充诉求"${r.query.slice(0, 30)}${r.query.length > 30 ? '…' : ''}"成功微调就绪，请核对！` } : r));
        }
      }
      onPresetSelect?.(msg);
    } catch (e) {
      console.error('AI config failed:', e);
      setIsThinking(false);
      setIsSuccess(false);
      if (refId) {
        setRefinements(prev => prev.filter(r => r.id !== refId));
      }
    }
  };

  const handleReset = () => {
    clearTimers();
    setIsThinking(false);
    setIsSuccess(false);
    setThinkingStep(0);
    setCoTTexts(null);
    setSuccessBanner('');
    setUserInput('');
    setActivePill('');
    setRefinements([]);
    setLastJSON('');
  };

  const milestoneSteps = coTTexts ? getMilestoneSteps(coTTexts) : [];
  const displayPills = (history.length > 0 ? history : DEFAULT_HISTORY).slice(0, 6).reverse();
  const isFirstTurnDone = isSuccess || refinements.length > 0;

  return (
    <div className="w-full h-[380px] flex-none flex flex-col justify-start overflow-hidden relative">
      {/* A. Title row — h-[20px] */}
      <div className="h-[20px] flex items-center justify-between shrink-0">
        <span className="text-sm font-semibold text-slate-800">一键填单</span>
        <div className="flex items-center gap-3">
          <button onClick={handleReset} className="text-xs text-slate-400 hover:text-slate-600 transition-colors flex items-center gap-1">
            <RotateCcw className="w-3 h-3" />重置
          </button>
          <button className="flex items-center gap-1 text-xs text-slate-400 hover:text-[#2CB4C1] transition-colors">
            <PenLine className="w-3.5 h-3.5" />AI解析规则
          </button>
        </div>
      </div>

      {/* B. Mid slot — flex-1 fill, mt-[20px] */}
      <div ref={scrollRef} className="flex-1 mt-[20px] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] relative flex flex-col justify-start">
        <AnimatePresence mode="wait">
          {(isThinking || isSuccess) ? (
            <motion.div key="cot" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }} transition={{ type: 'tween', ease: 'easeInOut', duration: 0.25 }}
              className="flex flex-col flex-1 min-h-0"
            >
              {/* Top spacer — pushes timeline to bottom */}
              <div className="flex-1 min-h-0" />
              {/* Timeline wrapper — shrink-0, sticks to bottom */}
              <div className="relative flex flex-col gap-3.5 pl-1 shrink-0">
                {/* Timeline connector — perfectly centered within w-4 */}
                <div className="absolute left-1 top-2 bottom-2 w-4 z-0 flex justify-center">
                  <div className="w-[1px] h-full bg-gray-200" />
                </div>

              {milestoneSteps.map((step, i) => {
                // Progressive: only render up to current step
                if (!isSuccess && i > thinkingStep) return null;
                const done = i < thinkingStep || isSuccess;
                const active = !isSuccess && i === thinkingStep;
                return (
                  <div key={i} className="relative z-10 flex items-start gap-2.5">
                    <div className="w-4 h-4 rounded-full bg-white flex items-center justify-center shrink-0 mt-0.5">
                      {done ? <CheckCircle2 className="w-4 h-4 text-slate-500" />
                       : active ? <Loader2 className="w-4 h-4 text-slate-400 animate-spin" />
                       : <div className="w-4 h-4 rounded-full border-2 border-slate-200" />}
                    </div>
                    <div className="flex flex-col items-start text-left gap-0.5 flex-1 min-w-0">
                      <p className={`text-[11px] font-semibold ${done ? 'text-slate-500' : active ? 'text-slate-800' : 'text-slate-400'}`}>
                        {step.title}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        {active ? <TypewriterText text={step.desc} /> : step.desc}
                      </p>
                    </div>
                  </div>
                );
              })}

              {/* Step 4: locked done once first turn completes */}
              {(thinkingStep >= 3 || isFirstTurnDone) && (
                <div className="relative z-10 flex items-start gap-2.5">
                  <div className="w-4 h-4 rounded-full bg-white flex items-center justify-center shrink-0 mt-0.5">
                    {isFirstTurnDone ? (
                      <CheckCircle2 className="w-4 h-4 text-slate-500" />
                    ) : (
                      <Loader2 className="w-4 h-4 text-slate-400 animate-spin" />
                    )}
                  </div>
                  <div className="flex flex-col items-start text-left gap-0.5">
                    <p className={`text-[11px] font-semibold ${isFirstTurnDone ? 'text-slate-500' : 'text-slate-500'}`}>
                      {isFirstTurnDone ? (coTTexts?.step4Done || '填单完成，快去看看吧！') : (coTTexts?.step4Loading || '正在填表…')}
                    </p>
                    <p className={`text-[11px] ${isFirstTurnDone ? 'text-slate-400' : 'text-slate-400'}`}>
                      {isFirstTurnDone ? (
                        coTTexts?.step4DoneDesc || '表单数据已全部配置成功，快去右侧看看成果吧！'
                      ) : (
                        coTTexts?.step4LoadingDesc || '正在同步赛段指标与规则，自动填充活动表单配置…'
                      )}
                    </p>
                  </div>
                </div>
              )}

              {/* Dynamic refinements */}
              {refinements.map(ref => (
                <div key={ref.id} className="relative z-10 flex items-start gap-2.5">
                  <div className="w-4 h-4 rounded-full bg-white flex items-center justify-center shrink-0 mt-0.5">
                    {ref.status === 'success' ? (
                      <CheckCircle2 className="w-4 h-4 text-slate-500" />
                    ) : (
                      <Loader2 className="w-4 h-4 text-slate-400 animate-spin" />
                    )}
                  </div>
                  <div className="flex flex-col items-start text-left gap-0.5">
                    <p className={`text-[11px] font-semibold ${ref.status === 'success' ? 'text-slate-500' : 'text-slate-800'}`}>
                      {ref.status === 'success' ? '微调完成，表单已更新' : '补充信息分析'}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      <TypewriterText key={`${ref.id}-${ref.status}`} text={ref.desc} />
                    </p>
                  </div>
                </div>
              ))}
              </div>
            </motion.div>
          ) : (
            <motion.div key="pills" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }} transition={{ type: 'tween', ease: 'easeInOut', duration: 0.25 }}
              className="flex flex-col gap-[8px] justify-end h-full"
            >
              {displayPills.map((cmd, i) => (
                <button key={i} onClick={() => { setUserInput(cmd); inputRef.current?.focus(); }}
                  className="h-[28px] px-[12px] bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg text-xs text-slate-500 truncate transition-colors text-left w-fit max-w-full shrink-0 block leading-[28px]">
                  {cmd}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* C. Textarea — h-[112px], mt-[12px] */}
      <div className="h-[120px] mt-[12px] shrink-0 relative border border-gray-200 rounded-lg p-[8px] bg-gray-50 flex flex-col">
        <textarea ref={inputRef} value={userInput}
          onChange={e => setUserInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); startAIAnalysis(); } }}
          disabled={isThinking}
          placeholder={isSuccess ? "输入补充信息，AI修改表单…" : "描述你的活动需求，AI 自动填单..."}
          className="w-full h-full bg-transparent resize-none outline-none text-sm text-slate-700 placeholder-slate-400 pt-0.5 pl-0.5 pr-2 pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        />
        <div className="absolute bottom-[6px] right-[6px]">
          {isThinking ? (
            <div className="bg-[#2CB4C1] text-white rounded-md px-2.5 py-1 text-sm flex items-center gap-1.5">
              <Loader2 className="w-3 h-3 animate-spin" />解析中
            </div>
          ) : (
            <button onClick={() => startAIAnalysis()} disabled={!userInput.trim()}
              className="bg-[#2CB4C1] hover:bg-[#249ea8] disabled:bg-slate-300 w-7 h-7 rounded-lg text-white transition-colors flex items-center justify-center">
              <Send className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
