'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { ArrowLeft, ArrowRight, Flag, Send } from 'lucide-react'
import { ExamTimer } from './ExamTimer'
import { QuestionNavigator } from './QuestionNavigator'
import { Question } from '@/services/exams'

interface ExamInterfaceProps {
  questions: Question[]
  durationMinutes: number
  examTitle: string
  onSubmit: (responses: Record<string, number>, timeTaken: number) => void
  onExit?: () => void
  isSubmitting?: boolean
}

export function ExamInterface({
  questions,
  durationMinutes,
  examTitle,
  onSubmit,
  onExit,
  isSubmitting = false,
}: ExamInterfaceProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [responses, setResponses] = useState<Record<string, number>>({})
  const [answeredQuestions, setAnsweredQuestions] = useState(new Set<number>())
  const [timeElapsed, setTimeElapsed] = useState(0)
  const [showNavigator, setShowNavigator] = useState(true)
  const [flaggedQuestions, setFlaggedQuestions] = useState(new Set<number>())
  const [showExitConfirm, setShowExitConfirm] = useState(false)

  const currentQuestion = questions[currentQuestionIndex]

  // Track time
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeElapsed((prev) => prev + 1)
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const handleSelectAnswer = useCallback(
    (answerId: number) => {
      const questionId = currentQuestion.id
      setResponses((prev) => ({
        ...prev,
        [questionId]: answerId,
      }))
      setAnsweredQuestions((prev) => new Set(prev).add(currentQuestionIndex))
    },
    [currentQuestion.id, currentQuestionIndex]
  )

  const handleToggleFlag = useCallback(() => {
    setFlaggedQuestions((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(currentQuestionIndex)) {
        newSet.delete(currentQuestionIndex)
      } else {
        newSet.add(currentQuestionIndex)
      }
      return newSet
    })
  }, [currentQuestionIndex])

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1)
    }
  }

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1)
    }
  }

  const handleSelectQuestion = (index: number) => {
    setCurrentQuestionIndex(index)
  }

  const handleTimeUp = () => {
    handleSubmitExam()
  }

  const handleSubmitExam = () => {
    onSubmit(responses, timeElapsed)
  }

  const isFlagged = flaggedQuestions.has(currentQuestionIndex)
  const isAnswered = answeredQuestions.has(currentQuestionIndex)

  return (
    <div className="h-screen bg-gray-50 overflow-hidden">
      {/* Header */}
      <ExamTimer durationMinutes={durationMinutes} onTimeUp={handleTimeUp} />

      <div className="flex h-[calc(100vh-80px)]">
        {/* Sidebar */}
        {showNavigator && (
          <div className="w-80 bg-gray-50 border-r border-gray-200 overflow-y-auto p-4">
            <QuestionNavigator
              totalQuestions={questions.length}
              currentQuestion={currentQuestionIndex}
              answeredQuestions={answeredQuestions}
              onSelectQuestion={handleSelectQuestion}
              reviewMode={false}
            />
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto p-8">
            {/* Exam Title */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{examTitle}</h1>
              <p className="text-gray-600">
                Question {currentQuestionIndex + 1} of {questions.length}
              </p>
            </div>

            {/* Question Card */}
            <div className="bg-white rounded-lg border border-gray-200 p-8 mb-8">
              {/* Question Header */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    {currentQuestion.content}
                  </h2>
                  <div className="flex gap-4 text-sm">
                    <span
                      className={`px-3 py-1 rounded-full font-medium ${
                        currentQuestion.difficulty === 'EASY'
                          ? 'bg-green-100 text-green-700'
                          : currentQuestion.difficulty === 'MEDIUM'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {currentQuestion.difficulty}
                    </span>
                    {currentQuestion.topic_name && (
                      <span className="px-3 py-1 rounded-full font-medium bg-blue-100 text-blue-700">
                        {currentQuestion.topic_name}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={handleToggleFlag}
                  className={`p-2 rounded-lg transition-colors ${
                    isFlagged
                      ? 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  title="Flag this question for review"
                >
                  <Flag className="w-5 h-5" />
                </button>
              </div>

              {/* Options */}
              <div className="space-y-3 mb-6">
                {currentQuestion.answers.map((answer) => (
                  <label
                    key={answer.id}
                    className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      responses[currentQuestion.id] === answer.id
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name={`question-${currentQuestion.id}`}
                      value={answer.id}
                      checked={responses[currentQuestion.id] === answer.id}
                      onChange={() => handleSelectAnswer(answer.id)}
                      className="w-4 h-4 cursor-pointer"
                    />
                    <span className="text-gray-900 font-medium">{answer.content}</span>
                  </label>
                ))}
              </div>

              {/* Guidance */}
              {currentQuestion.guidance && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mb-6">
                  <p className="text-sm text-blue-900">
                    <span className="font-semibold">Hint:</span> {currentQuestion.guidance}
                  </p>
                </div>
              )}
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between gap-4 mb-8">
              <button
                onClick={handlePrevQuestion}
                disabled={currentQuestionIndex === 0}
                className="flex items-center gap-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400 text-gray-900 font-semibold rounded-lg transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Previous
              </button>

              <div className="flex items-center gap-2">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    isAnswered
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {isAnswered ? '✓ Answered' : 'Not answered'}
                </span>
              </div>

              <button
                onClick={handleNextQuestion}
                disabled={currentQuestionIndex === questions.length - 1}
                className="flex items-center gap-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400 text-gray-900 font-semibold rounded-lg transition-colors"
              >
                Next
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Submit Section */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
              <p className="text-sm text-gray-600 mb-4">
                You have answered <span className="font-bold">{answeredQuestions.size}</span> out
                of <span className="font-bold">{questions.length}</span> questions.
              </p>
              <button
                onClick={handleSubmitExam}
                disabled={isSubmitting || answeredQuestions.size === 0}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-colors"
              >
                <Send className="w-5 h-5" />
                {isSubmitting ? 'Submitting...' : 'Submit Exam'}
              </button>
              <button
                onClick={() => setShowExitConfirm(true)}
                className="w-full mt-2 px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-900 font-semibold rounded-lg transition-colors"
              >
                Exit Exam
              </button>
            </div>
          </div>
        </div>

        {/* Toggle Navigator Button */}
        <button
          onClick={() => setShowNavigator(!showNavigator)}
          className="fixed bottom-8 right-8 p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg transition-colors"
          title={showNavigator ? 'Hide navigator' : 'Show navigator'}
        >
          {showNavigator ? '✕' : '☰'}
        </button>
      </div>

      {/* Exit Confirmation Modal */}
      {showExitConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Exit Exam?</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to exit? Your progress will be saved, but the exam won't be
              graded.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowExitConfirm(false)}
                className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-900 font-semibold rounded-lg"
              >
                Continue Exam
              </button>
              <button
                onClick={() => {
                  setShowExitConfirm(false)
                  onExit?.()
                }}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg"
              >
                Exit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
