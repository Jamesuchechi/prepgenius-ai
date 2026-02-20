import React from 'react'
import StaticPageLayout from '@/components/layout/StaticPageLayout'
import Link from 'next/link'

const lastUpdated = 'February 15, 2026'

const sections = [
    {
        id: 'introduction',
        title: '1. Introduction',
        icon: '📖',
        content: [
            'This Privacy Policy describes how PrepGenius AI ("we", "our", or "us") collects, uses, processes, and protects your personal information when you access or use our platform, applications, and services.',
            'By using PrepGenius AI, you acknowledge that you have read and understood this Privacy Policy. If you do not agree with our practices, please do not use our services.',
        ]
    },
    {
        id: 'data-collected',
        title: '2. Information We Collect',
        icon: '📊',
        content: [
            'We collect information you provide directly, information automatically generated when you use our platform, and information from third parties where applicable.',
        ],
        list: [
            'Account information: name, email address, phone number, and password',
            'Profile data: exam targets (JAMB, WAEC, NECO), learning preferences, and academic goals',
            'Payment information: processed securely by Paystack — we never store raw card details',
            'Usage data: questions answered, time spent, scores, AI tutor conversations',
            'Device & technical data: IP address, browser type, device identifiers, and cookies',
        ]
    },
    {
        id: 'how-we-use',
        title: '3. How We Use Your Information',
        icon: '⚙️',
        list: [
            'Deliver and continuously improve our AI-powered study tools and mock exams',
            'Personalize your learning experience based on your strengths and weak areas',
            'Process payments and send billing-related communications',
            'Send study reminders, performance insights, and product updates (you can opt out)',
            'Ensure platform security and detect fraudulent activity',
            'Comply with legal obligations and enforce our Terms of Service',
        ]
    },
    {
        id: 'data-sharing',
        title: '4. Data Sharing & Third Parties',
        icon: '🤝',
        content: [
            'We do not sell your personal data. We may share your information with trusted third-party service providers who help us operate the platform:',
        ],
        list: [
            'Paystack — for secure payment processing (they have their own Privacy Policy)',
            'Google Cloud / OpenAI — for AI processing (data is used only to fulfill your request)',
            'Analytics providers — to understand platform usage in aggregate, anonymized form',
            'Legal authorities — only when required by Nigerian or international law',
        ]
    },
    {
        id: 'data-security',
        title: '5. Data Security',
        icon: '🔐',
        content: [
            'We take the security of your data seriously. Our security measures include:',
        ],
        list: [
            'End-to-end encryption for all data in transit (TLS 1.3)',
            'Encrypted storage for sensitive data at rest',
            'Regular security audits and penetration testing',
            'Strict access controls — only authorized staff can access personal data',
            'Automatic session expiry and multi-device logout',
        ]
    },
    {
        id: 'your-rights',
        title: '6. Your Rights',
        icon: '✊',
        content: [
            'You have the following rights regarding your personal data:',
        ],
        list: [
            'Access: Request a copy of the data we hold about you',
            'Correction: Update inaccurate or incomplete information from your account settings',
            'Deletion: Request deletion of your account and associated data',
            'Portability: Export your learning data in a structured format',
            'Opt-out: Unsubscribe from marketing communications at any time',
        ]
    },
    {
        id: 'cookies',
        title: '7. Cookies & Tracking',
        icon: '🍪',
        content: [
            'We use cookies and similar tracking technologies to maintain your session, remember your preferences, and understand how the platform is used. You can control cookie settings through your browser, but disabling certain cookies may affect platform functionality.',
        ]
    },
    {
        id: 'minors',
        title: '8. Children & Minors',
        icon: '👶',
        content: [
            'PrepGenius AI is designed for students of all ages. For users under 13, we require parental or guardian consent before account creation. Parents may contact us to review, modify, or delete their child\'s data.',
        ]
    },
    {
        id: 'changes',
        title: '9. Changes to This Policy',
        icon: '📝',
        content: [
            'We may update this Privacy Policy from time to time. We\'ll notify you of significant changes via email or a prominent notice on our platform. Your continued use after changes constitutes acceptance of the updated policy.',
        ]
    },
    {
        id: 'contact',
        title: '10. Contact Us',
        icon: '📬',
        content: [
            'For any privacy-related questions, requests, or concerns, please contact our Data Protection team:',
        ],
        list: [
            'Email: privacy@prepgenius.ai',
            'Response time: within 5 business days',
            'Address: PrepGenius AI, Victoria Island, Lagos, Nigeria',
        ]
    }
]

export default function PrivacyPage() {
    return (
        <StaticPageLayout
            title="Privacy Policy"
            subtitle="We're committed to transparency. Here's exactly how we collect, use, and protect your personal data."
        >
            {/* Last updated + quick nav */}
            <div className="flex flex-col md:flex-row gap-6 mb-12">
                <div className="flex-1 bg-blue-50 border border-blue-100 rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl">📅</span>
                        <span className="font-bold text-foreground">Last Updated</span>
                    </div>
                    <p className="text-muted-foreground text-sm">{lastUpdated}</p>
                </div>
                <div className="flex-1 bg-green-50 border border-green-100 rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl">🔒</span>
                        <span className="font-bold text-foreground">Data Promise</span>
                    </div>
                    <p className="text-muted-foreground text-sm">We never sell your data. Ever.</p>
                </div>
                <div className="flex-1 bg-orange-50 border border-orange-100 rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl">✅</span>
                        <span className="font-bold text-foreground">Your Rights</span>
                    </div>
                    <p className="text-muted-foreground text-sm">Access, correct, or delete your data anytime.</p>
                </div>
            </div>

            {/* Sections */}
            <div className="space-y-10">
                {sections.map((sec) => (
                    <section key={sec.id} id={sec.id} className="scroll-mt-20">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="text-2xl">{sec.icon}</span>
                            <h2 className="text-2xl font-bold text-foreground">{sec.title}</h2>
                        </div>
                        {sec.content?.map((p, i) => (
                            <p key={i} className="text-muted-foreground leading-relaxed mb-4">{p}</p>
                        ))}
                        {sec.list && (
                            <ul className="space-y-2 pl-2">
                                {sec.list.map((item, i) => (
                                    <li key={i} className="flex items-start gap-3 text-muted-foreground">
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
            <div className="mt-16 bg-slate-50 border border-border rounded-3xl p-8 text-center">
                <h3 className="text-xl font-bold text-foreground mb-2">Questions About Your Privacy?</h3>
                <p className="text-muted-foreground mb-6">Our team is here to help. We respond to all privacy inquiries within 5 business days.</p>
                <Link href="/contact" className="inline-block bg-gradient-to-r from-[var(--blue)] to-[var(--blue-darker)] text-white px-10 py-3 rounded-full font-bold hover:opacity-90 transition-all">
                    Contact Privacy Team
                </Link>
            </div>
        </StaticPageLayout>
    )
}
