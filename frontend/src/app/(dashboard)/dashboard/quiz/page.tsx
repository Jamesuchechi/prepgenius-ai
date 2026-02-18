'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { useQuery } from '@tanstack/react-query'
import { quizApi, type Quiz } from '@/lib/api/quiz'
import Link from 'next/link'
import {
    PlusCircle, Clock, CheckCircle, BookOpen, Trash2,
    Search, Filter, LayoutGrid, List, Sparkles, TrendingUp,
    Zap, Award, ChevronRight
} from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
// Local StatusBadge component defined below

// Helper for Badge since imported one might be the gamification icon one
const StatusBadge = ({ status }: { status: string }) => {
    const styles = {
        COMPLETED: 'bg-green-100 text-green-800',
        IN_PROGRESS: 'bg-blue-100 text-blue-800',
        PENDING: 'bg-yellow-100 text-yellow-800'
    }
    const colorClass = styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800'

    return (
        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${colorClass}`}>
            {status}
        </span>
    )
}

export default function QuizDashboardPage() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null);

    const { data: quizzes, isLoading } = useQuery({
        queryKey: ['quizzes'],
        queryFn: quizApi.list
    });

    const deleteMutation = useMutation({
        mutationFn: quizApi.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['quizzes'] });
            toast.success("Quiz deleted successfully");
        },
        onError: () => {
            toast.error("Failed to delete quiz");
        }
    });

    const handleDelete = (e: React.MouseEvent, id: number) => {
        e.stopPropagation();
        if (window.confirm("Are you sure you want to delete this quiz?")) {
            deleteMutation.mutate(id);
        }
    };

    // Derived Statistics
    const stats = React.useMemo(() => {
        if (!quizzes) return { total: 0, avgScore: 0, totalAttempts: 0, mastered: 0 };
        const total = quizzes.length;
        const totalScore = quizzes.reduce((acc, q) => acc + (q.avg_score || 0), 0);
        const avgScore = total > 0 ? Math.round(totalScore / total) : 0;
        const totalAttempts = quizzes.reduce((acc, q) => acc + (q.attempts_count || 0), 0);
        const mastered = quizzes.filter(q => (q.avg_score || 0) >= 80).length;
        return { total, avgScore, totalAttempts, mastered };
    }, [quizzes]);

    const filteredQuizzes = (quizzes || []).filter(quiz => {
        const matchesSearch = quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            quiz.topic.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesDifficulty = !selectedDifficulty || quiz.difficulty === selectedDifficulty;
        return matchesSearch && matchesDifficulty;
    });

    return (
        <div className="space-y-10 max-w-7xl mx-auto pb-16">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="font-display text-4xl font-extrabold text-slate-900 flex items-center gap-3">
                        <Award className="h-10 w-10 text-[var(--orange)]" />
                        Quiz Dashboard
                    </h1>
                    <p className="text-slate-500 mt-2 text-lg">
                        Test your mastery and track your academic progress.
                    </p>
                </div>
                <Link href="/dashboard/quiz/new">
                    <Button className="bg-[var(--orange)] hover:bg-[var(--orange-dark)] text-white px-8 py-6 rounded-2xl font-bold shadow-lg shadow-orange-200 transition-all hover:scale-105">
                        <PlusCircle className="w-5 h-5 mr-2" />
                        New AI Quiz
                    </Button>
                </Link>
            </div>

            {/* Quick Stats Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    label="Total Quizzes"
                    value={stats.total}
                    icon={<BookOpen className="w-5 h-5" />}
                    color="bg-blue-500"
                    description="Created quizzes"
                />
                <StatCard
                    label="Avg. Accuracy"
                    value={`${stats.avgScore}%`}
                    icon={<TrendingUp className="w-5 h-5" />}
                    color="bg-green-500"
                    description="Overall performance"
                />
                <StatCard
                    label="Points Earned"
                    value={stats.totalAttempts * 50}
                    icon={<Award className="w-5 h-5" />}
                    color="bg-orange-500"
                    description="Participation XP"
                />
                <StatCard
                    label="Mastered Topics"
                    value={stats.mastered}
                    icon={<Sparkles className="w-5 h-5" />}
                    color="bg-purple-500"
                    description="Topics above 80%"
                />
            </div>

            {/* Content Section */}
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 rounded-3xl shadow-sm border border-slate-100">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search quizzes..."
                            className="w-full pl-10 pr-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-[var(--orange)] transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
                        {['EASY', 'MEDIUM', 'HARD'].map((diff) => (
                            <button
                                key={diff}
                                onClick={() => setSelectedDifficulty(selectedDifficulty === diff ? null : diff)}
                                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${selectedDifficulty === diff
                                    ? 'bg-slate-900 text-white'
                                    : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                                    }`}
                            >
                                {diff}
                            </button>
                        ))}
                    </div>
                </div>

                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-64 bg-slate-100 animate-pulse rounded-3xl" />
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <AnimatePresence>
                            {filteredQuizzes.length > 0 ? (
                                filteredQuizzes.map((quiz, index) => (
                                    <QuizCard
                                        key={quiz.id}
                                        quiz={quiz}
                                        index={index}
                                        onDelete={handleDelete}
                                        onClick={() => router.push(`/dashboard/quiz/${quiz.id}`)}
                                    />
                                ))
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="col-span-full py-20 text-center bg-slate-50 rounded-[40px] border-2 border-dashed border-slate-200"
                                >
                                    <div className="w-20 h-20 bg-white rounded-3xl shadow-sm flex items-center justify-center mx-auto mb-6">
                                        <BookOpen className="w-10 h-10 text-slate-300" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-slate-800 mb-2">No quizzes matches your search</h3>
                                    <p className="text-slate-500 mb-8 max-w-sm mx-auto">Try adjusting your filters or generate a new AI-powered quiz.</p>
                                    <Link href="/dashboard/quiz/new">
                                        <Button className="bg-slate-900 hover:bg-black text-white px-8 py-3 rounded-xl font-bold">
                                            Create New Quiz
                                        </Button>
                                    </Link>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </div>
    )
}

