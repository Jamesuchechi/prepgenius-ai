import React from 'react'
import StaticPageLayout from '@/components/layout/StaticPageLayout'

const blogPosts = [
    {
        title: "10 Tips to Ace Your JAMB Exam in 2026",
        category: "Study Tips",
        date: "Feb 15, 2026",
        excerpt: "Preparation is key. Learn the proven strategies used by top scorers to master the JAMB CBT format.",
        image: "📚"
    },
    {
        title: "How AI is Revolutionizing Education in Nigeria",
        category: "Technology",
        date: "Feb 10, 2026",
        excerpt: "The landscape of learning is changing. Discover how PrepGenius is making high-quality tutoring accessible.",
        image: "🤖"
    },
    {
        title: "Managing Exam Stress: A Guide for Students",
        category: "Wellness",
        date: "Feb 5, 2026",
        excerpt: "Stay calm and focused. Our experts share techniques to handle the pressure during peak study periods.",
        image: "🧘"
    },
    {
        title: "The Best Subject Combinations for Engineering",
        category: "Career Advice",
        date: "Jan 28, 2026",
        excerpt: "Choosing the right subjects updated for current university requirements in Nigeria.",
        image: "⚙️"
    }
]

export default function BlogPage() {
    return (
        <StaticPageLayout
            title="PrepGenius Blog"
            subtitle="Latest news, study tips, and insights from the education frontier."
        >
            <div className="grid md:grid-cols-2 gap-8">
                {blogPosts.map((post, index) => (
                    <div key={index} className="bg-white border rounded-3xl overflow-hidden hover:shadow-xl transition-all group flex flex-col h-full">
                        <div className="h-48 bg-slate-100 flex items-center justify-center text-6xl">
                            {post.image}
                        </div>
                        <div className="p-8 flex-1 flex flex-col">
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-xs font-bold uppercase tracking-wider text-[var(--orange)] bg-[rgba(255,107,53,0.1)] px-3 py-1 rounded-full">
                                    {post.category}
                                </span>
                                <span className="text-xs text-slate-400 font-medium">{post.date}</span>
                            </div>
                            <h3 className="text-xl font-bold mb-4 group-hover:text-[var(--blue)] transition-colors">
                                {post.title}
                            </h3>
                            <p className="text-slate-600 mb-6 text-sm leading-relaxed">
                                {post.excerpt}
                            </p>
                            <div className="mt-auto">
                                <button className="text-[var(--blue)] font-bold text-sm hover:underline">
                                    Read More →
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-16 bg-slate-50 p-12 rounded-3xl text-center border border-dashed border-slate-300">
                <h3 className="text-xl font-bold mb-2">Subscribe to our Newsletter</h3>
                <p className="text-slate-500 mb-8 lowercase uppercase first-letter:capitalize">Stay updated with the latest study resources and platform features.</p>
                <div className="max-w-md mx-auto flex gap-4">
                    <input type="email" placeholder="email@address.com" className="flex-1 px-6 py-3 rounded-full border border-slate-200 focus:outline-none focus:border-[var(--orange)]" />
                    <button className="bg-[var(--blue)] text-white px-8 py-3 rounded-full font-bold hover:bg-[var(--blue-darker)] transition-all">
                        Join
                    </button>
                </div>
            </div>
        </StaticPageLayout>
    )
}
