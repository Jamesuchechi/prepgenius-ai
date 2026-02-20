'use client'

import React, { useState } from 'react'
import StaticPageLayout from '@/components/layout/StaticPageLayout'
import type { Article } from './fetchNews'

const categories = ['All', 'Technology', 'Education', 'AI & Education']

const sourceBadgeColors: Record<string, string> = {
    'BBC Technology': 'bg-red-100 text-red-700',
    'TechCrunch': 'bg-green-100 text-green-700',
    'The Verge': 'bg-purple-100 text-purple-700',
    'Google News': 'bg-blue-100 text-blue-700',
}

const categoryGradients: Record<string, string> = {
    'Technology': 'from-blue-600 to-indigo-700',
    'Education': 'from-green-500 to-emerald-700',
    'AI & Education': 'from-purple-600 to-violet-700',
    'Study Tips': 'from-orange-500 to-orange-700',
}

const ownPosts = [
    { title: '10 Proven Strategies to Score 300+ in JAMB 2026', category: 'Study Tips', date: 'Feb 15, 2026', readTime: '7 min read', excerpt: "Top scorers don't just study harder — they study smarter. Learn the CBT strategies that have helped thousands achieve 300+.", emoji: '📚', link: '#' },
    { title: 'Best Subject Combinations for Medicine at UNILAG', category: 'Study Tips', date: 'Jan 28, 2026', readTime: '4 min read', excerpt: "Dreaming of becoming a doctor? Here's the exact subject combination and cut-off marks for Medical & Surgery at top Nigerian universities.", emoji: '⚕️', link: '#' },
    { title: 'How to Create a Killer Study Plan in 30 Minutes', category: 'Study Tips', date: 'Jan 15, 2026', readTime: '3 min read', excerpt: 'A good study plan is the difference between panic-revising and walking into the exam confident.', emoji: '📅', link: '#' },
]

function timeAgo(dateStr: string): string {
    const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
    if (diff < 60) return 'Just now'
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
    return `${Math.floor(diff / 86400)}d ago`
}

interface BlogClientProps {
    initialArticles: Article[]
    fetchedAt: string
}

