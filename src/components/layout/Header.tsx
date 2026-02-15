import { NavLink } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTachometerAlt,
  faCog,
  faDatabase,
  faMoon,
  faSun,
  faAngleDown,
} from '@fortawesome/free-solid-svg-icons';

interface HeaderProps {
  isDark: boolean;
  onToggleTheme: () => void;
}

export function Header({ isDark, onToggleTheme }: HeaderProps) {
  return (
    <header className="d-flex flex-wrap justify-content-center py-3 mb-3 border-bottom">
      {/* Logo */}
      <NavLink
        to="/dashboard"
        className="d-flex align-items-center mb-3 mb-md-0 me-md-auto text-dark text-decoration-none"
      >
        <FontAwesomeIcon 
          icon={faDatabase} 
          className="me-2 ms-4" 
          style={{ fontSize: '28px', color: '#5cdd8b' }}
        />
        <span className="fs-4 title">DB Manager</span>
      </NavLink>

      {/* 导航菜单 */}
      <ul className="nav nav-pills">
        <li className="nav-item me-2">
          <NavLink 
            to="/dashboard" 
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            <FontAwesomeIcon icon={faTachometerAlt} className="me-1" />
            仪表盘
          </NavLink>
        </li>

        {/* 用户下拉菜单 */}
        <li className="nav-item">
          <div className="dropdown dropdown-profile-pic">
            <div 
              className="nav-link" 
              data-bs-toggle="dropdown"
              role="button"
            >
              <div className="profile-pic">A</div>
              <FontAwesomeIcon icon={faAngleDown} />
            </div>

            <ul className="dropdown-menu dropdown-menu-end">
              <li>
                <span className="dropdown-item-text">
                  管理员
                </span>
              </li>

              <li><hr className="dropdown-divider" /></li>

              {/* 主题切换 */}
              <li>
                <button 
                  className="dropdown-item"
                  onClick={onToggleTheme}
                >
                  <FontAwesomeIcon 
                    icon={isDark ? faSun : faMoon} 
                    className="me-2"
                  />
                  {isDark ? '浅色模式' : '深色模式'}
                </button>
              </li>

              <li>
                <NavLink to="/settings" className="dropdown-item">
                  <FontAwesomeIcon icon={faCog} className="me-2" />
                  设置
                </NavLink>
              </li>
            </ul>
          </div>
        </li>
      </ul>
    </header>
  );
}
