import { Badge } from "@/components/ui/badge";
import type { HealthStatus, ReputationStatus } from "@/lib/types";

const HEALTH_TONE: Record<HealthStatus, "success" | "warning" | "danger"> = {
  operational: "success",
  degraded: "warning",
  down: "danger",
};

const REP_TONE: Record<ReputationStatus, "success" | "warning" | "danger"> = {
  healthy: "success",
  warning: "warning",
  critical: "danger",
};

export function HealthPill({ status }: { status: HealthStatus }) {
  return (
    <Badge tone={HEALTH_TONE[status]}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
      {status}
    </Badge>
  );
}

export function ReputationPill({ status }: { status: ReputationStatus }) {
  return (
    <Badge tone={REP_TONE[status]}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
      {status}
    </Badge>
  );
}
