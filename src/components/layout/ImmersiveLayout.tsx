import { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, PlusCircle, Activity, Settings, Database, ChevronLeft, ChevronRight, Sun, Moon } from 'lucide-react';
import { WelcomeNotification } from '../effects/Notification';
import { CustomCursor } from '../effects/CustomCursor';
import { useTheme } from '../../hooks/useTheme';
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
  const { isDark, toggleTheme } = useTheme();

  return (
    <div className="flex h-screen bg-[var(--bg)] text-[var(--text)] overflow-hidden transition-colors duration-200">
      {/* Sidebar */}
      <aside
        className={cn(
          'relative z-20 flex flex-col h-full border-r border-[var(--border)] bg-[var(--surface)] transition-all duration-300 ease-in-out shrink-0',
          collapsed ? 'w-16' : 'w-56'
        )}
      >
        {/* Brand */}
        <div className={cn(
          'flex items-center gap-3 h-14 px-4 border-b border-[var(--border)] shrink-0',
          collapsed && 'justify-center'
        )}>
          <Database className="w-5 h-5 text-[var(--text)] shrink-0" />
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              className="font-semibold text-sm tracking-wide text-[var(--text)] truncate"
            >
              DB Manager
            </motion.span>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
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
                    ? 'bg-[var(--accent)] text-[var(--bg)]'
                    : 'text-[var(--text-s)] hover:text-[var(--text)] hover:bg-[var(--surface-hover)]'
                )}
                whileTap={{ scale: 0.97 }}
                title={collapsed ? item.label : undefined}
              >
                <Icon className="w-[18px] h-[18px] shrink-0" />
                {!collapsed && (
                  <span className="text-[13px] font-medium truncate">{item.label}</span>
                )}
              </motion.button>
            );
          })}
        </nav>

        {/* Bottom: theme toggle + collapse */}
        <div className="border-t border-[var(--border)] p-2 space-y-1 shrink-0">
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className={cn(
              'w-full flex items-center gap-3 py-2 rounded-md text-[var(--text-s)] hover:text-[var(--text)] hover:bg-[var(--surface-hover)] transition-colors',
              collapsed ? 'justify-center px-0' : 'px-3'
            )}
            title={isDark ? 'Switch to Light' : 'Switch to Dark'}
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            {!collapsed && <span className="text-[13px] font-medium">{isDark ? 'Light Mode' : 'Dark Mode'}</span>}
          </button>

          {/* Collapse toggle */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-full flex items-center justify-center py-2 rounded-md text-[var(--text-m)] hover:text-[var(--text)] hover:bg-[var(--surface-hover)] transition-colors"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>
      </aside>

      {/* Content */}
      <div className="relative z-10 flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.main
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-7xl mx-auto px-6 py-6"
          >
            <Outlet />
          </motion.main>
        </AnimatePresence>
      </div>

      <WelcomeNotification />
      <CustomCursor />
    </div>
  );
}
