"use client"

import { useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { EnvelopeReveal } from "@/components/EnvelopeReveal"
import { Confetti } from "@/components/Confetti"
import { getEvent } from "@/lib/firebase/events"

type Phase = "idle" | "searching" | "reveal" | "error"

type SeatResult = {
  name: string
  tableId: number
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

    try {
      const event = await getEvent(eventId)
      if (!event) {
        setError("イベントが見つかりません")
        setPhase("error")
        return
      }
      if (!event.isAssigned) {
        setError("まだ席が決まっていません。少しお待ちください！")
        setPhase("error")
        return
      }

      const trimmed = name.trim()
      const assignment = event.assignments.find((a) => a.name.trim() === trimmed)
      if (!assignment) {
        setError("名前が見つかりませんでした。入力を確認してください。")
        setPhase("error")
        return
      }

      setResult({
        name: assignment.name,
        tableId: assignment.tableId,
      })
      setPhase("reveal")
    } catch {
      setError("読み込みに失敗しました")
      setPhase("error")
    }
  }

  const handleOpened = useCallback(() => {
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

        {phase === "reveal" && result && (
          <motion.div
            key="reveal"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="w-full flex justify-center"
          >
            <EnvelopeReveal
              tableId={result.tableId}
              participantName={result.name}
              onOpened={handleOpened}
              onReset={reset}
            />
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
