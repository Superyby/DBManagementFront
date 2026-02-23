import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, useMotionValue, useSpring, AnimatePresence } from 'framer-motion';

/**
 * 自定义光标组件
 * - 内圈：小圆点，紧跟鼠标
 * - 外圈：柔和光环，弹性跟随
 * - hover 按钮/链接时外圈放大 + 变色
 * - 点击时缩放脉冲动画
 * - 文本输入时变为竖线光标
 */
export function CustomCursor() {
  const [isPointer, setIsPointer] = useState(false);
  const [isText, setIsText] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);
  const rippleId = useRef(0);

  // 使用 motion values 做高性能跟踪
  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);

  // 外圈弹性跟随
  const springConfig = { damping: 25, stiffness: 250, mass: 0.5 };
  const ringX = useSpring(mouseX, springConfig);
  const ringY = useSpring(mouseY, springConfig);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    mouseX.set(e.clientX);
    mouseY.set(e.clientY);
    if (!isVisible) setIsVisible(true);
  }, [mouseX, mouseY, isVisible]);

  const handleMouseDown = useCallback((e: MouseEvent) => {
    setIsPressed(true);
    // 点击涟漪
    const id = ++rippleId.current;
    setRipples(prev => [...prev, { id, x: e.clientX, y: e.clientY }]);
    setTimeout(() => setRipples(prev => prev.filter(r => r.id !== id)), 600);
  }, []);

  const handleMouseUp = useCallback(() => {
    setIsPressed(false);
  }, []);

  const handleMouseEnter = useCallback(() => {
    setIsVisible(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsVisible(false);
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    document.documentElement.addEventListener('mouseenter', handleMouseEnter);
    document.documentElement.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      document.documentElement.removeEventListener('mouseenter', handleMouseEnter);
      document.documentElement.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [handleMouseMove, handleMouseDown, handleMouseUp, handleMouseEnter, handleMouseLeave]);

  // 检测 hover 元素类型
  useEffect(() => {
    const checkElement = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target) return;

      const el = target.closest('a, button, [role="button"], input[type="submit"], select, label[for], .cursor-pointer');
      const textEl = target.closest('input:not([type="submit"]):not([type="button"]):not([type="checkbox"]):not([type="radio"]), textarea, [contenteditable="true"]');

      setIsPointer(!!el);
      setIsText(!!textEl);
    };

    window.addEventListener('mouseover', checkElement);
    return () => window.removeEventListener('mouseover', checkElement);
  }, []);

  // 不在触屏设备上显示
  if (typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches) {
    return null;
  }

  return (
    <>
      {/* 点击涟漪 */}
      <AnimatePresence>
        {ripples.map((ripple) => (
          <motion.div
            key={ripple.id}
            className="fixed pointer-events-none z-[9999]"
            style={{ left: ripple.x, top: ripple.y }}
            initial={{ opacity: 0.5 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            <motion.div
              className="rounded-full border border-blue-500/50 -translate-x-1/2 -translate-y-1/2"
              initial={{ width: 0, height: 0 }}
              animate={{ width: 60, height: 60 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            />
          </motion.div>
        ))}
      </AnimatePresence>

      {/* 外圈 — 弹性跟随 */}
      <motion.div
        className="fixed pointer-events-none z-[9998] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          left: ringX,
          top: ringY,
        }}
        animate={{
          width: isText ? 2 : isPointer ? 44 : 32,
          height: isText ? 28 : isPointer ? 44 : 32,
          borderRadius: isText ? 1 : 9999,
          opacity: isVisible ? 1 : 0,
          borderWidth: isText ? 0 : isPointer ? 1.5 : 1,
          borderColor: isPointer ? 'rgba(59,130,246,0.5)' : 'rgba(255,255,255,0.15)',
          backgroundColor: isText
            ? 'rgba(59,130,246,0.5)'
            : isPointer
              ? 'rgba(59,130,246,0.06)'
              : 'transparent',
          scale: isPressed ? 0.75 : 1,
        }}
        transition={{
          width: { type: 'spring', stiffness: 300, damping: 25 },
          height: { type: 'spring', stiffness: 300, damping: 25 },
          scale: { type: 'spring', stiffness: 400, damping: 20 },
          opacity: { duration: 0.15 },
          default: { duration: 0.15 },
        }}
      />

      {/* 内圈 — 精确跟随 */}
      <motion.div
        className="fixed pointer-events-none z-[9999] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          left: mouseX,
          top: mouseY,
        }}
        animate={{
          width: isText ? 0 : isPointer ? 5 : 6,
          height: isText ? 0 : isPointer ? 5 : 6,
          opacity: isVisible ? 1 : 0,
          backgroundColor: isPointer ? '#3b82f6' : 'rgba(255,255,255,0.85)',
          scale: isPressed ? 0.5 : 1,
        }}
        transition={{
          scale: { type: 'spring', stiffness: 500, damping: 20 },
          opacity: { duration: 0.15 },
          default: { duration: 0.05 },
        }}
      />
    </>
  );
}
