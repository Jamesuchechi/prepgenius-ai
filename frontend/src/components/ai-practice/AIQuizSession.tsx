import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Question, QuestionAttemptResult } from '../../lib/api'
import { QuestionService } from '../../services/questions'
import QuestionCard from './QuestionCard'
import Button from '../ui/Button'
import { Trophy, ArrowRight, RotateCcw } from 'lucide-react'

interface AIQuizSessionProps {
    questions: Question[]
    onExit: () => void
}

export default function AIQuizSession({ questions, onExit }: AIQuizSessionProps) {
    const [index, setIndex] = useState(0)
    // Flexible answer state: could be ID (number), text (string), ordering (string[]) etc.
    // Storing as { [questionId]: any }
    const [answers, setAnswers] = useState<Record<number, any>>({})
    const [results, setResults] = useState<Record<number, QuestionAttemptResult>>({})
    const [score, setScore] = useState(0)
    const [finished, setFinished] = useState(false)
    const [loading, setLoading] = useState(false)

    const currentQ = questions[index]
    const isLast = index === questions.length - 1

    const handleAnswerUpdate = (val: any) => {
        if (results[currentQ.id]) return
        setAnswers(prev => ({ ...prev, [currentQ.id]: val }))
    }

    const handleCheck = async () => {
        if (loading) return
        const answer = answers[currentQ.id]
        if (answer === undefined || answer === null || answer === '') return

        setLoading(true)
        try {
            // For MCQ, answer is the ID. For others it might be text or structured data.
            // API expectation needs to be handled.
            // Currently API expects `selected_answer_id` or `text_answer`.
            // We might need to update API call to support other formats or serialize them.
            // Assuming backend can handle `text_answer` for these new formats or we overload it.

            // For now, let's assume we pass:
            // MCQ -> selected_answer_id
            // Theory/FillBlank/TrueFalse -> text_answer
            // Matching/Ordering -> text_answer (JSON stringified)

            let selectedId: number | undefined = undefined
            let textAnswer: string | undefined = undefined

            if (currentQ.question_type === 'MCQ') {
                selectedId = answer as number
            } else if (typeof answer === 'object') {
                textAnswer = JSON.stringify(answer)
            } else {
                textAnswer = String(answer)
            }

            const res = await QuestionService.attempt(currentQ.id, selectedId, textAnswer)
            setResults(prev => ({ ...prev, [currentQ.id]: res }))
            if (res.correct) setScore(s => s + 1)
        } catch (err) {
            console.error(err)
            alert("Failed to submit answer")
        } finally {
            setLoading(false)
        }
    }

    const handleNext = () => {
        if (isLast) {
            setFinished(true)
        } else {
            setIndex(i => i + 1)
        }
    }

    if (finished) {
        const percentage = Math.round((score / questions.length) * 100)
        return (
            <div className="max-w-xl mx-auto text-center py-10">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-white rounded-3xl p-10 shadow-xl border border-gray-100"
                >
                    <div className="mx-auto w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center mb-6">
                        <Trophy className="w-12 h-12 text-yellow-600" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Session Complete!</h2>
                    <p className="text-gray-500 mb-8">You scored {score} out of {questions.length}</p>

                    <div className="grid grid-cols-2 gap-4 mb-8">
                        <div className="p-4 bg-indigo-50 rounded-2xl">
                            <div className="text-2xl font-black text-indigo-600">{percentage}%</div>
                            <div className="text-xs uppercase tracking-wider font-bold text-indigo-400">Accuracy</div>
                        </div>
                        <div className="p-4 bg-purple-50 rounded-2xl">
                            <div className="text-2xl font-black text-purple-600">{score}</div>
                            <div className="text-xs uppercase tracking-wider font-bold text-purple-400">Points</div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <Button fullWidth onClick={onExit} className="h-12">
                            <RotateCcw className="w-4 h-4 mr-2" /> Start New Session
                        </Button>
                    </div>
                </motion.div>
            </div>
        )
    }

    return (
        <div className="max-w-3xl mx-auto">
            {/* Progress Bar */}
            <div className="mb-8">
                <div className="flex justify-between text-sm font-bold text-gray-400 mb-2">
                    <span>Question {index + 1} / {questions.length}</span>
                    <span>{Math.round(((index + 1) / questions.length) * 100)}%</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${((index + 1) / questions.length) * 100}%` }}
                    />
                </div>
            </div>

            <AnimatePresence mode='wait'>
                <QuestionCard
                    key={currentQ.id}
                    question={currentQ}
                    selectedAnswerId={currentQ.question_type === 'MCQ' ? answers[currentQ.id] : undefined}
                    theoryAnswer={currentQ.question_type === 'THEORY' ? answers[currentQ.id] : undefined}
                    currentAnswer={answers[currentQ.id]}

                    onMCQSelect={handleAnswerUpdate}
                    onTheoryChange={handleAnswerUpdate}
                    onTrueFalseSelect={handleAnswerUpdate}
                    onFillBlankChange={handleAnswerUpdate}
                    onMatchingUpdate={handleAnswerUpdate}
                    onOrderingUpdate={handleAnswerUpdate}

                    result={results[currentQ.id]}
                />
            </AnimatePresence>

            <div className="mt-8 flex justify-end">
                {!results[currentQ.id] ? (
                    <Button
                        className="h-12 px-8 text-lg"
                        onClick={handleCheck}
                        disabled={answers[currentQ.id] === undefined || loading}
                    >
                        {loading ? 'Checking...' : 'Check Answer'}
                    </Button>
                ) : (
                    <Button
                        className="h-12 px-8 text-lg"
                        onClick={handleNext}
                    >
                        {isLast ? 'Finish' : 'Next Question'} <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                )}
            </div>

        </div>
    )
}
