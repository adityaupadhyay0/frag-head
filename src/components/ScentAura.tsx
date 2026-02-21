"use client"

import { useRef, useEffect } from "react"
import { Fragrance } from "@/types"

interface ScentAuraProps {
  fragrance: Fragrance
}

export default function ScentAura({ fragrance }: ScentAuraProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const size = 200
    canvas.width = size
    canvas.height = size

    // Draw background
    ctx.fillStyle = "#050505"
    ctx.fillRect(0, 0, size, size)

    // Generate 8-bit pattern
    const colors = fragrance.colors
    const cellSize = 10

    for (let x = 0; x < size; x += cellSize) {
      for (let y = 0; y < size; y += cellSize) {
        // Use a pseudo-random based on fragrance id and position
        const hash = (parseInt(fragrance.id) * 123 + x * 456 + y * 789) % 100
        if (hash > 40) {
          const colorIdx = hash % colors.length
          ctx.fillStyle = colors[colorIdx]
          ctx.globalAlpha = 0.3 + (hash / 200)
          ctx.fillRect(x, y, cellSize, cellSize)
        }
      }
    }

    // Add some "glitch" lines
    ctx.globalAlpha = 0.5
    ctx.strokeStyle = colors[0]
    ctx.beginPath()
    ctx.moveTo(0, size / 2)
    ctx.lineTo(size, size / 2)
    ctx.stroke()

  }, [fragrance])

  const downloadAura = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const link = document.createElement("a")
    link.download = `scent-aura-${fragrance.name.toLowerCase()}.png`
    link.href = canvas.toDataURL()
    link.click()
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="pixel-border p-1 bg-white/5">
        <canvas ref={canvasRef} className="image-pixelated w-40 h-40" />
      </div>
      <button
        onClick={downloadAura}
        className="text-[8px] text-retro-cyan hover:text-white uppercase tracking-widest"
      >
        Export_Aura.PNG
      </button>
    </div>
  )
}
