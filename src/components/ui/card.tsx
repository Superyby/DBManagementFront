import { forwardRef } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '../../lib/utils';

interface CardProps extends HTMLMotionProps<'div'> {
  variant?: 'default' | 'glow' | 'neon';
  hover?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', hover = true, children, ...props }, ref) => {
    const variants = {
      default: 'bg-cyber-surface border border-cyber-border',
      glow: 'bg-cyber-surface border border-cyber-cyan/30 shadow-glow-sm',
      neon: 'neon-border',
    };

    return (
      <motion.div
        ref={ref}
        className={cn(
          'relative rounded-xl overflow-hidden',
          variants[variant],
          hover && 'transition-all duration-300 hover:border-cyber-cyan/50 hover:shadow-glow-sm hover:-translate-y-1',
          className
        )}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        {...props}
      >
        {/* Top highlight line */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyber-cyan/50 to-transparent" />
        
        {children}
      </motion.div>
    );
  }
);

Card.displayName = 'Card';

// Card Header
export const CardHeader = forwardRef<HTMLDivElement, HTMLMotionProps<'div'>>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('px-6 py-4 border-b border-cyber-border', className)}
      {...props}
    >
      {children}
    </div>
  )
);

CardHeader.displayName = 'CardHeader';

// Card Content
export const CardContent = forwardRef<HTMLDivElement, HTMLMotionProps<'div'>>(
  ({ className, children, ...props }, ref) => (
    <div ref={ref} className={cn('px-6 py-4', className)} {...props}>
      {children}
    </div>
  )
);

CardContent.displayName = 'CardContent';

// Card Title
export const CardTitle = forwardRef<HTMLHeadingElement, HTMLMotionProps<'h3'>>(
  ({ className, children, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn('text-lg font-semibold text-cyber-text', className)}
      {...props}
    >
      {children}
    </h3>
  )
);

CardTitle.displayName = 'CardTitle';

// Card Description
export const CardDescription = forwardRef<HTMLParagraphElement, HTMLMotionProps<'p'>>(
  ({ className, children, ...props }, ref) => (
    <p ref={ref} className={cn('text-sm text-cyber-muted', className)} {...props}>
      {children}
    </p>
  )
);

CardDescription.displayName = 'CardDescription';

// Stat Card - for dashboard
interface StatCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  className?: string;
}

export function StatCard({ label, value, icon, trend, className }: StatCardProps) {
  return (
    <Card className={cn('p-6', className)}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-cyber-muted uppercase tracking-wider">{label}</p>
          <motion.p
            className="text-3xl font-mono font-bold text-cyber-cyan mt-2"
            style={{ textShadow: '0 0 20px rgba(0, 255, 242, 0.5)' }}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
          >
            {value}
          </motion.p>
        </div>
        {icon && (
          <div className="text-cyber-cyan/50 text-3xl">
            {icon}
          </div>
        )}
      </div>
      {trend && (
        <div className={cn(
          'mt-4 text-sm flex items-center gap-1',
          trend === 'up' && 'text-cyber-green',
          trend === 'down' && 'text-cyber-red',
          trend === 'neutral' && 'text-cyber-muted'
        )}>
          {trend === 'up' && '↑'}
          {trend === 'down' && '↓'}
          {trend === 'neutral' && '→'}
          <span>vs last period</span>
        </div>
      )}
    </Card>
  );
}
