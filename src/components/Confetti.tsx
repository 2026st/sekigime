"use client"

import { useEffect } from "react"

const ENVELOPE_COLORS = ["#ffd700", "#f5e6c8", "#e8c4a0", "#d4b896", "#fffef8"]

export function Confetti({ trigger }: { trigger: boolean }) {
  useEffect(() => {
    if (!trigger) return
    import("canvas-confetti").then((mod) => {
      const confetti = mod.default
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.55 },
        colors: ENVELOPE_COLORS,
        startVelocity: 40,
      })
      setTimeout(() => {
        confetti({
          particleCount: 80,
          spread: 120,
          origin: { y: 0.65, x: 0.2 },
          colors: ENVELOPE_COLORS,
        })
        confetti({
          particleCount: 80,
          spread: 120,
          origin: { y: 0.65, x: 0.85 },
          colors: ENVELOPE_COLORS,
        })
      }, 350)
    })
  }, [trigger])
  return null
}
