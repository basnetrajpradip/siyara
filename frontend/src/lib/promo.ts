// The only file that knows where promos come from. Today: data.ts. Later: a promos service.
import { promos } from "@/data/promo/data"
import type { Promo } from "@/data/promo/types"

/** The promo running right now, or null when none is (so the section can hide itself). */
export async function getActivePromo(now = new Date()): Promise<Promo | null> {
  const time = now.getTime()
  return promos.find((p) => new Date(p.startsAt).getTime() <= time && time < new Date(p.endsAt).getTime()) ?? null
}
