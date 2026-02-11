import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff, Sparkles, PenTool } from 'lucide-react'

interface TheoryViewProps {
    questionId: number
    onSubmit: (text: string) => void
    result: { correct: boolean; explanation: string } | null
}

export default function TheoryView({ onSubmit, result }: TheoryViewProps) {
    const [text, setText] = useState('')
    const [showAnswer, setShowAnswer] = useState(false)
    const [isFocused, setIsFocused] = useState(false)

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newVal = e.target.value
        setText(newVal)
        onSubmit(newVal)
    }

    return (
        <div className="space-y-4">
            <div className="relative group">
                <div className={`
          absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl opacity-0 transition duration-500 group-hover:opacity-30
          ${isFocused ? 'opacity-100' : ''}
        `} />

                <div className="relative bg-white rounded-xl">
                    <textarea
                        className="w-full h-48 p-5 rounded-xl border-2 border-gray-100 focus:border-transparent outline-none resize-none transition-all text-gray-700 text-lg leading-relaxed placeholder:text-gray-300 relative z-10 bg-white"
                        placeholder="Write your comprehensive answer here..."
                        value={text}
                        onChange={handleChange}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        disabled={!!result}
                    />

                    <div className="absolute bottom-4 right-4 flex items-center gap-2 text-xs font-bold pointer-events-none z-20">
                        <span className={`${text.length > 0 ? 'text-indigo-500' : 'text-gray-300'}`}>
                            {text.length} characters
                        </span>
                        {text.length > 0 && <PenTool className="w-3 h-3 text-indigo-500" />}
                    </div>
                </div>
            </div>

            {result && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6"
                >
                    <button
                        onClick={() => setShowAnswer(!showAnswer)}
                        className="flex items-center gap-2 text-sm font-bold text-indigo-600 hover:text-indigo-800 transition-colors bg-indigo-50 px-4 py-2 rounded-full"
                    >
                        {showAnswer ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        {showAnswer ? 'Hide AI Solution' : 'Reveal AI Solution'}
                    </button>

                    <AnimatePresence>
                        {showAnswer && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="overflow-hidden"
                            >
                                <div className="mt-4 p-6 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl border border-indigo-100 shadow-inner">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Sparkles className="w-5 h-5 text-indigo-500" />
                                        <h4 className="font-bold text-sm uppercase tracking-wider text-indigo-600">Model Answer</h4>
                                    </div>
                                    <p className="text-indigo-900 leading-relaxed whitespace-pre-wrap">
                                        {result.explanation}
                                    </p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            )}
        </div>
    )
}
