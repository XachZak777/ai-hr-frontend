import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../../components/Logo';
import './LoginPage.style.css';
import { notify } from '../../utils/notifications';
import { navigateAfterLogin } from '../../utils/navigation';
import { validateEmail } from '../../utils/validation';
import { login } from '../../api/auth';
import { FRONTEND_ROLE, parseAuthResponse, setAuthUser } from '../../utils/authState';
import { resolveProfile } from '../../utils/resolveProfile';

export default function LoginPage({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showRecovery, setShowRecovery] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const nextErrors = {};

    if (!validateEmail(email)) nextErrors.email = 'Please enter a valid email address';
    if (!password.trim()) nextErrors.password = 'Password is required';

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setIsSubmitting(true);
    try {
      const data = await login({ email, password });
      setAuthUser(parseAuthResponse(data));
      const role = FRONTEND_ROLE[data.role];
      await resolveProfile(role);
      onLogin(role);
      navigateAfterLogin(role, navigate);
    } catch (err) {
      setErrors({ general: err.message ?? 'Sign in failed. Please check your credentials.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="page login-page">
      <div className="login-card">
        <div className="logo-center wide">
          <Logo />
        </div>
        <h2>Welcome Back</h2>
        <p className="muted">Sign in to HireAI Armenia to continue</p>
        {errors.general && <div className="error-message">{errors.general}</div>}
        <LoginForm
          email={email}
          password={password}
          errors={errors}
          isSubmitting={isSubmitting}
          onEmailChange={setEmail}
          onPasswordChange={setPassword}
          onSubmit={handleSubmit}
          showRecovery={showRecovery}
          onToggleRecovery={() => setShowRecovery((prev) => !prev)}
        />
        <div className="signup-redirect">
          <p>Don't have an account? <a href="/signup" className="link">Create one here</a></p>
        </div>
      </div>
    </main>
  );
}

function LoginForm({
  email, password, errors, isSubmitting,
  onEmailChange, onPasswordChange,
  onSubmit, showRecovery, onToggleRecovery,
}) {
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
        <input
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
          className={errors.email ? 'input-error' : ''}
        />
        {errors.email && <span className="error-text">{errors.email}</span>}
      </div>
      <div className="form-group">
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => onPasswordChange(e.target.value)}
          className={errors.password ? 'input-error' : ''}
        />
        {errors.password && <span className="error-text">{errors.password}</span>}
      </div>
      <div className="remember-forgot">
        <label className="remember">
          <input type="checkbox" /> Remember me
        </label>
        <button type="button" className="forgot-link" onClick={onToggleRecovery}>Forgot Password?</button>
      </div>
      {showRecovery && (
        <div className="recovery-panel">
          <input
            type="email"
            placeholder="Recovery email"
            value={recoveryEmail}
            onChange={(e) => setRecoveryEmail(e.target.value)}
          />
          <button type="button" className="btn-light small" onClick={handleRecovery}>Send Reset Link</button>
        </div>
      )}
      <button type="submit" className="btn-dark full" disabled={isSubmitting}>
        {isSubmitting ? 'Signing In...' : 'Sign In'}
      </button>
    </form>
  );
}
