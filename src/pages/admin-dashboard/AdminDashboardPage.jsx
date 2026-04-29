import { useState } from 'react';
import { DashboardSection, PageTitle, StatsRow, Tabs } from '../../components/CommonBlocks';
import { notify } from '../../utils/notifications';
import { getUserProfile } from '../../utils/profile';

const dashboardTabs = ['Overview', 'Users', 'System', 'Analytics', 'Settings'];

const stats = [
  { title: 'Total Users', value: '2,847', note: '+12%' },
  { title: 'Active Companies', value: '156', note: '+8%' },
  { title: 'Monthly Hires', value: '492', note: '+23%' },
  { title: 'System Health', value: '99.8%', note: 'stable' }
];

const recentUsers = [
  { id: 1, name: 'Armen Sarkissian', email: 'armen@techarmenia.am', role: 'Employer', status: 'active' },
  { id: 2, name: 'Gayane Mkrtchyan', email: 'gayane@innovationhub.am', role: 'Employer', status: 'active' },
  { id: 3, name: 'Davit Harutyunyan', email: 'davit@example.am', role: 'Employee', status: 'active' },
  { id: 4, name: 'Anna Grigoryan', email: 'anna@example.am', role: 'Employee', status: 'pending' },
];

const systemMetrics = [
  { label: 'API Response Time', value: '45ms', status: 'good' },
  { label: 'Database Load', value: '32%', status: 'good' },
  { label: 'Memory Usage', value: '58%', status: 'good' },
  { label: 'Error Rate', value: '0.02%', status: 'excellent' },
];

const quickActions = [
  ['👥', 'Manage Users', 'View and manage platform users'],
  ['🔧', 'System Settings', 'Configure platform settings'],
  ['📊', 'View Reports', 'Generate and view reports'],
  ['⚠️', 'Support Tickets', 'Review support requests'],
];

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState('Overview');
  const profile = getUserProfile('admin');

  return (
    <main className="page dashboard">
      <PageTitle
        title="Admin Dashboard"
        subtitle={profile.headline || 'Platform management and oversight'}
        actions={<button className="btn-dark" onClick={() => window.location.href = '/admin-schedule'}>View Schedule</button>}
      />
      <Tabs tabs={dashboardTabs} activeTab={activeTab} onChange={setActiveTab} />
      <StatsRow items={stats} />
      <AdminTabContent activeTab={activeTab} setActiveTab={setActiveTab} />
    </main>
  );
}

function AdminTabContent({ activeTab, setActiveTab }) {
  if (activeTab === 'Overview') return <OverviewTab setActiveTab={setActiveTab} />;
  if (activeTab === 'Users') return <UsersTab />;
  if (activeTab === 'System') return <SystemTab />;
  if (activeTab === 'Analytics') return <AnalyticsTab />;
  if (activeTab === 'Settings') return <SettingsTab />;
  return null;
}

function OverviewTab({ setActiveTab }) {
  return (
    <>
      <DashboardSection title="Recent Users">
        <RecentUsersTable onView={() => setActiveTab('Users')} />
      </DashboardSection>
      <DashboardSection title="Quick Actions">
        <QuickActionsGrid setActiveTab={setActiveTab} />
      </DashboardSection>
    </>
  );
}

function UsersTab() {
  return (
    <DashboardSection title="User Management">
      <RecentUsersTable />
    </DashboardSection>
  );
}

function RecentUsersTable({ onView }) {
  return (
    <div className="table-wrapper">
      <table className="data-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {recentUsers.map((user) => (
            <tr key={user.id}>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>{user.role}</td>
              <td><span className={`status-badge ${user.status}`}>{user.status}</span></td>
              <td><button className="btn-light small" onClick={() => onView?.()}>View</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function QuickActionsGrid({ setActiveTab }) {
  const tabByAction = {
    'Manage Users': 'Users',
    'System Settings': 'Settings',
    'View Reports': 'Analytics',
    'Support Tickets': 'System',
  };

  return (
    <div className="actions-grid">
      {quickActions.map(([icon, title, description]) => (
        <button key={title} className="action-card" onClick={() => setActiveTab(tabByAction[title])}>
          <span className="icon">{icon}</span>
          <h4>{title}</h4>
          <p className="muted">{description}</p>
        </button>
      ))}
    </div>
  );
}

function SystemTab() {
  return (
    <DashboardSection title="System Health Metrics">
      <div className="metrics-grid">
        {systemMetrics.map((metric) => (
          <div key={metric.label} className="metric-card">
            <p className="muted">{metric.label}</p>
            <h3>{metric.value}</h3>
            <span className={`status-indicator ${metric.status}`}></span>
          </div>
        ))}
      </div>
    </DashboardSection>
  );
}

function AnalyticsTab() {
  return (
    <DashboardSection title="Analytics Overview">
      <div className="analytics-grid">
        <div className="chart-placeholder"><p>Hiring Trends Chart</p></div>
        <div className="chart-placeholder"><p>User Growth Chart</p></div>
      </div>
    </DashboardSection>
  );
}

function SettingsTab() {
  return (
    <DashboardSection title="Admin Settings">
      <div className="settings-form">
        <div className="form-group">
          <label>Platform Name</label>
          <input type="text" placeholder="HireAI Armenia" />
        </div>
        <div className="form-group">
          <label>Support Email</label>
          <input type="email" placeholder="support@hireai.am" />
        </div>
        <div className="form-group">
          <label>Maintenance Mode</label>
          <label className="checkbox-label">
            <input type="checkbox" />
            Enable Maintenance Mode
          </label>
        </div>
        <button className="btn-dark" onClick={() => notify('Admin settings saved successfully.', 'success')}>Save Settings</button>
      </div>
    </DashboardSection>
  );
}
