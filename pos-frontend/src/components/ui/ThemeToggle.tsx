/**
 * ThemeToggle — botón para alternar entre tema oscuro y claro.
 * Encaja con el nuevo sistema de diseño dark profesional.
 */

import { useTheme } from '../../context/ThemeContext'

export default function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme()

  return (
    <button
      type="button"
      onClick={toggleTheme}
      title={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      aria-label={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.35rem 0.65rem',
        borderRadius: '0.5rem',
        border: '1px solid var(--border-light)',
        backgroundColor: 'var(--bg-elevated)',
        color: 'var(--text-secondary)',
        cursor: 'pointer',
        transition: 'background-color 0.15s, border-color 0.15s, color 0.15s',
        fontSize: '0.75rem',
        fontWeight: 500,
        whiteSpace: 'nowrap',
      }}
      onMouseEnter={e => {
        const el = e.currentTarget
        el.style.backgroundColor = 'var(--bg-hover)'
        el.style.borderColor = 'var(--accent)'
        el.style.color = 'var(--text-primary)'
      }}
      onMouseLeave={e => {
        const el = e.currentTarget
        el.style.backgroundColor = 'var(--bg-elevated)'
        el.style.borderColor = 'var(--border-light)'
        el.style.color = 'var(--text-secondary)'
      }}
    >
      {/* Track del toggle */}
      <span
        style={{
          position: 'relative',
          display: 'inline-flex',
          width: '2rem',
          height: '1.125rem',
          borderRadius: '9999px',
          backgroundColor: isDark ? 'var(--bg-hover)' : 'var(--accent)',
          border: '1px solid var(--border-light)',
          transition: 'background-color 0.2s',
          flexShrink: 0,
        }}
        aria-hidden="true"
      >
        {/* Thumb */}
        <span
          style={{
            position: 'absolute',
            top: '1px',
            left: isDark ? '1px' : 'calc(100% - 17px)',
            width: '13px',
            height: '13px',
            borderRadius: '9999px',
            backgroundColor: isDark ? 'var(--text-muted)' : '#fff',
            transition: 'left 0.2s, background-color 0.2s',
            boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
          }}
        />
      </span>

      {/* Icono + label */}
      {isDark ? (
        <>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" clipRule="evenodd"
              d="M9.528 1.718a.75.75 0 01.162.819A8.97 8.97 0 009 6a9 9 0 009 9 8.97 8.97 0 003.463-.69.75.75 0 01.981.98 10.503 10.503 0 01-9.694 6.46c-5.799 0-10.5-4.701-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 01.818.162z" />
          </svg>
          <span className="hidden sm:inline">Oscuro</span>
        </>
      ) : (
        <>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z" />
          </svg>
          <span className="hidden sm:inline">Claro</span>
        </>
      )}
    </button>
  )
}
