'use client'

import React, { useEffect, useRef } from 'react'
import StaticPageLayout from '@/components/layout/StaticPageLayout'
import Link from 'next/link'

const values = [
    {
        icon: '🎯',
        color: 'from-blue-500 to-blue-600',
        bg: 'bg-blue-50',
        title: 'Student-First Design',
        description: 'Every feature is built with Nigerian students in mind — from JAMB prep to Post-UTME coaching.'
    },
    {
        icon: '🤝',
        color: 'from-orange-500 to-orange-600',
        bg: 'bg-orange-50',
        title: 'Academic Integrity',
        description: 'We promote real learning, not shortcuts. Our AI teaches you how to think, not just what to memorize.'
    },
    {
        icon: '⚡',
        color: 'from-purple-500 to-purple-600',
        bg: 'bg-purple-50',
        title: 'Technological Innovation',
        description: 'We harness cutting-edge AI to make personalized education accessible and affordable for everyone.'
    },
    {
        icon: '🌍',
        color: 'from-green-500 to-green-600',
        bg: 'bg-green-50',
        title: 'Inclusivity',
        description: 'From Lagos to rural Borno — quality education should have no geographic or economic barriers.'
    }
]

const stats = [
    { value: '50,000+', label: 'Active Students', icon: '👩‍🎓' },
    { value: '36', label: 'States Covered', icon: '🗺️' },
    { value: '2M+', label: 'Questions Answered', icon: '✅' },
    { value: '95%', label: 'Satisfaction Rate', icon: '⭐' }
]

const team = [
    { name: 'James Uchechi', role: 'CEO & Founder', emoji: '👨‍💼', bg: 'bg-blue-100', detail: 'Software engineer turned Data Scientist with 3 years in EdTech.' },
    { name: 'NaN', role: 'Head of Education', emoji: '👩‍🏫', bg: 'bg-orange-100', detail: 'Ex-JAMB examiner and curriculum expert.' },
    { name: 'NaN', role: 'CTO', emoji: '👨‍💻', bg: 'bg-purple-100', detail: 'Full-stack architect with a passion for scalable AI systems.' },
]

const timeline = [
    { year: '2023', event: 'PrepGenius AI founded by James Uchechi with a mission to democratize education' },
    { year: 'Q1 2024', event: 'Beta launch with 1,000 students. 92% pass rate improvement reported' },
    { year: 'Q3 2024', event: 'AI Tutor launched — 24/7 support for all Nigerian exam formats' },
    { year: '2025', event: 'Expanded to 36 states. 50,000+ active learners on the platform' },
    { year: '2026', event: 'Institutional partnerships with 200+ schools across Nigeria' },
]

