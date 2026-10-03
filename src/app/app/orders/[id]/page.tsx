"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  DEMO_ORDERS,
  branchName,
  supplierName,
  ACTIVE_ORDER_ID,
} from "@/lib/mock-data";
import { useAppState } from "@/lib/app-state";
import { sessionToOrderStage } from "@/lib/order-mapper";
import { OrderPipelineStepper } from "@/components/order-pipeline-stepper";
import { OrderStatusPill } from "@/components/order-status-pill";
import { CompareTable } from "@/components/compare-table";
import { useAgentApi } from "@/lib/use-agent-api";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowLeft, Check, FileText, Loader2, RefreshCw } from "lucide-react";
import { DiscoveredSuppliersPanel } from "@/components/discovered-suppliers-panel";

export default function OrderDetailPage() {
  const params = useParams();
  const orderId = typeof params.id === "string" ? params.id : ACTIVE_ORDER_ID;

  const {
    agentSession,
    requestStatus,
    setAgentSession,
    setRequestStatus,
    applyInventoryDeltas,
    inventory,
  } = useAppState();

  const { loading, callAgent, applyResponseSideEffects, apiError } =
    useAgentApi();
  const [syncLoading, setSyncLoading] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [discovered, setDiscovered] = useState(
    () => agentSession.discoveredSuppliers ?? [],
  );
  const [selectedSupplierIds, setSelectedSupplierIds] = useState<string[]>(
    () =>
      agentSession.selectedRfqSupplierIds?.length
        ? agentSession.selectedRfqSupplierIds
        : ["cairo-dairy", "bean-barrel"],
  );

  const isActive = orderId === (agentSession.requestId || ACTIVE_ORDER_ID);
  const staticOrder = DEMO_ORDERS.find((o) => o.id === orderId);

  const stage = isActive
    ? sessionToOrderStage(requestStatus, agentSession)
    : (staticOrder?.stage ?? "approved");

  const lineItems = isActive
    ? agentSession.lineItems
    : staticOrder
      ? []
      : [];

  const displayLines =
    lineItems.length > 0
      ? lineItems
      : isActive
        ? []
        : [
            { sku: "OAT-1L", name: "Oat milk 1L", qty: 48, unit: "carton", branchId: "maadi" as const },
          ];

  const inventorySnapshot = useMemo(
    () =>
      inventory.map((r) => ({
        branchId: r.branchId,
        sku: r.sku,
        qty: r.qty,
      })),
    [inventory],
  );

  const handleApprove = useCallback(async () => {
    const data = await callAgent({
      message: "Approve the recommendation.",
      confirmAction: "approve",
      session: agentSession,
      inventory: inventorySnapshot,
    });
    if (!data) return;
    applyResponseSideEffects(data, {
      setAgentSession,
      setRequestStatus,
      applyInventoryDeltas,
    });
  }, [
    agentSession,
    applyInventoryDeltas,
    applyResponseSideEffects,
    callAgent,
    inventorySnapshot,
    setAgentSession,
    setRequestStatus,
  ]);

  const title = isActive
    ? "Active restock — multi-branch"
    : (staticOrder?.title ?? "Order");

  const rfqMessages = isActive ? agentSession.rfqMessages : undefined;
  const rfqDeliveries = isActive ? agentSession.rfqEmailDeliveries : undefined;

  const handleSyncReplies = useCallback(async () => {
    setSyncLoading(true);
    setSyncError(null);
    try {
      const res = await fetch("/api/agentmail/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session: agentSession,
          inventory: inventorySnapshot,
        }),
      });
      const data = (await res.json()) as {
        error?: string;
        session?: typeof agentSession;
      };
      if (!res.ok) {
        setSyncError(data.error ?? "Sync failed");
        return;
      }
      if (data.session) {
        const s = data.session;
        setAgentSession(s);
        if (s.status === "approved") {
          setRequestStatus("approved");
        } else if (s.comparisonId || s.status === "quotes_ready") {
          setRequestStatus("quotes_parsed");
        } else if (s.rfqId || s.status === "rfq_sent") {
          setRequestStatus("rfq_sent");
        }
      }
    } catch {
      setSyncError("Could not reach sync API");
    } finally {
      setSyncLoading(false);
    }
  }, [agentSession, inventorySnapshot, setAgentSession, setRequestStatus]);

  const persistSupplierSelection = useCallback(
    (ids: string[], rows: typeof discovered) => {
      setSelectedSupplierIds(ids);
      setDiscovered(rows);
      setAgentSession({
        ...agentSession,
        selectedRfqSupplierIds: ids,
        discoveredSuppliers: rows,
      });
    },
    [agentSession, setAgentSession],
  );

  const showCompare =
    isActive &&
    agentSession.quoteIds.length >= 2 &&
    Boolean(agentSession.comparisonId);

  const showApprove =
    isActive &&
    Boolean(agentSession.recommendation) &&
    requestStatus !== "approved";

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link
            href="/app/orders"
            className="mb-2 inline-flex items-center text-sm text-cocoa hover:text-espresso"
          >
            <ArrowLeft className="mr-1 size-4" />
            Orders
          </Link>
          <p className="font-mono text-sm text-cocoa">{orderId}</p>
          <h1 className="font-display text-3xl font-semibold text-espresso">
            {title}
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <OrderStatusPill stage={stage} />
            {staticOrder && !isActive && (
              <span className="text-xs text-cocoa">
                {branchName(staticOrder.branchId)} · Need by{" "}
                {staticOrder.neededBy}
              </span>
            )}
            {isActive && agentSession.rfqId && (
              <span className="font-mono text-xs text-cocoa">
                {agentSession.rfqId}
              </span>
            )}
          </div>
        </div>
        {isActive && stage === "draft" && (
          <Link
            href="/app/orders/new"
            className={cn(buttonVariants({ variant: "outline" }), "border-stripe-border")}
          >
            Edit intake
          </Link>
        )}
      </div>

      {apiError && (
        <div className="rounded-lg border border-terracotta/40 bg-terracotta/10 px-4 py-3 text-sm text-espresso">
          {apiError}
        </div>
      )}

      <Card className="border-stripe-border bg-linen card-shadow">
        <CardHeader>
          <CardTitle className="font-display text-lg text-espresso">
            Pipeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <OrderPipelineStepper current={stage} />
        </CardContent>
      </Card>

      {displayLines.length > 0 && (
        <Card className="border-stripe-border bg-linen card-shadow">
          <CardHeader>
            <CardTitle className="font-display text-lg text-espresso">
              Line items
            </CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-stripe-border">
                  <TableHead>SKU</TableHead>
                  <TableHead>Item</TableHead>
                  <TableHead>Qty</TableHead>
                  <TableHead>Branch</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayLines.map((line) => (
                  <TableRow
                    key={`${line.branchId}-${line.sku}`}
                    className="border-stripe-border"
                  >
                    <TableCell className="font-mono text-xs">
                      {line.sku}
                    </TableCell>
                    <TableCell className="font-medium text-espresso">
                      {line.name}
                    </TableCell>
                    <TableCell>
                      {line.qty} {line.unit}
                    </TableCell>
                    <TableCell className="text-cocoa">
                      {branchName(line.branchId)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {isActive && !agentSession.rfqId && displayLines.length > 0 && (
        <DiscoveredSuppliersPanel
          lineItems={lineItems.length > 0 ? lineItems : displayLines}
          selectedIds={selectedSupplierIds}
          onSelectedIdsChange={(ids) =>
            persistSupplierSelection(ids, discovered)
          }
          discovered={discovered}
          onDiscoveredChange={(rows) =>
            persistSupplierSelection(selectedSupplierIds, rows)
          }
        />
      )}

      {rfqMessages && rfqMessages.length > 0 && (
        <Card className="border-stripe-border bg-linen card-shadow">
          <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3">
            <div>
              <CardTitle className="flex items-center gap-2 font-display text-lg text-espresso">
                <FileText className="size-5 text-sage" />
                Outbound RFQ messages
              </CardTitle>
              <p className="text-sm text-cocoa">
                {rfqDeliveries?.some((d) => d.mode === "agentmail")
                  ? "Sent from your quote inbox — delivery status and message IDs below."
                  : "Practice RFQs (quote inbox not connected in this environment)."}
              </p>
            </div>
            {isActive &&
              rfqDeliveries?.some((d) => d.mode === "agentmail") && (
                <Button
                  type="button"
                  variant="outline"
                  className="border-stripe-border"
                  disabled={syncLoading}
                  onClick={() => void handleSyncReplies()}
                >
                  {syncLoading ? (
                    <Loader2 className="mr-2 size-4 animate-spin" />
                  ) : (
                    <RefreshCw className="mr-2 size-4" />
                  )}
                  Sync supplier replies
                </Button>
              )}
          </CardHeader>
          <CardContent className="space-y-4">
            {syncError && (
              <p className="text-sm text-terracotta">{syncError}</p>
            )}
            {rfqMessages.map((msg) => {
              const delivery = rfqDeliveries?.find(
                (d) => d.supplierId === msg.supplierId,
              );
              return (
                <div
                  key={msg.supplierId}
                  className="rounded-lg border border-stripe-border bg-cream"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stripe-border px-3 py-2">
                    <p className="text-sm font-medium text-espresso">
                      {supplierName(msg.supplierId)}
                    </p>
                    <span className="font-mono text-xs text-cocoa">
                      {delivery?.mode === "agentmail"
                        ? `Quote inbox · Sent · ${delivery.messageId}`
                        : "EMAIL · OUT (simulated)"}
                    </span>
                  </div>
                  {delivery?.mode === "agentmail" && (
                    <p className="border-b border-stripe-border px-3 py-2 font-mono text-xs text-cocoa">
                      From {delivery.from} → {delivery.to}
                    </p>
                  )}
                  <pre className="max-h-48 overflow-auto whitespace-pre-wrap p-3 font-mono text-xs leading-relaxed text-cocoa">
                    {msg.body}
                  </pre>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {showCompare && (
        <div className="space-y-3">
          <h2 className="font-display text-xl font-semibold text-espresso">
            Quote comparison
          </h2>
          <CompareTable highlightBest showLandedTotals showSupplierRoles />
        </div>
      )}

      {isActive && agentSession.recommendation && (
        <Card className="border-stripe-border bg-linen card-shadow">
          <CardHeader>
            <CardTitle className="font-display text-lg text-espresso">
              Recommendation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-cocoa">{agentSession.recommendation.summary}</p>
            <ul className="space-y-2 text-sm text-cocoa">
              {agentSession.recommendation.allocations.map((a) => (
                <li key={a.sku}>
                  <span className="font-mono text-espresso">{a.sku}</span> →{" "}
                  {supplierName(a.supplierId)}: {a.rationale}
                </li>
              ))}
            </ul>
            {showApprove && (
              <Button
                type="button"
                className="bg-terracotta text-linen hover:bg-terracotta/90"
                onClick={() => void handleApprove()}
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                ) : (
                  <Check className="mr-2 size-4" />
                )}
                Approve &amp; update inventory
              </Button>
            )}
            {requestStatus === "approved" && (
              <Link
                href="/app/inventory"
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "border-stripe-border",
                )}
              >
                View inventory ledger
              </Link>
            )}
          </CardContent>
        </Card>
      )}

      {!isActive && staticOrder && (
        <p className="text-sm text-cocoa">
          Historical order — open{" "}
          <Link href="/app/orders/new" className="text-terracotta underline">
            New order
          </Link>{" "}
          to run the live agent pipeline on {ACTIVE_ORDER_ID}.
        </p>
      )}
    </div>
  );
}
