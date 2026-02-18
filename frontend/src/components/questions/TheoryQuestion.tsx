'use client'

import React, { useState } from 'react'

interface TheoryQuestionProps {
    question: {
        id: number
        content: string
        metadata?: any
    }
    onSubmit: (answer: string) => void
    disabled?: boolean
    result?: {
        is_correct?: boolean
        score?: number
        critique?: string
        improvement_tips?: string[]
    } | null
}

export default function TheoryQuestion({
    question,
    onSubmit,
    disabled = false,
    result = null
}: TheoryQuestionProps) {
    const [answer, setAnswer] = useState('')
    const isSpeaking = question.metadata?.type === 'SPEAKING'
    const isWriting = question.metadata?.type === 'WRITING'

    const handleLocalSubmit = () => {
        if (!answer.trim()) return
        onSubmit(answer)
    }

    return (
        <div className="space-y-6">
            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 text-lg text-[var(--black)]">
                <h3 className="font-bold mb-2 uppercase text-xs tracking-widest text-[var(--gray-dark)]">
                    {isWriting ? 'Writing Task' : isSpeaking ? 'Speaking Prompt' : 'Theory Question'}
                </h3>
                <div className="whitespace-pre-wrap">{question.content}</div>

                {question.metadata?.writing_task_type && (
                    <span className="mt-4 inline-block bg-[var(--blue)]/10 text-[var(--blue)] px-3 py-1 rounded-full text-xs font-bold">
                        {question.metadata.writing_task_type}
                    </span>
                )}

                {question.metadata?.data_table && (
                    <div className="mt-6 p-4 bg-white rounded-xl border border-gray-200 overflow-x-auto">
                        <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Data / Graph Context</h4>
                        <div className="prose prose-slate max-w-none text-sm">
                            {/* Assuming markdown-like table from AI */}
                            <pre className="whitespace-pre-wrap font-mono text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-100 uppercase">
                                {question.metadata.data_table}
                            </pre>
                        </div>
                    </div>
                )}
            </div>

            {!result ? (
                <div className="space-y-4">
                    <textarea
                        value={answer}
                        onChange={(e) => setAnswer(e.target.value)}
                        placeholder={isSpeaking ? "Transcribe your response or notes here..." : "Type your essay/response here..."}
                        className="w-full h-64 p-6 rounded-2xl border-2 border-gray-100 focus:border-[var(--blue)] focus:outline-none transition-colors resize-none bg-gray-50/30"
                        disabled={disabled}
                    />
                    <div className="text-xs text-gray-400 text-right">
                        Word count: {answer.trim() ? answer.trim().split(/\s+/).length : 0}
                    </div>
                </div>
            ) : (
                <div className="space-y-6">
                    <div className="bg-white rounded-2xl p-6 border-2 border-gray-100 shadow-sm">
                        <h4 className="font-bold text-sm mb-3 uppercase text-gray-400">Your Submission</h4>
                        <div className="text-[var(--gray-dark)] whitespace-pre-wrap italic">
                            {answer || "No response provided."}
                        </div>
                    </div>

                    <div className={`p-6 rounded-2xl border ${result.score !== undefined ? 'bg-blue-50 border-blue-100' : 'bg-gray-50 border-gray-100'}`}>
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <span className="text-xl">📊</span>
                                <span className="font-bold text-blue-900">Grading & Feedback</span>
                            </div>
                            {result.score !== undefined && (
                                <div className="bg-blue-600 text-white px-4 py-1 rounded-full font-black">
                                    SCORE: {result.score}/10
                                </div>
                            )}
                        </div>

                        {result.critique && (
                            <div className="mb-4">
                                <h5 className="font-bold text-xs uppercase text-blue-800 mb-1">Critique</h5>
                                <p className="text-sm text-blue-900 leading-relaxed">{result.critique}</p>
                            </div>
                        )}

                        {result.improvement_tips && result.improvement_tips.length > 0 && (
                            <div>
                                <h5 className="font-bold text-xs uppercase text-blue-800 mb-2">Improvement Tips</h5>
                                <ul className="list-disc list-inside space-y-1">
                                    {result.improvement_tips.map((tip, idx) => (
                                        <li key={idx} className="text-sm text-blue-900">{tip}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
