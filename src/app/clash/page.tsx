"use client"

import { useState, useEffect, Suspense, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Canvas } from "@react-three/fiber"
import { OrbitControls, Stars } from "@react-three/drei"
import ScentCore from "@/components/ScentCore"
import ScentAura from "@/components/ScentAura"
import { Difficulty, Match, ClashFragrance, RoundResult } from "@/types/clash"
import { startMatch, startNextRound, calculateScore, checkGuess, getAptitude } from "@/lib/clash/gameEngine"
import { CLASH_POOL, getRandomFragrance } from "@/data/clashPool"
import { Trophy, Zap, Unlock, ArrowRight, RefreshCcw, Home, Target, ShieldCheck, BrainCircuit } from "lucide-react"
import Link from "next/link"

function ClashContent() {
  const [gameStatus, setGameStatus] = useState<'menu' | 'playing' | 'round-results' | 'final-results'>('menu')
  const [match, setMatch] = useState<Match | null>(null)
  const [targetFrag, setTargetFrag] = useState<ClashFragrance | null>(null)
  const [guess, setGuess] = useState("")
  const [bonusAccord, setBonusAccord] = useState("")
  const [bonusArchetype, setBonusArchetype] = useState("")
  const [timeElapsed, setTimeElapsed] = useState(0)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error', message: string } | null>(null)
  const [currentRoundScore, setCurrentRoundScore] = useState(0)

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
    const frag = getRandomFragrance(difficulty)

    setMatch(newMatch)
    setTargetFrag(frag)
    setGameStatus('playing')
    setTimeElapsed(0)
    setGuess("")
    setBonusAccord("")
    setBonusArchetype("")
    setFeedback(null)
    setCurrentRoundScore(0)
  }

  const handleGuess = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!match || !targetFrag || !guess.trim()) return

    const result = checkGuess(match, targetFrag.id, guess, {
      accord: bonusAccord,
      archetype: bonusArchetype
    })

    if (result.correct) {
      const roundScore = calculateScore(match, Date.now(), true, result.bonuses)
      setCurrentRoundScore(roundScore)

      const roundResult: RoundResult = {
        roundNumber: match.currentRound,
        fragranceId: targetFrag.id,
        guessedCorrectly: true,
        score: roundScore,
        timeSpent: timeElapsed,
        bonuses: result.bonuses
      }

      setMatch(prev => {
        if (!prev) return null
        return {
          ...prev,
          rounds: [...prev.rounds, roundResult],
          totalScore: prev.totalScore + roundScore
        }
      })

      setGameStatus('round-results')
      setFeedback({ type: 'success', message: "SIGNAL SYNCHRONIZED!" })
    } else {
      setFeedback({ type: 'error', message: "SIGNAL NOISE: Identity mismatch." })
      setTimeout(() => setFeedback(null), 2000)
    }
  }

  const handleNextRound = () => {
    if (!match) return

    if (match.currentRound >= match.totalRounds) {
      setGameStatus('final-results')
      return
    }

    const nextMatch = startNextRound(match)
    const nextFrag = getRandomFragrance(match.difficulty)

    setMatch(nextMatch)
    setTargetFrag(nextFrag)
    setGameStatus('playing')
    setTimeElapsed(0)
    setGuess("")
    setBonusAccord("")
    setBonusArchetype("")
    setFeedback(null)
    setCurrentRoundScore(0)
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
      if (timeElapsed >= 10) revealHint('family')
      if (timeElapsed >= 20) revealHint('top-notes')
      if (timeElapsed >= 35) revealHint('heart-notes')
      if (timeElapsed >= 50) revealHint('base-notes')
      if (timeElapsed >= 70) revealHint('brand')
    }
  }, [timeElapsed, gameStatus])

  const aptitude = useMemo(() => {
    if (gameStatus === 'final-results' && match) {
      return getAptitude(match.rounds)
    }
    return {}
  }, [gameStatus, match])

  return (
    <main className="relative min-h-screen flex flex-col items-center overflow-x-hidden text-white font-mono bg-retro-black">
      {/* Background 3D Scene */}
      <div className="fixed inset-0 z-0 opacity-30">
        <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
          <ambientLight intensity={0.5} />
          <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
          <ScentCore color="#06b6d4" intensity={0.2} speed={0.3} />
          <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.5} />
        </Canvas>
      </div>

      {/* Content Layer */}
      <div className="relative z-10 w-full max-w-5xl flex flex-col items-center pt-8 pb-12 px-6 min-h-screen">
        <header className="mb-10 text-center w-full flex justify-between items-center border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
             <BrainCircuit className="text-retro-cyan" size={24} />
             <div>
               <h1 className="text-xl font-black tracking-widest uppercase italic leading-none">
                 Clash<span className="text-retro-cyan">.Intelligence</span>
               </h1>
               <p className="text-[8px] tracking-[0.4em] uppercase text-white/40 mt-1">Multi-Round Skill Verification</p>
             </div>
          </div>

          {match && gameStatus !== 'menu' && (
            <div className="flex gap-8">
               <div className="text-right">
                  <p className="text-[8px] uppercase text-white/40">Neural_Score</p>
                  <p className="text-sm font-bold text-retro-cyan">{match.totalScore}</p>
               </div>
               <div className="text-right">
                  <p className="text-[8px] uppercase text-white/40">Sequence</p>
                  <p className="text-sm font-bold text-retro-lavender">{match.currentRound}/{match.totalRounds}</p>
               </div>
            </div>
          )}
        </header>

        <div className="w-full flex-1 flex flex-col items-center">
          <AnimatePresence mode="wait">
            {gameStatus === 'menu' && (
              <motion.div
                key="menu"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex flex-col items-center space-y-12 mt-12 text-center"
              >
                <div className="space-y-4 max-w-xl">
                  <h2 className="text-2xl uppercase tracking-[0.4em] text-white">Initialize Simulation</h2>
                  <p className="text-xs text-white/60 leading-relaxed uppercase tracking-widest">
                    Identify 5 fragrance profiles based on progressive sensory signals.
                    Accuracy, speed, and structural DNA decoding determine your final aptitude score.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-3xl">
                  {(['Easy', 'Medium', 'Hard'] as Difficulty[]).map((diff) => (
                    <button
                      key={diff}
                      onClick={() => handleStartGame(diff)}
                      className="group relative px-8 py-6 pixel-border bg-white/5 hover:bg-retro-cyan/10 transition-all text-left"
                    >
                      <p className="text-[8px] uppercase text-white/40 mb-1">Tier_0{diff === 'Easy' ? '1' : diff === 'Medium' ? '2' : '3'}</p>
                      <span className="relative z-10 text-xl font-bold uppercase tracking-widest block">{diff}</span>
                      <p className="text-[8px] mt-4 text-retro-cyan opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-widest flex items-center gap-2">
                        <Zap size={8} /> Activate Neural Link
                      </p>
                    </button>
                  ))}
                </div>

                <Link href="/" className="mt-8 text-[10px] uppercase tracking-widest text-white/20 hover:text-white flex items-center gap-2 transition-colors">
                  <Home size={12} /> Return to Laboratory
                </Link>
              </motion.div>
            )}

            {gameStatus === 'playing' && match && targetFrag && (
              <motion.div
                key="playing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full grid grid-cols-1 lg:grid-cols-12 gap-10"
              >
                {/* Left Column (4/12): Aura & DNA Meters */}
                <div className="lg:col-span-4 space-y-8">
                  <div className="relative flex flex-col items-center bg-white/5 p-8 pixel-border">
                    <ScentAura fragrance={{...targetFrag, name: "???"}} />
                    <div className="absolute top-4 left-4 bg-retro-cyan/20 text-retro-cyan text-[8px] px-2 py-1 font-bold uppercase tracking-widest">
                      Signal_{match.id.substring(0,4)}
                    </div>
                  </div>

                  <div className="bg-white/5 p-6 pixel-border space-y-4">
                    <h3 className="text-[10px] uppercase tracking-[0.3em] text-white/40 flex items-center gap-2">
                       <Target size={10} /> Scent_DNA
                    </h3>
                    <div className="space-y-4">
                       <DNAMeter label="Warmth" value={targetFrag.dna.warmth} />
                       <DNAMeter label="Sweetness" value={targetFrag.dna.sweetness} />
                       <DNAMeter label="Mass_Appeal" value={targetFrag.dna.mass_appeal_score} />
                       <DNAMeter label="Polarity" value={targetFrag.dna.polarization_score} />
                    </div>
                  </div>
                </div>

                {/* Middle Column (5/12): Inputs & Deciphering */}
                <div className="lg:col-span-5 space-y-8">
                  <div className="bg-white/5 p-6 pixel-border">
                    <h3 className="text-sm uppercase tracking-[0.3em] mb-6 text-retro-cyan">Identify Fragment</h3>
                    <form onSubmit={handleGuess} className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-[8px] uppercase tracking-widest text-white/40 ml-1">Fragrance Identity</label>
                        <input
                          type="text"
                          value={guess}
                          onChange={(e) => setGuess(e.target.value)}
                          placeholder="ENTER NAME_OR_BRAND"
                          className="w-full bg-black/50 border border-white/20 px-4 py-3 text-sm focus:outline-none focus:border-retro-cyan transition-colors"
                          autoFocus
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-[8px] uppercase tracking-widest text-white/40 ml-1">Bonus: Dominant Accord</label>
                          <input
                            type="text"
                            value={bonusAccord}
                            onChange={(e) => setBonusAccord(e.target.value)}
                            placeholder="+100 PTS"
                            className="w-full bg-black/50 border border-white/20 px-4 py-2 text-[10px] focus:outline-none focus:border-retro-lavender transition-colors uppercase"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[8px] uppercase tracking-widest text-white/40 ml-1">Bonus: Archetype</label>
                          <input
                            type="text"
                            value={bonusArchetype}
                            onChange={(e) => setBonusArchetype(e.target.value)}
                            placeholder="+50 PTS"
                            className="w-full bg-black/50 border border-white/20 px-4 py-2 text-[10px] focus:outline-none focus:border-retro-lavender transition-colors uppercase"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full bg-retro-cyan text-black font-bold py-4 uppercase tracking-[0.3em] flex items-center justify-center gap-2 hover:bg-white transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)]"
                      >
                        Transmit_Data <ArrowRight size={16} />
                      </button>
                    </form>

                    {feedback && (
                      <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`mt-6 text-[10px] uppercase font-bold tracking-[0.2em] text-center ${
                          feedback.type === 'success' ? 'text-green-400' : 'text-red-400'
                        }`}
                      >
                        {feedback.message}
                      </motion.p>
                    )}
                  </div>

                  <div className="bg-white/5 p-6 pixel-border">
                     <div className="flex justify-between items-center mb-4">
                        <h3 className="text-[10px] uppercase tracking-[0.3em] text-white/40">Round_Timeline</h3>
                        <span className="text-[10px] text-retro-cyan font-bold">{timeElapsed}S</span>
                     </div>
                     <div className="w-full h-1 bg-white/10 mb-2">
                        <motion.div
                          className="h-full bg-retro-cyan"
                          animate={{ width: `${Math.min(100, (timeElapsed / 90) * 100)}%` }}
                        />
                     </div>
                  </div>
                </div>

                {/* Right Column (3/12): Hints Progression */}
                <div className="lg:col-span-3 space-y-4">
                   <h3 className="text-[10px] uppercase tracking-[0.3em] text-white/40 px-2">Sensory_Signals</h3>
                   <div className="space-y-3">
                      <HintRow label="Family" unlocked={match.hintsUnlocked.includes('family')} value={targetFrag.family} timeReq={10} current={timeElapsed} color="text-white" />
                      <HintRow label="Top Notes" unlocked={match.hintsUnlocked.includes('top-notes')} value={targetFrag.notes.top.join(", ")} timeReq={20} current={timeElapsed} color="text-retro-cyan" />
                      <HintRow label="Heart Notes" unlocked={match.hintsUnlocked.includes('heart-notes')} value={targetFrag.notes.mid.join(", ")} timeReq={35} current={timeElapsed} color="text-retro-lavender" />
                      <HintRow label="Base Notes" unlocked={match.hintsUnlocked.includes('base-notes')} value={targetFrag.notes.base.join(", ")} timeReq={50} current={timeElapsed} color="text-retro-cyan" />

                      <div className="pt-4 border-t border-white/10">
                        <div className="flex justify-between items-center mb-2">
                           <span className="text-[8px] uppercase tracking-widest text-white/40">Brand Trace</span>
                           {!match.hintsUnlocked.includes('brand') && (
                              <button
                                onClick={() => revealHint('brand', 200)}
                                className="text-[8px] text-retro-lavender hover:text-white uppercase flex items-center gap-1 border border-retro-lavender/30 px-2 py-0.5"
                              >
                                <Unlock size={8} /> Force (-200)
                              </button>
                           )}
                        </div>
                        {match.hintsUnlocked.includes('brand') ? (
                           <p className="text-[10px] text-white font-bold uppercase">{targetFrag.brand}</p>
                        ) : (
                           <div className="h-4 bg-white/5 animate-pulse" />
                        )}
                      </div>
                   </div>
                </div>
              </motion.div>
            )}

            {gameStatus === 'round-results' && targetFrag && match && (
              <motion.div
                key="round-results"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center space-y-10 w-full max-w-3xl"
              >
                <div className="text-center space-y-4">
                  <div className="inline-block p-4 bg-green-500/10 border border-green-500/30 rounded-full mb-2">
                    <ShieldCheck className="text-green-500" size={40} />
                  </div>
                  <h2 className="text-3xl font-black uppercase italic tracking-tighter">Round {match.currentRound} Complete</h2>
                  <div className="flex justify-center gap-8 mt-4">
                    <div className="text-center">
                       <p className="text-[8px] uppercase text-white/40">Gain</p>
                       <p className="text-2xl font-bold text-retro-cyan">+{currentRoundScore}</p>
                    </div>
                    <div className="text-center">
                       <p className="text-[8px] uppercase text-white/40">Time</p>
                       <p className="text-2xl font-bold text-white">{timeElapsed}s</p>
                    </div>
                  </div>
                </div>

                <div className="w-full bg-white/5 pixel-border p-8 flex flex-col md:flex-row gap-8 items-center">
                  <div className="flex-shrink-0">
                     <ScentAura fragrance={targetFrag} />
                  </div>
                  <div className="flex-1 text-center md:text-left space-y-4">
                    <div>
                      <h3 className="text-2xl font-bold text-retro-lavender uppercase">{targetFrag.name}</h3>
                      <p className="text-retro-cyan text-sm uppercase tracking-[0.3em]">{targetFrag.brand} ({targetFrag.year})</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-2">
                       <div className="p-2 bg-white/5 text-left">
                          <p className="text-[8px] uppercase text-white/40">Archetype</p>
                          <p className="text-[10px] text-white uppercase">{targetFrag.dna.archetype}</p>
                       </div>
                       <div className="p-2 bg-white/5 text-left">
                          <p className="text-[8px] uppercase text-white/40">Accord</p>
                          <p className="text-[10px] text-white uppercase">{targetFrag.dna.dominant_accord}</p>
                       </div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleNextRound}
                  className="px-12 py-4 bg-retro-cyan text-black font-black uppercase tracking-[0.4em] flex items-center gap-3 hover:bg-white transition-all group"
                >
                  {match.currentRound < match.totalRounds ? 'Next_Sequence' : 'Final_Analysis'}
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </motion.div>
            )}

            {gameStatus === 'final-results' && match && (
              <motion.div
                key="final-results"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full flex flex-col items-center space-y-12"
              >
                <div className="text-center space-y-4">
                  <Trophy className="text-retro-cyan mx-auto" size={64} />
                  <h2 className="text-5xl font-black uppercase italic tracking-tighter">Simulation Complete</h2>
                  <div className="p-4 bg-retro-cyan/10 border border-retro-cyan/30 inline-block px-12">
                     <p className="text-[10px] uppercase text-retro-cyan tracking-[0.5em] mb-1">Final_Aptitude_Score</p>
                     <p className="text-4xl font-black">{match.totalScore}</p>
                  </div>
                </div>

                <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-10">
                   <div className="bg-white/5 p-8 pixel-border space-y-8">
                      <h3 className="text-xl uppercase tracking-widest text-retro-lavender flex items-center gap-3">
                         <BrainCircuit size={20} /> Intelligence Map
                      </h3>
                      <div className="space-y-6">
                         {Object.entries(aptitude).sort((a,b) => b[1] - a[1]).slice(0, 6).map(([key, value]) => (
                            <div key={key} className="space-y-2">
                               <div className="flex justify-between text-[10px] uppercase tracking-widest">
                                  <span>{key} Proficiency</span>
                                  <span className="text-retro-cyan">{value}%</span>
                                </div>
                                <div className="h-1.5 w-full bg-white/10 overflow-hidden">
                                  <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${value}%` }}
                                    className="h-full bg-retro-cyan"
                                  />
                                </div>
                            </div>
                         ))}
                      </div>
                   </div>

                   <div className="bg-white/5 p-8 pixel-border space-y-6">
                      <h3 className="text-xl uppercase tracking-widest text-retro-cyan">Round Analytics</h3>
                      <div className="space-y-4">
                         {match.rounds.map((r, i) => {
                           const f = CLASH_POOL.find(frag => frag.id === r.fragranceId);
                           return (
                             <div key={i} className="flex items-center justify-between p-3 bg-white/5 border border-white/10">
                               <div className="flex items-center gap-4">
                                 <span className="text-white/20 font-bold">0{i+1}</span>
                                 <div>
                                   <p className="text-[10px] font-bold uppercase">{f?.name}</p>
                                   <p className="text-[8px] text-white/40 uppercase">{f?.brand}</p>
                                 </div>
                               </div>
                               <div className="text-right">
                                 <p className="text-[10px] font-bold text-retro-cyan">+{r.score}</p>
                                 <p className="text-[8px] text-white/40 uppercase">{r.timeSpent}S</p>
                               </div>
                             </div>
                           )
                         })}
                      </div>
                      <div className="flex gap-4 pt-4">
                        <button
                          onClick={() => setGameStatus('menu')}
                          className="flex-1 py-4 pixel-border bg-white/5 hover:bg-white/10 transition-all uppercase tracking-widest text-xs flex items-center justify-center gap-2"
                        >
                          <RefreshCcw size={14} /> Re-Sync
                        </button>
                        <Link
                          href="/"
                          className="flex-1 py-4 pixel-border border-retro-cyan text-retro-cyan hover:bg-retro-cyan/10 transition-all uppercase tracking-widest text-xs flex items-center justify-center gap-2"
                        >
                          <Home size={14} /> Exit
                        </Link>
                      </div>
                   </div>
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
        <span className="text-white/60">{label}</span>
        <span className="text-retro-cyan">{value}%</span>
      </div>
      <div className="h-1 w-full bg-white/5 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          className="h-full bg-retro-cyan/60"
        />
      </div>
    </div>
  )
}

function HintRow({ label, unlocked, value, timeReq, current, color }: { label: string, unlocked: boolean, value?: string, timeReq: number, current: number, color: string }) {
  return (
    <div className="space-y-1 p-2 bg-white/5 border border-white/5">
      <div className="flex justify-between text-[8px] uppercase tracking-widest">
        <span className="text-white/40">{label}</span>
        {!unlocked && <span className="text-retro-cyan animate-pulse">LOCKED_{Math.max(0, timeReq - current)}S</span>}
      </div>
      <div className="min-h-[16px]">
        {unlocked ? (
          <p className={`text-[10px] uppercase font-bold leading-tight ${color}`}>{value}</p>
        ) : (
          <div className="w-full h-0.5 bg-white/10 overflow-hidden mt-1">
            <motion.div
              className="h-full bg-white/20"
              animate={{ width: `${Math.min(100, (current/timeReq)*100)}%` }}
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default function ClashPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-retro-cyan animate-pulse uppercase tracking-[1em] bg-retro-black">Initializing Clash Intelligence...</div>}>
      <ClashContent />
    </Suspense>
  )
}
