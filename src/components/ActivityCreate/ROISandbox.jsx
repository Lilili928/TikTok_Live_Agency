import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Users, Target, DollarSign, AlertTriangle, CheckCircle2, Sparkles, Edit2, Check } from 'lucide-react';

export default function ROISandbox({ formData }) {
  const [editingFormula, setEditingFormula] = useState(false);
  const [formulaText, setFormulaText] = useState('');

  const roi = useMemo(() => {
    const diamondGoal = Number(formData.stage1Diamond) || 1000;
    const hostCount = formData.selectedGroup === 'low-active' ? 24 : formData.selectedGroup === 'high-potential' ? 12 : 36;
    const difficultyFactor = diamondGoal / 1000;
    const completionRate = Math.max(15, Math.min(95, 78 - difficultyFactor * 12 + (diamondGoal < 800 ? 10 : 0)));
    const estParticipants = hostCount;
    const totalFlow = Math.round(estParticipants * diamondGoal * 0.72 * (completionRate / 100));
    const rewardCost = Math.round(totalFlow * 0.35);
    const profitMargin = Math.round(((totalFlow - rewardCost) / totalFlow) * 100);
    const isRisky = profitMargin < 15;
    return { estParticipants, completionRate: Math.round(completionRate), totalFlow, rewardCost, profitMargin, isRisky,
      roiStatus: isRisky ? 'risk' : profitMargin < 25 ? 'warning' : 'safe' };
  }, [formData.stage1Diamond, formData.selectedGroup]);

  const defaultFormula = `完赛率 = ${formData.stage1Diamond ? `78% - (${formData.stage1Diamond}÷1000)×12%` : '78% - (钻石÷1000)×12%'}\n总流水 = 参与人数 × 钻石目标 × 0.72 × 完赛率\n利润率 = (总流水 - 奖励支出) ÷ 总流水`;

  const statusCfg = {
    safe: { icon: CheckCircle2, color: 'text-emerald-500', label: '安全', size: 'w-[18px] h-[18px]', textSize: 'text-sm' },
    warning: { icon: Sparkles, color: 'text-slate-600', label: '关注', size: 'w-4 h-4', textSize: 'text-xs' },
    risk: { icon: AlertTriangle, color: 'text-slate-600', label: '⚠️ 奖励溢出/亏损风险', size: 'w-4 h-4', textSize: 'text-xs' },
  };
  const status = statusCfg[roi.roiStatus];
  const StatusIcon = status.icon;

  const kpis = [
    { icon: Users, label: '预估参与人数', value: roi.estParticipants, unit: '人' },
    { icon: Target, label: '预计完赛率', value: roi.completionRate, unit: '%' },
    { icon: DollarSign, label: '预估总流水增量', value: roi.totalFlow.toLocaleString(), unit: '元' },
    { icon: TrendingUp, label: '公会总利润率', value: roi.profitMargin, unit: '%' },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-1.5 mx-2">
        <h3 className="text-sm font-semibold text-slate-800">ROI 预测与仿真沙盘</h3>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-1.5 mx-2">
          <span className="text-xs font-medium text-slate-500">利润率预测</span>
        </div>
        <motion.div
          animate={roi.isRisky ? { boxShadow: ['0 0 0px rgba(244,63,94,0)', '0 0 12px rgba(244,63,94,0.08)', '0 0 0px rgba(244,63,94,0)'] } : {}}
          transition={{ type: 'tween', ease: 'easeInOut', duration: 2.5, repeat: roi.isRisky ? Infinity : 0 }}
          className={`border border-gray-200 rounded-xl pt-2.5 pb-3 px-3.5 ${roi.roiStatus === 'safe' ? 'bg-emerald-50/60' : 'bg-white'} ${roi.isRisky ? 'border-rose-200' : ''}`}
        >
          <div className={`flex items-center justify-between ${roi.roiStatus === 'safe' ? 'gap-2' : 'gap-1.5'}`}>
            <div className="flex items-center gap-2">
              <StatusIcon className={`${status.size} ${status.color}`} />
              <span className={`${status.textSize} font-semibold ${status.color}`}>{status.label}</span>
            </div>
            <span className="text-xs text-slate-500">利润率<span className="ml-1.5 text-sm text-slate-800 font-bold">{roi.profitMargin}%</span></span>
          </div>
          {roi.isRisky && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} transition={{ type: 'tween', duration: 0.25 }}
              className="mt-2.5 pt-2.5 border-t border-rose-100">
              <div className="flex items-start gap-1">
                <AlertTriangle className="w-4 h-4 text-slate-600 shrink-0 mt-0.5" />
                <p className="text-xs text-slate-600 leading-relaxed">公会毛利率低于 15%，当前设置存在奖励溢出风险。建议降低钻石指标或减少奖励比例。</p>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-1.5 mx-2">
          <span className="text-xs font-medium text-slate-500">ROI 沙盘</span>
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          {kpis.map((kpi, idx) => (
            <motion.div
              key={kpi.label}
              initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
              transition={{ type: 'tween', ease: 'easeInOut', duration: 0.2, delay: 0.04 * idx }}
              className="bg-white border border-gray-200 rounded-xl px-3.5 pt-3 pb-2.5"
            >
              <div className="flex items-center gap-1.5 mb-1.5">
                <kpi.icon className="w-4 h-4 text-slate-600" strokeWidth={1.5} />
                <span className="text-xs text-slate-500">{kpi.label}</span>
              </div>
              <motion.div
                key={`${kpi.label}-${kpi.value}`}
                initial={{ scale: 1.1, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'tween', ease: 'easeInOut', duration: 0.2 }}
                className="text-lg font-semibold text-slate-800"
              >
                {kpi.value}{kpi.unit && <span className="text-xs font-normal ml-0.5 text-slate-500">{kpi.unit}</span>}
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="space-y-3 flex-1 flex flex-col">
        <div className="flex items-center justify-between mx-2 shrink-0">
          <span className="text-xs font-medium text-slate-500">AI 精算公式</span>
          <div className="flex items-center gap-2">
            {editingFormula ? (
              <button onClick={() => setEditingFormula(false)} className="flex items-center gap-1 text-xs text-[#34c2c1] hover:text-[#2aa8a7] transition-colors">
                <Check className="w-3.5 h-3.5" />保存
              </button>
            ) : (
              <button onClick={() => { setFormulaText(formulaText || defaultFormula); setEditingFormula(true); }} className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 transition-colors">
                <Edit2 className="w-3 h-3" />编辑
              </button>
            )}
          </div>
        </div>
        {editingFormula ? (
          <textarea value={formulaText || defaultFormula} onChange={e => setFormulaText(e.target.value)}
            className="flex-1 w-full bg-[#F6F6F6] border border-gray-200 rounded-xl py-2.5 px-3.5 text-sm text-slate-700 leading-relaxed resize-none focus:outline-none focus:border-gray-300" />
        ) : (
          <div className="flex-1 bg-white border border-gray-200 rounded-xl p-3.5">
            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">{formulaText || defaultFormula}</p>
          </div>
        )}
      </div>
    </div>
  );
}
