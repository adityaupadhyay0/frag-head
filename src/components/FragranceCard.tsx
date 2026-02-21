"use client"

import { Fragrance, UserPreferences } from "@/types"
import RadarGraph from "./RadarGraph"
import ProjectionTimeline from "./ProjectionTimeline"
import MoodBar from "./MoodBar"
import ScentAura from "./ScentAura"
import { useEffect, useState } from "react"
import { generateScentStory as getAIStory } from "@/lib/gemini"
import { motion } from "framer-motion"
import { Share2, ShoppingCart } from "lucide-react"

interface FragranceCardProps {
  fragrance: Fragrance
  prefs: UserPreferences
}

export default function FragranceCard({ fragrance, prefs }: FragranceCardProps) {
  const [aiData, setAiData] = useState<{story: string, outfitSuggestions: string, emotionalDescription: string} | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    getAIStory(fragrance, prefs).then(setAiData)
  }, [fragrance, prefs])

  const copyLink = () => {
    const url = new URL(window.location.href)
    url.searchParams.set("frag", fragrance.id)
    navigator.clipboard.writeText(url.toString())
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const buyLink = `https://www.google.com/search?q=buy+${fragrance.brand}+${fragrance.name}`

  return (
    <div className="pixel-border p-6 bg-retro-black/90 backdrop-blur-lg flex flex-col lg:flex-row gap-8">
      {/* Left Column: Core Info & Radar */}
      <div className="flex-1 space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-2xl font-bold text-retro-lavender tracking-wider uppercase">{fragrance.name}</h3>
            <p className="text-retro-cyan text-sm tracking-[0.3em] uppercase">{fragrance.brand}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={copyLink}
              className="p-2 pixel-border hover:bg-retro-lavender/20 text-retro-lavender"
              title="Share Discovery"
            >
              <Share2 size={16} />
            </button>
            <a
              href={buyLink}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 pixel-border hover:bg-retro-cyan/20 text-retro-cyan"
              title="Find Online"
            >
              <ShoppingCart size={16} />
            </a>
          </div>
        </div>

        {copied && <p className="text-[8px] text-retro-lavender uppercase animate-pulse">Link copied to clipboard!</p>}

        <div className="flex justify-center py-4 bg-white/5 pixel-border border-white/5">
          <RadarGraph accords={fragrance.accords} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-4">
            <MoodBar label1="Soft" label2="Dominant" value={fragrance.vibe.includes("Dominant") ? 0.8 : 0.3} />
            <MoodBar label1="Day" label2="Night" value={fragrance.season.includes("Winter") || fragrance.season.includes("Fall") ? 0.9 : 0.4} />
          </div>
          <ProjectionTimeline longevity={fragrance.longevity} />
        </div>
      </div>

      {/* Middle Column: AI Story & Palette */}
      <div className="flex-1 space-y-6">
        <div className="space-y-2">
          <h4 className="text-[10px] text-white/40 uppercase tracking-[0.4em]">Atmospheric Story</h4>
          <p className="text-sm italic leading-relaxed text-retro-slate">
            {aiData?.story || "Synthesizing scent memories..."}
          </p>
        </div>

        <div className="space-y-2">
          <h4 className="text-[10px] text-white/40 uppercase tracking-[0.4em]">Outfit Pairing</h4>
          <p className="text-xs text-retro-cyan uppercase tracking-wider">
            {aiData?.outfitSuggestions || "Analyzing fabric textures..."}
          </p>
        </div>

        <div className="space-y-4">
           <h4 className="text-[10px] text-white/40 uppercase tracking-[0.4em]">Scent Palette</h4>
           <div className="flex gap-2">
             {fragrance.colors.map((color, i) => (
               <div
                 key={i}
                 className="flex-1 h-8 pixel-border"
                 style={{ backgroundColor: color, borderColor: color }}
               />
             ))}
           </div>
        </div>

        <div className="p-4 bg-retro-lavender/10 border border-retro-lavender/30 text-[10px] text-retro-lavender uppercase tracking-widest">
          Notes: {fragrance.notes.top.slice(0, 2).join(", ")} | {fragrance.notes.mid.slice(0, 2).join(", ")} | {fragrance.notes.base.slice(0, 2).join(", ")}
        </div>
      </div>

      {/* Right Column: Scent Aura (Phase 3) */}
      <div className="flex-none w-full lg:w-48 flex flex-col items-center justify-center border-l border-white/5 pl-0 lg:pl-8">
        <h4 className="text-[10px] text-white/40 uppercase tracking-[0.4em] mb-4">Scent Aura</h4>
        <ScentAura fragrance={fragrance} />
      </div>
    </div>
  )
}
