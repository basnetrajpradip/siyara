import type { Metadata } from "next"
import { Playfair_Display, Jost, Pinyon_Script } from "next/font/google"
import { Toaster } from "sonner"
import "./globals.css"
import AuthProvider from "@/components/providers/AuthProvider"
import { FREE_SHIPPING_THRESHOLD, SITE } from "@/lib/config"
import { formatRs } from "@/lib/format"

export const metadata: Metadata = {
  title: {
    default: `${SITE.name} | ${SITE.tagline} | Women's Ethnic Wear in Nepal`,
    // Pages that export their own `title` (e.g. a product page) become "Royal Red Bridal Lehenga | Siyara"
    template: `%s | ${SITE.name}`,
  },
  description: `${SITE.description} Free delivery above ${formatRs(FREE_SHIPPING_THRESHOLD)}.`,
}

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-playfair",
  display: "swap",
})

const jost = Jost({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-jost",
  display: "swap",
})

const pinyon = Pinyon_Script({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-pinyon",
  display: "swap",
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${playfair.variable} ${jost.variable} ${pinyon.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <AuthProvider>
          <Toaster richColors position="bottom-right" />
          <nav></nav>
          <div className="flex-1 flex flex-col">{children}</div>
          <footer></footer>
        </AuthProvider>
      </body>
    </html>
  )
}
