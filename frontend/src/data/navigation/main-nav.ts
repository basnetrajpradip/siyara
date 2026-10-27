// One source for the desktop dropdowns AND the mobile menu (the mockup kept two copies,
// NAV and MENU_LINKS, which had already drifted apart). Never comes from the API.
// Child slugs match the child categories in data/categories/data.ts.

export type NavChild = { label: string; href: string }

export type NavItem = {
  label: string
  href: string
  /** shows the "Hot" pill and brand color (Sale) */
  highlight?: boolean
  children?: NavChild[]
}

const category = (slug: string) => `/products?category=${slug}`

export const mainNav: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "New Arrivals", href: "/products?collection=new-arrivals" },
  {
    label: "Sarees",
    href: category("sarees"),
    children: [
      { label: "Silk Sarees", href: category("silk-sarees") },
      { label: "Organza Sarees", href: category("organza-sarees") },
      { label: "Cotton Sarees", href: category("cotton-sarees") },
      { label: "Banarasi Sarees", href: category("banarasi-sarees") },
      { label: "Party Wear", href: category("party-wear-sarees") },
    ],
  },
  {
    label: "Kurtis",
    href: category("kurtis"),
    children: [
      { label: "Straight Kurtis", href: category("straight-kurtis") },
      { label: "Anarkali", href: category("anarkali-kurtis") },
      { label: "Floral Prints", href: category("floral-kurtis") },
      { label: "Embroidered", href: category("embroidered-kurtis") },
      { label: "Plus Size", href: category("plus-size-kurtis") },
    ],
  },
  {
    label: "Lehengas",
    href: category("lehengas"),
    children: [
      { label: "Bridal Lehengas", href: category("bridal-lehengas") },
      { label: "Party Lehengas", href: category("party-lehengas") },
      { label: "Festive Sets", href: category("festive-sets") },
      { label: "Sharara Sets", href: category("sharara-sets") },
    ],
  },
  {
    label: "Accessories",
    href: category("accessories"),
    children: [
      { label: "Jhumkas", href: category("jhumkas") },
      { label: "Bangles", href: category("bangles") },
      { label: "Dupattas", href: category("dupattas") },
      { label: "Clutches", href: category("clutches") },
      { label: "Hair Accessories", href: category("hair-accessories") },
    ],
  },
  { label: "Sale", href: "/products?collection=sale", highlight: true },
]
