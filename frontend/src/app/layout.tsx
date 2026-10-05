import type { Metadata } from "next"
import { Playfair_Display, Jost, Pinyon_Script } from "next/font/google"
import { Toaster } from "sonner"
import "./globals.css"
import AuthProvider from "@/components/providers/AuthProvider"

export const metadata: Metadata = {
  title: "Siyara",
  description: "",
}

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-playfair",
  display: "swap",
})

const jost = Jost({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
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
