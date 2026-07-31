export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:px-8">
      <div className="mb-6 h-9 w-64 animate-pulse rounded-lg bg-muted/60" />
      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-20 animate-pulse rounded-xl bg-muted/50" />
        ))}
      </div>
      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-24 animate-pulse rounded-xl bg-muted/50" />
        ))}
      </div>
      <div className="h-72 animate-pulse rounded-xl bg-muted/50" />
    </div>
  );
}
