"use client"

import { Fragrance, UserPreferences } from "@/types"
import { findMatches } from "@/lib/engine"
import FragranceCard from "./FragranceCard"
import { motion, AnimatePresence } from "framer-motion"
import { useState, useMemo, useEffect } from "react"
import { searchInternetFragrances, rankLocalMatches } from "@/lib/gemini"
import { Sparkles, Globe, Loader2, Database } from "lucide-react"
import fragrancesData from "@/data/fragrances.json"

const fragrances = fragrancesData as Fragrance[]

interface ResultsViewProps {
  prefs: UserPreferences
  onRestart: () => void
}

export default function ResultsView({ prefs, onRestart }: ResultsViewProps) {
  const [localMatches, setLocalMatches] = useState<Fragrance[]>(findMatches(prefs))
  const [internetMatches, setInternetMatches] = useState<Fragrance[]>([])
  const [loadingInternet, setLoadingInternet] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [viewMode, setViewMode] = useState<"local" | "internet">("local")

  const currentMatches = viewMode === "local" ? localMatches : internetMatches

  useEffect(() => {
    if ((prefs as any)._autoGlobal) {
      handleInternetSearch()
    }
    // Enhance local matches with AI ranking
    rankLocalMatches(prefs, fragrances).then(ranked => {
        if (ranked && ranked.length > 0) setLocalMatches(ranked)
    })
  }, [prefs])

  const handleInternetSearch = async () => {
    if (internetMatches.length > 0) {
      setViewMode("internet")
      setCurrentIndex(0)
      return
    }
    setLoadingInternet(true)
    try {
      const results = await searchInternetFragrances(prefs)
      setInternetMatches(results)
      setViewMode("internet")
      setCurrentIndex(0)
    } catch (error) {
      console.error(error)
    } finally {
      setLoadingInternet(false)
    }
  }

  return (
    <div className="w-full space-y-8 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-white/10 pb-4 gap-4">
        <div>
          <h2 className="text-sm text-retro-cyan uppercase tracking-[0.5em]">
            {viewMode === "local" ? "Identity Matches Found" : "Global Knowledge Discovery"}
          </h2>
          <p className="text-[10px] text-white/40 uppercase">
            Displaying {currentIndex + 1} of {currentMatches.length}
          </p>
        </div>

        <div className="flex gap-2 w-full md:w-auto">
          <button
            onClick={() => { setViewMode("local"); setCurrentIndex(0); }}
            className={`flex-1 md:flex-none text-[10px] uppercase tracking-widest border px-3 py-1 transition-colors flex items-center justify-center gap-2 ${
              viewMode === "local"
                ? "text-retro-cyan border-retro-cyan bg-retro-cyan/10"
                : "text-white/40 border-white/10 hover:text-white"
            }`}
          >
            <Database size={10} />
            Local_Vault
          </button>
          <button
            onClick={handleInternetSearch}
            disabled={loadingInternet}
            className={`flex-1 md:flex-none text-[10px] uppercase tracking-widest border px-3 py-1 transition-colors flex items-center justify-center gap-2 ${
              viewMode === "internet"
                ? "text-retro-lavender border-retro-lavender bg-retro-lavender/10"
                : "text-white/40 border-white/10 hover:text-white"
            }`}
          >
            {loadingInternet ? (
              <Loader2 size={10} className="animate-spin" />
            ) : (
              <Globe size={10} />
            )}
            {internetMatches.length > 0 ? "Global_Results" : "Search_Internet"}
          </button>
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
          {loadingInternet ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full h-64 flex flex-col items-center justify-center space-y-4 pixel-border border-dashed border-white/10"
            >
              <div className="relative w-16 h-16">
                 <div className="absolute inset-0 border-2 border-retro-lavender animate-ping opacity-20" />
                 <Globe className="w-16 h-16 text-retro-lavender animate-pulse" />
              </div>
              <div className="text-center space-y-2">
                <p className="text-xs text-retro-lavender uppercase tracking-[0.4em] animate-pulse">Scanning Global Fragrance Networks...</p>
                <p className="text-[8px] text-white/20 uppercase tracking-[0.2em]">Accessing decentralized scent databases</p>
              </div>
            </motion.div>
          ) : currentMatches.length > 0 ? (
            <motion.div
              key={`${viewMode}-${currentIndex}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="w-full"
            >
              <FragranceCard fragrance={currentMatches[currentIndex]} prefs={prefs} />
            </motion.div>
          ) : (
             <div className="w-full h-64 flex flex-col items-center justify-center pixel-border border-dashed border-white/10">
                <p className="text-xs text-white/20 uppercase tracking-widest">
                  {viewMode === "local" ? "No matches found in local vault" : "No global results found"}
                </p>
                {viewMode === "local" ? (
                  <button onClick={handleInternetSearch} className="mt-4 text-[10px] text-retro-lavender uppercase underline">Try Global Search</button>
                ) : (
                  <button onClick={() => setViewMode("local")} className="mt-4 text-[10px] text-retro-cyan uppercase underline">Return to Vault</button>
                )}
             </div>
          )}
        </AnimatePresence>

        {/* Navigation */}
        {!loadingInternet && currentMatches.length > 0 && (
          <div className="flex justify-center gap-4 mt-8">
            <button
              disabled={currentIndex === 0}
              onClick={() => setCurrentIndex(prev => prev - 1)}
              className="pixel-border px-6 py-2 disabled:opacity-30 uppercase text-xs hover:bg-white/5 transition-colors"
            >
              Prev
            </button>
            <button
              disabled={currentIndex === currentMatches.length - 1}
              onClick={() => setCurrentIndex(prev => prev + 1)}
              className="pixel-border px-6 py-2 disabled:opacity-30 uppercase text-xs hover:bg-white/5 transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {viewMode === "local" && !internetMatches.length && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="flex justify-center"
        >
          <button
            onClick={handleInternetSearch}
            className="group flex flex-col items-center gap-2 opacity-40 hover:opacity-100 transition-opacity"
          >
            <div className="h-px w-24 bg-white/20 group-hover:bg-retro-lavender transition-colors" />
            <span className="text-[8px] text-white/40 uppercase tracking-[0.5em] group-hover:text-retro-lavender transition-colors">
              Expand Search Beyond Local Vault?
            </span>
          </button>
        </motion.div>
      )}
    </div>
  )
}
