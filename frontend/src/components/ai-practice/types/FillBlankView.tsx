import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import clsx from 'clsx'
import { Check, X } from 'lucide-react'

interface FillBlankViewProps {
    onSubmit: (answer: string) => void
    result: { correct: boolean; explanation: string; correct_answer_data?: any } | null
}

export default function FillBlankView({ onSubmit, result }: FillBlankViewProps) {
    const [answer, setAnswer] = useState('')

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value
        setAnswer(val)
        onSubmit(val)
    }

    return (
        <div className="space-y-6">
            <div className="relative">
                <input
                    type="text"
                    value={answer}
                    onChange={handleChange}
                    disabled={!!result}
                    placeholder="Type your answer here..."
                    className={clsx(
                        "w-full p-4 text-lg border-2 rounded-xl outline-none transition-all placeholder:text-gray-400 bg-white",
                        result
                            ? result.correct
                                ? "border-green-500 bg-green-50 text-green-900"
                                : "border-red-500 bg-red-50 text-red-900"
                            : "border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                    )}
                />
                {result && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                        {result.correct ? (
                            <Check className="w-6 h-6 text-green-600" />
                        ) : (
                            <X className="w-6 h-6 text-red-600" />
                        )}
                    </div>
                )}
            </div>

            {result && !result.correct && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-green-50 border border-green-200 rounded-lg"
                >
                    <span className="text-sm font-bold text-green-800 uppercase tracking-wider block mb-1">Correct Answer</span>
                    <span className="text-lg font-medium text-green-900">{result.correct_answer_data}</span>
                </motion.div>
            )}
        </div>
    )
}
