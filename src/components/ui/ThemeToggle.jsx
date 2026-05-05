export default function ThemeToggle({ theme, onThemeChange }) {
  const nextTheme = theme === 'light' ? 'dark' : 'light';

  return (
    <button
      className="theme-toggle"
      onClick={() => onThemeChange?.(nextTheme)}
      aria-label="Change theme"
    >
      {theme === 'light' ? 'Dark' : 'Light'}
    </button>
  );
}
