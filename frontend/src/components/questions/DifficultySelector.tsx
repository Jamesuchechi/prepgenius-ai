'use client'

import React from 'react'

interface DifficultySelectorProps {
    value: string
    onChange: (value: string) => void
}

const difficulties = [
    { id: 'EASY', label: 'Easy', icon: '🌱' },
    { id: 'MEDIUM', label: 'Medium', icon: '⚖️' },
    { id: 'HARD', label: 'Hard', icon: '🔥' },
]

export default function DifficultySelector({ value, onChange }: DifficultySelectorProps) {
    return (
        <div className="grid grid-cols-3 gap-4">
            {difficulties.map((difficulty) => (
                <button
                    key={difficulty.id}
                    type="button"
                    onClick={() => onChange(difficulty.id)}
                    className={`
            flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all duration-300
            ${value === difficulty.id
                            ? 'border-[var(--orange)] bg-[var(--orange)]/5 shadow-md scale-[1.02]'
                            : 'border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50'
                        }
          `}
                >
                    <span className="text-2xl mb-2">{difficulty.icon}</span>
                    <span className={`font-bold ${value === difficulty.id ? 'text-[var(--orange)]' : 'text-[var(--gray-dark)]'}`}>
                        {difficulty.label}
                    </span>
                </button>
            ))}
        </div>
    )
}
