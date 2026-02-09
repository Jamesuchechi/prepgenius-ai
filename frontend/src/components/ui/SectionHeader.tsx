import React from 'react'

interface SectionHeaderProps {
  badge: string
  title: string
  description: string
  isDark?: boolean
}

export default function SectionHeader({ 
  badge, 
  title, 
  description, 
  isDark = false 
}: SectionHeaderProps) {
  return (
    <div className="text-center max-w-[900px] mx-auto mb-20 animate-[fadeInUp_0.8s_ease-out]">
      <div 
        className={`
          inline-block px-6 py-3 rounded-full text-base font-bold mb-5
          ${isDark 
            ? 'bg-white/20 text-white' 
            : 'bg-[rgba(255,107,53,0.12)] text-[var(--orange)]'
          }
        `}
      >
        {badge}
      </div>
      <h2 
        className={`
          font-display text-[3rem] font-extrabold mb-4 leading-[1.05]
          ${isDark ? 'text-white' : 'text-[var(--black)]'}
        `}
      >
        {title}
      </h2>
      <p 
        className={`
          text-[1.15rem] max-w-[780px] mx-auto
          ${isDark ? 'text-white/90' : 'text-[var(--gray-dark)]'}
        `}
      >
        {description}
      </p>
    </div>
  )
}