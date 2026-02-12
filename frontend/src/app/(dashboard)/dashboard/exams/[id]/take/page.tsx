'use client'

import React, { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ExamService, ExamAttempt, MockExam } from '@/services/exams'
import { ExamInterface } from '@/components/exams/ExamInterface'

export default function ExamTakePage() {
  const router = useRouter()
  const params = useParams()
  const examId = Number(params.id)

  const [exam, setExam] = useState<MockExam | null>(null)
  const [attempt, setAttempt] = useState<ExamAttempt | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const loadExam = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Load exam details and attempt
        const [examData, attemptData] = await Promise.all([
          ExamService.getExamDetail(examId),
          ExamService.startExam(examId),
        ])

        setExam(examData)
        setAttempt(attemptData)
      } catch (err) {
        console.error('Error loading exam:', err)
        setError('Failed to load exam. Please try again.')
      } finally {
        setIsLoading(false)
      }
    }

    if (examId) {
      loadExam()
    }
  }, [examId])

  const handleSubmitExam = async (
    responses: Record<string, number | string>,
    timeTaken: number
  ) => {
    try {
      setIsSubmitting(true)
      setError(null)

      const submission = {
        raw_responses: responses,
        time_taken_seconds: timeTaken,
      }

      const result = await ExamService.submitExam(examId, submission)

      // Redirect to results page
      router.push(`/dashboard/exams/${examId}/results`)
    } catch (err) {
      console.error('Error submitting exam:', err)
      setError('Failed to submit exam. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleExit = () => {
    router.back()
  }

  if (isLoading) {
    return (
      <div className="h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading exam...</p>
        </div>
      </div>
    )
  }

  if (error || !exam) {
    return (
      <div className="h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg p-8 max-w-md">
          <h2 className="text-xl font-bold text-red-600 mb-2">Error</h2>
          <p className="text-gray-600 mb-6">{error || 'Failed to load exam'}</p>
          <button
            onClick={() => router.back()}
            className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  return (
    <ExamInterface
      questions={exam.questions || []}
      durationMinutes={exam.duration_minutes}
      examTitle={exam.title}
      onSubmit={handleSubmitExam}
      onExit={handleExit}
      isSubmitting={isSubmitting}
    />
  )
}
