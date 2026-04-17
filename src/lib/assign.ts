import type { Assignment, Table } from "./types"

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function randomAssign(
  participants: string[],
  tables: Table[]
): Assignment[] {
  const totalCapacity = tables.reduce((sum, t) => sum + t.capacity, 0)
  if (participants.length === 0) throw new Error("参加者が登録されていません")
  if (tables.length === 0) throw new Error("テーブルが設定されていません")
  if (participants.length > totalCapacity) {
    throw new Error(
      `参加者数(${participants.length})がテーブルの合計定員(${totalCapacity})を超えています`
    )
  }

  const slots: number[] = tables.flatMap((t) =>
    Array.from({ length: t.capacity }, () => t.id)
  )

  const shuffledParticipants = shuffle(participants)
  const shuffledSlots = shuffle(slots)

  return shuffledParticipants.map((name, i) => ({
    name,
    tableId: shuffledSlots[i],
  }))
}
