import { useState, useEffect, useCallback } from "react"

type Phase = "idle" | "fast" | "slow" | "done"

export function useRoulette(targetId: number, tableCount: number) {
  const [displayId, setDisplayId] = useState(1)
  const [phase, setPhase] = useState<Phase>("idle")

  const start = useCallback(() => {
    setPhase("fast")
  }, [])

  useEffect(() => {
    if (phase === "idle" || phase === "done") return

    const startTime = Date.now()
    let timeoutId: ReturnType<typeof setTimeout>

    const tick = () => {
      const elapsed = Date.now() - startTime

      if (elapsed < 2000) {
        setDisplayId(Math.floor(Math.random() * tableCount) + 1)
        timeoutId = setTimeout(tick, 50)
      } else if (elapsed < 3500) {
        const progress = (elapsed - 2000) / 1500
        const interval = 50 + progress * 450
        setDisplayId(Math.floor(Math.random() * tableCount) + 1)
        timeoutId = setTimeout(tick, interval)
      } else {
        setDisplayId(targetId)
        setPhase("done")
      }
    }

    timeoutId = setTimeout(tick, 50)
    return () => clearTimeout(timeoutId)
  }, [phase, targetId, tableCount])

  return { displayId, phase, start }
}
