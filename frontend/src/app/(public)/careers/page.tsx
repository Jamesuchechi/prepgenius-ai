'use client'

import React, { useState } from 'react'
import StaticPageLayout from '@/components/layout/StaticPageLayout'

const perks = [
    { icon: '🚀', title: 'Massive Impact', desc: 'Directly shape the academic futures of millions of students across Nigeria and West Africa.', bg: 'bg-blue-50', border: 'border-blue-100' },
    { icon: '🤖', title: 'Cutting-Edge AI', desc: 'Work with LLMs, RAG pipelines, and adaptive learning systems solving genuine education challenges.', bg: 'bg-purple-50', border: 'border-purple-100' },
    { icon: '🌍', title: 'Fully Remote', desc: 'Talent over location. Work from anywhere with a team that values results and flexibility.', bg: 'bg-green-50', border: 'border-green-100' },
    { icon: '📈', title: 'Real Growth', desc: 'Mentorship, learning budgets, and fast career progression in a hyper-growth company.', bg: 'bg-orange-50', border: 'border-orange-100' },
    { icon: '🎁', title: 'Great Benefits', desc: 'Competitive salary, health benefits, equity options, and an annual learning & development budget.', bg: 'bg-red-50', border: 'border-red-100' },
    { icon: '🤝', title: 'Inclusive Culture', desc: 'We celebrate diversity in background, experience, and perspective. Everyone\'s voice matters here.', bg: 'bg-yellow-50', border: 'border-yellow-100' },
]

const openings = [
    { title: 'Senior AI / ML Engineer', dept: 'Engineering', type: 'Full-time · Remote', tags: ['Python', 'LLMs', 'RAG', 'FastAPI'], new: true },
    { title: 'Full-Stack Developer (Next.js + Django)', dept: 'Engineering', type: 'Full-time · Remote', tags: ['Next.js', 'TypeScript', 'Django', 'PostgreSQL'], new: true },
    { title: 'Head of Content & Curriculum', dept: 'Education', type: 'Full-time · Lagos / Remote', tags: ['JAMB', 'WAEC', 'Curriculum Design'], new: false },
    { title: 'Growth & Partnerships Manager', dept: 'Business', type: 'Full-time · Lagos', tags: ['EdTech', 'Sales', 'B2B', 'Partnerships'], new: false },
    { title: 'UI/UX Designer', dept: 'Design', type: 'Contract · Remote', tags: ['Figma', 'User Research', 'Design Systems'], new: false },
    { title: 'Customer Success Specialist', dept: 'Support', type: 'Full-time · Lagos / Remote', tags: ['SaaS', 'Support', 'Retention'], new: false },
]

const deptColors: Record<string, string> = {
    Engineering: 'bg-blue-100 text-blue-700',
    Education: 'bg-green-100 text-green-700',
    Business: 'bg-orange-100 text-orange-700',
    Design: 'bg-purple-100 text-purple-700',
    Support: 'bg-pink-100 text-pink-700',
}

