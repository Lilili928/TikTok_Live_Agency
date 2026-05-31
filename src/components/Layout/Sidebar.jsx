import { useState } from 'react';
import {
  LayoutDashboard, CalendarPlus, FileText, TrendingUp, Users, Settings, Zap, PanelLeft,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const navItems = [
  { id: 'list', label: '活动列表', icon: LayoutDashboard },
  { id: 'detail', label: '活动详情', icon: FileText },
  { id: 'create', label: '创建活动', icon: CalendarPlus },
];
const bottomItems = [
  { id: 'analytics', label: '数据中心', icon: TrendingUp },
  { id: 'members', label: '公会成员', icon: Users },
  { id: 'settings', label: '系统设置', icon: Settings },
];

export default function Sidebar({ activeTab, setActiveTab, collapsed, setCollapsed }) {
  const [logoHovered, setLogoHovered] = useState(false);

  return (
    <motion.aside
      animate={{ width: collapsed ? 64 : 224 }}
      transition={{ type: 'tween', ease: 'easeInOut', duration: 0.25 }}
      className="h-screen bg-white border-r border-gray-200 flex flex-col shrink-0 overflow-hidden z-20"
    >
      {/* Logo Row */}
      <div className="flex items-center h-14 px-3 border-b border-gray-200 shrink-0 gap-2.5">
        <button
          onClick={() => setCollapsed(!collapsed)}
          onMouseEnter={() => setLogoHovered(true)}
          onMouseLeave={() => setLogoHovered(false)}
          className={`relative w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors ml-1.5 ${
            collapsed ? 'hover:bg-slate-200' : ''
          }`}
        >
          {collapsed ? (
            <>
              <motion.div
                animate={{ opacity: logoHovered ? 0 : 1, scale: logoHovered ? 0.8 : 1 }}
                transition={{ type: 'tween', ease: 'easeInOut', duration: 0.15 }}
                className="absolute inset-0 rounded-lg bg-slate-900 flex items-center justify-center"
              >
                <Zap className="w-3.5 h-3.5 text-tiktok-teal" />
              </motion.div>
              <motion.div
                animate={{ opacity: logoHovered ? 1 : 0, scale: logoHovered ? 1 : 0.8 }}
                transition={{ type: 'tween', ease: 'easeInOut', duration: 0.15 }}
                className="absolute inset-0 rounded-lg bg-slate-800 flex items-center justify-center"
              >
                <PanelLeft className="w-4 h-4 text-white" />
              </motion.div>
            </>
          ) : (
            <div className="absolute inset-0 rounded-lg bg-slate-900 flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-tiktok-teal" />
            </div>
          )}
        </button>

        <AnimatePresence>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="font-semibold text-sm whitespace-nowrap overflow-hidden text-slate-800 select-none flex-1"
            >
              Live Agency
            </motion.span>
          )}
        </AnimatePresence>

        {!collapsed && (
          <button
            onClick={() => setCollapsed(true)}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors shrink-0"
          >
            <PanelLeft className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Main Nav */}
      <nav className="flex-1 py-3 px-2.5 space-y-0.5 overflow-y-auto scrollbar-thin">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-2.5 rounded-lg transition-colors ${
                collapsed ? 'h-[44px] justify-center' : 'px-3 py-2 justify-start text-left'
              } ${
                isActive ? 'bg-slate-100 text-slate-900' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'
              }`}
            >
              <Icon className="w-[18px] h-[18px] shrink-0" strokeWidth={isActive ? 2 : 1.5} />
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="text-sm whitespace-nowrap"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="py-3 px-2.5 space-y-0.5 border-t border-gray-200">
        {bottomItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              className={`w-full flex items-center gap-2.5 rounded-lg text-slate-400 hover:bg-slate-50 hover:text-slate-500 transition-colors ${
                collapsed ? 'h-[44px] justify-center' : 'px-3 py-2 justify-start'
              }`}
            >
              <Icon className="w-[18px] h-[18px] shrink-0" strokeWidth={1.5} />
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="text-sm whitespace-nowrap"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          );
        })}
      </div>
    </motion.aside>
  );
}
