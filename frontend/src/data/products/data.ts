// Placeholder until the products endpoint is wired up. Only lib/products.ts may import this file.
// The 8 products from siyara-main, reshaped to the API's Product type.
import { categories } from "@/data/categories/data"
import type { Product, ProductVariant } from "./types"

type Swatch = { color: string; hex: string }

const BLOUSE_SIZES = ["32", "34", "36", "38", "40"]
const KURTI_SIZES = ["XS", "S", "M", "L", "XL", "XXL"]
const LEHENGA_SIZES = ["S", "M", "L", "XL"]
const ONE_SIZE = [null]

type Seed = {
  slug: string
  name: string
  categorySlug: string
  shortDescription: string
  price: number
  discountAmount?: number
  image: string
  alt: string
  badge?: Product["badge"]
  avgRating: number
  reviewCount: number
  fabric: string
  sizes: (string | null)[]
  swatches: Swatch[]
  createdAt: string
}

function variantsFor(seed: Seed): ProductVariant[] {
  return seed.swatches.flatMap((swatch, i) =>
    seed.sizes.map((size, j) => {
      const sku = [seed.slug, swatch.color, size].filter(Boolean).join("-").toUpperCase().replace(/\s+/g, "-")
      return {
        id: `var_${sku.toLowerCase()}`,
        size,
        color: swatch.color,
        colorHex: swatch.hex,
        sku,
        // deterministic fake stock, with one sold-out combination per product to test the UI
        stock: i === 0 && j === 0 ? 0 : 3 + ((i + j) % 5),
      }
    }),
  )
}

function toProduct(seed: Seed): Product {
  const category = categories.find((c) => c.slug === seed.categorySlug)
  if (!category) throw new Error(`Unknown category "${seed.categorySlug}" for ${seed.slug}`)

  const variants = variantsFor(seed)
  const discountAmount = seed.discountAmount ?? null

  return {
    id: `prod_${seed.slug}`,
    name: seed.name,
    slug: seed.slug,
    shortDescription: seed.shortDescription,
    description: null,
    sku: seed.slug.toUpperCase(),
    price: seed.price,
    discountAmount,
    discountedPrice: discountAmount === null ? null : seed.price - discountAmount,
    stock: variants.reduce((sum, v) => sum + v.stock, 0),
    featured: seed.badge === "bestseller",
    isActive: true,
    categoryId: category.id,
    category,
    media: [
      {
        id: `pm_${seed.slug}`,
        sortOrder: 0,
        isPrimary: true,
        media: { id: `media_${seed.slug}`, url: seed.image, alt: seed.alt, type: "IMAGE" },
      },
    ],
    createdAt: seed.createdAt,
    updatedAt: seed.createdAt,
    variants,
    badge: seed.badge ?? null,
    avgRating: seed.avgRating,
    reviewCount: seed.reviewCount,
    fabric: seed.fabric,
    careInstructions: "Dry clean recommended.",
  }
}

