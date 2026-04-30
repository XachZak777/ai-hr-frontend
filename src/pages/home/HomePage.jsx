import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../../components/Logo';
import ThemeToggle from '../../components/ui/ThemeToggle';
import './HomePage.style.css';
import { notify } from '../../utils/notifications';
import { navigateAfterLogin } from '../../utils/navigation';
import { validateEmail } from '../../utils/validation';
import { getUserProfile, saveUserProfile } from '../../utils/profile';

const features = [
  ['AI-Powered Matching', 'Advanced algorithms match candidates with positions based on skills, experience, and cultural fit.'],
  ['Bias-Free Hiring', 'Remove unconscious bias from your recruitment process and make fair, objective decisions.'],
  ['Diversity Promotion', 'Build diverse teams and access talent from all backgrounds across Armenia.'],
  ['Smart Analytics', 'Get detailed insights and reports on your hiring process, performance, and trends.'],
  ['Faster Recruitment', 'Reduce time-to-hire with streamlined workflows and intelligent automation.'],
  ['Local Expertise', 'Built with understanding of the Armenian job market and local business culture.'],
];

const steps = [
  ['01 Upload Requirements', 'Define your job requirements and company culture preferences.'],
  ['02 AI Matching', 'Our AI analyzes candidates and finds the best matches for your needs.'],
  ['03 Review Shortlist', 'Review a curated, diverse shortlist of qualified candidates.'],
  ['04 Make Fair Decisions', 'Interview, evaluate, and hire with complete transparency and fairness.'],
];

const footerGroups = [
  {
    title: 'Product',
    links: [
      ['Features', '#features', '.why-choose'],
      ['Pricing', '#pricing', 'signup'],
      ['Security', '#security', 'alert:Security page coming soon!'],
    ],
  },
  {
    title: 'Company',
    links: [
      ['About', '#about', 'alert:About page coming soon!'],
      ['Blog', '#blog', 'alert:Blog coming soon!'],
      ['Careers', '#careers', 'alert:Careers page coming soon!'],
    ],
  },
  {
    title: 'Legal',
    links: [
      ['Privacy Policy', '#privacy', 'alert:Privacy Policy coming soon!'],
      ['Terms of Service', '#terms', 'alert:Terms of Service coming soon!'],
      ['Contact', '#contact', 'alert:Contact: support@hireai.am'],
    ],
  },
];

export default function HomePage({ isLoggedIn = false, onLogin, theme = 'light', onThemeChange }) {
  const navigate = useNavigate();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isLoginModalClosing, setIsLoginModalClosing] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [isSignupModalClosing, setIsSignupModalClosing] = useState(false);

  const handleScrollTo = (selector) => {
    document.querySelector(selector)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleFooterLink = (action) => {
    if (action === 'signup') { openSignupModal(); return; }
    if (action.startsWith('alert:')) { notify(action.replace('alert:', '')); return; }
    handleScrollTo(action);
  };

  const handleModalLogin = ({ role, email }) => {
    saveSignedInProfile(role, { email, name: displayNameFromEmail(email) });
    onLogin?.(role);
    closeLoginModal();
    notify('Signed in successfully.', 'success');
    navigateAfterLogin(role, navigate);
  };

  const handleModalSignup = ({ role, name, email }) => {
    saveSignedInProfile(role, { name, email });
    onLogin?.(role);
    closeSignupModal();
    notify('Account created successfully.', 'success');
    navigateAfterLogin(role, navigate);
  };

  const openLoginModal = () => { setIsLoginModalClosing(false); setShowLoginModal(true); };
  const closeLoginModal = () => {
    setIsLoginModalClosing(true);
    setTimeout(() => { setShowLoginModal(false); setIsLoginModalClosing(false); }, 260);
  };

  const openSignupModal = () => { setIsSignupModalClosing(false); setShowSignupModal(true); };
  const closeSignupModal = () => {
    setIsSignupModalClosing(true);
    setTimeout(() => { setShowSignupModal(false); setIsSignupModalClosing(false); }, 260);
  };

  return (
    <main className="page home">
      {!isLoggedIn && (
        <HomeHeader
          navigate={navigate}
          onScrollTo={handleScrollTo}
          onOpenLogin={openLoginModal}
          onOpenSignup={openSignupModal}
          theme={theme}
          onThemeChange={onThemeChange}
        />
      )}
      <Hero onOpenSignup={openSignupModal} onOpenLogin={openLoginModal} />
      <CardGridSection
        className="why-choose"
        title="Why Choose HireAI Armenia?"
        subtitle="Our platform combines cutting-edge AI technology with local expertise to revolutionize hiring in Armenia."
        columns="grid-3"
        items={features}
      />
      <CardGridSection
        className="how-it-works"
        title="How It Works"
        subtitle="Get started in four simple steps"
        columns="grid-4"
        items={steps}
      />
      <CtaSection onOpenSignup={openSignupModal} />
      <HomeFooter onFooterLink={handleFooterLink} />
      {showLoginModal && (
        <LoginModal isClosing={isLoginModalClosing} onClose={closeLoginModal} onLogin={handleModalLogin} />
      )}
      {showSignupModal && (
        <SignupModal isClosing={isSignupModalClosing} onClose={closeSignupModal} onSignup={handleModalSignup} />
      )}
    </main>
  );
}

