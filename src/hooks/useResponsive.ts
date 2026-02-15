import { useState, useEffect, useCallback } from 'react';

// 断点配置
const BREAKPOINTS = {
  mobile: 770,    // 移动端断点
  tablet: 992,    // 平板断点
  desktop: 1200,  // 桌面端断点
};

export function useResponsive() {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  // 更新窗口尺寸
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 是否为移动端
  const isMobile = windowSize.width <= BREAKPOINTS.mobile;
  
  // 是否为平板
  const isTablet = windowSize.width > BREAKPOINTS.mobile && windowSize.width <= BREAKPOINTS.tablet;
  
  // 是否为桌面端
  const isDesktop = windowSize.width > BREAKPOINTS.tablet;

  // 获取当前设备类型
  const getDeviceType = useCallback((): 'mobile' | 'tablet' | 'desktop' => {
    if (isMobile) return 'mobile';
    if (isTablet) return 'tablet';
    return 'desktop';
  }, [isMobile, isTablet]);

  return {
    windowSize,
    isMobile,
    isTablet,
    isDesktop,
    deviceType: getDeviceType(),
    breakpoints: BREAKPOINTS,
  };
}
