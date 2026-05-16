"use client"

import { useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { RouletteAnimation } from "@/components/RouletteAnimation"
import { Confetti } from "@/components/Confetti"

type Phase = "idle" | "searching" | "animating" | "result" | "error"

type SeatResult = {
  name: string
  tableId: number
  tableCount: number
}

type Props = {
  eventId: string
}

export function ParticipantSeatView({ eventId }: Props) {
  const [name, setName] = useState("")
  const [phase, setPhase] = useState<Phase>("idle")
  const [result, setResult] = useState<SeatResult | null>(null)
  const [error, setError] = useState("")
  const [confetti, setConfetti] = useState(false)

  const handleSearch = async () => {
    if (!name.trim()) return
    setPhase("searching")
    setError("")

    const res = await fetch(
      `/api/seat?eventId=${encodeURIComponent(eventId)}&name=${encodeURIComponent(name.trim())}`
    )
    const data = await res.json()

    if (!res.ok) {
      setError(data.error)
      setPhase("error")
      return
    }

    setResult(data)
    setPhase("animating")
  }

  const handleAnimationComplete = useCallback(() => {
    setPhase("result")
    setConfetti(true)
  }, [])

  const reset = () => {
    setPhase("idle")
    setName("")
    setResult(null)
    setConfetti(false)
  }

  return (
    <motion.div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4">
      <Confetti trigger={confetti} />

      <AnimatePresence mode="wait">
        {phase === "idle" && (
          <motion.div
            key="idle"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-sm space-y-6 text-center"
          >
            <div>
              <h1 className="text-4xl font-black text-yellow-400 mb-2">席決め</h1>
              <p className="text-gray-400">名前を入力して席を確認しましょう！</p>
            </div>
            <div className="space-y-3">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="名前を入力..."
                className="w-full bg-gray-800 text-white text-xl text-center rounded-2xl px-6 py-4 border-2 border-gray-700 focus:border-yellow-400 focus:outline-none placeholder-gray-600"
                autoFocus
              />
              <button
                onClick={handleSearch}
                disabled={!name.trim()}
                className="w-full bg-yellow-400 text-gray-900 font-black text-xl py-4 rounded-2xl hover:bg-yellow-300 disabled:opacity-30 transition-all active:scale-95"
              >
                席を確認する！
              </button>
            </div>
          </motion.div>
        )}

        {phase === "searching" && (
          <motion.div
            key="searching"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-yellow-400 text-2xl font-bold animate-pulse"
          >
            検索中...
          </motion.div>
        )}

        {phase === "animating" && result && (
          <motion.div
            key="animating"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <p className="text-white text-xl mb-2">
              <span className="text-yellow-400 font-bold">{result.name}</span> さんの席は...
            </p>
            <RouletteAnimation
              targetId={result.tableId}
              tableCount={result.tableCount}
              onComplete={handleAnimationComplete}
            />
          </motion.div>
        )}

        {phase === "result" && result && (
          <motion.div
            key="result"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center space-y-4"
          >
            <p className="text-white text-xl">
              <span className="text-yellow-400 font-bold">{result.name}</span> さんの席
            </p>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.2, 1.0] }}
              transition={{ duration: 0.5, times: [0, 0.7, 1] }}
            >
              <div className="relative">
                <div className="absolute inset-0 bg-yellow-400 rounded-3xl blur-2xl opacity-30" />
                <div className="relative bg-gray-800 border-4 border-yellow-400 rounded-3xl px-12 py-8">
                  <p className="text-9xl font-black text-yellow-400 leading-none">{result.tableId}</p>
                  <p className="text-2xl text-white font-bold mt-2">番テーブル</p>
                </div>
              </div>
            </motion.div>
            <p className="text-gray-400 text-lg">へどうぞ！</p>
            <button
              onClick={reset}
              className="mt-4 text-gray-500 hover:text-gray-300 text-sm underline transition-colors"
            >
              別の名前を検索する
            </button>
          </motion.div>
        )}

        {phase === "error" && (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-4 w-full max-w-sm"
          >
            <div className="bg-red-900/40 border border-red-500 rounded-2xl p-6">
              <p className="text-red-300 text-lg">{error}</p>
            </div>
            <button
              onClick={reset}
              className="w-full bg-gray-700 text-white font-bold py-4 rounded-2xl hover:bg-gray-600 transition-colors"
            >
              戻る
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
