import logoSrc from '../assets/hireai-workforce-logo.svg';

export default function Logo({ className = '', compact = false }) {
  return (
    <img
      className={`site-logo ${compact ? 'site-logo-compact' : ''} ${className}`.trim()}
      src={logoSrc}
      alt="HireAI Workforce"
    />
  );
}
