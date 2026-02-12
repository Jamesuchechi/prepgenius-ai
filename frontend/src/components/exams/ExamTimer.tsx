'use client'

import React, { useState, useEffect } from 'react'
import { AlertCircle, Clock } from 'lucide-react'

interface ExamTimerProps {
  durationMinutes: number
  onTimeUp?: () => void
  isTimeUp?: boolean
}

export function ExamTimer({ durationMinutes, onTimeUp, isTimeUp = false }: ExamTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState(durationMinutes * 60)
  const [hasNotified, setHasNotified] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        const newTime = prev - 1

        // Notify when 5 minutes left
        if (newTime === 5 * 60 && !hasNotified) {
          setHasNotified(true)
        }

        // Time is up
        if (newTime <= 0) {
          clearInterval(interval)
          onTimeUp?.()
          return 0
        }

        return newTime
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [onTimeUp, hasNotified])

  const minutes = Math.floor(timeRemaining / 60)
  const seconds = timeRemaining % 60
  const isWarning = timeRemaining <= 5 * 60
  const isCritical = timeRemaining <= 60

  return (
    <div
      className={`sticky top-0 z-40 bg-white border-b border-gray-200 p-4 flex items-center justify-between ${
        isCritical ? 'bg-red-50' : isWarning ? 'bg-yellow-50' : ''
      }`}
    >
      <div className="flex items-center gap-3">
        <Clock
          className={`w-5 h-5 ${
            isCritical ? 'text-red-600' : isWarning ? 'text-yellow-600' : 'text-blue-600'
          }`}
        />
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase">Time Remaining</p>
          <p
            className={`text-lg font-bold tabular-nums ${
              isCritical
                ? 'text-red-600'
                : isWarning
                ? 'text-yellow-600'
                : 'text-gray-900'
            }`}
          >
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </p>
        </div>
      </div>

      {/* Warning badge */}
      {isWarning && !isCritical && (
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-100 rounded-full">
          <AlertCircle className="w-4 h-4 text-yellow-600" />
          <span className="text-xs font-semibold text-yellow-600">5 minutes left</span>
        </div>
      )}

      {isCritical && (
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-100 rounded-full animate-pulse">
          <AlertCircle className="w-4 h-4 text-red-600" />
          <span className="text-xs font-semibold text-red-600">TIME CRITICAL</span>
        </div>
      )}
    </div>
  )
}
