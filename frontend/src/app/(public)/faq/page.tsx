'use client'

import React, { useState } from 'react'
import StaticPageLayout from '@/components/layout/StaticPageLayout'
import Link from 'next/link'

const allFaqs = [
    {
        category: 'General',
        emoji: '🌐',
        questions: [
            {
                q: 'What is PrepGenius AI?',
                a: 'PrepGenius AI is Nigeria\'s leading AI-powered exam preparation platform. We provide personalized study plans, real mock exams, 24/7 AI tutoring, and detailed performance analytics — all calibrated for Nigerian exam formats (JAMB, WAEC, NECO, and more).'
            },
            {
                q: 'Who is PrepGenius AI for?',
                a: 'PrepGenius AI is designed for SS1–SS3 students, JAMB candidates, WAEC/NECO candidates, Post-UTME applicants, and anyone preparing for standardized exams including SAT, IELTS, TOEFL, and GRE.'
            },
            {
                q: 'Can I use PrepGenius AI on my phone?',
                a: 'Absolutely. The platform is fully mobile-responsive and works on any smartphone, tablet, or computer. A dedicated mobile app for Android and iOS is in development.'
            },
            {
                q: 'Is there a free version?',
                a: 'Yes! Our Free plan gives you 10 questions per day, basic progress tracking, and limited AI interactions — no credit card required. You can upgrade anytime for unlimited access.'
            },
        ]
    },
    {
        category: 'AI Tutor',
        emoji: '🤖',
        questions: [
            {
                q: 'How does the AI Tutor work?',
                a: 'The AI Tutor is trained on the Nigerian curriculum and past exam content. You can type any question — from explaining a complex chemistry concept to solving a JAMB math problem — and it will respond with detailed, step-by-step explanations tailored for Nigerian students.'
            },
            {
                q: 'Is the AI Tutor available 24/7?',
                a: 'Yes! Unlike a human tutor, our AI is always available — whether it\'s 2am before your JAMB or a Sunday afternoon study session. Human support from our team is available Mon–Fri, 9am–6pm WAT.'
            },
            {
                q: 'What subjects can the AI Tutor help with?',
                a: 'The AI Tutor covers all JAMB, WAEC, and NECO subjects including Mathematics, English, Biology, Chemistry, Physics, Economics, Government, Literature, History, Geography, and many more.'
            },
        ]
    },
    {
        category: 'Mock Exams',
        emoji: '📝',
        questions: [
            {
                q: 'How are mock exams created?',
                a: 'You choose your preferred exam board (JAMB, WAEC, NABTEB, etc.), subject, number of questions, and time limit. You can draw from our past-questions database or let our AI generate fresh questions calibrated to your weakness areas.'
            },
            {
                q: 'Are the exams timed like the real thing?',
                a: 'Yes. Each exam has a configurable timer that matches the real exam format. You\'ll see a countdown, and the exam auto-submits when time runs out — just like the CBT format.'
            },
            {
                q: 'What happens after I submit an exam?',
                a: 'You\'ll immediately see your score, a full answer breakdown with explanations for every question, your performance percentile, and AI-generated recommendations for what to revise next.'
            },
        ]
    },
    {
        category: 'Pricing & Billing',
        emoji: '💳',
        questions: [
            {
                q: 'What plans are available?',
                a: 'We offer Free, Weekly (₦500), Monthly (₦2,500), Quarterly (₦6,000), Bi-Annual (₦10,000), and Annual (₦20,000) plans. All paid plans include unlimited questions, mock exams, AI Tutor, and analytics.'
            },
            {
                q: 'Can I cancel my subscription?',
                a: 'Yes, you can cancel anytime from Dashboard → Settings → Subscription. You\'ll keep access until the end of your billing period — no immediate cutoff and no hassle.'
            },
            {
                q: 'Do you offer a money-back guarantee?',
                a: 'Annual plans come with a 30-day money-back guarantee. If you\'re not satisfied, contact us at support@prepgenius.ai and we\'ll process a full refund within 3 business days.'
            },
            {
                q: 'What payment methods are accepted?',
                a: 'We accept Visa, Mastercard, bank transfer, and mobile money (MTN, Airtel, Glo) — all processed securely by Paystack. We never store raw card details on our servers.'
            },
        ]
    },
    {
        category: 'Privacy & Security',
        emoji: '🔐',
        questions: [
            {
                q: 'Is my data safe on PrepGenius AI?',
                a: 'Your data is encrypted in transit (TLS 1.3) and at rest. We never sell your personal data. We use industry-standard security measures including regular audits and strict access controls. Read our full Privacy Policy for details.'
            },
            {
                q: 'Who can see my performance data?',
                a: 'Only you can see your detailed study data and performance analytics. Institutional administrators can see aggregate performance summaries — never individual question-level data — only for students under their institution.'
            },
        ]
    },
]

const categories = ['All', ...allFaqs.map(g => g.category)]

