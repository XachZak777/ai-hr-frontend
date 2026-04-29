import { useNavigate } from 'react-router-dom';
import { notify } from '../utils/notifications';

export function BrandHeader({ links = [], user = 'EU' }) {
  const navigate = useNavigate();
  const routes = getHeaderRoutes(links, user);

  return (
    <header className="brand-row">
      <div className="mini-links">
        {links.map((link) => (
          <span key={link} className="nav-link" onClick={() => navigate(routes[link] || '/')}>{link}</span>
        ))}
      </div>
      <div className="avatar">{user}</div>
    </header>
  );
}

function getHeaderRoutes(links, user) {
  const isAdmin = user === 'AU';
  const isEmployee = links.includes('Find Jobs');

  if (isAdmin) {
    return { Dashboard: '/admin-dashboard', Schedule: '/admin-schedule' };
  }

  if (isEmployee) {
    return { Dashboard: '/employee-dashboard', Schedule: '/employee-schedule', 'Find Jobs': '/find-jobs', 'My Jobs': '/my-jobs' };
  }

  return { Dashboard: '/employer-dashboard', Schedule: '/employer-schedule' };
}

export function StatsRow({ items }) {
  return (
    <section className="stats-grid">
      {items.map((item) => (
        <article key={item.title} className="card stat-card">
          <p className="muted">{item.title}</p>
          <h3>{item.value}</h3>
          <p className="accent">{item.note}</p>
        </article>
      ))}
    </section>
  );
}

export function PageTitle({ title, subtitle, actions }) {
  return (
    <div className="title-row">
      <div>
        <h1>{title}</h1>
        {subtitle && <p className="muted">{subtitle}</p>}
      </div>
      {actions}
    </div>
  );
}

export function Tabs({ tabs, activeTab, onChange }) {
  const navigate = useNavigate();

  return (
    <div className="tabs-with-home">
      <div className="tabs">
        {tabs.map((tab) => (
          <span
            key={tab}
            className={activeTab === tab ? 'active' : ''}
            onClick={() => onChange(tab)}
          >
            {tab}
          </span>
        ))}
      </div>
      <button className="btn-light tabs-home-btn" onClick={() => navigate('/')}>Home</button>
    </div>
  );
}

export function DashboardSection({ title, children }) {
  return (
    <section className="dashboard-section">
      {title && <h3>{title}</h3>}
      {children}
    </section>
  );
}

export function QuickStatsRow({ items }) {
  return (
    <div className="quick-stats-row">
      {items.map((stat) => (
        <div key={stat.label} className="stat-card">
          <p className="muted">{stat.label}</p>
          <h3>{stat.count}</h3>
        </div>
      ))}
    </div>
  );
}

export function EventCards({ events }) {
  return (
    <div className="events-stack">
      {events.map((event) => (
        <article key={event.title} className="card event-card">
          <div className="row-between">
            <h4>{event.title}</h4>
            <span className={`pill ${event.status}`}>{event.status}</span>
          </div>
          <p className="muted">{event.time}</p>
          <p>{event.metaA}</p>
          <p>{event.metaB}</p>
          <div className="inline-actions">
            <button className="btn-dark" onClick={() => notify(`${event.primary}: ${event.title}`)}>{event.primary}</button>
            <button className="btn-light" onClick={() => notify(`Rescheduling ${event.title}`)}>Reschedule</button>
            <button className="btn-light" onClick={() => notify(`Editing ${event.title}`)}>Edit</button>
          </div>
        </article>
      ))}
    </div>
  );
}
