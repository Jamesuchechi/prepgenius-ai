'use client'

import { ReactNode, useEffect } from 'react'
import { Toaster } from 'sonner'

export function LayoutClient({ children }: { children: ReactNode }) {
  useEffect(() => {
    // Scroll observer for fade-in effects
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -100px 0px',
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible')
        }
      })
    }, observerOptions)

    // Observe all elements with fade-in-section class
    const fadeInSections = document.querySelectorAll('.fade-in-section')
    fadeInSections.forEach((section) => {
      observer.observe(section)
    })

    // Smooth scroll for anchor links
    const anchorLinks = document.querySelectorAll('a[href^="#"]')
    anchorLinks.forEach((anchor) => {
      anchor.addEventListener('click', function (e: Event) {
        const target = e.currentTarget as HTMLAnchorElement
        const href = target.getAttribute('href')
        if (href && href !== '#') {
          e.preventDefault()
          const targetId = href.substring(1)
          const targetEl = document.getElementById(targetId)
          if (targetEl) {
            targetEl.scrollIntoView({
              behavior: 'smooth',
              block: 'start',
            })
          }
        }
      })
    })

    return () => {
      observer.disconnect()
    }
  }, [])

  return (
    <>
      {children}
      <Toaster position="top-right" richColors closeButton />
    </>
  )
}
