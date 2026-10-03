"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { compareQuotes, ACTIVE_REQUEST_ID } from "@/lib/agent-tools";
import { MOCK_QUOTES, supplierName } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useAppState } from "@/lib/app-state";

export function CompareTable({ highlightBest = true }: { highlightBest?: boolean }) {
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

  return (
    <div className="overflow-x-auto rounded-xl border border-oat bg-linen">
      <Table>
        <TableHeader>
          <TableRow className="border-oat hover:bg-transparent">
            <TableHead className="text-espresso">Line item</TableHead>
            {displaySuppliers.map((id) => (
              <TableHead key={id} className="text-espresso">
                {supplierName(id)}
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
                        {cell.leadDays}d lead
                        {cell.moq ? ` · MOQ ${cell.moq}` : ""}
                      </div>
                    </div>
                  ) : (
                    <span className="text-cocoa/50">—</span>
                  )}
                </TableCell>
              ))}
            </TableRow>
          ))}
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
