'use client'

import React, { useState } from 'react'
import StaticPageLayout from '@/components/layout/StaticPageLayout'
import Link from 'next/link'

const examTypes = ['All', 'JAMB', 'WAEC', 'NECO', 'Post-UTME', 'IGCSE', 'SAT']

const guides = [
    { title: 'JAMB Mathematics Complete Guide', subjects: ['Math', 'CBT'], exam: 'JAMB', difficulty: 'Intermediate', pages: 64, downloads: '12.4k', emoji: '📐', bg: 'from-blue-500 to-blue-700' },
    { title: 'WAEC English Language & Literature', subjects: ['English', 'Drama'], exam: 'WAEC', difficulty: 'Advanced', pages: 88, downloads: '9.8k', emoji: '📖', bg: 'from-purple-500 to-purple-700' },
    { title: 'JAMB Biology: Mastery Edition', subjects: ['Biology'], exam: 'JAMB', difficulty: 'All Levels', pages: 72, downloads: '14.2k', emoji: '🧬', bg: 'from-green-500 to-green-700' },
    { title: 'NECO Physics with Past Questions', subjects: ['Physics'], exam: 'NECO', difficulty: 'Intermediate', pages: 56, downloads: '7.3k', emoji: '⚡', bg: 'from-yellow-500 to-yellow-700' },
    { title: 'WAEC Chemistry: Full Revision Pack', subjects: ['Chemistry'], exam: 'WAEC', difficulty: 'Intermediate', pages: 80, downloads: '11.1k', emoji: '🔬', bg: 'from-red-500 to-red-700' },
    { title: 'Government & Civic Education Guide', subjects: ['Government'], exam: 'WAEC', difficulty: 'Beginner', pages: 48, downloads: '5.9k', emoji: '🏛️', bg: 'from-slate-500 to-slate-700' },
    { title: 'Post-UTME Preparation Masterclass', subjects: ['General', 'Essays'], exam: 'Post-UTME', difficulty: 'Advanced', pages: 96, downloads: '8.7k', emoji: '🎓', bg: 'from-orange-500 to-orange-700' },
    { title: 'JAMB Economics: Theory + Practice', subjects: ['Economics'], exam: 'JAMB', difficulty: 'Intermediate', pages: 60, downloads: '6.4k', emoji: '📈', bg: 'from-teal-500 to-teal-700' },
    { title: 'SAT Math + Verbal Complete Prep', subjects: ['Math', 'Verbal'], exam: 'SAT', difficulty: 'Advanced', pages: 120, downloads: '4.2k', emoji: '🇺🇸', bg: 'from-cyan-500 to-cyan-700' },
]

const difficultyColors: Record<string, string> = {
    'Beginner': 'bg-green-100 text-green-700',
    'Intermediate': 'bg-blue-100 text-blue-700',
    'Advanced': 'bg-purple-100 text-purple-700',
    'All Levels': 'bg-orange-100 text-orange-700',
}

