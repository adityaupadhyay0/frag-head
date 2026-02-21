"use client"

import { useMemo } from "react"

interface RadarGraphProps {
  accords: string[]
  size?: number
}

export default function RadarGraph({ accords, size = 200 }: RadarGraphProps) {
  // Mocking values for accords for visualization
  const data = useMemo(() => {
    return accords.slice(0, 6).map((label, i) => ({
      label,
      value: 0.6 + Math.random() * 0.4
    }))
  }, [accords])

  const center = size / 2
  const radius = size * 0.4
  const angleStep = (Math.PI * 2) / data.length

  const points = data.map((d, i) => {
    const x = center + radius * d.value * Math.cos(i * angleStep - Math.PI / 2)
    const y = center + radius * d.value * Math.sin(i * angleStep - Math.PI / 2)
    return { x, y }
  })

  const pathData = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ") + " Z"

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} className="overflow-visible">
        {/* Background Hexagon */}
        {[0.2, 0.4, 0.6, 0.8, 1].map((r, j) => (
          <path
            key={j}
            d={data.map((_, i) => {
              const x = center + radius * r * Math.cos(i * angleStep - Math.PI / 2)
              const y = center + radius * r * Math.sin(i * angleStep - Math.PI / 2)
              return `${i === 0 ? "M" : "L"} ${x} ${y}`
            }).join(" ") + " Z"}
            fill="none"
            stroke="rgba(255,255,255,0.05)"
            strokeWidth="1"
          />
        ))}

        {/* Data Path */}
        <path
          d={pathData}
          fill="rgba(168, 85, 247, 0.3)"
          stroke="#a855f7"
          strokeWidth="2"
          className="drop-shadow-[0_0_8px_#a855f7]"
        />

        {/* Labels */}
        {data.map((d, i) => {
          const x = center + (radius + 20) * Math.cos(i * angleStep - Math.PI / 2)
          const y = center + (radius + 20) * Math.sin(i * angleStep - Math.PI / 2)
          return (
            <text
              key={i}
              x={x}
              y={y}
              fontSize="8"
              fill="#06b6d4"
              textAnchor="middle"
              className="uppercase font-mono tracking-tighter"
            >
              {d.label}
            </text>
          )
        })}
      </svg>
    </div>
  )
}
