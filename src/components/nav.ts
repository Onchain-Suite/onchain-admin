import {
  BuildingOffice2Icon,
  ChartBarIcon,
  ClipboardDocumentListIcon,
  CreditCardIcon,
  EnvelopeIcon,
  GlobeAltIcon,
  ServerStackIcon,
  Squares2X2Icon,
  UsersIcon,
} from "@heroicons/react/24/outline";
import type { ComponentType, SVGProps } from "react";

export interface NavItem {
  href: string;
  label: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
}

/** Sidebar sections — the PRD's information architecture (notes/prd.md §3). */
export const NAV: NavItem[] = [
  { href: "/", label: "Overview", icon: Squares2X2Icon },
  { href: "/status", label: "System status", icon: ServerStackIcon },
  { href: "/analytics", label: "Analytics", icon: ChartBarIcon },
  { href: "/orgs", label: "Organizations", icon: BuildingOffice2Icon },
  { href: "/users", label: "Users", icon: UsersIcon },
  { href: "/billing", label: "Billing", icon: CreditCardIcon },
  { href: "/deliverability", label: "Deliverability", icon: EnvelopeIcon },
  { href: "/visitors", label: "Visitors", icon: GlobeAltIcon },
  { href: "/audit", label: "Audit log", icon: ClipboardDocumentListIcon },
];

export function isActive(pathname: string, href: string): boolean {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export function titleFor(pathname: string): string {
  const match = [...NAV]
    .filter((n) => isActive(pathname, n.href))
    .sort((a, b) => b.href.length - a.href.length)[0];
  return match?.label ?? "Admin";
}
