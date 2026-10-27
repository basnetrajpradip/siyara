// Placeholder until GET /api/category exists. Only lib/categories.ts may import this file.
// "New Arrivals" and "Sale" from the mockup are collections, not categories, so they're not here.
import type { Category } from "./types"

const topLevel: Category[] = [
  {
    id: "cat_sarees",
    name: "Sarees",
    slug: "sarees",
    parentId: null,
    image: "/images/product-saree-pink.jpg",
    description: "Silk, organza & cotton",
  },
  {
    id: "cat_kurtis",
    name: "Kurtis",
    slug: "kurtis",
    parentId: null,
    image: "/images/product-kurti-lavender.jpg",
    description: "Daily & festive wear",
  },
  {
    id: "cat_lehengas",
    name: "Lehengas",
    slug: "lehengas",
    parentId: null,
    image: "/images/product-lehenga-rose.jpg",
    description: "Bridal & party",
  },
  {
    id: "cat_accessories",
    name: "Accessories",
    slug: "accessories",
    parentId: null,
    image: "/images/product-jhumka.jpg",
    description: "Jewellery & more",
  },
]

function children(parentId: string, names: string[]): Category[] {
  return names.map((name) => {
    const slug = name.toLowerCase().replace(/\s+/g, "-")
    return { id: `cat_${slug}`, name, slug, parentId }
  })
}

export const categories: Category[] = [
  ...topLevel,
  ...children("cat_sarees", ["Silk Sarees", "Organza Sarees", "Cotton Sarees", "Banarasi Sarees", "Party Wear Sarees"]),
  ...children("cat_kurtis", [
    "Straight Kurtis",
    "Anarkali Kurtis",
    "Floral Kurtis",
    "Embroidered Kurtis",
    "Plus Size Kurtis",
  ]),
  ...children("cat_lehengas", ["Bridal Lehengas", "Party Lehengas", "Festive Sets", "Sharara Sets"]),
  ...children("cat_accessories", ["Jhumkas", "Bangles", "Dupattas", "Clutches", "Hair Accessories"]),
]
