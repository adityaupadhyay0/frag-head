"use client"

import { motion } from "framer-motion"

interface ProjectionTimelineProps {
  longevity: string
}

export default function ProjectionTimeline({ longevity }: ProjectionTimelineProps) {
  const hours = longevity === "Eternal" ? 12 : longevity === "Long-lasting" ? 8 : 4

  return (
    <div className="w-full space-y-2">
      <div className="flex justify-between text-[8px] text-retro-cyan uppercase tracking-widest">
        <span>Projection</span>
        <span>{longevity}</span>
      </div>
      <div className="h-4 flex gap-1 items-end">
        {Array.from({ length: 12 }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ height: 0 }}
            animate={{ height: `${Math.max(10, 100 - (i * 100 / hours))}% ` }}
            transition={{ delay: i * 0.1, duration: 0.5 }}
            className={`flex-1 ${i < hours ? "bg-retro-lavender" : "bg-white/5"} ${i < hours ? "retro-glow-lavender" : ""}`}
          />
        ))}
      </div>
      <div className="flex justify-between text-[6px] text-white/30">
        <span>0H</span>
        <span>6H</span>
        <span>12H</span>
      </div>
    </div>
  )
}
