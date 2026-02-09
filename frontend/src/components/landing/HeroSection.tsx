'use client'

import React from 'react'
import Button from '@/components/ui/Button'

export default function HeroSection() {
  return (
    <section className="min-h-screen pt-[120px] pb-20 px-8 bg-gradient-to-br from-[#FAFAFA] to-white relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute top-[-50%] right-[-20%] w-[800px] h-[800px] bg-[radial-gradient(circle,rgba(255,107,53,0.1)_0%,transparent_70%)] rounded-full animate-[float_20s_ease-in-out_infinite]" />
      <div className="absolute bottom-[-30%] left-[-10%] w-[600px] h-[600px] bg-[radial-gradient(circle,rgba(10,77,140,0.08)_0%,transparent_70%)] rounded-full animate-[float_15s_ease-in-out_infinite_reverse]" />

      <div className="max-w-[1400px] mx-auto grid md:grid-cols-[1.2fr_1fr] gap-16 items-center relative z-[1]">
        {/* Hero Content */}
        <div className="animate-[fadeInUp_0.8s_ease-out_0.2s_backwards]">
          <div className="inline-block bg-gradient-to-br from-[rgba(10,77,140,0.1)] to-[rgba(10,77,140,0.05)] text-[var(--blue)] px-6 py-2 rounded-full text-sm font-semibold mb-6 border border-[rgba(10,77,140,0.2)]">
            🚀 Trusted by 10,000+ Students
          </div>
          
          <h1 className="font-display text-[5rem] font-extrabold leading-[1.03] mb-6 text-[var(--black)] max-md:text-5xl">
            Master Your Exams with{' '}
            <span className="bg-gradient-to-br from-[var(--orange)] to-[var(--orange-light)] bg-clip-text text-transparent">
              AI-Powered Learning
            </span>
          </h1>

          <p className="text-[1.35rem] text-[var(--gray-dark)] mb-10 leading-[1.9] max-md:text-lg">
            PrepGenius uses advanced AI to create personalized study plans, adaptive practice questions, and instant feedback tailored to your JAMB, WAEC, and NECO preparation.
          </p>

          <div className="flex gap-4 items-center mb-12 max-md:flex-col">
            <Button variant="primary" href="/signup" className="px-8 py-4 text-lg">
              Start Learning Free
            </Button>
            <Button variant="secondary" href="#demo" className="px-6 py-3">
              Watch Demo
            </Button>
          </div>

          {/* Stats */}
          <div className="flex gap-12 animate-[fadeInUp_0.8s_ease-out_0.4s_backwards] max-md:flex-col max-md:gap-6">
            <div className="text-left">
              <span className="font-display text-[3rem] font-extrabold text-[var(--orange)] block">95%</span>
              <span className="text-[var(--gray-dark)] text-[0.95rem] mt-1">Pass Rate</span>
            </div>
            <div className="text-left">
              <span className="font-display text-[3rem] font-extrabold text-[var(--orange)] block">50K+</span>
              <span className="text-[var(--gray-dark)] text-[0.95rem] mt-1">Questions</span>
            </div>
            <div className="text-left">
              <span className="font-display text-[3rem] font-extrabold text-[var(--orange)] block">24/7</span>
              <span className="text-[var(--gray-dark)] text-[0.95rem] mt-1">AI Tutor</span>
            </div>
          </div>
        </div>

        {/* Hero Visual - Question Mockup */}
        <div className="relative animate-[fadeInUp_0.8s_ease-out_0.6s_backwards]">
          <div className="bg-white rounded-3xl p-8 shadow-[0_28px_80px_rgba(0,0,0,0.14)] border border-[rgba(10,77,140,0.1)]">
            {/* Mockup Header */}
            <div className="flex items-center gap-4 mb-6 pb-4 border-b border-[#F0F0F0]">
              <div className="w-[50px] h-[50px] bg-gradient-to-br from-[var(--blue)] to-[var(--blue-light)] rounded-full flex items-center justify-center text-white font-bold text-xl">
                JU
              </div>
              <div>
                <h4 className="font-semibold text-[var(--black)] mb-1">James Uchechi</h4>
                <p className="text-[var(--gray-dark)] text-[0.85rem]">Mathematics • JAMB 2026</p>
              </div>
            </div>

            {/* Question Preview */}
            <div className="bg-[var(--gray)] p-6 rounded-xl mb-4">
              <h5 className="text-[var(--black)] mb-4 font-semibold">Question 15 of 60</h5>
              <p className="text-[var(--black)] mb-4">
                If 3x - 2y = 10 and x + y = 5, find the value of x.
              </p>
              
              {/* Options */}
              {['A', 'B', 'C', 'D'].map((letter, idx) => (
                <div 
                  key={letter}
                  className="bg-white p-3 rounded-lg mb-2 flex items-center gap-3 cursor-pointer transition-all duration-300 border-2 border-transparent hover:border-[var(--orange)] hover:translate-x-1"
                >
                  <div className="w-[30px] h-[30px] bg-[var(--gray)] rounded-full flex items-center justify-center font-semibold text-[var(--blue)]">
                    {letter}
                  </div>
                  <span>x = {idx + 2}</span>
                </div>
              ))}
            </div>

            {/* Progress */}
            <div className="mt-4">
              <p className="text-[0.85rem] text-[var(--gray-dark)] mb-2">Your Progress: 65%</p>
              <div className="bg-[var(--gray)] h-2 rounded-[10px] overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[var(--orange)] to-[var(--orange-light)] w-[65%] rounded-[10px] animate-[progressGrow_2s_ease-out]" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}