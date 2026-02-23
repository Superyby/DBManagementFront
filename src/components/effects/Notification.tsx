import { useState, useEffect, useCallback, createContext, useContext, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import { cn } from '../../lib/utils';

type NotificationType = 'success' | 'error' | 'warning' | 'info';

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  duration?: number;
}

interface NotificationContextType {
  notify: (notification: Omit<Notification, 'id'>) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

const iconConfig = {
  success: { icon: CheckCircle2, color: 'text-green-500', border: 'border-green-500/30' },
  error: { icon: XCircle, color: 'text-red-500', border: 'border-red-500/30' },
  warning: { icon: AlertTriangle, color: 'text-amber-500', border: 'border-amber-500/30' },
  info: { icon: Info, color: 'text-blue-500', border: 'border-blue-500/30' },
};

function NotificationItem({
  notification,
  onDismiss,
}: {
  notification: Notification;
  onDismiss: (id: string) => void;
}) {
  const { type, title, message, duration = 4000 } = notification;
  const config = iconConfig[type];
  const Icon = config.icon;
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const bar = progressRef.current;
    if (bar) {
      bar.style.transition = `transform ${duration}ms linear`;
      requestAnimationFrame(() => { bar.style.transform = 'scaleX(0)'; });
    }
    const timer = setTimeout(() => onDismiss(notification.id), duration);
    return () => clearTimeout(timer);
  }, [notification.id, duration, onDismiss]);

  return (
    <div
      className={cn(
        'relative w-80 overflow-hidden rounded-lg border bg-[var(--surface)] shadow-lg',
        config.border
      )}
    >
      <div className="p-3.5">
        <div className="flex items-start gap-3">
          <Icon className={cn('w-5 h-5 mt-0.5 shrink-0', config.color)} />
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-[var(--text)] text-sm">{title}</h4>
            {message && (
              <p className="text-[var(--text-m)] text-xs mt-0.5 line-clamp-2">{message}</p>
            )}
          </div>
          <button
            onClick={() => onDismiss(notification.id)}
            className="p-0.5 rounded text-[var(--text-m)] hover:text-[var(--text)] transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      <div className="h-0.5 bg-[var(--border)]">
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
    </div>
  );
}

function NotificationContainer({
  notifications,
  onDismiss,
}: {
  notifications: Notification[];
  onDismiss: (id: string) => void;
}) {
  return createPortal(
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2.5">
      <AnimatePresence>
        {notifications.map((notification) => (
          <motion.div
            key={notification.id}
            layout
            initial={{ opacity: 0, y: -16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 80, scale: 0.96 }}
            transition={{ duration: 0.2 }}
          >
            <NotificationItem notification={notification} onDismiss={onDismiss} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>,
    document.body
  );
}

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

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider');
  }
  return context;
}

export function WelcomeNotification() {
  const { info } = useNotification();
  const hasShown = useRef(false);

  useEffect(() => {
    if (hasShown.current) return;
    hasShown.current = true;
    const timer = setTimeout(() => {
      info('DB Manager Ready', 'Welcome to the database management system');
    }, 1000);
    return () => clearTimeout(timer);
  }, [info]);

  return null;
}
