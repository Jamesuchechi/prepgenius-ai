'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { QuizService, GenerateQuizPayload } from '../../services/quizService';
import { studyService, Document } from '../../services/studyService';
import { Button } from '../ui/Button';
import Input from '../ui/Input';
import { Card } from '../ui/Card';
import SectionHeader from '../ui/SectionHeader';

const QuizWizard: React.FC = () => {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [step, setStep] = useState(1);

    // Form State
    const [mode, setMode] = useState<'TOPIC' | 'DOCUMENT'>('TOPIC');
    const [topic, setTopic] = useState(searchParams.get('topic') || '');
    const [difficulty, setDifficulty] = useState<'EASY' | 'MEDIUM' | 'HARD'>('MEDIUM');
    const [questionCount, setQuestionCount] = useState(5);
    const [examType, setExamType] = useState<'MCQ' | 'THEORY'>('MCQ');
    const [selectedDocId, setSelectedDocId] = useState<string>('');

    // Data State
    const [documents, setDocuments] = useState<Document[]>([]);

    useEffect(() => {
        if (mode === 'DOCUMENT') {
            fetchDocuments();
        }
    }, [mode]);

    const fetchDocuments = async () => {
        try {
            const docs = await studyService.getDocuments();
            setDocuments(docs);
        } catch (err) {
            console.error(err);
            setError('Failed to load documents.');
        }
    };

    const handleGenerate = async () => {
        setLoading(true);
        setError('');

        try {
            const payload: GenerateQuizPayload = {
                topic: mode === 'DOCUMENT' ? 'Document Based' : topic,
                difficulty,
                question_count: questionCount,
                exam_type: examType,
                document_id: mode === 'DOCUMENT' ? selectedDocId : undefined
            };

            // If document mode, topic might be inferred from doc title if empty?
            // Backend expects a topic string still.
            if (mode === 'DOCUMENT' && selectedDocId) {
                const doc = documents.find(d => d.id === selectedDocId);
                if (doc) payload.topic = doc.title;
            }

            const quiz = await QuizService.generate(payload);
            router.push(`/dashboard/quiz/${quiz.id}`);
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.error || 'Failed to generate quiz.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="max-w-2xl mx-auto p-6">
            <SectionHeader badge="New Quiz" title="Create New Quiz" description="Generate a custom quiz to test your knowledge." />

            {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm">
                    {error}
                </div>
            )}

            <div className="space-y-6 mt-4">
                {/* Mode Selection */}
                <div className="flex gap-4 p-1 bg-gray-100 rounded-lg">
                    <button
                        className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${mode === 'TOPIC' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                        onClick={() => setMode('TOPIC')}
                    >
                        By Topic
                    </button>
                    <button
                        className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${mode === 'DOCUMENT' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                        onClick={() => setMode('DOCUMENT')}
                    >
                        From Document (RAG)
                    </button>
                </div>

                {/* Content Configuration */}
                <div className="space-y-4">
                    {mode === 'TOPIC' ? (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Topic</label>
                            <Input
                                value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                                placeholder="e.g. African History, Algebra, Biology"
                            />
                        </div>
                    ) : (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Select Document</label>
                            <select
                                className="w-full rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                                value={selectedDocId}
                                onChange={(e) => setSelectedDocId(e.target.value)}
                            >
                                <option value="">-- Choose a document --</option>
                                {documents.map((doc) => (
                                    <option key={doc.id} value={doc.id}>
                                        {doc.title}
                                    </option>
                                ))}
                            </select>
                            {documents.length === 0 && <p className="text-xs text-gray-500 mt-1">No documents found. Upload one in 'Study Tools'.</p>}
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
                            <select
                                className="w-full rounded-md border border-gray-300 p-2 outline-none focus:border-blue-500"
                                value={difficulty}
                                onChange={(e: any) => setDifficulty(e.target.value)}
                            >
                                <option value="EASY">Easy</option>
                                <option value="MEDIUM">Medium</option>
                                <option value="HARD">Hard</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Question Type</label>
                            <select
                                className="w-full rounded-md border border-gray-300 p-2 outline-none focus:border-blue-500"
                                value={examType}
                                onChange={(e: any) => setExamType(e.target.value)}
                            >
                                <option value="MCQ">Multiple Choice</option>
                                <option value="THEORY">Theory</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Number of Questions: {questionCount}</label>
                        <input
                            type="range"
                            min="1"
                            max="20"
                            value={questionCount}
                            onChange={(e) => setQuestionCount(Number(e.target.value))}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />
                    </div>
                </div>

                <div className="pt-4">
                    <Button
                        fullWidth
                        onClick={handleGenerate}
                        disabled={loading || (mode === 'TOPIC' && !topic) || (mode === 'DOCUMENT' && !selectedDocId)}
                    >
                        {loading ? 'Generating...' : 'Generate Quiz'}
                    </Button>
                </div>
            </div>
        </Card>
    );
};

const QuizWizardWrapper = () => (
    <Suspense fallback={<div>Loading...</div>}>
        <QuizWizard />
    </Suspense>
);

export default QuizWizardWrapper;
