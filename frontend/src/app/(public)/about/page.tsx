import React from 'react'
import StaticPageLayout from '@/components/layout/StaticPageLayout'

export default function AboutPage() {
    return (
        <StaticPageLayout
            title="Our Mission & Vision"
            subtitle="Democratizing high-quality education for every Nigerian student."
        >
            <section className="mb-20">
                <h2 className="text-3xl font-bold mb-8">The Problem We're Solving</h2>
                <p className="text-lg text-slate-600 leading-relaxed mb-6">
                    Every year, millions of Nigerian students sit forJAMB, WAEC, and NECO exams. Access to high-quality, personalized tutoring is often expensive and geographically limited. This creates an uneven playing field.
                </p>
                <p className="text-lg text-slate-600 leading-relaxed">
                    At PrepGenius AI, we believe that your academic success shouldn't depend on your location or financial status. We're leveraging artificial intelligence to provide a world-class tutor to every student with a smartphone.
                </p>
            </section>

            <div className="grid md:grid-cols-2 gap-12 mb-20 bg-slate-50 p-12 rounded-3xl border">
                <div>
                    <h2 className="text-2xl font-bold mb-4 text-[var(--blue)]">Our Vision</h2>
                    <p className="text-slate-600">
                        To be the #1 learning companion for students across West Africa, fostering a generation of lifelong learners and academic excellence.
                    </p>
                </div>
                <div>
                    <h2 className="text-2xl font-bold mb-4 text-[var(--orange)]">Our Values</h2>
                    <p className="text-slate-600">
                        Student-first design, academic integrity, technological innovation, and inclusivity in everything we build.
                    </p>
                </div>
            </div>

            <section className="mb-20">
                <h2 className="text-3xl font-bold mb-12 text-center">Our Impact Goals</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
                    <div className="text-center p-6 bg-white border rounded-2xl">
                        <div className="text-4xl font-extrabold text-[var(--blue)] mb-2">1M+</div>
                        <p className="text-sm text-slate-500 font-bold uppercase tracking-wider">Target Users</p>
                    </div>
                    <div className="text-center p-6 bg-white border rounded-2xl">
                        <div className="text-4xl font-extrabold text-[var(--orange)] mb-2">36</div>
                        <p className="text-sm text-slate-500 font-bold uppercase tracking-wider">States covered</p>
                    </div>
                    <div className="text-center p-6 bg-white border rounded-2xl col-span-2 md:col-span-1">
                        <div className="text-4xl font-extrabold text-green-500 mb-2">95%</div>
                        <p className="text-sm text-slate-500 font-bold uppercase tracking-wider">Accuracy rate</p>
                    </div>
                </div>
            </section>

            <div className="text-center py-12 border-t">
                <h2 className="text-2xl font-bold mb-4">Ready to start your journey?</h2>
                <p className="text-slate-500 mb-8">Join thousands of students already using PrepGenius AI.</p>
                <button className="bg-[var(--blue)] text-white px-10 py-4 rounded-full font-bold hover:bg-[var(--blue-darker)] transition-all">
                    Create Free Account
                </button>
            </div>
        </StaticPageLayout>
    )
}
