"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Fragrance, LayeringResult } from "@/types"
import { predictLayeringAction } from "@/app/actions"
import RadarGraph from "./RadarGraph"
import ScentAura from "./ScentAura"
import { cn } from "@/lib/utils"
import { Loader2, FlaskConical, Plus, X, Download } from "lucide-react"

interface LayerLabProps {
  initialFragrances?: Fragrance[]
  onClear?: () => void
}

export default function LayerLab({ initialFragrances = [], onClear }: LayerLabProps) {
  const [frag1, setFrag1] = useState<string>(initialFragrances[0]?.name || "")
  const [frag2, setFrag2] = useState<string>(initialFragrances[1]?.name || "")
  const [result, setResult] = useState<LayeringResult | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
      if (initialFragrances.length >= 1) setFrag1(initialFragrances[0].name)
      if (initialFragrances.length >= 2) setFrag2(initialFragrances[1].name)
  }, [initialFragrances])

  const handlePredict = async () => {
    if (!frag1 || !frag2) return
    setLoading(true)
    setResult(null)

    // Find if we have full fragrance data for these names
    const f1 = initialFragrances.find(f => f.name === frag1) || { name: frag1 }
    const f2 = initialFragrances.find(f => f.name === frag2) || { name: frag2 }

    try {
      const prediction = await predictLayeringAction(f1, f2) as LayeringResult
      setResult(prediction)
    } catch (error) {
      console.error("Layering prediction failed:", error)
    } finally {
      setLoading(false)
    }
  }

  const downloadReport = () => {
    if (!result) return;
    const reportText = `
FRAG-HEAD LAYER LAB REPORT
--------------------------
Base: ${frag1}
Layer: ${frag2}

VIBE: ${result.vibe}
RISK: ${result.risk}

OUTCOME:
${result.outcome}

ACCORDS:
${result.accords.join(", ")}

NOTES:
Top: ${result.notes.top.join(", ")}
Heart: ${result.notes.mid.join(", ")}
Base: ${result.notes.base.join(", ")}
    `.trim();

    const blob = new Blob([reportText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `layer-report-${frag1.replace(/\s+/g, "-")}-${frag2.replace(/\s+/g, "-")}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const resultFragrance: Fragrance | null = result ? {
    id: "layer-result",
    name: "Layered Creation",
    brand: `${frag1} + ${frag2}`,
    gender: "Unisex",
    accords: result.accords,
    vibe: result.vibe,
    notes: result.notes,
    season: "All",
    longevity: "Medium",
    sillage: "Medium",
    occasion: [],
    style: [],
    mood: [],
    weather: [],
    price_range: "Custom",
    colors: result.colors
  } : null

  return (
    <div className="w-full max-w-4xl mx-auto space-y-12 pb-20">
      <div className="text-center space-y-4">
        <div className="flex justify-center">
            <div className="p-4 pixel-border bg-retro-lavender/10 text-retro-lavender">
                <FlaskConical size={32} />
            </div>
        </div>
        <h2 className="text-2xl md:text-4xl font-bold text-white tracking-[0.5em] uppercase">Layer Lab</h2>
        <p className="text-[10px] text-white/40 uppercase tracking-widest">Experimental Scent Intersection & Molecular Synthesis</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <label className="text-[10px] text-retro-cyan uppercase tracking-[0.3em] block">Base Fragrance</label>
          <div className="relative">
            <input
              type="text"
              value={frag1}
              onChange={(e) => setFrag1(e.target.value)}
              placeholder="ENTER FRAGRANCE NAME..."
              className="w-full bg-transparent pixel-border p-4 text-white text-xs md:text-sm uppercase tracking-widest focus:outline-none focus:bg-white/5 placeholder:text-white/20"
            />
            {frag1 && (
                <button onClick={() => setFrag1("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-white">
                    <X size={14} />
                </button>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <label className="text-[10px] text-retro-lavender uppercase tracking-[0.3em] block">Layering Fragrance</label>
          <div className="relative">
            <input
              type="text"
              value={frag2}
              onChange={(e) => setFrag2(e.target.value)}
              placeholder="ENTER FRAGRANCE NAME..."
              className="w-full bg-transparent pixel-border p-4 text-white text-xs md:text-sm uppercase tracking-widest focus:outline-none focus:bg-white/5 placeholder:text-white/20"
            />
             {frag2 && (
                <button onClick={() => setFrag2("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-white">
                    <X size={14} />
                </button>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-center">
        <button
          onClick={handlePredict}
          disabled={!frag1 || !frag2 || loading}
          className={cn(
            "pixel-border px-12 py-4 text-sm uppercase tracking-[0.5em] transition-all",
            loading ? "opacity-50 cursor-not-allowed" : "hover:bg-retro-lavender/20 text-retro-lavender border-retro-lavender"
          )}
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="animate-spin" size={16} />
              Synthesizing...
            </span>
          ) : "Predict_Outcome"}
        </button>
      </div>

      <AnimatePresence>
        {result && resultFragrance && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-12 border-t border-white/10"
          >
            {/* Left: Metadata */}
            <div className="space-y-8">
                <div className="space-y-2">
                    <h3 className="text-[10px] text-retro-cyan uppercase tracking-[0.3em]">Experimental Vibe</h3>
                    <p className="text-xl font-bold text-white uppercase tracking-wider">{result.vibe}</p>
                </div>

                <div className="space-y-2">
                    <h3 className="text-[10px] text-retro-cyan uppercase tracking-[0.3em]">Risk Level</h3>
                    <div className={cn(
                        "inline-block px-3 py-1 text-[10px] uppercase tracking-widest pixel-border",
                        result.risk === "Safe" ? "text-green-400 border-green-400/30" :
                        result.risk === "Experimental" ? "text-retro-lavender border-retro-lavender/30" :
                        "text-red-500 border-red-500/30"
                    )}>
                        {result.risk}
                    </div>
                </div>

                <div className="space-y-4">
                    <h3 className="text-[10px] text-retro-cyan uppercase tracking-[0.3em]">Predicted Accords</h3>
                    <RadarGraph accords={result.accords} />
                </div>
            </div>

            {/* Middle: Outcome Story */}
            <div className="space-y-8 bg-white/5 p-8 pixel-border">
                <div className="space-y-4">
                    <h3 className="text-[10px] text-white/40 uppercase tracking-[0.4em]">Olfactory Outcome</h3>
                    <p className="text-sm leading-relaxed text-retro-slate italic">
                        "{result.outcome}"
                    </p>
                </div>

                <div className="space-y-4">
                    <h3 className="text-[10px] text-white/40 uppercase tracking-[0.4em]">Note Synthesis</h3>
                    <div className="space-y-2">
                        <div className="text-[10px] uppercase tracking-widest"><span className="text-retro-cyan">Top:</span> {result.notes.top.join(", ")}</div>
                        <div className="text-[10px] uppercase tracking-widest"><span className="text-retro-lavender">Heart:</span> {result.notes.mid.join(", ")}</div>
                        <div className="text-[10px] uppercase tracking-widest"><span className="text-white/60">Base:</span> {result.notes.base.join(", ")}</div>
                    </div>
                </div>

                <div className="pt-4 border-t border-white/10">
                    <button
                        onClick={downloadReport}
                        className="flex items-center gap-2 text-[10px] text-retro-lavender hover:text-white uppercase tracking-widest transition-colors"
                    >
                        <Download size={14} />
                        Download_Report.TXT
                    </button>
                </div>
            </div>

            {/* Right: Scent Aura */}
            <div className="flex flex-col items-center justify-center space-y-6">
                 <h3 className="text-[10px] text-white/40 uppercase tracking-[0.4em]">Synthetic Scent Aura</h3>
                 <ScentAura fragrance={resultFragrance} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
