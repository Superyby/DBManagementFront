import { forwardRef } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const buttonVariants = cva(
  'relative inline-flex items-center justify-center gap-2 font-mono font-semibold uppercase tracking-wider transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden',
  {
    variants: {
      variant: {
        default: [
          'bg-cyber-surface border border-cyber-cyan/50 text-cyber-cyan',
          'hover:border-cyber-cyan hover:shadow-neon-cyan',
        ],
        primary: [
          'bg-cyber-cyan/10 border border-cyber-cyan text-cyber-cyan',
          'hover:bg-cyber-cyan/20 hover:shadow-neon-cyan',
        ],
        secondary: [
          'bg-cyber-purple/10 border border-cyber-purple text-cyber-purple',
          'hover:bg-cyber-purple/20 hover:shadow-neon-purple',
        ],
        danger: [
          'bg-cyber-red/10 border border-cyber-red text-cyber-red',
          'hover:bg-cyber-red/20',
        ],
        neon: [
          'bg-gradient-to-r from-cyber-cyan/20 to-cyber-purple/20 border border-cyber-cyan text-cyber-cyan',
          'hover:from-cyber-cyan/30 hover:to-cyber-purple/30 hover:shadow-neon-cyan',
        ],
        ghost: [
          'bg-transparent border border-transparent text-cyber-muted',
          'hover:bg-cyber-surface hover:text-cyber-text',
        ],
        outline: [
          'bg-transparent border border-cyber-border text-cyber-text',
          'hover:border-cyber-cyan hover:text-cyber-cyan',
        ],
      },
      size: {
        sm: 'px-3 py-1.5 text-xs',
        md: 'px-4 py-2 text-sm',
        lg: 'px-6 py-3 text-base',
        icon: 'p-2',
      },
      rounded: {
        default: 'rounded-lg',
        full: 'rounded-full',
        cyber: 'clip-path-cyber',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
      rounded: 'default',
    },
  }
);

export interface ButtonProps
  extends Omit<HTMLMotionProps<'button'>, 'children'>,
    VariantProps<typeof buttonVariants> {
  children?: React.ReactNode;
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, rounded, isLoading, children, ...props }, ref) => {
    return (
      <motion.button
        ref={ref}
        className={cn(buttonVariants({ variant, size, rounded, className }))}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        {...props}
      >
        {/* Hover effect overlay */}
        <motion.span
          className="absolute inset-0 bg-gradient-to-r from-cyber-cyan/0 via-cyber-cyan/10 to-cyber-cyan/0"
          initial={{ x: '-100%' }}
          whileHover={{ x: '100%' }}
          transition={{ duration: 0.5 }}
        />
        
        {/* Loading spinner */}
        {isLoading && (
          <svg
            className="animate-spin h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        )}
        
        <span className="relative z-10">{children}</span>
      </motion.button>
    );
  }
);

Button.displayName = 'Button';
