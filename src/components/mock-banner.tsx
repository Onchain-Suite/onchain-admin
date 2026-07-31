import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";

/** Shown whenever a page is serving sample data instead of live backend data. */
export function MockBanner({ endpoint, error }: { endpoint: string; error?: string }) {
  return (
    <div className="mb-6 flex items-start gap-2 rounded-xl border border-amber-500/30 bg-amber-500/5 p-3 text-sm text-amber-700 dark:text-amber-400">
      <ExclamationTriangleIcon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      <span>
        Showing sample data{error ? ` (backend unreachable: ${error})` : ""}. Set{" "}
        <code className="font-mono">ADMIN_MOCK=0</code> once{" "}
        <code className="font-mono">{endpoint}</code> is live.
      </span>
    </div>
  );
}