export default function FAQPage() {
    const [activeCategory, setActiveCategory] = useState('All')
    const [openItem, setOpenItem] = useState<string | null>(null)
    const [search, setSearch] = useState('')

    const filteredGroups = allFaqs
        .filter(g => activeCategory === 'All' || g.category === activeCategory)
        .map(g => ({
            ...g,
            questions: g.questions.filter(q =>
                !search ||
                q.q.toLowerCase().includes(search.toLowerCase()) ||
                q.a.toLowerCase().includes(search.toLowerCase())
            )
        }))
        .filter(g => g.questions.length > 0)

    const totalQuestions = filteredGroups.reduce((sum, g) => sum + g.questions.length, 0)

    return (
        <StaticPageLayout
            title="Frequently Asked Questions"
            subtitle="Everything you need to know about PrepGenius AI, answered clearly and concisely."
        >
            {/* Search */}
            <div className="relative mb-8">
                <input
                    type="text"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search all questions..."
                    className="w-full pl-12 pr-6 py-4 rounded-2xl border border-border bg-background focus:border-primary focus:outline-none transition-colors text-base shadow-sm"
                />
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl">🔍</span>
                {search && (
                    <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground text-sm">
                        ✕ Clear
                    </button>
                )}
            </div>

            {/* Category Tabs */}
            <div className="flex flex-wrap gap-3 mb-10">
                {categories.map(cat => (
                    <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={`px-5 py-2 rounded-full text-sm font-bold transition-all ${activeCategory === cat
                            ? 'bg-[var(--blue)] text-white shadow-md'
                            : 'bg-card border border-border text-muted-foreground hover:border-[var(--orange)] hover:text-[var(--orange)]'
                            }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* Results count */}
            {search && (
                <p className="text-sm text-muted-foreground mb-6">
                    {totalQuestions} result{totalQuestions !== 1 ? 's' : ''} for "{search}"
                </p>
            )}

            {/* FAQ Groups */}
            {filteredGroups.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground">
                    <div className="text-5xl mb-4">🤷</div>
                    <p className="text-lg font-medium">No questions match your search.</p>
                    <button onClick={() => { setSearch(''); setActiveCategory('All') }} className="mt-3 text-primary hover:underline">
                        Clear filters
                    </button>
                </div>
            ) : (
                <div className="space-y-12 mb-16">
                    {filteredGroups.map((group, gi) => (
                        <section key={gi}>
                            <div className="flex items-center gap-3 mb-6">
                                <span className="text-3xl">{group.emoji}</span>
                                <h2 className="text-2xl font-bold text-foreground">{group.category}</h2>
                            </div>
                            <div className="space-y-3">
                                {group.questions.map((faq, qi) => {
                                    const key = `${gi}-${qi}`
                                    return (
                                        <div key={qi} className="bg-card border border-border rounded-2xl overflow-hidden hover:border-[var(--orange)]/50 transition-colors">
                                            <button
                                                onClick={() => setOpenItem(openItem === key ? null : key)}
                                                className="w-full flex items-start justify-between gap-4 p-6 text-left"
                                            >
                                                <div className="flex items-start gap-3">
                                                    <span className="text-[var(--orange)] font-bold text-lg flex-shrink-0">Q</span>
                                                    <h3 className="font-semibold text-foreground leading-snug">{faq.q}</h3>
                                                </div>
                                                <span className={`text-muted-foreground text-lg flex-shrink-0 mt-0.5 transition-transform ${openItem === key ? 'rotate-180' : ''}`}>▾</span>
                                            </button>
                                            {openItem === key && (
                                                <div className="px-6 pb-6 border-t border-border pt-4">
                                                    <div className="flex gap-3">
                                                        <span className="text-[var(--blue)] font-bold text-lg flex-shrink-0">A</span>
                                                        <p className="text-muted-foreground leading-relaxed">{faq.a}</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                        </section>
                    ))}
                </div>
            )}

            {/* Still have questions */}
            <div className="bg-gradient-to-br from-slate-50 to-blue-50 border border-border rounded-3xl p-12 text-center">
                <div className="text-4xl mb-4">🙋</div>
                <h3 className="text-2xl font-bold text-foreground mb-3">Still Have Questions?</h3>
                <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
                    Can't find what you need? Our support team and the Help Center are just a click away.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link href="/contact" className="bg-gradient-to-r from-[var(--blue)] to-[var(--blue-darker)] text-white px-8 py-3 rounded-full font-bold hover:opacity-90 transition-all shadow-lg">
                        Contact Support
                    </Link>
                    <Link href="/help" className="border-2 border-[var(--blue)] text-[var(--blue)] px-8 py-3 rounded-full font-bold hover:bg-blue-50 transition-all">
                        Help Center
                    </Link>
                    <Link href="/signup" className="border-2 border-[var(--orange)] text-[var(--orange)] px-8 py-3 rounded-full font-bold hover:bg-orange-50 transition-all">
                        Start Free →
                    </Link>
                </div>
            </div>
        </StaticPageLayout>
    )
}
