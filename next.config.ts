import type { NextConfig } from "next";
const config: NextConfig = {
  async redirects() {
    return [
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
        source: "/writeups",
        destination: "/archive/wrup/index.html",
        permanent: true,
      },
      {
        source: "/writeups/index.html",
        destination: "/archive/wrup/index.html",
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
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
