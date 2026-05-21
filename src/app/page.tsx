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
    // #region agent log
    fetch("http://127.0.0.1:7850/ingest/5e841da2-d59d-417d-9a0b-746f17926180", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Debug-Session-Id": "507c2b",
      },
      body: JSON.stringify({
        sessionId: "507c2b",
        runId: "pre-fix",
        hypothesisId: "H4",
        location: "src/app/page.tsx:startEvent:entry",
        message: "startEvent called",
        data: { host: typeof window !== "undefined" ? window.location.host : null },
        timestamp: Date.now(),
      }),
    }).catch(() => {})
    // #endregion
    try {
      const res = await fetch("/api/event", { method: "POST" })
      const rawText = await res.text()
      let data: { id?: string; error?: string } = {}
      try {
        data = JSON.parse(rawText) as { id?: string; error?: string }
      } catch {
        data = {}
      }
      // #region agent log
      fetch("http://127.0.0.1:7850/ingest/5e841da2-d59d-417d-9a0b-746f17926180", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Debug-Session-Id": "507c2b",
        },
        body: JSON.stringify({
          sessionId: "507c2b",
          runId: "pre-fix",
          hypothesisId: "H1",
          location: "src/app/page.tsx:startEvent:afterFetch",
          message: "POST /api/event response",
          data: {
            ok: res.ok,
            status: res.status,
            hasId: Boolean(data.id),
            idPrefix: data.id?.slice(0, 8),
            rawLen: rawText.length,
          },
          timestamp: Date.now(),
        }),
      }).catch(() => {})
      // #endregion
      if (!res.ok) {
        setStartError(data.error ?? "作成に失敗しました")
        setStarting(false)
        return
      }
      const target = `/?id=${data.id}`
      // #region agent log
      fetch("http://127.0.0.1:7850/ingest/5e841da2-d59d-417d-9a0b-746f17926180", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Debug-Session-Id": "507c2b",
        },
        body: JSON.stringify({
          sessionId: "507c2b",
          runId: "pre-fix",
          hypothesisId: "H3",
          location: "src/app/page.tsx:startEvent:beforeReplace",
          message: "calling router.replace",
          data: { target, eventIdBefore: eventId },
          timestamp: Date.now(),
        }),
      }).catch(() => {})
      // #endregion
      router.replace(target)
      // #region agent log
      setTimeout(() => {
        fetch("http://127.0.0.1:7850/ingest/5e841da2-d59d-417d-9a0b-746f17926180", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Debug-Session-Id": "507c2b",
          },
          body: JSON.stringify({
            sessionId: "507c2b",
            runId: "pre-fix",
            hypothesisId: "H3",
            location: "src/app/page.tsx:startEvent:afterReplace",
            message: "after router.replace (delayed)",
            data: {
              href: window.location.href,
              search: window.location.search,
              eventIdAfter: new URLSearchParams(window.location.search).get("id"),
            },
            timestamp: Date.now(),
          }),
        }).catch(() => {})
      }, 300)
      // #endregion
    } catch (err) {
      // #region agent log
      fetch("http://127.0.0.1:7850/ingest/5e841da2-d59d-417d-9a0b-746f17926180", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Debug-Session-Id": "507c2b",
        },
        body: JSON.stringify({
          sessionId: "507c2b",
          runId: "pre-fix",
          hypothesisId: "H4",
          location: "src/app/page.tsx:startEvent:catch",
          message: "startEvent threw",
          data: { error: err instanceof Error ? err.message : String(err) },
          timestamp: Date.now(),
        }),
      }).catch(() => {})
      // #endregion
      setStartError("通信に失敗しました")
      setStarting(false)
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
