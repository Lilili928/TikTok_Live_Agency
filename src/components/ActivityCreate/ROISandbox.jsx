import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Users, Target, DollarSign, AlertTriangle, CheckCircle2, Sparkles, PenLine } from 'lucide-react';

export default function ROISandbox({ formData, baselineData }) {
  const roi = useMemo(() => {
    if (!formData.name) return { estParticipants: 0, completionRate: 0, totalFlow: 0, rewardCost: 0, profitMargin: 0, isRisky: false, roiStatus: 'safe' };

    // Aggregate diamond goals across all configured stages
    const stageCount = formData.stageCount || 1;
    let totalDiamondGoal = 0;
    for (let i = 1; i <= stageCount; i++) {
      const sk = `stage${i}`;
      const dKey = i === 1 ? 'stage1Diamond' : `${sk}Diamond`;
      totalDiamondGoal += Number(formData[dKey]) || 0;
    }
    if (totalDiamondGoal === 0) totalDiamondGoal = 1000;

    // Host count based on selection type
    let hostCount;
    if (formData.hostSelection === 'all') {
      hostCount = 48;
    } else if (formData.selectedGroup === 'low-active') {
      hostCount = 24;
    } else if (formData.selectedGroup === 'high-potential') {
      hostCount = 12;
    } else {
      hostCount = 36;
    }

    const difficultyFactor = totalDiamondGoal / 1000;
    const completionRate = Math.max(15, Math.min(95, 78 - difficultyFactor * 12 + (totalDiamondGoal < 800 ? 10 : 0)));
    const estParticipants = hostCount;
    const totalFlow = Math.round(estParticipants * totalDiamondGoal * 0.72 * (completionRate / 100));
    const rewardCost = Math.round(totalFlow * 0.35);
    const profitMargin = totalFlow > 0 ? Math.round(((totalFlow - rewardCost) / totalFlow) * 100) : 0;
    const isRisky = profitMargin < 15;
    return { estParticipants, completionRate: Math.round(completionRate), totalFlow, rewardCost, profitMargin, isRisky,
      roiStatus: isRisky ? 'risk' : profitMargin < 25 ? 'warning' : 'safe' };
  }, [formData.stage1Diamond, formData.selectedGroup, formData.hostSelection, formData.stageCount,
      formData.stage2Diamond, formData.stage3Diamond, formData.name]);

  const defaultFormula = `完赛率 = ${formData.stage1Diamond ? `78% - (${formData.stage1Diamond}÷1000)×12%` : '78% - (钻石÷1000)×12%'}\n总流水 = 参与人数 × 钻石目标 × 0.72 × 完赛率\n利润率 = (总流水 - 奖励支出) ÷ 总流水`;

  const statusCfg = {
    safe: { icon: CheckCircle2, color: 'text-emerald-500', label: '安全', size: 'w-[18px] h-[18px]', textSize: 'text-sm' },
    warning: { icon: Sparkles, color: 'text-slate-600', label: '关注', size: 'w-4 h-4', textSize: 'text-xs' },
    risk: { icon: AlertTriangle, color: 'text-slate-600', label: '⚠️ 奖励溢出/亏损风险', size: 'w-4 h-4', textSize: 'text-xs' },
  };
  const status = statusCfg[roi.roiStatus];
  const StatusIcon = status.icon;

  const kpis = [
    { icon: Users, label: '预估参与人数', value: roi.estParticipants, unit: '人', key: 'estParticipants' },
    { icon: Target, label: '预计完赛率', value: roi.completionRate, unit: '%', key: 'completionRate' },
    { icon: DollarSign, label: '预估总流水增量', value: roi.totalFlow.toLocaleString(), unit: '元', key: 'totalFlow' },
    { icon: TrendingUp, label: '公会总利润率', value: roi.profitMargin, unit: '%', key: 'profitMargin' },
  ];

  const getDiff = (kpi) => {
    if (!baselineData || baselineData[kpi.key] == null) return null;
    const diff = kpi.key === 'totalFlow' ? roi[kpi.key] - baselineData[kpi.key] : roi[kpi.key] - baselineData[kpi.key];
    if (diff === 0) return null;
    const sign = diff > 0 ? '+' : '';
    const color = diff > 0 ? '#34C2C1' : '#E49400';
    const display = kpi.key === 'totalFlow' ? `${sign}${diff.toLocaleString()}` : `${sign}${diff}`;
    return { display, color };
  };

  return (
    <div className="w-full h-fit shrink-0 flex flex-col gap-4">
      <div className="flex items-center justify-between mx-2">
        <h3 className="text-sm font-semibold text-slate-800">ROI 沙盘模拟</h3>
        <button className="flex items-center gap-1 text-xs text-slate-400 hover:text-[#2CB4C1] transition-colors">
          <PenLine className="w-3.5 h-3.5" />AI精算公式
        </button>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-1.5 mx-2">
          <span className="text-xs font-medium text-slate-500">利润率预测</span>
        </div>
        <motion.div
          animate={roi.isRisky ? { boxShadow: ['0 0 0px rgba(244,63,94,0)', '0 0 12px rgba(244,63,94,0.08)', '0 0 0px rgba(244,63,94,0)'] } : {}}
          transition={{ type: 'tween', ease: 'easeInOut', duration: 2.5, repeat: roi.isRisky ? Infinity : 0 }}
          className={`border border-gray-200 rounded-xl pt-2 pb-2 px-3.5 ${roi.roiStatus === 'safe' ? 'bg-emerald-50/60' : 'bg-white'} ${roi.isRisky ? 'border-rose-200' : ''}`}
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
        <div className="grid grid-cols-2 gap-2">
          {kpis.map((kpi, idx) => (
            <motion.div
              key={kpi.label}
              initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
              transition={{ type: 'tween', ease: 'easeInOut', duration: 0.2, delay: 0.04 * idx }}
              className="bg-white border border-gray-200 rounded-xl px-3.5 pt-2.5 pb-1.5 relative"
            >
              {getDiff(kpi) && (
                <span className="absolute top-2 right-2 text-sm font-semibold" style={{ color: getDiff(kpi).color }}>
                  {getDiff(kpi).display}
                </span>
              )}
              <div className="flex items-center gap-1.5 mb-1">
                <kpi.icon className="w-4 h-4 text-slate-600" strokeWidth={1.5} />
                <span className="text-xs text-slate-500">{kpi.label}</span>
              </div>
              <motion.div
                key={`${kpi.label}-${kpi.value}`}
                initial={{ scale: 1.1, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'tween', ease: 'easeInOut', duration: 0.2 }}
                className={`text-lg font-semibold ${kpi.label === '预计完赛率' && kpi.value < 60 ? 'text-red-500' : 'text-slate-800'}`}
              >
                {kpi.value}{kpi.unit && <span className={`text-xs font-normal ml-0.5 ${kpi.label === '预计完赛率' && kpi.value < 60 ? 'text-red-500' : 'text-slate-500'}`}>{kpi.unit}</span>}
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>



    </div>
  );
}
