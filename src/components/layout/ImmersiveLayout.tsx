import { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, PlusCircle, Activity, Settings, Database, ChevronLeft, ChevronRight } from 'lucide-react';
import { WelcomeNotification } from '../effects/Notification';
import { LiquidBlob, NoiseOverlay, ScanLines } from '../effects/LiquidBackground';
import { CustomCursor } from '../effects/CustomCursor';
import { cn } from '../../lib/utils';

const NAV_ITEMS = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/add', label: 'New Connection', icon: PlusCircle },
  { path: '/monitor', label: 'Monitor', icon: Activity },
  { path: '/settings', label: 'Settings', icon: Settings },
];

export function ImmersiveLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex h-screen bg-[#09090b] text-white overflow-hidden">
      {/* 全局背景特效 — 只渲染一次 */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <LiquidBlob colors={['#3b82f6', '#8b5cf6', '#6366f1']} blur={120} />
        <NoiseOverlay opacity={0.02} />
        <ScanLines opacity={0.03} />
      </div>

      {/* 左侧边栏 */}
      <aside
        className={cn(
          'relative z-20 flex flex-col h-full border-r border-white/[0.06] bg-[#09090b]/80 backdrop-blur-xl transition-[width] duration-300 ease-in-out shrink-0',
          collapsed ? 'w-16' : 'w-56'
        )}
      >
        {/* 品牌区 */}
        <div className={cn(
          'flex items-center gap-3 h-14 px-4 border-b border-white/[0.06] shrink-0',
          collapsed && 'justify-center'
        )}>
          <Database className="w-5 h-5 text-blue-500 shrink-0" />
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              className="font-semibold text-sm tracking-wide text-white truncate"
            >
              DB Manager
            </motion.span>
          )}
        </div>

        {/* 导航项 */}
        <nav className="flex-1 py-3 px-2 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const isActive =
              location.pathname.startsWith(item.path) ||
              (item.path === '/dashboard' && location.pathname === '/');
            const Icon = item.icon;

            return (
              <motion.button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={cn(
                  'relative w-full flex items-center gap-3 rounded-md transition-colors duration-150',
                  collapsed ? 'justify-center px-0 py-2.5' : 'px-3 py-2.5',
                  isActive
                    ? 'bg-blue-500/10 text-blue-500'
                    : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
                )}
                whileTap={{ scale: 0.97 }}
                title={collapsed ? item.label : undefined}
              >
                {/* 选中态左侧竖条 */}
                {isActive && (
                  <motion.div
                    layoutId="sidebar-indicator"
                    className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-r-full bg-blue-500"
                    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                  />
                )}
                <Icon className="w-[18px] h-[18px] shrink-0" />
                {!collapsed && (
                  <span className="text-[13px] font-medium truncate">{item.label}</span>
                )}
              </motion.button>
            );
          })}
        </nav>

        {/* 底部折叠按钮 */}
        <div className="border-t border-white/[0.06] p-2 shrink-0">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-full flex items-center justify-center py-2 rounded-md text-zinc-500 hover:text-white hover:bg-white/[0.04] transition-colors"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>
      </aside>

      {/* 右侧内容区 */}
      <div className="relative z-10 flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.main
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-7xl mx-auto px-6 py-6"
          >
            <Outlet />
          </motion.main>
        </AnimatePresence>
      </div>

      {/* 欢迎通知 */}
      <WelcomeNotification />

      {/* 自定义光标 */}
      <CustomCursor />
    </div>
  );
}
