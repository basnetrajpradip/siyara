// Temporary Day 1 check: data flows page → lib getter → data.ts, never page → data.ts.
// Replaced by the real homepage sections on Day 4.
import { formatRs } from "@/lib/format"
import { getProducts } from "@/lib/products"

export default async function Page() {
  const products = await getProducts()
  const [first] = products

  return (
    <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
      <p className="eyebrow">Day 1 foundation</p>
      <h1 className="mt-2">Siyara</h1>
      <p className="mt-4 text-body-lg text-text-secondary">
        {products.length} products loaded. First: <strong>{first?.name}</strong> at{" "}
        {formatRs(first?.discountedPrice ?? first?.price ?? 0)}. Sample price: {formatRs(2450)}.
      </p>
    </main>
  )
}
