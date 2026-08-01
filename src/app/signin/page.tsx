import {
  ExclamationTriangleIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";

import { signIn } from "@/auth";
import { type SearchParams } from "@/lib/filters";

export const metadata = { title: "Sign in · OnchainSuite Admin" };

const MESSAGES: Record<string, string> = {
  AccessDenied:
    "Your GitHub sign-in worked, but you're not recognized as a member of the OnchainSuite org. If you are a member, an org owner may need to approve this OAuth app (Org → Settings → Third-party access).",
  Configuration:
    "Sign-in is misconfigured on the server (check AUTH_SECRET and the GitHub OAuth env vars).",
  Verification: "That sign-in link has expired. Try again.",
};

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const code = typeof sp.error === "string" ? sp.error : "";
  const message = code ? (MESSAGES[code] ?? "Sign-in failed. Please try again.") : "";

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-2xl border border-border/60 bg-card p-8 text-center shadow-sm">
        <span className="mx-auto mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <ShieldCheckIcon className="h-6 w-6" aria-hidden="true" />
        </span>
        <h1 className="text-lg font-semibold text-foreground">
          OnchainSuite Admin
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Internal monitoring · members of the OnchainSuite GitHub org only.
        </p>

        {message ? (
          <div className="mt-4 flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-left text-xs text-destructive">
            <ExclamationTriangleIcon
              className="mt-0.5 h-4 w-4 shrink-0"
              aria-hidden="true"
            />
            <span>{message}</span>
          </div>
        ) : null}

        <form
          action={async () => {
            "use server";
            await signIn("github", { redirectTo: "/" });
          }}
          className="mt-6"
        >
          <button
            type="submit"
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
              <path d="M12 .5A11.5 11.5 0 0 0 .5 12a11.5 11.5 0 0 0 7.86 10.92c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.54-3.88-1.54-.53-1.34-1.3-1.7-1.3-1.7-1.05-.72.08-.7.08-.7 1.17.08 1.78 1.2 1.78 1.2 1.04 1.78 2.73 1.27 3.4.97.1-.75.4-1.27.73-1.56-2.56-.29-5.26-1.28-5.26-5.7 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.8 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.24 2.76.12 3.05.74.81 1.18 1.84 1.18 3.1 0 4.43-2.7 5.4-5.28 5.69.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 23.5 12 11.5 11.5 0 0 0 12 .5Z" />
            </svg>
            Sign in with GitHub
          </button>
        </form>
      </div>
    </div>
  );
}
