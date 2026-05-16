import { NextResponse } from "next/server"
import { loadEvent, parseEventId } from "@/lib/api-event"

export async function GET(req: Request) {
  const eventIdOrError = parseEventId(req)
  if (eventIdOrError instanceof NextResponse) return eventIdOrError

  const { searchParams } = new URL(req.url)
  const name = searchParams.get("name")?.trim()

  if (!name) {
    return NextResponse.json({ error: "名前を入力してください" }, { status: 400 })
  }

  const eventOrError = await loadEvent(eventIdOrError)
  if (eventOrError instanceof NextResponse) return eventOrError

  if (!eventOrError.isAssigned) {
    return NextResponse.json({ error: "まだ席が決まっていません。少しお待ちください！" }, { status: 404 })
  }

  const assignment = eventOrError.assignments.find((a) => a.name.trim() === name)

  if (!assignment) {
    return NextResponse.json(
      { error: "名前が見つかりませんでした。入力を確認してください。" },
      { status: 404 }
    )
  }

  const table = eventOrError.tables.find((t) => t.id === assignment.tableId)
  return NextResponse.json({
    name: assignment.name,
    tableId: assignment.tableId,
    tableCount: eventOrError.tables.length,
    capacity: table?.capacity ?? 0,
  })
}
