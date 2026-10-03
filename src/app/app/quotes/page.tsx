"use client";

import Link from "next/link";
import { CompareTable } from "@/components/compare-table";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { MOCK_RFQ_ID, MOCK_QUOTES, supplierName } from "@/lib/mock-data";
import { recommend, ACTIVE_REQUEST_ID } from "@/lib/agent-tools";
import { useAppState } from "@/lib/app-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function QuotesPage() {
  const { requestStatus } = useAppState();
  const rec = recommend({
    requestId: ACTIVE_REQUEST_ID,
    comparisonId: `CMP-${ACTIVE_REQUEST_ID}`,
  });

  const quotesReady =
    requestStatus === "quotes_parsed" ||
    requestStatus === "approved" ||
    requestStatus === "rfq_sent";

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold text-espresso">
            Quotes
          </h1>
          <p className="mt-1 font-mono text-sm text-cocoa">{MOCK_RFQ_ID}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {MOCK_QUOTES.map((q) => (
            <Badge
              key={q.id}
              variant="outline"
              className="border-sage/40 bg-sage/10 text-sage"
            >
              {supplierName(q.supplierId)} · Sent
            </Badge>
          ))}
        </div>
      </div>

      {!quotesReady && (
        <Card className="border-oat bg-linen">
          <CardContent className="py-8 text-center text-cocoa">
            Run the{" "}
            <Link href="/app/request" className="text-terracotta underline">
              New request
            </Link>{" "}
            flow to simulate RFQs and parse supplier replies first.
          </CardContent>
        </Card>
      )}

      <CompareTable highlightBest />

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
          <Link
            href="/app/request?step=approve"
            className={cn(
              buttonVariants(),
              "bg-terracotta text-linen hover:bg-terracotta/90",
            )}
          >
            Approve in chat
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