export default function AboutPage() {
    return (
        <StaticPageLayout
            title="Our Mission & Story"
            subtitle="We started with one question: why should where you're born determine the quality of your education?"
        >
            {/* Problem + Solution */}
            <section className="mb-20 grid md:grid-cols-2 gap-12 items-center">
                <div>
                    <div className="inline-flex items-center gap-2 bg-red-50 text-red-600 text-sm font-bold px-4 py-2 rounded-full mb-6">
                        <span>⚠️</span> The Problem
                    </div>
                    <h2 className="text-3xl font-bold mb-6 text-foreground">
                        A broken system leaving millions behind
                    </h2>
                    <p className="text-muted-foreground leading-relaxed mb-4">
                        Every year, over <strong>1.7 million students</strong> sit the JAMB UTME. Many fail — not because they're not intelligent, but because they lack access to quality tutoring. In Nigeria, great education is expensive and geographically limited.
                    </p>
                    <p className="text-muted-foreground leading-relaxed">
                        A student in Abuja has private tutors. A student in Kebbi has a crowded classroom. <strong>PrepGenius AI exists to end that divide.</strong>
                    </p>
                </div>
                <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-3xl p-8 text-white shadow-2xl">
                    <div className="text-5xl mb-4">🎓</div>
                    <blockquote className="text-xl font-semibold leading-relaxed mb-4">
                        "Every student deserves a world-class tutor in their pocket — regardless of their postcode."
                    </blockquote>
                    <p className="text-blue-200 text-sm">— PrepGenius AI Founding Team</p>
                </div>
            </section>

            {/* Stats */}
            <section className="mb-20 bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-12 text-white">
                <h2 className="text-3xl font-bold mb-2 text-center">Our Impact So Far</h2>
                <p className="text-slate-400 text-center mb-12">Real numbers that show real change</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    {stats.map((stat, i) => (
                        <div key={i} className="text-center">
                            <div className="text-4xl mb-3">{stat.icon}</div>
                            <div className="text-4xl font-extrabold text-white mb-1">{stat.value}</div>
                            <p className="text-slate-400 text-sm font-medium">{stat.label}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Timeline */}
            <section className="mb-20">
                <h2 className="text-3xl font-bold mb-12 text-center">Our Journey</h2>
                <div className="relative">
                    <div className="absolute left-6 top-0 bottom-0 w-px bg-border md:left-1/2" />
                    <div className="space-y-10">
                        {timeline.map((item, i) => (
                            <div key={i} className={`relative flex items-start gap-6 ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                                <div className="flex-1 hidden md:block" />
                                <div className="absolute left-4 md:left-1/2 md:-translate-x-1/2 w-5 h-5 rounded-full bg-primary border-4 border-background shadow-md mt-1 z-10" />
                                <div className="flex-1 ml-12 md:ml-0">
                                    <div className="bg-card border border-border rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                                        <span className="text-xs font-bold text-primary uppercase tracking-wider">{item.year}</span>
                                        <p className="text-foreground mt-1 leading-relaxed">{item.event}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Values */}
            <section className="mb-20">
                <h2 className="text-3xl font-bold mb-4 text-center">What We Stand For</h2>
                <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
                    Our values aren't wall decorations. They guide every product decision we make.
                </p>
                <div className="grid md:grid-cols-2 gap-6">
                    {values.map((v, i) => (
                        <div key={i} className={`${v.bg} rounded-2xl p-8 border border-border/50 hover:shadow-lg transition-all group`}>
                            <div className="text-4xl mb-4">{v.icon}</div>
                            <h3 className="text-xl font-bold mb-3 text-foreground">{v.title}</h3>
                            <p className="text-muted-foreground leading-relaxed">{v.description}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Team */}
            <section className="mb-20">
                <h2 className="text-3xl font-bold mb-4 text-center">The People Behind PrepGenius</h2>
                <p className="text-muted-foreground text-center mb-12">Educators, engineers, and dreamers united by one mission.</p>
                <div className="grid md:grid-cols-3 gap-8">
                    {team.map((member, i) => (
                        <div key={i} className="bg-card border border-border rounded-3xl p-8 text-center hover:shadow-xl transition-all group">
                            <div className={`${member.bg} w-24 h-24 rounded-full flex items-center justify-center text-5xl mx-auto mb-6 group-hover:scale-110 transition-transform`}>
                                {member.emoji}
                            </div>
                            <h3 className="text-xl font-bold text-foreground mb-1">{member.name}</h3>
                            <p className="text-primary font-semibold text-sm mb-4">{member.role}</p>
                            <p className="text-muted-foreground text-sm leading-relaxed">{member.detail}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Vision/Mission grid */}
            <section className="mb-20 grid md:grid-cols-2 gap-8">
                <div className="bg-gradient-to-br from-[var(--blue)] to-[var(--blue-darker)] text-white rounded-3xl p-10">
                    <div className="text-4xl mb-4">🔭</div>
                    <h3 className="text-2xl font-bold mb-4">Our Vision</h3>
                    <p className="text-blue-100 leading-relaxed">
                        To be the #1 AI-powered learning companion for students across West Africa, fostering a generation of confident, capable, and ambitious graduates.
                    </p>
                </div>
                <div className="bg-gradient-to-br from-[var(--orange)] to-[var(--orange-light)] text-white rounded-3xl p-10">
                    <div className="text-4xl mb-4">🚀</div>
                    <h3 className="text-2xl font-bold mb-4">Our Mission</h3>
                    <p className="text-orange-100 leading-relaxed">
                        To democratize high-quality exam preparation by leveraging AI to deliver personalized, affordable, and effective education to every student with a smartphone.
                    </p>
                </div>
            </section>

            {/* CTA */}
            <div className="text-center py-16 bg-gradient-to-br from-slate-50 to-blue-50 rounded-3xl border border-border">
                <div className="text-5xl mb-6">🎉</div>
                <h2 className="text-3xl font-bold mb-4 text-foreground">Join Our Growing Community</h2>
                <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
                    Over 50,000 students are already on their path to exam success. Your story starts here.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link href="/signup" className="bg-gradient-to-r from-[var(--blue)] to-[var(--blue-darker)] text-white px-10 py-4 rounded-full font-bold hover:opacity-90 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1">
                        Create Free Account
                    </Link>
                    <Link href="/contact" className="bg-white text-[var(--blue)] border-2 border-[var(--blue)] px-10 py-4 rounded-full font-bold hover:bg-blue-50 transition-all">
                        Get in Touch
                    </Link>
                </div>
            </div>
        </StaticPageLayout>
    )
}
