import React, { useState, useEffect } from 'react'
import { Question, attemptQuestion, QuestionAttemptResult } from '../../lib/api'
import MCQQuestion from './MCQQuestion'
import TheoryQuestion from './TheoryQuestion'
import { Button } from '../ui/Button'

interface QuestionSessionProps {
    questions: Question[]
    onFinish: () => void
}

export default function QuestionSession({ questions, onFinish }: QuestionSessionProps) {
    const [currentIndex, setCurrentIndex] = useState(0)
    const [answer, setAnswer] = useState<number | string | null>(null)
    const [result, setResult] = useState<QuestionAttemptResult | null>(null)
    const [loading, setLoading] = useState(false)
    const [score, setScore] = useState(0)
    const [completed, setCompleted] = useState(false)
    const [isSpeaking, setIsSpeaking] = useState(false)
    const [hasHeardAudio, setHasHeardAudio] = useState(false)
    const [autoPlayAttempted, setAutoPlayAttempted] = useState<number | null>(null)

    const currentQuestion = questions[currentIndex]
    const stimulus = currentQuestion.metadata || {}

    const handleSpeak = React.useCallback(() => {
        if (!stimulus.transcript) return

        window.speechSynthesis.cancel()
        const utterance = new SpeechSynthesisUtterance(stimulus.transcript)
        utterance.onstart = () => setIsSpeaking(true)
        utterance.onend = () => {
            setIsSpeaking(false)
            setHasHeardAudio(true)
        }
        utterance.onerror = () => {
            setIsSpeaking(false)
            setHasHeardAudio(true)
        }
        window.speechSynthesis.speak(utterance)
    }, [stimulus.transcript])

    // Auto-play and Reset synthesis when question changes
    useEffect(() => {
        setHasHeardAudio(!stimulus.transcript)

        if (stimulus.transcript && autoPlayAttempted !== currentIndex) {
            handleSpeak()
            setAutoPlayAttempted(currentIndex)
        }

        return () => window.speechSynthesis.cancel()
    }, [currentIndex, stimulus.transcript, handleSpeak, autoPlayAttempted])

    const handleSubmit = async () => {
        if (answer === null) return

        setLoading(true)
        try {
            const attemptResult = await attemptQuestion(currentQuestion.id, answer as any)
            setResult(attemptResult)
            if (attemptResult.correct || (attemptResult.score && attemptResult.score >= 5)) {
                setScore(score + 1)
            }
        } catch (error) {
            console.error('Failed to submit answer:', error)
            alert('Failed to submit answer. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const handleNext = () => {
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(currentIndex + 1)
            setAnswer(null)
            setResult(null)
        } else {
            setCompleted(true)
        }
    }

    if (completed) {
        const percentage = Math.round((score / questions.length) * 100)
        return (
            <div className="max-w-2xl mx-auto text-center py-12">
                <div className="bg-white rounded-3xl p-10 border border-gray-100 shadow-xl">
                    <div className="text-6xl mb-6">
                        {percentage >= 80 ? '🎉' : percentage >= 50 ? '👏' : '📚'}
                    </div>
                    <h2 className="text-3xl font-display font-extrabold text-[var(--black)] mb-2">Session Complete!</h2>
                    <p className="text-[var(--gray-dark)] mb-8">You've finished your practice session.</p>

                    <div className="grid grid-cols-2 gap-6 mb-10">
                        <div className="bg-blue-50 rounded-2xl p-6">
                            <div className="text-4xl font-display font-black text-[var(--blue)] mb-1">{score}/{questions.length}</div>
                            <div className="text-sm font-bold text-[var(--blue)] uppercase tracking-wider">Score</div>
                        </div>
                        <div className="bg-orange-50 rounded-2xl p-6">
                            <div className="text-4xl font-display font-black text-[var(--orange)] mb-1">{percentage}%</div>
                            <div className="text-sm font-bold text-[var(--orange)] uppercase tracking-wider">Accuracy</div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <Button onClick={() => window.location.reload()} fullWidth>Practice Again</Button>
                        <Button variant="secondary" onClick={onFinish} fullWidth>Back to Center</Button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            {/* Progress Bar */}
            <div className="bg-slate-100 h-3 rounded-full overflow-hidden">
                <div
                    className="bg-gradient-to-r from-[var(--orange)] to-[var(--blue)] h-full transition-all duration-500"
                    style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                ></div>
            </div>

            <div className="flex justify-between items-center text-sm font-bold text-[var(--gray-dark)]">
                <span>QUESTION {currentIndex + 1} OF {questions.length}</span>
                <span className="bg-gray-100 px-3 py-1 rounded-full">{currentQuestion.difficulty}</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                {/* Stimulus Section (Optional) */}
                {(stimulus.passage || stimulus.transcript) && (
                    <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-xl lg:sticky lg:top-8 max-h-[70vh] flex flex-col">
                        <div className="flex items-center gap-2 mb-4">
                            <span className="text-xl">{stimulus.passage ? '📖' : '🎧'}</span>
                            <h3 className="font-bold text-[var(--black)] uppercase tracking-wider">
                                {stimulus.passage ? 'Comprehension Passage' : 'Audio Transcript'}
                            </h3>
                        </div>

                        {stimulus.passage && (
                            <div className="overflow-y-auto pr-4 text-[var(--gray-dark)] leading-relaxed prose prose-slate">
                                {stimulus.passage}
                            </div>
                        )}

                        {stimulus.transcript && (
                            <div className="flex flex-col items-center justify-center h-48 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                                <button
                                    onClick={handleSpeak}
                                    disabled={isSpeaking}
                                    className={`w-20 h-20 rounded-full flex items-center justify-center transition-all ${isSpeaking ? 'bg-orange-100 text-orange-500 scale-110' : 'bg-[var(--blue)] text-white hover:scale-105'}`}
                                >
                                    {isSpeaking ? (
                                        <div className="flex gap-1">
                                            <div className="w-1 h-4 bg-orange-500 animate-bounce"></div>
                                            <div className="w-1 h-6 bg-orange-500 animate-bounce delay-75"></div>
                                            <div className="w-1 h-4 bg-orange-500 animate-bounce delay-150"></div>
                                        </div>
                                    ) : (
                                        <span className="text-3xl text-white">▶</span>
                                    )}
                                </button>
                                <p className={`mt-4 text-xs font-bold uppercase tracking-wider ${isSpeaking ? 'text-orange-500 animate-pulse' : 'text-[var(--gray-dark)]'}`}>
                                    {isSpeaking ? 'Listening in progress...' : 'Click to hear audio'}
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {/* Question Section */}
                <div className={`bg-white rounded-3xl p-8 border border-gray-100 shadow-xl ${!(stimulus.passage || stimulus.transcript) ? 'lg:col-span-2 max-w-2xl mx-auto w-full' : ''}`}>
                    {currentQuestion.question_type === 'MCQ' ? (
                        <div className="relative">
                            <MCQQuestion
                                question={currentQuestion}
                                selectedAnswerId={typeof answer === 'number' ? answer : null}
                                onSelect={setAnswer}
                                disabled={result !== null || loading || !hasHeardAudio}
                                result={result ? { correct: result.correct, correctAnswerId: result.correct_answer_id || 0 } : null}
                            />
                            {!hasHeardAudio && isSpeaking && (
                                <div className="absolute inset-0 bg-white/5 cursor-not-allowed z-10" />
                            )}
                        </div>
                    ) : (
                        <TheoryQuestion
                            question={currentQuestion}
                            onSubmit={setAnswer}
                            disabled={result !== null || loading}
                            result={result}
                        />
                    )}

                    {result && currentQuestion.question_type === 'MCQ' && (
                        <div className={`mt-8 p-6 rounded-2xl border ${result.correct ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'} animate-[fadeIn_0.3s_ease-out]`}>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-xl">{result.correct ? '✨' : '💡'}</span>
                                <span className={`font-bold ${result.correct ? 'text-green-800' : 'text-red-800'}`}>
                                    {result.correct ? 'Great job! Correct.' : 'Not quite. Here is the explanation:'}
                                </span>
                            </div>
                            <p className="text-[var(--gray-dark)] leading-relaxed text-sm">
                                {result.explanation}
                            </p>
                        </div>
                    )}

                    <div className="mt-10 flex gap-4">
                        {!result ? (
                            <Button
                                onClick={handleSubmit}
                                disabled={answer === null || loading}
                                fullWidth
                                className="h-14"
                            >
                                {loading ? 'Checking...' : 'Submit Answer →'}
                            </Button>
                        ) : (
                            <Button
                                onClick={handleNext}
                                fullWidth
                                className="h-14"
                            >
                                {currentIndex < questions.length - 1 ? 'Next Question →' : 'Finish Session 🏁'}
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
