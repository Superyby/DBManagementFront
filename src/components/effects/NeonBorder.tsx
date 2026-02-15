import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

interface NeonBorderProps {
  children: ReactNode;
  className?: string;
  color?: 'cyan' | 'purple' | 'pink' | 'green' | 'gradient';
  animated?: boolean;
  intensity?: 'low' | 'medium' | 'high';
}

const colorMap = {
  cyan: {
    border: 'border-cyber-cyan/50',
    shadow: 'shadow-[0_0_15px_rgba(0,255,242,0.3)]',
    shadowHigh: 'shadow-[0_0_30px_rgba(0,255,242,0.5)]',
  },
  purple: {
    border: 'border-cyber-purple/50',
    shadow: 'shadow-[0_0_15px_rgba(191,0,255,0.3)]',
    shadowHigh: 'shadow-[0_0_30px_rgba(191,0,255,0.5)]',
  },
  pink: {
    border: 'border-cyber-pink/50',
    shadow: 'shadow-[0_0_15px_rgba(255,0,170,0.3)]',
    shadowHigh: 'shadow-[0_0_30px_rgba(255,0,170,0.5)]',
  },
  green: {
    border: 'border-cyber-green/50',
    shadow: 'shadow-[0_0_15px_rgba(0,255,136,0.3)]',
    shadowHigh: 'shadow-[0_0_30px_rgba(0,255,136,0.5)]',
  },
  gradient: {
    border: 'border-transparent',
    shadow: '',
    shadowHigh: '',
  },
};

export function NeonBorder({
  children,
  className = '',
  color = 'cyan',
  animated = false,
  intensity = 'medium',
}: NeonBorderProps) {
  const colorStyle = colorMap[color];
  const shadowStyle = intensity === 'high' ? colorStyle.shadowHigh : colorStyle.shadow;

  if (color === 'gradient') {
    return (
      <div className={cn('relative p-[1px] rounded-lg', className)}>
        {/* 渐变边框背景 */}
        <div 
          className={cn(
            'absolute inset-0 rounded-lg',
            'bg-gradient-to-r from-cyber-cyan via-cyber-purple to-cyber-pink',
            animated && 'animate-gradient-x'
          )}
        />
        {/* 内容区域 */}
        <div className="relative bg-cyber-surface rounded-lg">
          {children}
        </div>
        {/* 发光效果 */}
        {animated && (
          <motion.div
            className="absolute inset-0 rounded-lg opacity-50 blur-md bg-gradient-to-r from-cyber-cyan via-cyber-purple to-cyber-pink"
            animate={{
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        )}
      </div>
    );
  }

  return (
    <motion.div
      className={cn(
        'border rounded-lg',
        colorStyle.border,
        intensity !== 'low' && shadowStyle,
        className
      )}
      whileHover={animated ? { scale: 1.02 } : undefined}
      animate={
        animated
          ? {
              boxShadow: [
                `0 0 10px rgba(0,255,242,0.2)`,
                `0 0 20px rgba(0,255,242,0.4)`,
                `0 0 10px rgba(0,255,242,0.2)`,
              ],
            }
          : undefined
      }
      transition={
        animated
          ? {
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }
          : undefined
      }
    >
      {children}
    </motion.div>
  );
}
