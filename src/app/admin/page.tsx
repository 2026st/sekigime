"use client"

import { useEffect, useState } from "react"
import { ParticipantEditor } from "@/components/ParticipantEditor"
import { TableEditor } from "@/components/TableEditor"
import type { EventData, Table } from "@/lib/types"

export default function AdminPage() {
  const [event, setEvent] = useState<EventData | null>(null)
  const [assigning, setAssigning] = useState(false)
  const [error, setError] = useState("")

  const fetchEvent = async () => {
    const res = await fetch("/api/event")
    const data = await res.json()
    setEvent(data)
  }

  useEffect(() => { fetchEvent() }, [])

  const saveParticipants = async (participants: string[]) => {
    const res = await fetch("/api/event", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ participants }),
    })
    const data = await res.json()
    setEvent(data)
  }

  const saveTables = async (tables: Table[]) => {
    const res = await fetch("/api/event", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tables }),
    })
    const data = await res.json()
    setEvent(data)
  }

  const assign = async () => {
    setAssigning(true)
    setError("")
    const res = await fetch("/api/assign", { method: "POST" })
    const data = await res.json()
    if (!res.ok) {
      setError(data.error)
    } else {
      setEvent(data)
    }
    setAssigning(false)
  }

  const reset = async () => {
    const res = await fetch("/api/event", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isAssigned: false }),
    })
    const data = await res.json()
    setEvent(data)
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-yellow-400 text-xl animate-pulse">読み込み中...</div>
      </div>
    )
  }

  const tableById = Object.fromEntries(event.tables.map((t) => [t.id, t]))

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 md:p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-black text-yellow-400">席決め 管理画面</h1>
          <span className="text-gray-500 text-sm">
            {event.isAssigned ? (
              <span className="text-green-400 font-bold">振り分け済み</span>
            ) : (
              "未振り分け"
            )}
          </span>
        </div>

        <ParticipantEditor participants={event.participants} onSave={saveParticipants} />
        <TableEditor tables={event.tables} onSave={saveTables} />

        {/* 振り分けコントロール */}
        <div className="bg-gray-800 rounded-2xl p-6 space-y-4">
          <div className="flex gap-3">
            <button
              onClick={assign}
              disabled={assigning}
              className="flex-1 bg-yellow-400 text-gray-900 font-black text-lg py-4 rounded-xl hover:bg-yellow-300 disabled:opacity-50 transition-colors"
            >
              {assigning ? "振り分け中..." : "ランダム振り分け！"}
            </button>
            {event.isAssigned && (
              <button
                onClick={reset}
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

        {/* 振り分け結果 */}
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
