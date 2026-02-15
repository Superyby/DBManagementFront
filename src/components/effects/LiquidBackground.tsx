import { useRef, useEffect } from 'react';
import gsap from 'gsap';

interface LiquidBlobProps {
  className?: string;
  colors?: string[];
  blur?: number;
  speed?: number;
}

// 液态流体背景 - 类似 lava lamp 效果
export function LiquidBlob({ 
  className = '',
  colors = ['#00fff2', '#bf00ff', '#ff00aa', '#00ff88'],
  blur = 80,
  speed = 20
}: LiquidBlobProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const blobs = container.querySelectorAll('.blob');
    
    blobs.forEach((blob, index) => {
      // 随机起始位置
      gsap.set(blob, {
        x: Math.random() * 100 - 50 + '%',
        y: Math.random() * 100 - 50 + '%',
        scale: 0.8 + Math.random() * 0.4,
      });

      // 无限循环动画
      gsap.to(blob, {
        x: `+=${Math.random() * 200 - 100}`,
        y: `+=${Math.random() * 200 - 100}`,
        scale: 0.6 + Math.random() * 0.8,
        duration: speed + Math.random() * 10,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
        delay: index * 0.5,
      });

      // 旋转动画
      gsap.to(blob, {
        rotation: 360,
        duration: speed * 2 + Math.random() * 20,
        ease: 'none',
        repeat: -1,
      });
    });
  }, [speed]);

  return (
    <div 
      ref={containerRef}
      className={`fixed inset-0 overflow-hidden pointer-events-none ${className}`}
      style={{ filter: `blur(${blur}px)` }}
    >
      {colors.map((color, i) => (
        <div
          key={i}
          className="blob absolute w-[40vmax] h-[40vmax] rounded-full opacity-40"
          style={{
            background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
            left: `${25 * i}%`,
            top: `${20 + i * 15}%`,
          }}
        />
      ))}
    </div>
  );
}

// 数据流/矩阵雨效果
export function MatrixRain({ className = '' }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()_+-=[]{}|;:,.<>?アイウエオカキクケコサシスセソタチツテト';
    const fontSize = 14;
    const columns = Math.floor(canvas.width / fontSize);
    const drops: number[] = Array(columns).fill(1);

    const draw = () => {
      // 半透明黑色覆盖，形成拖尾效果
      ctx.fillStyle = 'rgba(10, 10, 15, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#00fff2';
      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        // 随机字符
        const char = chars[Math.floor(Math.random() * chars.length)];
        const x = i * fontSize;
        const y = drops[i] * fontSize;

        // 渐变颜色
        const gradient = ctx.createLinearGradient(x, y - 50, x, y);
        gradient.addColorStop(0, 'rgba(0, 255, 242, 0)');
        gradient.addColorStop(0.5, 'rgba(0, 255, 242, 0.5)');
        gradient.addColorStop(1, '#00fff2');
        ctx.fillStyle = gradient;

        ctx.fillText(char, x, y);

        // 重置到顶部
        if (y > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    };

    const interval = setInterval(draw, 50);

    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 pointer-events-none opacity-30 ${className}`}
    />
  );
}

// 噪点纹理覆盖
export function NoiseOverlay({ opacity = 0.03 }: { opacity?: number }) {
  return (
    <div 
      className="fixed inset-0 pointer-events-none z-50 mix-blend-overlay"
      style={{
        opacity,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
      }}
    />
  );
}

// 扫描线效果
export function ScanLines({ opacity = 0.1 }: { opacity?: number }) {
  return (
    <div 
      className="fixed inset-0 pointer-events-none z-40"
      style={{
        opacity,
        background: `repeating-linear-gradient(
          0deg,
          transparent,
          transparent 2px,
          rgba(0, 0, 0, 0.3) 2px,
          rgba(0, 0, 0, 0.3) 4px
        )`,
      }}
    />
  );
}

// 六边形网格背景
export function HexGrid({ color = '#00fff2', opacity = 0.1 }: { color?: string; opacity?: number }) {
  return (
    <div 
      className="fixed inset-0 pointer-events-none"
      style={{
        opacity,
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='49' viewBox='0 0 28 49'%3E%3Cg fill-rule='evenodd'%3E%3Cg fill='${encodeURIComponent(color)}' fill-opacity='0.4'%3E%3Cpath d='M13.99 9.25l13 7.5v15l-13 7.5L1 31.75v-15l12.99-7.5zM3 17.9v12.7l10.99 6.34 11-6.35V17.9l-11-6.34L3 17.9zM0 15l12.98-7.5V0h-2v6.35L0 12.69v2.3zm0 18.5L12.98 41v8h-2v-6.85L0 35.81v-2.3zM15 0v7.5L27.99 15H28v-2.31h-.01L17 6.35V0h-2zm0 49v-8l12.99-7.5H28v2.31h-.01L17 42.15V49h-2z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      }}
    />
  );
}
