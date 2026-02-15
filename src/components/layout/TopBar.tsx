import { motion } from 'framer-motion';
import { Moon, Sun, Bell, User, Activity } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import { cn } from '../../lib/utils';

interface TopBarProps {
  className?: string;
}

export function TopBar({ className }: TopBarProps) {
  const { isDark, toggleTheme } = useTheme();

  return (
    <header
      className={cn(
        'h-16 px-6 flex items-center justify-between',
        'bg-cyber-surface/60 backdrop-blur-md border-b border-cyber-border',
        className
      )}
    >
      {/* 左侧 - 状态指示器 */}
      <div className="flex items-center gap-4">
        <motion.div 
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyber-green/10 border border-cyber-green/30"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <motion.div
            className="w-2 h-2 rounded-full bg-cyber-green"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [1, 0.7, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
          <span className="text-xs text-cyber-green font-medium">系统在线</span>
        </motion.div>

        <div className="hidden md:flex items-center gap-2 text-cyber-muted text-sm">
          <Activity className="w-4 h-4" />
          <span>Gateway: 8080</span>
        </div>
      </div>

      {/* 右侧 - 操作按钮 */}
      <div className="flex items-center gap-2">
        {/* 通知按钮 */}
        <motion.button
          className={cn(
            'relative p-2 rounded-lg',
            'text-cyber-muted hover:text-cyber-text',
            'hover:bg-cyber-border/50 transition-colors'
          )}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Bell className="w-5 h-5" />
          {/* 通知点 */}
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-cyber-pink" />
        </motion.button>

        {/* 主题切换 */}
        <motion.button
          onClick={toggleTheme}
          className={cn(
            'p-2 rounded-lg',
            'text-cyber-muted hover:text-cyber-cyan',
            'hover:bg-cyber-border/50 transition-colors'
          )}
          whileHover={{ scale: 1.05, rotate: 15 }}
          whileTap={{ scale: 0.95 }}
        >
          {isDark ? (
            <Sun className="w-5 h-5" />
          ) : (
            <Moon className="w-5 h-5" />
          )}
        </motion.button>

        {/* 用户头像 */}
        <motion.button
          className={cn(
            'flex items-center gap-2 px-3 py-1.5 rounded-lg',
            'bg-cyber-border/50 hover:bg-cyber-border',
            'transition-colors'
          )}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-cyber-cyan to-cyber-purple flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
          <span className="hidden md:block text-sm text-cyber-text">Admin</span>
        </motion.button>
      </div>
    </header>
  );
}