export default function GuidesPage() {
    const [activeExam, setActiveExam] = useState('All')
    const [search, setSearch] = useState('')

    const filtered = guides.filter(g => {
        const matchesExam = activeExam === 'All' || g.exam === activeExam
        const matchesSearch = !search || g.title.toLowerCase().includes(search.toLowerCase()) || g.subjects.some(s => s.toLowerCase().includes(search.toLowerCase()))
        return matchesExam && matchesSearch
    })

    return (
        <StaticPageLayout
            title="Study Guides"
            subtitle="Comprehensive, expertly crafted revision materials for every major Nigerian and international exam."
        >
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
                {[
                    { val: '50+', label: 'Study Guides', icon: '📚' },
                    { val: '100k+', label: 'Downloads', icon: '⬇️' },
                    { val: '8', label: 'Exam Boards', icon: '🏆' },
                    { val: 'Free', label: 'With Any Plan', icon: '🎁' },
                ].map((s, i) => (
                    <div key={i} className="bg-card border border-border rounded-2xl p-5 text-center hover:shadow-md transition-shadow">
                        <div className="text-2xl mb-1">{s.icon}</div>
                        <div className="text-2xl font-extrabold text-foreground">{s.val}</div>
                        <div className="text-xs text-muted-foreground font-medium mt-0.5">{s.label}</div>
                    </div>
                ))}
            </div>

            {/* Search */}
            <div className="relative mb-6">
                <input
                    type="text"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search by subject, title, or exam..."
                    className="w-full pl-12 pr-6 py-4 rounded-2xl border border-border bg-background focus:border-primary focus:outline-none transition-colors text-lg"
                />
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl">🔍</span>
            </div>

            {/* Exam Type Filters */}
            <div className="flex flex-wrap gap-3 mb-10">
                {examTypes.map(exam => (
                    <button
                        key={exam}
                        onClick={() => setActiveExam(exam)}
                        className={`px-5 py-2 rounded-full text-sm font-bold transition-all ${activeExam === exam
                            ? 'bg-[var(--blue)] text-white shadow-md'
                            : 'bg-card border border-border text-muted-foreground hover:border-[var(--orange)] hover:text-[var(--orange)]'
                            }`}
                    >
                        {exam}
                    </button>
                ))}
            </div>

            {/* Guides Grid */}
            {filtered.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground">
                    <div className="text-5xl mb-4">🔍</div>
                    <p className="text-lg font-medium">No guides match your search.</p>
                    <button onClick={() => { setSearch(''); setActiveExam('All') }} className="mt-4 text-primary hover:underline font-medium">
                        Clear filters
                    </button>
                </div>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
                    {filtered.map((guide, i) => (
                        <div key={i} className="bg-card border border-border rounded-3xl overflow-hidden hover:shadow-xl transition-all group">
                            <div className={`bg-gradient-to-br ${guide.bg} p-8 flex items-center justify-center text-5xl relative`}>
                                <span className="group-hover:scale-110 transition-transform duration-300">{guide.emoji}</span>
                                <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm text-white text-xs font-bold px-3 py-1 rounded-full">
                                    {guide.exam}
                                </div>
                            </div>
                            <div className="p-6">
                                <h3 className="font-bold text-foreground mb-3 leading-snug group-hover:text-[var(--blue)] transition-colors">
                                    {guide.title}
                                </h3>
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {guide.subjects.map(s => (
                                        <span key={s} className="text-xs bg-muted text-muted-foreground px-2.5 py-1 rounded-lg font-medium">{s}</span>
                                    ))}
                                    <span className={`text-xs px-2.5 py-1 rounded-lg font-medium ${difficultyColors[guide.difficulty]}`}>
                                        {guide.difficulty}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                                    <span>📄 {guide.pages} pages</span>
                                    <span>⬇️ {guide.downloads} downloads</span>
                                </div>
                                <Link href="/signup" className="w-full block text-center bg-gradient-to-r from-[var(--blue)] to-[var(--blue-darker)] text-white py-2.5 rounded-xl font-bold text-sm hover:opacity-90 transition-all">
                                    Download Guide
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* CTA */}
            <div className="bg-gradient-to-br from-[var(--blue)] to-[var(--blue-darker)] rounded-3xl p-12 text-center text-white">
                <div className="text-5xl mb-4">🎓</div>
                <h3 className="text-3xl font-bold mb-3">Unlock All Study Guides</h3>
                <p className="text-blue-100 mb-8 max-w-lg mx-auto">
                    Premium subscribers get access to all 50+ guides, AI-powered summaries, and downloadable PDFs — all in one place.
                </p>
                <Link href="/signup" className="inline-block bg-[var(--orange)] hover:bg-[var(--orange-light)] text-white px-10 py-4 rounded-full font-bold text-lg transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1">
                    Start Free — No Credit Card →
                </Link>
            </div>
        </StaticPageLayout>
    )
}
