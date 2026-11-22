import type { NextConfig } from "next";
import writeups from "./content/writeups/catalog.json";
const config: NextConfig = {
  async redirects() {
    return [
      {
        source: "/archive/wrup/index.html",
        destination: "/writeups",
        permanent: true,
      },
      ...writeups
        .filter((entry) => entry.archivePath)
        .map((entry) => ({
          source: entry.archivePath!,
          destination: `/writeups/${entry.slug}`,
          permanent: true,
        })),
      {
        source: "/legacy/ctf-portfolio",
        destination: "/archive/wrup/index.html",
        permanent: true,
      },
      {
        source: "/legacy/ctf-portfolio/:path*",
        destination: "/archive/:path*",
        permanent: true,
      },
      {
        source: "/wrup",
        destination: "/archive/wrup/index.html",
        permanent: true,
      },
      {
        source: "/wrup/:path*",
        destination: "/archive/wrup/:path*",
        permanent: true,
      },
      {
        source: "/writeups/index.html",
        destination: "/writeups",
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/studio/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" }],
      },
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
        ],
      },
    ];
  },
};
export default config;
