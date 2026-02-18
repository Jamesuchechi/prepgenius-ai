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
  onSubmit: (responses: Record<string, number | string>, timeTaken: number) => void
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
  const [responses, setResponses] = useState<Record<string, number | string>>({})
  const [answeredQuestions, setAnsweredQuestions] = useState(new Set<number>())
  const [timeElapsed, setTimeElapsed] = useState(0)
  const [showNavigator, setShowNavigator] = useState(true)
  const [flaggedQuestions, setFlaggedQuestions] = useState(new Set<number>())
  const [showExitConfirm, setShowExitConfirm] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [hasHeardAudio, setHasHeardAudio] = useState(false)
  const [autoPlayAttempted, setAutoPlayAttempted] = useState<number | null>(null)

  const currentQuestion = questions[currentQuestionIndex]
  const stimulus = currentQuestion.metadata || {}

  const handleSpeak = useCallback(() => {
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
      setHasHeardAudio(true) // Don't block user if TTS fails
    }
    window.speechSynthesis.speak(utterance)
  }, [stimulus.transcript])

  // Auto-play and Reset synthesis when question changes
  useEffect(() => {
    setHasHeardAudio(!stimulus.transcript) // If no transcript, answering is enabled

    if (stimulus.transcript && autoPlayAttempted !== currentQuestionIndex) {
      handleSpeak()
      setAutoPlayAttempted(currentQuestionIndex)
    }

    return () => window.speechSynthesis.cancel()
  }, [currentQuestionIndex, stimulus.transcript, handleSpeak, autoPlayAttempted])

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
    <div className="h-screen bg-gray-50 overflow-hidden font-sans">
      {/* Header */}
      <ExamTimer durationMinutes={durationMinutes} onTimeUp={handleTimeUp} />

      <div className="flex h-[calc(100vh-80px)]">
        {/* Sidebar - Desktop */}
        {showNavigator && (
          <div className="hidden md:block w-80 bg-gray-50 border-r border-gray-200 overflow-y-auto p-4 flex-shrink-0">
            <QuestionNavigator
              totalQuestions={questions.length}
              currentQuestion={currentQuestionIndex}
              answeredQuestions={answeredQuestions}
              onSelectQuestion={handleSelectQuestion}
              reviewMode={false}
            />
            {/* Legend/Summary */}
            <div className="mt-8 pt-8 border-t border-gray-200">
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-sm font-medium text-gray-600">
                  <div className="w-4 h-4 rounded bg-green-500"></div>
                  <span>Answered: {answeredQuestions.size}</span>
                </div>
                <div className="flex items-center gap-3 text-sm font-medium text-gray-600">
                  <div className="w-4 h-4 rounded bg-yellow-400"></div>
                  <span>Flagged: {flaggedQuestions.size}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto bg-[#f8fafc]">
          <div className="max-w-[75rem] mx-auto p-4 md:p-10">
            {/* Exam Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
              <div>
                <h1 className="text-4xl font-black text-[#1e293b] mb-3 tracking-tight">{examTitle}</h1>
                <div className="flex items-center gap-3">
                  <span className="bg-white px-4 py-1.5 rounded-full border border-slate-200 text-sm font-bold text-slate-500 shadow-sm">
                    QUESTION {currentQuestionIndex + 1} OF {questions.length}
                  </span>
                  <span className="bg-blue-600 text-white px-4 py-1.5 rounded-full text-sm font-black shadow-lg shadow-blue-200">
                    {currentQuestion.difficulty}
                  </span>
                </div>
              </div>

              <button
                onClick={handleToggleFlag}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all ${isFlagged
                  ? 'bg-yellow-400 text-white shadow-xl shadow-yellow-100 scale-105'
                  : 'bg-white text-slate-400 border border-slate-200 hover:border-slate-300'
                  }`}
              >
                <Flag className={`w-5 h-5 ${isFlagged ? 'fill-current' : ''}`} />
                {isFlagged ? 'FLAGGED FOR REVIEW' : 'FLAG QUESTION'}
              </button>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-10 items-start">
              {/* Stimulus Section */}
              {(stimulus.passage || stimulus.transcript) && (
                <div className="bg-white rounded-3xl p-8 md:p-12 border border-slate-100 shadow-2xl shadow-slate-200/50 xl:sticky xl:top-10 max-h-[75vh] flex flex-col">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-2xl shadow-inner">
                      {stimulus.passage ? '📖' : stimulus.transcript ? '🎧' : '📊'}
                    </div>
                    <div>
                      <h3 className="font-extrabold text-slate-800 uppercase tracking-widest text-xs">Test Material</h3>
                      <p className="font-black text-slate-400 text-sm">
                        {stimulus.passage ? 'Comprehension Passage' : stimulus.transcript ? 'Audio Examination Material' : 'Data Context (Graph/Chart)'}
                      </p>
                    </div>
                  </div>

                  {stimulus.passage && (
                    <div className="overflow-y-auto pr-6 text-slate-600 leading-[2] text-lg font-medium italic font-serif">
                      {stimulus.passage}
                    </div>
                  )}

                  {stimulus.data_table && (
                    <div className="overflow-y-auto pr-6">
                      <div className="bg-slate-50 rounded-2xl p-6 border-2 border-slate-100 font-mono text-sm uppercase text-slate-600 whitespace-pre-wrap">
                        {stimulus.data_table}
                      </div>
                    </div>
                  )}

                  {stimulus.transcript && (
                    <div className="flex flex-col items-center justify-center py-16 bg-slate-50 rounded-[2.5rem] border-4 border-dashed border-slate-100">
                      <button
                        onClick={handleSpeak}
                        disabled={isSpeaking}
                        className={`w-24 h-24 rounded-full flex items-center justify-center transition-all ${isSpeaking
                          ? 'bg-orange-500 text-white scale-110 animate-pulse shadow-2xl shadow-orange-200'
                          : 'bg-blue-600 text-white hover:scale-110 shadow-2xl shadow-blue-100'
                          }`}
                      >
                        {isSpeaking ? (
                          <div className="flex gap-1.5">
                            <div className="w-1.5 h-6 bg-white animate-[bounce_0.6s_infinite] [animation-delay:-0.3s]"></div>
                            <div className="w-1.5 h-10 bg-white animate-[bounce_0.6s_infinite] [animation-delay:-0.15s]"></div>
                            <div className="w-1.5 h-6 bg-white animate-[bounce_0.6s_infinite]"></div>
                          </div>
                        ) : (
                          <div className="w-0 h-0 border-t-[12px] border-t-transparent border-l-[20px] border-l-white border-b-[12px] border-b-transparent ml-2"></div>
                        )}
                      </button>
                      <p className={`mt-8 font-black tracking-widest text-xs ${isSpeaking ? 'text-orange-500' : 'text-slate-400'}`}>
                        {isSpeaking ? 'BROADCASTING...' : 'INITIALIZE AUDIO PLAYBACK'}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Question Card */}
              <div className={`bg-white rounded-3xl p-8 md:p-12 border border-slate-100 shadow-2xl shadow-slate-200/50 ${!(stimulus.passage || stimulus.transcript) ? 'xl:col-span-2 max-w-4xl mx-auto w-full' : ''}`}>
                <div className="mb-10">
                  <h2 className="text-2xl font-black text-slate-800 leading-snug">
                    {currentQuestion.content}
                  </h2>
                </div>

                {/* Options or Theory Input */}
                <div className="space-y-4 mb-12">
                  {(currentQuestion.question_type === 'THEORY' || currentQuestion.question_type === 'ESSAY') ? (
                    <div className="space-y-4">
                      <textarea
                        className={`w-full p-8 bg-slate-50 border-2 border-slate-100 rounded-[2rem] focus:ring-4 focus:ring-blue-100 focus:border-blue-600 focus:outline-none min-h-[400px] text-lg leading-relaxed font-medium transition-all ${!hasHeardAudio ? 'opacity-50 cursor-not-allowed' : ''}`}
                        placeholder={!hasHeardAudio ? "Listening to audio first..." : "Craft your response here..."}
                        readOnly={!hasHeardAudio}
                        value={(responses[currentQuestion.id] as string) || ''}
                        onChange={(e) => {
                          const val = e.target.value
                          setResponses((prev) => ({
                            ...prev,
                            [currentQuestion.id]: val,
                          }))
                          if (val.trim().length > 0) {
                            setAnsweredQuestions((prev) => new Set(prev).add(currentQuestionIndex))
                          } else {
                            setAnsweredQuestions((prev) => {
                              const newSet = new Set(prev)
                              newSet.delete(currentQuestionIndex)
                              return newSet
                            })
                          }
                        }}
                      />
                      <div className="flex justify-end pr-4 font-black text-[10px] tracking-widest text-slate-400 uppercase">
                        Word Count: {(responses[currentQuestion.id] as string || '').trim() ? (responses[currentQuestion.id] as string || '').trim().split(/\s+/).length : 0}
                      </div>
                    </div>
                  ) : (
                    currentQuestion.answers.map((answer, idx) => (
                      <button
                        key={answer.id}
                        onClick={() => handleSelectAnswer(answer.id)}
                        className={`w-full flex items-center gap-6 p-6 rounded-[1.5rem] border-2 transition-all duration-300 group text-left ${responses[currentQuestion.id] === answer.id
                          ? 'border-blue-600 bg-blue-50/50 scale-[1.02] shadow-xl shadow-blue-100/50'
                          : 'border-slate-100 hover:border-slate-200 bg-white'
                          }`}
                      >
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black transition-all ${responses[currentQuestion.id] === answer.id
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-100 text-slate-400 group-hover:bg-slate-200'
                          }`}>
                          {String.fromCharCode(65 + idx)}
                        </div>
                        <span className={`text-lg font-bold ${responses[currentQuestion.id] === answer.id ? 'text-blue-900' : 'text-slate-600'
                          }`}>
                          {answer.content}
                        </span>
                        {!hasHeardAudio && isSpeaking && (
                          <div className="absolute inset-0 bg-white/10 cursor-not-allowed z-10 rounded-[1.5rem]" />
                        )}
                      </button>
                    ))
                  )}
                  {!hasHeardAudio && isSpeaking && (
                    <div className="bg-orange-50 border border-orange-100 p-4 rounded-2xl flex items-center gap-3 animate-pulse">
                      <span className="text-xl">📻</span>
                      <p className="text-sm font-bold text-orange-700 uppercase tracking-wider">
                        Listening in progress... Options will enable once audio finishes.
                      </p>
                    </div>
                  )}
                </div>

                {/* Footer Controls */}
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <button
                    onClick={handlePrevQuestion}
                    disabled={currentQuestionIndex === 0}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed text-slate-600 font-black rounded-2xl transition-all uppercase tracking-widest text-xs"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                  </button>

                  <div className="flex-1"></div>

                  {currentQuestionIndex < questions.length - 1 ? (
                    <button
                      onClick={handleNextQuestion}
                      className="w-full sm:w-auto flex items-center justify-center gap-2 px-10 py-5 bg-blue-600 text-white font-black rounded-[1.5rem] hover:scale-105 transition-all shadow-2xl shadow-blue-200 uppercase tracking-widest text-xs"
                    >
                      Next Module
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </button>
                  ) : (
                    <button
                      onClick={handleSubmitExam}
                      disabled={isSubmitting || answeredQuestions.size === 0}
                      className="w-full sm:w-auto flex items-center justify-center gap-2 px-12 py-5 bg-green-600 text-white font-black rounded-[1.5rem] hover:scale-105 transition-all shadow-2xl shadow-green-200 uppercase tracking-widest text-xs"
                    >
                      <Send className="w-5 h-5 mr-1" />
                      {isSubmitting ? 'Finalizing...' : 'Complete Examination'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Global Nav Toggle */}
        <button
          onClick={() => setShowNavigator(!showNavigator)}
          className="fixed bottom-10 right-10 w-16 h-16 bg-white border border-slate-200 hover:border-slate-300 text-slate-800 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] transition-all z-40 flex items-center justify-center"
        >
          {showNavigator ? <span className="text-xl font-black">×</span> : <span className="text-xl font-black">☰</span>}
        </button>
      </div>

      {/* Exit Modal */}
      {showExitConfirm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[3rem] p-10 md:p-14 max-w-xl mx-auto shadow-2xl animate-[fadeInUp_0.3s_ease-out]">
            <div className="text-6xl mb-8">⚠️</div>
            <h3 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">Abandon Examination?</h3>
            <p className="text-slate-500 font-medium leading-[1.8] mb-10 text-lg">
              Terminating the session now will forfeit your current assessment data. Are you absolutely certain you wish to withdraw?
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => setShowExitConfirm(false)}
                className="flex-1 px-8 py-5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-black rounded-[1.5rem] transition-all uppercase tracking-widest text-xs"
              >
                No, Continue Test
              </button>
              <button
                onClick={() => {
                  setShowExitConfirm(false)
                  onExit?.()
                }}
                className="flex-1 px-8 py-5 bg-red-600 text-white font-black rounded-[1.5rem] hover:scale-105 transition-all shadow-2xl shadow-red-200 uppercase tracking-widest text-xs"
              >
                Yes, Abandon
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
