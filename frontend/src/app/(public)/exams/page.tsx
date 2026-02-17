import React from 'react'
import StaticPageLayout from '@/components/layout/StaticPageLayout'
import { Button } from '@/components/ui/Button'

export default function ExamsPage() {
    return (
        <StaticPageLayout
            title="Mock Exam Simulator"
            subtitle="Practice with real exam conditions. JAMB, WAEC, NECO, and Post-UTME."
        >
            <div className="grid md:grid-cols-2 gap-12 mb-20 items-center">
                <div>
                    <h2 className="text-3xl font-bold mb-6">Real CBT Experience</h2>
                    <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                        Our simulator perfectly replicates the official exam platforms. Get comfortable with the interface, master time management, and eliminate exam-day anxiety.
                    </p>
                    <ul className="space-y-4 mb-8">
                        <li className="flex items-center gap-3">
                            <span className="text-green-500 font-bold">✓</span>
                            <span>Authentic UI for JAMB & WAEC CBT</span>
                        </li>
                        <li className="flex items-center gap-3">
                            <span className="text-green-500 font-bold">✓</span>
                            <span>Timed sessions with break alerts</span>
                        </li>
                        <li className="flex items-center gap-3">
                            <span className="text-green-500 font-bold">✓</span>
                            <span>Instant AI-driven performance reports</span>
                        </li>
                    </ul>
                    <Button variant="primary" size="lg" className="px-10">Start Free Mock</Button>
                </div>
                <div className="bg-slate-100 rounded-3xl aspect-video flex items-center justify-center text-8xl border-4 border-white shadow-2xl skew-y-3">
                    🎓
                </div>
            </div>

            <h2 className="text-2xl font-bold mb-8">Available Exam Tracks</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-20">
                {['JAMB UTME', 'WAEC SSCE', 'NECO', 'Post-UTME'].map(exam => (
                    <div key={exam} className="p-6 bg-white border rounded-2xl text-center hover:border-[var(--orange)] transition-all cursor-pointer">
                        <h3 className="font-bold">{exam}</h3>
                        <p className="text-xs text-slate-400 mt-2">2,000+ Past Questions</p>
                    </div>
                ))}
            </div>

            <div className="bg-slate-50 p-12 rounded-3xl">
                <h2 className="text-2xl font-bold mb-12 text-center">How it Works</h2>
                <div className="grid md:grid-cols-3 gap-8">
                    <div className="text-center">
                        <div className="w-12 h-12 bg-[var(--orange)] text-white rounded-full flex items-center justify-center font-bold mx-auto mb-4">1</div>
                        <h3 className="font-bold mb-2">Select Exam</h3>
                        <p className="text-sm text-slate-500">Pick your exam and subject combination.</p>
                    </div>
                    <div className="text-center">
                        <div className="w-12 h-12 bg-[var(--orange)] text-white rounded-full flex items-center justify-center font-bold mx-auto mb-4">2</div>
                        <h3 className="font-bold mb-2">Take Test</h3>
                        <p className="text-sm text-slate-500">Practice under timed, realistic conditions.</p>
                    </div>
                    <div className="text-center">
                        <div className="w-12 h-12 bg-[var(--orange)] text-white rounded-full flex items-center justify-center font-bold mx-auto mb-4">3</div>
                        <h3 className="font-bold mb-2">Get Results</h3>
                        <p className="text-sm text-slate-500">Receive detailed AI analysis of your score.</p>
                    </div>
                </div>
            </div>
        </StaticPageLayout>
    )
}
