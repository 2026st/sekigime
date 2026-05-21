"use client"

import { useEffect, useState } from "react"
import type { Table } from "@/lib/types"

type Props = {
  tables: Table[]
  onSave: (tables: Table[]) => Promise<void>
}

type LocalTable = { id: number; capacity: string }

function toLocalTables(tables: Table[]): LocalTable[] {
  return tables.map((t) => ({ id: t.id, capacity: String(t.capacity) }))
}

const FULLWIDTH_DIGIT = /[\uFF10-\uFF19]/

function hasFullwidthDigits(raw: string): boolean {
  return FULLWIDTH_DIGIT.test(raw)
}

type CapacityValidation =
  | { ok: true; value: number }
  | { ok: false; reason: "empty" | "fullwidth" | "invalid" }

function validateCapacity(raw: string): CapacityValidation {
  const trimmed = raw.trim()
  if (trimmed === "") return { ok: false, reason: "empty" }
  if (hasFullwidthDigits(trimmed)) return { ok: false, reason: "fullwidth" }
  const n = Number(trimmed)
  if (!Number.isInteger(n) || n < 1 || n > 100) return { ok: false, reason: "invalid" }
  return { ok: true, value: n }
}

function parseCapacity(raw: string): number | null {
  const result = validateCapacity(raw)
  return result.ok ? result.value : null
}

export function TableEditor({ tables, onSave }: Props) {
  const [localTables, setLocalTables] = useState<LocalTable[]>(() => toLocalTables(tables))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLocalTables(toLocalTables(tables))
    setError(null)
  }, [tables])

  const addTable = () => {
    const nextId = localTables.length > 0 ? Math.max(...localTables.map((t) => t.id)) + 1 : 1
    setLocalTables([...localTables, { id: nextId, capacity: "4" }])
  }

  const updateCapacity = (id: number, capacity: string) => {
    setError(null)
    setLocalTables(localTables.map((t) => (t.id === id ? { ...t, capacity } : t)))
  }

  const removeTable = (id: number) => {
    setLocalTables(localTables.filter((t) => t.id !== id))
  }

  const handleSave = async () => {
    const validations = localTables.map((t) => ({
      table: t,
      result: validateCapacity(t.capacity),
    }))
    if (validations.some(({ result }) => !result.ok && result.reason === "fullwidth")) {
      setError("入力数字は半角で入力してください")
      return
    }
    if (validations.some(({ result }) => !result.ok && result.reason === "empty")) {
      setError("各卓の定員を入力してください")
      return
    }
    if (validations.some(({ result }) => !result.ok)) {
      setError("各卓の定員を1〜100の数値で入力してください")
      return
    }
    const parsed = validations.map(({ table, result }) => ({
      table,
      capacity: (result as { ok: true; value: number }).value,
    }))
    setError(null)
    setSaving(true)
    await onSave(
      parsed.map(({ table, capacity }) => ({
        id: table.id,
        capacity: capacity as number,
      }))
    )
    setSaving(false)
  }

  const totalCapacity = localTables.reduce((sum, t) => {
    const n = parseCapacity(t.capacity)
    return n !== null ? sum + n : sum
  }, 0)

  return (
    <div className="bg-gray-800 rounded-2xl p-6">
      <h2 className="text-lg font-bold text-white mb-3">テーブル設定</h2>
      <div className="space-y-2 mb-4">
        {localTables.length === 0 && (
          <p className="text-gray-500 text-sm">テーブルがありません。追加してください。</p>
        )}
        {localTables.map((table) => (
          <div key={table.id} className="flex items-center gap-3 bg-gray-900 rounded-lg px-4 py-3">
            <span className="text-yellow-400 font-bold w-16 shrink-0">
              {table.id}番卓
            </span>
            <input
              type="number"
              min={1}
              max={100}
              value={table.capacity}
              onChange={(e) => updateCapacity(table.id, e.target.value)}
              className="w-20 bg-gray-700 text-white rounded px-2 py-1 text-center border border-gray-600 focus:border-yellow-400 focus:outline-none"
            />
            <span className="text-gray-400 text-sm">名</span>
            <button
              onClick={() => removeTable(table.id)}
              className="ml-auto text-red-400 hover:text-red-300 text-sm"
            >
              削除
            </button>
          </div>
        ))}
      </div>
      <button
        onClick={addTable}
        className="w-full border-2 border-dashed border-gray-600 text-gray-400 hover:border-yellow-400 hover:text-yellow-400 rounded-lg py-2 text-sm transition-colors mb-4"
      >
        + テーブルを追加
      </button>
      {error && (
        <p className="text-red-400 text-sm mb-3" role="alert">
          {error}
        </p>
      )}
      <div className="flex items-center justify-between">
        <span className="text-gray-400 text-sm">
          合計定員: <span className="text-white font-bold">{totalCapacity}</span> 名
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
