import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Theme = 'light' | 'dark' | 'contrast'

interface ThemeState {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const applyTheme = (theme: Theme) => {
  const root = document.documentElement
  root.classList.remove('dark', 'contrast')
  if (theme === 'dark') root.classList.add('dark')
  if (theme === 'contrast') root.classList.add('contrast')
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'light',
      setTheme: (theme) => {
        applyTheme(theme)
        set({ theme })
      },
    }),
    {
      name: 'editorial-archive-theme',
      onRehydrateStorage: () => (state) => {
        if (state) applyTheme(state.theme)
      },
    },
  ),
)

// Initial theme setup based on localStorage or system preference
if (typeof window !== 'undefined') {
  const stored = localStorage.getItem('editorial-archive-theme')
  if (!stored) {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const initial: Theme = prefersDark ? 'dark' : 'light'
    applyTheme(initial)
    useThemeStore.setState({ theme: initial })
  }
}
