import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../../components/Logo';
import { notify } from '../../utils/notifications';
import { passwordHelpText, validateEmail, validatePassword, validateUserRole } from '../../utils/validation';

export default function LoginPage({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userRole, setUserRole] = useState('');
  const [errors, setErrors] = useState({});
  const [showRecovery, setShowRecovery] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    const nextErrors = {};

    if (!validateEmail(email)) nextErrors.email = 'Please enter a valid email address';
    if (!validatePassword(password)) nextErrors.password = passwordHelpText;
    if (!validateUserRole(userRole)) nextErrors.userRole = 'Please select your role';

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    onLogin(userRole);
    navigateAfterLogin(userRole, navigate);
  };

  return (
    <main className="page login-page">
      <div className="login-card">
        <LoginHeader />
        <LoginForm
          email={email}
          password={password}
          userRole={userRole}
          errors={errors}
          onEmailChange={setEmail}
          onPasswordChange={setPassword}
          onRoleChange={setUserRole}
          onSubmit={handleSubmit}
          showRecovery={showRecovery}
          onToggleRecovery={() => setShowRecovery((current) => !current)}
        />
        <div className="signup-redirect">
          <p>Don't have an account? <a href="/signup" className="link">Create one here</a></p>
        </div>
      </div>
    </main>
  );
}

function LoginHeader() {
  return (
    <>
      <div className="logo-center wide">
        <Logo />
      </div>
      <h2>Welcome Back</h2>
      <p className="muted">Sign in to HireAI Armenia to continue</p>
    </>
  );
}

function LoginForm({ email, password, userRole, errors, onEmailChange, onPasswordChange, onRoleChange, onSubmit, showRecovery, onToggleRecovery }) {
  const [recoveryEmail, setRecoveryEmail] = useState('');

  const handleRecovery = () => {
    if (!validateEmail(recoveryEmail)) {
      notify('Enter a valid email to recover your password.', 'error');
      return;
    }

    notify(`Password recovery instructions sent to ${recoveryEmail}.`, 'success');
    setRecoveryEmail('');
    onToggleRecovery();
  };

  return (
    <form onSubmit={onSubmit} noValidate>
      <div className="form-group">
        <input type="email" placeholder="Email Address" value={email} onChange={(e) => onEmailChange(e.target.value)} className={errors.email ? 'input-error' : ''} />
        {errors.email && <span className="error-text">{errors.email}</span>}
      </div>
      <div className="form-group">
        <input type="password" placeholder="Password" value={password} onChange={(e) => onPasswordChange(e.target.value)} className={errors.password ? 'input-error' : ''} />
        {errors.password && <span className="error-text">{errors.password}</span>}
      </div>
      <div className="form-group">
        <div className={`role-picker ${errors.userRole ? 'input-error' : ''}`}>
          <RoleButton value="employee" selected={userRole === 'employee'} onSelect={onRoleChange} title="Job Seeker" subtitle="Find jobs, apply, and track offers" />
          <RoleButton value="employer" selected={userRole === 'employer'} onSelect={onRoleChange} title="Employer" subtitle="Post roles and review candidates" />
          <RoleButton value="admin" selected={userRole === 'admin'} onSelect={onRoleChange} title="Admin" subtitle="Manage platform operations" />
        </div>
        {errors.userRole && <span className="error-text">{errors.userRole}</span>}
      </div>
      <div className="remember-forgot">
        <label className="remember">
          <input type="checkbox" /> Remember me
        </label>
        <button type="button" className="forgot-link" onClick={onToggleRecovery}>Forgot Password?</button>
      </div>
      {showRecovery && (
        <div className="recovery-panel">
          <input type="email" placeholder="Recovery email" value={recoveryEmail} onChange={(e) => setRecoveryEmail(e.target.value)} />
          <button type="button" className="btn-light small" onClick={handleRecovery}>Send Reset Link</button>
        </div>
      )}
      <button type="submit" className="btn-dark full">Sign In</button>
    </form>
  );
}

function RoleButton({ value, selected, onSelect, title, subtitle }) {
  return (
    <button
      type="button"
      className={`role-button ${value === 'employee' ? 'job-seeker-role' : ''} ${selected ? 'selected' : ''}`}
      onClick={() => onSelect(value)}
    >
      <span className="role-icon">{value === 'employee' ? '★' : value === 'employer' ? '◆' : '●'}</span>
      <span>
        <strong>{title}</strong>
        <small>{subtitle}</small>
      </span>
    </button>
  );
}

function navigateAfterLogin(userRole, navigate) {
  if (userRole === 'admin') {
    navigate('/admin-dashboard');
  } else if (userRole === 'employer') {
    navigate('/employer-dashboard');
  } else {
    navigate('/employee-dashboard');
  }
}
