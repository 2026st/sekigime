import { kv } from "@vercel/kv"
import type { EventData } from "./types"
import { DEFAULT_EVENT } from "./types"

const EVENT_KEY = "event"

export async function getEvent(): Promise<EventData> {
  const data = await kv.get<EventData>(EVENT_KEY)
  return data ?? { ...DEFAULT_EVENT }
}

export async function setEvent(data: EventData): Promise<void> {
  await kv.set(EVENT_KEY, data)
}
