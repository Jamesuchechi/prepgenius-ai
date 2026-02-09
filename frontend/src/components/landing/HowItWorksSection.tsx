import React from 'react'
import SectionHeader from '@/components/ui/SectionHeader'

const steps = [
  {
    number: '1',
    title: 'Create Your Profile',
    description: 'Sign up and tell us about your exam goals, subjects, and timeline.'
  },
  {
    number: '2',
    title: 'Get Your Plan',
    description: 'AI generates a personalized study plan optimized for your success.'
  },
  {
    number: '3',
    title: 'Practice & Learn',
    description: 'Complete daily tasks, practice questions, and track your progress.'
  },
  {
    number: '4',
    title: 'Ace Your Exam',
    description: 'Take mock exams, refine weak areas, and enter test day confident.'
  }
]

export default function HowItWorksSection() {
  return (
    <section 
      id="how-it-works" 
      className="py-[100px] px-8 bg-gradient-to-br from-[var(--blue)] to-[var(--blue-light)] relative overflow-hidden fade-in-section"
    >
      {/* Background Pattern */}
      <div className="absolute top-0 left-0 right-0 bottom-0 bg-[radial-gradient(circle_at_20%_50%,rgba(255,255,255,0.1)_0%,transparent_50%),radial-gradient(circle_at_80%_80%,rgba(255,255,255,0.05)_0%,transparent_50%)]" />

      <div className="relative z-[1]">
        <SectionHeader 
          badge="📖 How It Works"
          title="Your Path to Success in 4 Simple Steps"
          description="From signup to exam success, we guide you every step of the way."
          isDark
        />

        <div className="max-w-[1200px] mx-auto grid md:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div 
              key={index}
              className="text-center animate-[fadeInUp_0.8s_ease-out_backwards]"
              style={{ animationDelay: `${(index + 1) * 0.1}s` }}
            >
              <div className="w-20 h-20 bg-white/15 backdrop-blur-[10px] rounded-full flex items-center justify-center font-display text-[2rem] font-extrabold text-white mx-auto mb-6 border-[3px] border-white/30">
                {step.number}
              </div>
              <h3 className="font-display text-[1.3rem] font-bold text-white mb-3">
                {step.title}
              </h3>
              <p className="text-white/90 leading-[1.6]">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}