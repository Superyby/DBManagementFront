import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-semibold uppercase tracking-wider transition-all duration-300',
  {
    variants: {
      variant: {
        default: 'bg-cyber-surface border border-cyber-border text-cyber-text',
        cyan: 'bg-cyber-cyan/10 border border-cyber-cyan/50 text-cyber-cyan',
        purple: 'bg-cyber-purple/10 border border-cyber-purple/50 text-cyber-purple',
        pink: 'bg-cyber-pink/10 border border-cyber-pink/50 text-cyber-pink',
        green: 'bg-cyber-green/10 border border-cyber-green/50 text-cyber-green',
        red: 'bg-cyber-red/10 border border-cyber-red/50 text-cyber-red',
        orange: 'bg-cyber-orange/10 border border-cyber-orange/50 text-cyber-orange',
      },
      glow: {
        true: '',
        false: '',
      },
    },
    compoundVariants: [
      { variant: 'cyan', glow: true, className: 'shadow-[0_0_10px_rgba(0,255,242,0.3)]' },
      { variant: 'purple', glow: true, className: 'shadow-[0_0_10px_rgba(191,0,255,0.3)]' },
      { variant: 'green', glow: true, className: 'shadow-[0_0_10px_rgba(0,255,136,0.3)]' },
      { variant: 'red', glow: true, className: 'shadow-[0_0_10px_rgba(255,0,85,0.3)]' },
    ],
    defaultVariants: {
      variant: 'default',
      glow: false,
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  pulse?: boolean;
}

export function Badge({ className, variant, glow, pulse, children, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant, glow }), className)} {...props}>
      {pulse && (
        <span className="relative flex h-2 w-2">
          <span className={cn(
            'animate-ping absolute inline-flex h-full w-full rounded-full opacity-75',
            variant === 'green' && 'bg-cyber-green',
            variant === 'red' && 'bg-cyber-red',
            variant === 'cyan' && 'bg-cyber-cyan',
            variant === 'orange' && 'bg-cyber-orange',
            !variant && 'bg-cyber-cyan'
          )} />
          <span className={cn(
            'relative inline-flex rounded-full h-2 w-2',
            variant === 'green' && 'bg-cyber-green',
            variant === 'red' && 'bg-cyber-red',
            variant === 'cyan' && 'bg-cyber-cyan',
            variant === 'orange' && 'bg-cyber-orange',
            !variant && 'bg-cyber-cyan'
          )} />
        </span>
      )}
      {children}
    </span>
  );
}

// Database Type Badge
interface DbBadgeProps {
  type: string;
  className?: string;
}

const DB_COLORS: Record<string, string> = {
  mysql: 'cyan',
  postgres: 'purple',
  sqlite: 'default',
  redis: 'red',
  mongodb: 'green',
  clickhouse: 'orange',
  elasticsearch: 'cyan',
};

export function DbBadge({ type, className }: DbBadgeProps) {
  const variant = (DB_COLORS[type.toLowerCase()] || 'default') as BadgeProps['variant'];
  
  return (
    <Badge variant={variant} className={className}>
      {type.toUpperCase()}
    </Badge>
  );
}

// Status Badge
interface StatusBadgeProps {
  status: 'online' | 'offline' | 'connecting' | 'error';
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = {
    online: { variant: 'green' as const, label: 'Online', pulse: true },
    offline: { variant: 'default' as const, label: 'Offline', pulse: false },
    connecting: { variant: 'orange' as const, label: 'Connecting', pulse: true },
    error: { variant: 'red' as const, label: 'Error', pulse: false },
  };

  const { variant, label, pulse } = config[status];

  return (
    <Badge variant={variant} pulse={pulse} glow className={className}>
      {label}
    </Badge>
  );
}
