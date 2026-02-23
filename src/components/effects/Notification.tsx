import { useState, useEffect, useCallback, createContext, useContext, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Info, 
  X,
  Zap
} from 'lucide-react';
import { cn } from '../../lib/utils';

// 通知类型
type NotificationType = 'success' | 'error' | 'warning' | 'info';

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  duration?: number;
  progress?: boolean;
}

interface NotificationContextType {
  notify: (notification: Omit<Notification, 'id'>) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

// 图标配置
const iconConfig = {
  success: { icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-500/10', border: 'border-green-500/30' },
  error: { icon: XCircle, color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/30' },
  warning: { icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/30' },
  info: { icon: Info, color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/30' },
};

// 单个通知项组件
function NotificationItem({ 
  notification, 
  onDismiss 
}: { 
  notification: Notification; 
  onDismiss: (id: string) => void;
}) {
  const { type, title, message, duration = 4000, progress = true } = notification;
  const config = iconConfig[type];
  const Icon = config.icon;
  const itemRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const item = itemRef.current;
    const progressBar = progressRef.current;
    const glow = glowRef.current;

    if (!item) return;

    // GSAP 入场动画
    const tl = gsap.timeline();
    
    // 初始状态
    gsap.set(item, { 
      x: 400, 
      opacity: 0, 
      scale: 0.8,
      rotateY: -15 
    });

    // 滑入动画
    tl.to(item, {
      x: 0,
      opacity: 1,
      scale: 1,
      rotateY: 0,
      duration: 0.6,
      ease: 'power3.out',
    });

    // 发光脉冲效果
    if (glow) {
      tl.to(glow, {
        opacity: 0.8,
        scale: 1.05,
        duration: 0.3,
        ease: 'power2.out',
      }, '-=0.3');
      
      tl.to(glow, {
        opacity: 0.3,
        scale: 1,
        duration: 0.5,
        ease: 'power2.inOut',
      });
    }

    // 进度条动画
    if (progress && progressBar && duration > 0) {
      gsap.fromTo(progressBar, 
        { scaleX: 1 },
        { 
          scaleX: 0, 
          duration: duration / 1000, 
          ease: 'linear',
          transformOrigin: 'left',
          onComplete: () => onDismiss(notification.id)
        }
      );
    }

    // 自动关闭
    const timer = setTimeout(() => {
      if (!progress) onDismiss(notification.id);
    }, duration);

    return () => clearTimeout(timer);
  }, [notification.id, duration, progress, onDismiss]);

  const handleDismiss = () => {
    const item = itemRef.current;
    if (!item) return;

    // GSAP 退出动画
    gsap.to(item, {
      x: 400,
      opacity: 0,
      scale: 0.8,
      duration: 0.4,
      ease: 'power2.in',
      onComplete: () => onDismiss(notification.id)
    });
  };

  return (
    <div
      ref={itemRef}
      className={cn(
        'relative w-80 overflow-hidden rounded-lg border backdrop-blur-xl',
        'bg-zinc-900/95 shadow-2xl',
        config.border
      )}
      style={{ perspective: '1000px' }}
    >
      {/* 顶部发光效果 */}
      <div
        ref={glowRef}
        className={cn(
          'absolute inset-0 opacity-30 pointer-events-none',
          type === 'success' && 'bg-gradient-to-br from-green-500/20 to-transparent',
          type === 'error' && 'bg-gradient-to-br from-red-500/20 to-transparent',
          type === 'warning' && 'bg-gradient-to-br from-amber-500/20 to-transparent',
          type === 'info' && 'bg-gradient-to-br from-blue-500/20 to-transparent'
        )}
      />

      {/* 扫描线效果 */}
      <motion.div
        className="absolute inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-blue-500 to-transparent pointer-events-none"
        initial={{ top: 0, opacity: 0 }}
        animate={{ top: '100%', opacity: [0, 1, 0] }}
        transition={{ duration: 1.5, ease: 'linear' }}
      />

      <div className="relative p-4">
        <div className="flex items-start gap-3">
          {/* 图标 */}
          <div className={cn('p-2 rounded-lg', config.bg)}>
            <Icon className={cn('w-5 h-5', config.color)} />
          </div>

          {/* 内容 */}
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-zinc-50 text-sm">{title}</h4>
            {message && (
              <p className="text-zinc-400 text-xs mt-1 line-clamp-2">{message}</p>
            )}
          </div>

          {/* 关闭按钮 */}
          <button
            onClick={handleDismiss}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-50 hover:bg-zinc-700/50 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 进度条 */}
      {progress && (
        <div className="h-0.5 bg-zinc-700/30">
          <div
            ref={progressRef}
            className={cn(
              'h-full origin-left',
              type === 'success' && 'bg-green-500',
              type === 'error' && 'bg-red-500',
              type === 'warning' && 'bg-amber-500',
              type === 'info' && 'bg-blue-500'
            )}
          />
        </div>
      )}
    </div>
  );
}

// 通知容器组件
function NotificationContainer({ notifications, onDismiss }: {
  notifications: Notification[];
  onDismiss: (id: string) => void;
}) {
  return createPortal(
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-3">
      <AnimatePresence>
        {notifications.map((notification) => (
          <motion.div
            key={notification.id}
            layout
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: 100 }}
          >
            <NotificationItem 
              notification={notification} 
              onDismiss={onDismiss} 
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>,
    document.body
  );
}

// Provider 组件
export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const dismiss = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const notify = useCallback((notification: Omit<Notification, 'id'>) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    setNotifications((prev) => [...prev, { ...notification, id }]);
  }, []);

  const success = useCallback((title: string, message?: string) => {
    notify({ type: 'success', title, message });
  }, [notify]);

  const error = useCallback((title: string, message?: string) => {
    notify({ type: 'error', title, message });
  }, [notify]);

  const warning = useCallback((title: string, message?: string) => {
    notify({ type: 'warning', title, message });
  }, [notify]);

  const info = useCallback((title: string, message?: string) => {
    notify({ type: 'info', title, message });
  }, [notify]);

  return (
    <NotificationContext.Provider value={{ notify, success, error, warning, info }}>
      {children}
      <NotificationContainer notifications={notifications} onDismiss={dismiss} />
    </NotificationContext.Provider>
  );
}

// Hook
export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider');
  }
  return context;
}

// 启动欢迎通知组件
export function WelcomeNotification() {
  const { info } = useNotification();
  const hasShown = useRef(false);

  useEffect(() => {
    if (hasShown.current) return;
    hasShown.current = true;

    // 延迟显示欢迎通知
    const timer = setTimeout(() => {
      info('DB Manager 已就绪', '欢迎使用数据库管理系统');
    }, 1000);

    return () => clearTimeout(timer);
  }, [info]);

  return null;
}
