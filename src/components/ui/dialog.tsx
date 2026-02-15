import { useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from './button';

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  className,
  size = 'md',
}: DialogProps) {
  // Close on escape
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (open) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [open, handleKeyDown]);

  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-cyber-bg/80 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Scan line effect */}
          <motion.div
            className="absolute inset-0 pointer-events-none overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div
              className="absolute w-full h-[2px] bg-gradient-to-r from-transparent via-cyber-cyan/30 to-transparent"
              style={{
                animation: 'scan 3s linear infinite',
              }}
            />
          </motion.div>

          {/* Dialog */}
          <motion.div
            className={cn(
              'relative w-full bg-cyber-surface border border-cyber-border rounded-xl overflow-hidden',
              sizes[size],
              className
            )}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            {/* Top glow line */}
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyber-cyan to-transparent" />

            {/* Header */}
            {(title || description) && (
              <div className="px-6 py-4 border-b border-cyber-border">
                <div className="flex items-center justify-between">
                  {title && (
                    <h2 className="text-xl font-semibold text-cyber-text">
                      {title}
                    </h2>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onClose}
                    className="text-cyber-muted hover:text-cyber-text"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
                {description && (
                  <p className="mt-1 text-sm text-cyber-muted">{description}</p>
                )}
              </div>
            )}

            {/* Content */}
            <div className="px-6 py-4">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// Dialog Footer
interface DialogFooterProps {
  children: React.ReactNode;
  className?: string;
}

export function DialogFooter({ children, className }: DialogFooterProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-end gap-3 pt-4 mt-4 border-t border-cyber-border',
        className
      )}
    >
      {children}
    </div>
  );
}
