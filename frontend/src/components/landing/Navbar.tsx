'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const closeMenu = () => {
    setIsMenuOpen(false)
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-[1000] bg-white/90 backdrop-blur-[20px] border-b border-[rgba(10,77,140,0.1)] animate-[slideDown_0.6s_ease-out]">
      <div className="max-w-[1400px] mx-auto px-8 py-5 flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-display text-3xl font-extrabold text-[var(--blue)] no-underline z-[1001]">
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

        {/* Mobile Menu Button */}
        <button
          onClick={toggleMenu}
          className="md:hidden relative w-10 h-10 flex flex-col items-center justify-center z-[1001] group"
          aria-label="Toggle menu"
        >
          {/* Hamburger Icon */}
          <div className="relative w-6 h-5">
            <span
              className={`absolute left-0 top-0 h-0.5 w-full bg-[var(--black)] transition-all duration-300 rounded-full ${isMenuOpen ? 'rotate-45 top-2' : ''
                }`}
            />
            <span
              className={`absolute left-0 top-2 h-0.5 w-full bg-[var(--black)] transition-all duration-300 rounded-full ${isMenuOpen ? 'opacity-0' : ''
                }`}
            />
            <span
              className={`absolute left-0 top-4 h-0.5 w-full bg-[var(--black)] transition-all duration-300 rounded-full ${isMenuOpen ? '-rotate-45 top-2' : ''
                }`}
            />
          </div>
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/50 md:hidden z-[999] animate-[fadeInSection_0.3s_ease-out]"
            onClick={closeMenu}
          />

          {/* Menu Panel */}
          <div className="fixed top-[70px] left-0 right-0 bg-white border-b border-[rgba(10,77,140,0.1)] md:hidden z-[1000] animate-[slideDown_0.3s_ease-out] max-h-[calc(100vh-70px)] overflow-y-auto">
            <div className="px-8 py-6 space-y-4">
              {/* Navigation Links */}
              <Link
                href="#features"
                onClick={closeMenu}
                className="block py-3 px-4 rounded-lg text-[var(--black)] no-underline font-medium transition-colors duration-300 hover:bg-[var(--gray)] hover:text-[var(--orange)]"
              >
                Features
              </Link>
              <Link
                href="#how-it-works"
                onClick={closeMenu}
                className="block py-3 px-4 rounded-lg text-[var(--black)] no-underline font-medium transition-colors duration-300 hover:bg-[var(--gray)] hover:text-[var(--orange)]"
              >
                How It Works
              </Link>
              <Link
                href="#pricing"
                onClick={closeMenu}
                className="block py-3 px-4 rounded-lg text-[var(--black)] no-underline font-medium transition-colors duration-300 hover:bg-[var(--gray)] hover:text-[var(--orange)]"
              >
                Pricing
              </Link>

              {/* Divider */}
              <div className="h-px bg-[rgba(10,77,140,0.1)] my-4" />

              {/* Action Buttons */}
              <div className="space-y-3 pt-2">
                <Button
                  variant="secondary"
                  href="/signin"
                  className="w-full text-center"
                >
                  Sign In
                </Button>
                <Button
                  variant="primary"
                  href="/signup"
                  className="w-full text-center"
                >
                  Get Started Free
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </nav>
  )
}