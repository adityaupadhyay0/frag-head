"use client"

import { useState, useEffect, useCallback, Suspense } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Canvas } from "@react-three/fiber"
import { OrbitControls, Stars } from "@react-three/drei"
import ScentCore from "@/components/ScentCore"
import ScentAura from "@/components/ScentAura"
import { Difficulty, Match, ClashFragrance } from "@/types/clash"
import { startMatch, calculateScore, checkGuess } from "@/lib/clash/gameEngine"
import { CLASH_POOL } from "@/data/clashPool"
import { Trophy, Timer, Zap, Unlock, ArrowRight, RefreshCcw, Home } from "lucide-react"
import Link from "next/link"

function ClashContent() {
  const [gameStatus, setGameStatus] = useState<'menu' | 'playing' | 'results'>('menu')
  const [match, setMatch] = useState<Match | null>(null)
  const [targetFrag, setTargetFrag] = useState<ClashFragrance | null>(null)
  const [guess, setGuess] = useState("")
  const [timeElapsed, setTimeElapsed] = useState(0)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error', message: string } | null>(null)
  const [score, setScore] = useState(0)

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (gameStatus === 'playing') {
      interval = setInterval(() => {
        setTimeElapsed(prev => prev + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [gameStatus])

  const handleStartGame = (difficulty: Difficulty) => {
    const newMatch = startMatch(difficulty)
    const frag = CLASH_POOL.find(f => f.id === newMatch.fragranceId) || null

    setMatch(newMatch)
    setTargetFrag(frag)
    setGameStatus('playing')
    setTimeElapsed(0)
    setGuess("")
    setFeedback(null)
    setScore(0)
  }

  const handleGuess = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!match || !targetFrag || !guess.trim()) return

    const result = checkGuess(match, guess)

    if (result.correct) {
      const finalScore = calculateScore(match, Date.now(), true, {
        guessedAccord: result.bonuses.guessedAccord,
        guessedArchetype: result.bonuses.guessedArchetype
      })
      setScore(finalScore)
      setGameStatus('results')
      setFeedback({ type: 'success', message: "PERFECT MATCH!" })
    } else {
      setFeedback({ type: 'error', message: "SIGNAL NOISE: Incorrect Match." })
      setTimeout(() => setFeedback(null), 2000)
    }
  }

  const revealHint = (hintType: string, penalty: number = 0) => {
    if (!match) return
    if (match.hintsUnlocked.includes(hintType)) return

    setMatch(prev => {
      if (!prev) return null
      return {
        ...prev,
        hintsUnlocked: [...prev.hintsUnlocked, hintType],
        penalty: prev.penalty + penalty
      }
    })
  }

  // Auto-reveal hints based on time
  useEffect(() => {
    if (gameStatus === 'playing') {
      if (timeElapsed >= 15) revealHint('accords')
      if (timeElapsed >= 30) revealHint('notes')
      if (timeElapsed >= 60) revealHint('brand')
    }
  }, [timeElapsed, gameStatus])

  return (
    <main className="relative min-h-screen flex flex-col items-center overflow-x-hidden text-white font-mono">
      {/* Background 3D Scene */}
      <div className="fixed inset-0 z-0 opacity-40">
        <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
          <ambientLight intensity={0.5} />
          <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
          <ScentCore color="#06b6d4" intensity={0.3} speed={0.5} />
          <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.5} />
        </Canvas>
      </div>

      {/* Content Layer */}
      <div className="relative z-10 w-full max-w-4xl flex flex-col items-center pt-12 pb-12 px-6 min-h-screen">
        <header className="mb-12 text-center">
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="flex items-center justify-center gap-4 mb-2"
          >
            <Zap className="text-retro-cyan" size={32} />
            <h1 className="text-4xl md:text-5xl font-black tracking-[0.2em] uppercase italic">
              Clash<span className="text-retro-cyan">.Demo</span>
            </h1>
          </motion.div>
          <p className="text-[10px] tracking-[0.5em] uppercase text-white/40">Frag-Head Battle Simulation v1.0</p>
        </header>

        <div className="w-full flex-1 flex flex-col items-center">
          <AnimatePresence mode="wait">
            {gameStatus === 'menu' && (
              <motion.div
                key="menu"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex flex-col items-center space-y-8 mt-20"
              >
                <h2 className="text-xl uppercase tracking-[0.3em] text-retro-lavender">Select Difficulty</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {(['Easy', 'Medium', 'Hard'] as Difficulty[]).map((diff) => (
                    <button
                      key={diff}
                      onClick={() => handleStartGame(diff)}
                      className="group relative px-8 py-4 pixel-border bg-white/5 hover:bg-retro-cyan/20 transition-all overflow-hidden"
                    >
                      <span className="relative z-10 text-lg uppercase tracking-widest">{diff}</span>
                      <div className="absolute inset-0 bg-retro-cyan/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                    </button>
                  ))}
                </div>
                <Link href="/" className="mt-8 text-[10px] uppercase tracking-widest text-white/40 hover:text-white flex items-center gap-2">
                  <Home size={12} /> Return to Lab
                </Link>
              </motion.div>
            )}

            {gameStatus === 'playing' && match && targetFrag && (
              <motion.div
                key="playing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full grid grid-cols-1 lg:grid-cols-2 gap-12"
              >
                {/* Left side: Aura and Hints */}
                <div className="space-y-8 flex flex-col items-center">
                  <div className="relative">
                    <ScentAura fragrance={{...targetFrag, name: "???"}} />
                    <div className="absolute -top-4 -right-4 bg-retro-cyan text-black text-[10px] px-2 py-1 font-bold uppercase">
                      ID: {match.id}
                    </div>
                  </div>

                  <div className="w-full space-y-4 bg-white/5 p-6 pixel-border">
                    <div className="flex justify-between items-center text-[10px] uppercase tracking-widest text-white/40">
                      <span>Deciphered Signals</span>
                      <span>Time: {timeElapsed}s</span>
                    </div>

                    <div className="space-y-4">
                      {/* Accords Hint */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[8px] uppercase tracking-widest">
                          <span>Primary Accords</span>
                          {!match.hintsUnlocked.includes('accords') && <span className="text-retro-cyan">Unlocks in {Math.max(0, 15 - timeElapsed)}s</span>}
                        </div>
                        <div className="min-h-[24px] flex flex-wrap gap-2">
                          {match.hintsUnlocked.includes('accords') ? (
                            targetFrag.accords.slice(0, 3).map(a => (
                              <span key={a} className="px-2 py-0.5 bg-retro-cyan/20 text-retro-cyan text-[10px] uppercase">{a}</span>
                            ))
                          ) : (
                            <div className="w-full h-1 bg-white/10 overflow-hidden">
                              <motion.div
                                className="h-full bg-retro-cyan/40"
                                animate={{ width: `${Math.min(100, (timeElapsed/15)*100)}%` }}
                              />
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Notes Hint */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[8px] uppercase tracking-widest">
                          <span>Olfactory Heart</span>
                          {!match.hintsUnlocked.includes('notes') && <span className="text-retro-lavender">Unlocks in {Math.max(0, 30 - timeElapsed)}s</span>}
                        </div>
                        <div className="min-h-[24px]">
                          {match.hintsUnlocked.includes('notes') ? (
                            <p className="text-[10px] text-retro-lavender uppercase">{targetFrag.notes.mid.join(", ")}</p>
                          ) : (
                            <div className="w-full h-1 bg-white/10 overflow-hidden">
                              <motion.div
                                className="h-full bg-retro-lavender/40"
                                animate={{ width: `${Math.min(100, (timeElapsed/30)*100)}%` }}
                              />
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Brand Hint */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[8px] uppercase tracking-widest">
                          <span>Manufacturer Trace</span>
                          {!match.hintsUnlocked.includes('brand') && <span className="text-white/20">Unlocks in {Math.max(0, 60 - timeElapsed)}s</span>}
                        </div>
                        <div className="min-h-[24px]">
                          {match.hintsUnlocked.includes('brand') ? (
                            <p className="text-[10px] text-white/80 uppercase">{targetFrag.brand}</p>
                          ) : (
                             <button
                               onClick={() => revealHint('brand', 200)}
                               className="text-[8px] text-white/20 hover:text-white uppercase flex items-center gap-1"
                             >
                               <Unlock size={8} /> Force Unlock (-200 pts)
                             </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right side: Input and DNA */}
                <div className="space-y-8">
                  <div className="bg-white/5 p-6 pixel-border">
                    <h3 className="text-sm uppercase tracking-[0.3em] mb-6 text-retro-cyan">Identify Fragment</h3>
                    <form onSubmit={handleGuess} className="space-y-4">
                      <input
                        type="text"
                        value={guess}
                        onChange={(e) => setGuess(e.target.value)}
                        placeholder="NAME_OR_BRAND_NAME"
                        className="w-full bg-black/50 border border-white/20 px-4 py-3 text-sm focus:outline-none focus:border-retro-cyan transition-colors"
                        autoFocus
                      />
                      <button
                        type="submit"
                        className="w-full bg-retro-cyan text-black font-bold py-3 uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-white transition-colors"
                      >
                        Transmit_Guess <ArrowRight size={16} />
                      </button>
                    </form>

                    {feedback && (
                      <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`mt-4 text-[10px] uppercase font-bold tracking-widest text-center ${
                          feedback.type === 'success' ? 'text-green-400' : 'text-red-400'
                        }`}
                      >
                        {feedback.message}
                      </motion.p>
                    )}
                  </div>

                  <div className="bg-white/5 p-6 pixel-border space-y-4">
                    <h3 className="text-[10px] uppercase tracking-[0.3em] text-white/40 flex items-center gap-2">
                       <Zap size={10} /> Analyzed DNA
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                       <DNAMeter label="Warmth" value={targetFrag.dna.warmth} />
                       <DNAMeter label="Sweetness" value={targetFrag.dna.sweetness} />
                       <DNAMeter label="Appeal" value={targetFrag.dna.mass_appeal_score} />
                       <DNAMeter label="Polarity" value={targetFrag.dna.polarization_score} />
                    </div>
                    <div className="pt-4 border-t border-white/10">
                       <p className="text-[8px] uppercase text-white/40 tracking-widest mb-1">Archetype</p>
                       <p className="text-xs uppercase text-retro-lavender">{targetFrag.dna.archetype}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {gameStatus === 'results' && targetFrag && (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center space-y-8 w-full max-w-2xl"
              >
                <div className="text-center space-y-2">
                  <div className="inline-block p-4 bg-retro-cyan/20 rounded-full mb-4">
                    <Trophy className="text-retro-cyan" size={48} />
                  </div>
                  <h2 className="text-4xl font-black uppercase italic tracking-tighter">Signal Synchronized</h2>
                  <p className="text-retro-cyan text-sm tracking-[0.4em] uppercase">Score: {score}</p>
                </div>

                <div className="w-full bg-white/5 pixel-border p-8 flex flex-col md:flex-row gap-8 items-center">
                  <div className="flex-shrink-0">
                     <ScentAura fragrance={targetFrag} />
                  </div>
                  <div className="flex-1 text-center md:text-left space-y-4">
                    <div>
                      <h3 className="text-2xl font-bold text-retro-lavender uppercase">{targetFrag.name}</h3>
                      <p className="text-retro-cyan text-sm uppercase tracking-widest">{targetFrag.brand} ({targetFrag.year})</p>
                    </div>
                    <p className="text-xs text-white/60 leading-relaxed italic">
                      "{targetFrag.vibe}" — A masterful composition of {targetFrag.notes.top[0]} and {targetFrag.notes.base[0]}.
                    </p>
                    <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                      {targetFrag.accords.map(a => (
                         <span key={a} className="text-[8px] border border-white/20 px-2 py-1 uppercase">{a}</span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => setGameStatus('menu')}
                    className="px-8 py-3 pixel-border bg-white/10 hover:bg-white/20 transition-all uppercase tracking-widest text-sm flex items-center gap-2"
                  >
                    <RefreshCcw size={16} /> Re-Enter
                  </button>
                  <Link
                    href="/"
                    className="px-8 py-3 pixel-border border-retro-cyan text-retro-cyan hover:bg-retro-cyan/10 transition-all uppercase tracking-widest text-sm flex items-center gap-2"
                  >
                    <Home size={16} /> Back to Lab
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </main>
  )
}

function DNAMeter({ label, value }: { label: string, value: number }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-[8px] uppercase tracking-tighter">
        <span>{label}</span>
        <span>{value}%</span>
      </div>
      <div className="h-1.5 w-full bg-white/10 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          className="h-full bg-retro-cyan shadow-[0_0_8px_#06b6d4]"
        />
      </div>
    </div>
  )
}

export default function ClashPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-retro-cyan animate-pulse uppercase tracking-[1em]">Initializing Clash...</div>}>
      <ClashContent />
    </Suspense>
  )
}
