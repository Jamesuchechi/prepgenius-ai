import React from 'react'
import StaticPageLayout from '@/components/layout/StaticPageLayout'
import { Button } from '@/components/ui/Button'

export default function ContactPage() {
    return (
        <StaticPageLayout
            title="Contact Us"
            subtitle="We're here to help. Reach out to us with any questions or feedback."
        >
            <div className="grid md:grid-cols-2 gap-12 items-start">
                <div className="space-y-8">
                    <div>
                        <h2 className="text-2xl font-bold mb-4">Get in Touch</h2>
                        <p className="text-slate-600 mb-6">
                            Whether you're a student needing help, a teacher looking for school solutions, or just want to say hi, we'd love to hear from you.
                        </p>
                    </div>

                    <div className="space-y-6">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-[rgba(255,107,53,0.1)] rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                                📍
                            </div>
                            <div>
                                <h3 className="font-bold">Our Office</h3>
                                <p className="text-slate-600">Lagos, Nigeria</p>
                                <p className="text-slate-500 text-sm">Tech Hub, Victoria Island</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                                ✉️
                            </div>
                            <div>
                                <h3 className="font-bold">Email Us</h3>
                                <p className="text-slate-600">hello@prepgenius.ai</p>
                                <p className="text-slate-500 text-sm">Support: support@prepgenius.ai</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                                💬
                            </div>
                            <div>
                                <h3 className="font-bold">Chat with Us</h3>
                                <p className="text-slate-600">Available 24/7 via AI Tutor</p>
                                <p className="text-slate-500 text-sm">Real human response in 2-4 hours</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-8 rounded-3xl border shadow-xl shadow-slate-200/50">
                    <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">First Name</label>
                                <input type="text" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-[var(--orange)] transition-colors" placeholder="John" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">Last Name</label>
                                <input type="text" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-[var(--orange)] transition-colors" placeholder="Doe" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">Email Address</label>
                            <input type="email" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-[var(--orange)] transition-colors" placeholder="john@example.com" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">Subject</label>
                            <select className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-[var(--orange)] transition-colors bg-white">
                                <option>General Inquiry</option>
                                <option>Technical Support</option>
                                <option>Billing Question</option>
                                <option>Business Partnership</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">Message</label>
                            <textarea className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-[var(--orange)] transition-colors h-32" placeholder="How can we help?"></textarea>
                        </div>
                        <Button variant="primary" className="w-full py-4 text-lg">Send Message</Button>
                    </form>
                </div>
            </div>
        </StaticPageLayout>
    )
}
