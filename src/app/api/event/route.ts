import { NextResponse } from "next/server"
import { getEvent, setEvent } from "@/lib/kv"
import type { EventData } from "@/lib/types"

export async function GET() {
  const data = await getEvent()
  return NextResponse.json(data)
}

export async function PUT(req: Request) {
  const body = await req.json().catch(() => null)
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "不正なリクエストです" }, { status: 400 })
  }

  const current = await getEvent()
  const updated: EventData = { ...current }

  if ("participants" in body) {
    if (
      !Array.isArray(body.participants) ||
      body.participants.some((p: unknown) => typeof p !== "string" || p.length > 255)
    ) {
      return NextResponse.json({ error: "参加者データが不正です" }, { status: 400 })
    }
    updated.participants = [...new Set<string>(body.participants.map((p: string) => p.trim()).filter(Boolean))]
    // 参加者変更時は振り分けをリセット
    updated.assignments = []
    updated.isAssigned = false
  }

  if ("tables" in body) {
    if (
      !Array.isArray(body.tables) ||
      body.tables.some(
        (t: unknown) =>
          typeof t !== "object" ||
          t === null ||
          typeof (t as Record<string, unknown>).id !== "number" ||
          typeof (t as Record<string, unknown>).capacity !== "number" ||
          (t as Record<string, number>).capacity < 1 ||
          (t as Record<string, number>).capacity > 100
      )
    ) {
      return NextResponse.json({ error: "テーブルデータが不正です" }, { status: 400 })
    }
    updated.tables = body.tables
    updated.assignments = []
    updated.isAssigned = false
  }

  if ("isAssigned" in body && body.isAssigned === false) {
    updated.isAssigned = false
    updated.assignments = []
  }

  await setEvent(updated)
  return NextResponse.json(updated)
}
