// Created once at module load: building an Intl formatter is slow, using one is fast.
// "en-IN" gives lakh grouping (1,00,000), which is what Nepal uses.
const rupees = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 })

/** formatRs(2450) → "Rs. 2,450" */
export function formatRs(amount: number) {
  return `Rs. ${rupees.format(amount)}`
}
