"use client";

import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  LockClosedIcon,
} from "@heroicons/react/24/outline";
import { type ReactNode, useState, useTransition } from "react";

import {
  creditWalletAction,
  resendInviteAction,
  resyncDomainAction,
  setPlanAction,
  toggleOrgAction,
} from "@/app/actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ActionResult } from "@/lib/admin-actions";

const PLANS = ["PAYG", "Starter", "Growth", "Scale"];
const inputCls =
  "h-9 rounded-lg border border-border/60 bg-background px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary/50";
const btnCls =
  "h-9 shrink-0 rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50";

function Row({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2 border-b border-border/40 py-3 last:border-0 sm:flex-row sm:items-center sm:justify-between">
      <span className="text-sm font-medium text-foreground">{label}</span>
      <div className="flex flex-wrap items-center gap-2">{children}</div>
    </div>
  );
}

export function OrgActions({
  orgId,
  domains,
  enabled = true,
}: {
  orgId: string;
  domains: string[];
  enabled?: boolean;
}) {
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<ActionResult | null>(null);

  const [domain, setDomain] = useState(domains[0] ?? "");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [plan, setPlan] = useState(PLANS[0]);
  const [extendDays, setExtendDays] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");

  const run = (fn: () => Promise<ActionResult>) => {
    setMsg(null);
    start(async () => setMsg(await fn()));
  };

  return (
    <Card className="border-primary/30">
      <CardHeader className="flex items-center justify-between gap-2">
        <CardTitle>Admin actions</CardTitle>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
          <LockClosedIcon className="h-3.5 w-3.5" aria-hidden="true" />
          SUPER_ADMIN · audited
        </span>
      </CardHeader>
      <CardContent className="pt-1">
        <Row label="Re-sync domain">
          <select
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            className={inputCls}
            aria-label="Domain to re-sync"
          >
            {domains.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
          <button
            type="button"
            disabled={pending || !domain}
            onClick={() => run(() => resyncDomainAction(orgId, domain))}
            className={btnCls}
          >
            Re-sync
          </button>
        </Row>

        <Row label="Grant PAYG credit">
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="$ amount"
            aria-label="Credit amount"
            className={`${inputCls} w-28`}
          />
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="note"
            aria-label="Credit note"
            className={`${inputCls} w-36`}
          />
          <button
            type="button"
            disabled={pending || !amount}
            onClick={() => run(() => creditWalletAction(orgId, Number(amount), note))}
            className={btnCls}
          >
            Credit
          </button>
        </Row>

        <Row label="Set plan / extend">
          <select
            value={plan}
            onChange={(e) => setPlan(e.target.value)}
            className={inputCls}
            aria-label="Plan"
          >
            {PLANS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
          <input
            type="number"
            value={extendDays}
            onChange={(e) => setExtendDays(e.target.value)}
            placeholder="+days"
            aria-label="Extend days"
            className={`${inputCls} w-24`}
          />
          <button
            type="button"
            disabled={pending}
            onClick={() => run(() => setPlanAction(orgId, plan, Number(extendDays) || 0))}
            className={btnCls}
          >
            Apply
          </button>
        </Row>

        <Row label="Resend invite / verification">
          <input
            type="email"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            placeholder="email@org.xyz"
            aria-label="Invite email"
            className={`${inputCls} w-52`}
          />
          <button
            type="button"
            disabled={pending || !inviteEmail}
            onClick={() => run(() => resendInviteAction(orgId, inviteEmail))}
            className={btnCls}
          >
            Resend
          </button>
        </Row>

        <Row label={enabled ? "Disable organization" : "Enable organization"}>
          <button
            type="button"
            disabled={pending}
            onClick={() => {
              if (
                enabled &&
                !window.confirm("Disable this organization? Sending stops immediately.")
              ) {
                return;
              }
              run(() => toggleOrgAction(orgId, !enabled));
            }}
            className={`h-9 shrink-0 rounded-lg px-3 text-sm font-medium transition-colors disabled:opacity-50 ${
              enabled
                ? "border border-destructive/40 text-destructive hover:bg-destructive/10"
                : "bg-primary text-primary-foreground hover:opacity-90"
            }`}
          >
            {enabled ? "Disable" : "Enable"}
          </button>
        </Row>

        {msg ? (
          <div
            className={`mt-3 flex items-center gap-2 rounded-lg border p-2.5 text-sm ${
              msg.ok
                ? "border-emerald-500/30 bg-emerald-500/5 text-emerald-700 dark:text-emerald-400"
                : "border-destructive/30 bg-destructive/5 text-destructive"
            }`}
          >
            {msg.ok ? (
              <CheckCircleIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
            ) : (
              <ExclamationTriangleIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
            )}
            {msg.message}
          </div>
        ) : null}
        {pending ? (
          <p className="mt-2 text-xs text-muted-foreground">Working…</p>
        ) : null}
      </CardContent>
    </Card>
  );
}
