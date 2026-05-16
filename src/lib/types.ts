export type Table = { id: number; capacity: number }
export type Assignment = { name: string; tableId: number }

export type EventData = {
  participants: string[]
  tables: Table[]
  assignments: Assignment[]
  isAssigned: boolean
}

export const DEFAULT_EVENT: EventData = {
  participants: [],
  tables: [],
  assignments: [],
  isAssigned: false,
}

export type EventWithId = EventData & { id: string }
