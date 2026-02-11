import React, { useState } from 'react'
import { motion, Reorder } from 'framer-motion'
import clsx from 'clsx'

// Assuming metadata format: { sequence: ["Event A", "Event B", "Event C"] } (Correct Order)
// We present them shuffled.

interface OrderingViewProps {
    metadata: { sequence: string[] }
    onUpdate: (sequence: string[]) => void
    result: { correct: boolean; explanation: string } | null
}

export default function OrderingView({ metadata, onUpdate, result }: OrderingViewProps) {
    const [items, setItems] = useState<string[]>(() => {
        // Shuffle on init
        const seq = [...metadata.sequence]
        return seq.sort(() => Math.random() - 0.5)
    })

    const handleReorder = (newOrder: string[]) => {
        if (result) return
        setItems(newOrder)
        onUpdate(newOrder)
    }

    return (
         <div className="space-y-4">
            <div className="text-xs font-bold text-gray-400 uppercase tracking-widest text-center mb-2">
                Drag to Order from First to Last/Top to Bottom
            </div>
            <Reorder.Group axis="y" values={items} onReorder={handleReorder} className="space-y-3">
                {items.map((item, index) => (
                    <Reorder.Item key={item} value={item}>
                         <motion.div 
                            className={clsx(
                                "p-4 rounded-xl border-2 font-medium cursor-grab active:cursor-grabbing shadow-sm flex items-center gap-4",
                                result 
                                    ? "bg-gray-50 border-gray-200"
                                    : "bg-white border-indigo-100 hover:border-indigo-300"
                            )}
                        >
                            <span className="w-6 h-6 flex items-center justify-center bg-gray-100 rounded-full text-xs font-bold text-gray-500">
                                {index + 1}
                            </span>
                            {item}
                        </motion.div>
                    </Reorder.Item>
                ))}
            </Reorder.Group>

            {result && !result.correct && (
                 <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-xl text-center text-sm">
                     Incorrect order.
                 </div>
            )}
        </div>
    )
}
