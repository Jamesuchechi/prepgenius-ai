
import React, { useEffect, useState } from 'react';
import {
    Flame, Award, BookOpen, Clock, MessageSquare, Target, Brain
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card";
import { analyticsApi, AnalyticsSummary, Activity, SubjectMasteryChart } from "../../lib/api/analytics";
import { flashcardApi, FlashcardSummary } from "../../lib/api/flashcards";
import ReadinessCard from '../analytics/ReadinessCard';
import MasteryRadarChart from '../analytics/MasteryRadarChart';
import ProgressChart from '../analytics/ProgressChart';
import StudyTimeTracker from '../analytics/StudyTimeTracker';
import PerformanceTimeline from '../analytics/PerformanceTimeline';
import { CollapsibleCard } from '../ui/CollapsibleCard';
import { Button } from '../ui/Button';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Skeleton } from '../ui/Skeleton';
import { motion } from 'framer-motion';
import { containerVariants, itemVariants } from '../../utils/animations';

export const AnalyticsDashboard: React.FC = () => {
    const router = useRouter();
    const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
    const [history, setHistory] = useState<Activity[]>([]);
    const [subjectMastery, setSubjectMastery] = useState<SubjectMasteryChart[]>([]);
    const [flashcardSummary, setFlashcardSummary] = useState<FlashcardSummary | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            analyticsApi.getSummary(),
            analyticsApi.getPerformanceHistory(),
            analyticsApi.getSubjectMastery(),
            flashcardApi.getSummary()
        ])
            .then(([summaryData, historyData, subjectData, flashData]) => {
                setSummary(summaryData);
                setHistory(historyData);
                setSubjectMastery(subjectData);
                setFlashcardSummary(flashData);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to fetch analytics", err);
                setLoading(false);
            });
    }, []);

    if (loading) return (
        <div className="space-y-6 w-full animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="space-y-2">
                    <Skeleton className="h-10 w-64" />
                    <Skeleton className="h-4 w-96" />
                </div>
                <Skeleton className="h-10 w-40 rounded-full" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map(i => (
                    <Card key={i} className="border-l-4">
                        <CardHeader className="pb-2">
                            <Skeleton className="h-4 w-24" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-8 w-16" />
                            <Skeleton className="h-3 w-32 mt-2" />
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Skeleton className="h-[300px] rounded-2xl" />
                        <Skeleton className="h-[300px] rounded-2xl" />
                    </div>
                </div>
                <div className="space-y-6">
                    <Skeleton className="h-[120px] rounded-2xl" />
                    <Skeleton className="h-[200px] rounded-2xl" />
                    <Skeleton className="h-[300px] rounded-2xl" />
                </div>
            </div>
        </div>
    );

    if (!summary) return <div className="p-8 text-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
        <h3 className="text-xl font-bold text-gray-900 mb-2">No learning data found</h3>
        <p className="text-gray-500 mb-6">Start your first quiz or exam to see your performance metrics here.</p>
        <Button onClick={() => router.push('/dashboard/quiz/new')}>Explore Quizzes</Button>
    </div>;

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6 w-full"
        >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 max-w-full">
                <motion.div variants={itemVariants} className="max-w-full">
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight break-words">Performance Analytics</h1>
                    <p className="text-sm text-muted-foreground">Real-time insights across all your study activities.</p>
                </motion.div>
                <motion.div
                    variants={itemVariants}
                    className="flex items-center gap-2 bg-orange-50 px-3 py-1.5 rounded-full border border-orange-100"
                >
                    <Flame className="h-4 w-4 md:h-5 md:w-5 text-orange-500 fill-orange-500" />
                    <span className="text-sm font-bold text-orange-700">{summary.streak} Day Streak!</span>
                </motion.div>
            </div>

            {/* key Stats Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-full">
                <motion.div variants={itemVariants}>
                    <Card className="border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-shadow h-full">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-[10px] md:text-xs font-medium text-muted-foreground uppercase tracking-wider">Questions</CardTitle>
                            <BookOpen className="h-4 w-4 text-blue-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-xl md:text-2xl font-bold">{summary.total_questions}</div>
                            <p className="text-[10px] text-muted-foreground mt-1">Answered across all quizzes</p>
                        </CardContent>
                    </Card>
                </motion.div>
                <motion.div variants={itemVariants}>
                    <Card className="border-l-4 border-l-purple-500 shadow-sm hover:shadow-md transition-shadow h-full">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-[10px] md:text-xs font-medium text-muted-foreground uppercase tracking-wider">Mock Exams</CardTitle>
                            <Award className="h-4 w-4 text-purple-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-xl md:text-2xl font-bold">{summary.total_exams}</div>
                            <p className="text-[10px] text-muted-foreground mt-1">Full-length JAMB exams</p>
                        </CardContent>
                    </Card>
                </motion.div>
                <motion.div variants={itemVariants}>
                    <Card className="border-l-4 border-l-green-500 shadow-sm hover:shadow-md transition-shadow h-full">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-[10px] md:text-xs font-medium text-muted-foreground uppercase tracking-wider">AI Tutor</CardTitle>
                            <MessageSquare className="h-4 w-4 text-green-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-xl md:text-2xl font-bold">{summary.tutor_interactions}</div>
                            <p className="text-[10px] text-muted-foreground mt-1">Messages exchanged</p>
                        </CardContent>
                    </Card>
                </motion.div>
                <motion.div variants={itemVariants}>
                    <Card className="border-l-4 border-l-amber-500 shadow-sm hover:shadow-md transition-shadow h-full">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-[10px] md:text-xs font-medium text-muted-foreground uppercase tracking-wider">Accuracy</CardTitle>
                            <Target className="h-4 w-4 text-amber-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-xl md:text-2xl font-bold">{Math.round(summary.accuracy_percentage)}%</div>
                            <p className="text-[10px] text-muted-foreground mt-1">Global average accuracy</p>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    {/* Main Charts */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <ReadinessCard data={summary.readiness} />
                        <MasteryRadarChart data={subjectMastery} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <ProgressChart data={{
                            total_correct_answers: Math.round((summary.accuracy_percentage / 100) * summary.total_questions),
                            total_questions_attempted: summary.total_questions,
                            current_streak: summary.streak,
                            longest_streak: 0,
                            last_activity_date: '',
                            total_study_minutes: 0,
                            total_quizzes_taken: 0,
                            accuracy_percentage: summary.accuracy_percentage
                        } as any} />

                        <StudyTimeTracker data={[] /* Backend StudySession needed */} />
                    </div>

                    <PerformanceTimeline data={history.map(h => ({
                        id: h.id,
                        start_time: h.date,
                        duration_seconds: 0, // Approx
                        correct_questions: h.score > 0 ? 1 : 0, // Mock for viz
                        questions_attempted: 1,
                        subject_details: { name: h.title }
                    })) as any} />
                </div>

                <div className="space-y-6">
                    {/* Flashcard SRS Card */}
                    {flashcardSummary && (
                        <Card className="bg-gradient-to-br from-indigo-900 to-slate-900 border-none text-white overflow-hidden relative">
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <Brain className="h-24 w-24" />
                            </div>
                            <CardHeader>
                                <CardTitle className="text-white flex items-center gap-2">
                                    <Brain className="h-5 w-5 text-indigo-400" />
                                    Daily Review
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 relative z-10">
                                <div className="flex justify-between items-end">
                                    <div>
                                        <div className="text-3xl font-extrabold">{flashcardSummary.due_count}</div>
                                        <p className="text-xs text-indigo-200 uppercase tracking-widest font-bold">Cards Due Today</p>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xl font-bold text-indigo-300">{flashcardSummary.mastered_count}</div>
                                        <p className="text-[10px] text-indigo-200 uppercase tracking-tighter">Mastered</p>
                                    </div>
                                </div>
                                <Button
                                    className="w-full bg-white text-indigo-900 hover:bg-indigo-50 font-bold py-6 rounded-xl"
                                    onClick={() => router.push('/study/flashcards')}
                                    disabled={flashcardSummary.due_count === 0}
                                >
                                    {flashcardSummary.due_count > 0 ? 'Start Review Session' : 'Inbox Zero!'}
                                </Button>
                            </CardContent>
                        </Card>
                    )}

                    {/* Insights & Next Steps */}
                    <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100">
                        <CardHeader>
                            <CardTitle className="text-blue-900">AI Insights</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {summary.study_patterns?.optimal_study_time ? (
                                <div className="flex items-start gap-3">
                                    <Clock className="h-5 w-5 text-blue-600 mt-0.5" />
                                    <div>
                                        <p className="font-semibold text-blue-900 text-sm">Optimal Study Time</p>
                                        <p className="text-sm text-blue-700">
                                            You perform best between {summary.study_patterns.optimal_study_time.start_hour}:00 and {summary.study_patterns.optimal_study_time.end_hour}:00
                                            with {summary.study_patterns.optimal_study_time.accuracy}% accuracy.
                                        </p>
                                    </div>
                                </div>
                            ) : null}

                            <div className="flex items-start gap-3">
                                <Target className="h-5 w-5 text-indigo-600 mt-0.5" />
                                <div>
                                    <p className="font-semibold text-indigo-900 text-sm">Focus Required</p>
                                    <p className="text-sm text-indigo-700">
                                        Your predicted score is {summary.predicted_score.score}%. Concentrate on {summary.weak_topics?.[0]?.topic || 'your weak areas'} to break the 80% barrier.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Weak Topics List */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Priority Topics</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {summary.weak_topics.length > 0 ? (
                                    summary.weak_topics.map((t, i) => (
                                        <Link
                                            href={`/dashboard/quiz/new?topic=${encodeURIComponent(t.topic)}`}
                                            key={i}
                                            className="flex items-center justify-between group p-2 hover:bg-slate-50 rounded-lg transition-colors"
                                        >
                                            <div className="space-y-1">
                                                <p className="text-sm font-medium leading-none group-hover:text-amber-600 transition-colors">{t.topic}</p>
                                                <p className="text-xs text-muted-foreground">{Math.round(t.mastery_score)}% mastery</p>
                                            </div>
                                            <div className="h-2 w-24 bg-red-100 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-red-500 transition-all"
                                                    style={{ width: `${t.mastery_score}%` }}
                                                />
                                            </div>
                                        </Link>
                                    ))
                                ) : (
                                    <p className="text-sm text-muted-foreground text-center py-4">All topics looking good!</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </motion.div>
    );
};
