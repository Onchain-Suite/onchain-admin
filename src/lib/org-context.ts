import { cookies } from "next/headers";

import { type SearchParams } from "@/lib/filters";

export const ORG_COOKIE = "admin_org";

/**
 * The active org id for the org-scoped pages: the URL `?org=` wins (shareable),
 * otherwise the `admin_org` cookie set by OrgField — so entering an org once
 * carries it across the nav.
 */
export async function getOrgId(sp: SearchParams): Promise<string> {
  const fromUrl = typeof sp.org === "string" ? sp.org.trim() : "";
  if (fromUrl) return fromUrl;
  const fromCookie = (await cookies()).get(ORG_COOKIE)?.value;
  return fromCookie ? fromCookie.trim() : "";
}
