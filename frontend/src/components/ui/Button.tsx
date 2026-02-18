import React from 'react'
import Link from 'next/link'

interface ButtonProps {
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'link' | 'destructive'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  href?: string
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void
  disabled?: boolean
  className?: string
  fullWidth?: boolean
  type?: 'button' | 'submit' | 'reset'
}

export function Button({
  children,
  variant = 'primary',
  size = 'default',
  href,
  onClick,
  disabled = false,
  className = '',
  fullWidth = false,
  type = 'button'
}: ButtonProps) {
  const baseStyles = `
    rounded-full font-semibold transition-all duration-300 
    cursor-pointer inline-flex items-center justify-center text-center
    ${fullWidth ? 'w-full' : ''}
    ${disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}
  `

  const sizeStyles = {
    default: 'px-7 py-3 text-base',
    sm: 'px-4 py-2 text-sm',
    lg: 'px-8 py-4 text-lg',
    icon: 'h-10 w-10 p-2',
  }

  const variantStyles = {
    primary: `
      bg-gradient-to-br from-[var(--orange)] to-[var(--orange-light)] 
      text-white shadow-[0_4px_20px_rgba(255,107,53,0.3)] border-none
      hover:-translate-y-0.5 hover:shadow-[0_6px_30px_rgba(255,107,53,0.4)]
    `,
    secondary: `
      bg-transparent text-[var(--blue)] border-2 border-[var(--blue)]
      hover:bg-[var(--blue)] hover:text-white
    `,
    outline: `
      bg-transparent text-[var(--gray-dark)] border-2 border-[var(--gray-border)]
      hover:bg-[var(--gray-light)] hover:text-[var(--black)]
    `,
    ghost: `
      bg-transparent text-[var(--gray-dark)] border-none
      hover:bg-[var(--gray-light)] hover:text-[var(--black)]
    `,
    link: `
      bg-transparent text-[var(--blue)] border-none underline-offset-4 hover:underline p-0 h-auto
    `,
    destructive: `
      bg-red-500 text-white shadow-sm hover:bg-red-600
    `
  }

  const combinedStyles = `${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`

  if (href) {
    return (
      <Link href={href} className={combinedStyles}>
        {children}
      </Link>
    )
  }

  return (
    <button type={type} onClick={onClick} disabled={disabled} className={combinedStyles}>
      {children}
    </button>
  )
}