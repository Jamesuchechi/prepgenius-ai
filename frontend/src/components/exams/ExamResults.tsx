'use client'

import React, { useState } from 'react'
import { CheckCircle2, XCircle, HelpCircle, TrendingUp, BarChart3, AlertCircle, Sparkles } from 'lucide-react'
import { ExamResult, Question, ExamService } from '@/services/exams'
import { PerformanceChart } from './PerformanceChart'

interface ExamResultsProps {
  result: ExamResult
  questions?: Question[]
  onReview?: () => void
  onRetake?: () => void
  onBackToDashboard?: () => void
}

export function ExamResults({
  result,
  questions = [],
  onReview,
  onRetake,
  onBackToDashboard,
}: ExamResultsProps) {
  const { total_score, percentage, grade, passed, recommendations } = result
  const { correct, incorrect, unanswered, total } = result.detailed_breakdown.summary

  const performanceData = Object.entries(result.performance_summary).map(([topic, perf]: [string, any]) => ({
    name: topic,
    mastery: perf.mastery_level || 0,
    status: perf.status || 'weak',
  }))

  const [explaining, setExplaining] = useState<string | null>(null)
  const [localExplanations, setLocalExplanations] = useState<Record<string, string>>({})

  const handleExplain = async (qId: string, qData: any) => {
    try {
      setExplaining(qId)
      const data = await ExamService.explainQuestion(Number(qData.question_id), {
        user_answer: qData.user_answer_id,
        correct_answer: qData.correct_answer_text
      })
      setLocalExplanations(prev => ({
        ...prev,
        [qId]: data.explanation
      }))
    } catch (err) {
      console.error("Failed to explain", err)
    } finally {
      setExplaining(null)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Score Card */}
        <div
          className={`bg-gradient-to-br rounded-xl p-8 mb-8 text-white shadow-lg ${passed ? 'from-green-500 to-green-600' : 'from-red-500 to-red-600'
            }`}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {/* Score Circle */}
            <div className="flex items-center justify-center">
              <div className="relative w-32 h-32">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="54" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="8" />
                  <circle
                    cx="60"
                    cy="60"
                    r="54"
                    fill="none"
                    stroke="white"
                    strokeWidth="8"
                    strokeDasharray={`${(percentage / 100) * 339.3} 339.3`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-bold">{grade}</span>
                  <span className="text-sm opacity-90">{percentage.toFixed(1)}%</span>
                </div>
              </div>
            </div>

            {/* Status & Details */}
            <div className="col-span-1 md:col-span-2">
              <div className="mb-6">
                <h1 className="text-3xl font-bold mb-2">
                  {passed ? '🎉 Excellent! You Passed!' : '❌ You Did Not Pass'}
                </h1>
                <p className="text-lg opacity-90 mb-4">
                  {passed
                    ? `Great job! You scored ${total_score} out of ${total} points.`
                    : `You need to improve. You scored ${total_score} out of ${total} points.`}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white bg-opacity-20 rounded-lg p-4">
                  <p className="text-sm opacity-90">Correct</p>
                  <p className="text-2xl font-bold">{correct}</p>
                </div>
                <div className="bg-white bg-opacity-20 rounded-lg p-4">
                  <p className="text-sm opacity-90">Incorrect</p>
                  <p className="text-2xl font-bold">{incorrect}</p>
                </div>
                <div className="bg-white bg-opacity-20 rounded-lg p-4">
                  <p className="text-sm opacity-90">Unanswered</p>
                  <p className="text-2xl font-bold">{unanswered}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-6 border-t border-white border-opacity-30">
            {onReview && (
              <button
                onClick={onReview}
                className="flex-1 px-6 py-3 bg-white text-green-600 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
              >
                Review Answers
              </button>
            )}
            {onRetake && (
              <button
                onClick={onRetake}
                className="flex-1 px-6 py-3 bg-white text-green-600 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
              >
                Retake Exam
              </button>
            )}
            {onBackToDashboard && (
              <button
                onClick={onBackToDashboard}
                className="flex-1 px-6 py-3 bg-white text-green-600 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
              >
                Back to Dashboard
              </button>
            )}
          </div>
        </div>

        {/* Recommendations */}
        {recommendations && recommendations.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900">Recommendations</h2>
            </div>
            <ul className="space-y-3">
              {recommendations.map((rec, index) => (
                <li key={index} className="flex gap-3 text-gray-700">
                  <span className="text-blue-600 font-semibold mt-1">•</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Performance by Topic */}
        {performanceData.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <BarChart3 className="w-6 h-6 text-purple-600" />
              <h2 className="text-xl font-semibold text-gray-900">Performance by Topic</h2>
            </div>
            <PerformanceChart data={performanceData} />
          </div>
        )}

        {/* Detailed Breakdown */}
        {result.detailed_breakdown.questions && Object.keys(result.detailed_breakdown.questions).length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <HelpCircle className="w-6 h-6 text-indigo-600" />
              <h2 className="text-xl font-semibold text-gray-900">Question Details</h2>
            </div>

            <div className="space-y-4 max-h-96 overflow-y-auto">
              {Object.entries(result.detailed_breakdown.questions).map(
                ([qId, qData]: [string, any], idx) => {
                  const existingExpl = qData.explanation
                  const currentExpl = localExplanations[qId] || existingExpl
                  const isPoorExplanation = !currentExpl || currentExpl.length < 10

                  return (
                    <div
                      key={qId}
                      className={`border rounded-lg p-4 ${qData.is_correct ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                        }`}
                    >
                      <div className="flex items-start gap-3 mb-2">
                        {qData.is_correct ? (
                          <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-1" />
                        )}
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900 mb-1">
                            Question {idx + 1}
                            {qData.topic && (
                              <span className="ml-2 text-sm font-normal text-gray-600">
                                • {qData.topic}
                              </span>
                            )}
                          </p>
                          <p className="text-sm text-gray-700 mb-2">{qData.question_text}</p>
                          {/* AI Theory Grading Display */}
                          {qData.user_answer_text && qData.critique && (
                            <div className="mt-3 bg-white border border-blue-100 rounded-lg p-3 shadow-sm">
                              <div className="flex items-center gap-2 mb-2">
                                <Sparkles className="w-4 h-4 text-blue-600" />
                                <span className="text-sm font-bold text-blue-900">AI Detailed Critique</span>
                                <span className="ml-auto bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">
                                  Score: {qData.score}/10
                                </span>
                              </div>
                              <p className="text-sm text-blue-800 mb-3 italic">"{qData.user_answer_text}"</p>

                              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-3">
                                <div className="bg-blue-50 p-2 rounded">
                                  <p className="text-[10px] font-bold text-blue-600 uppercase">Accuracy</p>
                                  <p className="text-sm text-blue-900">{qData.accuracy}</p>
                                </div>
                                <div className="bg-blue-50 p-2 rounded">
                                  <p className="text-[10px] font-bold text-blue-600 uppercase">Completeness</p>
                                  <p className="text-sm text-blue-900">{qData.completeness}</p>
                                </div>
                                <div className="bg-blue-50 p-2 rounded">
                                  <p className="text-[10px] font-bold text-blue-600 uppercase">Clarity</p>
                                  <p className="text-sm text-blue-900">{qData.clarity}</p>
                                </div>
                              </div>

                              <p className="text-sm text-gray-700 leading-relaxed mb-3">
                                <span className="font-bold text-blue-900">Critique:</span> {qData.critique}
                              </p>

                              {qData.improvement_tips && qData.improvement_tips.length > 0 && (
                                <div className="border-t border-blue-50 pt-2">
                                  <p className="text-xs font-bold text-blue-600 mb-1">Improvement Tips:</p>
                                  <ul className="text-xs text-gray-600 list-disc list-inside">
                                    {qData.improvement_tips.map((tip: string, tIdx: number) => (
                                      <li key={tIdx}>{tip}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Original MCQ Display (only if not a critique-style theory) */}
                          {!qData.critique && (
                            <>
                              {qData.is_correct ? (
                                <p className="text-sm text-green-700">
                                  <span className="font-semibold">Correct Answer:</span>{' '}
                                  {qData.correct_answer_text}
                                </p>
                              ) : (
                                <>
                                  {qData.user_answer_id && (
                                    <p className="text-sm text-red-700 mb-1">
                                      <span className="font-semibold">Your Answer:</span> Wrong
                                    </p>
                                  )}
                                  <p className="text-sm text-green-700">
                                    <span className="font-semibold">Correct Answer:</span>{' '}
                                    {qData.correct_answer_text}
                                  </p>
                                </>
                              )}
                            </>
                          )}

                          {/* Explanation Section */}
                          {currentExpl && !isPoorExplanation && (
                            <p className="text-sm text-gray-700 mt-2 italic border-l-2 border-gray-300 pl-3">
                              <span className="font-semibold not-italic">Explanation:</span> {currentExpl}
                            </p>
                          )}

                          {/* Explain Button */}
                          {isPoorExplanation && (
                            <div className="mt-2">
                              <button
                                onClick={() => handleExplain(qId, qData)}
                                disabled={explaining === qId}
                                className="text-xs flex items-center gap-1 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors disabled:opacity-50"
                              >
                                <Sparkles className="w-3 h-3" />
                                {explaining === qId ? 'Generating...' : 'Explain with AI'}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                }
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