function HomeHeader({ navigate, onScrollTo, onOpenLogin, onOpenSignup, theme, onThemeChange }) {
  const links = [
    ['Features', '.why-choose'],
    ['How It Works', '.how-it-works'],
    ['Results', '.results'],
    ['About', '.testimonial-section'],
  ];

  return (
    <header className="brand-row simple">
      <button className="brand logo-brand" onClick={() => navigate('/')} aria-label="Go to home">
        <Logo />
      </button>
      <div className="mini-links">
        {links.map(([label, selector]) => (
          <span key={label} className="nav-link" onClick={() => onScrollTo(selector)}>{label}</span>
        ))}
      </div>
      <div className="inline-actions">
        <ThemeToggle theme={theme} onThemeChange={onThemeChange} />
        <button className="btn-link" onClick={onOpenLogin}>Sign In</button>
        <button className="btn-dark" onClick={onOpenSignup}>Get Started</button>
      </div>
    </header>
  );
}

function Hero({ onOpenSignup, onOpenLogin }) {
  return (
    <section className="hero">
      <div>
        <p className="tag">Made for Armenia</p>
        <h1>AI-Driven Fair Hiring for Armenia's Future</h1>
        <p className="muted big">Transform your recruitment process with intelligent candidate matching and eliminate bias in hiring.</p>
        <div className="inline-actions">
          <button className="btn-dark" onClick={onOpenSignup}>Start Free Trial</button>
          <button className="btn-light" onClick={onOpenLogin}>Watch Demo</button>
        </div>
      </div>
    </section>
  );
}

