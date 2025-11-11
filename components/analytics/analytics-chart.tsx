"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { TimeSeriesData } from "@/types/analytics"

interface AnalyticsChartProps {
  data: TimeSeriesData[]
  dataKey: string
  name: string
  color: string
}

export function AnalyticsChart({ data, dataKey, name, color }: AnalyticsChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis
          dataKey="date"
          stroke="#6b7280"
          fontSize={12}
          tickFormatter={(value) => {
            const date = new Date(value)
            return `${date.getMonth() + 1}/${date.getDate()}`
          }}
        />
        <YAxis stroke="#6b7280" fontSize={12} />
        <Tooltip
          contentStyle={{
            backgroundColor: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
          }}
          labelFormatter={(value) => {
            const date = new Date(value)
            return date.toLocaleDateString()
          }}
        />
        <Line
          type="monotone"
          dataKey={dataKey}
          stroke={color}
          strokeWidth={2}
          dot={{ fill: color, r: 4 }}
          activeDot={{ r: 6 }}
          name={name}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
