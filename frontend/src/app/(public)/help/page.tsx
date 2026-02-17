import React from 'react'
import StaticPageLayout from '@/components/layout/StaticPageLayout'

const faqs = [
    {
        q: "How do I get started with PrepGenius AI?",
        a: "Simply sign up for a free account, select your target exam (JAMB, WAEC, etc.), and follow your personalized study plan."
    },
    {
        q: "Is the AI Tutor available 24/7?",
        a: "Yes! Our AI tutor is always online to answer your questions, explain complex concepts, and guide your study sessions."
    },
    {
        q: "Can I use PrepGenius for multiple exams?",
        a: "Absolutely. You can switch between different exam tracks or study for multiple exams simultaneously from your dashboard."
    },
    {
        q: "How does the subscription work?",
        a: "We offer monthly and annual plans. You can upgrade, downgrade, or cancel your subscription at any time from your account settings."
    },
    {
        q: "What payment methods do you accept?",
        a: "We accept all major debit cards, bank transfers, and mobile money through our secure payment partner, Paystack."
    }
]

export default function HelpPage() {
    return (
        <StaticPageLayout
            title="Help Center"
            subtitle="Find answers to common questions and learn how to make the most of PrepGenius."
        >
            <div className="mb-16">
                <div className="relative max-w-2xl mx-auto">
                    <input type="text" placeholder="Search for help articles..." className="w-full px-8 py-4 rounded-2xl border-2 border-slate-100 focus:border-[var(--orange)] focus:outline-none transition-all pr-16 text-lg" />
                    <span className="absolute right-6 top-1/2 -translate-y-1/2 text-2xl">🔍</span>
                </div>
            </div>

            <div className="grid md:grid-cols-3 gap-8 mb-16 text-center">
                <div className="p-8 bg-blue-50/50 rounded-3xl border border-blue-100">
                    <div className="text-4xl mb-4">🚀</div>
                    <h3 className="font-bold mb-2">Getting Started</h3>
                    <p className="text-sm text-slate-500">New to PrepGenius? Start here.</p>
                </div>
                <div className="p-8 bg-orange-50/50 rounded-3xl border border-orange-100">
                    <div className="text-4xl mb-4">💳</div>
                    <h3 className="font-bold mb-2">Billing & Plans</h3>
                    <p className="text-sm text-slate-500">Manage your subscription.</p>
                </div>
                <div className="p-8 bg-purple-50/50 rounded-3xl border border-purple-100">
                    <div className="text-4xl mb-4">⚙️</div>
                    <h3 className="font-bold mb-2">Account Settings</h3>
                    <p className="text-sm text-slate-500">General preferences & security.</p>
                </div>
            </div>

            <h2 className="text-3xl font-bold mb-8 text-center">Frequently Asked Questions</h2>
            <div className="space-y-4 max-w-3xl mx-auto">
                {faqs.map((faq, index) => (
                    <details key={index} className="group bg-white border rounded-2xl overflow-hidden [&_summary::-webkit-details-marker]:hidden">
                        <summary className="flex items-center justify-between p-6 cursor-pointer hover:bg-slate-50 transition-colors">
                            <h3 className="font-bold text-slate-800">{faq.q}</h3>
                            <span className="text-[var(--orange)] transition-transform group-open:rotate-180">▼</span>
                        </summary>
                        <div className="px-6 pb-6 text-slate-600 leading-relaxed border-t border-slate-50 pt-4">
                            {faq.a}
                        </div>
                    </details>
                ))}
            </div>

            <div className="mt-20 text-center bg-[var(--blue)] text-white p-12 rounded-3xl">
                <h3 className="text-2xl font-bold mb-4">Still need help?</h3>
                <p className="text-blue-100 mb-8">Our support team is just a message away.</p>
                <button className="bg-white text-[var(--blue)] px-8 py-3 rounded-full font-bold hover:bg-blue-50 transition-all">
                    Contact Support
                </button>
            </div>
        </StaticPageLayout>
    )
}
