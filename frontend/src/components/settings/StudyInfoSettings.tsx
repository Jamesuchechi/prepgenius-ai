'use client'

import React, { useState } from 'react'
import { GraduationCap, Target, Save, CheckCircle2 } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { settingsApi } from '@/lib/api/settings'
import { toast } from 'sonner'

export default function StudyInfoSettings() {
    const { user, setUser } = useAuthStore()
    const [gradeLevel, setGradeLevel] = useState(user?.grade_level || '')
    const [examTargets, setExamTargets] = useState<string[]>(user?.exam_targets || [])
    const [isSaving, setIsSaving] = useState(false)

    const handleSave = async () => {
        setIsSaving(true)
        try {
            const updatedUser = await settingsApi.updateProfile({
                grade_level: gradeLevel as any,
                exam_targets: examTargets
            })
            setUser(updatedUser)
            toast.success('Study information updated!')
        } catch (error: any) {
            toast.error('Failed to update study info')
        } finally {
            setIsSaving(false)
        }
    }

    const toggleTarget = (target: string) => {
        setExamTargets(prev =>
            prev.includes(target) ? prev.filter(t => t !== target) : [...prev, target]
        )
    }

    const examOptions = [
        { id: 'jamb', name: 'JAMB', color: 'bg-blue-500' },
        { id: 'waec', name: 'WAEC', color: 'bg-green-500' },
        { id: 'neco', name: 'NECO', color: 'bg-purple-500' },
        { id: 'post_utme', name: 'Post-UTME', color: 'bg-orange-500' },
    ]

    return (
        <div className="space-y-8">
            {/* Grade Level */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 text-[#001D4D]">
                    <GraduationCap className="w-5 h-5" />
                    <h3 className="font-bold">Grade Level</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {['ss1', 'ss2', 'ss3', 'post_secondary'].map((level) => (
                        <button
                            key={level}
                            onClick={() => setGradeLevel(level)}
                            className={`px-4 py-3 rounded-2xl border-2 transition-all text-xs font-bold uppercase tracking-wider
                                ${gradeLevel === level ? 'border-[var(--orange)] bg-[var(--orange)]/5' : 'border-gray-100 hover:bg-gray-50'}
                            `}
                        >
                            {level.replace('_', ' ')}
                        </button>
                    ))}
                </div>
            </div>

            {/* Exam Targets */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 text-[#001D4D]">
                    <Target className="w-5 h-5" />
                    <h3 className="font-bold">Exam Targets</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {examOptions.map((target) => {
                        const isSelected = examTargets.includes(target.id)
                        return (
                            <button
                                key={target.id}
                                onClick={() => toggleTarget(target.id)}
                                className={`p-4 rounded-2xl border-2 transition-all flex items-center justify-between
                                    ${isSelected ? 'border-[var(--orange)] bg-[var(--orange)]/5 shadow-sm' : 'border-gray-100 hover:bg-gray-50'}
                                `}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 ${target.color} rounded-xl flex items-center justify-center text-white font-bold`}>
                                        {target.name[0]}
                                    </div>
                                    <span className="font-bold text-gray-900">{target.name}</span>
                                </div>
                                {isSelected && <CheckCircle2 className="w-5 h-5 text-[var(--orange)]" />}
                            </button>
                        )
                    })}
                </div>
            </div>

            <div className="pt-4 border-t border-gray-50 flex justify-end">
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center gap-2 px-8 py-3 bg-[#001D4D] text-white rounded-2xl font-bold hover:bg-[#002D7A] transition-all shadow-lg shadow-[#001D4D]/20 disabled:opacity-50"
                >
                    {isSaving ? 'Saving...' : <><Save className="w-5 h-5" /> Save Study Info</>}
                </button>
            </div>
        </div>
    )
}
