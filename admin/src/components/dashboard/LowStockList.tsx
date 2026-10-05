import { Link } from "react-router"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { formatPrice } from "@/lib/utils"
import type { LowStockProduct } from "@/types/dashboard"

interface LowStockListProps {
  products: LowStockProduct[]
}

export function LowStockList({ products }: LowStockListProps) {
  return (
    <Card className="flex min-w-0 flex-col md:col-span-1 xl:col-span-4">
      <CardHeader>
        <CardTitle>Low Stock Products</CardTitle>
        <CardDescription>Products that need restocking</CardDescription>
      </CardHeader>
      <CardContent>
        {products.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            All products are sufficiently stocked
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {products.map((product) => (
              <li key={product.id} className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
                <div className="min-w-0 flex-1">
                  <Link
                    to={`/products/${product.id}/edit`}
                    className="block truncate font-syne text-sm font-medium text-primary-900 hover:text-primary-600"
                  >
                    {product.name}
                  </Link>
                  <p className="text-xs text-muted-foreground">{formatPrice(product.price)}</p>
                </div>
                {product.stock === 0 ? (
                  <Badge variant="error">Out of stock</Badge>
                ) : (
                  <Badge variant="warning">{product.stock} left</Badge>
                )}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
