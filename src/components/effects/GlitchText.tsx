import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

interface GlitchTextProps {
  text: string;
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'span' | 'p';
}

export function GlitchText({ text, className = '', as: Component = 'span' }: GlitchTextProps) {
  return (
    <Component className={cn('relative inline-block', className)}>
      {/* 主文本 */}
      <span className="relative z-10">{text}</span>
      
      {/* 故障层 - 青色 */}
      <motion.span
        className="absolute top-0 left-0 text-cyber-cyan opacity-70 z-0"
        aria-hidden
        animate={{
          x: [0, -2, 2, -1, 0],
          opacity: [0.7, 0.5, 0.8, 0.6, 0.7],
        }}
        transition={{
          duration: 0.5,
          repeat: Infinity,
          repeatDelay: 3,
        }}
        style={{ clipPath: 'inset(10% 0 60% 0)' }}
      >
        {text}
      </motion.span>
      
      {/* 故障层 - 粉色 */}
      <motion.span
        className="absolute top-0 left-0 text-cyber-pink opacity-70 z-0"
        aria-hidden
        animate={{
          x: [0, 2, -2, 1, 0],
          opacity: [0.7, 0.8, 0.5, 0.7, 0.7],
        }}
        transition={{
          duration: 0.5,
          repeat: Infinity,
          repeatDelay: 3,
          delay: 0.1,
        }}
        style={{ clipPath: 'inset(50% 0 20% 0)' }}
      >
        {text}
      </motion.span>
    </Component>
  );
}

// 打字机效果组件
interface TypeWriterProps {
  text: string;
  className?: string;
  speed?: number;
  cursor?: boolean;
}

export function TypeWriter({ 
  text, 
  className = '', 
  speed = 50,
  cursor = true 
}: TypeWriterProps) {
  return (
    <motion.span className={cn('inline-block', className)}>
      {text.split('').map((char, index) => (
        <motion.span
          key={index}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{
            duration: 0.05,
            delay: index * (speed / 1000),
          }}
        >
          {char}
        </motion.span>
      ))}
      {cursor && (
        <motion.span
          className="inline-block w-[2px] h-[1em] bg-cyber-cyan ml-1 align-middle"
          animate={{ opacity: [1, 0, 1] }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            ease: 'steps(2)',
          }}
        />
      )}
    </motion.span>
  );
}

// 数字滚动动画组件
interface AnimatedNumberProps {
  value: number;
  className?: string;
  duration?: number;
}

export function AnimatedNumber({ 
  value, 
  className = '', 
  duration = 1 
}: AnimatedNumberProps) {
  return (
    <motion.span
      className={cn('tabular-nums', className)}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        key={value}
      >
        {value}
      </motion.span>
    </motion.span>
  );
}

// 扫描线效果
export function ScanLine() {
  return (
    <motion.div
      className="absolute inset-0 pointer-events-none overflow-hidden z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.div
        className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyber-cyan/30 to-transparent"
        animate={{
          top: ['-2px', '100%'],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
    </motion.div>
  );
}
