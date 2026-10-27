// Footer link groups with real routes (the mockup pointed all of them at #home).
// The pages behind these are built on Day 7. Never comes from the API.

export type FooterLink = { label: string; href: string }
export type FooterLinkGroup = { title: string; links: FooterLink[] }

export const footerLinkGroups: FooterLinkGroup[] = [
  {
    title: "Quick Links",
    links: [
      { label: "About Us", href: "/about" },
      { label: "Size Guide", href: "/size-guide" },
      { label: "Shipping Policy", href: "/shipping" },
      { label: "Returns & Exchange", href: "/returns" },
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms & Conditions", href: "/terms" },
    ],
  },
  {
    // the mockup also listed "Returns" here: same page as "Returns & Exchange", so it's dropped
    title: "Customer Care",
    links: [
      { label: "Track Order", href: "/track-order" },
      { label: "FAQ", href: "/faq" },
      { label: "Contact Us", href: "/contact" },
      { label: "New Arrivals", href: "/products?collection=new-arrivals" },
      { label: "Sale", href: "/products?collection=sale" },
    ],
  },
]
