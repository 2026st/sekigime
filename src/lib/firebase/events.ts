import { doc, getDoc, setDoc } from "firebase/firestore"
import type { EventData } from "@/lib/types"
import { DEFAULT_EVENT } from "@/lib/types"
import { isValidEventId } from "@/lib/event-id"
import { getFirestoreDb, isFirebaseConfigured } from "@/lib/firebase/config"

const COLLECTION = "events"

const memoryEvents = new Map<string, EventData>()

function cloneEvent(data: EventData): EventData {
  return {
    participants: [...data.participants],
    tables: data.tables.map((table) => ({ ...table })),
    assignments: data.assignments.map((assignment) => ({ ...assignment })),
    isAssigned: data.isAssigned,
  }
}

function docRef(eventId: string) {
  return doc(getFirestoreDb(), COLLECTION, eventId)
}

export async function getEvent(eventId: string): Promise<EventData | null> {
  if (!isValidEventId(eventId)) return null

  if (!isFirebaseConfigured()) {
    const data = memoryEvents.get(eventId)
    return data ? cloneEvent(data) : null
  }

  const snap = await getDoc(docRef(eventId))
  if (!snap.exists()) return null
  return cloneEvent(snap.data() as EventData)
}

export async function setEvent(eventId: string, data: EventData): Promise<void> {
  if (!isValidEventId(eventId)) return
  const payload = cloneEvent(data)

  if (!isFirebaseConfigured()) {
    memoryEvents.set(eventId, payload)
    return
  }

  await setDoc(docRef(eventId), payload)
}

export async function createEvent(): Promise<string> {
  const eventId = crypto.randomUUID()
  await setEvent(eventId, cloneEvent(DEFAULT_EVENT))
  return eventId
}

export function mergeEventUpdate(
  current: EventData,
  patch: Partial<EventData>,
): EventData {
  const updated = { ...current }

  if ("participants" in patch && patch.participants) {
    updated.participants = [
      ...new Set(
        patch.participants.map((p) => p.trim()).filter(Boolean),
      ),
    ]
    updated.assignments = []
    updated.isAssigned = false
  }

  if ("tables" in patch && patch.tables) {
    updated.tables = patch.tables
    updated.assignments = []
    updated.isAssigned = false
  }

  if ("isAssigned" in patch && patch.isAssigned === false) {
    updated.isAssigned = false
    updated.assignments = []
  }

  if ("assignments" in patch && patch.assignments) {
    updated.assignments = patch.assignments
  }

  if (patch.isAssigned === true) {
    updated.isAssigned = true
  }

  return updated
}
