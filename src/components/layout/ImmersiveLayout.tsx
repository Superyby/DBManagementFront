import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { WelcomeNotification } from '../effects/Notification';
import { cn } from '../../lib/utils';

// 极简主义布局 - 无侧边栏，全屏沉浸式
export function ImmersiveLayout() {
  const location = useLocation();

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
        >
          <Outlet />
        </motion.main>
      </AnimatePresence>

      {/* 欢迎通知 */}
      <WelcomeNotification />

      {/* 固定的导航指示器 */}
      <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
        <div className="flex items-center gap-1 px-4 py-2 bg-black/80 backdrop-blur-xl border border-white/10">
          {[
            { path: '/dashboard', label: 'CTRL' },
            { path: '/add', label: 'ADD' },
            { path: '/monitor', label: 'MON' },
            { path: '/settings', label: 'CFG' },
          ].map((item) => (
            <motion.a
              key={item.path}
              href={item.path}
              className={cn(
                'px-4 py-2 text-xs font-mono uppercase tracking-wider transition-all',
                location.pathname.startsWith(item.path) || (item.path === '/dashboard' && location.pathname === '/')
                  ? 'text-cyber-cyan bg-cyber-cyan/10'
                  : 'text-white/50 hover:text-white'
              )}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              {item.label}
            </motion.a>
          ))}
        </div>
      </nav>
    </div>
  );
}
