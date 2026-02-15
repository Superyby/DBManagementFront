import { useRef, useEffect, useCallback } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// 注册 GSAP 插件
gsap.registerPlugin(ScrollTrigger);

// 基础入场动画 Hook
export function useGsapFadeIn(options: {
  delay?: number;
  duration?: number;
  y?: number;
  x?: number;
  scale?: number;
  stagger?: number;
} = {}) {
  const ref = useRef<HTMLElement>(null);
  const { delay = 0, duration = 0.6, y = 30, x = 0, scale = 1, stagger = 0.1 } = options;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const children = el.children.length > 0 ? el.children : [el];

    gsap.fromTo(
      children,
      { opacity: 0, y, x, scale },
      {
        opacity: 1,
        y: 0,
        x: 0,
        scale: 1,
        duration,
        delay,
        stagger,
        ease: 'power3.out',
      }
    );
  }, [delay, duration, y, x, scale, stagger]);

  return ref;
}

// 滚动触发动画 Hook
export function useGsapScrollTrigger(options: {
  trigger?: string;
  start?: string;
  end?: string;
  scrub?: boolean | number;
} = {}) {
  const ref = useRef<HTMLElement>(null);
  const { trigger, start = 'top 80%', end = 'bottom 20%', scrub = false } = options;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    gsap.fromTo(
      el,
      { opacity: 0, y: 50 },
      {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: trigger || el,
          start,
          end,
          scrub,
        },
      }
    );

    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, [trigger, start, end, scrub]);

  return ref;
}

// 霓虹脉冲动画 Hook
export function useNeonPulse(color: string = '#00fff2') {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const tl = gsap.timeline({ repeat: -1, yoyo: true });
    
    tl.to(el, {
      boxShadow: `0 0 10px ${color}, 0 0 20px ${color}, 0 0 30px ${color}`,
      duration: 1.5,
      ease: 'power2.inOut',
    });

    return () => {
      tl.kill();
    };
  }, [color]);

  return ref;
}

// 打字机动画 Hook
export function useTypewriter(text: string, options: {
  speed?: number;
  delay?: number;
  cursor?: boolean;
} = {}) {
  const ref = useRef<HTMLElement>(null);
  const { speed = 50, delay = 0 } = options;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    el.textContent = '';
    
    const chars = text.split('');
    let index = 0;

    const timer = setTimeout(() => {
      const interval = setInterval(() => {
        if (index < chars.length) {
          el.textContent += chars[index];
          index++;
        } else {
          clearInterval(interval);
        }
      }, speed);

      return () => clearInterval(interval);
    }, delay);

    return () => clearTimeout(timer);
  }, [text, speed, delay]);

  return ref;
}

// 数字滚动动画 Hook
export function useCountUp(endValue: number, options: {
  duration?: number;
  delay?: number;
  decimals?: number;
} = {}) {
  const ref = useRef<HTMLElement>(null);
  const { duration = 2, delay = 0, decimals = 0 } = options;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const counter = { value: 0 };

    gsap.to(counter, {
      value: endValue,
      duration,
      delay,
      ease: 'power2.out',
      onUpdate: () => {
        el.textContent = counter.value.toFixed(decimals);
      },
    });
  }, [endValue, duration, delay, decimals]);

  return ref;
}

// 3D 倾斜效果 Hook
export function useTilt3D(options: {
  maxTilt?: number;
  scale?: number;
  speed?: number;
} = {}) {
  const ref = useRef<HTMLElement>(null);
  const { maxTilt = 15, scale = 1.05, speed = 400 } = options;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -maxTilt;
      const rotateY = ((x - centerX) / centerX) * maxTilt;

      gsap.to(el, {
        rotateX,
        rotateY,
        scale,
        duration: speed / 1000,
        ease: 'power2.out',
      });
    };

    const handleMouseLeave = () => {
      gsap.to(el, {
        rotateX: 0,
        rotateY: 0,
        scale: 1,
        duration: speed / 1000,
        ease: 'power2.out',
      });
    };

    el.style.transformStyle = 'preserve-3d';
    el.addEventListener('mousemove', handleMouseMove);
    el.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      el.removeEventListener('mousemove', handleMouseMove);
      el.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [maxTilt, scale, speed]);

  return ref;
}

// 磁性按钮效果 Hook
export function useMagneticButton(strength: number = 0.3) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;

      gsap.to(el, {
        x: x * strength,
        y: y * strength,
        duration: 0.3,
        ease: 'power2.out',
      });
    };

    const handleMouseLeave = () => {
      gsap.to(el, {
        x: 0,
        y: 0,
        duration: 0.5,
        ease: 'elastic.out(1, 0.3)',
      });
    };

    el.addEventListener('mousemove', handleMouseMove);
    el.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      el.removeEventListener('mousemove', handleMouseMove);
      el.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [strength]);

  return ref;
}

// 文字分割动画工具函数
export function splitTextAnimation(
  element: HTMLElement,
  options: {
    type?: 'chars' | 'words' | 'lines';
    stagger?: number;
    duration?: number;
    delay?: number;
  } = {}
) {
  const { type = 'chars', stagger = 0.02, duration = 0.5, delay = 0 } = options;
  const text = element.textContent || '';
  
  let parts: string[] = [];
  
  if (type === 'chars') {
    parts = text.split('');
  } else if (type === 'words') {
    parts = text.split(' ');
  } else {
    parts = [text];
  }

  element.innerHTML = '';
  
  parts.forEach((part, i) => {
    const span = document.createElement('span');
    span.textContent = type === 'words' && i < parts.length - 1 ? part + ' ' : part;
    span.style.display = 'inline-block';
    span.style.opacity = '0';
    element.appendChild(span);
  });

  gsap.to(element.children, {
    opacity: 1,
    y: 0,
    stagger,
    duration,
    delay,
    ease: 'power3.out',
  });
}

// 波纹点击效果
export function createRipple(event: React.MouseEvent<HTMLElement>) {
  const element = event.currentTarget;
  const rect = element.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  const ripple = document.createElement('span');
  ripple.className = 'absolute rounded-full bg-white/30 pointer-events-none';
  ripple.style.left = `${x}px`;
  ripple.style.top = `${y}px`;
  ripple.style.width = '0';
  ripple.style.height = '0';
  ripple.style.transform = 'translate(-50%, -50%)';

  element.style.position = 'relative';
  element.style.overflow = 'hidden';
  element.appendChild(ripple);

  gsap.to(ripple, {
    width: Math.max(rect.width, rect.height) * 2,
    height: Math.max(rect.width, rect.height) * 2,
    opacity: 0,
    duration: 0.6,
    ease: 'power2.out',
    onComplete: () => ripple.remove(),
  });
}
