import type { NextConfig } from "next"
import path from "path"

const nextConfig: NextConfig = {
  output: "standalone",
  turbopack: {
    root: path.resolve(__dirname),
  },
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "4000",
      },
      {
        protocol: "https",
        hostname: "api.ayurdarpan.com",
      },
    ],
    dangerouslyAllowLocalIP: process.env.NODE_ENV !== "production",
  },
}

export default nextConfig
