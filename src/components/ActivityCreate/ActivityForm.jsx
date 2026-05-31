import { useState, useEffect, useRef } from 'react';
import { Info, ChevronDown, Plus, MinusCircle, Sparkles, Calendar, Settings, X, Trash2, Target, Trophy, Check, GripVertical, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { SortableContext, useSortable, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { callDeepSeek } from '../../utils/deepseek';

const POLISH_TITLE_PROMPT = `You are a professional Douyin (TikTok) Live Streaming Operations Copywriting Expert.
Your task is to polish and refine the raw campaign/activity name provided by the user.
The polished name must be highly attractive, operational, and match the style of live streaming incentive campaigns (e.g., using creative suffixes like "冲刺赛", "挑战赛", "狂欢节", "星光计划", "启航礼", "争霸赛", "巅峰赛").

CRITICAL REQUIREMENT:
Output ONLY the single polished campaign title string. Do not wrap it in quotes, markdown, or add any introductory or explaining text. It must be directly usable as the value of the input box.`;

const RECOMMEND_TARGETS_PROMPT = `You are a professional Douyin (TikTok) Live Operations Campaign Strategist.
Your task is to intelligently recommend progressive task targets for the active indicators in the form.

You will receive:
1. Campaign Name (reveals difficulty level).
2. Active Indicators list (e.g., ["钻石数", "直播时长 (小时)"]).
3. Number of phases for each indicator (e.g., 1, 2, or 3 phases).

Based on the difficulty inferred from the campaign name:
- Low/Medium Difficulty (e.g., "促活", "萌新", "新人", "体验"): Recommend achievable targets:
  - "钻石数": Phase 1: ~1000, Phase 2: ~1800, Phase 3: ~2500
  - "直播时长 (小时)": Phase 1: ~15, Phase 2: ~25, Phase 3: ~35
  - "有效开播天数": Phase 1: ~5, Phase 2: ~8, Phase 3: ~12
- High Difficulty (e.g., "巅峰", "冲刺", "硬核", "争霸"): Recommend challenging targets:
  - "钻石数": Phase 1: ~3000, Phase 2: ~5000, Phase 3: ~8000
  - "直播时长 (小时)": Phase 1: ~30, Phase 2: ~45, Phase 3: ~60
  - "有效开播天数": Phase 1: ~10, Phase 2: ~15, Phase 3: ~20

CRITICAL: Output strict JSON. No markdown. No explanation.
JSON SCHEMA:
{
  "recommendations": [
    { "name": "string (exact match)", "values": [number] }
  ]
}`;

function RadioGroup({ options, value, onChange }) {
  return (
    <div className="flex items-center gap-5">
      {options.map(opt => {
        const isChecked = value === opt.value;
        return (
          <label key={opt.value} className="inline-flex items-center gap-x-2 cursor-pointer select-none group">
            <input type="radio" value={opt.value} checked={isChecked} onChange={() => onChange(opt.value)} className="sr-only" />
            {isChecked ? (
              <span className="w-3.5 h-3.5 rounded-full border-[4.5px] border-[#34c2c1] shrink-0 transition-all duration-150" />
            ) : (
              <span className="w-3.5 h-3.5 rounded-full border border-[#d9d9d9] bg-white group-hover:border-slate-400 shrink-0 transition-all duration-150" />
            )}
            <span className="text-slate-600 font-medium text-sm leading-none">{opt.label}</span>
          </label>
        );
      })}
    </div>
  );
}

/* ───────── 指标选项池 ───────── */
const METRIC_OPTIONS = ['钻石数', '直播时长 (小时)', '有效开播天数', 'PK 钻石数', 'PK 场次', 'PK 胜利场次'];
const RANKING_METRIC_OPTIONS = ['钻石数', 'PK 钻石数', '直播时长', '有效开播天数', 'PK 场次', 'PK 胜利场次'];

/* ── Sortable Tab Item ── */
function SortableTab({ id, n, isActive, onActivate, onDelete, canDelete, canDrag }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : 10,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative w-[120px] pb-2.5 pt-1 flex items-center justify-center cursor-pointer select-none ${isDragging ? 'shadow-lg rounded-lg bg-white' : ''}`}
    >
      {/* Drag handle — only when multiple stages */}
      {canDrag && (
        <button {...attributes} {...listeners} className="mr-1 text-slate-300 hover:text-slate-500 transition-colors cursor-grab active:cursor-grabbing shrink-0" title="拖拽排序">
          <GripVertical className="w-3.5 h-3.5" />
        </button>
      )}
      <span onClick={onActivate} className={`text-sm transition-colors ${isActive ? 'text-slate-800 font-medium' : 'text-slate-400 font-normal hover:text-slate-600'}`}>赛段 {n}</span>
      {canDelete && (
        <button onClick={onDelete} className="ml-3 text-slate-300 hover:text-rose-400 transition-colors"><X className="w-3.5 h-3.5" /></button>
      )}
      {isActive && <motion.div layoutId="stageTabForm" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#34c2c1] rounded-full" transition={{ type: 'tween', ease: 'easeInOut', duration: 0.25 }} />}
    </div>
  );
}

export default function ActivityForm({ formData, setFormData, onSectionClick, aiConfig }) {
  const updateField = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));
  const activeStage = formData.activeStageTab || 'stage1';

  // Activity name polish
  const [isPolishing, setIsPolishing] = useState(false);

  const handleAIPolishTitle = async () => {
    const currentName = formData.name?.trim();
    if (!currentName || isPolishing) return;
    setIsPolishing(true);
    try {
      const polished = await callDeepSeek(POLISH_TITLE_PROMPT, currentName);
      if (polished?.trim()) {
        updateField('name', polished.trim());
      }
    } catch (e) { console.error('Title polish failed:', e); }
    finally { setIsPolishing(false); }
  };

  // Indicator AI recommend
  const [isRecommending, setIsRecommending] = useState(false);
  const [isRecommendingRewards, setIsRecommendingRewards] = useState(false);

  const handleOneClickAIRecommend = async (sk) => {
    if (isRecommending) return;
    const inds = stageIndicators[sk] || [];
    const pc = stagePhaseCount[sk] || 1;
    const indNames = inds.map(i => i.label);
    const userMsg = JSON.stringify({
      campaignName: formData.name || '直播活动',
      indicators: indNames,
      phasesPerIndicator: pc,
    });
    setIsRecommending(true);
    try {
      const response = await callDeepSeek(RECOMMEND_TARGETS_PROMPT, userMsg);
      const jsonMatch = response.match(/\{[\s\S]*"recommendations"[\s\S]*\}/);
      if (jsonMatch) {
        const data = JSON.parse(jsonMatch[0]);
        const recs = data.recommendations || [];
        setStageIndicators(prev => ({
          ...prev,
          [sk]: prev[sk].map(ind => {
            const rec = recs.find(r => r.name === ind.label);
            if (rec && rec.values?.length > 0) {
              // Pad or trim values to match phase count
              const vals = [...rec.values];
              while (vals.length < pc) vals.push(vals[vals.length - 1] || 0);
              return { ...ind, values: vals.slice(0, pc) };
            }
            return ind;
          }),
        }));
      }
    } catch (e) { console.error('Indicator recommend failed:', e); }
    finally { setIsRecommending(false); }
  };

  const handleAIRewardRecommend = async () => {
    if (isRecommendingRewards) return;
    const rewInfo = rewards.map(r => ({ stage: r.stageKey, condition: r.rule }));
    const userMsg = JSON.stringify({ activityName: formData.name || '直播活动', rewards: rewInfo });
    setIsRecommendingRewards(true);
    try {
      const sp = 'You are a Douyin Live Operations Reward Designer. Based on the campaign name and reward structure, recommend specific reward content per row. Use realistic MCN rewards. Output ONLY a JSON array of strings, same order as input. No markdown. No explanation.';
      const response = await callDeepSeek(sp, userMsg);
      const m = response.match(/\[[\s\S]*\]/);
      if (m) {
        const recs = JSON.parse(m[0]);
        if (Array.isArray(recs)) setRewards(prev => prev.map((r, i) => ({ ...r, value: recs[i] || r.value || '' })));
      }
    } catch (e) { console.error('Reward recommend failed:', e); }
    finally { setIsRecommendingRewards(false); }
  };

  /* ═══════════════════════════════════════════
     Stage‑local business state
     ═══════════════════════════════════════════ */

  // gameplay mode per stage — 'goal' (达成目标) | 'ranking' (积分排名)
  const [stageGameplay, setStageGameplay] = useState({
    stage1: 'goal', stage2: 'ranking', stage3: 'goal',
  });

  // 达成目标 — indicators  { label, values: number[] }   values.length === phase count
  const [stageIndicators, setStageIndicators] = useState({
    stage1: [
      { label: '钻石数', values: [1000] },
      { label: '直播时长 (小时)', values: [20] },
      { label: '有效开播天数', values: [8] },
    ],
    stage2: [{ label: '钻石数', values: [1000] }],
    stage3: [{ label: '钻石数', values: [1000] }],
  });

  // phase‑goal count per stage (table columns)
  const [stagePhaseCount, setStagePhaseCount] = useState({
    stage1: 1, stage2: 1, stage3: 1,
  });

  // 积分排名 — checked metrics
  const [stageRankingMetrics, setStageRankingMetrics] = useState({
    stage1: ['钻石数'], stage2: ['钻石数'], stage3: ['钻石数'],
  });

  // 积分排名 — 💎→points ratio (per metric)
  const [stageRankingRatio, setStageRankingRatio] = useState({
    stage1: { '钻石数': 100, 'PK 钻石数': 100 },
    stage2: { '钻石数': 100, 'PK 钻石数': 100 },
    stage3: { '钻石数': 100, 'PK 钻石数': 100 },
  });

  // 快捷预设 (per stage)
  const DEFAULT_PRESETS = [100, 300, 500, 1000];
  const [rankingPresets, setRankingPresets] = useState({
    stage1: [...DEFAULT_PRESETS],
    stage2: [...DEFAULT_PRESETS],
    stage3: [...DEFAULT_PRESETS],
  });
  const [presetAdding, setPresetAdding] = useState({ stage1: null, stage2: null, stage3: null });
  const [presetNewText, setPresetNewText] = useState('');
  const [presetEditing, setPresetEditing] = useState({ stage1: false, stage2: false, stage3: false });
  const presetInputRef = useRef(null);

  useEffect(() => {
    const addingKey = presetAdding[activeStage];
    if (addingKey && presetInputRef.current) presetInputRef.current.focus();
  }, [presetAdding, activeStage]);

  const addPreset = (sk) => {
    const trimmed = presetNewText.trim();
    const num = Number(trimmed);
    if (trimmed && !isNaN(num) && num > 0 && !rankingPresets[sk].includes(num)) {
      setRankingPresets(prev => ({ ...prev, [sk]: [...prev[sk], num].sort((a, b) => a - b) }));
    }
    setPresetNewText('');
    setPresetAdding(prev => ({ ...prev, [sk]: null }));
  };

  const removePreset = (sk, val) => {
    setRankingPresets(prev => ({ ...prev, [sk]: prev[sk].filter(v => v !== val) }));
  };

  /* ───────── helpers ───────── */
  const setGameplay = (sk, mode) => setStageGameplay(prev => ({ ...prev, [sk]: mode }));

  // gameplay dropdown state
  const [gameplayDropdownOpen, setGameplayDropdownOpen] = useState(false);

  useEffect(() => {
    setGameplayDropdownOpen(false);
  }, [activeStage]);

  useEffect(() => {
    if (!gameplayDropdownOpen) return;
    const handleClick = (e) => {
      if (!e.target.closest('.gameplay-dropdown')) {
        setGameplayDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [gameplayDropdownOpen]);

  // Sync stageIndicators → formData for ROI sandbox real-time recomputation
  const stageIndicatorSig = JSON.stringify(stageIndicators);
  useEffect(() => {
    for (let n = 1; n <= 3; n++) {
      const sk = `stage${n}`;
      const inds = stageIndicators[sk];
      if (!inds) continue;
      inds.forEach(ind => {
        const diamondVal = ind.values?.[0] ?? 0;
        if (ind.label === '钻石数') {
          const key = n === 1 ? 'stage1Diamond' : `${sk}Diamond`;
          setFormData(prev => ({ ...prev, [key]: String(diamondVal || '') }));
        } else if (ind.label === '直播时长 (小时)') {
          const key = n === 1 ? 'stage1Hours' : `${sk}Hours`;
          setFormData(prev => ({ ...prev, [key]: String(diamondVal || '') }));
        } else if (ind.label === '有效开播天数') {
          const key = n === 1 ? 'stage1Days' : `${sk}Days`;
          setFormData(prev => ({ ...prev, [key]: String(diamondVal || '') }));
        }
      });
    }
  }, [stageIndicatorSig]);

  const addIndicator = (sk) => {
    const pc = stagePhaseCount[sk] || 1;
    setStageIndicators(prev => ({
      ...prev, [sk]: [...prev[sk], { label: '新指标', values: Array(pc).fill(0) }],
    }));
  };

  const updateIndicatorLabel = (sk, idx, label) => setStageIndicators(prev => {
    const arr = [...prev[sk]]; arr[idx] = { ...arr[idx], label }; return { ...prev, [sk]: arr };
  });

  const updateIndicatorValue = (sk, idx, phaseIdx, val) => setStageIndicators(prev => {
    const arr = [...prev[sk]];
    const values = [...arr[idx].values];
    values[phaseIdx] = Number(val) || 0;
    arr[idx] = { ...arr[idx], values };
    return { ...prev, [sk]: arr };
  });

  const removeIndicator = (sk, idx) => setStageIndicators(prev => ({
    ...prev, [sk]: prev[sk].filter((_, i) => i !== idx),
  }));

  const addPhase = (sk) => {
    setStagePhaseCount(prev => ({ ...prev, [sk]: prev[sk] + 1 }));
    setStageIndicators(prev => ({
      ...prev, [sk]: prev[sk].map(ind => ({ ...ind, values: [...ind.values, 0] })),
    }));
  };

  const deletePhase = (sk, phaseIndex) => {
    setStagePhaseCount(prev => ({ ...prev, [sk]: Math.max(1, prev[sk] - 1) }));
    setStageIndicators(prev => ({
      ...prev,
      [sk]: prev[sk].map(ind => ({
        ...ind,
        values: ind.values.filter((_, i) => i !== phaseIndex),
      })),
    }));
  };

  const toggleRankingMetric = (sk, m) => setStageRankingMetrics(prev => ({
    ...prev, [sk]: prev[sk].includes(m) ? prev[sk].filter(x => x !== m) : [...prev[sk], m],
  }));

  /* ── Rule tags (添加主播) ── */
  const DEFAULT_RULE_TAGS = ['营收范围', '新主播活跃', '老主播营收', '未达成活跃任务', '未达成 M1 成材'];
  const [ruleTags, setRuleTags] = useState(DEFAULT_RULE_TAGS);
  const [selectedRules, setSelectedRules] = useState([]);
  const [isRecommendingRules, setIsRecommendingRules] = useState(false);

  const toggleRule = (tag) => {
    setSelectedRules(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

  // Reset selected rules when form name is cleared (cancel)
  useEffect(() => { if (!formData.name) setSelectedRules([]); }, [formData.name]);

  const handleAIRecommendRules = async () => {
    if (isRecommendingRules) return;
    const sp = `You are a Douyin (TikTok) Live Operations Campaign Strategist. Your task is to recommend which streamer filtering rules are most appropriate for a given campaign name. The available rules are exactly: ["营收范围", "新主播活跃", "老主播营收", "未达成活跃任务", "未达成 M1 成材"]. Analyze the campaign name and select the 1 to 3 most relevant rules. Output ONLY a JSON array of strings, e.g. ["新主播活跃", "未达成 M1 成材"]. No markdown. No explanation.`;
    setIsRecommendingRules(true);
    try {
      const response = await callDeepSeek(sp, formData.name || '直播活动');
      const m = response.match(/\[[\s\S]*\]/);
      if (m) {
        const recs = JSON.parse(m[0]);
        if (Array.isArray(recs)) {
          setSelectedRules(recs.filter(r => DEFAULT_RULE_TAGS.includes(r) || ruleTags.includes(r)));
        }
      }
    } catch (e) { console.error('Rule recommend failed:', e); }
    finally { setIsRecommendingRules(false); }
  };
  const [isAddingRule, setIsAddingRule] = useState(false);
  const [newRuleText, setNewRuleText] = useState('');
  const [isEditingRules, setIsEditingRules] = useState(false);
  const ruleInputRef = useRef(null);

  useEffect(() => {
    if (isAddingRule && ruleInputRef.current) ruleInputRef.current.focus();
  }, [isAddingRule]);

  const addRuleTag = () => {
    const trimmed = newRuleText.trim();
    if (trimmed && !ruleTags.includes(trimmed) && ruleTags.length < 15) {
      setRuleTags(prev => [...prev, trimmed]);
    }
    setNewRuleText('');
    setIsAddingRule(false);
  };

  const removeRuleTag = (tag) => {
    setRuleTags(prev => prev.filter(t => t !== tag));
  };

  /* ═══════════════════════════════════════════
     Rewards — auto‑generated from stage config
     ═══════════════════════════════════════════ */

  // available stages derived from stageCount
  const getStageOptions = () => {
    const count = formData.stageCount || 1;
    return Array.from({ length: count }, (_, i) => ({
      stageKey: `stage${i + 1}`, label: `赛段 ${i + 1}`,
    }));
  };

  // available rules derived from the selected stage's gameplay & phase count
  const getRuleOptions = (stageKey) => {
    if (!stageKey) return [];
    const gp = stageGameplay[stageKey] || 'goal';
    if (gp === 'goal') {
      const pc = stagePhaseCount[stageKey] || 1;
      return Array.from({ length: pc }, (_, i) => ({
        value: `完成阶段 ${i + 1} 任务`, label: `完成阶段 ${i + 1} 任务`,
      }));
    }
    return [
      { value: '按积分排名', label: '按积分排名' },
      { value: '积分排名前 1', label: '积分排名前 1' },
      { value: '积分排名前 3', label: '积分排名前 3' },
      { value: '积分排名前 5', label: '积分排名前 5' },
      { value: '积分排名前 10', label: '积分排名前 10' },
    ];
  };

  const [rewards, setRewards] = useState([]);

  // signature of all config that should trigger auto‑regeneration
  const stageConfigSig = JSON.stringify({
    sc: formData.stageCount || 1,
    gp: stageGameplay,
    pc: stagePhaseCount,
  });

  useEffect(() => {
    const stageCount = formData.stageCount || 1;
    const autoRows = [];

    for (let n = 1; n <= stageCount; n++) {
      const sk = `stage${n}`;
      const gp = stageGameplay[sk] || 'goal';

      if (gp === 'goal') {
        const pc = stagePhaseCount[sk] || 1;
        for (let p = 1; p <= pc; p++) {
          autoRows.push({ stageKey: sk, rule: `完成阶段 ${p} 任务` });
        }
      } else {
        autoRows.push({ stageKey: sk, rule: '按积分排名' });
      }
    }

    setRewards(prev => {
      // preserve user‑filled reward values keyed by "stageKey|rule"
      const valueByKey = {};
      for (const r of prev) {
        if (r.value) valueByKey[`${r.stageKey || ''}|${r.rule || ''}`] = r.value;
      }
      return autoRows.map(row => ({
        ...row,
        value: valueByKey[`${row.stageKey}|${row.rule}`] || '',
      }));
    });
  }, [stageConfigSig]);

  /* ── manual reward CRUD ── */
  const addReward = () => {
    const stages = getStageOptions();
    const firstStage = stages[0]?.stageKey || 'stage1';
    const rules = getRuleOptions(firstStage);
    const firstRule = rules[0]?.value || '';
    setRewards(prev => [...prev, { stageKey: firstStage, rule: firstRule, value: '' }]);
  };

  const updateRewardStage = (idx, stageKey) => {
    setRewards(prev => {
      const arr = [...prev];
      const ruleOpts = getRuleOptions(stageKey);
      const currentRule = arr[idx].rule;
      const ruleStillValid = ruleOpts.some(o => o.value === currentRule);
      arr[idx] = { ...arr[idx], stageKey, rule: ruleStillValid ? currentRule : (ruleOpts[0]?.value || '') };
      return arr;
    });
  };

  const updateRewardRule = (idx, rule) => {
    setRewards(prev => { const arr = [...prev]; arr[idx] = { ...arr[idx], rule }; return arr; });
  };

  const updateRewardValue = (idx, value) => {
    setRewards(prev => { const arr = [...prev]; arr[idx] = { ...arr[idx], value }; return arr; });
  };

  const deleteReward = (idx) => setRewards(prev => prev.filter((_, i) => i !== idx));

  /* ═══════════════════════════════════════════
     Peak‑height lock  (ResizeObserver, per‑stage)
     ═══════════════════════════════════════════ */
  const innerRef = useRef(null);
  const [stageHeights, setStageHeights] = useState({});

  useEffect(() => {
    if (!innerRef.current) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const h = entry.borderBoxSize?.[0]?.blockSize ?? entry.contentRect.height;
        setStageHeights(prev => ({
          ...prev,
          [activeStage]: Math.round(h),
        }));
      }
    });

    observer.observe(innerRef.current);
    return () => observer.disconnect();
  }, [activeStage]);

  const peakHeight = Math.max(...Object.values(stageHeights).map(h => h || 0), 0);

  /* ── Apply AI config ── */
  useEffect(() => {
    if (!aiConfig?.stages) return;
    const stages = aiConfig.stages;

    // Apply stage gameplay modes
    const gameplay = { stage1: 'goal', stage2: 'goal', stage3: 'goal' };
    const indicators = { stage1: [{ label: '钻石数', values: [1000] }], stage2: [{ label: '钻石数', values: [1000] }], stage3: [{ label: '钻石数', values: [1000] }] };
    const phaseCount = { stage1: 1, stage2: 1, stage3: 1 };
    const rankingMetrics = { stage1: ['钻石数'], stage2: ['钻石数'], stage3: ['钻石数'] };

    stages.forEach((stage, i) => {
      const sk = `stage${i + 1}`;
      if (stage.gameplayMode === 'ranking') gameplay[sk] = 'ranking';
      else gameplay[sk] = 'goal';

      if (stage.indicators?.length > 0) {
        const inds = [];
        let maxPhases = 1;
        stage.indicators.forEach(ind => {
          const phases = ind.phases?.length > 0 ? ind.phases : [1000];
          if (phases.length > maxPhases) maxPhases = phases.length;
          inds.push({ label: ind.name || '钻石数', values: phases });
        });
        indicators[sk] = inds;
        phaseCount[sk] = maxPhases;
      }

      if (stage.gameplayMode === 'ranking') {
        const metrics = stage.indicators?.map(i => i.name).filter(n => RANKING_METRIC_OPTIONS.includes(n)) || [];
        if (metrics.length > 0) rankingMetrics[sk] = metrics;
      }
    });

    setStageGameplay(gameplay);
    setStageIndicators(indicators);
    setStagePhaseCount(phaseCount);
    setStageRankingMetrics(rankingMetrics);

    // Apply rewards
    if (aiConfig.rewards?.length > 0) {
      setRewards(aiConfig.rewards.map((r, i) => ({
        stageKey: `stage${(r.stageIndex || 0) + 1}`,
        rule: r.condition || '按积分排名',
        value: r.rewardContent || '',
      })));
    }
  }, [aiConfig]);

  /* ── Delete stage with full state re-index ── */
  const deleteStage = (stageNum) => {
    const currentCount = formData.stageCount || 1;
    if (currentCount <= 1) return;
    const newCount = currentCount - 1;
    updateField('stageCount', newCount);

    // Adjust active tab
    if (activeStage === `stage${stageNum}`) {
      updateField('activeStageTab', `stage${Math.max(1, stageNum - 1)}`);
    } else {
      const activeNum = parseInt(activeStage.replace('stage', ''));
      if (activeNum > stageNum) {
        updateField('activeStageTab', `stage${activeNum - 1}`);
      }
    }

    // Shift all per-stage state maps
    const shiftMap = (prev, defaults) => {
      const next = { ...prev };
      for (let i = stageNum; i < 3; i++) {
        next[`stage${i}`] = prev[`stage${i + 1}`] || defaults[`stage${i + 1}`];
      }
      next['stage3'] = defaults['stage3'];
      return next;
    };

    setStageGameplay(prev => shiftMap(prev, { stage1: 'goal', stage2: 'goal', stage3: 'goal' }));
    setStageIndicators(prev => shiftMap(prev, { stage1: [{ label: '钻石数', values: [1000] }], stage2: [{ label: '钻石数', values: [1000] }], stage3: [{ label: '钻石数', values: [1000] }] }));
    setStagePhaseCount(prev => shiftMap(prev, { stage1: 1, stage2: 1, stage3: 1 }));
    setStageRankingMetrics(prev => shiftMap(prev, { stage1: ['钻石数'], stage2: ['钻石数'], stage3: ['钻石数'] }));
    setStageRankingRatio(prev => shiftMap(prev, { stage1: { '钻石数': 100, 'PK 钻石数': 100 }, stage2: { '钻石数': 100, 'PK 钻石数': 100 }, stage3: { '钻石数': 100, 'PK 钻石数': 100 } }));
    setRankingPresets(prev => shiftMap(prev, { stage1: [100, 300, 500, 1000], stage2: [100, 300, 500, 1000], stage3: [100, 300, 500, 1000] }));

    // Shift height records
    setStageHeights(prev => {
      const next = {};
      for (const [key, val] of Object.entries(prev)) {
        const kn = parseInt(key.replace('stage', ''));
        if (kn < stageNum) next[key] = val;
        else if (kn > stageNum) next[`stage${kn - 1}`] = val;
      }
      return next;
    });
  };

  /* ── Drag reorder: swap two stages ── */
  const swapStages = (from, to) => {
    const swapInMap = (setter, defaults) => {
      setter(prev => {
        const next = { ...prev };
        const tmp = next[`stage${from}`];
        next[`stage${from}`] = next[`stage${to}`];
        next[`stage${to}`] = tmp;
        return next;
      });
    };

    const ds = { stage1: 'goal', stage2: 'goal', stage3: 'goal' };
    swapInMap(setStageGameplay, ds);
    swapInMap(setStageIndicators, { stage1: [{ label: '钻石数', values: [1000] }], stage2: [{ label: '钻石数', values: [1000] }], stage3: [{ label: '钻石数', values: [1000] }] });
    swapInMap(setStagePhaseCount, { stage1: 1, stage2: 1, stage3: 1 });
    swapInMap(setStageRankingMetrics, { stage1: ['钻石数'], stage2: ['钻石数'], stage3: ['钻石数'] });
    swapInMap(setStageRankingRatio, { stage1: { '钻石数': 100, 'PK 钻石数': 100 }, stage2: { '钻石数': 100, 'PK 钻石数': 100 }, stage3: { '钻石数': 100, 'PK 钻石数': 100 } });
    swapInMap(setRankingPresets, { stage1: [100, 300, 500, 1000], stage2: [100, 300, 500, 1000], stage3: [100, 300, 500, 1000] });

    // Swap heights
    setStageHeights(prev => {
      const next = { ...prev };
      const t = next[`stage${from}`];
      next[`stage${from}`] = next[`stage${to}`];
      next[`stage${to}`] = t;
      return next;
    });
  };

  /* ═══════════════════════════════════════════
     Render
     ═══════════════════════════════════════════ */
  return (
    <div className="space-y-5">
      {/* 基础信息 */}
      <div id="basic-info" className="bg-white rounded-2xl border border-gray-200 pt-5 pb-6 px-6" onClickCapture={() => onSectionClick?.('basic-info')}>
        <h3 className="text-sm font-semibold text-slate-800 mb-5">基础信息</h3>
        <div className="space-y-5">
          <div>
            <label className="text-xs text-slate-500 mb-2 block font-bold">活动名称 <span className="text-rose-400">*</span></label>
            <div className="relative">
              <input type="text" value={formData.name} onChange={e => updateField('name', e.target.value)} placeholder="输入活动名称" className="w-full bg-slate-50 border border-slate-200 rounded-lg h-[30px] pl-4 pr-20 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:border-[#2CB4C1]" />
              <button
                onClick={handleAIPolishTitle}
                disabled={isPolishing}
                className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1 text-xs text-[#2CB4C1] hover:text-[#249ea8] font-medium whitespace-nowrap disabled:opacity-50">
                {isPolishing ? <><Loader2 className="w-3 h-3 animate-spin" />润色中...</> : <><Sparkles className="w-3 h-3" />AI 润色</>}
              </button>
            </div>
          </div>
          <div>
            <label className="text-xs text-slate-500 mb-2 flex items-center gap-1"><span>可见范围</span> <Info className="w-3 h-3 text-slate-400" /></label>
            <RadioGroup options={[{ value: 'private', label: '私密' }, { value: 'public', label: '公开' }, { value: 'guild', label: '仅限特定公会' }]} value={formData.visibility || 'private'} onChange={v => updateField('visibility', v)} />
          </div>
          <div>
            <label className="text-xs text-slate-500 mb-2 block"><span>添加主播</span> <span className="text-rose-400">*</span></label>
            <RadioGroup options={[{ value: 'rules', label: '按规则' }, { value: 'username', label: '按用户名' }, { value: 'all', label: '全部主播' }]} value={formData.hostSelection || 'rules'} onChange={v => updateField('hostSelection', v)} />
            <div className={[
              'overflow-hidden transition-all duration-500 ease-out',
              (formData.hostSelection || 'rules') === 'rules'
                ? 'opacity-100 translate-y-0 max-h-[300px] mt-3 visible'
                : 'opacity-0 -translate-y-3 max-h-0 mt-0 invisible',
            ].join(' ')}>
              <div className="bg-gray-50 border border-gray-100 rounded-xl py-3 px-4 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-slate-400 flex items-center gap-1"><Info className="w-3 h-3" />不知道如何配置？试一下这些规则</p>
                  <button onClick={handleAIRecommendRules} disabled={isRecommendingRules}
                    className="text-xs text-[#2CB4C1] hover:text-[#249ea8] flex items-center gap-1 whitespace-nowrap disabled:opacity-50">
                    {isRecommendingRules ? <><Loader2 className="w-3 h-3 animate-spin" />推荐中...</> : <><Sparkles className="w-3 h-3" />AI 推荐</>}
                  </button>
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  {/* Dynamic rule tags */}
                  {ruleTags.map(tag => {
                    const selected = selectedRules.includes(tag);
                    return (
                    <button
                      key={tag}
                      onClick={() => { if (isEditingRules) removeRuleTag(tag); else toggleRule(tag); }}
                      className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                        isEditingRules
                          ? 'bg-rose-50 border-rose-200 text-rose-500 cursor-pointer'
                          : selected
                            ? 'text-[#34C2C1] border-[#34C2C1] bg-[#34C2C1]/5'
                            : 'bg-white border-gray-200 text-slate-500 hover:border-gray-300'
                      }`}
                    >
                      {tag}
                      {isEditingRules && <span className="ml-0.5">&times;</span>}
                    </button>
                    );
                  })}
                  {/* + button with inline input */}
                  {isAddingRule ? (
                    <input
                      ref={ruleInputRef}
                      type="text"
                      value={newRuleText}
                      onChange={e => setNewRuleText(e.target.value.slice(0, 20))}
                      onKeyDown={e => { if (e.key === 'Enter') addRuleTag(); if (e.key === 'Escape') { setIsAddingRule(false); setNewRuleText(''); } }}
                      onBlur={() => { if (!newRuleText.trim()) { setIsAddingRule(false); setNewRuleText(''); } }}
                      placeholder="输入标签，回车添加"
                      className="h-6 px-3 text-xs bg-white border border-violet-300 rounded-full focus:outline-none focus:border-violet-500 placeholder-slate-400 w-[150px]"
                    />
                  ) : (
                    <button
                      onClick={() => setIsAddingRule(true)}
                      className="w-6 h-6 rounded-full bg-gray-50 border border-gray-200 text-slate-400 hover:text-slate-600 hover:bg-gray-100 transition-colors flex items-center justify-center"
                      title="添加规则"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  )}
                  {/* Settings — toggle edit mode */}
                  <button
                    onClick={() => setIsEditingRules(!isEditingRules)}
                    className={`w-6 h-6 rounded-full border transition-all flex items-center justify-center ${
                      isEditingRules
                        ? 'bg-violet-100 border-violet-300 text-violet-600'
                        : 'bg-gray-50 border-gray-200 text-slate-400 hover:text-slate-600 hover:bg-gray-100'
                    }`}
                    title="管理规则"
                  >
                    <Settings className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div>
            <label className="text-xs text-slate-500 mb-2 block"><span>需要主播报名</span> <span className="text-rose-400">*</span></label>
            <RadioGroup options={[{ value: 'yes', label: '是' }, { value: 'no', label: '否' }]} value={formData.needRegistration || 'no'} onChange={v => updateField('needRegistration', v)} />
          </div>
        </div>
      </div>

      {/* 赛段信息 */}
      <div
        id="stage-info"
        className="bg-white rounded-2xl border border-gray-200 transition-[min-height] duration-200"
        onClickCapture={() => onSectionClick?.('stage-info')}
        style={{ minHeight: peakHeight ? `${peakHeight}px` : 'auto' }}
      >
        <div ref={innerRef} className="pt-5 pb-6 px-6">
          <h3 className="text-sm font-semibold text-slate-800 mb-5">赛段信息</h3>

        {/* stage tabs — drag‑sortable */}
        <div className="flex items-center border-b border-gray-200 mb-4">
          <DndContext
            collisionDetection={closestCenter}
            onDragEnd={({ active, over }) => {
              if (!over || active.id === over.id) return;
              const from = parseInt(active.id);
              const to = parseInt(over.id);
              swapStages(from, to);
              // Follow the dragged tab
              updateField('activeStageTab', `stage${to}`);
            }}
          >
            <SortableContext
              items={Array.from({ length: formData.stageCount || 1 }, (_, i) => String(i + 1))}
              strategy={horizontalListSortingStrategy}
            >
              <div className="flex items-center">
                {Array.from({ length: formData.stageCount || 1 }, (_, i) => i + 1).map(n => (
                  <SortableTab
                    key={n}
                    id={String(n)}
                    n={n}
                    isActive={activeStage === `stage${n}`}
                    onActivate={() => updateField('activeStageTab', `stage${n}`)}
                    onDelete={(e) => { e.stopPropagation(); deleteStage(n); }}
                    canDelete={(formData.stageCount || 1) > 1}
                    canDrag={(formData.stageCount || 1) > 1}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
          <button onClick={() => { if ((formData.stageCount || 1) < 3) updateField('stageCount', (formData.stageCount || 1) + 1); }} disabled={(formData.stageCount || 1) >= 3}
            className={`ml-auto mr-1.5 flex items-center gap-1.5 text-sm transition-colors pb-2.5 pt-1 ${(formData.stageCount || 1) >= 3 ? 'text-slate-300 cursor-not-allowed' : 'text-slate-400 hover:text-slate-600'}`}>
            <Plus className="w-3.5 h-3.5" /><span>新增赛段</span>
          </button>
        </div>

        {/* stage content – rendered per stage, only active one in flow */}
        <div className="relative">
          {[1, 2, 3].map(n => {
            const sk = `stage${n}`;
            const gp = stageGameplay[sk] || 'goal';
            const isActive = activeStage === sk;
            const indicators = stageIndicators[sk] || [];
            const pc = stagePhaseCount[sk] || 1;
            const rankingMetrics = stageRankingMetrics[sk] || [];
            const rankingRatio = stageRankingRatio[sk] || { '钻石数': 100, 'PK 钻石数': 100 };
            const presets = rankingPresets[sk] || DEFAULT_PRESETS;
            const isPresetEditing = presetEditing[sk] || false;
            const startField = n === 1 ? 'startDate' : `${sk}Start`;
            const endField = n === 1 ? 'endDate' : `${sk}End`;
            const taskTypeField = `${sk}TaskType`;

            return (
              <div key={sk} className={isActive ? 'space-y-5' : 'hidden space-y-5'}>

                {/* ── 赛段玩法 ── */}
                <div>
                  <label className="text-xs text-slate-500 mb-2 block">赛段玩法</label>
                  <div className="relative gameplay-dropdown">
                    {(() => {
                      const GAMEPLAY_OPTIONS = [
                        { value: 'goal', icon: Target, title: '达成目标', desc: '创作者完成全部设置任务后可晋级或获奖，提升参与度' },
                        { value: 'ranking', icon: Trophy, title: '积分排名', desc: '按所选指标累计排名，激发竞争，提升核心指标' },
                      ];
                      const current = GAMEPLAY_OPTIONS.find(o => o.value === gp) || GAMEPLAY_OPTIONS[0];
                      const Icon = current.icon;
                      return (
                        <>
                          {/* Trigger card */}
                          <button
                            onClick={() => setGameplayDropdownOpen(!gameplayDropdownOpen)}
                            className="w-full flex items-center gap-3 py-2 px-4 rounded-lg border border-slate-200 bg-slate-50 text-left hover:bg-slate-100 transition-colors"
                          >
                            <Icon className="w-[18px] h-[18px] shrink-0 text-slate-500" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-slate-800">{current.title}</p>
                              <p className="text-xs text-slate-400 mt-0.5">{current.desc}</p>
                            </div>
                            <ChevronDown className={`w-4 h-4 shrink-0 text-slate-400 transition-transform ${gameplayDropdownOpen ? 'rotate-180' : ''}`} />
                          </button>

                          {/* Dropdown menu */}
                          {gameplayDropdownOpen && (
                            <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden py-1">
                              {GAMEPLAY_OPTIONS.map(opt => {
                                const isSelected = gp === opt.value;
                                return (
                                  <button
                                    key={opt.value}
                                    onClick={() => { setGameplay(sk, opt.value); setGameplayDropdownOpen(false); }}
                                    className={`w-full px-4 py-2.5 text-sm font-medium text-left hover:bg-slate-50 transition-colors ${
                                      isSelected ? 'text-slate-800' : 'text-slate-500'
                                    }`}
                                  >
                                    {opt.title}
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </>
                      );
                    })()}
                  </div>
                </div>

                {/* ── mode‑specific content ── */}
                {gp === 'goal' ? (
                  <>
                    {/* 任务类型 */}
                    <div>
                      <label className="text-xs text-slate-500 mb-2 block">任务类型 <span className="text-rose-400">*</span></label>
                      <RadioGroup
                        options={[
                          { value: 'transition', label: '主播跃迁任务' },
                          { value: 'active', label: '主播活跃任务' },
                          { value: 'custom', label: '自定义任务' },
                        ]}
                        value={formData[taskTypeField] || 'custom'}
                        onChange={v => updateField(taskTypeField, v)}
                      />
                    </div>

                    {/* 积分指标 table */}
                    <div>
                      <div className="flex items-center justify-between mb-2 pr-4">
                        <label className="text-xs text-slate-500"><span>积分指标</span> <span className="text-rose-400">*</span></label>
                        <button onClick={() => handleOneClickAIRecommend(sk)} disabled={isRecommending}
                          className="text-xs text-[#2CB4C1] hover:text-[#249ea8] flex items-center gap-1 whitespace-nowrap disabled:opacity-50">
                          {isRecommending ? <><Loader2 className="w-3 h-3 animate-spin" />计算中...</> : <><Sparkles className="w-3 h-3" />AI 推荐</>}
                        </button>
                      </div>
                      <div className="border border-gray-200 rounded-[10px] overflow-hidden">
                        <table className="w-full">
                          <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-200">
                              <th className="text-left text-xs text-slate-500 font-medium pl-3 pr-1.5 py-2 w-[160px]">任务指标</th>
                              {Array.from({ length: pc }, (_, i) => (
                                <th key={i} className="text-left text-xs text-slate-500 font-medium px-1.5 py-2">
                                  <div className="flex items-center gap-1.5">
                                    <span>阶段 {i + 1} 目标</span>
                                    {pc > 1 && (
                                      <button onClick={() => deletePhase(sk, i)} className="text-slate-300 hover:text-rose-400 transition-colors" title="删除此阶段">
                                        <MinusCircle className="w-3.5 h-3.5" />
                                      </button>
                                    )}
                                  </div>
                                </th>
                              ))}
                              {indicators.length > 1 && <th className="w-10" />}
                            </tr>
                          </thead>
                          <tbody>
                            {indicators.map((ind, idx) => (
                              <tr key={idx} className="border-b border-gray-100 last:border-0">
                                <td className="pl-3 pr-1.5 py-2 w-[160px]">
                                  <div className="relative">
                                    <select value={ind.label} onChange={e => updateIndicatorLabel(sk, idx, e.target.value)}
                                      className="appearance-none w-full border border-gray-200 rounded-md h-[30px] pl-2.5 pr-6 text-sm text-slate-700 focus:outline-none focus:border-slate-300 focus:bg-[#FAFAFA] cursor-pointer">
                                      {METRIC_OPTIONS.map(opt => <option key={opt}>{opt}</option>)}
                                    </select>
                                    <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                                  </div>
                                </td>
                                {ind.values.map((v, pi) => (
                                  <td key={pi} className="pl-1.5 pr-3 py-2">
                                    <input type="number" value={v} onChange={e => updateIndicatorValue(sk, idx, pi, e.target.value)}
                                      className="w-full border border-gray-200 rounded-md h-[30px] px-2.5 text-sm text-slate-700 focus:outline-none focus:border-slate-300 focus:bg-[#FAFAFA]" />
                                  </td>
                                ))}
                                {indicators.length > 1 && (
                                  <td className="pl-1.5 pr-1 py-2">
                                    <button onClick={() => removeIndicator(sk, idx)} className="text-slate-300 hover:text-rose-400 transition-colors">
                                      <MinusCircle className="w-3.5 h-3.5" />
                                    </button>
                                  </td>
                                )}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <div className="w-[160px] shrink-0 pl-3 pr-1.5">
                          <button onClick={() => addIndicator(sk)} className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 font-medium">
                            <Plus className="w-3.5 h-3.5" />添加指标
                          </button>
                        </div>
                        <button onClick={() => addPhase(sk)} className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 font-medium">
                          <Plus className="w-3.5 h-3.5" />添加阶段目标
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    {/* 积分排名 — 指标多选 */}
                    <div>
                      <label className="text-xs text-slate-500 mb-2 block">积分指标 <span className="text-rose-400">*</span></label>
                      <div className="flex flex-wrap gap-x-5 gap-y-2">
                        {RANKING_METRIC_OPTIONS.map(opt => (
                          <label key={opt} className="flex items-center gap-1.5 text-sm text-slate-600 cursor-pointer">
                            <input type="checkbox" checked={rankingMetrics.includes(opt)} onChange={() => toggleRankingMetric(sk, opt)} className="appearance-none w-3.5 h-3.5 rounded border border-gray-300 checked:bg-[#34c2c1] checked:border-[#34c2c1] checked:bg-[url('data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%2012%2012%22%3E%3Cpath%20fill%3D%22none%22%20stroke%3D%22white%22%20stroke-width%3D%222%22%20d%3D%22M2%206l3%203%205-5%22/%3E%3C/svg%3E')] cursor-pointer" />
                            {opt}
                          </label>
                        ))}
                      </div>
                      {(() => {
                        const hasDiamond = rankingMetrics.includes('钻石数');
                        const hasPKDiamond = rankingMetrics.includes('PK 钻石数');
                        const visible = hasDiamond || hasPKDiamond;
                        return (
                          <div className={[
                            'overflow-hidden transition-all duration-300 ease-out bg-gray-50 rounded-xl',
                            visible
                              ? 'opacity-100 translate-y-0 max-h-[400px] p-4 mt-3 border border-gray-100 visible'
                              : 'opacity-0 -translate-y-2 max-h-0 p-0 mt-0 border-none invisible',
                          ].join(' ')}>
                            <div className="flex flex-col gap-3">
                              {hasDiamond && (() => {
                                const metricKey = '钻石数';
                                const val = rankingRatio[metricKey] || 100;
                                const isAdding = presetAdding[sk] === metricKey;
                                return (
                                  <div className="flex items-center justify-between w-full">
                                    <div className="flex items-center gap-2 text-sm text-slate-600">
                                      <span>{metricKey}</span>
                                      <span className="text-slate-400">1 钻石 =</span>
                                      <input type="number" value={val}
                                        onChange={e => setStageRankingRatio(prev => ({ ...prev, [sk]: { ...prev[sk], [metricKey]: Number(e.target.value) || 0 } }))}
                                        className="w-20 bg-white border border-gray-200 rounded-md h-[30px] px-2.5 text-sm text-slate-700 focus:outline-none focus:border-slate-300" />
                                      <span className="text-slate-400">积分</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 ml-auto shrink-0">
                                      {presets.map(p => (
                                        <button key={p} onClick={() => {
                                          if (isPresetEditing) { removePreset(sk, p); }
                                          else { setStageRankingRatio(prev => ({ ...prev, [sk]: { ...prev[sk], [metricKey]: p } })); }
                                        }}
                                        className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                                          isPresetEditing
                                            ? 'bg-rose-50 border-rose-200 text-rose-500 cursor-pointer'
                                            : val === p
                                              ? 'bg-white border-[#2CB4C1] text-[#2CB4C1] font-bold'
                                              : 'bg-white border-gray-200 text-slate-500 hover:border-gray-300'
                                        }`}>{p}{isPresetEditing && <span className="ml-0.5">&times;</span>}</button>
                                      ))}
                                      {isAdding ? (
                                        <input
                                          ref={presetInputRef}
                                          type="text"
                                          value={presetNewText}
                                          onChange={e => setPresetNewText(e.target.value)}
                                          onKeyDown={e => { if (e.key === 'Enter') addPreset(sk); if (e.key === 'Escape') { setPresetAdding(prev => ({ ...prev, [sk]: null })); setPresetNewText(''); } }}
                                          onBlur={() => { if (!presetNewText.trim()) { setPresetAdding(prev => ({ ...prev, [sk]: null })); setPresetNewText(''); } }}
                                          placeholder="输入常用值并回车"
                                          className="h-6 w-[114px] px-2 text-xs text-slate-400 bg-white border border-gray-400 rounded-full focus:outline-none placeholder-slate-400"
                                        />
                                      ) : (
                                        <button onClick={() => setPresetAdding(prev => ({ ...prev, [sk]: metricKey }))}
                                          className="w-6 h-6 rounded-full bg-gray-50 border border-gray-200 text-slate-400 hover:text-slate-600 hover:bg-gray-100 transition-colors flex items-center justify-center shrink-0" title="添加预设">
                                          <Plus className="w-3 h-3" />
                                        </button>
                                      )}
                                      <button onClick={() => setPresetEditing(prev => ({ ...prev, [sk]: !prev[sk] }))}
                                        className={`w-6 h-6 rounded-full border transition-all flex items-center justify-center shrink-0 ${
                                          isPresetEditing
                                            ? 'bg-violet-100 border-violet-300 text-violet-600'
                                            : 'bg-gray-50 border-gray-200 text-slate-400 hover:text-slate-600 hover:bg-gray-100'
                                        }`} title="管理预设">
                                        <Settings className="w-3 h-3" />
                                      </button>
                                    </div>
                                  </div>
                                );
                              })()}
                              {hasPKDiamond && (() => {
                                const metricKey = 'PK 钻石数';
                                const val = rankingRatio[metricKey] || 100;
                                const isAdding = presetAdding[sk] === metricKey;
                                return (
                                  <div className="flex items-center justify-between w-full">
                                    <div className="flex items-center gap-2 text-sm text-slate-600">
                                      <span>PK 钻石数</span>
                                      <span className="text-slate-400">1 钻石 =</span>
                                      <input type="number" value={val}
                                        onChange={e => setStageRankingRatio(prev => ({ ...prev, [sk]: { ...prev[sk], [metricKey]: Number(e.target.value) || 0 } }))}
                                        className="w-20 bg-white border border-gray-200 rounded-md h-[30px] px-2.5 text-sm text-slate-700 focus:outline-none focus:border-slate-300" />
                                      <span className="text-slate-400">积分</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 ml-auto shrink-0">
                                      {presets.map(p => (
                                        <button key={p} onClick={() => {
                                          if (isPresetEditing) { removePreset(sk, p); }
                                          else { setStageRankingRatio(prev => ({ ...prev, [sk]: { ...prev[sk], [metricKey]: p } })); }
                                        }}
                                        className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                                          isPresetEditing
                                            ? 'bg-rose-50 border-rose-200 text-rose-500 cursor-pointer'
                                            : val === p
                                              ? 'bg-white border-[#2CB4C1] text-[#2CB4C1] font-bold'
                                              : 'bg-white border-gray-200 text-slate-500 hover:border-gray-300'
                                        }`}>{p}{isPresetEditing && <span className="ml-0.5">&times;</span>}</button>
                                      ))}
                                      {isAdding ? (
                                        <input
                                          ref={presetInputRef}
                                          type="text"
                                          value={presetNewText}
                                          onChange={e => setPresetNewText(e.target.value)}
                                          onKeyDown={e => { if (e.key === 'Enter') addPreset(sk); if (e.key === 'Escape') { setPresetAdding(prev => ({ ...prev, [sk]: null })); setPresetNewText(''); } }}
                                          onBlur={() => { if (!presetNewText.trim()) { setPresetAdding(prev => ({ ...prev, [sk]: null })); setPresetNewText(''); } }}
                                          placeholder="输入常用值并回车"
                                          className="h-6 w-[114px] px-2 text-xs text-slate-400 bg-white border border-gray-400 rounded-full focus:outline-none placeholder-slate-400"
                                        />
                                      ) : (
                                        <button onClick={() => setPresetAdding(prev => ({ ...prev, [sk]: metricKey }))}
                                          className="w-6 h-6 rounded-full bg-gray-50 border border-gray-200 text-slate-400 hover:text-slate-600 hover:bg-gray-100 transition-colors flex items-center justify-center shrink-0" title="添加预设">
                                          <Plus className="w-3 h-3" />
                                        </button>
                                      )}
                                      <button onClick={() => setPresetEditing(prev => ({ ...prev, [sk]: !prev[sk] }))}
                                        className={`w-6 h-6 rounded-full border transition-all flex items-center justify-center shrink-0 ${
                                          isPresetEditing
                                            ? 'bg-violet-100 border-violet-300 text-violet-600'
                                            : 'bg-gray-50 border-gray-200 text-slate-400 hover:text-slate-600 hover:bg-gray-100'
                                        }`} title="管理预设">
                                        <Settings className="w-3 h-3" />
                                      </button>
                                    </div>
                                  </div>
                                );
                              })()}
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </>
                )}

                {/* ── 比赛时间 (common) ── */}
                <div>
                  <label className="text-xs text-slate-500 mb-2 block">比赛时间 <span className="text-rose-400">*</span></label>
                  <div className="flex items-center gap-3">
                    {/* 时区 */}
                    <div className="relative shrink-0" style={{ width: 240 }}>
                      <select className="appearance-none w-full bg-[#F2F2F2] border-none rounded-md h-[30px] pl-3 pr-8 text-sm text-slate-700 font-medium focus:outline-none cursor-pointer truncate">
                        <option>(UTC +09:00) Asia/Khandyga</option>
                      </select>
                      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>
                    {/* 日期范围选择器 */}
                    <div className="flex-1 flex items-center bg-[#F2F2F2] rounded-md h-[30px] px-3 gap-2">
                      <input type="date" value={formData[startField] || ''} onChange={e => updateField(startField, e.target.value)}
                        className="bg-transparent border-none text-sm text-slate-400 focus:outline-none min-w-0 flex-1 [&::-webkit-calendar-picker-indicator]:opacity-0" />
                      <span className="text-slate-400 text-sm shrink-0">~</span>
                      <input type="date" value={formData[endField] || ''} onChange={e => updateField(endField, e.target.value)}
                        className="bg-transparent border-none text-sm text-slate-400 focus:outline-none min-w-0 flex-1 [&::-webkit-calendar-picker-indicator]:opacity-0" />
                      <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        </div>
      </div>

      {/* ===== 主播奖励（仅赛段/条件/奖励三列，无任何积分换算）===== */}
      <div id="rewards-info" className="bg-white rounded-2xl border border-gray-200 pt-5 pb-6 px-6" onClickCapture={() => onSectionClick?.('rewards-info')}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-sm font-semibold text-slate-800">主播奖励 <span className="text-rose-400">*</span></h3>
          <button onClick={handleAIRewardRecommend} disabled={isRecommendingRewards}
            className="text-xs text-[#2CB4C1] hover:text-[#249ea8] flex items-center gap-1 whitespace-nowrap disabled:opacity-50 mr-4">
            {isRecommendingRewards ? <><Loader2 className="w-3 h-3 animate-spin" />生成中...</> : <><Sparkles className="w-3 h-3" />AI 推荐</>}
          </button>
        </div>
        <div className="border border-gray-200 rounded-[10px] overflow-hidden"><table className="w-full table-fixed">
          <thead><tr className="bg-gray-50/50 border-b border-gray-200"><th className="text-left text-xs text-slate-500 font-medium pl-3 pr-1.5 py-2 w-[140px]">赛段</th><th className="text-left text-xs text-slate-500 font-medium px-1.5 py-2 w-[220px]">完成条件</th><th className="text-left text-xs text-slate-500 font-medium px-1.5 py-2">奖励内容</th>{rewards.length > 1 && <th className="w-10" />}</tr></thead>
          <tbody>{rewards.map((r, idx) => (
            <tr key={idx} className="border-b border-gray-100 last:border-0">
              <td className="pl-3 pr-1.5 py-2 w-[140px]"><div className="relative"><select value={r.stageKey || ''} onChange={e => updateRewardStage(idx, e.target.value)} className="appearance-none w-full border border-gray-200 rounded-md h-[30px] pl-2.5 pr-6 text-sm text-slate-700 focus:outline-none focus:border-slate-300 focus:bg-[#FAFAFA] cursor-pointer">{getStageOptions().map(opt => <option key={opt.stageKey} value={opt.stageKey}>{opt.label}</option>)}</select><ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" /></div></td>
              <td className="px-1.5 py-2 w-[220px]"><div className="relative"><select value={r.rule || ''} onChange={e => updateRewardRule(idx, e.target.value)} className="appearance-none w-full border border-gray-200 rounded-md h-[30px] pl-2.5 pr-6 text-sm text-slate-700 focus:outline-none focus:border-slate-300 focus:bg-[#FAFAFA] cursor-pointer">{getRuleOptions(r.stageKey).map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}</select><ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" /></div></td>
              <td className="pl-1.5 pr-3 py-2"><input type="text" value={r.value || ''} onChange={e => updateRewardValue(idx, e.target.value)} placeholder="输入奖励内容" className="w-full border border-gray-200 rounded-md h-[30px] px-2.5 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:border-slate-300 focus:bg-[#FAFAFA]" /></td>
              {rewards.length > 1 && <td className="pl-1.5 pr-1 py-2 w-10"><button onClick={() => deleteReward(idx)} className="text-slate-300 hover:text-rose-400 transition-colors"><MinusCircle className="w-3.5 h-3.5" /></button></td>}
            </tr>
          ))}</tbody>
        </table></div>
        <div className="flex items-center gap-2 mt-2">
          <button onClick={addReward} className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 font-medium">
            <Plus className="w-3.5 h-3.5" />添加奖励
          </button>
        </div>
      </div>
    </div>
  );
}
