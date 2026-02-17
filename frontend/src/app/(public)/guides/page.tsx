import React from 'react'
import StaticPageLayout from '@/components/layout/StaticPageLayout'

const guides = [
    { title: "JAMB Mathematics Mastery", subjects: ["Math", "CBT"], difficulty: "Intermediate" },
    { title: "WAEC English Literature Guide", subjects: ["English", "Drama"], difficulty: "Advanced" },
    { title: "NECO Physics Lab Manual", subjects: ["Physics", "Practical"], difficulty: "All Levels" },
    { title: "Biology: The Human Anatomy", subjects: ["Biology"], difficulty: "Beginner" },
    { title: "Government & Civic Education", subjects: ["Government"], difficulty: "Intermediate" },
    { title: "Post-UTME Preparation 101", subjects: ["General"], difficulty: "Advanced" }
]

export default function GuidesPage() {
    return (
        <StaticPageLayout
            title="Study Guides"
            subtitle="Comprehensive subject breakdown and revision materials."
        >
            <div className="mb-12 flex flex-wrap gap-4">
                {['All Subjects', 'JAMB', 'WAEC', 'NECO', 'Post-UTME'].map((filter) => (
                    <button key={filter} className="px-6 py-2 rounded-full border border-slate-200 text-sm font-bold hover:border-[var(--orange)] hover:text-[var(--orange)] transition-all">
                        {filter}
                    </button>
                ))}
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {guides.map((guide, index) => (
                    <div key={index} className="bg-white border p-6 rounded-2xl hover:border-[var(--orange)] hover:shadow-lg transition-all cursor-pointer group">
                        <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-[rgba(255,107,53,0.1)] transition-colors">
                            📘
                        </div>
                        <h3 className="font-bold mb-2 group-hover:text-[var(--orange)] transition-colors">{guide.title}</h3>
                        <div className="flex flex-wrap gap-2 mb-4">
                            {guide.subjects.map(s => (
                                <span key={s} className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-500 px-2 py-0.5 rounded">
                                    {s}
                                </span>
                            ))}
                        </div>
                        <div className="flex justify-between items-center text-xs text-slate-400">
                            <span>{guide.difficulty}</span>
                            <span className="text-[var(--blue)] font-bold">Download PDf</span>
                        </div>
                    </div>
                ))}
            </div>
        </StaticPageLayout>
    )
}
