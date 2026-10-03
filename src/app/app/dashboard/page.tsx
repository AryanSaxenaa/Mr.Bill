"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAppState } from "@/lib/app-state";
import { BRANCHES, branchName, supplierName } from "@/lib/mock-data";
import { ArrowRight, AlertTriangle, FileText } from "lucide-react";

export default function DashboardPage() {
  const { inventory, branchFilter, requestStatus, audit, agentSession } =
    useAppState();

  const filtered =
    branchFilter === "all"
      ? inventory
      : inventory.filter((r) => r.branchId === branchFilter);

  const lowStock = filtered.filter((r) => r.qty < r.parLevel);

  const branchesWithAlerts = new Set(lowStock.map((r) => r.branchId)).size;

  const pendingLineItems =
    requestStatus !== "approved" && requestStatus !== "idle"
      ? agentSession.lineItems.length
      : agentSession.status === "awaiting_confirm"
        ? agentSession.lineItems.length
        : 0;

  const quoteCount = agentSession.quoteIds.length;

  const rfqStatus =
    agentSession.rfqId != null
      ? `RFQ ${agentSession.rfqId} · ${requestStatus === "rfq_sent" ? "Sent (simulated)" : requestStatus.replace("_", " ")}`
      : requestStatus === "idle"
        ? "No RFQ yet"
        : "Drafting line items";

  const statusLabel: Record<string, string> = {
    idle: "No active request",
    confirmed: "Line items confirmed",
    rfq_sent: "RFQ sent to suppliers",
    quotes_parsed: "Quotes ready to compare",
    approved: "Last order approved",
  };

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div>
        <h1 className="font-display text-3xl font-semibold text-espresso">
          Dashboard
        </h1>
        <p className="mt-1 text-cocoa">
          Maison Layla · {BRANCHES.length} branches · Cairo
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            title: "Below par",
            value: lowStock.length,
            sub: `${branchesWithAlerts} branch${branchesWithAlerts === 1 ? "" : "es"} affected`,
            delay: "0ms",
          },
          {
            title: "Pending lines",
            value: pendingLineItems || "—",
            sub: statusLabel[requestStatus] ?? requestStatus,
            delay: "50ms",
          },
          {
            title: "Quotes parsed",
            value: quoteCount,
            sub: rfqStatus,
            delay: "100ms",
          },
          {
            title: "Last request",
            value: agentSession.requestId,
            sub:
              requestStatus === "approved"
                ? "Approved · inventory synced"
                : agentSession.recommendation
                  ? "Recommendation ready"
                  : "In progress or idle",
            delay: "150ms",
          },
        ].map((card) => (
          <Card
            key={card.title}
            className="card-shadow border-oat bg-linen"
            style={{ animationDelay: card.delay }}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-cocoa">
                {card.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-display text-2xl font-semibold text-espresso">
                {typeof card.value === "number" ? card.value : card.value}
              </p>
              <p className="text-xs text-cocoa">{card.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {lowStock.length === 0 && (
        <Card className="border-oat bg-linen">
          <CardContent className="py-6 text-center text-sm text-cocoa">
            All SKUs at or above par for the selected branch filter.
          </CardContent>
        </Card>
      )}

      {agentSession.rfqMessages && agentSession.rfqMessages.length > 0 && (
        <Card className="card-shadow border-oat bg-linen">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-display text-lg text-espresso">
              <FileText className="size-5 text-sage" />
              Latest RFQ drafts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {agentSession.rfqMessages.map((msg) => (
              <div
                key={msg.supplierId}
                className="rounded-lg border border-oat bg-cream p-3"
              >
                <p className="text-sm font-medium text-espresso">
                  {supplierName(msg.supplierId)}
                </p>
                <pre className="mt-2 max-h-32 overflow-auto whitespace-pre-wrap font-mono text-xs text-cocoa">
                  {msg.body}
                </pre>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {lowStock.length > 0 && (
        <Card className="card-shadow border-oat bg-linen">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-display text-lg text-espresso">
              <AlertTriangle className="size-5 text-terracotta" />
              Stock alerts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {lowStock.map((row) => (
              <div
                key={`${row.branchId}-${row.sku}`}
                className="flex flex-wrap items-center justify-between gap-2 border-b border-oat pb-3 last:border-0 last:pb-0"
              >
                <div>
                  <p className="font-medium text-espresso">{row.name}</p>
                  <p className="text-sm text-cocoa">
                    {branchName(row.branchId)} · {row.qty} {row.unit} (par{" "}
                    {row.parLevel})
                  </p>
                </div>
                <Link
                  href="/app/request"
                  className={cn(
                    buttonVariants({ size: "sm" }),
                    "bg-terracotta text-linen hover:bg-terracotta/90",
                  )}
                >
                  Restock
                </Link>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Card className="card-shadow border-oat bg-linen">
        <CardHeader>
          <CardTitle className="font-display text-lg text-espresso">
            Recent activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          {audit.length <= 1 && requestStatus === "idle" ? (
            <p className="text-sm text-cocoa">
              No approvals yet. Run a restock request to populate the audit log.
            </p>
          ) : (
            <ul className="space-y-2 text-sm text-cocoa">
              {audit.slice(-6).reverse().map((entry) => (
                <li
                  key={entry.id}
                  className="border-b border-oat/60 py-2 last:border-0"
                >
                  <span className="font-mono text-xs text-cocoa/70">
                    {new Date(entry.at).toLocaleString()}
                  </span>
                  <p className="text-espresso">{entry.message}</p>
                  {entry.approvedBy && (
                    <p className="text-xs text-sage">
                      Approved by {entry.approvedBy}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Link
        href="/app/request"
        className={cn(buttonVariants(), "bg-espresso text-linen")}
      >
        New restock request
        <ArrowRight className="ml-2 size-4" />
      </Link>
    </div>
  );
}
