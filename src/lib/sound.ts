"use client"

import { useEffect, useRef, useState } from 'react'

const FREQS = {
  SPARKLE: [880, 1320, 1760, 2640], // E5, E6, A6, E7
  HUM: 440,
  SWOOSH: 110,
}

export function useSoundEngine() {
  const audioCtx = useRef<AudioContext | null>(null)
  const masterGain = useRef<GainNode | null>(null)
  const [isAudioEnabled, setIsAudioEnabled] = useState(false)

  const initAudio = () => {
    if (audioCtx.current) {
        if (isAudioEnabled) {
            masterGain.current!.gain.exponentialRampToValueAtTime(0.0001, audioCtx.current.currentTime + 0.1)
            setIsAudioEnabled(false)
        } else {
            masterGain.current!.gain.exponentialRampToValueAtTime(0.1, audioCtx.current.currentTime + 0.1)
            setIsAudioEnabled(true)
        }
        return
    }
    const AudioContextClass = (window.AudioContext || (window as any).webkitAudioContext) as typeof AudioContext
    audioCtx.current = new AudioContextClass()
    masterGain.current = audioCtx.current.createGain()
    masterGain.current.gain.value = 0.1
    masterGain.current.connect(audioCtx.current.destination)
    setIsAudioEnabled(true)
  }

  const playSparkle = () => {
    if (!audioCtx.current || !masterGain.current) return
    const ctx = audioCtx.current
    const now = ctx.currentTime
    const freq = FREQS.SPARKLE[Math.floor(Math.random() * FREQS.SPARKLE.length)]

    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'sine'
    osc.frequency.setValueAtTime(freq, now)
    osc.frequency.exponentialRampToValueAtTime(freq * 1.5, now + 0.1)

    gain.gain.setValueAtTime(0.2, now)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.3)

    osc.connect(gain)
    gain.connect(masterGain.current)

    osc.start()
    osc.stop(now + 0.3)
  }

  const playSwoosh = () => {
    if (!audioCtx.current || !masterGain.current) return
    const ctx = audioCtx.current
    const now = ctx.currentTime

    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'square'
    osc.frequency.setValueAtTime(FREQS.SWOOSH, now)
    osc.frequency.exponentialRampToValueAtTime(FREQS.SWOOSH * 2, now + 0.2)

    gain.gain.setValueAtTime(0.05, now)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.2)

    osc.connect(gain)
    gain.connect(masterGain.current)

    osc.start()
    osc.stop(now + 0.2)
  }

  const playHum = () => {
      // Background hum that pulses
  }

  return { initAudio, isAudioEnabled, playSparkle, playSwoosh }
}
