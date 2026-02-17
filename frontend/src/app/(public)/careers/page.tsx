import React from 'react'
import StaticPageLayout from '@/components/layout/StaticPageLayout'

export default function CareersPage() {
    return (
        <StaticPageLayout
            title="Careers at PrepGenius"
            subtitle="Help us redefine education for millions of Nigerian students."
        >
            <section className="mb-12 text-center">
                <h2 className="text-3xl font-bold mb-6">Join Our Mission</h2>
                <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
                    At PrepGenius AI, we're building the future of learning. We're looking for passionate individuals who want to make a real impact on the academic journey of students across Nigeria.
                </p>
            </section>

            <section className="mb-12">
                <h2 className="text-2xl font-bold mb-8">Why Work With Us?</h2>
                <div className="grid md:grid-cols-2 gap-8">
                    <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
                        <h3 className="text-xl font-bold mb-2">🚀 Massive Impact</h3>
                        <p>Directly influence the success of millions of students preparing for life-changing exams.</p>
                    </div>
                    <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
                        <h3 className="text-xl font-bold mb-2">🤖 Cutting-edge Tech</h3>
                        <p>Work with the latest AI and machine learning technologies to solve real educational challenges.</p>
                    </div>
                    <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
                        <h3 className="text-xl font-bold mb-2">🌎 Remote-First</h3>
                        <p>We value talent over location. Work from anywhere with a team that values flexibility.</p>
                    </div>
                    <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
                        <h3 className="text-xl font-bold mb-2">📈 Growth Focus</h3>
                        <p>We invest in our people's growth through mentorship, learning resources, and career advancement.</p>
                    </div>
                </div>
            </section>

            <section className="mb-12">
                <h2 className="text-2xl font-bold mb-8 text-center">Open Positions</h2>
                <div className="bg-white border rounded-2xl overflow-hidden">
                    <div className="p-8 border-b hover:bg-slate-50 transition-colors cursor-pointer group">
                        <div className="flex justify-between items-center">
                            <div>
                                <h3 className="text-xl font-bold group-hover:text-[var(--orange)] transition-colors">Senior AI Engineer</h3>
                                <p className="text-slate-500">Engineering • Remote</p>
                            </div>
                            <span className="text-slate-400">→</span>
                        </div>
                    </div>
                    <div className="p-8 border-b hover:bg-slate-50 transition-colors cursor-pointer group">
                        <div className="flex justify-between items-center">
                            <div>
                                <h3 className="text-xl font-bold group-hover:text-[var(--orange)] transition-colors">Content Strategy Lead</h3>
                                <p className="text-slate-500">Education • Remote</p>
                            </div>
                            <span className="text-slate-400">→</span>
                        </div>
                    </div>
                    <div className="p-8 hover:bg-slate-50 transition-colors cursor-pointer group">
                        <div className="flex justify-between items-center">
                            <div>
                                <h3 className="text-xl font-bold group-hover:text-[var(--orange)] transition-colors">Full-stack Developer</h3>
                                <p className="text-slate-500">Engineering • Remote</p>
                            </div>
                            <span className="text-slate-400">→</span>
                        </div>
                    </div>
                </div>
            </section>

            <section className="bg-[var(--blue)] text-white p-12 rounded-3xl text-center">
                <h2 className="text-3xl font-bold mb-4">Don't see a fit?</h2>
                <p className="text-blue-100 mb-8">We're always looking for talented people. Send us your CV and we'll reach out when a suitable role opens up.</p>
                <button className="bg-[var(--orange)] hover:bg-[var(--orange-light)] text-white px-8 py-3 rounded-full font-bold transition-all">
                    Generic Application
                </button>
            </section>
        </StaticPageLayout>
    )
}
