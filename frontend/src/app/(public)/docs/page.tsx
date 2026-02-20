'use client'

import React, { useState } from 'react'
import StaticPageLayout from '@/components/layout/StaticPageLayout'
import Link from 'next/link'

const endpoints = [
    {
        method: 'GET',
        path: '/api/v1/content/questions',
        color: 'bg-blue-100 text-blue-700 border-blue-200',
        border: 'border-blue-300',
        description: 'Fetch paginated questions filtered by subject, exam type, and difficulty.',
        params: [
            { name: 'subject', type: 'string', req: true, desc: 'e.g. "biology", "mathematics"' },
            { name: 'exam_type', type: 'string', req: false, desc: '"JAMB" | "WAEC" | "NECO" | "SAT"' },
            { name: 'difficulty', type: 'string', req: false, desc: '"easy" | "medium" | "hard"' },
            { name: 'page', type: 'integer', req: false, desc: 'Pagination page number (default: 1)' },
            { name: 'limit', type: 'integer', req: false, desc: 'Results per page (default: 20, max: 100)' },
        ],
        example: `curl -X GET "https://api.prepgenius.ai/v1/content/questions?subject=biology&exam_type=JAMB&limit=10" \\
  -H "Authorization: Bearer YOUR_API_KEY"`,
    },
    {
        method: 'POST',
        path: '/api/v1/quiz/submit',
        color: 'bg-green-100 text-green-700 border-green-200',
        border: 'border-green-300',
        description: 'Submit quiz answers and receive instant AI-generated performance analysis and explanations.',
        params: [
            { name: 'session_id', type: 'string', req: true, desc: 'Active quiz session identifier' },
            { name: 'answers', type: 'array', req: true, desc: 'Array of {question_id, selected_option}' },
        ],
        example: `curl -X POST "https://api.prepgenius.ai/v1/quiz/submit" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"session_id": "sess_abc123", "answers": [{"question_id": 1, "selected_option": "A"}]}'`,
    },
    {
        method: 'GET',
        path: '/api/v1/analytics/overview',
        color: 'bg-purple-100 text-purple-700 border-purple-200',
        border: 'border-purple-300',
        description: 'Retrieve a comprehensive performance overview — scores, streaks, weak areas, and improvement trends.',
        params: [
            { name: 'user_id', type: 'string', req: true, desc: 'Target user identifier' },
            { name: 'period', type: 'string', req: false, desc: '"7d" | "30d" | "90d" | "all" (default: "30d")' },
        ],
        example: `curl -X GET "https://api.prepgenius.ai/v1/analytics/overview?user_id=usr_xyz&period=30d" \\
  -H "Authorization: Bearer YOUR_API_KEY"`,
    },
    {
        method: 'POST',
        path: '/api/v1/ai/chat',
        color: 'bg-orange-100 text-orange-700 border-orange-200',
        border: 'border-orange-300',
        description: 'Send a message to the AI Tutor and receive a contextual explanation or step-by-step solution.',
        params: [
            { name: 'session_id', type: 'string', req: true, desc: 'Chat session identifier' },
            { name: 'message', type: 'string', req: true, desc: 'User message / question (max 2,000 chars)' },
            { name: 'subject', type: 'string', req: false, desc: 'Optional subject context for better responses' },
        ],
        example: `curl -X POST "https://api.prepgenius.ai/v1/ai/chat" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"session_id": "chat_001", "message": "Explain photosynthesis in simple terms", "subject": "biology"}'`,
    },
]

const methodColors: Record<string, string> = {
    GET: 'bg-blue-100 text-blue-700',
    POST: 'bg-green-100 text-green-700',
    PUT: 'bg-yellow-100 text-yellow-700',
    DELETE: 'bg-red-100 text-red-700',
}

