"use client"

import { Suspense, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { OrganizerSetup } from "@/components/OrganizerSetup"

function HomeContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const eventId = searchParams.get("id")
  const [starting, setStarting] = useState(false)
  const [startError, setStartError] = useState("")

  const startEvent = async () => {
    setStarting(true)
    setStartError("")
    const res = await fetch("/api/event", { method: "POST" })
    const data = await res.json()
    if (!res.ok) {
      setStartError(data.error ?? "作成に失敗しました")
      setStarting(false)
      return
    }
    router.replace(`/?id=${data.id}`)
  }

  if (!eventId) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-sm text-center space-y-6">
          <div>
            <h1 className="text-4xl font-black text-yellow-400 mb-2">席決め</h1>
            <p className="text-gray-400">参加者とテーブルを設定して、席をランダムに割り当てます</p>
          </div>
          <button
            onClick={startEvent}
            disabled={starting}
            className="w-full bg-yellow-400 text-gray-900 font-black text-xl py-4 rounded-2xl hover:bg-yellow-300 disabled:opacity-50 transition-all active:scale-95"
          >
            {starting ? "準備中..." : "席決めを始める"}
          </button>
          {startError && (
            <p className="text-red-400 text-sm bg-red-900/30 rounded-lg px-4 py-2">{startError}</p>
          )}
        </div>
      </div>
    )
  }

  return <OrganizerSetup eventId={eventId} />
}

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-900 flex items-center justify-center">
          <div className="text-yellow-400 text-xl animate-pulse">読み込み中...</div>
        </div>
      }
    >
      <HomeContent />
    </Suspense>
  )
}
