import { NextResponse } from "next/server"
import { getEvent, setEvent } from "@/lib/kv"
import { randomAssign } from "@/lib/assign"

export async function POST() {
  const event = await getEvent()

  try {
    const assignments = randomAssign(event.participants, event.tables)
    const updated = { ...event, assignments, isAssigned: true }
    await setEvent(updated)
    return NextResponse.json(updated)
  } catch (e) {
    const message = e instanceof Error ? e.message : "振り分けに失敗しました"
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
