"use client";

import Link from "next/link";
import { CompareTable } from "@/components/compare-table";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { MOCK_QUOTES, supplierName } from "@/lib/mock-data";
import { recommend } from "@/lib/agent-tools";
import { useAppState } from "@/lib/app-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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

  const rfqLabel = agentSession.rfqId ?? "Run a request to generate RFQ";

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold text-espresso">
            Quotes
          </h1>
          <p className="mt-1 font-mono text-sm text-cocoa">{rfqLabel}</p>
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
                  {supplierName(q.supplierId)} · Parsed
                </Badge>
              );
            })}
          </div>
        )}
      </div>

      {!quotesReady && (
        <Card className="border-oat bg-linen">
          <CardContent className="py-8 text-center text-cocoa">
            Run the{" "}
            <Link href="/app/request" className="text-terracotta underline">
              New request
            </Link>{" "}
            flow to send RFQs and parse supplier replies first.
          </CardContent>
        </Card>
      )}

      {quotesReady && !hasComparison && (
        <Card className="border-oat bg-linen">
          <CardContent className="py-8 text-center text-cocoa">
            Confirm and send RFQ in{" "}
            <Link href="/app/request" className="text-terracotta underline">
              New request
            </Link>{" "}
            to populate this comparison from your session.
          </CardContent>
        </Card>
      )}

      {hasComparison && <CompareTable highlightBest />}

      {rec && hasComparison && (
        <Card className="card-shadow border-oat bg-linen">
          <CardHeader>
            <CardTitle className="font-display text-lg text-espresso">
              Recommendation
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
                href="/app/request?step=approve"
                className={cn(
                  buttonVariants(),
                  "bg-terracotta text-linen hover:bg-terracotta/90",
                )}
              >
                Approve in chat
              </Link>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
