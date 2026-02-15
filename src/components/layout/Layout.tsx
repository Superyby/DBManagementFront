import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { MobileNav } from './MobileNav';
import { useTheme } from '../../hooks/useTheme';
import { useResponsive } from '../../hooks/useResponsive';

export function Layout() {
  const { isDark, toggleTheme } = useTheme();
  const { isMobile } = useResponsive();

  return (
    <div className={isDark ? 'dark' : 'light'}>
      {/* 桌面端 Header */}
      {!isMobile && (
        <Header isDark={isDark} onToggleTheme={toggleTheme} />
      )}

      {/* 移动端 Header - 简化版 */}
      {isMobile && (
        <header className="d-flex flex-wrap justify-content-center pt-2 pb-2 mb-3">
          <a href="/dashboard" className="d-flex align-items-center text-dark text-decoration-none">
            <span className="fs-4 title ms-2">DB Manager</span>
          </a>
        </header>
      )}

      {/* 主内容区域 */}
      <main>
        <Outlet />
      </main>

      {/* 移动端底部导航 */}
      {isMobile && (
        <>
          <div style={{ width: '100%', height: 'calc(60px + env(safe-area-inset-bottom))' }} />
          <MobileNav />
        </>
      )}
    </div>
  );
}
