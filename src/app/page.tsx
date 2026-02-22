"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Canvas } from "@react-three/fiber"
import { OrbitControls, Stars } from "@react-three/drei"
import ScentCore from "@/components/ScentCore"
import VibeEngine from "@/components/VibeEngine"
import ResultsView from "@/components/ResultsView"
import LayerLab from "@/components/LayerLab"
import { UserPreferences, Fragrance } from "@/types"
import fragrancesData from "@/data/fragrances.json"
import FragranceCard from "@/components/FragranceCard"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

const fragrances = fragrancesData as Fragrance[]

function AppContent() {
  const searchParams = useSearchParams()
  const [preferences, setPreferences] = useState<UserPreferences | null>(null)
  const [showResults, setShowResults] = useState(false)
  const [mode, setMode] = useState<"engine" | "lab">("engine")
  const [sharedFrag, setSharedFrag] = useState<Fragrance | null>(null)

  useEffect(() => {
    const fragId = searchParams.get("frag")
    if (fragId) {
      const frag = fragrances.find(f => f.id === fragId)
      if (frag) {
        setSharedFrag(frag)
        setShowResults(true)
      }
    }
  }, [searchParams])

  const handleComplete = (prefs: UserPreferences, autoGlobal?: boolean) => {
    setPreferences(prefs)
    setSharedFrag(null)
    setShowResults(true)
    if (autoGlobal) {
      setPreferences({ ...prefs, _autoGlobal: true })
    }
  }

  const handleRestart = () => {
    setPreferences(null)
    setSharedFrag(null)
    setShowResults(false)
    // Clear search params
    window.history.replaceState({}, '', '/')
  }

  return (
    <main className="relative min-h-screen flex flex-col items-center overflow-x-hidden">
      {/* Background 3D Scene */}
      <div className="fixed inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1} color="#a855f7" />
          <pointLight position={[-10, -10, -10]} intensity={0.5} color="#06b6d4" />

          <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

          <ScentCore
            color={mode === "lab" ? "#ec4899" : (showResults ? "#06b6d4" : "#a855f7")}
            intensity={showResults ? 0.5 : 1}
            speed={showResults ? 0.2 : 1}
          />

          <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.5} />
        </Canvas>
      </div>

      {/* Content Layer */}
      <div className="relative z-10 w-full flex flex-col items-center pt-10 md:pt-20 pb-10 min-h-screen px-4">
        <header className="mb-8 text-center pointer-events-none">
          <motion.h1
            initial={{ opacity: 0, letterSpacing: "0.5em" }}
            animate={{ opacity: 1, letterSpacing: "1.2em" }}
            className="text-4xl md:text-6xl font-bold text-white tracking-[1.2em] uppercase ml-[1.2em]"
          >
            Frag-Head
          </motion.h1>
          <div className="flex justify-center gap-4 mt-6 pointer-events-auto">
            <button
              onClick={() => { setMode("engine"); handleRestart(); }}
              className={cn(
                "text-[10px] tracking-[0.3em] uppercase px-4 py-1 transition-all",
                mode === "engine" ? "text-retro-cyan border-b border-retro-cyan" : "text-white/40 hover:text-white"
              )}
            >
              Vibe_Engine
            </button>
            <button
              onClick={() => { setMode("lab"); }}
              className={cn(
                "text-[10px] tracking-[0.3em] uppercase px-4 py-1 transition-all",
                mode === "lab" ? "text-retro-pink border-b border-retro-pink" : "text-white/40 hover:text-white"
              )}
            >
              Layer_Lab
            </button>
          </div>
        </header>

        <div className="w-full max-w-6xl">
          <AnimatePresence mode="wait">
            {mode === "engine" ? (
              !showResults ? (
                <motion.div
                  key="vibe-engine"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="w-full"
                >
                  <VibeEngine onComplete={handleComplete} />
                </motion.div>
              ) : (
                <motion.div
                  key="results"
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="w-full"
                >
                  {sharedFrag ? (
                    <div className="space-y-8">
                      <div className="flex justify-between items-center border-b border-white/10 pb-4">
                         <h2 className="text-sm text-retro-cyan uppercase tracking-[0.5em]">Shared Discovery</h2>
                         <button onClick={handleRestart} className="text-[10px] text-retro-lavender uppercase border border-retro-lavender/30 px-3 py-1">Reset</button>
                      </div>
                      <FragranceCard fragrance={sharedFrag} prefs={{}} />
                    </div>
                  ) : (
                    preferences && <ResultsView prefs={preferences} onRestart={handleRestart} />
                  )}
                </motion.div>
              )
            ) : (
              <motion.div
                key="layer-lab"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full"
              >
                <LayerLab />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <footer className="mt-auto pt-10 text-[8px] text-white/10 uppercase tracking-[0.5em] pointer-events-none">
          Automated Perception Simulation // Frag-Head MVP
        </footer>
      </div>
    </main>
  )
}

export default function Home() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AppContent />
    </Suspense>
  )
}
