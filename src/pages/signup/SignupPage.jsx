import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../../components/Logo';
import { passwordHelpText, validateEmail, validatePassword, validateUserRole } from '../../utils/validation';
import { register } from '../../api/auth';
import { BACKEND_ROLE, FRONTEND_ROLE, parseAuthResponse, setAuthUser } from '../../utils/authState';
import { navigateAfterLogin } from '../../utils/navigation';

const initialFormData = {
  firstName: '',
  lastName: '',
  email: '',
  userType: '',
  password: '',
  confirmPassword: '',
  termsAccepted: false,
};

export default function SignupPage({ onLogin }) {
  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!validateEmail(formData.email)) newErrors.email = 'Please enter a valid email address';
    if (!validateUserRole(formData.userType)) newErrors.userType = 'Please select your role';
    if (!validatePassword(formData.password)) newErrors.password = passwordHelpText;
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    if (!formData.termsAccepted) newErrors.termsAccepted = 'You must agree to the terms';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const fullName = `${formData.firstName.trim()} ${formData.lastName.trim()}`;
      const data = await register({
        email: formData.email,
        fullName,
        password: formData.password,
        role: BACKEND_ROLE[formData.userType],
      });
      setAuthUser(parseAuthResponse(data));
      const role = FRONTEND_ROLE[data.role];
      onLogin(role);
      navigateAfterLogin(role, navigate);
    } catch (err) {
      setErrors({ general: err.message ?? 'Registration failed. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="page signup-page">
      <div className="signup-card">
        <SignupHeader onBack={() => navigate('/')} />
        {errors.general && <div className="error-message">{errors.general}</div>}
        <SignupForm
          formData={formData}
          errors={errors}
          isSubmitting={isSubmitting}
          onChange={handleChange}
          onSubmit={handleSubmit}
        />
        <div className="signin-redirect">
          <p>Already have an account? <a href="/login" className="link">Sign in here</a></p>
        </div>
      </div>
    </main>
  );
}

function SignupHeader({ onBack }) {
  return (
    <>
      <button className="back-btn" onClick={onBack}>← Back to Home</button>
      <div className="logo-center wide">
        <Logo />
      </div>
      <h2>Join HireAI Armenia</h2>
      <p className="muted">Create your account to start transforming your hiring process</p>
    </>
  );
}

function SignupForm({ formData, errors, isSubmitting, onChange, onSubmit }) {
  return (
    <form onSubmit={onSubmit} noValidate>
      <div className="grid-2">
        <FormInput name="firstName" placeholder="First Name" value={formData.firstName} error={errors.firstName} onChange={onChange} />
        <FormInput name="lastName" placeholder="Last Name" value={formData.lastName} error={errors.lastName} onChange={onChange} />
      </div>
      <FormInput name="email" type="email" placeholder="Email" value={formData.email} error={errors.email} onChange={onChange} />
      <RoleSelect value={formData.userType} error={errors.userType} onChange={onChange} />
      <FormInput name="password" type="password" placeholder="Password" value={formData.password} error={errors.password} onChange={onChange} />
      <FormInput name="confirmPassword" type="password" placeholder="Confirm Password" value={formData.confirmPassword} error={errors.confirmPassword} onChange={onChange} />
      <TermsCheckbox checked={formData.termsAccepted} error={errors.termsAccepted} onChange={onChange} />
      <button type="submit" className="btn-dark full" disabled={isSubmitting}>
        {isSubmitting ? 'Creating Account...' : 'Create Account'}
      </button>
    </form>
  );
}

function FormInput({ name, value, error, onChange, type = 'text', placeholder }) {
  return (
    <div className="form-group">
      <input
        placeholder={placeholder}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        className={error ? 'input-error' : ''}
      />
      {error && <span className="error-text">{error}</span>}
    </div>
  );
}

function RoleSelect({ value, error, onChange }) {
  return (
    <div className="form-group">
      <select name="userType" value={value} onChange={onChange} className={error ? 'input-error' : ''}>
        <option value="">Select your role...</option>
        <option value="employer">I am an Employer</option>
        <option value="employee">I am a Job Seeker</option>
      </select>
      {error && <span className="error-text">{error}</span>}
    </div>
  );
}

function TermsCheckbox({ checked, error, onChange }) {
  return (
    <>
      <label className="terms">
        <input type="checkbox" name="termsAccepted" checked={checked} onChange={onChange} />
        I agree to the Terms of Service and Privacy Policy
      </label>
      {error && <span className="error-text">{error}</span>}
    </>
  );
}
