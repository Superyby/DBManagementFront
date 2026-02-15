import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { ParticleBackground } from '../effects/ParticleBackground';
import { WelcomeNotification } from '../effects/Notification';
import { useResponsive } from '../../hooks/useResponsive';
import { cn } from '../../lib/utils';

// 移动端底部导航
import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, Database, Plus, Settings } from 'lucide-react';

function MobileBottomNav() {
  const location = useLocation();
  
  const navItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: '首页' },
    { path: '/connections', icon: Database, label: '连接' },
    { path: '/add', icon: Plus, label: '添加' },
    { path: '/settings', icon: Settings, label: '设置' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-cyber-surface/95 backdrop-blur-lg border-t border-cyber-border z-50">
      <div className="flex items-center justify-around h-full px-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path ||
            (item.path === '/dashboard' && location.pathname.startsWith('/dashboard/'));
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className="flex flex-col items-center justify-center flex-1 h-full"
            >
              <motion.div
                className={cn(
                  'flex flex-col items-center gap-1 px-3 py-1.5 rounded-lg',
                  isActive ? 'text-cyber-cyan' : 'text-cyber-muted'
                )}
                whileTap={{ scale: 0.9 }}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs">{item.label}</span>
                {isActive && (
                  <motion.div
                    className="absolute bottom-1 w-8 h-0.5 bg-cyber-cyan rounded-full"
                    layoutId="mobile-nav-indicator"
                  />
                )}
              </motion.div>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}

// 页面切换动画
const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

export function MainLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { isMobile } = useResponsive();
  const location = useLocation();

  return (
    <div className="min-h-screen bg-cyber-bg text-cyber-text overflow-hidden">
      {/* 粒子背景 */}
      <ParticleBackground />
      
      {/* 网格背景 */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-30"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0,255,242,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,255,242,0.03) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
        }}
      />

      <div className="relative flex h-screen">
        {/* 桌面端侧边栏 */}
        {!isMobile && (
          <Sidebar
            collapsed={sidebarCollapsed}
            onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
          />
        )}

        {/* 主内容区 */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* 顶栏 */}
          <TopBar />

          {/* 页面内容 */}
          <main className={cn(
            'flex-1 overflow-auto p-4 md:p-6',
            isMobile && 'pb-20' // 为底部导航留出空间
          )}>
            <AnimatePresence mode="wait">
              <motion.div
                key={location?.pathname}
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.2 }}
                className="h-full"
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>

      {/* 移动端底部导航 */}
      {isMobile && <MobileBottomNav />}

      {/* 欢迎通知 */}
      <WelcomeNotification />
    </div>
  );
}
