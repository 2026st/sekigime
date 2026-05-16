import { NextResponse } from "next/server"
import { setEvent } from "@/lib/kv"
import { loadEvent, parseEventId } from "@/lib/api-event"
import { randomAssign } from "@/lib/assign"

export async function POST(req: Request) {
  const eventIdOrError = parseEventId(req)
  if (eventIdOrError instanceof NextResponse) return eventIdOrError

  const eventOrError = await loadEvent(eventIdOrError)
  if (eventOrError instanceof NextResponse) return eventOrError

  try {
    const assignments = randomAssign(eventOrError.participants, eventOrError.tables)
    const updated = { ...eventOrError, assignments, isAssigned: true }
    await setEvent(eventIdOrError, updated)
    return NextResponse.json({ id: eventIdOrError, ...updated })
  } catch (e) {
    const message = e instanceof Error ? e.message : "振り分けに失敗しました"
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
