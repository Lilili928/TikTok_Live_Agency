import { useState, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, Sparkles } from 'lucide-react';
import AICopilotChat from './AICopilotChat';
import ActivityForm from './ActivityForm';
import ROISandbox from './ROISandbox';
import AIGCPreview from './AIGCPreview';

const defaultFormData = {
  name: '', startDate: '2026-06-08', endDate: '2026-06-28',
  hostSelection: 'rules', selectedGroup: '', stageCount: 1, activeStageTab: 'stage1',
  stage1Diamond: '1000', stage1Hours: '20', stage1Days: '8', stage1TaskType: 'custom',
  visibility: 'private', needRegistration: 'no',
};

const stepVariants = {
  initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -10 },
  transition: { type: 'tween', ease: 'easeInOut', duration: 0.25 },
};

export default function ActivityCreatePage({ presetCommand }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState(() => {
    if (presetCommand === 'dragon_boat_low_mid') {
      return { ...defaultFormData, name: '端午粽情·开播狂欢礼', selectedGroup: 'low-active', stage1Diamond: '1200', hostSelection: 'rules' };
    }
    return defaultFormData;
  });

  const handlePresetSelect = useCallback((cmd) => {
    if (cmd.includes('端午') || cmd.includes('3万')) {
      setFormData(prev => ({ ...prev, name: '端午粽情·开播狂欢礼', selectedGroup: 'low-active', stage1Diamond: '1200', stage1Hours: '20', stage1Days: '8', hostSelection: 'rules' }));
    } else if (cmd.includes('新主播') || cmd.includes('1.5万')) {
      setFormData(prev => ({ ...prev, name: '新星闪耀·冷启动激励', selectedGroup: 'high-potential', stage1Diamond: '500', stage1Hours: '10', stage1Days: '5', hostSelection: 'rules' }));
    }
  }, []);

  const formCardRef = useRef(null);
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeoutRef = useRef(null);

  /* ── Scroll Spy state ── */
  const [activeSection, setActiveSection] = useState('basic-info');
  const [aiConfig, setAiConfig] = useState(null);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [baselineROI, setBaselineROI] = useState(null);
  const SECTION_IDS = ['basic-info', 'stage-info', 'rewards-info'];

  const computeROI = (diamondGoal, selectedGroup) => {
    const hostCount = selectedGroup === 'low-active' ? 24 : selectedGroup === 'high-potential' ? 12 : 36;
    const difficultyFactor = (diamondGoal || 1000) / 1000;
    const cr = Math.max(15, Math.min(95, 78 - difficultyFactor * 12 + ((diamondGoal || 1000) < 800 ? 10 : 0)));
    const flow = Math.round(hostCount * (diamondGoal || 1000) * 0.72 * (cr / 100));
    const cost = Math.round(flow * 0.35);
    const margin = Math.round(((flow - cost) / flow) * 100);
    return { estParticipants: hostCount, completionRate: Math.round(cr), totalFlow: flow, profitMargin: margin };
  };

  const handleAIConfig = useCallback((parsed) => {
    const bi = parsed.basicInfo;
    if (bi) {
      setFormData(prev => ({
        ...prev,
        name: bi.activityName || prev.name,
        visibility: bi.visibleRange === 'public' ? 'public' : bi.visibleRange === 'association_only' ? 'guild' : 'private',
        hostSelection: bi.streamerSelection?.type || 'rules',
        selectedGroup: bi.streamerSelection?.rules?.[0] || '',
        needRegistration: bi.needRegistration ? 'yes' : 'no',
        stageCount: Math.min(3, Math.max(1, (parsed.stages || []).length)),
        activeStageTab: 'stage1',
      }));
    }
    if (parsed.stages) {
      parsed.stages.forEach((stage, i) => {
        const sk = `stage${i + 1}`;
        if (stage.competitionDates?.[0]) setFormData(prev => ({ ...prev, [`${i === 0 ? 'startDate' : `${sk}Start`}`]: stage.competitionDates[0] }));
        if (stage.competitionDates?.[1]) setFormData(prev => ({ ...prev, [`${i === 0 ? 'endDate' : `${sk}End`}`]: stage.competitionDates[1] }));
      });
    }
    setAiConfig(parsed);
    if (!hasGenerated) {
      const diamondGoal = Number(parsed.stages?.[0]?.indicators?.[0]?.phases?.[0] || parsed.basicInfo?.streamerSelection?.rules?.[0] ? 1200 : (bi?.streamerSelection?.rules?.[0] === '新主播活跃' ? 500 : 1000));
      const roi = computeROI(diamondGoal, bi?.streamerSelection?.rules?.[0] || '');
      setBaselineROI(roi);
      setHasGenerated(true);
    }
  }, [hasGenerated]);

  const scrollToSection = (sectionId) => {
    const el = document.getElementById(sectionId);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleFormScroll = () => {
    setIsScrolling(true);
    if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    scrollTimeoutRef.current = setTimeout(() => setIsScrolling(false), 1000);

    /* ── Scroll Spy ── */
    const container = formCardRef.current;
    if (!container) return;
    const containerTop = container.getBoundingClientRect().top;
    const threshold = 80;

    let active = SECTION_IDS[0];
    for (const id of SECTION_IDS) {
      const el = document.getElementById(id);
      if (el) {
        const rect = el.getBoundingClientRect();
        if (rect.top <= containerTop + threshold) active = id;
      }
    }
    setActiveSection(active);
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50 relative">
      {step === 1 ? (
        <>
          {/* Main content row: AI panel + right content area */}
          <div className="flex-1 flex overflow-hidden min-h-0">
            {/* Left AI Panel — full height, self-scrolling */}
            <div className="w-[500px] shrink-0 bg-white border-r border-gray-200 overflow-y-auto flex flex-col">
              <div className="flex flex-col gap-4 pt-5 px-6 pb-6 flex-1">
                {/* Flat title */}
                <div className="flex items-center gap-2 font-bold text-slate-800 text-base shrink-0 pl-3">
                  <Sparkles className="w-5 h-5 text-[#2CB4C1]" />
                  AI Copilot
                </div>
                <AICopilotChat onPresetSelect={handlePresetSelect} onAIConfig={handleAIConfig} />
                <ROISandbox formData={formData} baselineData={baselineROI} />
              </div>
            </div>

            {/* Right content area — flex column: form + footer */}
            <div className="flex-1 flex flex-col overflow-hidden bg-slate-50">
              {/* Scrollable form area */}
              <main className="flex-1 overflow-y-auto" ref={formCardRef} onScroll={handleFormScroll}>
                <div className="flex justify-center gap-9 px-6 pt-5 pb-6 items-start">
                  {/* Form column — title + cards stack */}
                  <div className="w-[860px]">
                    {/* Main title row — inside form column, pixel-perfect alignment */}
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="font-bold text-slate-800 text-base pl-5">活动配置</h2>
                      <button className="border border-gray-300 text-slate-600 rounded-md py-1 px-3 text-xs hover:bg-gray-100 hover:text-slate-800 transition-colors mr-5 text-sm">选择模板</button>
                    </div>
                    <div className={`space-y-6 hide-scrollbar-dynamic ${isScrolling ? 'is-scrolling-active' : ''}`}>
                      <ActivityForm formData={formData} setFormData={setFormData} onSectionClick={setActiveSection} aiConfig={aiConfig} />
                    </div>
                  </div>

                  {/* Step indicator — sticky, pushed down to align with first card */}
                  <aside className="w-36 shrink-0 sticky top-6 self-start mt-10">
                    <div className="relative flex flex-col gap-y-8 py-4 select-none">
                      <div className="absolute left-[11.5px] top-6 bottom-6 w-[1px] bg-slate-200 z-0" />
                      {[
                        { id: 'basic-info', n: 1, label: '基础信息' },
                        { id: 'stage-info', n: 2, label: '赛段信息' },
                        { id: 'rewards-info', n: 3, label: '主播奖励' },
                      ].map(({ id, n, label }) => {
                        const isActive = activeSection === id;
                        return (
                          <div key={id} onClick={() => scrollToSection(id)}
                            className={`relative flex items-center gap-3 z-10 cursor-pointer transition-all duration-300 ${isActive ? 'opacity-100' : 'opacity-50 hover:opacity-75'}`}>
                            <span className={`w-6 h-6 flex items-center justify-center rounded-full text-[11px] font-bold shadow-sm transition-all duration-300 ${isActive ? 'bg-[#34c2c1] text-white scale-110' : 'bg-slate-100 text-slate-500 border border-slate-200'}`}>{n}</span>
                            <span className={`text-sm font-semibold whitespace-nowrap transition-colors duration-300 ${isActive ? 'text-slate-800' : 'text-slate-500'}`}>{label}</span>
                          </div>
                        );
                      })}
                    </div>
                  </aside>
                </div>
              </main>

              {/* Bottom bar — only spans right content area */}
              <footer className="shrink-0 bg-white border-t border-gray-100 py-3 flex justify-end items-center gap-4 pr-[120px]">
                <button
                  onClick={() => {
                    setFormData(defaultFormData);
                    setAiConfig(null);
                    setHasGenerated(false);
                    setBaselineROI(null);
                  }}
                  className="h-8 px-4 bg-[#F2F2F2] hover:bg-[#E6E6E6] rounded-md text-slate-600 text-base transition-colors">
                  取消
                </button>
                <button onClick={() => setStep(2)} className="h-8 pl-5 pr-3 bg-[#34c2c1] hover:bg-[#2da9a8] active:scale-95 rounded-md text-white text-base transition-all flex items-center gap-1.5">
                  活动预览<ChevronRight className="w-4 h-4" />
                </button>
              </footer>
            </div>
          </div>
        </>
      ) : (
        <div className="flex-1 overflow-y-auto scrollbar-thin px-6 py-6">
          <motion.div key="step2" {...stepVariants} className="max-w-5xl mx-auto">
            <AIGCPreview formData={formData} onBack={() => setStep(1)} />
          </motion.div>
        </div>
      )}
    </div>
  );
}
