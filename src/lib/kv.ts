import { randomUUID } from "crypto"
import { kv } from "@vercel/kv"
import type { EventData } from "./types"
import { DEFAULT_EVENT } from "./types"

const UUID_V4_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

const hasKvEnv = Boolean(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN)
const memoryEvents = new Map<string, EventData>()

function eventKey(eventId: string): string {
  return `event:${eventId}`
}

export function isValidEventId(id: string): boolean {
  return UUID_V4_RE.test(id)
}

function cloneEvent(data: EventData): EventData {
  return {
    participants: [...data.participants],
    tables: data.tables.map((table) => ({ ...table })),
    assignments: data.assignments.map((assignment) => ({ ...assignment })),
    isAssigned: data.isAssigned,
  }
}

export async function getEvent(eventId: string): Promise<EventData | null> {
  if (!isValidEventId(eventId)) return null

  if (!hasKvEnv) {
    const data = memoryEvents.get(eventId)
    return data ? cloneEvent(data) : null
  }

  const data = await kv.get<EventData>(eventKey(eventId))
  return data ? cloneEvent(data) : null
}

export async function setEvent(eventId: string, data: EventData): Promise<void> {
  if (!isValidEventId(eventId)) return

  if (!hasKvEnv) {
    memoryEvents.set(eventId, cloneEvent(data))
    return
  }

  await kv.set(eventKey(eventId), data)
}

export async function createEvent(): Promise<string> {
  const eventId = randomUUID()
  await setEvent(eventId, cloneEvent(DEFAULT_EVENT))
  return eventId
}
