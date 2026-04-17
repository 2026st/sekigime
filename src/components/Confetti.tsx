"use client"

import { useEffect } from "react"

export function Confetti({ trigger }: { trigger: boolean }) {
  useEffect(() => {
    if (!trigger) return
    import("canvas-confetti").then((mod) => {
      const confetti = mod.default
      confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } })
      setTimeout(() => {
        confetti({ particleCount: 80, spread: 120, origin: { y: 0.7, x: 0.2 } })
        confetti({ particleCount: 80, spread: 120, origin: { y: 0.7, x: 0.8 } })
      }, 400)
    })
  }, [trigger])
  return null
}
