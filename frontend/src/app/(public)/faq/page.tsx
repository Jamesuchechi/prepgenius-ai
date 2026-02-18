import React from 'react'
import StaticPageLayout from '@/components/layout/StaticPageLayout'

const faqs = [
    {
        question: "What is PrepGenius AI?",
        answer: "PrepGenius AI is an advanced learning platform specifically designed for Nigerian students. We use artificial intelligence to provide personalized study plans, mock exams, and real-time tutoring for JAMB, WAEC, NECO, and other major exams."
    },
    {
        question: "How does the AI Tutor work?",
        answer: "Our AI Tutor is trained on the Nigerian curriculum. You can ask it questions about any subject, and it will provide detailed explanations, step-by-step solutions, and even guide you through complex problems just like a human teacher."
    },
    {
        question: "Is there a free version?",
        answer: "Yes! We offer a restricted free tier that includes basic study materials and limited AI tutor interactions. For full access to specialized mock exams and unlimited AI tutoring, we offer affordable premium plans."
    },
    {
        question: "Which exams do you cover?",
        answer: "Currently, we fully support JAMB (UTME), WAEC (WASSCE), and NECO. We are constantly expanding our content library to include Post-UTME, GCE, and professional certifications."
    },
    {
        question: "Can I use PrepGenius AI on my phone?",
        answer: "Absolutely. PrepGenius AI is fully responsive and works perfectly on smartphones, tablets, and computers. You can study anywhere, anytime."
    }
]

export default function FAQPage() {
    return (
        <StaticPageLayout
            title="Frequently Asked Questions"
            subtitle="Everything you need to know about PrepGenius AI."
        >
            <div className="space-y-8">
                {faqs.map((faq, index) => (
                    <div key={index} className="bg-slate-50 p-8 rounded-2xl border border-slate-100 hover:border-[var(--orange)] transition-colors">
                        <h3 className="text-xl font-bold mb-4 text-slate-900 flex items-start gap-3">
                            <span className="text-[var(--orange)]">Q:</span>
                            {faq.question}
                        </h3>
                        <p className="text-slate-600 leading-relaxed pl-8">
                            {faq.answer}
                        </p>
                    </div>
                ))}
            </div>

            <div className="mt-16 p-8 bg-blue-50 rounded-3xl text-center border border-blue-100">
                <h3 className="text-xl font-bold mb-2">Still have questions?</h3>
                <p className="text-slate-600 mb-6">We're here to help you succeed.</p>
                <div className="flex gap-4 justify-center">
                    <button className="bg-[var(--blue)] text-white px-8 py-3 rounded-full font-bold hover:bg-[var(--blue-darker)] transition-all">
                        Contact Support
                    </button>
                    <button className="bg-white text-[var(--blue)] border-2 border-[var(--blue)] px-8 py-3 rounded-full font-bold hover:bg-blue-50 transition-all">
                        Help Center
                    </button>
                </div>
            </div>
        </StaticPageLayout>
    )
}