export default function BlogClient({ initialArticles, fetchedAt }: BlogClientProps) {
    const [activeCategory, setActiveCategory] = useState('All')
    const [email, setEmail] = useState('')
    const [subscribed, setSubscribed] = useState(false)

    const filtered = activeCategory === 'All'
        ? initialArticles
        : initialArticles.filter(a => a.category === activeCategory)

    const featured = filtered[0] || null
    const rest = filtered.slice(1)
    const hasArticles = initialArticles.length > 0

    return (
        <StaticPageLayout
            title="PrepGenius Blog"
            subtitle="Real-time tech and education news, plus expert insights from our team — refreshed every 8 hours."
        >
            {/* Live feed badge */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-3 flex-wrap">
                    {hasArticles ? (
                        <span className="flex items-center gap-2 bg-green-50 text-green-700 border border-green-200 text-sm font-bold px-4 py-2 rounded-full">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            Live Feed — Updates Every 8 Hours
                        </span>
                    ) : (
                        <span className="flex items-center gap-2 bg-yellow-50 text-yellow-700 border border-yellow-200 text-sm font-bold px-4 py-2 rounded-full">
                            ⚠️ Live feed temporarily unavailable
                        </span>
                    )}
                    {hasArticles && fetchedAt && (
                        <span className="text-xs text-muted-foreground">Updated {timeAgo(fetchedAt)}</span>
                    )}
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                    <span>Sources:</span>
                    {['BBC', 'TechCrunch', 'The Verge', 'Google News'].map(s => (
                        <span key={s} className="bg-muted px-2 py-1 rounded font-medium">{s}</span>
                    ))}
                </div>
            </div>

            {/* Category Filters */}
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

            {/* Live News Feed */}
            {hasArticles && filtered.length > 0 ? (
                <>
                    {/* Featured Article */}
                    {featured && (
                        <a
                            href={featured.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`block bg-gradient-to-br ${categoryGradients[featured.category] || 'from-slate-700 to-slate-900'} rounded-3xl p-10 mb-10 text-white shadow-2xl relative overflow-hidden hover:opacity-95 transition-opacity group`}
                        >
                            <div className="absolute top-6 right-8 text-8xl opacity-10 group-hover:opacity-20 transition-opacity">{featured.emoji}</div>
                            <div className="relative z-10">
                                <div className="flex items-center gap-3 mb-4 flex-wrap">
                                    <span className="bg-white/20 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-full">⭐ Top Story</span>
                                    <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${sourceBadgeColors[featured.source] || 'bg-white/20 text-white'}`}>{featured.source}</span>
                                    <span className="text-white/60 text-xs">{featured.category}</span>
                                </div>
                                <h2 className="text-2xl md:text-3xl font-extrabold mb-4 max-w-2xl leading-tight">{featured.title}</h2>
                                {featured.description && (
                                    <p className="text-white/80 mb-6 max-w-2xl leading-relaxed line-clamp-3">{featured.description}</p>
                                )}
                                <div className="flex items-center gap-6">
                                    <span className="bg-white text-gray-900 px-6 py-2.5 rounded-full font-bold text-sm">Read Article →</span>
                                    <span className="text-white/60 text-sm">{timeAgo(featured.pubDate)} · {featured.readTime}</span>
                                </div>
                            </div>
                        </a>
                    )}

                    {/* Article Grid */}
                    {rest.length > 0 && (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                            {rest.map((article, i) => (
                                <a
                                    key={i}
                                    href={article.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="bg-card border border-border rounded-3xl overflow-hidden hover:shadow-xl transition-all group flex flex-col"
                                >
                                    {article.image ? (
                                        <div className="h-44 overflow-hidden bg-muted">
                                            <img src={article.image} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                        </div>
                                    ) : (
                                        <div className={`bg-gradient-to-br ${categoryGradients[article.category] || 'from-slate-500 to-slate-700'} h-44 flex items-center justify-center text-5xl`}>
                                            <span className="group-hover:scale-110 transition-transform duration-300">{article.emoji}</span>
                                        </div>
                                    )}
                                    <div className="p-5 flex-1 flex flex-col">
                                        <div className="flex flex-wrap gap-2 items-center mb-3">
                                            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${sourceBadgeColors[article.source] || 'bg-muted text-muted-foreground'}`}>{article.source}</span>
                                            <span className="text-xs text-muted-foreground">{article.category}</span>
                                        </div>
                                        <h3 className="font-bold text-foreground mb-2 leading-snug group-hover:text-[var(--blue)] transition-colors line-clamp-3 flex-1">{article.title}</h3>
                                        {article.description && (
                                            <p className="text-muted-foreground text-sm leading-relaxed mb-3 line-clamp-2">{article.description}</p>
                                        )}
                                        <div className="flex items-center justify-between pt-3 border-t border-border mt-auto">
                                            <span className="text-xs text-muted-foreground">{timeAgo(article.pubDate)}</span>
                                            <span className="text-xs text-[var(--blue)] font-bold">{article.readTime} →</span>
                                        </div>
                                    </div>
                                </a>
                            ))}
                        </div>
                    )}
                    <p className="text-center text-xs text-muted-foreground mb-16">Showing {filtered.length} live articles · Auto-refreshes every 8 hours</p>
                </>
            ) : hasArticles && filtered.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground mb-12">
                    <div className="text-4xl mb-3">🔍</div>
                    <p>No live articles in this category right now.</p>
                    <button onClick={() => setActiveCategory('All')} className="mt-3 text-primary hover:underline text-sm">View all articles</button>
                </div>
            ) : (
                <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-8 text-center mb-12">
                    <div className="text-4xl mb-3">📡</div>
                    <p className="font-bold text-foreground mb-1">Live news unavailable right now</p>
                    <p className="text-muted-foreground text-sm">RSS feeds may be temporarily down. Check our authored articles below.</p>
                </div>
            )}

            {/* Divider */}
            <div className="flex items-center gap-4 mb-12">
                <div className="flex-1 h-px bg-border" />
                <span className="text-sm font-bold text-muted-foreground uppercase tracking-wider px-4">✍️ From Our Team</span>
                <div className="flex-1 h-px bg-border" />
            </div>

            {/* PrepGenius Own Posts */}
            <div className="grid md:grid-cols-3 gap-6 mb-16">
                {ownPosts.map((post, i) => (
                    <article key={i} className="bg-card border border-border rounded-3xl overflow-hidden hover:shadow-xl transition-all group flex flex-col">
                        <div className={`bg-gradient-to-br ${categoryGradients[post.category] || 'from-orange-500 to-orange-700'} h-36 flex items-center justify-center text-5xl`}>
                            <span className="group-hover:scale-110 transition-transform duration-300">{post.emoji}</span>
                        </div>
                        <div className="p-6 flex-1 flex flex-col">
                            <div className="flex items-center gap-2 mb-3">
                                <span className="text-xs font-bold bg-orange-50 text-[var(--orange)] px-3 py-1 rounded-full">{post.category}</span>
                                <span className="text-xs text-muted-foreground">{post.readTime}</span>
                            </div>
                            <h3 className="font-bold text-foreground mb-3 leading-snug group-hover:text-[var(--blue)] transition-colors flex-1">{post.title}</h3>
                            <p className="text-muted-foreground text-sm mb-4 leading-relaxed line-clamp-2">{post.excerpt}</p>
                            <div className="flex items-center justify-between pt-3 border-t border-border">
                                <span className="text-xs text-muted-foreground">{post.date} · PrepGenius AI</span>
                                <button className="text-[var(--blue)] font-bold text-xs hover:underline">Read →</button>
                            </div>
                        </div>
                    </article>
                ))}
            </div>

            {/* Newsletter */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-12 text-center text-white">
                <div className="text-4xl mb-4">📬</div>
                <h3 className="text-3xl font-bold mb-3">Stay Ahead of the Curve</h3>
                <p className="text-slate-400 mb-8 max-w-lg mx-auto">Weekly study tips and top education articles. Join 12,000+ students.</p>
                {subscribed ? (
                    <p className="text-green-400 font-bold text-lg">🎉 You're subscribed!</p>
                ) : (
                    <form onSubmit={e => { e.preventDefault(); setSubscribed(true) }} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                        <input required type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" className="flex-1 px-6 py-3 rounded-full bg-white/10 border border-white/20 text-white placeholder-slate-500 focus:outline-none focus:border-white/40" />
                        <button type="submit" className="bg-[var(--orange)] hover:bg-[var(--orange-light)] text-white px-8 py-3 rounded-full font-bold transition-colors shadow-lg flex-shrink-0">Subscribe</button>
                    </form>
                )}
            </div>
        </StaticPageLayout>
    )
}
