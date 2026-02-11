'use client'

import React, { useState } from 'react'
import AIGenerationForm from '../../components/ai-practice/AIGenerationForm'
import AIQuizSession from '../../components/ai-practice/AIQuizSession'
import { Question } from '../../lib/api'
import { motion, AnimatePresence } from 'framer-motion'

export default function PracticePage() {
    const [questions, setQuestions] = useState<Question[]>([])
    const [view, setView] = useState<'SETUP' | 'SESSION'>('SETUP')

    const handleQuestionsGenerated = (generatedQuestions: Question[]) => {
        setQuestions(generatedQuestions)
        setView('SESSION')
    }

    const handleExit = () => {
        setQuestions([])
        setView('SETUP')
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-12 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-12 text-center">
                    <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 mb-2">
                        PrepGenius AI Practice
                    </h1>
                    <p className="text-gray-500 font-medium">Master your exams with intelligent, adaptive questions.</p>
                </div>

                <AnimatePresence mode="wait">
                    {view === 'SETUP' && (
                        <motion.div
                            key="setup"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            <AIGenerationForm onQuestionsGenerated={handleQuestionsGenerated} />
                        </motion.div>
                    )}

                    {view === 'SESSION' && (
                        <motion.div
                            key="session"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.4 }}
                        >
                            <AIQuizSession questions={questions} onExit={handleExit} />
                        </motion.div>
                    )}
                </AnimatePresence>

            </div>
        </div>
    )
}
