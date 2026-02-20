import React from 'react'
import StaticPageLayout from '@/components/layout/StaticPageLayout'
import Link from 'next/link'

const lastUpdated = 'February 15, 2026'

const termsSections = [
    {
        id: 'acceptance',
        icon: '📜',
        title: '1. Acceptance of Terms',
        content: 'By accessing or using PrepGenius AI ("the Platform"), you agree to be bound by these Terms of Service ("Terms") and all applicable laws and regulations of the Federal Republic of Nigeria. If you do not agree with any part of these Terms, you must not use the Platform.',
    },
    {
        id: 'license',
        icon: '🔑',
        title: '2. License to Use',
        content: 'We grant you a personal, non-exclusive, non-transferable, revocable license to access and use the Platform strictly for your personal, non-commercial educational purposes, subject to these Terms. This license does not permit you to reproduce, distribute, or create derivative works of any Platform content.',
    },
    {
        id: 'eligibility',
        icon: '👤',
        title: '3. Eligibility & Account Registration',
        content: null,
        list: [
            'You must be at least 13 years old to register an account. Users under 18 require parental consent.',
            'You are responsible for maintaining the confidentiality of your login credentials.',
            'You must provide accurate, current, and complete information during registration.',
            'You may not create multiple accounts or share your account with others.',
        ]
    },
    {
        id: 'acceptable-use',
        icon: '⚠️',
        title: '4. Acceptable Use Policy',
        content: 'You agree NOT to:',
        list: [
            'Use the Platform for any unlawful, fraudulent, or harmful purpose',
            'Attempt to gain unauthorized access to any part of the Platform or other users\' accounts',
            'Share or distribute any Platform content including questions, explanations, or AI responses without written permission',
            'Use automated tools (bots, scrapers) to access or extract Platform content',
            'Engage in academic dishonesty or use the Platform to cheat in formal examinations',
            'Upload or share content that is offensive, defamatory, or infringes on third-party rights',
        ]
    },
    {
        id: 'subscriptions',
        icon: '💳',
        title: '5. Subscriptions & Payments',
        content: null,
        list: [
            'Paid plans are billed in advance on a recurring basis (weekly, monthly, quarterly, bi-annually, or annually).',
            'All payments are processed securely by Paystack. We do not store raw payment card data.',
            'You may cancel your subscription at any time from your account settings. Access continues until the end of the current billing period.',
            'Refunds are offered on annual plans within 30 days of purchase. No refunds are issued for partial subscription periods.',
            'We reserve the right to change pricing with 30 days\' advance notice to existing subscribers.',
        ]
    },
    {
        id: 'content',
        icon: '📚',
        title: '6. Content & Intellectual Property',
        content: 'All content on the Platform — including questions, study guides, AI responses, graphics, and code — is the intellectual property of PrepGenius AI or its licensors and is protected by Nigerian and international copyright law. Your user-generated content (e.g., notes, practice answers) remains yours; you grant us a license to use it to improve the Platform.',
    },
    {
        id: 'ai-disclaimer',
        icon: '🤖',
        title: '7. AI-Generated Content Disclaimer',
        content: 'PrepGenius AI uses artificial intelligence to generate study materials, explanations, and recommendations. While we strive for accuracy, AI-generated content may occasionally contain errors. Do not rely solely on AI responses for critical academic decisions. Always verify important information from your official course materials or teachers.',
    },
    {
        id: 'termination',
        icon: '🚫',
        title: '8. Account Termination',
        content: 'We reserve the right to suspend or permanently terminate your account, with or without notice, for violation of these Terms, fraudulent activity, non-payment, or actions that harm other users or the Platform. You may delete your account at any time from Account Settings.',
    },
    {
        id: 'liability',
        icon: '⚖️',
        title: '9. Limitation of Liability',
        content: 'To the maximum extent permitted by law, PrepGenius AI and its directors, employees, and partners shall not be liable for any indirect, incidental, special, or consequential damages arising from your use or inability to use the Platform. Our total liability shall not exceed the amount you paid us in the 90 days preceding the claim.',
    },
    {
        id: 'governing-law',
        icon: '🏛️',
        title: '10. Governing Law',
        content: 'These Terms shall be governed and construed in accordance with the laws of the Federal Republic of Nigeria. Any disputes shall be resolved in the courts of Lagos State, Nigeria, unless otherwise agreed in writing.',
    },
    {
        id: 'changes',
        icon: '🔄',
        title: '11. Changes to Terms',
        content: 'We may update these Terms from time to time. Material changes will be communicated via email or in-app notification at least 14 days before taking effect. Continued use after changes constitutes your acceptance.',
    },
    {
        id: 'contact-legal',
        icon: '📬',
        title: '12. Contact',
        content: 'For legal inquiries regarding these Terms, please contact us at legal@prepgenius.ai or write to our Lagos, Nigeria office. We aim to respond within 5 business days.',
    }
]

