"use client"

import { useState } from "react"
import { Fragrance } from "@/types"
import fragrancesData from "@/data/fragrances.json"
import { predictLayering } from "@/lib/gemini"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

const fragrances = fragrancesData as Fragrance[]

export default function LayerLab() {
  const [f1, setF1] = useState<Fragrance | null>(null)
  const [f2, setF2] = useState<Fragrance | null>(null)
  const [result, setResult] = useState<{outcome: string, vibe: string, risk: string} | null>(null)
  const [loading, setLoading] = useState(false)

  const handlePredict = async () => {
    if (!f1 || !f2) return
    setLoading(true)
    const data = await predictLayering(f1, f2)
    setResult(data)
    setLoading(false)
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-6 pixel-border bg-retro-black/80 space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-retro-lavender tracking-widest uppercase">Layer Lab</h2>
        <p className="text-[10px] text-retro-cyan uppercase mt-2">Experimental Combination Analysis</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Selection 1 */}
        <div className="space-y-4">
          <label className="text-[10px] text-white/40 uppercase tracking-widest">Base Scent</label>
          <select
            className="w-full bg-retro-navy pixel-border p-2 text-xs uppercase"
            onChange={(e) => setF1(fragrances.find(f => f.id === e.target.value) || null)}
          >
            <option value="">Select Fragrance...</option>
            {fragrances.map(f => <option key={f.id} value={f.id}>{f.brand} - {f.name}</option>)}
          </select>
        </div>

        {/* Selection 2 */}
        <div className="space-y-4">
          <label className="text-[10px] text-white/40 uppercase tracking-widest">Top Scent</label>
          <select
            className="w-full bg-retro-navy pixel-border p-2 text-xs uppercase"
            onChange={(e) => setF2(fragrances.find(f => f.id === e.target.value) || null)}
          >
            <option value="">Select Fragrance...</option>
            {fragrances.map(f => <option key={f.id} value={f.id}>{f.brand} - {f.name}</option>)}
          </select>
        </div>
      </div>

      <div className="flex justify-center">
        <button
          disabled={!f1 || !f2 || loading}
          onClick={handlePredict}
          className="pixel-border px-8 py-3 bg-retro-lavender/20 hover:bg-retro-lavender/40 disabled:opacity-20 uppercase text-sm tracking-widest"
        >
          {loading ? "Simulating..." : "Calculate Fusion"}
        </button>
      </div>

      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 border border-retro-cyan/30 bg-retro-cyan/5 space-y-4"
          >
            <div className="flex justify-between items-center border-b border-retro-cyan/20 pb-2">
              <span className="text-xs text-retro-cyan uppercase font-bold">Fusion Result</span>
              <span className={cn(
                "text-[10px] px-2 py-1 uppercase",
                result.risk === "Safe" ? "bg-green-500/20 text-green-400" :
                result.risk === "Experimental" ? "bg-yellow-500/20 text-yellow-400" :
                "bg-red-500/20 text-red-400"
              )}>
                Risk: {result.risk}
              </span>
            </div>
            <p className="text-sm text-retro-slate leading-relaxed">{result.outcome}</p>
            <div className="text-[10px] text-retro-lavender uppercase tracking-widest">
              Emergent Vibe: {result.vibe}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
