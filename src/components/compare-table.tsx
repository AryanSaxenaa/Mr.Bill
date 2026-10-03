"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  compareQuotes,
  landedLineTotal,
  ACTIVE_REQUEST_ID,
} from "@/lib/agent-tools";
import { MOCK_QUOTES, supplierName } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useAppState } from "@/lib/app-state";
import { useMemo } from "react";

export function CompareTable({
  highlightBest = true,
  showLandedTotals = false,
  showSupplierRoles = false,
}: {
  highlightBest?: boolean;
  showLandedTotals?: boolean;
  showSupplierRoles?: boolean;
}) {
  const { agentSession } = useAppState();

  const quoteIds =
    agentSession.quoteIds.length >= 2
      ? agentSession.quoteIds
      : MOCK_QUOTES.map((q) => q.id);

  const requestId = agentSession.requestId || ACTIVE_REQUEST_ID;

  const comparison = compareQuotes({
    requestId,
    quoteIds,
  });

  const supplierIds = quoteIds
    .map((id) => MOCK_QUOTES.find((q) => q.id === id)?.supplierId)
    .filter((id): id is string => Boolean(id));

  const displaySuppliers =
    supplierIds.length > 0 ? supplierIds : MOCK_QUOTES.map((q) => q.supplierId);

  const primarySupplierId = useMemo(() => {
    const alloc = agentSession.recommendation?.allocations ?? [];
    const counts = new Map<string, number>();
    for (const a of alloc) {
      counts.set(a.supplierId, (counts.get(a.supplierId) ?? 0) + 1);
    }
    let best = displaySuppliers[0] ?? "cairo-dairy";
    let max = 0;
    for (const [id, c] of counts) {
      if (c > max) {
        max = c;
        best = id;
      }
    }
    return best;
  }, [agentSession.recommendation, displaySuppliers]);

  const fallbackSupplierId =
    primarySupplierId === "cairo-dairy" ? "bean-barrel" : "cairo-dairy";

  const landedBySupplier = useMemo(() => {
    const totals: Record<string, number> = {};
    for (const sid of displaySuppliers) {
      totals[sid] = comparison.matrix.reduce((sum, row) => {
        const cell = row.cells.find((c) => c.supplierId === sid);
        const quote = MOCK_QUOTES.find((q) => q.supplierId === sid);
        const line = quote?.lines.find((l) => l.sku === row.sku);
        const qty = line?.qty ?? 0;
        if (!cell || !Number.isFinite(cell.unitPrice)) return sum;
        return sum + cell.unitPrice * qty;
      }, 0);
    }
    return totals;
  }, [comparison.matrix, displaySuppliers]);

  return (
    <div className="overflow-x-auto rounded-xl border border-oat bg-linen">
      <Table>
        <TableHeader>
          <TableRow className="border-oat hover:bg-transparent">
            <TableHead className="text-espresso">Line item</TableHead>
            {displaySuppliers.map((id) => (
              <TableHead key={id} className="min-w-[140px] text-espresso">
                <div className="flex flex-col gap-1">
                  <span>{supplierName(id)}</span>
                  {showSupplierRoles && (
                    <span className="flex flex-wrap gap-1">
                      {id === primarySupplierId && (
                        <Badge className="border-sage/40 bg-sage/15 text-sage">
                          Primary
                        </Badge>
                      )}
                      {id === fallbackSupplierId && (
                        <Badge
                          variant="outline"
                          className="border-oat text-cocoa"
                        >
                          Reserve
                        </Badge>
                      )}
                    </span>
                  )}
                </div>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {comparison.matrix.map((row) => (
            <TableRow key={row.sku} className="border-oat">
              <TableCell className="font-medium text-espresso">
                {row.name}
                <span className="ml-2 font-mono text-xs text-cocoa">
                  {row.sku}
                </span>
              </TableCell>
              {row.cells.map((cell) => (
                <TableCell
                  key={cell.supplierId}
                  className={cn(
                    "text-sm text-cocoa transition-colors duration-300",
                    highlightBest &&
                      cell.isBest &&
                      "bg-sage/12 font-medium text-espresso",
                  )}
                >
                  {Number.isFinite(cell.unitPrice) ? (
                    <div>
                      <div>EGP {cell.unitPrice.toLocaleString()}</div>
                      <div className="text-xs">
                        {cell.leadDays}d delivery
                        {cell.moq ? ` · MOQ ${cell.moq}` : ""}
                      </div>
                      {showLandedTotals && (
                        <div className="mt-1 font-mono text-xs text-espresso">
                          Landed EGP{" "}
                          {landedLineTotal(
                            cell.supplierId,
                            row.sku,
                            MOCK_QUOTES.find((q) => q.supplierId === cell.supplierId)
                              ?.lines.find((l) => l.sku === row.sku)?.qty ?? 0,
                          ).toLocaleString()}
                        </div>
                      )}
                    </div>
                  ) : (
                    <span className="text-cocoa/50">—</span>
                  )}
                </TableCell>
              ))}
            </TableRow>
          ))}
          {showLandedTotals && (
            <TableRow className="border-oat bg-cream/80 font-medium">
              <TableCell className="text-espresso">Order landed total</TableCell>
              {displaySuppliers.map((id) => (
                <TableCell key={id} className="font-mono text-espresso">
                  EGP {(landedBySupplier[id] ?? 0).toLocaleString()}
                </TableCell>
              ))}
            </TableRow>
          )}
        </TableBody>
      </Table>
      {comparison.warnings.length > 0 && (
        <div className="border-t border-oat px-4 py-3">
          {comparison.warnings.map((w) => (
            <Badge
              key={w}
              variant="outline"
              className="mr-2 border-terracotta/40 text-terracotta"
            >
              {w}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