export default function TermsPage() {
    return (
        <StaticPageLayout
            title="Terms of Service"
            subtitle="Please read these Terms carefully before using PrepGenius AI. They govern your use of our platform and services."
        >
            {/* Meta info */}
            <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <div className="flex-1 bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-center gap-3">
                    <span className="text-xl">📅</span>
                    <div>
                        <p className="text-xs text-muted-foreground font-medium">Last Updated</p>
                        <p className="font-bold text-foreground text-sm">{lastUpdated}</p>
                    </div>
                </div>
                <div className="flex-1 bg-orange-50 border border-orange-100 rounded-xl p-4 flex items-center gap-3">
                    <span className="text-xl">⚖️</span>
                    <div>
                        <p className="text-xs text-muted-foreground font-medium">Governing Law</p>
                        <p className="font-bold text-foreground text-sm">Federal Republic of Nigeria</p>
                    </div>
                </div>
                <div className="flex-1 bg-green-50 border border-green-100 rounded-xl p-4 flex items-center gap-3">
                    <span className="text-xl">🌐</span>
                    <div>
                        <p className="text-xs text-muted-foreground font-medium">Applies To</p>
                        <p className="font-bold text-foreground text-sm">All Users Worldwide</p>
                    </div>
                </div>
            </div>

            {/* Quick Nav */}
            <div className="bg-card border border-border rounded-2xl p-6 mb-10">
                <p className="text-sm font-bold text-foreground mb-3 uppercase tracking-wider">Table of Contents</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {termsSections.map(sec => (
                        <a key={sec.id} href={`#${sec.id}`} className="text-sm text-muted-foreground hover:text-primary transition-colors hover:underline">
                            {sec.title}
                        </a>
                    ))}
                </div>
            </div>

            {/* Sections */}
            <div className="space-y-10">
                {termsSections.map(sec => (
                    <section key={sec.id} id={sec.id} className="scroll-mt-20 border-b border-border pb-10 last:border-b-0">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="text-xl">{sec.icon}</span>
                            <h2 className="text-xl font-bold text-foreground">{sec.title}</h2>
                        </div>
                        {sec.content && (
                            <p className="text-muted-foreground leading-relaxed mb-4">{sec.content}</p>
                        )}
                        {sec.list && (
                            <ul className="space-y-2 pl-2">
                                {sec.list.map((item, i) => (
                                    <li key={i} className="flex items-start gap-3 text-muted-foreground text-sm">
                                        <span className="text-primary mt-1 flex-shrink-0">•</span>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </section>
                ))}
            </div>

            {/* CTA */}
            <div className="mt-12 bg-slate-50 border border-border rounded-3xl p-8 text-center">
                <h3 className="text-xl font-bold text-foreground mb-2">Have Questions About These Terms?</h3>
                <p className="text-muted-foreground mb-6">Our team is happy to clarify any part of these Terms before you commit.</p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link href="/contact" className="inline-block bg-gradient-to-r from-[var(--blue)] to-[var(--blue-darker)] text-white px-8 py-3 rounded-full font-bold hover:opacity-90 transition-all">
                        Contact Legal Team
                    </Link>
                    <Link href="/privacy" className="inline-block border-2 border-[var(--blue)] text-[var(--blue)] px-8 py-3 rounded-full font-bold hover:bg-blue-50 transition-all">
                        Privacy Policy
                    </Link>
                </div>
            </div>
        </StaticPageLayout>
    )
}
