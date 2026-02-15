import { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { Zap } from 'lucide-react';

interface LoadingScreenProps {
  onComplete?: () => void;
  minDuration?: number;
}

export function LoadingScreen({ onComplete, minDuration = 2000 }: LoadingScreenProps) {
  const [visible, setVisible] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const logo = logoRef.current;
    const text = textRef.current;
    const progress = progressRef.current;
    const glow = glowRef.current;

    if (!container || !logo || !text || !progress || !glow) return;

    const tl = gsap.timeline();

    // 初始状态
    gsap.set([logo, text], { opacity: 0, y: 20 });
    gsap.set(progress, { scaleX: 0, transformOrigin: 'left' });
    gsap.set(glow, { opacity: 0, scale: 0.5 });

    // Logo 入场
    tl.to(logo, {
      opacity: 1,
      y: 0,
      duration: 0.6,
      ease: 'power3.out',
    });

    // 发光效果
    tl.to(glow, {
      opacity: 0.6,
      scale: 1.5,
      duration: 0.8,
      ease: 'power2.out',
    }, '-=0.3');

    // 文字入场
    tl.to(text, {
      opacity: 1,
      y: 0,
      duration: 0.5,
      ease: 'power2.out',
    }, '-=0.4');

    // 进度条动画
    tl.to(progress, {
      scaleX: 1,
      duration: minDuration / 1000,
      ease: 'power1.inOut',
    }, '-=0.3');

    // 脉冲发光
    tl.to(glow, {
      opacity: 1,
      scale: 2,
      duration: 0.3,
      ease: 'power2.out',
    });

    // 退出动画
    tl.to(container, {
      opacity: 0,
      scale: 1.1,
      duration: 0.5,
      ease: 'power2.in',
      onComplete: () => {
        setVisible(false);
        onComplete?.();
      },
    });

    return () => {
      tl.kill();
    };
  }, [minDuration, onComplete]);

  if (!visible) return null;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[200] bg-cyber-bg flex items-center justify-center"
    >
      {/* 网格背景 */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0,255,242,0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,255,242,0.05) 1px, transparent 1px)
          `,
          backgroundSize: '30px 30px',
        }}
      />

      {/* 扫描线 */}
      <div
        className="absolute inset-0 pointer-events-none overflow-hidden"
        style={{
          background: `
            repeating-linear-gradient(
              0deg,
              transparent,
              transparent 2px,
              rgba(0, 255, 242, 0.03) 2px,
              rgba(0, 255, 242, 0.03) 4px
            )
          `,
        }}
      />

      <div className="relative flex flex-col items-center">
        {/* 发光背景 */}
        <div
          ref={glowRef}
          className="absolute w-32 h-32 rounded-full bg-cyber-cyan/30 blur-3xl"
        />

        {/* Logo */}
        <div ref={logoRef} className="relative mb-6">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-cyber-cyan to-cyber-purple flex items-center justify-center">
            <Zap className="w-10 h-10 text-white" />
          </div>
          
          {/* Logo 边框动画 */}
          <div className="absolute inset-0 rounded-2xl border-2 border-cyber-cyan/50 animate-pulse" />
        </div>

        {/* 文字 */}
        <div ref={textRef} className="text-center mb-8">
          <h1 className="text-2xl font-bold text-cyber-text mb-1">DB Manager</h1>
          <p className="text-cyber-muted text-sm font-mono">初始化系统...</p>
        </div>

        {/* 进度条 */}
        <div className="w-48 h-1 bg-cyber-border rounded-full overflow-hidden">
          <div
            ref={progressRef}
            className="h-full bg-gradient-to-r from-cyber-cyan to-cyber-purple rounded-full"
          />
        </div>

        {/* 版本号 */}
        <div className="mt-6 text-cyber-muted text-xs font-mono">
          v1.0.0
        </div>
      </div>

      {/* 角落装饰 */}
      <div className="absolute top-4 left-4 w-16 h-16 border-l-2 border-t-2 border-cyber-cyan/30" />
      <div className="absolute top-4 right-4 w-16 h-16 border-r-2 border-t-2 border-cyber-cyan/30" />
      <div className="absolute bottom-4 left-4 w-16 h-16 border-l-2 border-b-2 border-cyber-cyan/30" />
      <div className="absolute bottom-4 right-4 w-16 h-16 border-r-2 border-b-2 border-cyber-cyan/30" />
    </div>
  );
}

// 简单的加载动画
export function LoadingSpinner({ size = 'md', className = '' }: { size?: 'sm' | 'md' | 'lg'; className?: string }) {
  const sizeMap = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className={`relative ${sizeMap[size]} ${className}`}>
      <div className="absolute inset-0 rounded-full border-2 border-cyber-border" />
      <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-cyber-cyan animate-spin" />
    </div>
  );
}

// 骨架屏组件
export function Skeleton({ className = '', animated = true }: { className?: string; animated?: boolean }) {
  return (
    <div
      className={`bg-cyber-surface rounded ${animated ? 'animate-pulse' : ''} ${className}`}
    />
  );
}

// 数据加载占位
export function DataLoading({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4 rounded-lg bg-cyber-surface/50">
          <Skeleton className="w-10 h-10 rounded-lg" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="w-16 h-8 rounded" />
        </div>
      ))}
    </div>
  );
}
