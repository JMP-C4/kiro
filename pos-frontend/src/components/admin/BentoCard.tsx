import type { ReactNode } from 'react'

interface BentoCardProps {
  title: string
  description?: string
  icon?: string
  children?: ReactNode
  className?: string
  onClick?: () => void
  disabled?: boolean
}

export default function BentoCard({
  title,
  description,
  icon,
  children,
  className = '',
  onClick,
  disabled = false,
}: BentoCardProps) {
  const Tag = onClick ? 'button' : 'div'

  return (
    <Tag
      type={onClick ? 'button' : undefined}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={`glass-card p-5 text-left transition-all duration-200 ${
        onClick && !disabled
          ? 'hover:bg-white/10 hover:border-violet-400/40 cursor-pointer'
          : disabled
            ? 'opacity-50 cursor-not-allowed'
            : ''
      } ${className}`}
    >
      {icon && <span className="text-2xl mb-3 block" aria-hidden="true">{icon}</span>}
      <h3 className="text-white font-semibold text-base">{title}</h3>
      {description && <p className="text-white/50 text-sm mt-1">{description}</p>}
      {children}
    </Tag>
  )
}
