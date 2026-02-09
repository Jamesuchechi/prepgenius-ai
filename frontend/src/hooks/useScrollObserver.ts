'use client'

import { useEffect } from 'react'

/**
 * Hook to observe elements and add 'is-visible' class when they scroll into view
 * Used for fade-in animations triggered by scroll
 */
export function useScrollObserver() {
  useEffect(() => {
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
    document.querySelectorAll('.fade-in-section').forEach((section) => {
      observer.observe(section)
    })

    return () => {
      observer.disconnect()
    }
  }, [])
}
