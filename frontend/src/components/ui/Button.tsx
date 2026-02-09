import React from 'react'
import Link from 'next/link'

interface ButtonProps {
  children: React.ReactNode
  variant?: 'primary' | 'secondary'
  href?: string
  onClick?: () => void
  className?: string
  fullWidth?: boolean
}

export default function Button({ 
  children, 
  variant = 'primary', 
  href, 
  onClick,
  className = '',
  fullWidth = false
}: ButtonProps) {
  const baseStyles = `
    px-7 py-3 rounded-full font-semibold transition-all duration-300 
    cursor-pointer border-none text-base inline-block text-center
    ${fullWidth ? 'w-full' : ''}
  `
  
  const variantStyles = {
    primary: `
      bg-gradient-to-br from-[var(--orange)] to-[var(--orange-light)] 
      text-white shadow-[0_4px_20px_rgba(255,107,53,0.3)]
      hover:-translate-y-0.5 hover:shadow-[0_6px_30px_rgba(255,107,53,0.4)]
    `,
    secondary: `
      bg-transparent text-[var(--blue)] border-2 border-[var(--blue)]
      hover:bg-[var(--blue)] hover:text-white
    `
  }

  const combinedStyles = `${baseStyles} ${variantStyles[variant]} ${className}`

  if (href) {
    return (
      <Link href={href} className={combinedStyles}>
        {children}
      </Link>
    )
  }

  return (
    <button onClick={onClick} className={combinedStyles}>
      {children}
    </button>
  )
}