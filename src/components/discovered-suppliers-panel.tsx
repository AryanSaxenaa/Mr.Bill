"use client";

import { useCallback, useMemo, useState } from "react";
import type { DiscoveredSupplier } from "@/lib/serpapi";
import { SUPPLIERS } from "@/lib/mock-data";
import type { LineItem } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2, Search } from "lucide-react";

export interface DiscoveredSuppliersPanelProps {
  lineItems: LineItem[];
  location?: string;
  selectedIds: string[];
  onSelectedIdsChange: (ids: string[]) => void;
  discovered: DiscoveredSupplier[];
  onDiscoveredChange: (rows: DiscoveredSupplier[]) => void;
  poweredBySerpApi?: boolean;
  searchMessage?: string | null;
  disabled?: boolean;
}

export function DiscoveredSuppliersPanel({
  lineItems,
  location = "Cairo, Egypt",
  selectedIds,
  onSelectedIdsChange,
  discovered,
  onDiscoveredChange,
  poweredBySerpApi,
  searchMessage,
  disabled,
}: DiscoveredSuppliersPanelProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [localMessage, setLocalMessage] = useState<string | null>(null);
  const [localPowered, setLocalPowered] = useState<boolean | undefined>(
    poweredBySerpApi,
  );

  const catalogRows: DiscoveredSupplier[] = useMemo(
    () =>
      SUPPLIERS.map((s) => ({
        id: s.id,
        name: s.name,
        url: `mailto:${s.contact}`,
        snippet: `Catalog supplier · ${s.contact}`,
        source: "mock" as const,
        phone: undefined,
      })),
    [],
  );

  const tableRows = discovered.length > 0 ? discovered : catalogRows;

  const toggleId = (id: string) => {
    onSelectedIdsChange(
      selectedIds.includes(id)
        ? selectedIds.filter((x) => x !== id)
        : [...selectedIds, id],
    );
  };

  const runSearch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/suppliers/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          location,
          lineItems: lineItems.filter((l) => l.sku && l.name),
        }),
      });
      const data = (await res.json()) as {
        error?: string;
        results?: DiscoveredSupplier[];
        message?: string;
        poweredBySerpApi?: boolean;
      };
      if (!res.ok) {
        setError(data.error ?? "Search failed");
        return;
      }
      onDiscoveredChange(data.results ?? []);
      setLocalMessage(data.message ?? null);
      setLocalPowered(data.poweredBySerpApi);
      if (selectedIds.length === 0 && (data.results?.length ?? 0) > 0) {
        const defaults = (data.results ?? [])
          .filter((r) => r.id === "cairo-dairy" || r.id === "bean-barrel")
          .map((r) => r.id);
        onSelectedIdsChange(
          defaults.length > 0
            ? defaults
            : (data.results ?? []).slice(0, 2).map((r) => r.id),
        );
      }
    } catch {
      setError("Could not reach supplier search API");
    } finally {
      setLoading(false);
    }
  }, [
    lineItems,
    location,
    onDiscoveredChange,
    onSelectedIdsChange,
    selectedIds.length,
  ]);

  const footnotePowered =
    localPowered ?? poweredBySerpApi ?? discovered.some((d) => d.source === "serpapi");
  const info = localMessage ?? searchMessage;

  return (
    <div className="space-y-3 rounded-xl border border-stripe-border bg-cream/40 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-semibold text-espresso">
            Discovered suppliers
          </h2>
          <p className="text-sm text-cocoa">
            Select RFQ recipients — catalog suppliers merge with web discovery.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          className="border-sage text-sage hover:bg-sage/10"
          disabled={disabled || loading || lineItems.filter((l) => l.name).length === 0}
          onClick={() => void runSearch()}
        >
          {loading ? (
            <Loader2 className="mr-2 size-4 animate-spin" />
          ) : (
            <Search className="mr-2 size-4" />
          )}
          Find suppliers
        </Button>
      </div>

      {error && (
        <p className="text-sm text-terracotta">{error}</p>
      )}
      {info && (
        <p className="text-sm text-cocoa">{info}</p>
      )}

      <div className="overflow-x-auto rounded-lg border border-stripe-border bg-linen">
        <Table>
          <TableHeader>
            <TableRow className="border-stripe-border hover:bg-transparent">
              <TableHead className="w-10" />
              <TableHead>Name</TableHead>
              <TableHead>Snippet</TableHead>
              <TableHead>Link / phone</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tableRows.map((row) => (
              <TableRow key={row.id} className="border-stripe-border">
                <TableCell>
                  <input
                    type="checkbox"
                    className="size-4 accent-espresso"
                    checked={selectedIds.includes(row.id)}
                    onChange={() => toggleId(row.id)}
                    aria-label={`Include ${row.name} in RFQ`}
                  />
                </TableCell>
                <TableCell className="font-medium text-espresso">
                  {row.name}
                  {row.source === "mock" && (
                    <span className="ml-2 font-mono text-[10px] uppercase text-cocoa">
                      catalog
                    </span>
                  )}
                </TableCell>
                <TableCell className="max-w-xs text-sm text-cocoa">
                  {row.snippet}
                </TableCell>
                <TableCell className="text-sm">
                  {row.url ? (
                    <a
                      href={row.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-terracotta underline"
                    >
                      {row.url.replace(/^https?:\/\//, "").slice(0, 40)}
                    </a>
                  ) : null}
                  {row.phone && (
                    <span className="block font-mono text-xs text-cocoa">
                      {row.phone}
                    </span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {footnotePowered && (
        <p className="text-right text-[11px] text-cocoa">Powered by SerpAPI</p>
      )}
    </div>
  );
}
