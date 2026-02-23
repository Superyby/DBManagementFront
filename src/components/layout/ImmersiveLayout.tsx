import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, PlusCircle, Activity, Settings } from 'lucide-react';
import { WelcomeNotification } from '../effects/Notification';
import { cn } from '../../lib/utils';

const NAV_ITEMS = [
  { path: '/dashboard', label: 'DASHBOARD', icon: LayoutDashboard },
  { path: '/add', label: 'ADD', icon: PlusCircle },
  { path: '/monitor', label: 'MONITOR', icon: Activity },
  { path: '/settings', label: 'SETTINGS', icon: Settings },
];

// 极简主义布局 - 无侧边栏，全屏沉浸式
export function ImmersiveLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#050508] text-white overflow-x-hidden">
      {/* 页面内容 */}
      <AnimatePresence mode="wait">
        <motion.main
          key={location.pathname}
          initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          exit={{ opacity: 0, y: -20, filter: 'blur(10px)' }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="pb-28"
        >
          <Outlet />
        </motion.main>
      </AnimatePresence>

      {/* 欢迎通知 */}
      <WelcomeNotification />

      {/* 固定的导航指示器 */}
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
        <div
          className="flex items-center gap-1 px-3 py-2 bg-black/85 backdrop-blur-xl border border-white/10"
          style={{
            clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))',
          }}
        >
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
                  'relative flex items-center gap-2 px-4 py-2.5 text-[11px] font-mono font-semibold uppercase tracking-wider transition-all duration-200',
                  isActive
                    ? 'text-blue-500'
                    : 'text-white/40 hover:text-white/80'
                )}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{item.label}</span>

                {/* 选中态底部发光条 */}
                {isActive && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute -bottom-2 left-2 right-2 h-[2px] bg-blue-500"
                    style={{ boxShadow: '0 0 8px rgba(59,130,246,0.6), 0 0 16px rgba(59,130,246,0.3)' }}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
              </motion.button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
