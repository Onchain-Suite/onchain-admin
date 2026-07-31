"use server";

import { revalidatePath } from "next/cache";

import { backendActions, type ActionResult } from "@/lib/admin-actions";
import { getIdentity } from "@/lib/identity";

const DENIED: ActionResult = {
  ok: false,
  message: "Not permitted — SUPER_ADMIN required.",
};

/**
 * Every mutation re-checks the platform role server-side (never trust the UB
 * that hid the button) and refreshes the org page on success so read models
 * reflect the change.
 */
async function guarded(
  orgId: string,
  run: (actor: string) => Promise<ActionResult>
): Promise<ActionResult> {
  const id = await getIdentity();
  if (!id.superAdmin) return DENIED;
  const result = await run(id.email);
  if (result.ok) revalidatePath(`/orgs/${orgId}`);
  return result;
}

export async function resyncDomainAction(orgId: string, domain: string) {
  return guarded(orgId, (actor) => backendActions.syncDomain(orgId, domain, actor));
}

export async function creditWalletAction(
  orgId: string,
  amount: number,
  note: string
) {
  if (!Number.isFinite(amount) || amount === 0) {
    return { ok: false, message: "Enter a non-zero amount." };
  }
  return guarded(orgId, (actor) =>
    backendActions.creditWallet(orgId, amount, note, actor)
  );
}

export async function setPlanAction(
  orgId: string,
  plan: string,
  extendDays: number
) {
  return guarded(orgId, (actor) =>
    backendActions.setPlan(orgId, plan, extendDays, actor)
  );
}

export async function toggleOrgAction(orgId: string, enabled: boolean) {
  return guarded(orgId, (actor) =>
    backendActions.toggleOrg(orgId, enabled, actor)
  );
}

export async function resendInviteAction(orgId: string, email: string) {
  if (!email.includes("@")) {
    return { ok: false, message: "Enter a valid email." };
  }
  return guarded(orgId, (actor) =>
    backendActions.resendInvite(orgId, email, actor)
  );
}
