'use client'

import React from 'react'
import Link from 'next/link'
import Button from '@/components/ui/Button'

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-[1000] bg-white/90 backdrop-blur-[20px] border-b border-[rgba(10,77,140,0.1)] animate-[slideDown_0.6s_ease-out]">
      <div className="max-w-[1400px] mx-auto px-8 py-5 flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-display text-3xl font-extrabold text-[var(--blue)] no-underline">
          <div className="w-10 h-10 bg-gradient-to-br from-[var(--orange)] to-[var(--orange-light)] rounded-[10px] flex items-center justify-center text-2xl -rotate-[5deg]">
            🎓
          </div>
          PrepGenius
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-10">
          <Link 
            href="#features" 
            className="text-[var(--black)] no-underline font-medium transition-colors duration-300 hover:text-[var(--orange)] relative after:content-[''] after:absolute after:bottom-[-5px] after:left-0 after:w-0 after:h-0.5 after:bg-[var(--orange)] after:transition-[width_0.3s_ease] hover:after:w-full"
          >
            Features
          </Link>
          <Link 
            href="#how-it-works" 
            className="text-[var(--black)] no-underline font-medium transition-colors duration-300 hover:text-[var(--orange)] relative after:content-[''] after:absolute after:bottom-[-5px] after:left-0 after:w-0 after:h-0.5 after:bg-[var(--orange)] after:transition-[width_0.3s_ease] hover:after:w-full"
          >
            How It Works
          </Link>
          <Link 
            href="#pricing" 
            className="text-[var(--black)] no-underline font-medium transition-colors duration-300 hover:text-[var(--orange)] relative after:content-[''] after:absolute after:bottom-[-5px] after:left-0 after:w-0 after:h-0.5 after:bg-[var(--orange)] after:transition-[width_0.3s_ease] hover:after:w-full"
          >
            Pricing
          </Link>
          <Button variant="secondary" href="/signin">
            Sign In
          </Button>
          <Button variant="primary" href="/signup">
            Get Started Free
          </Button>
        </div>

        {/* Mobile Menu Button - Placeholder */}
        <button className="md:hidden text-2xl">☰</button>
      </div>
    </nav>
  )
}