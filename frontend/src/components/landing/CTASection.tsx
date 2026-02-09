import React from 'react'
import Button from '@/components/ui/Button'

export default function CTASection() {
  return (
    <section className="py-[100px] px-8 bg-gradient-to-br from-[#0D0D0D] to-[#1A1A1A] relative overflow-hidden fade-in-section">
      {/* Background Decoration */}
      <div className="absolute top-[-50%] right-[-20%] w-[600px] h-[600px] bg-[radial-gradient(circle,rgba(255,107,53,0.2)_0%,transparent_70%)] rounded-full" />

      <div className="max-w-[900px] mx-auto text-center relative z-[1]">
        <h2 className="font-display text-[3.5rem] font-extrabold text-white mb-6 leading-[1.2] max-md:text-4xl">
          Ready to Transform Your Exam Preparation?
        </h2>
        <p className="text-[1.3rem] text-white/80 mb-10 max-md:text-lg">
          Join thousands of students who have already improved their scores with PrepGenius AI.
        </p>
        <div className="flex gap-4 justify-center">
          <Button 
            variant="primary" 
            href="/signup"
            className="text-lg px-10 py-4"
          >
            Start Learning Free Today
          </Button>
        </div>
      </div>
    </section>
  )
}