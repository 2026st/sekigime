"use client"

import Link from "next/link"
import { Suspense, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { OrganizerSetup } from "@/components/OrganizerSetup"
import { parseEventIdFromUrl } from "@/lib/event-id"
import { createEvent, getEvent } from "@/lib/firebase/events"
import { isFirebaseConfigured } from "@/lib/firebase/config"

function HomeContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const eventId = searchParams.get("id")
  const [starting, setStarting] = useState(false)
  const [startError, setStartError] = useState("")
  const [resumeUrl, setResumeUrl] = useState("")
  const [resuming, setResuming] = useState(false)
  const [resumeError, setResumeError] = useState("")

  const startEvent = async () => {
    setStarting(true)
    setStartError("")
    try {
      if (!isFirebaseConfigured()) {
        setStartError(
          "Firebase が未設定です。.env.local に NEXT_PUBLIC_FIREBASE_* を設定してください。",
        )
        setStarting(false)
        return
      }
      const id = await createEvent()
      router.replace(`/?id=${id}`)
    } catch {
      setStartError("作成に失敗しました")
      setStarting(false)
    }
  }

  const resumeEvent = async () => {
    setResuming(true)
    setResumeError("")
    const id = parseEventIdFromUrl(resumeUrl)
    if (!id) {
      setResumeError("URL または ID が正しくありません")
      setResuming(false)
      return
    }
    try {
      if (!isFirebaseConfigured()) {
        setResumeError(
          "Firebase が未設定です。.env.local に NEXT_PUBLIC_FIREBASE_* を設定してください。",
        )
        setResuming(false)
        return
      }
      const data = await getEvent(id)
      if (!data) {
        setResumeError("イベントが見つかりません")
        setResuming(false)
        return
      }
      router.replace(`/?id=${id}`)
    } catch {
      setResumeError("読み込みに失敗しました")
      setResuming(false)
    }
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

          <div className="flex items-center gap-3 text-gray-500 text-sm">
            <div className="flex-1 h-px bg-gray-700" />
            <span>または</span>
            <div className="flex-1 h-px bg-gray-700" />
          </div>

          <div className="text-left space-y-3">
            <h2 className="text-white font-bold text-lg">既存の席決めを編集</h2>
            <p className="text-gray-400 text-sm">
              参加者に渡した URL を貼り付けて、再振り分けや設定の変更を行えます
            </p>
            <input
              type="text"
              value={resumeUrl}
              onChange={(e) => setResumeUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && resumeEvent()}
              placeholder="https://example.com/550e8400-..."
              className="w-full bg-gray-800 text-white text-sm rounded-xl px-4 py-3 border border-gray-700 focus:border-yellow-400 focus:outline-none"
            />
            <button
              onClick={resumeEvent}
              disabled={resuming || !resumeUrl.trim()}
              className="w-full bg-gray-700 text-white font-bold text-lg py-4 rounded-2xl hover:bg-gray-600 disabled:opacity-50 transition-all active:scale-95"
            >
              {resuming ? "確認中..." : "続ける"}
            </button>
            {resumeError && (
              <p className="text-red-400 text-sm bg-red-900/30 rounded-lg px-4 py-2">
                {resumeError}
              </p>
            )}
          </div>

          <Link
            href="/help"
            className="inline-block text-yellow-400 text-sm underline hover:text-yellow-300"
          >
            主催者の使い方（ヘルプ）
          </Link>
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
