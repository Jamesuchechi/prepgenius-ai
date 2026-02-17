import React from 'react'
import StaticPageLayout from '@/components/layout/StaticPageLayout'
import { Button } from '@/components/ui/Button'

export default function TutorPage() {
    return (
        <StaticPageLayout
            title="Meet Your 24/7 AI Tutor"
            subtitle="Personalized, instant guidance for every subject in the Nigerian curriculum."
        >
            <div className="grid md:grid-cols-2 gap-12 mb-20 items-center">
                <div className="order-2 md:order-1 bg-[var(--blue)] p-8 rounded-3xl text-white shadow-2xl relative">
                    <div className="space-y-4">
                        <div className="bg-white/10 p-4 rounded-xl text-sm border border-white/20">
                            <p className="font-bold text-blue-200 mb-1">Student</p>
                            "Can you explain the significance of the 1914 Amalgamation in Nigerian history?"
                        </div>
                        <div className="bg-white/20 p-4 rounded-xl text-sm border border-white/30 backdrop-blur-sm ml-4">
                            <p className="font-bold text-[var(--orange)] mb-1">AI Tutor</p>
                            "Great question! The 1914 Amalgamation was a major turning point. Lord Lugard joined the Northern and Southern Protectorates... [read more]"
                        </div>
                    </div>
                    <div className="absolute -bottom-4 -right-4 bg-[var(--orange)] w-12 h-12 rounded-full flex items-center justify-center text-2xl animate-bounce">
                        💡
                    </div>
                </div>

                <div className="order-1 md:order-2">
                    <h2 className="text-3xl font-bold mb-6">Learning That Understands You</h2>
                    <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                        Our AI doesn't just give answers; it helps you learn. It adapts to your comprehension level, simplifies complex concepts, and references specific past questions from JAMB and WAEC.
                    </p>
                    <div className="space-y-6">
                        <div className="flex gap-4">
                            <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center flex-shrink-0 text-[var(--blue)] font-bold">1</div>
                            <p className="text-slate-600"><span className="font-bold text-slate-900">Contextual Explanations:</span> Get answers tailored to the Nigerian exam format.</p>
                        </div>
                        <div className="flex gap-4">
                            <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center flex-shrink-0 text-[var(--blue)] font-bold">2</div>
                            <p className="text-slate-600"><span className="font-bold text-slate-900">Step-by-Step Solving:</span> Master Mathematics and Sciences with guided solutions.</p>
                        </div>
                    </div>
                    <Button variant="primary" size="lg" className="mt-10 px-10">Chat with Tutor</Button>
                </div>
            </div>

            <div className="bg-slate-50 p-12 rounded-3xl">
                <h2 className="text-3xl font-bold mb-12 text-center">Beyond Just Answers</h2>
                <div className="grid md:grid-cols-3 gap-8 text-center">
                    <div>
                        <div className="text-4xl mb-4">🧠</div>
                        <h3 className="font-bold mb-2">Memory Boost</h3>
                        <p className="text-sm text-slate-500">The AI identifies your weak spots and reinforces those concepts.</p>
                    </div>
                    <div>
                        <div className="text-4xl mb-4">📅</div>
                        <h3 className="font-bold mb-2">Study Scheduling</h3>
                        <p className="text-sm text-slate-500">Ask the tutor to help you organize your daily revision goals.</p>
                    </div>
                    <div>
                        <div className="text-4xl mb-4">📢</div>
                        <h3 className="font-bold mb-2">Voice Mode</h3>
                        <p className="text-sm text-slate-500">Listen to explanations while you're on the go (Mobile App only).</p>
                    </div>
                </div>
            </div>
        </StaticPageLayout>
    )
}
