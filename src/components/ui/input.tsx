import { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';
import { Search } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, icon, type = 'text', ...props }, ref) => {
    return (
      <div className="space-y-2">
        {label && (
          <label className="block text-sm font-medium text-cyber-muted uppercase tracking-wider">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-cyber-muted">
              {icon}
            </div>
          )}
          <motion.input
            ref={ref}
            type={type}
            className={cn(
              'w-full px-4 py-3 bg-cyber-bg border border-cyber-border rounded-lg',
              'text-cyber-text placeholder-cyber-muted font-mono',
              'focus:outline-none focus:border-cyber-cyan focus:shadow-glow-sm',
              'transition-all duration-300',
              icon && 'pl-10',
              error && 'border-cyber-red focus:border-cyber-red',
              className
            )}
            whileFocus={{ scale: 1.01 }}
            {...props}
          />
          {/* Focus glow effect */}
          <div className="absolute inset-0 rounded-lg pointer-events-none opacity-0 transition-opacity duration-300 peer-focus:opacity-100">
            <div className="absolute inset-0 rounded-lg bg-cyber-cyan/5" />
          </div>
        </div>
        {error && (
          <motion.p
            className="text-sm text-cyber-red"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {error}
          </motion.p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

// Search Input
interface SearchInputProps extends Omit<InputProps, 'icon'> {}

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  ({ className, ...props }, ref) => {
    return (
      <Input
        ref={ref}
        icon={<Search className="w-4 h-4" />}
        placeholder="Search..."
        className={className}
        {...props}
      />
    );
  }
);

SearchInput.displayName = 'SearchInput';

// Select
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, options, ...props }, ref) => {
    return (
      <div className="space-y-2">
        {label && (
          <label className="block text-sm font-medium text-cyber-muted uppercase tracking-wider">
            {label}
          </label>
        )}
        <select
          ref={ref}
          className={cn(
            'w-full px-4 py-3 bg-cyber-bg border border-cyber-border rounded-lg',
            'text-cyber-text font-mono appearance-none cursor-pointer',
            'focus:outline-none focus:border-cyber-cyan focus:shadow-glow-sm',
            'transition-all duration-300',
            error && 'border-cyber-red',
            className
          )}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error && (
          <p className="text-sm text-cyber-red">{error}</p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
