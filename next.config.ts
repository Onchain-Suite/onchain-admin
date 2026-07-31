import type { NextConfig } from "next";

/**
 * Internal admin console. Every response is marked non-indexable and framed
 * defensively — this app must never be discoverable or embeddable. The real
 * access gate is Cloudflare Access on the hostname (see README); these headers
 * are hardening, not the primary control.
 */
const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "no-referrer" },
        ],
      },
    ];
  },
};

export default nextConfig;