export default function CareersPage() {
    const [activeRole, setActiveRole] = useState<number | null>(null)

    return (
        <StaticPageLayout
            title="Work at PrepGenius AI"
            subtitle="Help us democratize education and build AI tools that change real lives. We're growing fast and hiring across the board."
        >
            {/* Mission Statement */}
            <section className="mb-16 text-center max-w-3xl mx-auto">
                <div className="inline-flex items-center gap-2 bg-orange-50 text-orange-600 text-sm font-bold px-4 py-2 rounded-full mb-6 border border-orange-100">
                    <span>🔥</span> We're Hiring
                </div>
                <p className="text-xl text-muted-foreground leading-relaxed">
                    At PrepGenius AI, we're not just building software — we're reshaping the academic future of an entire generation. If you're driven by impact, fueled by innovation, and want your work to genuinely matter, you'll fit right in.
                </p>
            </section>

            {/* Stats row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
                {[
                    { val: '30+', label: 'Team Members' },
                    { val: '100%', label: 'Remote Friendly' },
                    { val: '6', label: 'Open Roles' },
                    { val: '🌍', label: 'Pan-Nigerian Team' },
                ].map((s, i) => (
                    <div key={i} className="bg-card border border-border rounded-2xl p-6 text-center hover:shadow-md transition-shadow">
                        <div className="text-3xl font-extrabold text-foreground mb-1">{s.val}</div>
                        <div className="text-sm text-muted-foreground font-medium">{s.label}</div>
                    </div>
                ))}
            </div>

            {/* Perks */}
            <section className="mb-16">
                <h2 className="text-3xl font-bold mb-10 text-center">Why You'll Love Working Here</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {perks.map((perk, i) => (
                        <div key={i} className={`${perk.bg} ${perk.border} border rounded-2xl p-7 hover:shadow-lg transition-all group`}>
                            <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">{perk.icon}</div>
                            <h3 className="text-lg font-bold text-foreground mb-2">{perk.title}</h3>
                            <p className="text-muted-foreground text-sm leading-relaxed">{perk.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Open Positions */}
            <section className="mb-16">
                <h2 className="text-3xl font-bold mb-4">Open Positions</h2>
                <p className="text-muted-foreground mb-10">All roles include competitive pay, equity, and remote-flexible working arrangements.</p>
                <div className="space-y-4">
                    {openings.map((role, i) => (
                        <div
                            key={i}
                            onClick={() => setActiveRole(activeRole === i ? null : i)}
                            className="bg-card border border-border rounded-2xl p-6 hover:border-[var(--orange)] hover:shadow-md transition-all cursor-pointer group"
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center flex-wrap gap-2 mb-2">
                                        <h3 className="text-lg font-bold text-foreground group-hover:text-[var(--orange)] transition-colors">
                                            {role.title}
                                        </h3>
                                        {role.new && (
                                            <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-0.5 rounded-full">NEW</span>
                                        )}
                                    </div>
                                    <div className="flex flex-wrap gap-2 items-center mb-3">
                                        <span className={`text-xs font-bold px-3 py-1 rounded-full ${deptColors[role.dept] || 'bg-slate-100 text-slate-700'}`}>
                                            {role.dept}
                                        </span>
                                        <span className="text-xs text-muted-foreground">{role.type}</span>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {role.tags.map(tag => (
                                            <span key={tag} className="text-xs bg-muted text-muted-foreground px-2.5 py-1 rounded-lg font-medium">{tag}</span>
                                        ))}
                                    </div>
                                </div>
                                <span className={`text-muted-foreground text-xl transition-transform ${activeRole === i ? 'rotate-180' : ''}`}>▼</span>
                            </div>
                            {activeRole === i && (
                                <div className="mt-6 pt-6 border-t border-border">
                                    <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                                        We're looking for a talented {role.title.toLowerCase()} to join our growing team. You'll work closely with our engineering and education teams to build and scale our AI-powered platform for millions of Nigerian students.
                                    </p>
                                    <button className="bg-gradient-to-r from-[var(--blue)] to-[var(--blue-darker)] text-white px-8 py-3 rounded-full font-bold text-sm hover:opacity-90 transition-all shadow-md">
                                        Apply for This Role →
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </section>

            {/* Open Application */}
            <section className="bg-gradient-to-br from-[var(--blue)] to-[var(--blue-darker)] text-white p-12 rounded-3xl text-center">
                <div className="text-5xl mb-4">💌</div>
                <h2 className="text-3xl font-bold mb-4">Don't See a Fit?</h2>
                <p className="text-gray-900 mb-8 max-w-lg mx-auto">
                    We're always on the lookout for exceptional talent. Send us your CV and tell us how you'd contribute to our mission.
                </p>
                <a
                    href="mailto:careers@prepgenius.ai"
                    className="inline-block bg-[var(--orange)] hover:bg-[var(--orange-light)] text-white px-10 py-4 rounded-full font-bold text-lg transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1"
                >
                    Send Open Application
                </a>
            </section>
        </StaticPageLayout>
    )
}
