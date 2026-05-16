import { notFound } from "next/navigation"
import { isValidEventId } from "@/lib/kv"

export default async function EventLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ eventId: string }>
}) {
  const { eventId } = await params
  if (!isValidEventId(eventId)) {
    notFound()
  }
  return children
}