export default function DocsPage() {
    const [activeEndpoint, setActiveEndpoint] = useState(0)

    return (
        <StaticPageLayout
            title="API Documentation"
            subtitle="Build powerful educational tools on top of the PrepGenius AI platform. REST API with JSON responses."
        >
            {/* API Overview cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
                {[
                    { icon: '🔐', title: 'Auth', desc: 'Bearer token' },
                    { icon: '⚡', title: 'Rate Limit', desc: '1,000 req/hr' },
                    { icon: '🌐', title: 'Base URL', desc: 'api.prepgenius.ai' },
                    { icon: '📦', title: 'Format', desc: 'JSON / REST' },
                ].map((c, i) => (
                    <div key={i} className="bg-card border border-border rounded-2xl p-5 text-center hover:shadow-md transition-shadow">
                        <div className="text-2xl mb-2">{c.icon}</div>
                        <div className="font-bold text-foreground text-sm mb-1">{c.title}</div>
                        <div className="text-xs text-muted-foreground font-mono">{c.desc}</div>
                    </div>
                ))}
            </div>

            {/* Authentication Section */}
            <section className="mb-12">
                <h2 className="text-2xl font-bold text-foreground mb-4">🔐 Authentication</h2>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                    All API requests must include a valid API key in the Authorization header. You can generate an API key from your <Link href="/signup" className="text-primary hover:underline font-medium">Developer Dashboard</Link> under Integration Settings.
                </p>
                <div className="bg-slate-900 rounded-2xl p-6 font-mono text-sm">
                    <p className="text-slate-500 mb-2"># Include this header with every request</p>
                    <p className="text-green-400">Authorization: Bearer YOUR_API_KEY</p>
                </div>
                <div className="mt-4 bg-orange-50 border border-orange-100 rounded-xl p-4 text-sm text-orange-800">
                    ⚠️ <strong>Security notice:</strong> Never expose your API key in client-side code. Always make API calls from your backend server.
                </div>
            </section>

            {/* Endpoints */}
            <section className="mb-12">
                <h2 className="text-2xl font-bold text-foreground mb-8">📡 Core Endpoints</h2>
                <div className="flex flex-col md:flex-row gap-0 border border-border rounded-2xl overflow-hidden">
                    {/* Sidebar */}
                    <div className="md:w-72 bg-card border-b md:border-b-0 md:border-r border-border flex-shrink-0">
                        {endpoints.map((ep, i) => (
                            <button
                                key={i}
                                onClick={() => setActiveEndpoint(i)}
                                className={`w-full text-left p-4 border-b border-border last:border-b-0 transition-colors ${activeEndpoint === i ? 'bg-muted' : 'hover:bg-muted/50'}`}
                            >
                                <div className="flex items-center gap-2">
                                    <span className={`text-xs font-bold px-2 py-0.5 rounded ${methodColors[ep.method]}`}>{ep.method}</span>
                                </div>
                                <p className="text-xs font-mono text-muted-foreground mt-1 truncate">{ep.path}</p>
                            </button>
                        ))}
                    </div>
                    {/* Detail */}
                    <div className="flex-1 p-8">
                        {(() => {
                            const ep = endpoints[activeEndpoint]
                            return (
                                <div>
                                    <div className="flex items-center gap-3 mb-4">
                                        <span className={`text-sm font-bold px-3 py-1 rounded-lg ${methodColors[ep.method]}`}>{ep.method}</span>
                                        <code className="text-sm font-mono text-foreground bg-muted px-3 py-1 rounded-lg">{ep.path}</code>
                                    </div>
                                    <p className="text-muted-foreground mb-6 leading-relaxed">{ep.description}</p>

                                    <h4 className="font-bold text-foreground mb-3 text-sm uppercase tracking-wider">Parameters</h4>
                                    <div className="space-y-2 mb-6">
                                        {ep.params.map((p, j) => (
                                            <div key={j} className="bg-muted/50 rounded-xl px-4 py-3 flex flex-wrap items-start gap-3">
                                                <code className="text-sm font-mono text-foreground font-bold">{p.name}</code>
                                                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-medium">{p.type}</span>
                                                {p.req ? (
                                                    <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded font-medium">required</span>
                                                ) : (
                                                    <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded font-medium">optional</span>
                                                )}
                                                <span className="text-xs text-muted-foreground">{p.desc}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <h4 className="font-bold text-foreground mb-3 text-sm uppercase tracking-wider">Example Request</h4>
                                    <div className="bg-slate-900 rounded-xl p-5 font-mono text-xs text-green-400 overflow-x-auto">
                                        <pre>{ep.example}</pre>
                                    </div>
                                </div>
                            )
                        })()}
                    </div>
                </div>
            </section>

            {/* Error Codes */}
            <section className="mb-12">
                <h2 className="text-2xl font-bold text-foreground mb-6">⚠️ Error Codes</h2>
                <div className="grid md:grid-cols-2 gap-4">
                    {[
                        { code: '200', label: 'OK', desc: 'Request succeeded.', color: 'bg-green-50 border-green-100 text-green-700' },
                        { code: '400', label: 'Bad Request', desc: 'Missing or invalid parameters.', color: 'bg-yellow-50 border-yellow-100 text-yellow-700' },
                        { code: '401', label: 'Unauthorized', desc: 'Invalid or missing API key.', color: 'bg-red-50 border-red-100 text-red-700' },
                        { code: '429', label: 'Rate Limited', desc: 'Too many requests. Slow down.', color: 'bg-orange-50 border-orange-100 text-orange-700' },
                        { code: '404', label: 'Not Found', desc: 'Resource does not exist.', color: 'bg-slate-50 border-slate-100 text-slate-700' },
                        { code: '500', label: 'Server Error', desc: 'Contact support if this persists.', color: 'bg-red-50 border-red-100 text-red-700' },
                    ].map((e, i) => (
                        <div key={i} className={`${e.color} border rounded-xl p-4 flex items-start gap-3`}>
                            <code className="text-lg font-bold font-mono">{e.code}</code>
                            <div>
                                <p className="font-bold text-sm">{e.label}</p>
                                <p className="text-xs opacity-80">{e.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Rate Limiting */}
            <section className="mb-12 bg-card border border-border rounded-2xl p-8">
                <h2 className="text-xl font-bold text-foreground mb-4">⏱️ Rate Limiting</h2>
                <p className="text-muted-foreground mb-4">All API requests are subject to rate limiting to ensure fair usage and platform stability.</p>
                <div className="grid md:grid-cols-3 gap-4">
                    {[
                        { tier: 'Free', limit: '100 req/hr', color: 'bg-slate-50 border-slate-200' },
                        { tier: 'Standard', limit: '1,000 req/hr', color: 'bg-blue-50 border-blue-200' },
                        { tier: 'Enterprise', limit: 'Custom', color: 'bg-orange-50 border-orange-200' },
                    ].map((t, i) => (
                        <div key={i} className={`${t.color} border rounded-xl p-4 text-center`}>
                            <p className="font-bold text-foreground">{t.tier}</p>
                            <p className="text-muted-foreground text-sm mt-1">{t.limit}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-12 text-center text-white">
                <div className="text-4xl mb-4">🚀</div>
                <h3 className="text-2xl font-bold mb-3">Ready to Start Building?</h3>
                <p className="text-slate-400 mb-8 max-w-lg mx-auto">
                    Get your API key and start integrating PrepGenius AI into your applications today. Enterprise accounts available for high-volume use cases.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link href="/signup" className="bg-[var(--orange)] hover:bg-[var(--orange-light)] text-white px-8 py-3 rounded-full font-bold transition-all shadow-lg">
                        Get API Access
                    </Link>
                    <Link href="/contact" className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-8 py-3 rounded-full font-bold transition-all">
                        Talk to Enterprise Team
                    </Link>
                </div>
            </div>
        </StaticPageLayout>
    )
}
