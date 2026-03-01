"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Fragrance } from "@/types"
import { CLASH_POOL } from "@/data/clashPool"
import { calculateDNA, calculateClashScore, ScentDNA } from "@/lib/clash/dnaEngine"
import { useSoundEngine } from "@/lib/sound"
import { Swords, Trophy, ChevronRight, RotateCcw } from "lucide-react"

export default function ClashGame() {
    const [gameState, setGameState] = useState<'intro' | 'playing' | 'result'>('intro')
    const [currentPair, setCurrentPair] = useState<[Fragrance, Fragrance] | null>(null)
    const [score, setScore] = useState(0)
    const [highScore, setHighScore] = useState(0)
    const [timer, setTimer] = useState(15)
    const { playSparkle, playSwoosh } = useSoundEngine()

    const generatePair = () => {
        const p1 = CLASH_POOL[Math.floor(Math.random() * CLASH_POOL.length)]
        let p2 = CLASH_POOL[Math.floor(Math.random() * CLASH_POOL.length)]
        while (p1.id === p2.id) {
            p2 = CLASH_POOL[Math.floor(Math.random() * CLASH_POOL.length)]
        }
        setCurrentPair([p1, p2])
        setTimer(15)
    }

    const startGame = () => {
        setGameState('playing')
        setScore(0)
        generatePair()
        playSwoosh()
    }

    const handleChoice = (winner: Fragrance) => {
        if (!currentPair) return
        const [p1, p2] = currentPair
        const dna1 = calculateDNA(p1)
        const dna2 = calculateDNA(p2)
        const clashScore = calculateClashScore(dna1, dna2)

        // Game Logic: Guess which fragrance has higher "Mystery" (just for gameplay fun)
        const isCorrect = (winner.id === p1.id && dna1.mystery >= dna2.mystery) ||
                         (winner.id === p2.id && dna2.mystery >= dna1.mystery)

        if (isCorrect) {
            setScore(s => s + 1)
            playSparkle()
            generatePair()
        } else {
            setGameState('result')
            if (score > highScore) setHighScore(score)
            playSwoosh()
        }
    }

    useEffect(() => {
        if (gameState === 'playing' && timer > 0) {
            const t = setInterval(() => setTimer(s => s - 1), 1000)
            return () => clearInterval(t)
        } else if (timer === 0 && gameState === 'playing') {
            setGameState('result')
            if (score > highScore) setHighScore(score)
        }
    }, [timer, gameState, score, highScore])

    return (
        <div className="w-full max-w-4xl mx-auto px-4 py-8">
            <AnimatePresence mode="wait">
                {gameState === 'intro' && (
                    <motion.div
                        key="intro"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.1 }}
                        className="text-center space-y-8 py-20"
                    >
                        <div className="inline-block p-4 pixel-border bg-rose-500/10 mb-4">
                            <Swords size={48} className="text-rose-500 mx-auto" />
                        </div>
                        <h2 className="text-4xl font-bold text-white tracking-[0.4em] uppercase">Frag-Head_Clash</h2>
                        <p className="text-white/60 max-w-md mx-auto uppercase text-[10px] tracking-widest leading-relaxed">
                            Two fragrances enter. One survives the trial.
                            Identify the most <span className="text-retro-lavender font-bold">Mysterious</span> scent to climb the leaderboard.
                        </p>
                        <button
                            onClick={startGame}
                            className="pixel-border px-12 py-4 text-rose-500 hover:bg-rose-500/20 transition-all uppercase tracking-[0.3em] font-bold"
                        >
                            Enter_The_Arena
                        </button>
                    </motion.div>
                )}

                {gameState === 'playing' && currentPair && (
                    <motion.div
                        key="playing"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="space-y-12"
                    >
                        <div className="flex justify-between items-center px-4">
                            <div className="text-retro-cyan uppercase tracking-[0.2em] text-[10px]">Score: {score}</div>
                            <div className="text-rose-500 font-mono text-2xl drop-shadow-[0_0_10px_#f43f5e]">{timer}s</div>
                            <div className="text-retro-lavender uppercase tracking-[0.2em] text-[10px]">High_Score: {highScore}</div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-8 items-stretch">
                            {currentPair.map((frag, idx) => (
                                <motion.button
                                    key={frag.id}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => handleChoice(frag)}
                                    className="pixel-border p-8 bg-black/60 hover:border-rose-500/50 group text-left relative overflow-hidden"
                                >
                                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-100 group-hover:text-rose-500 transition-all">
                                        <ChevronRight />
                                    </div>
                                    <div className="text-[10px] text-white/40 uppercase tracking-widest mb-2">{frag.brand}</div>
                                    <h3 className="text-xl font-bold text-white uppercase tracking-tighter mb-4 group-hover:text-rose-400 transition-colors">{frag.name}</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {frag.accords.slice(0, 3).map(a => (
                                            <span key={a} className="text-[8px] uppercase border border-white/10 px-2 py-0.5 text-white/50">{a}</span>
                                        ))}
                                    </div>
                                </motion.button>
                            ))}
                            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none hidden md:block">
                                <div className="p-3 pixel-border bg-black text-rose-500 text-xs font-bold uppercase tracking-widest">VS</div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {gameState === 'result' && (
                    <motion.div
                        key="result"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center space-y-8 py-20"
                    >
                        <Trophy size={64} className="text-yellow-500 mx-auto" />
                        <h2 className="text-3xl font-bold text-white tracking-[0.2em] uppercase">Arena_Concluded</h2>
                        <div className="space-y-2">
                            <div className="text-5xl font-mono text-retro-lavender">{score}</div>
                            <div className="text-white/40 uppercase text-[10px] tracking-widest">Scent Matches Identified</div>
                        </div>
                        <button
                            onClick={startGame}
                            className="pixel-border px-8 py-3 text-white hover:bg-white/10 transition-all uppercase tracking-[0.2em] flex items-center gap-2 mx-auto"
                        >
                            <RotateCcw size={14} /> Retry_Arena
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
