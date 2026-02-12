'use client'

import React from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts'

interface TopicPerformance {
  name: string
  mastery: number
  status: 'weak' | 'average' | 'strong'
}

interface PerformanceChartProps {
  data: TopicPerformance[]
}

export function PerformanceChart({ data }: PerformanceChartProps) {
  const getColor = (status: string) => {
    switch (status) {
      case 'strong':
        return '#10b981'
      case 'average':
        return '#f59e0b'
      case 'weak':
        return '#ef4444'
      default:
        return '#6b7280'
    }
  }

  if (!data || data.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">
        <p>No performance data available</p>
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 60 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis
          dataKey="name"
          angle={-45}
          textAnchor="end"
          height={100}
          tick={{ fontSize: 12 }}
        />
        <YAxis domain={[0, 100]} label={{ value: 'Mastery Level (%)', angle: -90, position: 'insideLeft' }} />
        <Tooltip
          contentStyle={{
            backgroundColor: '#fff',
            border: '1px solid #ccc',
            borderRadius: '0.5rem',
          }}
          formatter={(value, name, props) => [
            `${value.toFixed(1)}%`,
            'Mastery Level',
          ]}
        />
        <Bar dataKey="mastery" radius={[8, 8, 0, 0]}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={getColor(entry.status)} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

export default PerformanceChart
