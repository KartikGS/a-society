import { Monitor, Moon, Sun } from 'lucide-react';
import { useTheme, type ThemePreference } from '../hooks/useTheme';

const OPTIONS: Array<{ value: ThemePreference; label: string; Icon: typeof Sun }> = [
  { value: 'light', label: 'Light theme', Icon: Sun },
  { value: 'dark', label: 'Dark theme', Icon: Moon },
  { value: 'system', label: 'Follow system theme', Icon: Monitor },
];

export function ThemeToggle() {
  const { preference, setPreference } = useTheme();

  return (
    <div className="theme-toggle" role="group" aria-label="Color theme">
      {OPTIONS.map(({ value, label, Icon }) => (
        <button
          key={value}
          type="button"
          className="theme-toggle-option"
          aria-pressed={preference === value}
          aria-label={label}
          title={label}
          onClick={() => setPreference(value)}
        >
          <Icon aria-hidden="true" />
        </button>
      ))}
    </div>
  );
}