interface StatCardProps {
    label: string;
    value: string | number;
    icon: React.ReactNode;
    color: string;
    description: string;
}

const StatCard = ({ label, value, icon, color, description }: StatCardProps) => (
    <Card className="border-none shadow-sm hover:shadow-md transition-all rounded-[32px] overflow-hidden group">
        <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-2xl ${color} bg-opacity-10 text-${color.split('-')[1]}-600 group-hover:scale-110 transition-transform`}>
                    {icon}
                </div>
                <div className="h-2 w-8 bg-slate-50 rounded-full" />
            </div>
            <div>
                <div className="text-3xl font-black text-slate-900 mb-1">{value}</div>
                <div className="text-sm font-bold text-slate-500 uppercase tracking-widest">{label}</div>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-50">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{description}</p>
            </div>
        </CardContent>
    </Card>
);

interface QuizCardProps {
    quiz: Quiz;
    index: number;
    onDelete: (e: React.MouseEvent, id: number) => void;
    onClick: () => void;
}

const QuizCard = ({ quiz, index, onDelete, onClick }: QuizCardProps) => {
    const isNew = !quiz.attempts_count || quiz.attempts_count === 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ y: -5 }}
            className="group cursor-pointer"
            onClick={onClick}
        >
            <Card className="h-full border-2 border-transparent hover:border-[var(--orange)] hover:shadow-2xl transition-all rounded-[32px] overflow-hidden bg-white">
                <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                        <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${isNew ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'
                            }`}>
                            {isNew ? 'New Challenge' : 'Completed'}
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                            onClick={(e: React.MouseEvent) => onDelete(e, quiz.id)}
                        >
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div>
                        <h3 className="text-xl font-extrabold text-slate-900 group-hover:text-[var(--orange)] transition-colors mb-2 line-clamp-1">
                            {quiz.title}
                        </h3>
                        <div className="flex items-center gap-2 text-slate-400">
                            <BookOpen className="w-3.5 h-3.5" />
                            <span className="text-xs font-bold uppercase tracking-wider">{quiz.topic}</span>
                        </div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl group-hover:bg-orange-50/50 transition-colors">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Avg. Score</span>
                            <span className={`text-xl font-black ${(quiz.avg_score || 0) >= 70 ? 'text-green-600' : 'text-slate-900'
                                }`}>
                                {quiz.avg_score != null ? `${Math.round(quiz.avg_score)}%` : '--'}
                            </span>
                        </div>
                        <div className="flex flex-col items-end">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Questions</span>
                            <span className="text-xl font-black text-slate-900">{quiz.question_count}</span>
                        </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-400 font-bold">
                        <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{new Date(quiz.created_at).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-1 text-[var(--orange)]">
                            <span className="group-hover:mr-1 transition-all">Review Quiz</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
};
