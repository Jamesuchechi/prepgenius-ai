'use client'

import React, { useState, useEffect } from 'react'
import { studyPlanApi } from '@/services/study-plan'
import { getExamTypes, getSubjects } from '@/lib/api'
import { ExamType, Subject } from '@/lib/api'
import { CreateStudyPlanRequest } from '@/types/study-plan'

interface PlanGeneratorProps {
  onSuccess?: (planId: number) => void
  onCancel?: () => void
}

export default function PlanGenerator({ onSuccess, onCancel }: PlanGeneratorProps) {
  const [loading, setLoading] = useState(false)
  const [examTypes, setExamTypes] = useState<ExamType[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [selectedSubjects, setSelectedSubjects] = useState<number[]>([])
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    exam_type: '',
    exam_date: '',
    study_hours_per_day: 2.5,
    study_days_per_week: 6,
    difficulty_preference: 'intermediate',
    include_weekends: false,
    plan_name: ''
  })

  // Load exam types and subjects
  useEffect(() => {
    const loadData = async () => {
      try {
        const [types, subs] = await Promise.all([
          getExamTypes(),
          getSubjects()
        ])
        setExamTypes(types)
        setSubjects(subs)
      } catch (err) {
        setError('Failed to load exam types and subjects')
        console.error(err)
      }
    }
    loadData()
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    const inputValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    setFormData(prev => ({
      ...prev,
      [name]: inputValue
    }))
  }

  const handleSubjectToggle = (subjectId: number) => {
    setSelectedSubjects(prev =>
      prev.includes(subjectId)
        ? prev.filter(id => id !== subjectId)
        : [...prev, subjectId]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (!formData.exam_type) {
        throw new Error('Exam type is required')
      }
      if (!formData.exam_date) {
        throw new Error('Exam date is required')
      }
      if (selectedSubjects.length === 0) {
        throw new Error('Select at least one subject')
      }

      const requestData: CreateStudyPlanRequest = {
        exam_type_id: parseInt(formData.exam_type),
        exam_date: formData.exam_date,
        subject_ids: selectedSubjects,
        study_hours_per_day: formData.study_hours_per_day,
        study_days_per_week: formData.study_days_per_week,
        difficulty_preference: formData.difficulty_preference as any,
        include_weekends: formData.include_weekends,
        name: formData.plan_name || undefined
      }

      const plan = await studyPlanApi.generatePlan(requestData)
      
      if (onSuccess) {
        onSuccess(plan.id)
      }
    } catch (err: any) {
      setError(err.message || 'Failed to generate study plan')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="bg-white rounded-2xl p-8 border-2 border-gray-100 max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-display font-extrabold text-black mb-2">
          Create Your Study Plan ✨
        </h2>
        <p className="text-gray-600">
          AI-powered personalized study plan to help you ace your exam
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Exam Type */}
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-black mb-3">
              Exam Type *
            </label>
            <select
              name="exam_type"
              value={formData.exam_type}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-orange-500 bg-white"
              required
            >
              <option value="">Select exam type...</option>
              {examTypes.map(exam => (
                <option key={exam.id} value={exam.id}>
                  {exam.full_name} ({exam.level})
                </option>
              ))}
            </select>
          </div>

          {/* Exam Date */}
          <div>
            <label className="block text-sm font-semibold text-black mb-3">
              Target Exam Date *
            </label>
            <input
              type="date"
              name="exam_date"
              value={formData.exam_date}
              onChange={handleInputChange}
              min={today}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-orange-500"
              required
            />
          </div>
        </div>

        {/* Plan Name */}
        <div>
          <label className="block text-sm font-semibold text-black mb-3">
            Plan Name (optional)
          </label>
          <input
            type="text"
            name="plan_name"
            value={formData.plan_name}
            onChange={handleInputChange}
            placeholder="e.g., UPSC 2026 Attempt 2"
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Study Schedule */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl">
          <h3 className="font-semibold text-black mb-4">Study Schedule</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hours per day
              </label>
              <input
                type="number"
                name="study_hours_per_day"
                value={formData.study_hours_per_day}
                onChange={handleInputChange}
                step="0.5"
                min="0.5"
                max="12"
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Days per week
              </label>
              <input
                type="number"
                name="study_days_per_week"
                value={formData.study_days_per_week}
                onChange={handleInputChange}
                min="1"
                max="7"
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
          <label className="flex items-center mt-4 cursor-pointer">
            <input
              type="checkbox"
              name="include_weekends"
              checked={formData.include_weekends}
              onChange={handleInputChange}
              className="w-5 h-5 text-blue-500 rounded"
            />
            <span className="ml-3 text-sm text-gray-700">Include weekends in schedule</span>
          </label>
        </div>

        {/* Difficulty Level */}
        <div>
          <label className="block text-sm font-semibold text-black mb-3">
            Difficulty Level
          </label>
          <div className="grid grid-cols-3 gap-3">
            {['beginner', 'intermediate', 'advanced'].map(level => (
              <label
                key={level}
                className={`relative flex items-center p-4 border-2 rounded-lg cursor-pointer transition ${
                  formData.difficulty_preference === level
                    ? 'border-orange-500 bg-orange-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="difficulty_preference"
                  value={level}
                  checked={formData.difficulty_preference === level}
                  onChange={handleInputChange}
                  className="w-5 h-5 text-orange-500"
                />
                <span className="ml-3 capitalize font-medium text-gray-900">
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Subjects Selection */}
        <div>
          <label className="block text-sm font-semibold text-black mb-4">
            Subjects to Study ({selectedSubjects.length} selected) *
          </label>
          <div className="grid md:grid-cols-3 gap-3 max-h-64 overflow-y-auto p-1">
            {subjects.map(subject => (
              <label
                key={subject.id}
                className={`relative flex items-center p-4 border-2 rounded-lg cursor-pointer transition ${
                  selectedSubjects.includes(subject.id)
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedSubjects.includes(subject.id)}
                  onChange={() => handleSubjectToggle(subject.id)}
                  className="w-5 h-5 text-blue-500 rounded"
                />
                <span className="ml-3 text-sm font-medium text-gray-900">
                  {subject.name}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-4 pt-6">
          <button
            type="submit"
            disabled={loading || selectedSubjects.length === 0}
            className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:from-gray-300 disabled:to-gray-300 text-white font-semibold py-3 px-6 rounded-lg transition duration-300 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                Generating...
              </>
            ) : (
              <>
                🚀 Generate My Study Plan
              </>
            )}
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-3 border-2 border-gray-200 hover:border-gray-300 rounded-lg font-semibold text-gray-700 transition"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  )
}
