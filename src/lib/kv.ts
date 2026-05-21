import { randomUUID } from "crypto"
import type { EventData } from "./types"
import { DEFAULT_EVENT } from "./types"

const UUID_V4_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

/** Base64(JSON) のサービスアカウントキー（Cloudflare / ローカル .dev.vars に設定） */
const serviceAccountB64 = process.env.FIREBASE_SERVICE_ACCOUNT_JSON_B64

const hasFirestoreEnv = Boolean(serviceAccountB64)

const memoryEvents = new Map<string, EventData>()

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

  if (!hasFirestoreEnv) {
    const data = memoryEvents.get(eventId)
    return data ? cloneEvent(data) : null
  }

  const { firestoreGetEvent } = await import("./firestore-rest")
  const data = await firestoreGetEvent(eventId)
  return data ? cloneEvent(data) : null
}

export async function setEvent(eventId: string, data: EventData): Promise<void> {
  if (!isValidEventId(eventId)) return

  if (!hasFirestoreEnv) {
    memoryEvents.set(eventId, cloneEvent(data))
    return
  }

  const { firestoreSetEvent } = await import("./firestore-rest")
  await firestoreSetEvent(eventId, cloneEvent(data))
}

export async function createEvent(): Promise<string> {
  const eventId = randomUUID()
  await setEvent(eventId, cloneEvent(DEFAULT_EVENT))
  return eventId
}
