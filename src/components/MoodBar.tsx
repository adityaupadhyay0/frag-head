"use client"

import { motion } from "framer-motion"

interface MoodBarProps {
  label1: string
  label2: string
  value: number // 0 to 1
}

export default function MoodBar({ label1, label2, value }: MoodBarProps) {
  return (
    <div className="w-full space-y-1">
      <div className="flex justify-between text-[8px] text-white/50 uppercase tracking-tighter">
        <span>{label1}</span>
        <span>{label2}</span>
      </div>
      <div className="h-2 bg-white/5 relative overflow-hidden border border-white/10">
        <motion.div
          initial={{ left: "50%", width: 0 }}
          animate={{ left: value > 0.5 ? "50%" : `${value * 100}%`, width: `${Math.abs(value - 0.5) * 100}%` }}
          className="absolute h-full bg-retro-cyan retro-glow-cyan"
        />
        <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-white/20" />
      </div>
    </div>
  )
}
