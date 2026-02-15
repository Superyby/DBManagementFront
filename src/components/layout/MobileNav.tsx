import { NavLink, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTachometerAlt,
  faPlus,
  faCog,
  faList,
} from '@fortawesome/free-solid-svg-icons';

interface MobileNavProps {
  className?: string;
}

export function MobileNav({ className = '' }: MobileNavProps) {
  const location = useLocation();

  const navItems = [
    { path: '/dashboard', icon: faTachometerAlt, label: '首页' },
    { path: '/connections', icon: faList, label: '列表' },
    { path: '/add', icon: faPlus, label: '添加' },
    { path: '/settings', icon: faCog, label: '设置' },
  ];

  return (
    <nav className={`bottom-nav ${className}`}>
      {navItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) => 
            `nav-link ${isActive || location.pathname.startsWith(item.path) ? 'active' : ''}`
          }
        >
          <div>
            <FontAwesomeIcon icon={item.icon} />
          </div>
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}
