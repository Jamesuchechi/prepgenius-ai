'use client'

import React, { useState } from 'react'
import StaticPageLayout from '@/components/layout/StaticPageLayout'
import Link from 'next/link'

const helpCategories = [
    { icon: '🚀', title: 'Getting Started', desc: 'New to PrepGenius? Start here.', articles: 8, bg: 'bg-blue-50', border: 'border-blue-100', color: 'text-blue-700', link: '#getting-started' },
    { icon: '💳', title: 'Billing & Plans', desc: 'Subscriptions, payments, and upgrades.', articles: 6, bg: 'bg-orange-50', border: 'border-orange-100', color: 'text-orange-700', link: '#billing' },
    { icon: '⚙️', title: 'Account Settings', desc: 'Profile, security, and notifications.', articles: 5, bg: 'bg-purple-50', border: 'border-purple-100', color: 'text-purple-700', link: '#account' },
    { icon: '🤖', title: 'AI Tutor Help', desc: 'How to get the most from the AI.', articles: 7, bg: 'bg-green-50', border: 'border-green-100', color: 'text-green-700', link: '#ai-tutor' },
    { icon: '📝', title: 'Mock Exams', desc: 'Creating, taking, and reviewing exams.', articles: 9, bg: 'bg-red-50', border: 'border-red-100', color: 'text-red-700', link: '#mock-exams' },
    { icon: '📊', title: 'Analytics', desc: 'Reading your performance data.', articles: 4, bg: 'bg-teal-50', border: 'border-teal-100', color: 'text-teal-700', link: '#analytics' },
]

const faqs = [
    { q: 'How do I get started with PrepGenius AI?', a: 'Sign up for a free account, then select your target exam (JAMB, WAEC, NECO, etc.) during onboarding. You\'ll get a personalized study plan and immediate access to AI practice tools.', section: 'getting-started' },
    { q: 'Can I use PrepGenius AI without a subscription?', a: 'Yes! Our Free tier includes 10 questions per day, basic progress tracking, and limited AI interactions. Upgrade to a paid plan for unlimited access, mock exams, and full AI Tutor sessions.', section: 'billing' },
    { q: 'How do I cancel or change my subscription?', a: 'Go to Dashboard → Settings → Subscription. You can upgrade, downgrade, or cancel at any time. Access continues until the end of your current billing period — no immediate cutoff.', section: 'billing' },
    { q: 'Is the AI Tutor available 24/7?', a: 'Absolutely. The AI Tutor never sleeps. You can ask it questions any time, on any subject in the Nigerian curriculum. Human support is available Mon–Fri, 9am–6pm WAT.', section: 'ai-tutor' },
    { q: 'How do I create a Mock Exam?', a: 'Go to Dashboard → Mock Exams → "Create Exam". Choose your exam board (JAMB, WAEC, etc.), subject, number of questions, and duration. You can use past questions or AI-generated questions.', section: 'mock-exams' },
    { q: 'What payment methods do you accept?', a: 'We accept Visa, Mastercard, bank transfers, and mobile money (MTN, Airtel, Glo) — all processed securely by Paystack. We never store your card details.', section: 'billing' },
    { q: 'Can I study on my phone?', a: 'Yes! PrepGenius AI is fully mobile-responsive and works perfectly in any browser on Android or iPhone. A dedicated mobile app is coming soon.', section: 'getting-started' },
    { q: 'How do I reset my password?', a: 'On the login page, click "Forgot Password". Enter your email address and we\'ll send you a password reset link within 2 minutes. Check your spam folder if you don\'t see it.', section: 'account' },
    { q: 'What exams does PrepGenius AI cover?', a: 'We fully support JAMB UTME, WAEC SSCE, NECO, Post-UTME, NABTEB, IGCSE, SAT, IELTS, TOEFL, and GRE. We\'re constantly expanding our question database.', section: 'mock-exams' },
    { q: 'How is my performance data calculated?', a: 'Your analytics dashboard tracks accuracy rate, time per question, subject breakdown, streak days, and improvement trends over time. All data updates in real-time after each quiz or exam.', section: 'analytics' },
]

const popular = ['How to start', 'Cancel subscription', 'AI Tutor usage', 'Payment failed', 'Reset password', 'Download guide']

