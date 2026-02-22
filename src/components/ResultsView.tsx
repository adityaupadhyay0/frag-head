"use client"

import { Fragrance, UserPreferences } from "@/types"
import FragranceCard from "./FragranceCard"
import { motion, AnimatePresence } from "framer-motion"
import { useState, useEffect } from "react"
import { Globe, Loader2, Info } from "lucide-react"
import { fragranceFacts } from "@/data/fragranceFacts"

interface ResultsViewProps {
  prefs: UserPreferences
  onRestart: () => void
  onAddToLayerLab: (fragrance: Fragrance) => void
}

export default function ResultsView({ prefs, onRestart, onAddToLayerLab }: ResultsViewProps) {
  const [internetMatches, setInternetMatches] = useState<Fragrance[]>([])
  const [loading, setLoading] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [factIndex, setFactIndex] = useState(0)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    handleSearch()

    // Cycle facts every 5 seconds
    const interval = setInterval(() => {
      setFactIndex(prev => (prev + 1) % fragranceFacts.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [prefs])

  const handleSearch = async () => {
    setLoading(true)
    setError(null)
    setInternetMatches([])
    setCurrentIndex(0)

    try {
      const response = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(prefs),
      })

      if (!response.ok) throw new Error("Search failed")
      if (!response.body) throw new Error("No response body")

      const reader = response.body.getReader()
      const decoder = new TextEncoder().encode("").constructor === Uint8Array ? new TextDecoder() : null;
      if (!decoder) throw new Error("Decoder not available");

      let accumulatedText = ""

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        accumulatedText += decoder.decode(value, { stream: true })

        // Try to parse the accumulated text as a JSON array or partial array
        // This is a simple way to get objects as they come in
        try {
          // Find all complete JSON objects in the array
          const cleanText = accumulatedText.trim()

          // Basic heuristic: look for complete objects { ... } within the array [ ... ]
          // This is not perfect but works for many cases if the AI streams well
          const match = cleanText.match(/\[([\s\S]*)\]?/)
          if (match && match[1]) {
            const content = match[1]
            // Split by objects - this is tricky with nested objects
            // For now, let's try to parse the whole thing and if it fails, try a trimmed version
            try {
                // If it ends with a closing brace but no closing bracket, try adding it
                let jsonToParse = cleanText
                if (!jsonToParse.endsWith("]")) {
                    // Try to find the last complete object
                    const lastBraceIndex = jsonToParse.lastIndexOf("}")
                    if (lastBraceIndex !== -1) {
                        jsonToParse = jsonToParse.substring(0, lastBraceIndex + 1) + "]"
                        // Check if it's a valid array start
                        if (!jsonToParse.startsWith("[")) jsonToParse = "[" + jsonToParse
                    } else {
                        continue // No complete object yet
                    }
                }
                const parsed = JSON.parse(jsonToParse) as Fragrance[]
                if (Array.isArray(parsed) && parsed.length > internetMatches.length) {
                    setInternetMatches(parsed)
                }
            } catch (e) {
                // Ignore parse errors for partial JSON
            }
          }
        } catch (e) {
            // Partial JSON
        }
      }

      // Final parse
      try {
          const jsonMatch = accumulatedText.match(/\[[\s\S]*\]/);
          if (jsonMatch) {
              const finalParsed = JSON.parse(jsonMatch[0]) as Fragrance[];
              setInternetMatches(finalParsed);
          }
      } catch (e) {
          console.error("Final parse error", e);
      }

    } catch (err: any) {
      console.error(err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full space-y-8 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-white/10 pb-4 gap-4">
        <div>
          <h2 className="text-sm text-retro-cyan uppercase tracking-[0.5em]">
            Global Knowledge Discovery
          </h2>
          <p className="text-[10px] text-white/40 uppercase">
            {internetMatches.length > 0 ? `Displaying ${currentIndex + 1} of ${internetMatches.length}` : "Initializing AI Scan..."}
          </p>
        </div>

        <div className="flex gap-2 w-full md:w-auto">
          <button
            onClick={onRestart}
            className="text-[10px] text-white/40 hover:text-white uppercase tracking-widest border border-white/10 px-3 py-1 transition-colors"
          >
            Reset
          </button>
        </div>
      </div>

      <div className="relative">
        <AnimatePresence mode="wait">
          {loading && internetMatches.length === 0 ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full min-h-[400px] flex flex-col items-center justify-center space-y-8 pixel-border border-dashed border-white/10 p-8"
            >
              <div className="relative w-16 h-16">
                 <div className="absolute inset-0 border-2 border-retro-lavender animate-ping opacity-20" />
                 <Globe className="w-16 h-16 text-retro-lavender animate-pulse" />
              </div>
              <div className="text-center space-y-4 max-w-md">
                <p className="text-xs text-retro-lavender uppercase tracking-[0.4em] animate-pulse">Scanning Global Fragrance Networks...</p>

                <motion.div
                  key={factIndex}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-4 bg-white/5 pixel-border border-white/5 space-y-2"
                >
                  <div className="flex items-center gap-2 text-[8px] text-retro-cyan uppercase tracking-widest">
                    <Info size={10} />
                    Fragrance_{fragranceFacts[factIndex].category}
                  </div>
                  <p className="text-[10px] text-white/60 leading-relaxed uppercase italic">
                    "{fragranceFacts[factIndex].fact}"
                  </p>
                </motion.div>

                <p className="text-[8px] text-white/20 uppercase tracking-[0.2em]">Accessing decentralized scent databases</p>
              </div>
            </motion.div>
          ) : error ? (
            <div className="w-full h-64 flex flex-col items-center justify-center pixel-border border-dashed border-red-500/30">
                <p className="text-xs text-red-400 uppercase tracking-widest">Search failed: {error}</p>
                <button onClick={handleSearch} className="mt-4 text-[10px] text-retro-lavender uppercase underline">Try Again</button>
            </div>
          ) : internetMatches.length > 0 ? (
            <motion.div
              key={internetMatches[currentIndex]?.id || currentIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="w-full"
            >
              <FragranceCard
                fragrance={internetMatches[currentIndex]}
                prefs={prefs}
                onAddToLayerLab={onAddToLayerLab}
              />
            </motion.div>
          ) : (
             <div className="w-full h-64 flex flex-col items-center justify-center pixel-border border-dashed border-white/10">
                <p className="text-xs text-white/20 uppercase tracking-widest">
                  No global results found
                </p>
                <button onClick={onRestart} className="mt-4 text-[10px] text-retro-lavender uppercase underline">Start Over</button>
             </div>
          )}
        </AnimatePresence>

        {/* Navigation */}
        {internetMatches.length > 0 && (
          <div className="flex justify-between items-center mt-8">
            <div className="flex gap-4">
                <button
                disabled={currentIndex === 0}
                onClick={() => setCurrentIndex(prev => prev - 1)}
                className="pixel-border px-6 py-2 disabled:opacity-30 uppercase text-xs hover:bg-white/5 transition-colors"
                >
                Prev
                </button>
                <button
                disabled={currentIndex === internetMatches.length - 1}
                onClick={() => setCurrentIndex(prev => prev + 1)}
                className="pixel-border px-6 py-2 disabled:opacity-30 uppercase text-xs hover:bg-white/5 transition-colors"
                >
                Next
                </button>
            </div>

            {loading && (
                <div className="flex items-center gap-2 text-retro-lavender text-[10px] uppercase animate-pulse">
                    <Loader2 size={12} className="animate-spin" />
                    Finding more matches...
                </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
