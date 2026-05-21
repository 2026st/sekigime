const UUID_V4_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export function isValidEventId(id: string): boolean {
  return UUID_V4_RE.test(id)
}

/** 参加者URL・主催者URL・生UUIDから eventId を抽出する */
export function parseEventIdFromUrl(input: string): string | null {
  const trimmed = input.trim()
  if (!trimmed) return null

  if (isValidEventId(trimmed)) return trimmed

  let pathname = trimmed
  let searchParams: URLSearchParams | null = null

  try {
    const url = new URL(trimmed, "https://placeholder.local")
    pathname = url.pathname
    searchParams = url.searchParams
  } catch {
    // 相対パスや生UUIDは下の処理へ
  }

  if (searchParams) {
    const fromQuery = searchParams.get("id")
    if (fromQuery && isValidEventId(fromQuery)) return fromQuery
  }

  const segment = pathname.replace(/\/+$/, "").split("/").filter(Boolean).pop()
  if (segment && isValidEventId(segment)) return segment

  return null
}
