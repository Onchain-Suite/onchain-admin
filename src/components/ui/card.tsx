import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function Card({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border/60 bg-card text-card-foreground shadow-sm",
        className
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return <div className={cn("p-5 pb-0", className)}>{children}</div>;
}

export function CardTitle({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <h3 className={cn("text-sm font-semibold text-foreground", className)}>
      {children}
    </h3>
  );
}

export function CardContent({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return <div className={cn("p-5", className)}>{children}</div>;
}
