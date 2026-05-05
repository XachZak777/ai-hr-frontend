import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import Logo from './Logo';
import { notify } from '../utils/notifications';
import { getDisplayName } from '../utils/authState';

const adminLinks = [
  ['/admin-dashboard', 'Dashboard'],
  ['/admin-schedule', 'Schedule'],
];

const employerLinks = [
  ['/employer-dashboard', 'Dashboard'],
  ['/employer-jobs', 'My Jobs'],
  ['/employer-candidates', 'Applications'],
  ['/employer-schedule', 'Schedule'],
  ['/employer-ai', 'AI Agent'],
  ['/profile', 'Account'],
];

const employeeLinks = [
  ['/employee-dashboard', 'Dashboard'],
  ['/find-jobs', 'Find Jobs'],
  ['/employee-schedule', 'Interviews'],
];

const linksByRole = { admin: adminLinks, employer: employerLinks, employee: employeeLinks };

export default function TopNav({ onLogout, userRole = 'employer' }) {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { pathname } = useLocation();
  const navigate = useNavigate();

  if (pathname === '/signup' || pathname === '/login') return null;

  const links = linksByRole[userRole] ?? employerLinks;
  const displayName = getDisplayName() || 'Account';

  const handleLogout = async () => {
    await onLogout();
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
          <NavLink
            key={to}
            to={to}
            end
            className={({ isActive }) => `tab-link ${isActive ? 'active' : ''}`}
          >
            {label}
          </NavLink>
        ))}
      </div>
      <div className="nav-end">
        <div className="user-menu">
          <button className="user-button" onClick={() => setShowUserMenu((prev) => !prev)}>
            {displayName}
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
