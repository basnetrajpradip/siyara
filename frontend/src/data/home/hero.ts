// Homepage hero copy. Never comes from the API.

export type HeroContent = {
  eyebrow: string
  /** rendered on two lines; the second is highlighted */
  title: [string, string]
  subtitle: string
  primaryCta: { label: string; href: string }
  secondaryCta: { label: string; href: string }
  image: { src: string; alt: string }
  floatingBadges: { title: string; subtitle: string }[]
  /** avatars next to the social-proof line */
  avatars: string[]
}

export type SocialProof = {
  rating: number
  /** pre-formatted so every place shows exactly the same text */
  customers: string
}

// The mockup claimed 12,000+ women, 2,300+ customers and 2,300+ reviews in different places.
// One number, used everywhere (hero, marquee, reviews heading). TODO: confirm the real figure.
export const socialProof: SocialProof = {
  rating: 4.9,
  customers: "12,000+",
}

export const hero: HeroContent = {
  eyebrow: "New Collection",
  title: ["Your Style,", "Your Story"],
  subtitle:
    "Discover timeless ethnic fashion that makes you feel beautiful: handpicked sarees, kurtis & lehengas, made for you with love.",
  primaryCta: { label: "Shop Now", href: "/products?collection=new-arrivals" },
  secondaryCta: { label: "Explore Categories", href: "/products" },
  image: { src: "/images/hero-model.jpg", alt: "Model wearing a blush pink Siyara saree" },
  floatingBadges: [
    { title: "Festive Edit 2026", subtitle: "Just launched" },
    { title: "Premium Fabric", subtitle: "Hand-finished" },
  ],
  avatars: [
    "/images/product-saree-pink.jpg",
    "/images/product-kurti-lavender.jpg",
    "/images/product-anarkali-peach.jpg",
  ],
}
