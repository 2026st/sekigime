import { NextResponse } from "next/server"
import { getEvent, isValidEventId } from "@/lib/kv"

export function parseEventId(req: Request): string | NextResponse {
  const { searchParams } = new URL(req.url)
  const eventId = searchParams.get("eventId")?.trim()

  if (!eventId) {
    return NextResponse.json({ error: "eventId が必要です" }, { status: 400 })
  }

  if (!isValidEventId(eventId)) {
    return NextResponse.json({ error: "eventId が不正です" }, { status: 400 })
  }

  return eventId
}

export async function loadEvent(eventId: string) {
  const event = await getEvent(eventId)
  if (!event) {
    return NextResponse.json({ error: "イベントが見つかりません" }, { status: 404 })
  }
  return event
}
