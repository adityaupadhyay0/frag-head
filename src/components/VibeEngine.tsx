"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { UserPreferences, Occasion, Outfit, Mood, Weather, Gender, PriceRange } from "@/types"
import { cn } from "@/lib/utils"
import { useSoundEngine } from "@/lib/sound"

interface VibeEngineProps {
  onComplete: (prefs: UserPreferences, autoGlobal?: boolean) => void
}

const steps = [
  {
    id: "occasion",
    label: "WHAT IS THE OCCASION?",
    options: ["Date", "Interview", "Club", "Wedding", "Daily"]
  },
  {
    id: "outfit",
    label: "YOUR OUTFIT STYLE?",
    options: ["Minimal", "Streetwear", "Formal", "Linen Summer", "Vintage", "Athletic"]
  },
  {
    id: "mood",
    label: "SELECT YOUR VIBE",
    options: ["Mysterious", "Dominant", "Soft", "Playful", "Intellectual"]
  },
  {
    id: "weather",
    label: "CURRENT CLIMATE?",
    options: ["Hot Humid", "Winter", "AC Office", "Spring", "Autumn", "Sunny", "Cold"]
  },
  {
    id: "gender",
    label: "GENDER EXPRESSION",
    options: ["Men", "Women", "Unisex"]
  },
  {
    id: "budget",
    label: "BUDGET RANGE",
    options: ["Designer", "Luxury"]
  },
  {
    id: "extraNotes",
    label: "ANYTHING ELSE TO ADD?",
    options: []
  }
]

export default function VibeEngine({ onComplete }: VibeEngineProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [prefs, setPrefs] = useState<UserPreferences>({})
  const [customInput, setCustomInput] = useState("")
  const { playSparkle, playSwoosh } = useSoundEngine()

  const handleNext = (value: string, autoGlobal: boolean = false) => {
    const key = steps[currentStep].id as keyof UserPreferences
    const newPrefs = { ...prefs, [key]: value }
    setPrefs(newPrefs)
    setCustomInput("")
    playSwoosh()

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      onComplete(newPrefs, autoGlobal)
    }
  }

  const handleSelect = (option: string) => {
    playSparkle()
    handleNext(option)
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[500px] w-full max-w-4xl mx-auto px-4">
      <div className="w-full flex justify-between items-center mb-12 opacity-50">
          <div className="text-[10px] tracking-[0.4em] uppercase text-white/40">Vibe_Engine_v2.0</div>
          <div className="text-[10px] tracking-[0.4em] uppercase text-retro-lavender font-bold">Step_{currentStep + 1}/{steps.length}</div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20, filter: "blur(10px)" }}
          animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, x: -20, filter: "blur(10px)" }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full text-center"
        >
          <motion.h2
            initial={{ letterSpacing: "0.2em" }}
            animate={{ letterSpacing: "0.6em" }}
            className="text-2xl md:text-4xl mb-12 text-white font-bold uppercase drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]"
          >
            {steps[currentStep].label}
          </motion.h2>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {steps[currentStep].options.map((option, idx) => (
              <motion.button
                key={option}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                onClick={() => handleSelect(option)}
                className={cn(
                  "pixel-border p-6 transition-all hover:scale-105 active:scale-95 group relative overflow-hidden",
                  "hover:bg-retro-lavender/20 hover:border-retro-lavender text-white/70 hover:text-white"
                )}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-retro-lavender/0 to-retro-lavender/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="relative z-10 uppercase text-xs md:text-sm tracking-[0.2em]">
                  {option}
                </span>
              </motion.button>
            ))}
          </div>

          <div className="mt-12 w-full max-w-lg mx-auto space-y-8">
            <div className="relative">
                {steps[currentStep].id === "extraNotes" ? (
                  <textarea
                    value={customInput}
                    onChange={(e) => setCustomInput(e.target.value)}
                    placeholder="Whisper your desires into the void..."
                    className="w-full h-40 bg-black/40 backdrop-blur-sm pixel-border p-6 text-white text-sm uppercase tracking-widest focus:outline-none focus:bg-retro-lavender/5 focus:border-retro-lavender placeholder:text-white/10 resize-none transition-all"
                  />
                ) : (
                  <input
                    type="text"
                    value={customInput}
                    onChange={(e) => setCustomInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && customInput.trim()) {
                        handleNext(customInput.trim())
                      }
                    }}
                    placeholder={steps[currentStep].options.length > 0 ? "OR DEFINE YOUR OWN REALITY..." : "TYPE HERE..."}
                    className="w-full bg-black/40 backdrop-blur-sm pixel-border p-6 text-white text-sm uppercase tracking-widest focus:outline-none focus:bg-retro-lavender/5 focus:border-retro-lavender placeholder:text-white/10 transition-all"
                  />
                )}
                <div className="absolute -bottom-2 -right-2 w-4 h-4 border-r-2 border-b-2 border-retro-lavender/30" />
                <div className="absolute -top-2 -left-2 w-4 h-4 border-l-2 border-t-2 border-retro-lavender/30" />
            </div>

            <div className="flex flex-wrap gap-6 justify-center">
              {customInput.trim() ? (
                <>
                  {steps[currentStep].id === "extraNotes" && (
                    <button
                      onClick={() => handleNext(customInput.trim(), true)}
                      className="pixel-border px-8 py-3 text-[10px] text-retro-cyan hover:bg-retro-cyan/20 uppercase tracking-[0.3em] transition-all bg-black/60 shadow-[0_0_20px_rgba(6,182,212,0.1)]"
                    >
                      Manifest_Global_Search
                    </button>
                  )}
                  <button
                    onClick={() => handleNext(customInput.trim())}
                    className="pixel-border px-8 py-3 text-[10px] text-retro-lavender hover:bg-retro-lavender/20 uppercase tracking-[0.3em] transition-all bg-black/60"
                  >
                    {currentStep === steps.length - 1 ? "Crystalize_Matches" : "Confirm_Trait"}
                  </button>
                </>
              ) : steps[currentStep].options.length === 0 ? (
                <div className="flex gap-4">
                  <button
                    onClick={() => handleNext("None", true)}
                    className="text-[10px] text-retro-cyan/40 hover:text-retro-cyan uppercase tracking-[0.4em] transition-all"
                  >
                    [ Skip_to_Global ]
                  </button>
                  <button
                    onClick={() => handleNext("None")}
                    className="text-[10px] text-white/20 hover:text-white/60 uppercase tracking-[0.4em] transition-all"
                  >
                    [ Proceed_to_Local ]
                  </button>
                </div>
              ) : null}
            </div>
          </div>

          <div className="mt-20 flex justify-center items-center gap-4">
            {steps.map((_, i) => (
              <motion.div
                key={i}
                animate={{
                    scale: i === currentStep ? 1.5 : 1,
                    opacity: i <= currentStep ? 1 : 0.2
                }}
                className={cn(
                  "w-1.5 h-1.5 rotate-45 transition-colors duration-500",
                  i === currentStep ? "bg-retro-lavender shadow-[0_0_15px_#a855f7]" : "bg-white"
                )}
              />
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
