import { useState } from 'react';
import { Info, ChevronDown, Plus, Trash2, Sparkles, Calendar, X } from 'lucide-react';
import { motion } from 'framer-motion';

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

export default function ActivityForm({ formData, setFormData }) {
  const updateField = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));
  const [stage2Metrics, setStage2Metrics] = useState(['钻石数']);
  const [rewards, setRewards] = useState([{ stage: '赛段 1', rule: '完成赛段 2 任务', value: '' }]);
  const toggleMetric = (m) => setStage2Metrics(prev => prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m]);
  const addReward = () => setRewards(prev => [...prev, { stage: '赛段 1', rule: '完成赛段 2 任务', value: '' }]);
  const activeStage = formData.activeStageTab || 'stage1';

  return (
    <div className="space-y-6">
      {/* 基础信息 */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-800 mb-3">基础信息</h3>
        <div className="space-y-6">
          <div>
            <label className="text-xs text-slate-500 mb-1.5 block font-bold">活动名称 <span className="text-rose-400">*</span></label>
            <div className="flex gap-2">
              <input type="text" value={formData.name} onChange={e => updateField('name', e.target.value)} placeholder="输入活动名称" className="flex-1 bg-[#F2F2F2] border border-gray-200 rounded-lg h-9 px-3 text-sm text-slate-700 placeholder-slate-400 focus:outline-none" />
              <button className="flex items-center gap-1 text-xs text-[#34c2c1] hover:text-[#2aa8a7] font-medium whitespace-nowrap"><Sparkles className="w-3 h-3" />AI 生成</button>
            </div>
          </div>
          <div>
            <label className="text-xs text-slate-500 mb-1.5 flex items-center gap-1"><span className="font-bold">可见范围</span> <Info className="w-3 h-3 text-slate-400" /></label>
            <RadioGroup options={[{ value: 'private', label: '私密' }, { value: 'public', label: '公开' }, { value: 'guild', label: '仅限特定公会' }]} value={formData.visibility || 'private'} onChange={v => updateField('visibility', v)} />
          </div>
          <div>
            <label className="text-xs text-slate-500 mb-2 block"><span className="font-bold">添加主播</span> <span className="text-rose-400">*</span></label>
            <RadioGroup options={[{ value: 'rules', label: '按规则' }, { value: 'username', label: '按用户名' }, { value: 'all', label: '全部主播' }]} value={formData.hostSelection || 'rules'} onChange={v => updateField('hostSelection', v)} />
            {(formData.hostSelection || 'rules') === 'rules' && (
              <div className="mt-3 bg-gray-50 border border-gray-100 rounded-xl p-4 space-y-3">
                <p className="text-xs text-slate-400 flex items-center gap-1"><Info className="w-3 h-3" />不知道如何配置？试一下这些规则</p>
                <div className="flex flex-wrap gap-1.5">
                  {['营收范围', '新主播活跃', '老主播营收', '未达成活跃任务', '未达成 M1 成材'].map(tag => (
                    <button key={tag} className="text-xs px-3 py-1 rounded-full bg-white border border-gray-200 text-slate-500 hover:border-gray-300 transition-colors">{tag}</button>
                  ))}
                </div>
                <button className="flex items-center gap-1 text-xs text-[#34c2c1] hover:text-[#2aa8a7] font-medium"><Plus className="w-3 h-3" />添加规则</button>
              </div>
            )}
          </div>
          <div>
            <label className="text-xs text-slate-500 mb-1.5 block"><span className="font-bold">需要主播报名</span> <span className="text-rose-400">*</span></label>
            <RadioGroup options={[{ value: 'yes', label: '是' }, { value: 'no', label: '否' }]} value={formData.needRegistration || 'no'} onChange={v => updateField('needRegistration', v)} />
          </div>
        </div>
      </div>

      {/* 赛段信息 */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-800 mb-3">赛段信息</h3>
        <div className="flex items-center border-b border-gray-200 mb-4">
          {Array.from({ length: formData.stageCount || 1 }, (_, i) => i + 1).map(n => (
            <div key={n} className="relative w-[120px] pb-2.5 pt-1 flex items-center justify-center cursor-pointer" onClick={() => updateField('activeStageTab', `stage${n}`)}>
              <span className={`text-sm font-medium transition-colors ${activeStage === `stage${n}` ? 'text-slate-800' : 'text-slate-400 hover:text-slate-600'}`}>赛段 {n}</span>
              {(formData.stageCount || 1) > 1 && (
                <button onClick={(e) => { e.stopPropagation(); updateField('stageCount', Math.max(1, (formData.stageCount || 2) - 1)); if (activeStage === `stage${n}`) updateField('activeStageTab', 'stage1'); }} className="ml-3 text-slate-400 hover:text-slate-600 transition-colors"><X className="w-3.5 h-3.5" /></button>
              )}
              {activeStage === `stage${n}` && <motion.div layoutId="stageTabForm" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#34c2c1] rounded-full" transition={{ type: 'tween', ease: 'easeInOut', duration: 0.25 }} />}
            </div>
          ))}
          <button onClick={() => { if ((formData.stageCount || 1) < 3) updateField('stageCount', (formData.stageCount || 1) + 1); }} disabled={(formData.stageCount || 1) >= 3}
            className={`ml-auto mr-1.5 flex items-center gap-1.5 text-sm transition-colors pb-2.5 pt-1 ${(formData.stageCount || 1) >= 3 ? 'text-slate-300 cursor-not-allowed' : 'text-[#2CB4C1] hover:text-[#249ea8]'}`}>
            <Plus className="w-3.5 h-3.5" /><span>新增赛段</span>
          </button>
        </div>
        <div className="relative" style={{ minHeight: 'auto' }}>
          <div className={activeStage === 'stage1' ? 'space-y-3' : 'absolute invisible space-y-3'}>
            <div><label className="text-xs text-slate-500 mb-1 block">赛段玩法</label>
              <div className="relative"><select className="appearance-none w-full bg-[#F2F2F2] border border-gray-200 rounded-lg h-9 pl-3 pr-7 text-sm text-slate-700 focus:outline-none cursor-pointer"><option>达成目标</option></select><ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" /></div>
              <p className="text-xs text-slate-400 mt-1">创作者完成全部设置任务后可晋级或获奖，提升参与度</p></div>
            <div><label className="text-xs text-slate-500 mb-1.5 block">任务类型 <span className="text-rose-400">*</span></label>
              <RadioGroup options={[{ value: 'transition', label: '主播跃迁任务' }, { value: 'active', label: '主播活跃任务' }, { value: 'custom', label: '自定义任务' }]} value={formData.stage1TaskType || 'custom'} onChange={v => updateField('stage1TaskType', v)} /></div>
            <div><label className="text-xs text-slate-500 mb-2 block">积分指标 <span className="text-rose-400">*</span></label>
              <div className="border border-gray-200 rounded-lg overflow-hidden"><table className="w-full"><thead><tr className="bg-gray-50/50 border-b border-gray-200"><th className="text-left text-xs text-slate-500 font-medium px-3 py-2">任务指标</th><th className="text-left text-xs text-slate-500 font-medium px-3 py-2">阶段 1 目标</th><th className="text-right text-xs font-medium px-3 py-2"><button className="text-[#34c2c1] hover:text-[#2aa8a7]">+ 添加阶段目标</button></th></tr></thead>
              <tbody>{[{ label: '钻石数', field: 'stage1Diamond', value: '1000' },{ label: '直播时长 (小时)', field: 'stage1Hours', value: '20' },{ label: '有效开播天数', field: 'stage1Days', value: '8' }].map(item => (
                <tr key={item.field} className="border-b border-gray-100 last:border-0"><td className="px-3 py-2"><div className="relative"><select className="appearance-none w-full bg-[#F2F2F2] border border-gray-200 rounded-lg h-8 pl-2.5 pr-6 text-sm text-slate-700 focus:outline-none cursor-pointer"><option>{item.label}</option></select><ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" /></div></td>
                <td className="px-3 py-2"><div className="flex items-center gap-2"><input type="number" value={formData[item.field] || item.value} onChange={e => updateField(item.field, e.target.value)} className="w-24 bg-[#F2F2F2] border border-gray-200 rounded-lg h-8 px-2.5 text-sm text-slate-700 focus:outline-none" /><button onClick={() => updateField(item.field, item.value)} className="text-xs text-[#34c2c1] hover:text-[#2aa8a7] flex items-center gap-0.5 whitespace-nowrap"><Sparkles className="w-2.5 h-2.5" />AI 推荐值</button></div></td><td className="px-3 py-2" /></tr>
              ))}</tbody></table></div>
              <button className="flex items-center gap-1 text-xs text-[#34c2c1] hover:text-[#2aa8a7] font-medium mt-2"><Plus className="w-3 h-3" />添加指标</button></div>
            <div><label className="text-xs text-slate-500 mb-1 block">比赛时间 <span className="text-rose-400">*</span></label>
              <div className="flex items-center gap-2"><div className="relative"><select className="appearance-none bg-[#F2F2F2] border border-gray-200 rounded-lg h-9 pl-3 pr-7 text-sm text-slate-700 focus:outline-none cursor-pointer"><option>(UTC +09:00) Asia/Khandyga</option></select><ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" /></div>
              <div className="flex items-center gap-2"><div className="relative"><Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" /><input type="date" value={formData.startDate} onChange={e => updateField('startDate', e.target.value)} className="bg-[#F2F2F2] border border-gray-200 rounded-lg h-9 pl-8 pr-3 text-sm text-slate-700 focus:outline-none" /></div>
              <span className="text-slate-400 text-sm">~</span>
              <div className="relative"><Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" /><input type="date" value={formData.endDate} onChange={e => updateField('endDate', e.target.value)} className="bg-[#F2F2F2] border border-gray-200 rounded-lg h-9 pl-8 pr-3 text-sm text-slate-700 focus:outline-none" /></div></div></div></div>
          </div>
          <div className={activeStage === 'stage2' ? 'space-y-3' : 'absolute invisible space-y-3'}>
            <div><label className="text-xs text-slate-500 mb-1 block">赛段玩法</label>
              <div className="relative"><select className="appearance-none w-full bg-[#F2F2F2] border border-gray-200 rounded-lg h-9 pl-3 pr-7 text-sm text-slate-700 focus:outline-none cursor-pointer"><option>积分排名</option></select><ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" /></div>
              <p className="text-xs text-slate-400 mt-1">按所选指标累计排名，激发竞争，提升核心指标</p></div>
            <div><label className="text-xs text-slate-500 mb-2 block">积分指标 <span className="text-rose-400">*</span></label>
              <div className="flex flex-wrap gap-x-5 gap-y-2">{['钻石数', 'PK 钻石数', '直播时长', '有效开播天数', 'PK 场次', 'PK 胜利场次'].map(opt => (
                <label key={opt} className="flex items-center gap-1.5 text-sm text-slate-600 cursor-pointer"><input type="checkbox" checked={stage2Metrics.includes(opt)} onChange={() => toggleMetric(opt)} className="accent-[#34c2c1] rounded" />{opt}</label>
              ))}</div>
              {stage2Metrics.includes('钻石数') && (<div className="flex items-center gap-2 text-sm text-slate-500 mt-3"><span className="text-slate-600">钻石数</span><span className="text-slate-400">1 钻石 =</span><input type="number" className="w-24 bg-[#F2F2F2] border border-gray-200 rounded-lg h-8 px-2.5 text-sm text-slate-700 focus:outline-none" defaultValue="100" /><span className="text-slate-400">积分</span></div>)}</div>
            <div><label className="text-xs text-slate-500 mb-1 block">比赛时间 <span className="text-rose-400">*</span></label>
              <div className="flex items-center gap-2"><div className="relative"><Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" /><input type="date" value={formData.stage2Start || ''} onChange={e => updateField('stage2Start', e.target.value)} className="bg-[#F2F2F2] border border-gray-200 rounded-lg h-9 pl-8 pr-3 text-sm text-slate-700 focus:outline-none" /></div>
              <span className="text-slate-400 text-sm">~</span>
              <div className="relative"><Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" /><input type="date" value={formData.stage2End || ''} onChange={e => updateField('stage2End', e.target.value)} className="bg-[#F2F2F2] border border-gray-200 rounded-lg h-9 pl-8 pr-3 text-sm text-slate-700 focus:outline-none" /></div></div></div>
          </div>
          <div className={activeStage === 'stage3' ? 'space-y-3' : 'absolute invisible space-y-3'}>
            <h4 className="text-sm font-semibold text-slate-800">赛段 3</h4><p className="text-xs text-slate-400">赛段 3 配置项即将上线</p>
          </div>
        </div>
      </div>

      {/* 主播奖励 */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-800 mb-3">主播奖励 <span className="text-rose-400">*</span></h3>
        <div className="border border-gray-200 rounded-lg overflow-hidden"><table className="w-full">
          <thead><tr className="bg-gray-50/50 border-b border-gray-200"><th className="text-left text-xs text-slate-500 font-medium px-3 py-2">赛段</th><th className="text-left text-xs text-slate-500 font-medium px-3 py-2">完成条件</th><th className="text-left text-xs text-slate-500 font-medium px-3 py-2">奖励内容</th><th className="w-10" /></tr></thead>
          <tbody>{rewards.map((r, idx) => (
            <tr key={idx} className="border-b border-gray-100 last:border-0">
              <td className="px-3 py-2"><div className="relative"><select value={r.stage} onChange={e => { const n = [...rewards]; n[idx].stage = e.target.value; setRewards(n); }} className="appearance-none w-full bg-[#F2F2F2] border border-gray-200 rounded-lg h-8 pl-2.5 pr-6 text-sm text-slate-700 focus:outline-none cursor-pointer"><option>赛段 1</option><option>赛段 2</option></select><ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" /></div></td>
              <td className="px-3 py-2"><div className="relative"><select value={r.rule} onChange={e => { const n = [...rewards]; n[idx].rule = e.target.value; setRewards(n); }} className="appearance-none w-full bg-[#F2F2F2] border border-gray-200 rounded-lg h-8 pl-2.5 pr-6 text-sm text-slate-700 focus:outline-none cursor-pointer"><option>完成赛段 2 任务</option><option>按积分排名</option></select><ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" /></div></td>
              <td className="px-3 py-2"><input type="text" value={r.value} onChange={e => { const n = [...rewards]; n[idx].value = e.target.value; setRewards(n); }} placeholder="输入奖励内容" className="w-full bg-[#F2F2F2] border border-gray-200 rounded-lg h-8 px-2.5 text-sm text-slate-700 placeholder-slate-400 focus:outline-none" /></td>
              <td className="px-3 py-2"><button onClick={() => setRewards(prev => prev.filter((_, i) => i !== idx))} className="text-slate-400 hover:text-rose-500 transition-colors"><Trash2 className="w-4 h-4" /></button></td>
            </tr>
          ))}</tbody>
        </table></div>
        <button onClick={addReward} className="flex items-center gap-1 text-xs text-[#34c2c1] hover:text-[#2aa8a7] font-medium mt-2"><Plus className="w-3 h-3" />添加奖励</button>
      </div>
    </div>
  );
}