export default function HelpPage() {
    const [search, setSearch] = useState('')
    const [openFaq, setOpenFaq] = useState<number | null>(null)

    const filteredFaqs = faqs.filter(f =>
        !search || f.q.toLowerCase().includes(search.toLowerCase()) || f.a.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <StaticPageLayout
            title="Help Center"
            subtitle="Find answers quickly. Browse by category, search for a topic, or contact our support team."
        >
            {/* Search */}
            <div className="mb-4">
                <div className="relative">
                    <input
                        type="text"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search for help articles, questions, or features..."
                        className="w-full pl-14 pr-6 py-5 rounded-2xl border-2 border-border bg-background focus:border-primary focus:outline-none transition-colors text-lg shadow-sm"
                    />
                    <span className="absolute left-5 top-1/2 -translate-y-1/2 text-2xl">🔍</span>
                </div>
            </div>

            {/* Popular searches */}
            {!search && (
                <div className="flex flex-wrap gap-2 mb-12">
                    <span className="text-sm text-muted-foreground font-medium mr-1 self-center">Popular:</span>
                    {popular.map(p => (
                        <button
                            key={p}
                            onClick={() => setSearch(p)}
                            className="text-sm bg-muted text-muted-foreground px-4 py-1.5 rounded-full hover:bg-primary hover:text-white transition-all"
                        >
                            {p}
                        </button>
                    ))}
                </div>
            )}

            {/* Category Grid */}
            {!search && (
                <section className="mb-16">
                    <h2 className="text-2xl font-bold text-foreground mb-8">Browse by Category</h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {helpCategories.map((cat, i) => (
                            <a key={i} href={cat.link} className={`${cat.bg} ${cat.border} border rounded-2xl p-7 hover:shadow-lg transition-all group block`}>
                                <div className="flex items-start gap-4">
                                    <span className="text-4xl group-hover:scale-110 transition-transform">{cat.icon}</span>
                                    <div>
                                        <h3 className="font-bold text-foreground mb-1">{cat.title}</h3>
                                        <p className="text-muted-foreground text-sm mb-2">{cat.desc}</p>
                                        <span className={`text-xs font-bold ${cat.color}`}>{cat.articles} articles →</span>
                                    </div>
                                </div>
                            </a>
                        ))}
                    </div>
                </section>
            )}

            {/* FAQ */}
            <section className="mb-16">
                <h2 className="text-2xl font-bold text-foreground mb-8">
                    {search ? `Results for "${search}"` : 'Frequently Asked Questions'}
                </h2>
                {filteredFaqs.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                        <div className="text-4xl mb-3">🤷</div>
                        <p className="font-medium">No results found for "{search}"</p>
                        <button onClick={() => setSearch('')} className="mt-3 text-primary hover:underline text-sm">Clear search</button>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filteredFaqs.map((faq, i) => (
                            <div key={i} className="bg-card border border-border rounded-2xl overflow-hidden">
                                <button
                                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                                    className="w-full flex items-center justify-between gap-4 p-6 text-left hover:bg-muted/50 transition-colors"
                                >
                                    <h3 className="font-bold text-foreground">{faq.q}</h3>
                                    <span className={`text-muted-foreground text-lg flex-shrink-0 transition-transform ${openFaq === i ? 'rotate-180' : ''}`}>▾</span>
                                </button>
                                {openFaq === i && (
                                    <div className="px-6 pb-6 text-muted-foreground leading-relaxed border-t border-border pt-4">
                                        {faq.a}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* Still need help */}
            <div className="bg-gradient-to-br from-[var(--blue)] to-[var(--blue-darker)] rounded-3xl p-12 text-center text-white">
                <div className="text-4xl mb-4">💬</div>
                <h3 className="text-2xl font-bold mb-3">Still Need Help?</h3>
                <p className="text-blue-100 mb-8 max-w-lg mx-auto">
                    Our support team is available Monday–Friday, 9am–6pm WAT. We typically respond within 2 hours.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link href="/contact" className="bg-white text-[var(--blue)] px-8 py-3 rounded-full font-bold hover:bg-blue-50 transition-all shadow-lg">
                        Contact Support
                    </Link>
                    <Link href="/faq" className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-8 py-3 rounded-full font-bold transition-all">
                        Browse Full FAQ
                    </Link>
                </div>
            </div>
        </StaticPageLayout>
    )
}
