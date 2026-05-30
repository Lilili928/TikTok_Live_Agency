import { useState, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
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
  const SECTION_IDS = ['basic-info', 'stage-info', 'rewards-info'];

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
          {/* Main content row: AI panel (flex child) + form area (flex-1) */}
          <div className="flex-1 flex overflow-hidden min-h-0">
            {/* Left AI Panel — regular flex child, not fixed */}
            <div className="w-[500px] h-[calc(100vh-56px)] shrink-0 bg-white border-r border-gray-200 overflow-y-auto flex flex-col gap-5 p-6 pb-20">
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm pt-4 px-4 pb-3 flex flex-col flex-1 min-h-0">
                <AICopilotChat onPresetSelect={handlePresetSelect} />
              </div>
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 h-auto flex flex-col">
                <ROISandbox formData={formData} />
              </div>
            </div>

            {/* Main scrollable area — extends to right edge, scrollbar at screen edge */}
            <div className="flex-1 overflow-y-auto pb-20" ref={formCardRef} onScroll={handleFormScroll}>
              <div className="flex justify-center gap-9 px-6 py-6 items-start">
                <div className={`w-[860px] space-y-6 hide-scrollbar-dynamic ${isScrolling ? 'is-scrolling-active' : ''}`}>
                  <ActivityForm formData={formData} setFormData={setFormData} onSectionClick={setActiveSection} />
                </div>

                {/* Step indicator — inside scroll container; sticky keeps it fixed in view */}
                <aside className="w-36 shrink-0 sticky top-6 self-start">
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
            </div>
          </div>

          {/* Bottom bar — absolute within the relative page wrapper */}
          <div className="absolute bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 py-3 px-6 flex justify-end">
            <button onClick={() => setStep(2)} className="h-8 px-5 bg-[#34c2c1] hover:bg-[#2da9a8] active:scale-95 rounded-md text-white text-sm font-semibold transition-all flex items-center justify-center">
              活动预览
            </button>
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
