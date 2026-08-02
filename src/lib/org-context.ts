import { cookies } from "next/headers";

import { type SearchParams } from "@/lib/filters";
import { getOrganizations } from "@/lib/org-api";

export const ORG_COOKIE = "admin_org";

/**
 * Org options for the picker — only when GET /admin/organizations is live.
 * Empty while it 404s (mock), so the picker shows the manual id field instead
 * of a dropdown of sample orgs.
 */
export async function getOrgOptions(): Promise<{ id: string; name: string }[]> {
  const { data, isMock } = await getOrganizations();
  if (isMock) return [];
  return data.map((o) => ({ id: o.id, name: o.name }));
}

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
