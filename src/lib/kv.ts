import { randomUUID } from "crypto"
import {
  cert,
  getApps,
  initializeApp,
  type ServiceAccount,
} from "firebase-admin/app"
import { getFirestore } from "firebase-admin/firestore"
import type { EventData } from "./types"
import { DEFAULT_EVENT } from "./types"

const UUID_V4_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

const COLLECTION = "events"

/** Base64(JSON) のサービスアカウントキー（Cloudflare / ローカル .dev.vars に設定） */
const serviceAccountB64 = process.env.FIREBASE_SERVICE_ACCOUNT_JSON_B64

const hasFirestoreEnv = Boolean(serviceAccountB64)

const memoryEvents = new Map<string, EventData>()

function getFirebaseApp() {
  const existing = getApps()[0]
  if (existing) return existing

  if (!serviceAccountB64) {
    throw new Error("FIREBASE_SERVICE_ACCOUNT_JSON_B64 is not set")
  }
  const json = Buffer.from(serviceAccountB64, "base64").toString("utf8")
  const parsed = JSON.parse(json) as {
    project_id?: string
    client_email?: string
    private_key?: string
  }
  if (!parsed.project_id || !parsed.client_email || !parsed.private_key) {
    throw new Error(
      "Invalid service account JSON: need project_id, client_email, private_key",
    )
  }
  const credentials: ServiceAccount = {
    projectId: parsed.project_id,
    clientEmail: parsed.client_email,
    privateKey: parsed.private_key,
  }

  return initializeApp({
    credential: cert(credentials),
  })
}

function eventDocRef(eventId: string) {
  return getFirestore(getFirebaseApp()).collection(COLLECTION).doc(eventId)
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

  if (!hasFirestoreEnv) {
    const data = memoryEvents.get(eventId)
    return data ? cloneEvent(data) : null
  }

  const snap = await eventDocRef(eventId).get()
  if (!snap.exists) return null
  const d = snap.data() as EventData | undefined
  if (!d) return null
  return cloneEvent(d)
}

export async function setEvent(eventId: string, data: EventData): Promise<void> {
  if (!isValidEventId(eventId)) return

  if (!hasFirestoreEnv) {
    memoryEvents.set(eventId, cloneEvent(data))
    return
  }

  await eventDocRef(eventId).set({
    participants: data.participants,
    tables: data.tables,
    assignments: data.assignments,
    isAssigned: data.isAssigned,
  })
}

export async function createEvent(): Promise<string> {
  const eventId = randomUUID()
  await setEvent(eventId, cloneEvent(DEFAULT_EVENT))
  return eventId
}
