// No coupons/promos module in the backend yet (backend wish list). This is the shape the
// frontend expects; share it with the backend teammate as the contract.

export type PromoTier = {
  /** what the customer types at checkout, e.g. "SIYARA10" */
  code: string
  /** 10 means 10% off */
  percentOff: number
  /** order subtotal (Rs.) needed to use this code */
  minOrderAmount: number
}

export type Promo = {
  id: string
  title: string
  /** ISO 8601. The countdown runs to this moment; after it the promo is hidden. */
  startsAt: string
  endsAt: string
  /** sorted by minOrderAmount, smallest first */
  tiers: PromoTier[]
}
