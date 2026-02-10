'use client'

import React, { useState } from 'react'
import DashboardLayout from '../../../../components/dashboard/DashboardLayout'
import PracticeSetup from '../../../../components/questions/PracticeSetup'
import QuestionSession from '../../../../components/questions/QuestionSession'
import { Question, generateQuestions } from '../../../../lib/api'

export default function PracticePage() {
    const [sessionQuestions, setSessionQuestions] = useState<Question[]>([])
    const [isGenerating, setIsGenerating] = useState(false)
    const [currentStep, setCurrentStep] = useState<'setup' | 'practice'>('setup')

    const handleStartSession = async (config: {
        subjectId: number
        topicId: number
        examTypeId: number
        difficulty: string
        count: number
    }) => {
        setIsGenerating(true)
        try {
            const questions = await generateQuestions({
                subject_id: config.subjectId,
                topic_id: config.topicId,
                exam_type_id: config.examTypeId,
                difficulty: config.difficulty,
                count: config.count
            })
            setSessionQuestions(questions)
            setCurrentStep('practice')

        } catch (error) {
            console.error('Failed to generate questions:', error)
            alert('Oops! We encountered an error generating your questions. Please try again or switch providers.')
        } finally {
            setIsGenerating(false)
        }
    }

    return (
        <DashboardLayout>
            <div className="mb-8">
                <h1 className="font-display text-3xl font-extrabold text-[var(--black)] mb-2">Practice Center</h1>
                <p className="text-[var(--gray-dark)]">Hone your skills with AI-powered personalized practice.</p>
            </div>

            {isGenerating ? (
                <div className="flex flex-col items-center justify-center py-20 mt-10">
                    <div className="relative w-24 h-24 mb-6">
                        <div className="absolute inset-0 border-4 border-[var(--blue)]/20 rounded-full"></div>
                        <div className="absolute inset-0 border-4 border-t-[var(--blue)] rounded-full animate-spin"></div>
                        <div className="absolute inset-0 flex items-center justify-center text-3xl animate-pulse">🤖</div>
                    </div>
                    <h2 className="text-2xl font-display font-extrabold text-[var(--black)] mb-2 text-center">
                        AI is crafting your questions...
                    </h2>
                    <p className="text-[var(--gray-dark)] text-center max-w-sm">
                        Our specialized exam agents are generating unique, high-quality questions for you. This usually takes 10-20 seconds.
                    </p>
                </div>
            ) : (
                <>
                    {currentStep === 'setup' ? (
                        <PracticeSetup onStart={handleStartSession} />
                    ) : (
                        <QuestionSession
                            questions={sessionQuestions}
                            onFinish={() => setCurrentStep('setup')}
                        />
                    )}
                </>
            )}
        </DashboardLayout>
    )
}
