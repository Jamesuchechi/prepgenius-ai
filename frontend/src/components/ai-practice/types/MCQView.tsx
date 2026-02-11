import React from 'react'
import { motion } from 'framer-motion'
import clsx from 'clsx'
import { CheckCircle2, XCircle } from 'lucide-react'

interface MCQViewProps {
    answers: any[]
    selectedAnswerId: number | undefined
    onSelect: (id: number) => void
    result: { correct: boolean; explanation: string; correct_answer_data?: any } | null
}

export default function MCQView({ answers, selectedAnswerId, onSelect, result }: MCQViewProps) {
    return (
        <div className="space-y-3">
            {answers.map((answer) => {
                const isSelected = selectedAnswerId === answer.id
                const isCorrect = result?.correct_answer_data === answer.id
                const isWrong = isSelected && result && !result.correct

                let borderColor = 'border-gray-200'
                let bgColor = 'bg-white'
                let icon = null

                if (result) {
                    if (isCorrect) {
                        borderColor = 'border-green-500'
                        bgColor = 'bg-green-50'
                        icon = <CheckCircle2 className="w-5 h-5 text-green-600" />
                    } else if (isWrong) {
                        borderColor = 'border-red-500'
                        bgColor = 'bg-red-50'
                        icon = <XCircle className="w-5 h-5 text-red-600" />
                    } else {
                        borderColor = 'border-gray-100'
                        bgColor = 'bg-gray-50/50 opacity-50'
                    }
                } else if (isSelected) {
                    borderColor = 'border-indigo-500'
                    bgColor = 'bg-indigo-50'
                }

                return (
                    <motion.button
                        whileHover={!result ? { scale: 1.01 } : {}}
                        whileTap={!result ? { scale: 0.99 } : {}}
                        key={answer.id}
                        onClick={() => !result && onSelect(answer.id)}
                        className={clsx(
                            "w-full text-left p-4 rounded-xl border-2 transition-all flex justify-between items-center group",
                            borderColor,
                            bgColor
                        )}
                    >
                        <span className={clsx("font-medium", isCorrect ? "text-green-800" : isWrong ? "text-red-800" : "text-gray-700")}>
                            {answer.content}
                        </span>
                        {icon ? (
                            icon
                        ) : (
                            <div className={clsx(
                                "w-5 h-5 rounded-full border-2 transition-all",
                                isSelected ? "border-indigo-600 border-[6px]" : "border-gray-300 group-hover:border-indigo-400"
                            )} />
                        )}
                    </motion.button>
                )
            })}
        </div>
    )
}
