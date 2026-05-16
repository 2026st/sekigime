"use client"

import { use } from "react"
import { ParticipantSeatView } from "@/components/ParticipantSeatView"

export default function ParticipantPage({
  params,
}: {
  params: Promise<{ eventId: string }>
}) {
  const { eventId } = use(params)
  return <ParticipantSeatView eventId={eventId} />
}
