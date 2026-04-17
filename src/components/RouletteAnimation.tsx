"use client"

import { useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useRoulette } from "@/hooks/useRoulette"

type Props = {
  targetId: number
  tableCount: number
  onComplete: () => void
}

export function RouletteAnimation({ targetId, tableCount, onComplete }: Props) {
  const { displayId, phase, start } = useRoulette(targetId, tableCount)

  useEffect(() => { start() }, [start])

  useEffect(() => {
    if (phase === "done") onComplete()
  }, [phase, onComplete])

  return (
    <div className="flex flex-col items-center justify-center py-8">
      <div className="relative">
        {/* 外枠の光る演出 */}
        <div
          className={`absolute inset-0 rounded-3xl blur-xl transition-opacity duration-500 ${
            phase === "done" ? "opacity-100 bg-yellow-400" : "opacity-40 bg-yellow-600"
          }`}
        />
        <div className="relative overflow-hidden h-40 w-40 flex items-center justify-center rounded-3xl border-4 border-yellow-400 bg-gray-900 shadow-2xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={displayId}
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              transition={{ duration: 0.06 }}
              className="text-7xl font-black text-yellow-400"
            >
              {displayId}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <p className="mt-6 text-gray-400 text-sm animate-pulse">
        {phase !== "done" ? "席を決めています..." : "決定！"}
      </p>
    </div>
  )
}
