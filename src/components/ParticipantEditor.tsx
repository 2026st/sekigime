"use client"

import { useState } from "react"

type Props = {
  participants: string[]
  onSave: (participants: string[]) => Promise<void>
}

export function ParticipantEditor({ participants, onSave }: Props) {
  const [text, setText] = useState(participants.join("\n"))
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    const list = text
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean)
    await onSave(list)
    setSaving(false)
  }

  return (
    <div className="bg-gray-800 rounded-2xl p-6">
      <h2 className="text-lg font-bold text-white mb-3">参加者リスト</h2>
      <p className="text-gray-400 text-sm mb-3">1行に1名の名前を入力してください</p>
      <textarea
        className="w-full h-48 bg-gray-900 text-white rounded-lg p-3 text-sm resize-none border border-gray-700 focus:border-yellow-400 focus:outline-none"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={"田中洸志\n山田太郎\n鈴木花子"}
      />
      <div className="flex items-center justify-between mt-3">
        <span className="text-gray-400 text-sm">
          {text.split("\n").filter((s) => s.trim()).length} 名
        </span>
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-yellow-400 text-gray-900 font-bold px-6 py-2 rounded-lg hover:bg-yellow-300 disabled:opacity-50 transition-colors"
        >
          {saving ? "保存中..." : "保存"}
        </button>
      </div>
    </div>
  )
}
