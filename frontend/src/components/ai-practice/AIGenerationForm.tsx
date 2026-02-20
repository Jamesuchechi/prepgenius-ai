import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { getExamTypes, ExamType, Topic } from '../../lib/api'
import { QuestionService, GenerateQuestionsPayload } from '../../services/questions'
import { ContentService } from '../../services/content'
import { Button } from '../ui/Button'
import { BrainCircuit, BookOpen, Layers, Target, Wand2, Calculator, Search, Loader2 } from 'lucide-react'
import clsx from 'clsx'
import { toast } from 'sonner'
import { quizApi, Quiz } from '@/lib/api/quiz'

interface AIGenerationFormProps {
    onQuizGenerated: (quiz: Quiz) => void
}

export default function AIGenerationForm({ onQuizGenerated }: AIGenerationFormProps) {
    const [examTypes, setExamTypes] = useState<ExamType[]>([])
    const [subjectQuery, setSubjectQuery] = useState('')
    const [topics, setTopics] = useState<Topic[]>([])
    const [selectedExamType, setSelectedExamType] = useState<string>('')
    const [selectedSubjectId, setSelectedSubjectId] = useState<string>('')
    const [selectedTopic, setSelectedTopic] = useState<string>('')
    const [difficulty, setDifficulty] = useState<string>('MEDIUM')
    const [questionType, setQuestionType] = useState<'MCQ' | 'THEORY' | 'TRUE_FALSE' | 'FILL_BLANK' | 'MATCHING' | 'ORDERING'>('MCQ')
    const [count, setCount] = useState<number>(5)

    const [loading, setLoading] = useState(false)
    const [topicsLoading, setTopicsLoading] = useState(false)
    const [initLoading, setInitLoading] = useState(true)

    useEffect(() => {
        async function loadData() {
            try {
                const exams = await getExamTypes()
                setExamTypes(exams)
            } catch (err) {
                console.error("Failed to load metadata", err)
            } finally {
                setInitLoading(false)
            }
        }
        loadData()
    }, [])

    const handleLoadTopics = async (e?: React.FormEvent) => {
        e?.preventDefault()
        if (!subjectQuery.trim()) return

        setTopicsLoading(true)
        setTopics([])
        setSelectedSubjectId('')
        setSelectedTopic('')

        try {
            const fetchedTopics = await ContentService.generateTopics(subjectQuery)
            setTopics(fetchedTopics)
            if (fetchedTopics.length > 0) {
                // All topics for this query belong to the same subject ID returned by backend
                setSelectedSubjectId(String(fetchedTopics[0].subject))
            } else {
                toast.error("No topics found or generated for this subject. Try a different name.")
            }
        } catch (err) {
            console.error("Failed to load topics", err)
            toast.error("Failed to load topics. Please try again.")
        } finally {
            setTopicsLoading(false)
        }
    }

    const handleGenerate = async () => {
        if (!selectedSubjectId || !selectedTopic) return
        setLoading(true)
        try {
            const result = await quizApi.generate({
                subject_id: Number(selectedSubjectId),
                topic: topics.find(t => String(t.id) === selectedTopic)?.name || "General",
                difficulty,
                question_count: count,
                exam_type: questionType
            });

            if ('task_id' in result && result.task_id) {
                // Background processing started, begin polling
                const taskId = result.task_id;
                let isComplete = false;

                while (!isComplete) {
                    await new Promise(resolve => setTimeout(resolve, 3000)); // poll every 3s
                    const statusRes = await quizApi.getGenerationStatus(taskId);

                    if (statusRes.status === 'success' && statusRes.quiz) {
                        toast.success(`Quiz "${statusRes.quiz.title}" generated and saved! ✨`);
                        onQuizGenerated(statusRes.quiz);
                        isComplete = true;
                    } else if (statusRes.status === 'failed') {
                        throw new Error(statusRes.error || "Generation failed");
                    }
                    // if processing, continue loop
                }
            } else {
                // Synchronous fallback just in case
                const generatedQuiz = result as Quiz;
                toast.success(`Quiz "${generatedQuiz.title}" generated and saved! ✨`)
                onQuizGenerated(generatedQuiz)
            }
        } catch (err: any) {
            console.error("Failed to generate questions", err)
            toast.error(err.message || "AI Generation failed. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    if (initLoading) return <div className="p-10 text-center animate-pulse">Initializing AI Core...</div>

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto bg-white rounded-3xl p-8 shadow-xl border border-indigo-50"
        >
            <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-indigo-100 rounded-xl">
                    <BrainCircuit className="w-8 h-8 text-indigo-600" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">AI Practice Generator</h2>
                    <p className="text-gray-500">Type a subject, pick a topic, and let AI create the perfect test.</p>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                {/* Subject Input */}
                <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <BookOpen className="w-4 h-4" /> Subject
                    </label>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                            placeholder="e.g. Physics, History"
                            value={subjectQuery}
                            onChange={(e) => setSubjectQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleLoadTopics()}
                        />
                        <button
                            onClick={() => handleLoadTopics()}
                            disabled={topicsLoading || !subjectQuery.trim()}
                            className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-md"
                        >
                            {topicsLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                        </button>
                    </div>
                </div>

                {/* Topic Selection */}
                <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <Layers className="w-4 h-4" /> Topic
                    </label>
                    <select
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all disabled:opacity-50"
                        value={selectedTopic}
                        onChange={(e) => setSelectedTopic(e.target.value)}
                        disabled={!selectedSubjectId || topics.length === 0}
                    >
                        <option value="">
                            {topicsLoading ? 'Loading Topics...' : (selectedSubjectId ? 'Select a Topic' : 'Load Subject First')}
                        </option>
                        {topics.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                </div>

                {/* Exam Type */}
                <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <Target className="w-4 h-4" /> Exam Target
                    </label>
                    <select
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                        value={selectedExamType}
                        onChange={(e) => setSelectedExamType(e.target.value)}
                    >
                        <option value="">General Practice</option>
                        {examTypes.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                    </select>
                </div>

                {/* Question Type */}
                <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <Wand2 className="w-4 h-4" /> Question Mode
                    </label>
                    <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 rounded-xl">
                        {[
                            { id: 'MCQ', label: 'Multiple Choice' },
                            { id: 'THEORY', label: 'Theory / Essay' },
                            { id: 'TRUE_FALSE', label: 'True / False' },
                            { id: 'FILL_BLANK', label: 'Fill in Blanks' },
                            { id: 'MATCHING', label: 'Matching' },
                            { id: 'ORDERING', label: 'Ordering' }
                        ].map((type) => (
                            <button
                                key={type.id}
                                onClick={() => setQuestionType(type.id as any)}
                                className={clsx(
                                    "p-2 rounded-lg text-sm font-medium transition-all",
                                    questionType === type.id ? "bg-white text-indigo-600 shadow-sm" : "text-gray-500 hover:bg-gray-200"
                                )}
                            >
                                {type.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Difficulty & Count */}
            <div className="grid md:grid-cols-2 gap-6 mt-6">
                <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Difficulty Level</label>
                    <div className="flex gap-2">
                        {['EASY', 'MEDIUM', 'HARD'].map(level => (
                            <button
                                key={level}
                                onClick={() => setDifficulty(level)}
                                className={clsx(
                                    "flex-1 py-3 rounded-xl text-sm font-bold border transition-all",
                                    difficulty === level
                                        ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                                        : "border-gray-200 bg-white text-gray-500 hover:border-indigo-200"
                                )}
                            >
                                {level}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <Calculator className="w-4 h-4" /> Question Count: {count}
                    </label>
                    <input
                        type="range"
                        min="3"
                        max="20"
                        value={count}
                        onChange={(e) => setCount(Number(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                    <div className="flex justify-between text-xs text-gray-400 font-medium">
                        <span>3</span>
                        <span>10</span>
                        <span>20</span>
                    </div>
                </div>
            </div>

            {/* Action Button */}
            <div className="mt-8">
                <Button
                    fullWidth
                    className="h-14 text-lg font-bold shadow-indigo-200 shadow-lg hover:shadow-xl transition-all"
                    disabled={!selectedSubjectId || !selectedTopic || loading}
                    onClick={handleGenerate}
                >
                    {loading ? (
                        <span className="flex items-center gap-2">
                            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Generating with AI...
                        </span>
                    ) : (
                        "Generate Practice Session ✨"
                    )}
                </Button>
            </div>

        </motion.div>
    )
}
