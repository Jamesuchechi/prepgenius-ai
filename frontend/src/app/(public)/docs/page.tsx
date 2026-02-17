import React from 'react'
import StaticPageLayout from '@/components/layout/StaticPageLayout'

export default function DocsPage() {
    return (
        <StaticPageLayout
            title="API Documentation"
            subtitle="Developers: Build on top of the PrepGenius platform."
        >
            <div className="bg-slate-900 rounded-2xl p-8 mb-12 text-blue-300 font-mono text-sm">
                <p className="mb-2"># Get started with PrepGenius API</p>
                <p className="text-white">GET /api/v1/content/questions</p>
                <p className="text-slate-500 mt-4"># Response</p>
                <p className="text-green-400">{"{"} "status": 200, "data": [...] {"}"}</p>
            </div>

            <section className="mb-12">
                <h2 className="text-2xl font-bold mb-4">Authentication</h2>
                <p>
                    All API requests require a valid API key. You can generate one from your developer dashboard under integration settings.
                </p>
                <div className="bg-slate-100 p-4 rounded-xl mt-4 border font-mono text-sm">
                    Authorization: Bearer YOUR_API_KEY
                </div>
            </section>

            <section className="mb-12">
                <h2 className="text-2xl font-bold mb-4">Core Resources</h2>
                <div className="space-y-6">
                    <div className="border-l-4 border-blue-500 pl-6 py-2">
                        <h3 className="font-bold flex items-center gap-2">
                            <span className="bg-blue-100 text-blue-600 text-[10px] px-2 py-0.5 rounded">GET</span>
                            /v1/questions
                        </h3>
                        <p className="text-sm text-slate-600 mt-2">Fetch paginated questions based on subject and exam type.</p>
                    </div>
                    <div className="border-l-4 border-green-500 pl-6 py-2">
                        <h3 className="font-bold flex items-center gap-2">
                            <span className="bg-green-100 text-green-600 text-[10px] px-2 py-0.5 rounded">POST</span>
                            /v1/quiz/submit
                        </h3>
                        <p className="text-sm text-slate-600 mt-2">Submit quiz answers and get instant AI-generated feedback.</p>
                    </div>
                    <div className="border-l-4 border-purple-500 pl-6 py-2">
                        <h3 className="font-bold flex items-center gap-2">
                            <span className="bg-purple-100 text-purple-600 text-[10px] px-2 py-0.5 rounded">GET</span>
                            /v1/analytics/overview
                        </h3>
                        <p className="text-sm text-slate-600 mt-2">Retrieve aggregate performance data for a specific user.</p>
                    </div>
                </div>
            </section>

            <section className="mb-12">
                <h2 className="text-2xl font-bold mb-4">Rate Limiting</h2>
                <p>
                    Our API is rate-limited to ensure platform stability.
                    Standard keys are limited to 1,000 requests per hour.
                    Enterprise keys have custom limits.
                </p>
            </section>

            <div className="p-8 bg-slate-50 border rounded-2xl flex items-center justify-between">
                <div>
                    <h3 className="font-bold">Need a higher limit?</h3>
                    <p className="text-sm text-slate-500">Contact our developer relations team.</p>
                </div>
                <button className="bg-[var(--blue)] text-white px-6 py-2 rounded-lg font-bold hover:bg-[var(--blue-darker)] transition-all">
                    Request Access
                </button>
            </div>
        </StaticPageLayout>
    )
}
