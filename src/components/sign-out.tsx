import { ArrowRightStartOnRectangleIcon } from "@heroicons/react/24/outline";

import { signOut } from "@/auth";

/** Server-action sign-out button, rendered into the topbar by the layout. */
export function SignOut() {
  return (
    <form
      action={async () => {
        "use server";
        await signOut({ redirectTo: "/signin" });
      }}
    >
      <button
        type="submit"
        aria-label="Sign out"
        title="Sign out"
        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border/60 bg-card text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowRightStartOnRectangleIcon className="h-4 w-4" aria-hidden="true" />
      </button>
    </form>
  );
}
