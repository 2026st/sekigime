import { NextResponse } from "next/server"
import { createEvent, getEvent, setEvent } from "@/lib/kv"
import { loadEvent, parseEventId } from "@/lib/api-event"
import type { EventData } from "@/lib/types"

export async function POST() {
  // #region agent log
  fetch("http://127.0.0.1:7850/ingest/5e841da2-d59d-417d-9a0b-746f17926180", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Debug-Session-Id": "507c2b",
    },
    body: JSON.stringify({
      sessionId: "507c2b",
      runId: "pre-fix",
      hypothesisId: "H1",
      location: "src/app/api/event/route.ts:POST:entry",
      message: "POST /api/event handler",
      data: { hasFirebaseEnv: Boolean(process.env.FIREBASE_SERVICE_ACCOUNT_JSON_B64) },
      timestamp: Date.now(),
    }),
  }).catch(() => {})
  // #endregion
  try {
    const id = await createEvent()
    const data = await getEvent(id)
    // #region agent log
    fetch("http://127.0.0.1:7850/ingest/5e841da2-d59d-417d-9a0b-746f17926180", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Debug-Session-Id": "507c2b",
      },
      body: JSON.stringify({
        sessionId: "507c2b",
        runId: "pre-fix",
        hypothesisId: "H2",
        location: "src/app/api/event/route.ts:POST:success",
        message: "event created",
        data: { idPrefix: id.slice(0, 8), hasData: Boolean(data) },
        timestamp: Date.now(),
      }),
    }).catch(() => {})
    // #endregion
    return NextResponse.json({ id, ...data! })
  } catch (err) {
    // #region agent log
    fetch("http://127.0.0.1:7850/ingest/5e841da2-d59d-417d-9a0b-746f17926180", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Debug-Session-Id": "507c2b",
      },
      body: JSON.stringify({
        sessionId: "507c2b",
        runId: "pre-fix",
        hypothesisId: "H1",
        location: "src/app/api/event/route.ts:POST:error",
        message: "createEvent failed",
        data: { error: err instanceof Error ? err.message : String(err) },
        timestamp: Date.now(),
      }),
    }).catch(() => {})
    // #endregion
    return NextResponse.json(
      { error: "イベントの作成に失敗しました" },
      { status: 500 },
    )
  }
}

export async function GET(req: Request) {
  const eventIdOrError = parseEventId(req)
  if (eventIdOrError instanceof NextResponse) return eventIdOrError

  const eventOrError = await loadEvent(eventIdOrError)
  if (eventOrError instanceof NextResponse) return eventOrError

  return NextResponse.json({ id: eventIdOrError, ...eventOrError })
}

export async function PUT(req: Request) {
  const eventIdOrError = parseEventId(req)
  if (eventIdOrError instanceof NextResponse) return eventIdOrError

  const currentOrError = await loadEvent(eventIdOrError)
  if (currentOrError instanceof NextResponse) return currentOrError

  const body = await req.json().catch(() => null)
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "不正なリクエストです" }, { status: 400 })
  }

  const updated: EventData = { ...currentOrError }

  if ("participants" in body) {
    if (
      !Array.isArray(body.participants) ||
      body.participants.some((p: unknown) => typeof p !== "string" || p.length > 255)
    ) {
      return NextResponse.json({ error: "参加者データが不正です" }, { status: 400 })
    }
    updated.participants = [...new Set<string>(body.participants.map((p: string) => p.trim()).filter(Boolean))]
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

  await setEvent(eventIdOrError, updated)
  return NextResponse.json({ id: eventIdOrError, ...updated })
}
