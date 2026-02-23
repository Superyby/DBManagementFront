import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, useMotionValue, useSpring, AnimatePresence } from 'framer-motion';

export function CustomCursor() {
  const [isPointer, setIsPointer] = useState(false);
  const [isText, setIsText] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);
  const rippleId = useRef(0);

  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);

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
    const id = ++rippleId.current;
    setRipples(prev => [...prev, { id, x: e.clientX, y: e.clientY }]);
    setTimeout(() => setRipples(prev => prev.filter(r => r.id !== id)), 600);
  }, []);

  const handleMouseUp = useCallback(() => { setIsPressed(false); }, []);
  const handleMouseEnter = useCallback(() => { setIsVisible(true); }, []);
  const handleMouseLeave = useCallback(() => { setIsVisible(false); }, []);

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

  if (typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches) {
    return null;
  }

  // Use CSS variables for theme-aware cursor colors
  return (
    <>
      {/* Click ripple */}
      <AnimatePresence>
        {ripples.map((ripple) => (
          <motion.div
            key={ripple.id}
            className="fixed pointer-events-none z-[9999]"
            style={{ left: ripple.x, top: ripple.y }}
            initial={{ opacity: 0.4 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            <motion.div
              className="rounded-full -translate-x-1/2 -translate-y-1/2"
              style={{ borderWidth: 1, borderColor: 'var(--cursor-ring)' }}
              initial={{ width: 0, height: 0 }}
              animate={{ width: 50, height: 50 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            />
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Outer ring */}
      <motion.div
        className="fixed pointer-events-none z-[9998] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{ left: ringX, top: ringY }}
        animate={{
          width: isText ? 2 : isPointer ? 40 : 28,
          height: isText ? 24 : isPointer ? 40 : 28,
          borderRadius: isText ? 1 : 9999,
          opacity: isVisible ? 1 : 0,
          borderWidth: isText ? 0 : 1,
          borderColor: 'var(--cursor-ring)',
          backgroundColor: isText ? 'var(--cursor-dot)' : 'transparent',
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

      {/* Inner dot */}
      <motion.div
        className="fixed pointer-events-none z-[9999] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{ left: mouseX, top: mouseY }}
        animate={{
          width: isText ? 0 : isPointer ? 5 : 5,
          height: isText ? 0 : isPointer ? 5 : 5,
          opacity: isVisible ? 1 : 0,
          backgroundColor: 'var(--cursor-dot)',
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
