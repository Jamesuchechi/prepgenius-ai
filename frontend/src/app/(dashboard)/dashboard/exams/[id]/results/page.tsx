'use client'

import React, { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ExamService, ExamResult } from '@/services/exams'
import { ExamResults } from '@/components/exams/ExamResults'

export default function ExamResultsPage() {
  const router = useRouter()
  const params = useParams()
  const examId = Number(params.id)

  const [result, setResult] = useState<ExamResult | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadResult = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const result = await ExamService.getExamResult(examId)
        setResult(result)
      } catch (err) {
        console.error('Error loading exam result:', err)
        setError('Failed to load exam result. Please try again.')
      } finally {
        setIsLoading(false)
      }
    }

    if (examId) {
      loadResult()
    }
  }, [examId])

  const handleRetake = () => {
    router.push(`/dashboard/exams/${examId}/take`)
  }

  const handleBackToDashboard = () => {
    router.push('/dashboard/exams')
  }

  const handleReview = () => {
    // Would navigate to review page if implemented
    console.log('Review functionality to be implemented')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your results...</p>
        </div>
      </div>
    )
  }

  if (error || !result) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg p-8 max-w-md">
          <h2 className="text-xl font-bold text-red-600 mb-2">Error</h2>
          <p className="text-gray-600 mb-6">{error || 'Failed to load results'}</p>
          <button
            onClick={handleBackToDashboard}
            className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <ExamResults
      result={result}
      onReview={handleReview}
      onRetake={handleRetake}
      onBackToDashboard={handleBackToDashboard}
    />
  )
}
