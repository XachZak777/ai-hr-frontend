import { useCallback, useEffect, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { logout as apiLogout } from './api/auth';
import NotificationCenter from './components/NotificationCenter';
import TopNav from './components/TopNav';
import HomePage from './pages/home/HomePage';
import LoginPage from './pages/login/LoginPage';
import SignupPage from './pages/signup/SignupPage';
import AdminDashboardPage from './pages/admin-dashboard/AdminDashboardPage';
import EmployerDashboardPage from './pages/employer-dashboard/EmployerDashboardPage';
import EmployeeDashboardPage from './pages/employee-dashboard/EmployeeDashboardPage';
import AdminSchedulePage from './pages/admin-schedule/AdminSchedulePage';
import EmployerSchedulePage from './pages/employer-schedule/EmployerSchedulePage';
import EmployeeSchedulePage from './pages/employee-schedule/EmployeeSchedulePage';
import FindJobsPage from './pages/find-jobs/FindJobsPage';
import JobApplicationPage from './pages/job-application/JobApplicationPage';
import MyJobsPage from './pages/my-jobs/MyJobsPage';
import NotificationsPage from './pages/notifications/NotificationsPage';
import PostNewJobPage from './pages/post-new-job/PostNewJobPage';
import ProfilePage from './pages/profile/ProfilePage';
import InterviewRoomPage from './pages/interview-room/InterviewRoomPage';
import { clearAuthUser, getAuthUser, getFrontendRole } from './utils/authState';
import { tokenStore } from './api/client';

function initSession() {
  if (tokenStore.getAccess() && getAuthUser()) {
    return { loggedIn: true, role: getFrontendRole() };
  }
  return { loggedIn: false, role: null };
}

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => initSession().loggedIn);
  const [userRole, setUserRole] = useState(() => initSession().role);
  const handleLogout = useCallback(async () => {
    await apiLogout().catch(() => {});
    clearAuthUser();
    setIsLoggedIn(false);
    setUserRole(null);
  }, []);

  useEffect(() => {
    const onExpired = () => handleLogout();
    window.addEventListener('hireai:session-expired', onExpired);
    return () => window.removeEventListener('hireai:session-expired', onExpired);
  }, [handleLogout]);

  const handleLogin = (role) => {
    setIsLoggedIn(true);
    setUserRole(role);
  };

  return (
    <div className="app-shell">
      {isLoggedIn && <TopNav onLogout={handleLogout} userRole={userRole} />}
      <NotificationCenter />
      <Routes>
        <Route path="/" element={<HomePage isLoggedIn={isLoggedIn} onLogin={handleLogin} />} />
        <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
        <Route path="/signup" element={<SignupPage onLogin={handleLogin} />} />
        <Route path="/admin-dashboard" element={<AdminDashboardPage />} />
        <Route path="/employer-dashboard" element={<EmployerDashboardPage />} />
        <Route path="/employee-dashboard" element={<EmployeeDashboardPage />} />
        <Route path="/admin-schedule" element={<AdminSchedulePage />} />
        <Route path="/employer-schedule" element={<EmployerSchedulePage />} />
        <Route path="/employee-schedule" element={<EmployeeSchedulePage />} />
        <Route path="/find-jobs" element={<FindJobsPage />} />
        <Route path="/apply/:jobId" element={<JobApplicationPage />} />
        <Route path="/my-jobs" element={<MyJobsPage />} />
        <Route path="/profile" element={<ProfilePage userRole={userRole || 'employee'} />} />
        <Route path="/notifications" element={<NotificationsPage userRole={userRole || 'employee'} />} />
        <Route path="/post-new-job" element={<PostNewJobPage />} />
        <Route path="/interview/:id" element={<InterviewRoomPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}
