import type { Assignment, EventData, Table } from "./types"

type ServiceAccount = {
  project_id: string
  client_email: string
  private_key: string
}

let cachedToken: { token: string; expiresAt: number } | null = null
let cachedAccount: ServiceAccount | null = null

function parseServiceAccount(b64: string): ServiceAccount {
  const json = Buffer.from(b64, "base64").toString("utf8")
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
  return {
    project_id: parsed.project_id,
    client_email: parsed.client_email,
    private_key: parsed.private_key.replace(/\\n/g, "\n"),
  }
}

function getServiceAccount(): ServiceAccount {
  const b64 = process.env.FIREBASE_SERVICE_ACCOUNT_JSON_B64
  if (!b64) throw new Error("FIREBASE_SERVICE_ACCOUNT_JSON_B64 is not set")
  if (!cachedAccount) cachedAccount = parseServiceAccount(b64)
  return cachedAccount
}

function base64UrlEncode(data: ArrayBuffer | string): string {
  const bytes =
    typeof data === "string"
      ? new TextEncoder().encode(data)
      : new Uint8Array(data)
  let binary = ""
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")
}

function pemToPkcs8(pem: string): ArrayBuffer {
  const b64 = pem
    .replace(/-----BEGIN PRIVATE KEY-----/g, "")
    .replace(/-----END PRIVATE KEY-----/g, "")
    .replace(/\s/g, "")
  const binary = atob(b64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return bytes.buffer
}

async function signJwt(
  account: ServiceAccount,
  now: number,
): Promise<string> {
  const header = base64UrlEncode(JSON.stringify({ alg: "RS256", typ: "JWT" }))
  const payload = base64UrlEncode(
    JSON.stringify({
      iss: account.client_email,
      scope: "https://www.googleapis.com/auth/datastore",
      aud: "https://oauth2.googleapis.com/token",
      iat: now,
      exp: now + 3600,
    }),
  )
  const unsigned = `${header}.${payload}`
  const key = await crypto.subtle.importKey(
    "pkcs8",
    pemToPkcs8(account.private_key),
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"],
  )
  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    key,
    new TextEncoder().encode(unsigned),
  )
  return `${unsigned}.${base64UrlEncode(signature)}`
}

async function getAccessToken(): Promise<string> {
  const now = Math.floor(Date.now() / 1000)
  if (cachedToken && cachedToken.expiresAt > now + 60) {
    return cachedToken.token
  }

  const account = getServiceAccount()
  const assertion = await signJwt(account, now)
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }),
  })
  const data = (await res.json()) as {
    access_token?: string
    expires_in?: number
    error?: string
  }
  if (!res.ok || !data.access_token) {
    throw new Error(data.error ?? "Failed to obtain Google access token")
  }
  cachedToken = {
    token: data.access_token,
    expiresAt: now + (data.expires_in ?? 3600),
  }
  return data.access_token
}

function docPath(eventId: string): string {
  const projectId = getServiceAccount().project_id
  return `projects/${projectId}/databases/(default)/documents/events/${eventId}`
}

function stringField(value: string) {
  return { stringValue: value }
}

function boolField(value: boolean) {
  return { booleanValue: value }
}

function intField(value: number) {
  return { integerValue: String(value) }
}

function eventToFields(data: EventData) {
  return {
    participants: {
      arrayValue: {
        values: data.participants.map((name) => stringField(name)),
      },
    },
    tables: {
      arrayValue: {
        values: data.tables.map((table: Table) => ({
          mapValue: {
            fields: {
              id: intField(table.id),
              capacity: intField(table.capacity),
            },
          },
        })),
      },
    },
    assignments: {
      arrayValue: {
        values: data.assignments.map((a: Assignment) => ({
          mapValue: {
            fields: {
              name: stringField(a.name),
              tableId: intField(a.tableId),
            },
          },
        })),
      },
    },
    isAssigned: boolField(data.isAssigned),
  }
}

function readString(field: { stringValue?: string } | undefined): string {
  return field?.stringValue ?? ""
}

function readInt(field: { integerValue?: string } | undefined): number {
  return Number(field?.integerValue ?? 0)
}

function readBool(field: { booleanValue?: boolean } | undefined): boolean {
  return Boolean(field?.booleanValue)
}

function fieldsToEvent(
  fields: Record<string, unknown> | undefined,
): EventData | null {
  if (!fields) return null
  const f = fields as Record<
    string,
    {
      arrayValue?: {
        values?: Array<{
          stringValue?: string
          mapValue?: { fields?: Record<string, unknown> }
        }>
      }
      booleanValue?: boolean
    }
  >

  const participants =
    f.participants?.arrayValue?.values?.map((v) => readString(v)) ?? []
  const tables =
    f.tables?.arrayValue?.values?.map((v) => {
      const tf = v.mapValue?.fields as
        | Record<string, { integerValue?: string }>
        | undefined
      return {
        id: readInt(tf?.id),
        capacity: readInt(tf?.capacity),
      }
    }) ?? []
  const assignments =
    f.assignments?.arrayValue?.values?.map((v) => {
      const af = v.mapValue?.fields as
        | Record<string, { stringValue?: string; integerValue?: string }>
        | undefined
      return {
        name: readString(af?.name),
        tableId: readInt(af?.tableId),
      }
    }) ?? []

  return {
    participants,
    tables,
    assignments,
    isAssigned: readBool(f.isAssigned as { booleanValue?: boolean }),
  }
}

export async function firestoreGetEvent(
  eventId: string,
): Promise<EventData | null> {
  const token = await getAccessToken()
  const url = `https://firestore.googleapis.com/v1/${docPath(eventId)}`
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (res.status === 404) return null
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Firestore get failed (${res.status}): ${err}`)
  }
  const doc = (await res.json()) as { fields?: Record<string, unknown> }
  return fieldsToEvent(doc.fields)
}

export async function firestoreSetEvent(
  eventId: string,
  data: EventData,
): Promise<void> {
  const token = await getAccessToken()
  const mask = ["participants", "tables", "assignments", "isAssigned"]
    .map((f) => `updateMask.fieldPaths=${f}`)
    .join("&")
  const url = `https://firestore.googleapis.com/v1/${docPath(eventId)}?${mask}`
  const res = await fetch(url, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ fields: eventToFields(data) }),
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Firestore set failed (${res.status}): ${err}`)
  }
}
