import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Sidebar from './components/Layout/Sidebar';
import TopBar from './components/Layout/TopBar';
import ActivityListPage from './components/ActivityList/ActivityListPage';
import ActivityDetailPage from './components/ActivityDetail/ActivityDetailPage';
import ActivityCreatePage from './components/ActivityCreate/ActivityCreatePage';

const pageTransition = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
  transition: { type: 'tween', ease: 'easeInOut', duration: 0.28 },
};

export default function App() {
  const [activeTab, setActiveTab] = useState('list');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [createPreset, setCreatePreset] = useState(null);

  const handleNavigateToCreate = (preset) => {
    setCreatePreset(preset);
    setActiveTab('create');
  };

  const pages = {
    list: <ActivityListPage onNavigateToCreate={handleNavigateToCreate} onNavigateToDetail={() => setActiveTab('detail')} />,
    detail: <ActivityDetailPage />,
    create: <ActivityCreatePage presetCommand={createPreset} />,
  };

  return (
    <div className="h-screen flex overflow-hidden">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setCreatePreset(null);
          setActiveTab(tab);
        }}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar darkMode={darkMode} setDarkMode={setDarkMode} activeTab={activeTab} />
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            {...pageTransition}
            className="flex-1 flex overflow-hidden"
          >
            {pages[activeTab]}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
