"use client";

import { ShieldCheckIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { isActive, NAV, titleFor } from "@/components/nav";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";

export function AppShell({
  email,
  children,
}: {
  email: string;
  children: ReactNode;
}) {
  const pathname = usePathname() ?? "/";

  return (
    <div className="min-h-screen">
      {/* Sidebar (desktop) */}
      <aside className="fixed inset-y-0 left-0 hidden w-60 flex-col border-r border-border/60 bg-sidebar px-3 py-4 lg:flex">
        <Link href="/" className="mb-6 flex items-center gap-2.5 px-2">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <ShieldCheckIcon className="h-5 w-5" aria-hidden="true" />
          </span>
          <span className="text-sm font-semibold text-foreground">
            OnchainSuite
            <span className="block text-xs font-normal text-muted-foreground">
              Admin console
            </span>
          </span>
        </Link>
        <nav className="flex flex-1 flex-col gap-0.5">
          {NAV.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors",
                  active
                    ? "bg-primary/10 font-medium text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="px-2 pt-3 text-[11px] text-muted-foreground">
          Read-only · internal
        </div>
      </aside>

      {/* Content column */}
      <div className="lg:pl-60">
        {/* Topbar */}
        <header className="sticky top-0 z-10 border-b border-border/60 bg-background/80 backdrop-blur">
          <div className="flex items-center justify-between gap-4 px-4 py-3 md:px-8">
            <div className="min-w-0">
              <div className="text-sm font-semibold text-foreground">
                {titleFor(pathname)}
              </div>
              <div className="truncate text-xs text-muted-foreground">
                signed in as {email}
              </div>
            </div>
            <ThemeToggle />
          </div>
          {/* Mobile nav */}
          <nav className="flex gap-1 overflow-x-auto border-t border-border/60 px-4 py-2 lg:hidden">
            {NAV.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "whitespace-nowrap rounded-lg px-2.5 py-1.5 text-xs transition-colors",
                    active
                      ? "bg-primary/10 font-medium text-primary"
                      : "text-muted-foreground hover:bg-muted"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </header>

        <main className="px-4 py-8 md:px-8">{children}</main>
      </div>
    </div>
  );
}
