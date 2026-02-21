"use client"

import { Fragrance, UserPreferences } from "@/types"
import { findMatches } from "@/lib/engine"
import FragranceCard from "./FragranceCard"
import { motion } from "framer-motion"
import { useState, useMemo } from "react"

interface ResultsViewProps {
  prefs: UserPreferences
  onRestart: () => void
}

export default function ResultsView({ prefs, onRestart }: ResultsViewProps) {
  const matches = useMemo(() => findMatches(prefs), [prefs])
  const [currentIndex, setCurrentIndex] = useState(0)

  return (
    <div className="w-full space-y-8 pb-20">
      <div className="flex justify-between items-end border-b border-white/10 pb-4">
        <div>
          <h2 className="text-sm text-retro-cyan uppercase tracking-[0.5em]">Identity Matches Found</h2>
          <p className="text-[10px] text-white/40 uppercase">Displaying {currentIndex + 1} of {matches.length}</p>
        </div>
        <button
          onClick={onRestart}
          className="text-[10px] text-retro-lavender hover:text-white uppercase tracking-widest border border-retro-lavender/30 px-3 py-1 hover:bg-retro-lavender/20 transition-colors"
        >
          Reset_Core
        </button>
      </div>

      <div className="relative">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full"
        >
          <FragranceCard fragrance={matches[currentIndex]} prefs={prefs} />
        </motion.div>

        {/* Navigation */}
        <div className="flex justify-center gap-4 mt-8">
          <button
            disabled={currentIndex === 0}
            onClick={() => setCurrentIndex(prev => prev - 1)}
            className="pixel-border px-6 py-2 disabled:opacity-30 uppercase text-xs hover:bg-white/5"
          >
            Prev
          </button>
          <button
            disabled={currentIndex === matches.length - 1}
            onClick={() => setCurrentIndex(prev => prev + 1)}
            className="pixel-border px-6 py-2 disabled:opacity-30 uppercase text-xs hover:bg-white/5"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  )
}
