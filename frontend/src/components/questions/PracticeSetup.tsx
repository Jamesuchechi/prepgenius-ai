'use client'

import React, { useState, useEffect } from 'react'
import { getExamTypes, getSubjects, getTopics, ExamType, Subject, Topic } from '../../lib/api'
import Button from '../ui/Button'
import DifficultySelector from './DifficultySelector'

interface PracticeSetupProps {
    onStart: (config: {
        subjectId: number
        topicId: number
        examTypeId: number
        difficulty: string
        count: number
    }) => void
}

export default function PracticeSetup({ onStart }: PracticeSetupProps) {
    const [examTypes, setExamTypes] = useState<ExamType[]>([])
    const [subjects, setSubjects] = useState<Subject[]>([])
    const [topics, setTopics] = useState<Topic[]>([])

    const [selectedExamType, setSelectedExamType] = useState<string>('')
    const [selectedSubject, setSelectedSubject] = useState<string>('')
    const [selectedTopic, setSelectedTopic] = useState<string>('')
    const [difficulty, setDifficulty] = useState<string>('MEDIUM')
    const [count, setCount] = useState<number>(5)

    const [loading, setLoading] = useState(true)
    const [loadingTopics, setLoadingTopics] = useState(false)

    useEffect(() => {
        async function loadInitialData() {
            try {
                const [examTypesData, subjectsData] = await Promise.all([
                    getExamTypes(),
                    getSubjects()
                ])
                setExamTypes(examTypesData)
                setSubjects(subjectsData)
            } catch (error) {
                console.error('Failed to load setup data:', error)
            } finally {
                setLoading(false)
            }
        }
        loadInitialData()
    }, [])

    useEffect(() => {
        async function loadTopics() {
            if (!selectedSubject) {
                setTopics([])
                setSelectedTopic('')
                return
            }

            setLoadingTopics(true)
            try {
                const topicsData = await getTopics(Number(selectedSubject))
                setTopics(topicsData)
                if (topicsData.length > 0) {
                    setSelectedTopic(topicsData[0].id.toString())
                }
            } catch (error) {
                console.error('Failed to load topics:', error)
            } finally {
                setLoadingTopics(false)
            }
        }
        loadTopics()
    }, [selectedSubject])

    const handleStart = () => {
        if (!selectedSubject || !selectedTopic || !selectedExamType) {
            alert('Please select all required fields.')
            return
        }

        onStart({
            subjectId: Number(selectedSubject),
            topicId: Number(selectedTopic),
            examTypeId: Number(selectedExamType),
            difficulty,
            count
        })
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <div className="w-12 h-12 border-4 border-[var(--orange)] border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-[var(--gray-dark)] font-medium">Preparing your practice environment...</p>
            </div>
        )
    }

    return (
        <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-xl shadow-gray-200/50">
                <div className="mb-8">
                    <h2 className="font-display text-2xl font-extrabold text-[var(--black)] mb-2">Configure Practice Session</h2>
                    <p className="text-[var(--gray-dark)]">AI will generate high-quality questions based on your selection.</p>
                </div>

                <div className="space-y-6">
                    {/* Exam Type */}
                    <div>
                        <label className="block text-sm font-bold text-[var(--black)] mb-2">Exam Type</label>
                        <select
                            value={selectedExamType}
                            onChange={(e) => setSelectedExamType(e.target.value)}
                            className="w-full h-12 px-4 rounded-xl border-2 border-gray-100 focus:border-[var(--orange)] focus:outline-none transition-colors appearance-none bg-gray-50/50"
                        >
                            <option value="">Select Exam</option>
                            {examTypes.map((et) => (
                                <option key={et.id} value={et.id}>{et.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Subject */}
                    <div>
                        <label className="block text-sm font-bold text-[var(--black)] mb-2">Subject</label>
                        <select
                            value={selectedSubject}
                            onChange={(e) => setSelectedSubject(e.target.value)}
                            className="w-full h-12 px-4 rounded-xl border-2 border-gray-100 focus:border-[var(--orange)] focus:outline-none transition-colors appearance-none bg-gray-50/50"
                        >
                            <option value="">Select Subject</option>
                            {subjects.map((s) => (
                                <option key={s.id} value={s.id}>{s.icon} {s.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Topic */}
                    <div>
                        <label className="block text-sm font-bold text-[var(--black)] mb-2">
                            Topic {loadingTopics && <span className="ml-2 animate-pulse text-[var(--orange)]">Loading...</span>}
                        </label>
                        <select
                            value={selectedTopic}
                            disabled={!selectedSubject || loadingTopics}
                            onChange={(e) => setSelectedTopic(e.target.value)}
                            className="w-full h-12 px-4 rounded-xl border-2 border-gray-100 focus:border-[var(--orange)] focus:outline-none transition-colors appearance-none bg-gray-50/50 disabled:opacity-50"
                        >
                            <option value="">{selectedSubject ? 'Select Topic' : 'Select a subject first'}</option>
                            {topics.map((t) => (
                                <option key={t.id} value={t.id}>{t.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Difficulty */}
                    <div>
                        <label className="block text-sm font-bold text-[var(--black)] mb-4">Challenge Level</label>
                        <DifficultySelector value={difficulty} onChange={setDifficulty} />
                    </div>

                    {/* Count */}
                    <div>
                        <label className="block text-sm font-bold text-[var(--black)] mb-2">Number of Questions</label>
                        <div className="flex gap-3">
                            {[3, 5, 10, 15].map((num) => (
                                <button
                                    key={num}
                                    type="button"
                                    onClick={() => setCount(num)}
                                    className={`
                    flex-1 h-12 rounded-xl font-bold transition-all
                    ${count === num
                                            ? 'bg-[var(--blue)] text-white shadow-lg shadow-[var(--blue)]/20 scale-[1.05]'
                                            : 'bg-gray-100 text-[var(--gray-dark)] hover:bg-gray-200'
                                        }
                  `}
                                >
                                    {num}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="pt-4">
                        <Button onClick={handleStart} fullWidth className="h-14 text-lg">
                            Generate Questions ✨
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
