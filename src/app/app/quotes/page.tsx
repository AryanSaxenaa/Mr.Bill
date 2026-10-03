"use client";

import Link from "next/link";
import { CompareTable } from "@/components/compare-table";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { MOCK_QUOTES, supplierName, ACTIVE_ORDER_ID } from "@/lib/mock-data";
import { recommend } from "@/lib/agent-tools";
import { useAppState } from "@/lib/app-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PasteQuoteReply } from "@/components/paste-quote-reply";
import { RfqMailPanel } from "@/components/rfq-mail-panel";
import { Check } from "lucide-react";

export default function QuotesPage() {
  const { requestStatus, agentSession } = useAppState();

  const quotesReady =
    requestStatus === "quotes_parsed" ||
    requestStatus === "approved" ||
    requestStatus === "rfq_sent";

  const hasComparison =
    agentSession.quoteIds.length >= 2 && Boolean(agentSession.comparisonId);

  const rec =
    agentSession.recommendation ??
    (hasComparison
      ? recommend({
          requestId: agentSession.requestId,
          comparisonId: agentSession.comparisonId ?? `CMP-${agentSession.requestId}`,
        })
      : null);

  const rfqLabel = agentSession.rfqId ?? "No RFQ - start from New order";

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-sage">Quote desk</p>
          <h1 className="font-display text-3xl font-semibold text-espresso">
            Supplier comparison
          </h1>
          <p className="mt-1 font-mono text-sm text-cocoa">
            {agentSession.requestId || ACTIVE_ORDER_ID} · {rfqLabel}
          </p>
        </div>
        {hasComparison && (
          <div className="flex flex-wrap gap-2">
            {agentSession.quoteIds.map((qid) => {
              const q = MOCK_QUOTES.find((x) => x.id === qid);
              if (!q) return null;
              return (
                <Badge
                  key={q.id}
                  variant="outline"
                  className="border-sage/40 bg-sage/10 text-sage"
                >
                  {supplierName(q.supplierId)} · In
                </Badge>
              );
            })}
          </div>
        )}
      </div>

      <RfqMailPanel />

      <PasteQuoteReply />

      {!quotesReady && (
        <Card className="border-stripe-border bg-linen">
          <CardContent className="py-10 text-center text-cocoa">
            <p className="font-display text-lg text-espresso">No quotes yet</p>
            <p className="mt-2 text-sm">
              Start from New order - describe a Maison Layla restock, send RFQs,
              then compare landed cost in EGP when quotes land.
            </p>
            <Link
              href="/app/orders/new"
              className={cn(
                buttonVariants(),
                "mt-4 inline-flex",
              )}
            >
              New order
            </Link>
          </CardContent>
        </Card>
      )}

      {quotesReady && !hasComparison && (
        <Card className="border-stripe-border bg-linen">
          <CardContent className="py-10 text-center text-cocoa">
            Send RFQs from{" "}
            <Link href="/app/orders/new" className="text-indigo-accent underline">
              New order
            </Link>{" "}
            or paste replies below to populate the comparison matrix.
          </CardContent>
        </Card>
      )}

      {hasComparison && (
        <CompareTable
          highlightBest
          showLandedTotals
          showSupplierRoles
        />
      )}

      {rec && hasComparison && (
        <Card className="card-shadow border-stripe-border bg-linen">
          <CardHeader>
            <CardTitle className="font-display text-lg text-espresso">
              Split recommendation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-cocoa">{rec.summary}</p>
            <ul className="space-y-2 text-sm text-cocoa">
              {rec.allocations.map((a) => (
                <li key={a.sku}>
                  <span className="font-mono text-espresso">{a.sku}</span> →{" "}
                  {supplierName(a.supplierId)}: {a.rationale}
                </li>
              ))}
            </ul>
            {requestStatus !== "approved" && (
              <Link
                href={`/app/orders/${agentSession.requestId || ACTIVE_ORDER_ID}`}
                className={cn(
                  buttonVariants(),
                  "bg-primary text-primary-foreground",
                )}
              >
                <Check className="mr-2 size-4" />
                Approve on order detail
              </Link>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
