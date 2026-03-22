import { Sun, Moon, Contrast } from 'lucide-react'
import { useThemeStore, type Theme } from '@/store/themeStore'

const options: { value: Theme; icon: React.ReactNode; label: string }[] = [
  { value: 'light',    icon: <Sun size={16} />,      label: 'Jasny' },
  { value: 'dark',     icon: <Moon size={16} />,     label: 'Ciemny' },
  { value: 'contrast', icon: <Contrast size={16} />, label: 'Wysoki kontrast' },
]

export default function ThemeToggle() {
  const { theme, setTheme } = useThemeStore()

  return (
    <div
      role="group"
      aria-label="Wybór motywu kolorystycznego"
      className="flex items-center rounded-full p-0.5 gap-0.5"
      style={{ background: 'var(--color-surface-variant)' }}
    >
      {options.map(({ value, icon, label }) => (
        <button
          key={value}
          type="button"
          aria-label={label}
          aria-pressed={theme === value}
          onClick={() => setTheme(value)}
          className="flex items-center justify-center w-7 h-7 rounded-full transition-colors"
          style={{
            background: theme === value ? 'var(--color-surface)' : 'transparent',
            color: theme === value ? 'var(--color-primary)' : 'var(--color-on-surface-variant)',
            boxShadow: theme === value ? 'var(--shadow-card)' : 'none',
          }}
        >
          {icon}
        </button>
      ))}
    </div>
  )
}
