import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AICopilotChat from './AICopilotChat';
import ActivityForm from './ActivityForm';
import ROISandbox from './ROISandbox';
import AIGCPreview from './AIGCPreview';

const defaultFormData = {
  name: '', startDate: '2026-06-08', endDate: '2026-06-28',
  hostSelection: 'rules', selectedGroup: '', stageCount: 1, activeStageTab: 'stage1',
  stage1Diamond: '1000', stage1Hours: '20', stage1Days: '8', stage1TaskType: 'custom',
  visibility: 'private', needRegistration: 'no',
  rewardStage1: '500', rewardStage2: '1000',
};

const stepVariants = {
  initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -10 },
  transition: { type: 'tween', ease: 'easeInOut', duration: 0.25 },
};

const cardClass = 'bg-white rounded-xl border border-gray-100 shadow-sm';
const G = 'clamp(16px, 3vw, 48px)';

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
      setFormData(prev => ({ ...prev, name: '端午粽情·开播狂欢礼', selectedGroup: 'low-active', stage1Diamond: '1200', stage1Hours: '20', stage1Days: '8', hostSelection: 'rules', rewardStage1: '500', rewardStage2: '1000' }));
    } else if (cmd.includes('新主播') || cmd.includes('1.5万')) {
      setFormData(prev => ({ ...prev, name: '新星闪耀·冷启动激励', selectedGroup: 'high-potential', stage1Diamond: '500', stage1Hours: '10', stage1Days: '5', hostSelection: 'rules', rewardStage1: '300', rewardStage2: '800' }));
    }
  }, []);

  const formCardRef = useRef(null);
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeoutRef = useRef(null);

  const handleFormScroll = () => { setIsScrolling(true); if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current); scrollTimeoutRef.current = setTimeout(() => setIsScrolling(false), 1000); };

  return (
    <div className="flex-1 overflow-hidden flex flex-col bg-slate-50" style={{ height: 'calc(100vh - 56px)' }}>
      {step <= 3 ? (
        <>
          <div className="flex-1 overflow-hidden w-full px-6 py-6">
            <div className="grid grid-cols-1 lg:grid-cols-[480px_1fr] items-stretch w-full h-full" style={{ gap: G }}>
              <div className="w-full flex flex-col gap-5 h-full overflow-visible">
                <div className={`w-full ${cardClass} p-5 h-[280px] flex flex-col shrink-0`}>
                  <AICopilotChat onPresetSelect={handlePresetSelect} />
                </div>
                <div className={`w-full ${cardClass} pt-5 px-4 pb-4 flex-1 flex flex-col overflow-hidden`}>
                  <ROISandbox formData={formData} />
                </div>
              </div>

              <div className="w-full h-full overflow-hidden flex items-start justify-center gap-9">
                <div ref={formCardRef} onScroll={handleFormScroll} className={`w-[860px] bg-white rounded-xl border border-gray-100 p-6 shadow-sm h-full overflow-y-auto hide-scrollbar-dynamic ${isScrolling ? 'is-scrolling-active' : ''}`}>
                  <AnimatePresence mode="wait">
                    <motion.div key={`step${step}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ type: 'tween', ease: 'easeInOut', duration: 0.25 }}>
                      <ActivityForm formData={formData} setFormData={setFormData} step={step} onNext={() => setStep(step + 1)} onPrev={() => setStep(step - 1)} />
                    </motion.div>
                  </AnimatePresence>
                </div>

                <div className="w-36 shrink-0 relative flex flex-col gap-y-8 py-4 select-none h-full overflow-hidden">
                  <div className="absolute left-[11.5px] top-6 bottom-6 w-[1px] bg-slate-200 z-0" />
                  {[
                    { n: 1, label: '基础信息' },
                    { n: 2, label: '赛段信息' },
                    { n: 3, label: '主播奖励' },
                  ].map(({ n, label }) => (
                    <div key={n} className={`relative flex items-center gap-3 z-10 transition-all duration-300 ${step === n ? 'opacity-100' : 'opacity-50'}`}>
                      <span className={`w-6 h-6 flex items-center justify-center rounded-full text-[11px] font-bold shadow-sm transition-all duration-300 ${
                        step === n ? 'bg-[#34c2c1] text-white' : 'bg-slate-100 text-slate-500 border border-slate-200'
                      }`}>{n}</span>
                      <span className={`text-sm font-semibold whitespace-nowrap transition-colors duration-300 ${step === n ? 'text-slate-800' : 'text-slate-500'}`}>{label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

        </>
      ) : (
        <div className="flex-1 overflow-y-auto scrollbar-thin px-6 py-6">
          <motion.div key="step4" {...stepVariants} className="max-w-5xl mx-auto">
            <AIGCPreview formData={formData} onBack={() => setStep(3)} />
          </motion.div>
        </div>
      )}
    </div>
  );
}
