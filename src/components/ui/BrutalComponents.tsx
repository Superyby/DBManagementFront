import { useRef, useEffect, ReactNode } from 'react';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { cn } from '../../lib/utils';

interface FloatingCard3DProps {
  children: ReactNode;
  className?: string;
  depth?: number;
  glowColor?: string;
  borderStyle?: 'brutal' | 'neon' | 'glass' | 'wire';
}

// 3D悬浮卡片 - 工业风格
export function FloatingCard3D({
  children,
  className = '',
  depth = 20,
  glowColor = '#3b82f6',
  borderStyle = 'brutal',
}: FloatingCard3DProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const card = cardRef.current;
    const glow = glowRef.current;
    if (!card) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const rotateX = ((y - centerY) / centerY) * -depth;
      const rotateY = ((x - centerX) / centerX) * depth;

      gsap.to(card, {
        rotateX,
        rotateY,
        duration: 0.3,
        ease: 'power2.out',
      });

      // 发光跟随
      if (glow) {
        gsap.to(glow, {
          x: x - rect.width / 2,
          y: y - rect.height / 2,
          duration: 0.3,
        });
      }
    };

    const handleMouseLeave = () => {
      gsap.to(card, {
        rotateX: 0,
        rotateY: 0,
        duration: 0.5,
        ease: 'elastic.out(1, 0.5)',
      });
    };

    card.addEventListener('mousemove', handleMouseMove);
    card.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      card.removeEventListener('mousemove', handleMouseMove);
      card.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [depth]);

  const borderStyles = {
    brutal: 'border-4 border-white/20 bg-black/80',
    neon: 'border border-blue-500/30 bg-black/60 shadow-[0_0_20px_rgba(59,130,246,0.1)]',
    glass: 'border border-white/10 bg-white/5 backdrop-blur-xl',
    wire: 'border border-dashed border-blue-500/20 bg-transparent',
  };

  return (
    <div
      ref={cardRef}
      className={cn(
        'relative overflow-hidden',
        borderStyles[borderStyle],
        className
      )}
      style={{
        transformStyle: 'preserve-3d',
        perspective: '1000px',
      }}
    >
      {/* 发光点 */}
      <div
        ref={glowRef}
        className="absolute w-40 h-40 rounded-full pointer-events-none opacity-30"
        style={{
          background: `radial-gradient(circle, ${glowColor} 0%, transparent 70%)`,
          filter: 'blur(30px)',
          transform: 'translate(-50%, -50%)',
        }}
      />
      
      {/* 内容 */}
      <div className="relative z-10" style={{ transform: 'translateZ(20px)' }}>
        {children}
      </div>

      {/* 边角装饰 */}
      <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-blue-500/30" />
      <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-blue-500/30" />
      <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-blue-500/30" />
      <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-blue-500/30" />
    </div>
  );
}

// 野兽派/工业风按钮
interface BrutalButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  disabled?: boolean;
}

export function BrutalButton({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
}: BrutalButtonProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);

  const variants = {
    primary: 'bg-blue-500 text-white hover:bg-blue-600 shadow-[0_0_15px_rgba(59,130,246,0.3)]',
    danger: 'bg-red-500 text-white hover:bg-red-600 shadow-[0_0_15px_rgba(239,68,68,0.3)]',
    ghost: 'bg-transparent text-white border-2 border-zinc-600 hover:bg-white/10',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-[11px]',
    md: 'px-6 py-3 text-sm',
    lg: 'px-8 py-4 text-base',
  };

  const clipSizes = {
    sm: 5,
    md: 8,
    lg: 10,
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) return;
    
    const button = buttonRef.current;
    if (button) {
      // 点击波纹效果
      gsap.fromTo(button, 
        { scale: 1 },
        { 
          scale: 0.95, 
          duration: 0.1, 
          yoyo: true, 
          repeat: 1,
          ease: 'power2.out' 
        }
      );
    }
    onClick?.();
  };

  return (
    <motion.button
      ref={buttonRef}
      onClick={handleClick}
      disabled={disabled}
      className={cn(
        'relative font-mono font-bold uppercase tracking-wider',
        'transition-all duration-200',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        // 斜切角效果
        'clip-path-brutal',
        variants[variant],
        sizes[size],
        className
      )}
      whileHover={{ x: 3, y: -3 }}
      style={{
        clipPath: `polygon(0 0, calc(100% - ${clipSizes[size]}px) 0, 100% ${clipSizes[size]}px, 100% 100%, ${clipSizes[size]}px 100%, 0 calc(100% - ${clipSizes[size]}px))`,
      }}
    >
      {/* 阴影层 */}
      <div 
        className="absolute inset-0 bg-black -z-10"
        style={{
          transform: `translate(${clipSizes[size] > 5 ? 4 : 3}px, ${clipSizes[size] > 5 ? 4 : 3}px)`,
          clipPath: `polygon(0 0, calc(100% - ${clipSizes[size]}px) 0, 100% ${clipSizes[size]}px, 100% 100%, ${clipSizes[size]}px 100%, 0 calc(100% - ${clipSizes[size]}px))`,
        }}
      />
      <span className="relative z-10 flex items-center">{children}</span>
    </motion.button>
  );
}

