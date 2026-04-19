import { kv } from "@vercel/kv"
import type { EventData } from "./types"
import { DEFAULT_EVENT } from "./types"

const EVENT_KEY = "event"
const hasKvEnv = Boolean(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN)
let memoryEvent: EventData | null = null

function cloneEvent(data: EventData): EventData {
  return {
    participants: [...data.participants],
    tables: data.tables.map((table) => ({ ...table })),
    assignments: data.assignments.map((assignment) => ({ ...assignment })),
    isAssigned: data.isAssigned,
  }
}

export async function getEvent(): Promise<EventData> {
  if (!hasKvEnv) {
    return cloneEvent(memoryEvent ?? DEFAULT_EVENT)
  }

  const data = await kv.get<EventData>(EVENT_KEY)
  return cloneEvent(data ?? DEFAULT_EVENT)
}

export async function setEvent(data: EventData): Promise<void> {
  if (!hasKvEnv) {
    memoryEvent = cloneEvent(data)
    return
  }

  await kv.set(EVENT_KEY, data)
}