const seeds: Seed[] = [
  {
    slug: "soft-organza-saree",
    name: "Soft Organza Saree with Sequin Border",
    categorySlug: "sarees",
    shortDescription: "Featherlight blush organza with a shimmering sequin border and matching blouse piece.",
    price: 3200,
    discountAmount: 750,
    image: "/images/product-saree-pink.jpg",
    alt: "Blush pink Siyara organza saree with sequin border",
    badge: "new",
    avgRating: 4.8,
    reviewCount: 214,
    fabric: "Organza",
    sizes: BLOUSE_SIZES,
    swatches: [
      { color: "Blush", hex: "#f4c7d3" },
      { color: "Gold", hex: "#c9a24b" },
      { color: "Wine", hex: "#8f1c45" },
    ],
    createdAt: "2026-10-12T10:00:00.000Z",
  },
  {
    slug: "lavender-floral-kurti",
    name: "Lavender Floral Straight-Cut Kurti",
    categorySlug: "kurtis",
    shortDescription: "A breathable straight-cut kurti with soft floral prints for office and everyday wear.",
    price: 1650,
    image: "/images/product-kurti-lavender.jpg",
    alt: "Lavender floral straight-cut kurti by Siyara",
    badge: "bestseller",
    avgRating: 4.9,
    reviewCount: 186,
    fabric: "Cotton",
    sizes: KURTI_SIZES,
    swatches: [
      { color: "Lavender", hex: "#c3b2e0" },
      { color: "Rose", hex: "#fae6eb" },
      { color: "White", hex: "#ffffff" },
    ],
    createdAt: "2026-09-02T10:00:00.000Z",
  },
  {
    slug: "rose-designer-lehenga",
    name: "Rose Designer Lehenga Choli Set",
    categorySlug: "lehengas",
    shortDescription: "A rose lehenga with an embroidered choli and a sheer dupatta, made for parties and receptions.",
    price: 7499,
    discountAmount: 1549,
    image: "/images/product-lehenga-rose.jpg",
    alt: "Rose pink designer lehenga choli set by Siyara",
    avgRating: 4.7,
    reviewCount: 98,
    fabric: "Georgette",
    sizes: LEHENGA_SIZES,
    swatches: [
      { color: "Rose", hex: "#eba3b6" },
      { color: "Ivory", hex: "#fbf3ec" },
      { color: "Gold", hex: "#c9a24b" },
    ],
    createdAt: "2026-09-20T10:00:00.000Z",
  },
  {
    slug: "traditional-gold-jhumka",
    name: "Traditional Gold-Plated Jhumka",
    categorySlug: "accessories",
    shortDescription: "Classic gold-plated jhumkas with a pearl drop, light enough to wear all day.",
    price: 990,
    discountAmount: 240,
    image: "/images/product-jhumka.jpg",
    alt: "Traditional gold-plated jhumka earrings by Siyara",
    avgRating: 4.9,
    reviewCount: 342,
    fabric: "Gold-plated brass",
    sizes: ONE_SIZE,
    swatches: [
      { color: "Gold", hex: "#dcb968" },
      { color: "Ruby", hex: "#c93a68" },
      { color: "Maroon", hex: "#701636" },
    ],
    createdAt: "2026-08-15T10:00:00.000Z",
  },
  {
    slug: "sky-embroidered-kurti",
    name: "Sky Blue Embroidered Everyday Kurti",
    categorySlug: "kurtis",
    shortDescription: "Sky blue kurti with fine thread embroidery on the yoke, soft enough for daily wear.",
    price: 2200,
    discountAmount: 350,
    image: "/images/product-kurti-sky.jpg",
    alt: "Sky blue embroidered kurti by Siyara",
    badge: "new",
    avgRating: 4.6,
    reviewCount: 129,
    fabric: "Rayon",
    sizes: KURTI_SIZES,
    swatches: [
      { color: "Sky", hex: "#bfd9e8" },
      { color: "White", hex: "#ffffff" },
      { color: "Mauve", hex: "#6b565d" },
    ],
    createdAt: "2026-10-08T10:00:00.000Z",
  },
  {
    slug: "maroon-banarasi-saree",
    name: "Maroon Banarasi Silk Saree with Zari",
    categorySlug: "sarees",
    shortDescription: "Rich maroon Banarasi silk woven with gold zari motifs, an heirloom for festive days.",
    price: 5499,
    discountAmount: 1200,
    image: "/images/product-saree-maroon.jpg",
    alt: "Maroon Banarasi silk saree with gold zari by Siyara",
    avgRating: 4.8,
    reviewCount: 167,
    fabric: "Banarasi silk",
    sizes: BLOUSE_SIZES,
    swatches: [
      { color: "Maroon", hex: "#701636" },
      { color: "Gold", hex: "#c9a24b" },
      { color: "Black", hex: "#291c21" },
    ],
    createdAt: "2026-09-10T10:00:00.000Z",
  },
  {
    slug: "peach-pearl-anarkali",
    name: "Peach Pearl Floor-Length Anarkali",
    categorySlug: "kurtis",
    shortDescription: "A floor-length peach anarkali with pearl detailing and a flowing flare.",
    price: 3899,
    image: "/images/product-anarkali-peach.jpg",
    alt: "Peach floor-length anarkali with pearl detailing by Siyara",
    badge: "new",
    avgRating: 4.7,
    reviewCount: 84,
    fabric: "Georgette",
    sizes: KURTI_SIZES,
    swatches: [
      { color: "Peach", hex: "#f5c9a8" },
      { color: "Gold", hex: "#c9a24b" },
      { color: "Rose", hex: "#fae6eb" },
    ],
    createdAt: "2026-10-15T10:00:00.000Z",
  },
  {
    slug: "royal-bridal-lehenga",
    name: "Royal Red Bridal Lehenga",
    categorySlug: "lehengas",
    shortDescription: "A hand-finished red bridal lehenga with heavy zari and stone work.",
    price: 15999,
    discountAmount: 3000,
    image: "/images/product-lehenga-red.jpg",
    alt: "Royal red bridal lehenga with zari work by Siyara",
    badge: "limited",
    avgRating: 5.0,
    reviewCount: 61,
    fabric: "Velvet",
    sizes: LEHENGA_SIZES,
    swatches: [
      { color: "Wine", hex: "#8f1c45" },
      { color: "Gold", hex: "#dcb968" },
      { color: "Black", hex: "#291c21" },
    ],
    createdAt: "2026-07-28T10:00:00.000Z",
  },
]

export const products: Product[] = seeds.map(toProduct)
