import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'

interface GlassModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  className?: string
}

export default function GlassModal({
  isOpen,
  onClose,
  title,
  children,
  className = '',
}: GlassModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)

  // Trap focus inside modal when open
  useEffect(() => {
    if (!isOpen) return

    const modal = modalRef.current
    if (!modal) return

    // Focus the modal container so keyboard events are captured
    modal.focus()

    // Collect all focusable elements
    const focusable = modal.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    const first = focusable[0]
    const last = focusable[focusable.length - 1]

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key !== 'Tab') return
      if (focusable.length === 0) {
        e.preventDefault()
        return
      }
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault()
          last?.focus()
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault()
          first?.focus()
        }
      }
    }

    modal.addEventListener('keydown', handleKeyDown)
    return () => modal.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  if (!isOpen) return null

  return (
    /* Overlay — click outside closes modal */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      {/* Modal container — stop propagation so clicks inside don't close */}
      <div
        ref={modalRef}
        className={`glass-modal rounded-2xl p-6 w-full max-w-lg mx-4 outline-none ${className}`}
        onClick={(e) => e.stopPropagation()}
        tabIndex={-1}
      >
        {/* Title bar */}
        <div className="flex items-center justify-between mb-4">
          {title && (
            <h2
              id="modal-title"
              className="text-lg font-semibold text-white"
            >
              {title}
            </h2>
          )}
          <button
            type="button"
            onClick={onClose}
            className="ml-auto flex items-center justify-center w-8 h-8 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition"
            aria-label="Cerrar modal"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div>{children}</div>
      </div>
    </div>
  )
}
