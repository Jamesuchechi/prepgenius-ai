import React from 'react'
import { motion } from 'framer-motion'
import clsx from 'clsx'
import { CheckCircle2, XCircle } from 'lucide-react'

interface TrueFalseViewProps {
    onSelect: (answer: string) => void
    selectedAnswer: string | undefined
    result: { correct: boolean; explanation: string; correct_answer_data?: any } | null
}

export default function TrueFalseView({ onSelect, selectedAnswer, result }: TrueFalseViewProps) {
    const options = ['True', 'False']

    return (
        <div className="grid grid-cols-2 gap-4">
            {options.map((option) => {
                const isSelected = selectedAnswer === option
                // If result exists, check if this option matches the correct answer string (case-insensitive)
                const isCorrect = result && String(result.correct_answer_data).toLowerCase() === option.toLowerCase()
                const isWrong = isSelected && result && !result.correct

                let borderColor = 'border-gray-200'
                let bgColor = 'bg-white'
                let textColor = 'text-gray-700'
                let icon = null

                if (result) {
                    if (isCorrect) {
                        borderColor = 'border-green-500'
                        bgColor = 'bg-green-50'
                        textColor = 'text-green-800'
                        icon = <CheckCircle2 className="w-6 h-6 text-green-600" />
                    } else if (isWrong) {
                        borderColor = 'border-red-500'
                        bgColor = 'bg-red-50'
                        textColor = 'text-red-800'
                        icon = <XCircle className="w-6 h-6 text-red-600" />
                    } else {
                        borderColor = 'border-gray-100'
                        bgColor = 'bg-gray-50/50 opacity-50'
                    }
                } else if (isSelected) {
                    borderColor = 'border-indigo-500'
                    bgColor = 'bg-indigo-50'
                    textColor = 'text-indigo-700'
                }

                return (
                    <motion.button
                        key={option}
                        whileHover={!result ? { scale: 1.02 } : {}}
                        whileTap={!result ? { scale: 0.98 } : {}}
                        onClick={() => !result && onSelect(option)}
                        className={clsx(
                            "flex flex-col items-center justify-center p-8 rounded-2xl border-2 transition-all gap-3 h-40",
                            borderColor,
                            bgColor
                        )}
                    >
                        {icon}
                        <span className={clsx("text-2xl font-bold", textColor)}>
                            {option}
                        </span>
                    </motion.button>
                )
            })}
        </div>
    )
}
