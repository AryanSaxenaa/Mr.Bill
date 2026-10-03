"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAppState } from "@/lib/app-state";
import { BRANCHES, branchName } from "@/lib/mock-data";
import { ArrowRight, AlertTriangle } from "lucide-react";

export default function DashboardPage() {
  const { inventory, branchFilter, requestStatus, audit } = useAppState();

  const filtered =
    branchFilter === "all"
      ? inventory
      : inventory.filter((r) => r.branchId === branchFilter);

  const lowStock = filtered.filter((r) => r.qty < r.parLevel);

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

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[
          {
            title: "Below par",
            value: lowStock.length,
            sub: "SKUs need attention",
            delay: "0ms",
          },
          {
            title: "Active request",
            value: statusLabel[requestStatus] ?? requestStatus,
            sub: "Demo flow status",
            delay: "50ms",
          },
          {
            title: "Hours saved",
            value: "6–8 / week",
            sub: "Illustrative from operator interviews",
            delay: "100ms",
          },
        ].map((card, i) => (
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
          <ul className="space-y-2 text-sm text-cocoa">
            {audit.slice(-4).reverse().map((entry) => (
              <li key={entry.id} className="border-b border-oat/60 py-2 last:border-0">
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
