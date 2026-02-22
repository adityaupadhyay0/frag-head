"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { UserPreferences, Occasion, Outfit, Mood, Weather, Gender, PriceRange } from "@/types"
import { cn } from "@/lib/utils"

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

  const handleNext = (value: string, autoGlobal: boolean = false) => {
    const key = steps[currentStep].id as keyof UserPreferences
    const newPrefs = { ...prefs, [key]: value }
    setPrefs(newPrefs)
    setCustomInput("")

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      onComplete(newPrefs, autoGlobal)
    }
  }

  const handleSelect = (option: string) => {
    handleNext(option)
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] w-full max-w-2xl mx-auto px-4">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="w-full text-center"
        >
          <h2 className="text-xl md:text-2xl mb-8 tracking-widest text-retro-lavender font-bold">
            {steps[currentStep].label}
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {steps[currentStep].options.map((option) => (
              <button
                key={option}
                onClick={() => handleSelect(option)}
                className={cn(
                  "pixel-border p-4 transition-all hover:scale-105 active:scale-95",
                  "hover:bg-retro-lavender/20 hover:text-white group"
                )}
              >
                <span className="relative z-10 uppercase text-xs md:text-sm tracking-tighter">
                  {option}
                </span>
              </button>
            ))}
          </div>

          <div className="mt-8 w-full max-w-lg mx-auto space-y-6">
            {steps[currentStep].id === "extraNotes" ? (
              <textarea
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                placeholder="TYPE HERE..."
                className="w-full h-32 bg-transparent pixel-border p-4 text-white text-xs md:text-sm uppercase tracking-widest focus:outline-none focus:bg-white/5 placeholder:text-white/20 resize-none"
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
                placeholder={steps[currentStep].options.length > 0 ? "OR TYPE YOUR OWN..." : "TYPE HERE..."}
                className="w-full bg-transparent pixel-border p-4 text-white text-xs md:text-sm uppercase tracking-widest focus:outline-none focus:bg-white/5 placeholder:text-white/20"
              />
            )}

            <div className="flex flex-wrap gap-4 justify-center">
              {customInput.trim() ? (
                <>
                  {steps[currentStep].id === "extraNotes" && (
                    <button
                      onClick={() => handleNext(customInput.trim(), true)}
                      className="pixel-border px-6 py-2 text-[10px] text-retro-cyan hover:bg-retro-cyan/20 uppercase tracking-[0.2em] transition-all"
                    >
                      Launch_Global_Search_AI
                    </button>
                  )}
                  <button
                    onClick={() => handleNext(customInput.trim())}
                    className="pixel-border px-6 py-2 text-[10px] text-retro-lavender hover:bg-retro-lavender/20 uppercase tracking-[0.2em] transition-all"
                  >
                    {currentStep === steps.length - 1 ? "View_Matches" : "Next_Result"}
                  </button>
                </>
              ) : steps[currentStep].options.length === 0 ? (
                <>
                  <button
                    onClick={() => handleNext("None", true)}
                    className="pixel-border px-6 py-2 text-[10px] text-retro-cyan/40 hover:text-retro-cyan hover:bg-retro-cyan/10 uppercase tracking-[0.2em] transition-all"
                  >
                    Skip_to_Global
                  </button>
                  <button
                    onClick={() => handleNext("None")}
                    className="pixel-border px-6 py-2 text-[10px] text-white/20 hover:text-white/60 hover:bg-white/5 uppercase tracking-[0.2em] transition-all"
                  >
                    Skip_to_Local
                  </button>
                </>
              ) : null}
            </div>
          </div>

          <div className="mt-12 flex justify-center gap-2">
            {steps.map((_, i) => (
              <div
                key={i}
                className={cn(
                  "w-2 h-2",
                  i === currentStep ? "bg-retro-lavender shadow-[0_0_8px_#a855f7]" : "bg-white/10"
                )}
              />
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
