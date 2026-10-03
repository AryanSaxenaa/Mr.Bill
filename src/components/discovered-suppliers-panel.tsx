"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { DiscoveredSupplier } from "@/lib/serpapi";
import { SUPPLIERS } from "@/lib/mock-data";
import type { LineItem } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { ExternalLink, Loader2, Search } from "lucide-react";

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

function linkLabel(url: string): string {
  if (url.startsWith("mailto:")) {
    return url.replace(/^mailto:/, "");
  }
  return url.replace(/^https?:\/\//, "").slice(0, 48);
}

function SupplierSourceBadge({ source }: { source: DiscoveredSupplier["source"] }) {
  if (source === "serpapi") {
    return (
      <Badge
        variant="secondary"
        className="border-indigo-accent/20 bg-indigo-accent/10 text-[10px] uppercase tracking-wide text-indigo-accent"
      >
        Web
      </Badge>
    );
  }
  return (
    <Badge
      variant="outline"
      className="border-stripe-border text-[10px] uppercase tracking-wide text-cocoa"
    >
      Catalog
    </Badge>
  );
}

function SupplierRowCard({
  row,
  selected,
  onToggle,
}: {
  row: DiscoveredSupplier;
  selected: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      className={cn(
        "rounded-lg border border-stripe-border bg-linen p-3 card-shadow transition-colors",
        selected && "ring-2 ring-indigo-accent/30",
      )}
    >
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          className="mt-1 size-4 shrink-0 accent-espresso"
          checked={selected}
          onChange={onToggle}
          aria-label={`Include ${row.name} in RFQ`}
        />
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-medium text-espresso">{row.name}</span>
            <SupplierSourceBadge source={row.source} />
          </div>
          <p className="text-sm leading-snug text-cocoa break-words">{row.snippet}</p>
          <div className="flex flex-col gap-1 text-sm">
            {row.url ? (
              <a
                href={row.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 font-medium text-indigo-accent underline-offset-2 hover:underline"
              >
                <ExternalLink className="size-3.5 shrink-0" aria-hidden />
                <span className="truncate">{linkLabel(row.url)}</span>
              </a>
            ) : null}
            {row.phone ? (
              <span className="font-mono text-xs text-cocoa">{row.phone}</span>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
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

  const tableRows = useMemo(() => {
    const seen = new Set(catalogRows.map((row) => row.name.toLowerCase()));
    const extra = discovered.filter((row) => {
      const key = row.name.toLowerCase();
      if (row.source === "mock" || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    return [...catalogRows, ...extra];
  }, [catalogRows, discovered]);

  const autoTriedRef = useRef(false);

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

  useEffect(() => {
    if (lineItems.filter((l) => l.name).length === 0) {
      autoTriedRef.current = false;
    }
  }, [lineItems]);

  useEffect(() => {
    const ready = lineItems.filter((l) => l.name).length > 0;
    if (!ready || disabled || autoTriedRef.current) return;
    if (discovered.some((d) => d.source === "serpapi")) {
      autoTriedRef.current = true;
      return;
    }
    autoTriedRef.current = true;
    void runSearch();
  }, [disabled, discovered, lineItems, runSearch]);

  const footnotePowered =
    localPowered ?? poweredBySerpApi ?? discovered.some((d) => d.source === "serpapi");
  const info = localMessage ?? searchMessage;

  return (
    <div
      className="max-w-full space-y-3 overflow-x-hidden rounded-xl border border-stripe-border bg-cream/40 p-4 card-shadow"
      data-tour="suppliers"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="font-display text-lg font-semibold text-espresso">
            Discovered suppliers
          </h2>
          <p className="text-sm text-cocoa">
            Select RFQ recipients - catalog suppliers merge with web discovery.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          className="shrink-0 border-sage text-sage hover:bg-sage/10"
          disabled={disabled || loading || lineItems.filter((l) => l.name).length === 0}
          data-tour="discover-vendors"
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

      {error && <p className="text-sm text-terracotta">{error}</p>}
      {info && <p className="text-sm text-cocoa">{info}</p>}

      <div className="space-y-2 md:hidden">
        {tableRows.map((row) => (
          <SupplierRowCard
            key={row.id}
            row={row}
            selected={selectedIds.includes(row.id)}
            onToggle={() => toggleId(row.id)}
          />
        ))}
      </div>

      <div className="hidden overflow-x-hidden rounded-lg border border-stripe-border bg-linen md:block [&_[data-slot=table-container]]:overflow-x-hidden">
        <Table className="table-fixed w-full">
          <TableHeader>
            <TableRow className="border-stripe-border hover:bg-transparent">
              <TableHead className="w-10" />
              <TableHead className="w-[28%] text-espresso">Name</TableHead>
              <TableHead className="w-[44%] text-espresso">Snippet</TableHead>
              <TableHead className="w-[28%] text-espresso">Link / phone</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tableRows.map((row) => (
              <TableRow key={row.id} className="border-stripe-border">
                <TableCell className="whitespace-normal align-top">
                  <input
                    type="checkbox"
                    className="size-4 accent-espresso"
                    checked={selectedIds.includes(row.id)}
                    onChange={() => toggleId(row.id)}
                    aria-label={`Include ${row.name} in RFQ`}
                  />
                </TableCell>
                <TableCell className="max-w-0 whitespace-normal align-top">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span
                      className="truncate font-medium text-espresso"
                      title={row.name}
                    >
                      {row.name}
                    </span>
                    <SupplierSourceBadge source={row.source} />
                  </div>
                </TableCell>
                <TableCell className="max-w-0 whitespace-normal align-top">
                  <p
                    className="break-words text-sm leading-snug text-cocoa"
                    title={row.snippet}
                  >
                    {row.snippet}
                  </p>
                </TableCell>
                <TableCell className="max-w-0 whitespace-normal align-top text-sm">
                  {row.url ? (
                    <a
                      href={row.url}
                      target="_blank"
                      rel="noreferrer"
                      className="block truncate text-indigo-accent underline-offset-2 hover:underline"
                      title={row.url}
                    >
                      {linkLabel(row.url)}
                    </a>
                  ) : null}
                  {row.phone && (
                    <span className="mt-1 block font-mono text-xs text-cocoa">
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
        <p className="text-right text-[11px] text-cocoa">Live supplier search</p>
      )}
    </div>
  );
}
