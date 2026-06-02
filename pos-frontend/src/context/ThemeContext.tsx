/**
 * ThemeContext — gestión de tema oscuro/claro.
 *
 * Estrategia:
 *   - Por defecto: dark (sin clase en <html>)
 *   - Modo claro:  clase `light` en <html>
 *   - Persiste en localStorage con clave 'theme'
 */

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react'

const THEME_KEY = 'pos-theme'

interface ThemeContextValue {
  isDark: boolean
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

function getInitialDark(): boolean {
  const stored = localStorage.getItem(THEME_KEY)
  if (stored === 'light') return false
  if (stored === 'dark') return true
  // Sin preferencia guardada → usar preferencia del sistema
  return !window.matchMedia('(prefers-color-scheme: light)').matches
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [isDark, setIsDark] = useState<boolean>(getInitialDark)

  // Aplica la clase al elemento raíz cada vez que cambia el tema
  useEffect(() => {
    const root = document.documentElement
    if (isDark) {
      root.classList.remove('light')
      localStorage.setItem(THEME_KEY, 'dark')
    } else {
      root.classList.add('light')
      localStorage.setItem(THEME_KEY, 'light')
    }
  }, [isDark])

  const toggleTheme = useCallback(() => setIsDark(prev => !prev), [])

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used inside <ThemeProvider>')
  return ctx
}
