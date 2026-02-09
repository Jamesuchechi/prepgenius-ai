import React from 'react'
import SectionHeader from '@/components/ui/SectionHeader'

const features = [
  {
    icon: '🎯',
    title: 'Personalized Study Plans',
    description: 'AI creates custom study schedules based on your strengths, weaknesses, and exam timeline. Adapt in real-time as you progress.'
  },
  {
    icon: '🤖',
    title: 'AI-Generated Questions',
    description: 'Unlimited practice questions tailored to JAMB, WAEC, and NECO formats. Difficulty adjusts to your performance level.'
  },
  {
    icon: '💡',
    title: 'Smart Explanations',
    description: 'Get step-by-step solutions and concept explanations that match your learning style and comprehension level.'
  },
  {
    icon: '⏱️',
    title: 'Mock Exam Simulator',
    description: 'Practice with timed exams that replicate real test conditions. Build confidence and master time management.'
  },
  {
    icon: '📊',
    title: 'Performance Analytics',
    description: 'Track your progress with detailed insights. Identify weak topics and monitor improvement over time.'
  },
  {
    icon: '💬',
    title: '24/7 AI Tutor',
    description: 'Ask questions anytime and get instant, personalized help. Like having a tutor in your pocket.'
  }
]

export default function FeaturesSection() {
  return (
    <section id="features" className="py-[100px] px-8 bg-white fade-in-section">
      <SectionHeader 
        badge="✨ Features"
        title="Everything You Need to Excel"
        description="Powerful tools designed to make your exam preparation smarter, faster, and more effective."
      />

      <div className="max-w-[1400px] mx-auto grid md:grid-cols-3 gap-8">
        {features.map((feature, index) => (
          <div 
            key={index}
            className="bg-white p-10 rounded-[20px] border-2 border-transparent transition-all duration-[0.4s] relative overflow-hidden before:content-[''] before:absolute before:top-0 before:left-0 before:right-0 before:h-1 before:bg-gradient-to-r before:from-[var(--orange)] before:to-[var(--orange-light)] before:scale-x-0 before:origin-left before:transition-transform before:duration-[0.4s] hover:before:scale-x-100 hover:border-[rgba(255,107,53,0.2)] hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)]"
          >
            <div className="w-[70px] h-[70px] bg-gradient-to-br from-[rgba(255,107,53,0.1)] to-[rgba(255,107,53,0.05)] rounded-2xl flex items-center justify-center mb-6 text-[2rem]">
              {feature.icon}
            </div>
            <h3 className="font-display text-2xl font-bold mb-4 text-[var(--black)]">
              {feature.title}
            </h3>
            <p className="text-[var(--gray-dark)] leading-[1.7]">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}