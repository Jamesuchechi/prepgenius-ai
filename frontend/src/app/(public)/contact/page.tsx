'use client'

import React, { useState } from 'react'
import StaticPageLayout from '@/components/layout/StaticPageLayout'
import { submitContactForm } from '@/lib/api'

const contactMethods = [
    {
        icon: '📍',
        bg: 'bg-orange-50',
        border: 'border-orange-100',
        iconBg: 'bg-orange-100',
        title: 'Our Office',
        lines: ['Tech Hub, Victoria Island', 'Lagos, Nigeria'],
        link: null,
    },
    {
        icon: '✉️',
        bg: 'bg-blue-50',
        border: 'border-blue-100',
        iconBg: 'bg-blue-100',
        title: 'Email Us',
        lines: ['hello@prepgenius.ai', 'support@prepgenius.ai'],
        link: 'mailto:hello@prepgenius.ai',
    },
    {
        icon: '💬',
        bg: 'bg-green-50',
        border: 'border-green-100',
        iconBg: 'bg-green-100',
        title: 'Live Chat',
        lines: ['24/7 AI support available', 'Human response in 2–4 hours'],
        link: null,
    },
    {
        icon: '📞',
        bg: 'bg-purple-50',
        border: 'border-purple-100',
        iconBg: 'bg-purple-100',
        title: 'Phone',
        lines: ['+234 (0) 803 000 0000', 'Mon-Fri, 9am – 6pm WAT'],
        link: 'tel:+2348030000000',
    },
]

const subjects = ['General Inquiry', 'Technical Support', 'Billing Question', 'Business Partnership', 'School/Institution Inquiry', 'Press & Media', 'Other']

export default function ContactPage() {
    const [formState, setFormState] = useState({
        firstName: '', lastName: '', email: '', subject: subjects[0], message: ''
    })
    const [submitted, setSubmitted] = useState(false)
    const [sending, setSending] = useState(false)

    const [error, setError] = useState<string | null>(null)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSending(true)
        setError(null)
        try {
            await submitContactForm(formState)
            setSubmitted(true)
        } catch (err: any) {
            setError(err.message || 'Something went wrong. Please try again.')
        } finally {
            setSending(false)
        }
    }

    return (
        <StaticPageLayout
            title="Get in Touch"
            subtitle="We'd love to hear from you. Whether it's a question, feedback, or a partnership idea — our team is ready."
        >
            {/* Contact Methods Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-16">
                {contactMethods.map((method, i) => (
                    <div key={i} className={`${method.bg} ${method.border} border rounded-2xl p-6 flex items-start gap-4 hover:shadow-md transition-all group`}>
                        <div className={`${method.iconBg} w-14 h-14 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 group-hover:scale-110 transition-transform`}>
                            {method.icon}
                        </div>
                        <div>
                            <h3 className="font-bold text-foreground mb-1">{method.title}</h3>
                            {method.lines.map((line, j) => (
                                <p key={j} className={`text-sm ${j === 0 ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                                    {method.link && j === 0 ? (
                                        <a href={method.link} className="hover:text-primary transition-colors">{line}</a>
                                    ) : line}
                                </p>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Contact Form */}
            <div className="grid md:grid-cols-5 gap-12 items-start">
                <div className="md:col-span-2">
                    <h2 className="text-2xl font-bold mb-4 text-foreground">Send Us a Message</h2>
                    <p className="text-muted-foreground leading-relaxed mb-6">
                        Fill out the form and we'll get back to you within one business day. For urgent issues, use our live chat.
                    </p>
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                            <span className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center font-bold text-xs flex-shrink-0">✓</span>
                            Response within 24 hours on business days
                        </div>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                            <span className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center font-bold text-xs flex-shrink-0">✓</span>
                            Dedicated support for institutional accounts
                        </div>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                            <span className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center font-bold text-xs flex-shrink-0">✓</span>
                            All messages are read by our team
                        </div>
                    </div>
                </div>

                <div className="md:col-span-3">
                    {submitted ? (
                        <div className="bg-green-50 border border-green-200 rounded-3xl p-12 text-center">
                            <div className="text-6xl mb-4">🎉</div>
                            <h3 className="text-2xl font-bold text-green-800 mb-3">Message Sent!</h3>
                            <p className="text-green-700 mb-6">Thank you for reaching out. We'll get back to you within one business day.</p>
                            <button
                                onClick={() => { setSubmitted(false); setFormState({ firstName: '', lastName: '', email: '', subject: subjects[0], message: '' }) }}
                                className="bg-green-600 text-white px-8 py-3 rounded-full font-bold hover:bg-green-700 transition-colors"
                            >
                                Send Another Message
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="bg-card border border-border rounded-3xl p-8 shadow-lg space-y-5">
                            {error && (
                                <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl text-sm mb-4">
                                    {error}
                                </div>
                            )}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-foreground mb-2">First Name</label>
                                    <input
                                        required
                                        type="text"
                                        value={formState.firstName}
                                        onChange={e => setFormState(p => ({ ...p, firstName: e.target.value }))}
                                        className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:border-primary transition-colors"
                                        placeholder="James"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-foreground mb-2">Last Name</label>
                                    <input
                                        required
                                        type="text"
                                        value={formState.lastName}
                                        onChange={e => setFormState(p => ({ ...p, lastName: e.target.value }))}
                                        className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:border-primary transition-colors"
                                        placeholder="Doe"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-foreground mb-2">Email Address</label>
                                <input
                                    required
                                    type="email"
                                    value={formState.email}
                                    onChange={e => setFormState(p => ({ ...p, email: e.target.value }))}
                                    className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:border-primary transition-colors"
                                    placeholder="james@example.com"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-foreground mb-2">Subject</label>
                                <select
                                    value={formState.subject}
                                    onChange={e => setFormState(p => ({ ...p, subject: e.target.value }))}
                                    className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:border-primary transition-colors"
                                >
                                    {subjects.map(s => <option key={s}>{s}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-foreground mb-2">Message</label>
                                <textarea
                                    required
                                    rows={5}
                                    value={formState.message}
                                    onChange={e => setFormState(p => ({ ...p, message: e.target.value }))}
                                    className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:border-primary transition-colors resize-none"
                                    placeholder="How can we help you?"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={sending}
                                className="w-full bg-gradient-to-r from-[var(--blue)] to-[var(--blue-darker)] text-white py-4 rounded-xl font-bold text-lg hover:opacity-90 transition-all disabled:opacity-50 shadow-lg"
                            >
                                {sending ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Sending...
                                    </span>
                                ) : 'Send Message ✉️'}
                            </button>
                        </form>
                    )}
                </div>
            </div>

            {/* FAQ teaser */}
            <div className="mt-16 bg-slate-50 border border-border rounded-3xl p-8 text-center">
                <h3 className="text-xl font-bold text-foreground mb-2">Looking for a quick answer?</h3>
                <p className="text-muted-foreground mb-6">Check our FAQ or Help Center before reaching out — you might find what you need instantly.</p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <a href="/faq" className="bg-[var(--blue)] text-white px-8 py-3 rounded-full font-bold hover:opacity-90 transition-all">
                        Browse FAQ
                    </a>
                    <a href="/help" className="bg-white text-[var(--blue)] border-2 border-[var(--blue)] px-8 py-3 rounded-full font-bold hover:bg-blue-50 transition-all">
                        Help Center
                    </a>
                </div>
            </div>
        </StaticPageLayout>
    )
}
