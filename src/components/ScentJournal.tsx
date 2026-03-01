"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Fragrance } from "@/types"
import { useSoundEngine } from "@/lib/sound"
import { BookMarked, Trash2, ExternalLink } from "lucide-react"

export default function ScentJournal() {
    const [saved, setSaved] = useState<Fragrance[]>([])
    const { playSwoosh } = useSoundEngine()

    useEffect(() => {
        const data = localStorage.getItem('fraghead_journal')
        if (data) setSaved(JSON.parse(data))
    }, [])

    const remove = (id: string) => {
        const next = saved.filter(f => f.id !== id)
        setSaved(next)
        localStorage.setItem('fraghead_journal', JSON.stringify(next))
        playSwoosh()
    }

    return (
        <div className="w-full max-w-4xl mx-auto px-4 py-8">
            <div className="flex items-center gap-4 mb-12">
                <BookMarked className="text-retro-lavender" />
                <h2 className="text-2xl font-bold text-white tracking-[0.4em] uppercase">Scent_Journal</h2>
            </div>

            {saved.length === 0 ? (
                <div className="py-20 text-center pixel-border bg-white/5 opacity-40">
                    <p className="text-[10px] tracking-widest uppercase text-white">Your journal is currently blank.</p>
                </div>
            ) : (
                <div className="grid gap-6">
                    {saved.map((frag, idx) => (
                        <motion.div
                            key={frag.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="pixel-border p-6 bg-black/60 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 group"
                        >
                            <div>
                                <div className="text-[10px] text-retro-cyan uppercase tracking-widest mb-1">{frag.brand}</div>
                                <h3 className="text-lg font-bold text-white uppercase tracking-tight">{frag.name}</h3>
                                <p className="text-[10px] text-white/40 uppercase mt-2 line-clamp-1">{frag.vibe}</p>
                            </div>
                            <div className="flex gap-4">
                                <button
                                    onClick={() => remove(frag.id)}
                                    className="p-2 text-white/20 hover:text-rose-500 transition-colors"
                                    title="Remove from Journal"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    )
}
