"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { UserPreferences, Occasion, Outfit, Mood, Weather, Gender, PriceRange } from "@/types"
import { cn } from "@/lib/utils"

interface VibeEngineProps {
  onComplete: (prefs: UserPreferences) => void
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
  }
]

export default function VibeEngine({ onComplete }: VibeEngineProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [prefs, setPrefs] = useState<UserPreferences>({})

  const handleSelect = (option: string) => {
    const key = steps[currentStep].id as keyof UserPreferences
    const newPrefs = { ...prefs, [key]: option }
    setPrefs(newPrefs)

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      onComplete(newPrefs)
    }
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
