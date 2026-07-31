import { NextResponse } from "next/server";

import { auth } from "@/auth";

const devBypass = () =>
  process.env.NODE_ENV !== "production" &&
  process.env.ADMIN_DEV_BYPASS_AUTH === "1";

/**
 * Gate: every request needs a valid GitHub session (org-restricted at sign-in).
 * Unauthenticated requests are redirected to /signin. In dev, ADMIN_DEV_BYPASS_AUTH
 * lets you through without OAuth. The matcher excludes /signin and the Auth.js
 * routes so sign-in itself stays reachable.
 */
export default auth((req) => {
  if (devBypass()) return NextResponse.next();
  if (!req.auth) {
    return NextResponse.redirect(new URL("/signin", req.nextUrl.origin));
  }
  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|signin|api/auth).*)"],
};