// 数据显示面板 - 科幻HUD风格
interface DataPanelProps {
  label: string;
  value: string | number;
  unit?: string;
  trend?: 'up' | 'down' | 'stable';
  color?: string;
}

export function DataPanel({ label, value, unit, trend, color = '#3b82f6' }: DataPanelProps) {
  const valueRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = valueRef.current;
    if (!el || typeof value !== 'number') return;

    gsap.fromTo(el,
      { textContent: 0 },
      {
        textContent: value,
        duration: 1.5,
        ease: 'power2.out',
        snap: { textContent: 1 },
      }
    );
  }, [value]);

  return (
    <div className="relative p-4 bg-black/40 border border-white/10">
      {/* 顶部标签条 */}
      <div 
        className="absolute top-0 left-0 right-0 h-1"
        style={{ background: color }}
      />
      
      {/* 标签 */}
      <div className="text-xs text-white/50 font-mono uppercase tracking-widest mb-2">
        {label}
      </div>
      
      {/* 数值 */}
      <div className="flex items-baseline gap-2">
        <span 
          ref={valueRef}
          className="text-3xl font-bold font-mono"
          style={{ color }}
        >
          {value}
        </span>
        {unit && <span className="text-white/50 text-sm">{unit}</span>}
        
        {/* 趋势指示 */}
        {trend && (
          <span className={cn(
            'text-sm',
            trend === 'up' && 'text-green-400',
            trend === 'down' && 'text-red-400',
            trend === 'stable' && 'text-white/50'
          )}>
            {trend === 'up' && '↑'}
            {trend === 'down' && '↓'}
            {trend === 'stable' && '→'}
          </span>
        )}
      </div>

      {/* 底部装饰线 */}
      <div className="absolute bottom-0 left-0 w-8 h-px bg-white/20" />
      <div className="absolute bottom-0 right-0 w-8 h-px bg-white/20" />
    </div>
  );
}

// 状态指示器 - 工业风格
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
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
  };

  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <motion.div
          className={cn('rounded-full', sizes[size])}
          style={{ backgroundColor: colors[status] }}
          animate={status === 'loading' ? {
            scale: [1, 1.2, 1],
            opacity: [1, 0.5, 1],
          } : status === 'online' ? {
            boxShadow: [
              `0 0 0 0 ${colors[status]}40`,
              `0 0 0 8px ${colors[status]}00`,
            ],
          } : {}}
          transition={{
            duration: status === 'loading' ? 1 : 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>
      {label && (
        <span className="text-xs font-mono uppercase text-white/70">
          {label}
        </span>
      )}
    </div>
  );
}

// 终端风格文本输入
interface TerminalInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  prefix?: string;
}

export function TerminalInput({ value, onChange, placeholder, prefix = '>' }: TerminalInputProps) {
  return (
    <div className="flex items-center gap-2 bg-black/60 border border-white/10 px-4 py-3 font-mono">
      <span className="text-blue-500">{prefix}</span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="flex-1 bg-transparent text-white outline-none placeholder-white/30"
      />
      <motion.span
        className="w-2 h-5 bg-blue-500"
        animate={{ opacity: [1, 0, 1] }}
        transition={{ duration: 1, repeat: Infinity }}
      />
    </div>
  );
}
