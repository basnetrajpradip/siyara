// Placeholder until a promos endpoint exists. Only lib/promo.ts may import this file.
// The mockup's countdown looped forever (a fake deadline); this one has a real end date.
import type { Promo } from "./types"

export const promos: Promo[] = [
  {
    id: "promo_festive-2026",
    title: "Festive Edit 2026",
    // Nepal time is UTC+05:45
    startsAt: "2026-10-01T00:00:00+05:45",
    endsAt: "2026-11-15T23:59:59+05:45",
    tiers: [
      { code: "SIYARA10", percentOff: 10, minOrderAmount: 3999 },
      { code: "SIYARA15", percentOff: 15, minOrderAmount: 6999 },
      { code: "SIYARA20", percentOff: 20, minOrderAmount: 9999 },
    ],
  },
]
