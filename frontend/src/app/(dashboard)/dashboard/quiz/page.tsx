'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { useQuery } from '@tanstack/react-query'
import { quizApi } from '@/lib/api/quiz'
import Link from 'next/link'
import { PlusCircle, Clock, CheckCircle, BookOpen, Trash2 } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
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
    const queryClient = useQueryClient();
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

    const handleDelete = (id: number) => {
        if (window.confirm("Are you sure you want to delete this quiz?")) {
            deleteMutation.mutate(id);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="font-display text-3xl font-bold text-[var(--black)]">
                        My Quizzes
                    </h1>
                    <p className="text-[var(--gray-dark)]">
                        Manage your generated quizzes and track performance.
                    </p>
                </div>
                <Link href="/practice">
                    <Button className="bg-[var(--orange)] hover:bg-[var(--orange-dark)] text-white">
                        <PlusCircle className="w-4 h-4 mr-2" />
                        Generate New Quiz
                    </Button>
                </Link>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Recent Quizzes</CardTitle>
                    <CardDescription>History of quizzes you have generated.</CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="text-center py-8">Loading...</div>
                    ) : (
                        <div className="space-y-4">
                            {quizzes && quizzes.length > 0 ? (
                                quizzes.map((quiz) => (
                                    <div key={quiz.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-lg hover:border-blue-300 transition-colors">
                                        <div className="mb-2 sm:mb-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="font-semibold text-lg">{quiz.title}</h3>
                                                {/* <StatusBadge status={quiz.status} /> */}
                                                {/* Assuming quiz doesn't have status on validaiton yet, using placeholders */}
                                            </div>
                                            <div className="text-sm text-gray-500 flex items-center gap-4">
                                                <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" /> {quiz.topic}</span>
                                                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(quiz.created_at).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            {/* Logic to Resume or View Results would go here */}
                                            <Button variant="outline" size="sm">
                                                View Details
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                                onClick={() => handleDelete(quiz.id)}
                                                disabled={deleteMutation.isPending}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg border border-dashed">
                                    <BookOpen className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                    <p className="mb-2">No quizzes found.</p>
                                    <Link href="/practice">
                                        <Button variant="link" className="text-[var(--blue)]">
                                            Create your first quiz
                                        </Button>
                                    </Link>
                                </div>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
