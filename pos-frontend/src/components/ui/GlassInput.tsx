import { forwardRef } from 'react'
import type { InputHTMLAttributes } from 'react'

interface GlassInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  containerClassName?: string
}

const GlassInput = forwardRef<HTMLInputElement, GlassInputProps>(
  ({ label, error, containerClassName = '', className = '', id, ...rest }, ref) => {
    const inputId = id ?? (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined)

    return (
      <div className={`flex flex-col gap-1 ${containerClassName}`}>
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-white/80"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`glass-input rounded-lg px-3 py-2 text-white placeholder-white/40 outline-none focus:ring-2 focus:ring-violet-500/60 transition ${
            error ? 'border-red-400/70' : ''
          } ${className}`}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error && inputId ? `${inputId}-error` : undefined}
          {...rest}
        />
        {error && (
          <p
            id={inputId ? `${inputId}-error` : undefined}
            role="alert"
            className="text-xs text-red-400"
          >
            {error}
          </p>
        )}
      </div>
    )
  }
)

GlassInput.displayName = 'GlassInput'

export default GlassInput
