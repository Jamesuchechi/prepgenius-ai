import React, { useState } from 'react'
import { motion, Reorder } from 'framer-motion'
import clsx from 'clsx'

// Assuming metadata format: { pairs: [{item: "A", match: "1"}, {item: "B", match: "2"}] }
// We present items on left (fixed) and matches on right (draggable reorder)

interface MatchingViewProps {
    metadata: { pairs: { item: string; match: string }[] }
    onUpdate: (pairs: { item: string; match: string }[]) => void
    result: { correct: boolean; explanation: string } | null
}

export default function MatchingView({ metadata, onUpdate, result }: MatchingViewProps) {
    // Initial state: Pairs are shuffled or just initial list.
    // Actually typically "items" are fixed order, "matches" are shuffled.
    // Let's separate them.

    // We need to maintain the current state of matches in order relative to items.
    // Let's assume on mount we initialize the state.

    const [userMatches, setUserMatches] = useState<string[]>(() => {
        // Initialize with shuffled matches
        const matches = metadata.pairs.map(p => p.match)
        // Simple shuffle
        return [...matches].sort(() => Math.random() - 0.5)
    })

    const handleReorder = (newOrder: string[]) => {
        if (result) return // Locked
        setUserMatches(newOrder)
        // Reconstruct pairs to pass back
        const currentPairs = metadata.pairs.map((p, index) => ({
            item: p.item,
            match: newOrder[index]
        }))
        onUpdate(currentPairs)
    }

    return (
        <div className="grid grid-cols-2 gap-8">
            {/* Fixed Items Column */}
            <div className="space-y-3">
                <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Items</div>
                {metadata.pairs.map((p, i) => (
                    <div key={i} className="h-16 flex items-center px-4 bg-gray-50 border border-gray-200 rounded-xl font-medium text-gray-700">
                        {p.item}
                    </div>
                ))}
            </div>

            {/* Draggable Matches Column */}
            <div>
                <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Matches (Drag to Reorder)</div>
                <Reorder.Group axis="y" values={userMatches} onReorder={handleReorder} className="space-y-3">
                    {userMatches.map((match) => (
                        <Reorder.Item key={match} value={match}>
                            <motion.div
                                className={clsx(
                                    "h-16 flex items-center px-4 rounded-xl border-2 font-medium cursor-grab active:cursor-grabbing shadow-sm",
                                    result
                                        ? "border-gray-200 bg-white" // We generally color code correctness differently for matching, complex
                                        : "bg-white border-indigo-100 hover:border-indigo-300"
                                )}
                            >
                                {match}
                            </motion.div>
                        </Reorder.Item>
                    ))}
                </Reorder.Group>
            </div>

            {result && !result.correct && (
                <div className="col-span-2 mt-4 p-4 bg-red-50 text-red-700 rounded-xl text-center text-sm">
                    Matching incorrect. Review the items.
                </div>
            )}

        </div>
    )
}
