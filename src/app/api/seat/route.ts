import { NextResponse } from "next/server"
import { getEvent } from "@/lib/kv"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const name = searchParams.get("name")?.trim()

  if (!name) {
    return NextResponse.json({ error: "名前を入力してください" }, { status: 400 })
  }

  const event = await getEvent()

  if (!event.isAssigned) {
    return NextResponse.json({ error: "まだ席が決まっていません。少しお待ちください！" }, { status: 404 })
  }

  const assignment = event.assignments.find(
    (a) => a.name.trim() === name
  )

  if (!assignment) {
    return NextResponse.json(
      { error: "名前が見つかりませんでした。入力を確認してください。" },
      { status: 404 }
    )
  }

  const table = event.tables.find((t) => t.id === assignment.tableId)
  return NextResponse.json({
    name: assignment.name,
    tableId: assignment.tableId,
    tableCount: event.tables.length,
    capacity: table?.capacity ?? 0,
  })
}
