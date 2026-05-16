"use client"

import { useEffect, useState } from "react"
import { ParticipantEditor } from "@/components/ParticipantEditor"
import { TableEditor } from "@/components/TableEditor"
import type { EventWithId, Table } from "@/lib/types"

type Props = {
  eventId: string
}

export function OrganizerSetup({ eventId }: Props) {
  const [event, setEvent] = useState<EventWithId | null>(null)
  const [assigning, setAssigning] = useState(false)
  const [error, setError] = useState("")
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "failed">("idle")

  const eventQuery = `eventId=${encodeURIComponent(eventId)}`
  const participantUrl =
    typeof window !== "undefined" ? `${window.location.origin}/${eventId}` : `/${eventId}`

  const fetchEvent = async () => {
    const res = await fetch(`/api/event?${eventQuery}`)
    if (!res.ok) {
      setError((await res.json()).error ?? "読み込みに失敗しました")
      setEvent(null)
      return
    }
    const data = await res.json()
    setEvent(data)
    setError("")
  }

  useEffect(() => {
    fetchEvent()
  }, [eventId])

  const saveParticipants = async (participants: string[]) => {
    const res = await fetch(`/api/event?${eventQuery}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ participants }),
    })
    const data = await res.json()
    if (res.ok) setEvent(data)
  }

  const saveTables = async (tables: Table[]) => {
    const res = await fetch(`/api/event?${eventQuery}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tables }),
    })
    const data = await res.json()
    if (res.ok) setEvent(data)
  }

  const assign = async () => {
    setAssigning(true)
    setError("")
    const res = await fetch(`/api/assign?${eventQuery}`, { method: "POST" })
    const data = await res.json()
    if (!res.ok) {
      setError(data.error)
    } else {
      setEvent(data)
    }
    setAssigning(false)
  }

  const resetAssignment = async () => {
    const res = await fetch(`/api/event?${eventQuery}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isAssigned: false }),
    })
    const data = await res.json()
    if (res.ok) setEvent(data)
  }

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(participantUrl)
      setCopyStatus("copied")
    } catch {
      setCopyStatus("failed")
    }
    setTimeout(() => setCopyStatus("idle"), 2000)
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-yellow-400 text-xl animate-pulse">
          {error || "読み込み中..."}
        </div>
      </div>
    )
  }

  const tableById = Object.fromEntries(event.tables.map((t) => [t.id, t]))

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 md:p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-black text-yellow-400">席決め</h1>
          <span className="text-gray-500 text-sm">
            {event.isAssigned ? (
              <span className="text-green-400 font-bold">作成済み</span>
            ) : (
              "未作成"
            )}
          </span>
        </div>

        <ParticipantEditor participants={event.participants} onSave={saveParticipants} />
        <TableEditor tables={event.tables} onSave={saveTables} />

        <div className="bg-gray-800 rounded-2xl p-6 space-y-4">
          <div className="flex gap-3">
            <button
              onClick={assign}
              disabled={assigning}
              className="flex-1 bg-yellow-400 text-gray-900 font-black text-lg py-4 rounded-xl hover:bg-yellow-300 disabled:opacity-50 transition-colors"
            >
              {assigning ? "作成中..." : "席を作成"}
            </button>
            {event.isAssigned && (
              <button
                onClick={resetAssignment}
                className="px-4 bg-gray-700 text-gray-300 rounded-xl hover:bg-gray-600 transition-colors text-sm"
              >
                リセット
              </button>
            )}
          </div>
          {error && (
            <p className="text-red-400 text-sm bg-red-900/30 rounded-lg px-4 py-2">{error}</p>
          )}
        </div>

        {event.isAssigned && (
          <div className="bg-gray-800 rounded-2xl p-6 space-y-4 border border-yellow-400/30">
            <h2 className="text-lg font-bold text-yellow-400">参加者に配るリンク</h2>
            <p className="text-gray-400 text-sm">
              全員に同じリンクを送り、各自が名前を入力して席を確認します。
            </p>
            <div className="flex gap-2">
              <input
                readOnly
                value={participantUrl}
                className="flex-1 bg-gray-900 text-white text-sm rounded-lg px-3 py-2 border border-gray-700 truncate"
                onFocus={(e) => e.target.select()}
              />
              <button
                onClick={copyLink}
                className="px-4 bg-yellow-400 text-gray-900 font-bold rounded-lg hover:bg-yellow-300 transition-colors text-sm shrink-0"
              >
                {copyStatus === "copied" ? "コピー済み" : copyStatus === "failed" ? "手動でコピー" : "コピー"}
              </button>
            </div>
            <a
              href={participantUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block text-yellow-400 text-sm underline hover:text-yellow-300"
            >
              参加者ページを開く
            </a>
          </div>
        )}

        {event.isAssigned && event.assignments.length > 0 && (
          <div className="bg-gray-800 rounded-2xl p-6">
            <h2 className="text-lg font-bold text-white mb-4">振り分け結果</h2>
            <div className="space-y-3">
              {event.tables.map((table) => {
                const members = event.assignments.filter((a) => a.tableId === table.id)
                return (
                  <div key={table.id} className="bg-gray-900 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-yellow-400 font-black text-lg">{table.id}番卓</span>
                      <span className="text-gray-500 text-sm">
                        {members.length}/{tableById[table.id]?.capacity ?? "?"} 名
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {members.map((m) => (
                        <span
                          key={m.name}
                          className="bg-gray-700 text-white rounded-full px-3 py-1 text-sm"
                        >
                          {m.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