function CardGridSection({ className, title, subtitle, columns, items }) {
  return (
    <section className={`section-block ${className}`}>
      <h2>{title}</h2>
      {subtitle && <p className="muted">{subtitle}</p>}
      <div className={columns}>
        {items.map(([itemTitle, description]) => (
          <article key={itemTitle} className="card">
            <h4>{itemTitle}</h4>
            <p className="muted">{description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function CtaSection({ onOpenSignup }) {
  return (
    <section className="section-block dark-cta">
      <h2>Ready to Transform Your Hiring?</h2>
      <p>Join leading Armenian companies using AI to build diverse, talented teams.</p>
      <button className="btn-light" onClick={onOpenSignup}>Start Free Trial Today</button>
    </section>
  );
}

function HomeFooter({ onFooterLink }) {
  return (
    <footer className="home-footer">
      <div className="footer-content">
        <div className="footer-section">
          <h4>HireAI Armenia</h4>
          <p className="muted">Revolutionizing hiring with fair, intelligent technology for Armenia.</p>
        </div>
        {footerGroups.map((group) => (
          <div key={group.title} className="footer-section">
            <h4>{group.title}</h4>
            <ul>
              {group.links.map(([label, href, action]) => (
                <li key={label}>
                  <a href={href} onClick={(e) => { e.preventDefault(); onFooterLink(action); }}>{label}</a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="footer-bottom">
        <p>&copy; 2026 HireAI Armenia. All rights reserved.</p>
      </div>
    </footer>
  );
}

function RoleChoice({ value, label, role, setRole }) {
  return (
    <button
      type="button"
      className={`modal-role ${role === value ? 'active' : ''}`}
      onClick={() => setRole(value)}
    >
      {label}
    </button>
  );
}

function LoginModal({ isClosing, onClose, onLogin }) {
  const [role, setRole] = useState('employee');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();
    const nextErrors = {};
    if (!validateEmail(email)) nextErrors.email = 'Enter a valid email address';
    if (!password.trim()) nextErrors.password = 'Password is required';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    onLogin({ role, email });
  };

  return (
    <div className={`login-modal-backdrop ${isClosing ? 'closing' : ''}`} onClick={onClose}>
      <section
        className="login-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Sign in"
      >
        <button className="modal-close" onClick={onClose} aria-label="Close sign in modal">×</button>
        <div className="modal-brand">
          <Logo compact />
        </div>
        <h2>Welcome Back</h2>
        <p className="muted">Choose your workspace and continue to HireAI Armenia.</p>
        <form onSubmit={handleSubmit} noValidate>
          <div className="modal-role-grid">
            <RoleChoice value="employee" label="Job Seeker" role={role} setRole={setRole} />
            <RoleChoice value="employer" label="Employer" role={role} setRole={setRole} />
            <RoleChoice value="admin" label="Admin" role={role} setRole={setRole} />
          </div>
          <div className="form-group">
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => { setEmail(e.target.value); if (errors.email) setErrors((v) => ({ ...v, email: '' })); }}
              className={errors.email ? 'input-error' : ''}
            />
            {errors.email && <span className="error-text">{errors.email}</span>}
          </div>
          <div className="form-group">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); if (errors.password) setErrors((v) => ({ ...v, password: '' })); }}
              className={errors.password ? 'input-error' : ''}
            />
            {errors.password && <span className="error-text">{errors.password}</span>}
          </div>
          <button className="btn-dark full" type="submit">Sign In</button>
        </form>
      </section>
    </div>
  );
}

function SignupModal({ isClosing, onClose, onSignup }) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: 'employee',
    password: '',
  });
  const [errors, setErrors] = useState({});

  const updateField = (field, value) => {
    setFormData((current) => ({ ...current, [field]: value }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: '' }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const nextErrors = {};
    if (!formData.firstName.trim()) nextErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) nextErrors.lastName = 'Last name is required';
    if (!validateEmail(formData.email)) nextErrors.email = 'Enter a valid email address';
    if (!formData.password.trim()) nextErrors.password = 'Password is required';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    onSignup({
      role: formData.role,
      name: `${formData.firstName.trim()} ${formData.lastName.trim()}`,
      email: formData.email.trim(),
    });
  };

  return (
    <div className={`login-modal-backdrop ${isClosing ? 'closing' : ''}`} onClick={onClose}>
      <section
        className="login-modal signup-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Get started"
      >
        <button className="modal-close" onClick={onClose} aria-label="Close get started modal">×</button>
        <div className="modal-brand">
          <Logo compact />
          <span className="tag">Get started</span>
        </div>
        <h2>Create Your Account</h2>
        <p className="muted">Start with the workspace that matches how you use HireAI.</p>
        <form onSubmit={handleSubmit} noValidate>
          <div className="modal-role-grid">
            <RoleChoice value="employee" label="Job Seeker" role={formData.role} setRole={(value) => updateField('role', value)} />
            <RoleChoice value="employer" label="Employer" role={formData.role} setRole={(value) => updateField('role', value)} />
            <RoleChoice value="admin" label="Admin" role={formData.role} setRole={(value) => updateField('role', value)} />
          </div>
          <div className="grid-2">
            <div className="form-group">
              <input placeholder="First name" value={formData.firstName} onChange={(e) => updateField('firstName', e.target.value)} className={errors.firstName ? 'input-error' : ''} />
              {errors.firstName && <span className="error-text">{errors.firstName}</span>}
            </div>
            <div className="form-group">
              <input placeholder="Last name" value={formData.lastName} onChange={(e) => updateField('lastName', e.target.value)} className={errors.lastName ? 'input-error' : ''} />
              {errors.lastName && <span className="error-text">{errors.lastName}</span>}
            </div>
          </div>
          <div className="form-group">
            <input type="email" placeholder="Email address" value={formData.email} onChange={(e) => updateField('email', e.target.value)} className={errors.email ? 'input-error' : ''} />
            {errors.email && <span className="error-text">{errors.email}</span>}
          </div>
          <div className="form-group">
            <input type="password" placeholder="Create password" value={formData.password} onChange={(e) => updateField('password', e.target.value)} className={errors.password ? 'input-error' : ''} />
            {errors.password && <span className="error-text">{errors.password}</span>}
          </div>
          <button className="btn-dark full" type="submit">Create Account</button>
        </form>
      </section>
    </div>
  );
}

function saveSignedInProfile(role, updates) {
  const currentProfile = getUserProfile(role);
  saveUserProfile(role, { ...currentProfile, ...updates });
}

function displayNameFromEmail(email) {
  const fallback = 'HireAI User';
  const localPart = email?.split('@')[0]?.trim();
  if (!localPart) return fallback;

  return localPart
    .replace(/[._-]+/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ') || fallback;
}
