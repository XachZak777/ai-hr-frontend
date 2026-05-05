import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '@mui/material/Button';
import { DashboardSection, PageTitle, StatsRow, Tabs } from '../../components/CommonBlocks';
import { notify } from '../../utils/notifications';
import { getUserProfile } from '../../utils/profile';
import { validateEmail, validateRequired } from '../../utils/validation';

const dashboardTabs = ['Overview', 'Users', 'System', 'Analytics', 'Settings'];

const stats = [
  { title: 'Total Users', value: '—', note: '' },
  { title: 'Active Companies', value: '—', note: '' },
  { title: 'Monthly Hires', value: '—', note: '' },
  { title: 'System Health', value: '—', note: '' },
];

const recentUsers = [];

const systemMetrics = [
  { label: 'API Response Time', value: '—', status: 'good' },
  { label: 'Database Load', value: '—', status: 'good' },
  { label: 'Memory Usage', value: '—', status: 'good' },
  { label: 'Error Rate', value: '—', status: 'good' },
];

const quickActions = [
  ['👥', 'Manage Users', 'View and manage platform users'],
  ['🔧', 'System Settings', 'Configure platform settings'],
  ['📊', 'View Reports', 'Generate and view reports'],
  ['⚠️', 'Support Tickets', 'Review support requests'],
];

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Overview');
  const profile = getUserProfile('admin');

  return (
    <main className="page dashboard">
      <PageTitle
        title="Admin Dashboard"
        subtitle={profile.headline || 'Platform management and oversight'}
        actions={
          <Button variant="contained" onClick={() => navigate('/admin-schedule')}>
            View Schedule
          </Button>
        }
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
  if (recentUsers.length === 0) {
    return (
      <div className="empty-state">
        <h4>No users yet</h4>
        <p className="muted">Platform users will appear here once they register.</p>
      </div>
    );
  }

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
              <td>
                <Button variant="outlined" size="small" onClick={() => onView?.()}>
                  View
                </Button>
              </td>
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
  const [settings, setSettings] = useState({ platformName: '', supportEmail: '' });
  const [errors, setErrors] = useState({});

  const updateField = (field, value) => {
    setSettings((s) => ({ ...s, [field]: value }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: '' }));
  };

  const handleSave = () => {
    const nextErrors = {};
    if (!validateRequired(settings.platformName)) nextErrors.platformName = 'Platform name is required';
    if (!validateEmail(settings.supportEmail)) nextErrors.supportEmail = 'Enter a valid email address';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    notify('Admin settings saved successfully.', 'success');
  };

  return (
    <DashboardSection title="Admin Settings">
      <div className="settings-form">
        <div className="form-group">
          <label>Platform Name</label>
          <input
            type="text"
            value={settings.platformName}
            onChange={(e) => updateField('platformName', e.target.value)}
            placeholder="HireAI Armenia"
            className={errors.platformName ? 'input-error' : ''}
          />
          {errors.platformName && <span className="error-text">{errors.platformName}</span>}
        </div>
        <div className="form-group">
          <label>Support Email</label>
          <input
            type="email"
            value={settings.supportEmail}
            onChange={(e) => updateField('supportEmail', e.target.value)}
            placeholder="support@hireai.am"
            className={errors.supportEmail ? 'input-error' : ''}
          />
          {errors.supportEmail && <span className="error-text">{errors.supportEmail}</span>}
        </div>
        <div className="form-group">
          <label>Maintenance Mode</label>
          <label className="checkbox-label">
            <input type="checkbox" />
            Enable Maintenance Mode
          </label>
        </div>
        <Button variant="contained" onClick={handleSave}>
          Save Settings
        </Button>
      </div>
    </DashboardSection>
  );
}
