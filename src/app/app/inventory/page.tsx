"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAppState } from "@/lib/app-state";
import { branchName } from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default function InventoryPage() {
  const { inventory, branchFilter, audit } = useAppState();

  const rows =
    branchFilter === "all"
      ? inventory
      : inventory.filter((r) => r.branchId === branchFilter);

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div>
        <h1 className="font-display text-3xl font-semibold text-espresso">
          Inventory
        </h1>
        <p className="mt-1 text-cocoa">
          Branch-level stock after approved orders
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-oat bg-linen card-shadow">
        <Table>
          <TableHeader>
            <TableRow className="border-oat hover:bg-transparent">
              <TableHead>Branch</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Item</TableHead>
              <TableHead className="text-right">On hand</TableHead>
              <TableHead className="text-right">Par</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => {
              const low = row.qty < row.parLevel;
              return (
                <TableRow key={`${row.branchId}-${row.sku}`} className="border-oat">
                  <TableCell className="text-cocoa">
                    {branchName(row.branchId)}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-cocoa">
                    {row.sku}
                  </TableCell>
                  <TableCell className="font-medium text-espresso">
                    {row.name}
                  </TableCell>
                  <TableCell
                    className={cn(
                      "text-right font-medium",
                      low ? "text-terracotta" : "text-sage",
                    )}
                  >
                    {row.qty} {row.unit}
                  </TableCell>
                  <TableCell className="text-right text-cocoa">
                    {row.parLevel}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <Card className="border-oat bg-linen">
        <CardHeader>
          <CardTitle className="font-display text-lg text-espresso">
            Audit log
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3 text-sm">
            {audit.slice().reverse().map((entry) => (
              <li key={entry.id} className="border-l-2 border-sage pl-3">
                <p className="text-espresso">{entry.message}</p>
                <p className="text-xs text-cocoa">
                  {new Date(entry.at).toLocaleString()}
                  {entry.approvedBy && ` · Approved by ${entry.approvedBy}`}
                </p>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
