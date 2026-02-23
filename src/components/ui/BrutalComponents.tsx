import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

/* ===== Card ===== */
interface CardProps {
  children: ReactNode;
  className?: string;
}

// Keep old export name as alias so existing imports don't break
export function FloatingCard3D({ children, className = '' }: CardProps & { depth?: number; glowColor?: string; borderStyle?: string }) {
  return <Card className={className}>{children}</Card>;
}

export function Card({ children, className = '' }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-lg border border-[var(--border)] bg-[var(--surface)] overflow-hidden transition-colors duration-200',
        className
      )}
    >
      {children}
    </div>
  );
}

/* ===== Button ===== */
interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  disabled?: boolean;
}

// Keep old export name as alias
export function BrutalButton(props: ButtonProps) {
  return <Button {...props} />;
}

export function Button({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
}: ButtonProps) {
  const variants = {
    primary:
      'bg-[var(--accent)] text-[var(--bg)] hover:bg-[var(--accent-hover)] border-transparent',
    danger:
      'bg-red-500 text-white hover:bg-red-600 border-transparent',
    ghost:
      'bg-transparent text-[var(--text-s)] border-[var(--border)] hover:bg-[var(--surface-hover)] hover:text-[var(--text)]',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-2.5 text-sm',
  };

  return (
    <motion.button
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={cn(
        'relative inline-flex items-center justify-center font-medium rounded-md border',
        'transition-colors duration-150',
        'disabled:opacity-40 disabled:pointer-events-none',
        variants[variant],
        sizes[size],
        className
      )}
      whileTap={{ scale: 0.97 }}
    >
      {children}
    </motion.button>
  );
}

/* ===== DataPanel ===== */
interface DataPanelProps {
  label: string;
  value: string | number;
  unit?: string;
  trend?: 'up' | 'down' | 'stable';
  color?: string;
}

export function DataPanel({ label, value, unit, trend, color }: DataPanelProps) {
  return (
    <div className="p-4 rounded-lg border border-[var(--border)] bg-[var(--surface)] transition-colors duration-200">
      <div className="text-[11px] text-[var(--text-m)] font-medium uppercase tracking-wider mb-1.5">
        {label}
      </div>
      <div className="flex items-baseline gap-2">
        <span
          className="text-2xl font-bold font-mono"
          style={color ? { color } : { color: 'var(--text)' }}
        >
          {value}
        </span>
        {unit && <span className="text-[var(--text-m)] text-sm">{unit}</span>}
        {trend && (
          <span
            className={cn(
              'text-sm',
              trend === 'up' && 'text-green-500',
              trend === 'down' && 'text-red-500',
              trend === 'stable' && 'text-[var(--text-m)]'
            )}
          >
            {trend === 'up' && '↑'}
            {trend === 'down' && '↓'}
            {trend === 'stable' && '→'}
          </span>
        )}
      </div>
    </div>
  );
}

/* ===== StatusIndicator ===== */
interface StatusIndicatorProps {
  status: 'online' | 'offline' | 'warning' | 'loading';
  label?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function StatusIndicator({ status, label, size = 'md' }: StatusIndicatorProps) {
  const colors = {
    online: '#22c55e',
    offline: '#ef4444',
    warning: '#f59e0b',
    loading: '#3b82f6',
  };

  const sizes = {
    sm: 'w-2 h-2',
    md: 'w-2.5 h-2.5',
    lg: 'w-3 h-3',
  };

  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <motion.div
          className={cn('rounded-full', sizes[size])}
          style={{ backgroundColor: colors[status] }}
          animate={
            status === 'loading'
              ? { scale: [1, 1.2, 1], opacity: [1, 0.5, 1] }
              : status === 'online'
                ? { boxShadow: [`0 0 0 0 ${colors[status]}40`, `0 0 0 6px ${colors[status]}00`] }
                : {}
          }
          transition={{ duration: status === 'loading' ? 1 : 2, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>
      {label && (
        <span className="text-xs font-medium text-[var(--text-s)]">{label}</span>
      )}
    </div>
  );
}

/* ===== TerminalInput (simplified) ===== */
interface TerminalInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  prefix?: string;
}

export function TerminalInput({ value, onChange, placeholder }: TerminalInputProps) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-3 py-2 rounded-md border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] text-sm outline-none placeholder-[var(--text-m)] focus:border-[var(--border-hover)] transition-colors"
    />
  );
}
