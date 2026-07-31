import { NextResponse, type NextRequest } from "next/server";

import {
  ACCESS_JWT_HEADER,
  devBypassIdentity,
  isAllowed,
  verifyAccessJwt,
} from "@/lib/access";

/**
 * Every request passes two gates:
 *   1. Cloudflare Access (network, on the hostname) — enforced before this runs.
 *   2. This middleware — re-verifies the Access JWT and applies the in-app
 *      allowlist, so a misconfigured or bypassed edge policy still can't reach
 *      the console.
 * In dev there is no Access in front of localhost, so ADMIN_DEV_BYPASS_AUTH
 * lets you through (non-production only).
 */
export async function middleware(req: NextRequest) {
  const identity =
    devBypassIdentity() ??
    (await verifyAccessJwt(req.headers.get(ACCESS_JWT_HEADER)));

  if (!identity || !isAllowed(identity.email)) {
    return new NextResponse("Forbidden", {
      status: 403,
      headers: { "content-type": "text/plain" },
    });
  }

  // Pass the verified identity downstream so server components can show it and
  // attribute audit lines without re-verifying.
  const res = NextResponse.next();
  res.headers.set("x-admin-email", identity.email);
  return res;
}

export const config = {
  // Guard everything except Next internals and static assets.
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
