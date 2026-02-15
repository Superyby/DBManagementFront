import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  Database, 
  Plus, 
  Settings, 
  ChevronLeft,
  ChevronRight,
  Zap
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface SidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

const navItems = [
  { path: '/dashboard', icon: LayoutDashboard, label: '仪表盘' },
  { path: '/connections', icon: Database, label: '连接列表' },
  { path: '/add', icon: Plus, label: '添加连接' },
  { path: '/settings', icon: Settings, label: '设置' },
];

export function Sidebar({ collapsed = false, onToggle }: SidebarProps) {
  const location = useLocation();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  return (
    <motion.aside
      className={cn(
        'h-full bg-cyber-surface/80 backdrop-blur-sm border-r border-cyber-border',
        'flex flex-col transition-all duration-300',
        collapsed ? 'w-16' : 'w-56'
      )}
      initial={false}
      animate={{ width: collapsed ? 64 : 224 }}
    >
      {/* Logo 区域 */}
      <div className="h-16 flex items-center justify-center border-b border-cyber-border">
        <motion.div
          className="flex items-center gap-2"
          animate={{ opacity: 1 }}
        >
          <Zap className="w-6 h-6 text-cyber-cyan" />
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="text-lg font-bold text-cyber-text whitespace-nowrap overflow-hidden"
              >
                DB Manager
              </motion.span>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* 导航菜单 */}
      <nav className="flex-1 py-4 px-2">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || 
              (item.path === '/dashboard' && location.pathname.startsWith('/dashboard/'));
            const Icon = item.icon;

            return (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className="block"
                  onMouseEnter={() => setHoveredItem(item.path)}
                  onMouseLeave={() => setHoveredItem(null)}
                >
                  <motion.div
                    className={cn(
                      'relative flex items-center gap-3 px-3 py-2.5 rounded-lg',
                      'transition-colors duration-200',
                      isActive
                        ? 'bg-cyber-cyan/10 text-cyber-cyan'
                        : 'text-cyber-muted hover:text-cyber-text hover:bg-cyber-border/50'
                    )}
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {/* 激活指示器 */}
                    {isActive && (
                      <motion.div
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-cyber-cyan rounded-r"
                        layoutId="sidebar-indicator"
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                      />
                    )}

                    {/* 悬停发光效果 */}
                    {(hoveredItem === item.path || isActive) && (
                      <motion.div
                        className="absolute inset-0 rounded-lg"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{
                          boxShadow: isActive
                            ? '0 0 20px rgba(0, 255, 242, 0.15)'
                            : '0 0 10px rgba(0, 255, 242, 0.05)',
                        }}
                      />
                    )}

                    <Icon className="w-5 h-5 shrink-0 relative z-10" />
                    
                    <AnimatePresence>
                      {!collapsed && (
                        <motion.span
                          initial={{ opacity: 0, width: 0 }}
                          animate={{ opacity: 1, width: 'auto' }}
                          exit={{ opacity: 0, width: 0 }}
                          className="whitespace-nowrap overflow-hidden relative z-10"
                        >
                          {item.label}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </motion.div>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* 折叠按钮 */}
      <div className="p-2 border-t border-cyber-border">
        <motion.button
          onClick={onToggle}
          className={cn(
            'w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg',
            'text-cyber-muted hover:text-cyber-text hover:bg-cyber-border/50',
            'transition-colors duration-200'
          )}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {collapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <>
              <ChevronLeft className="w-5 h-5" />
              <span>收起</span>
            </>
          )}
        </motion.button>
      </div>
    </motion.aside>
  );
}
