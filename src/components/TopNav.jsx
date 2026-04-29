import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import Logo from './Logo';
import { notify } from '../utils/notifications';
import { getUserProfile } from '../utils/profile';

const adminLinks = [
  ['/', 'Home'],
  ['/admin-dashboard', 'Dashboard'],
  ['/admin-schedule', 'Schedule'],
];

const employerLinks = [
  ['/', 'Home'],
  ['/employer-dashboard', 'Dashboard'],
  ['/post-new-job', 'Post Job'],
  ['/employer-schedule', 'Schedule'],
];

const employeeLinks = [
  ['/', 'Home'],
  ['/employee-dashboard', 'Dashboard'],
  ['/employee-schedule', 'Schedule'],
  ['/find-jobs', 'Find Jobs'],
  ['/my-jobs', 'My Jobs'],
];

export default function TopNav({ onLogout, userRole = 'employer', theme = 'light', onThemeChange }) {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const links = userRole === 'admin' ? adminLinks : userRole === 'employee' ? employeeLinks : employerLinks;
  const profile = getUserProfile(userRole);

  const isSignupOrLogin = pathname === '/signup' || pathname === '/login';
  if (isSignupOrLogin) return null;

  const handleLogout = () => {
    onLogout();
    navigate('/');
    setShowUserMenu(false);
    notify('Signed out successfully.', 'success');
  };

  const handleLogoClick = () => {
    navigate('/');
    setShowUserMenu(false);
  };

  const handleMenuNavigate = (path) => {
    navigate(path);
    setShowUserMenu(false);
  };

  return (
    <nav className="top-nav">
      <button className="brand logo-brand" onClick={handleLogoClick} aria-label="Go to home">
        <Logo compact />
      </button>
      <div className="nav-links">
        {links.map(([to, label]) => (
          <NavLink key={to} to={to} className={({ isActive }) => `tab-link ${isActive ? 'active' : ''}`}>
            {label}
          </NavLink>
        ))}
      </div>
      <div className="nav-end">
        <ThemeToggle theme={theme} onThemeChange={onThemeChange} />
        <div className="user-menu">
          <button className="user-button" onClick={() => setShowUserMenu(!showUserMenu)}>
            👤 {profile.name || userRole.charAt(0).toUpperCase() + userRole.slice(1)}
          </button>
          {showUserMenu && (
            <div className="user-dropdown">
              <button className="dropdown-item" onClick={() => handleMenuNavigate('/profile')}>Profile Settings</button>
              <button className="dropdown-item" onClick={() => handleMenuNavigate('/notifications')}>Notifications</button>
              <hr />
              <button onClick={handleLogout} className="dropdown-item logout-btn">Sign Out</button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

function ThemeToggle({ theme, onThemeChange }) {
  const nextTheme = theme === 'light' ? 'dark' : 'light';

  return (
    <button className="theme-toggle" onClick={() => onThemeChange?.(nextTheme)} aria-label="Change theme">
      {theme === 'light' ? 'Dark' : 'Light'}
    </button>
  );
}
