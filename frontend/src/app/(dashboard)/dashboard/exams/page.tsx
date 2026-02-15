'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { BookOpen, Zap, Trophy, Info } from 'lucide-react'
import { ExamService, MockExam } from '@/services/exams'
import { ExamCard } from '@/components/exams/ExamCard'
import { ContentService } from '@/services/content'

export default function ExamsPage() {
  const router = useRouter()
  const [exams, setExams] = useState<MockExam[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isStarting, setIsStarting] = useState<number | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [subjects, setSubjects] = useState<any[]>([])

  useEffect(() => {
    const loadExams = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const data = await ExamService.getExams()
        setExams(data)
      } catch (err) {
        console.error('Error loading exams:', err)
        setError('Failed to load exams. Please try again.')
      } finally {
        setIsLoading(false)
      }
    }

    loadExams()
  }, [])


  useEffect(() => {
    const loadSubjects = async () => {
      try {
        const data = await ContentService.getSubjects()
        setSubjects(data || [])
      } catch (err) {
        // silently ignore - subjects are optional
      }
    }
    loadSubjects()
  }, [])

  const [stats, setStats] = useState({ total_attempts: 0, best_score: 0 })

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await ExamService.getUserStats()
        setStats(data)
      } catch (err) {
        console.error('Failed to load stats', err)
      }
    }
    loadStats()
  }, [exams]) // Reload stats when exams list changes (e.g. after create/delete), though strictly should depend on attempts. On mount is fine for now, or maybe refresh on focus.

  const handleStartExam = async (exam: MockExam) => {
    try {
      setIsStarting(exam.id)
      const attempt = await ExamService.startExam(exam.id)
      // Redirect to exam taking page
      router.push(`/dashboard/exams/${exam.id}/take`)
    } catch (err) {
      console.error('Error starting exam:', err)
      setError('Failed to start exam. Please try again.')
    } finally {
      setIsStarting(null)
    }
  }

  const handleDeleteExam = async (exam: MockExam) => {
    if (!confirm(`Are you sure you want to delete "${exam.title}"? Questions will be preserved.`)) {
      return
    }

    try {
      setIsLoading(true) // Show global loading or handle individual deleting state
      await ExamService.deleteExam(exam.id)
      setExams((prev) => prev.filter((e) => e.id !== exam.id))
    } catch (err) {
      console.error('Error deleting exam:', err)
      setError('Failed to delete exam. You may not have permission.')
      setIsLoading(false)
    } finally {
      setIsLoading(false)
    }
  }



  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)
  const [createMode, setCreateMode] = useState<'past_questions' | 'ai_generated'>('ai_generated')
  const [createSubjectName, setCreateSubjectName] = useState<string>('')
  const [createExamYear, setCreateExamYear] = useState<number>(new Date().getFullYear())
  const [createExamFormat, setCreateExamFormat] = useState<string>('JAMB')
  const [createNumQuestions, setCreateNumQuestions] = useState<number>(60)
  const [createDurationMinutes, setCreateDurationMinutes] = useState<number>(60)
  const [difficultyEasy, setDifficultyEasy] = useState<number>(20)
  const [difficultyMedium, setDifficultyMedium] = useState<number>(60)
  const [difficultyHard, setDifficultyHard] = useState<number>(20)
  const presets = [
    { key: 'JAMB', label: 'JAMB (60q • 60m)', questions: 60, duration: 60, difficulty: { E: 20, M: 60, H: 20 } },
    { key: 'WAEC', label: 'WAEC (50q • 120m)', questions: 50, duration: 120, difficulty: { E: 30, M: 50, H: 20 } },
    { key: 'NABTEB', label: 'NABTEB (50q • 120m)', questions: 50, duration: 120, difficulty: { E: 30, M: 50, H: 20 } },
    { key: 'IGCSE', label: 'IGCSE (40q • 90m)', questions: 40, duration: 90, difficulty: { E: 30, M: 50, H: 20 } },
    { key: 'SAT', label: 'SAT (70q • 180m)', questions: 70, duration: 180, difficulty: { E: 20, M: 60, H: 20 } },
    { key: 'OTHER', label: 'Other (custom)', questions: 60, duration: 60, difficulty: { E: 20, M: 60, H: 20 } },
  ]

  const applyPreset = (key: string) => {
    const p = presets.find((x) => x.key === key)
    if (!p) return
    setCreateExamFormat(p.key)
    setCreateNumQuestions(p.questions)
    setCreateDurationMinutes(p.duration)
    setDifficultyEasy(p.difficulty.E)
    setDifficultyMedium(p.difficulty.M)
    setDifficultyHard(p.difficulty.H)
  }

  const handleCreateExam = async () => {
    setCreateError(null)
    if (!createSubjectName || createSubjectName.trim().length === 0) {
      setCreateError('Please enter a subject')
      return
    }

    if (!createExamFormat || createExamFormat.trim().length === 0) {
      setCreateError('Please select an exam format')
      return
    }

    if (createMode === 'ai_generated') {
      const sum = difficultyEasy + difficultyMedium + difficultyHard
      if (sum !== 100) {
        setCreateError('Difficulty percentages must sum to 100')
        return
      }
    }

    try {
      setCreating(true)
      if (createMode === 'past_questions') {
        // Past questions mode: fetch from ALOC by subject + exam format + year
        await ExamService.createExam({
          subject_name: createSubjectName.trim(),
          exam_format: createExamFormat.trim(),
          mode: 'past_questions',
          year: createExamYear,
        })
      } else {
        // AI Generated mode: use format + difficulty distribution
        await ExamService.createExam({
          subject_name: createSubjectName.trim(),
          exam_format: createExamFormat.trim(),
          num_questions: createNumQuestions,
          duration_minutes: createDurationMinutes,
          difficulty_distribution: {
            EASY: difficultyEasy,
            MEDIUM: difficultyMedium,
            HARD: difficultyHard,
          },
          mode: 'ai_generated',
        })
      }
      // refresh exams list
      const data = await ExamService.getExams()
      setExams(data)
      setShowCreateModal(false)
      // reset form
      setCreateSubjectName('')
      setCreateExamYear(new Date().getFullYear())
      setCreateExamFormat('JAMB')
      setCreateNumQuestions(60)
      setCreateDurationMinutes(60)
      setDifficultyEasy(20)
      setDifficultyMedium(60)
      setDifficultyHard(20)
      setCreateMode('ai_generated')
    } catch (err: any) {
      console.error('Create exam error:', err)
      console.error('Error response:', err.response)

      // Try to extract backend error message
      let errorMessage = 'Failed to create exam. Please try again.'

      if (err.response?.data?.error) {
        errorMessage = err.response.data.error
      } else if (err.response?.data?.detail) {
        errorMessage = err.response.data.detail
      } else if (typeof err.response?.data === 'string') {
        errorMessage = err.response.data
      } else if (err.message) {
        errorMessage = err.message
      }

      // Provide user-friendly message
      if (errorMessage.includes('Could not find past questions') || errorMessage.includes('No past exam questions found')) {
        errorMessage = `${errorMessage}\n\nPlease try:\n• A different subject\n• A different year\n• A different exam format\n• Or use "AI Generated" mode instead`
      }

      setCreateError(errorMessage)
    } finally {
      setCreating(false)
    }
  }

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-48 bg-gray-200 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Mock Exams</h1>
          <p className="text-lg text-gray-600">
            Practice with our comprehensive mock exams designed to match real exam formats.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow-sm hover:bg-blue-700"
          >
            Create Exam
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 uppercase">Total Exams</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{exams.length}</p>
            </div>
            <BookOpen className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 uppercase">Your Attempts</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats.total_attempts}</p>
            </div>
            <Zap className="w-8 h-8 text-yellow-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 uppercase">Best Score</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats.best_score}%</p>
            </div>
            <Trophy className="w-8 h-8 text-green-600" />
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
          <div className="w-full max-w-lg bg-white rounded-lg p-6 shadow-lg max-h-96 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Create Mock Exam</h2>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-500">Close</button>
            </div>

            {createError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                <div className="font-semibold mb-1">Error Creating Exam</div>
                <div>{createError}</div>
              </div>
            )}

            <div className="space-y-3">
              {/* Mode Selector */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Exam Type</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCreateMode('past_questions')}
                    className={`flex-1 px-3 py-2 rounded-lg border transition-colors ${createMode === 'past_questions'
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-700 border-gray-300'
                      }`}
                  >
                    Past Questions
                  </button>
                  <button
                    onClick={() => setCreateMode('ai_generated')}
                    className={`flex-1 px-3 py-2 rounded-lg border transition-colors ${createMode === 'ai_generated'
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-700 border-gray-300'
                      }`}
                  >
                    AI Generated
                  </button>
                </div>
              </div>

              {/* Subject (always shown) */}
              <div>
                <label className="block text-sm text-gray-700 mb-1">Subject</label>
                <input
                  list="subjects-list"
                  value={createSubjectName}
                  onChange={(e) => setCreateSubjectName(e.target.value)}
                  placeholder={createMode === 'past_questions' ? 'e.g. Biology, Mathematics' : 'Type a subject (e.g. Biology, World History)'}
                  className="w-full border rounded-lg p-2"
                />
                <datalist id="subjects-list">
                  {subjects.map((s) => (
                    <option key={s.id} value={s.name} />
                  ))}
                </datalist>
                <p className="text-xs text-gray-400 mt-1">
                  {createMode === 'past_questions'
                    ? 'Select a subject to fetch past exam questions. If past questions are unavailable, AI-generated questions matching the format will be created instead.'
                    : 'Type any subject — AI will generate questions if needed.'}
                </p>
              </div>

              {/* Past Questions Mode */}
              {createMode === 'past_questions' && (
                <>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Exam Board</label>
                    <select
                      value={createExamFormat}
                      onChange={(e) => setCreateExamFormat(e.target.value)}
                      className="w-full border rounded-lg p-2"
                    >
                      <option value="JAMB">JAMB (Nigeria)</option>
                      <option value="WAEC">WAEC (Nigeria)</option>
                      <option value="NABTEB">NABTEB (Nigeria)</option>
                      <option value="NECO">NECO (Nigeria)</option>
                      <option value="IGCSE">IGCSE</option>
                      <option value="SAT">SAT</option>
                      <option value="OTHER">Other</option>
                    </select>
                    <p className="text-xs text-gray-400 mt-1">Select the exam board. Data availability depends on our ALOC database.</p>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Exam Year</label>
                    <input
                      type="number"
                      min={2000}
                      max={new Date().getFullYear()}
                      value={createExamYear}
                      onChange={(e) => setCreateExamYear(Number(e.target.value))}
                      className="w-full border rounded-lg p-2"
                    />
                    <p className="text-xs text-gray-400 mt-1">Select the year for past exam questions. If unavailable, AI will generate questions based on that format's style.</p>
                  </div>
                </>
              )}

              {/* AI Generated Mode */}
              {createMode === 'ai_generated' && (
                <>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1 flex items-center">
                      Exam Format
                      <span title="If the format is unknown the server will create an ExamBoard/ExamType automatically. Use 'Other' for custom formats.">
                        <Info className="ml-2 w-4 h-4 text-gray-400" />
                      </span>
                    </label>
                    <select
                      value={createExamFormat}
                      onChange={(e) => setCreateExamFormat(e.target.value)}
                      className="w-full border rounded-lg p-2"
                    >
                      <option value="JAMB">JAMB (Nigeria)</option>
                      <option value="WAEC">WAEC (Nigeria)</option>
                      <option value="NABTEB">NABTEB (Nigeria)</option>
                      <option value="IGCSE">IGCSE</option>
                      <option value="SAT">SAT</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">Questions</label>
                      <input
                        type="number"
                        value={createNumQuestions}
                        onChange={(e) => setCreateNumQuestions(Number(e.target.value))}
                        className="w-full border rounded-lg p-2"
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-gray-700 mb-1">Duration (minutes)</label>
                      <input
                        type="number"
                        value={createDurationMinutes}
                        onChange={(e) => setCreateDurationMinutes(Number(e.target.value))}
                        className="w-full border rounded-lg p-2"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">Easy %</label>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={difficultyEasy}
                        onChange={(e) => setDifficultyEasy(Number(e.target.value))}
                        className="w-full border rounded-lg p-2"
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-gray-700 mb-1">Medium %</label>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={difficultyMedium}
                        onChange={(e) => setDifficultyMedium(Number(e.target.value))}
                        className="w-full border rounded-lg p-2"
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-gray-700 mb-1">Hard %</label>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={difficultyHard}
                        onChange={(e) => setDifficultyHard(Number(e.target.value))}
                        className="w-full border rounded-lg p-2"
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="flex items-center justify-end gap-3 mt-4">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateExam}
                  disabled={creating}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50"
                >
                  {creating ? 'Creating...' : 'Create Exam'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}



      {/* Exams Grid */}
      {exams.length === 0 ? (
        <div className="text-center py-12">
          <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">No exams available yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {exams.map((exam) => (
            <ExamCard
              key={exam.id}
              exam={exam}
              onStart={() => handleStartExam(exam)}
              onDelete={() => handleDeleteExam(exam)}
              isStarting={isStarting === exam.id}
            />
          ))}
        </div>
      )}
    </div>
  )
}
