"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BRANCHES,
  DEMO_INTAKE_TEXT,
  PARSED_LINE_ITEMS,
  branchName,
  type BranchId,
  type LineItem,
} from "@/lib/mock-data";
import {
  ACTIVE_REQUEST_ID,
  buildSupplierSearchQuery,
} from "@/lib/agent-tools";
import { DiscoveredSuppliersPanel } from "@/components/discovered-suppliers-panel";
import { DEFAULT_SESSION } from "@/lib/agent-session";
import { useAppState } from "@/lib/app-state";
import { useAgentApi } from "@/lib/use-agent-api";
import { AskMrBillPanel } from "@/components/ask-mr-bill-panel";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { Loader2, Plus, Send, Trash2, Wand2 } from "lucide-react";

function emptyLine(branchId: BranchId): LineItem {
  return {
    sku: "",
    name: "",
    qty: 1,
    unit: "unit",
    branchId,
  };
}

export function NewOrderWorkspace() {
  const router = useRouter();
  const {
    agentSession,
    setAgentSession,
    setRequestStatus,
    applyInventoryDeltas,
    inventory,
    requestStatus,
  } = useAppState();

  const {
    loading,
    apiError,
    llmNotice,
    agentMode,
    setAgentMode,
    callAgent,
    applyResponseSideEffects,
  } = useAgentApi();

  const [branchId, setBranchId] = useState<BranchId>("maadi");
  const [neededBy, setNeededBy] = useState(agentSession.neededBy || "Friday");
  const [lines, setLines] = useState<LineItem[]>(
    agentSession.lineItems.length > 0
      ? agentSession.lineItems
      : [],
  );
  const [nlDraft, setNlDraft] = useState(DEMO_INTAKE_TEXT);
  const [assistantNote, setAssistantNote] = useState<string | null>(null);
  const [discovered, setDiscovered] = useState(
    () => agentSession.discoveredSuppliers ?? [],
  );
  const [selectedSupplierIds, setSelectedSupplierIds] = useState<string[]>(
    () =>
      agentSession.selectedRfqSupplierIds?.length
        ? agentSession.selectedRfqSupplierIds
        : ["cairo-dairy", "bean-barrel"],
  );

  useEffect(() => {
    void fetch("/api/agent/config")
      .then((r) => r.json())
      .then((data: { liveAgent: boolean }) => {
        setAgentMode(data.liveAgent ? "live" : "demo");
      })
      .catch(() => setAgentMode("demo"));
  }, [setAgentMode]);

  useEffect(() => {
    if (agentSession.lineItems.length > 0) {
      setLines(agentSession.lineItems);
    }
  }, [agentSession.lineItems]);

  useEffect(() => {
    if (agentSession.discoveredSuppliers?.length) {
      setDiscovered(agentSession.discoveredSuppliers);
    }
    if (agentSession.selectedRfqSupplierIds?.length) {
      setSelectedSupplierIds(agentSession.selectedRfqSupplierIds);
    }
  }, [agentSession.discoveredSuppliers, agentSession.selectedRfqSupplierIds]);

  const inventorySnapshot = useMemo(
    () =>
      inventory.map((r) => ({
        branchId: r.branchId,
        sku: r.sku,
        qty: r.qty,
      })),
    [inventory],
  );

  const sessionWithForm = useCallback((): typeof agentSession => {
    return {
      ...agentSession,
      requestId: agentSession.requestId || ACTIVE_REQUEST_ID,
      lineItems: lines.filter((l) => l.sku && l.name),
      neededBy,
      deliveryBranch: branchName(branchId),
      discoveredSuppliers: discovered,
      selectedRfqSupplierIds: selectedSupplierIds,
    };
  }, [agentSession, lines, neededBy, branchId, discovered, selectedSupplierIds]);

  const handlers = useMemo(
    () => ({
      setAgentSession,
      setRequestStatus,
      applyInventoryDeltas,
    }),
    [setAgentSession, setRequestStatus, applyInventoryDeltas],
  );

  const handleRunDemoScript = () => {
    setNlDraft(DEMO_INTAKE_TEXT);
    setNeededBy("Friday");
    setBranchId("maadi");
    setLines(PARSED_LINE_ITEMS);
    setSelectedSupplierIds(["cairo-dairy", "bean-barrel"]);
    setDiscovered([]);
    setAgentSession({
      ...DEFAULT_SESSION,
      lineItems: PARSED_LINE_ITEMS,
      status: "awaiting_confirm",
      neededBy: "Friday",
      deliveryBranch: "Maadi",
      selectedRfqSupplierIds: ["cairo-dairy", "bean-barrel"],
    });
    setRequestStatus("confirmed");
    setAssistantNote(
      "Friday restock is in the line table: oat milk and cups for Maadi, espresso for Zamalek. Review the rows, then Send RFQs when you are ready.",
    );
  };

  const handleParse = async () => {
    const data = await callAgent({
      message: nlDraft.trim(),
      session: { ...DEFAULT_SESSION, ...sessionWithForm(), lineItems: [] },
      inventory: inventorySnapshot,
    });
    if (!data) return;
    applyResponseSideEffects(data, handlers);
    setAssistantNote(data.assistantMessage);
    if (data.session.lineItems.length > 0) {
      setLines(data.session.lineItems);
    } else {
      setLines(PARSED_LINE_ITEMS);
    }
  };

  const handleFindSuppliersViaAgent = async () => {
    const session = sessionWithForm();
    const query = buildSupplierSearchQuery(
      session.lineItems,
      undefined,
      "Cairo, Egypt",
    );
    const data = await callAgent({
      message: `Find wholesale suppliers for: ${query}`,
      session: { ...session, status: "awaiting_confirm" },
      inventory: inventorySnapshot,
    });
    if (!data) return;
    applyResponseSideEffects(data, handlers);
    setAssistantNote(data.assistantMessage);
    if (data.session.discoveredSuppliers) {
      setDiscovered(data.session.discoveredSuppliers);
    }
    if (data.session.selectedRfqSupplierIds?.length) {
      setSelectedSupplierIds(data.session.selectedRfqSupplierIds);
    }
  };

  const handleSendRfqs = async () => {
    const session = {
      ...sessionWithForm(),
      selectedRfqSupplierIds:
        selectedSupplierIds.length > 0
          ? selectedSupplierIds
          : ["cairo-dairy", "bean-barrel"],
    };
    const data = await callAgent({
      message: "Send RFQs to suppliers for confirmed line items.",
      confirmAction: "send_rfq",
      session: { ...session, status: "awaiting_confirm" },
      inventory: inventorySnapshot,
    });
    if (!data) return;
    applyResponseSideEffects(data, handlers);
    setAssistantNote(data.assistantMessage);
    router.push(`/app/orders/${session.requestId}`);
  };

  const handleGenerateRecommendation = async () => {
    const session = sessionWithForm();
    const data = await callAgent({
      message: "Generate recommendation from parsed quotes.",
      session,
      inventory: inventorySnapshot,
    });
    if (!data) return;
    applyResponseSideEffects(data, handlers);
    setAssistantNote(data.assistantMessage);
    router.push("/app/quotes");
  };

  const updateLine = (index: number, patch: Partial<LineItem>) => {
    setLines((prev) =>
      prev.map((row, i) => (i === index ? { ...row, ...patch } : row)),
    );
  };

  const removeLine = (index: number) => {
    setLines((prev) => prev.filter((_, i) => i !== index));
  };

  const canSendRfq =
    lines.filter((l) => l.sku && l.name).length > 0 &&
    !agentSession.rfqId &&
    requestStatus !== "approved";

  const quotesReady =
    agentSession.quoteIds.length >= 2 && Boolean(agentSession.comparisonId);

  return (
    <div
      className="mx-auto max-w-6xl min-w-0 space-y-6 overflow-x-hidden"
      data-tour="new-order-workspace"
    >
      <div>
        <p className="text-sm font-medium text-sage">New order</p>
        <h1 className="font-display text-3xl font-semibold text-espresso">
          Structured intake
        </h1>
        <p className="mt-1 font-mono text-sm text-cocoa">
          {agentSession.requestId || ACTIVE_REQUEST_ID}
        </p>
      </div>

      <div className="grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,320px)]">
        <div className="min-w-0 space-y-6 rounded-xl border border-stripe-border bg-linen p-4 card-shadow md:p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-xs font-medium uppercase text-cocoa">
                Primary branch
              </label>
              <Select
                value={branchId}
                onValueChange={(v) => setBranchId(v as BranchId)}
              >
                <SelectTrigger className="border-stripe-border bg-cream">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {BRANCHES.map((b) => (
                    <SelectItem key={b.id} value={b.id}>
                      {b.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium uppercase text-cocoa">
                Need by
              </label>
              <Input
                value={neededBy}
                onChange={(e) => setNeededBy(e.target.value)}
                className="border-stripe-border bg-cream"
              />
            </div>
          </div>

          <div data-tour="line-items">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-display text-lg font-semibold text-espresso">
                Line items
              </h2>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="border-stripe-border"
                onClick={() => setLines((prev) => [...prev, emptyLine(branchId)])}
              >
                <Plus className="mr-1 size-4" />
                Add row
              </Button>
            </div>

            <div className="overflow-x-auto rounded-lg border border-stripe-border">
              <Table>
                <TableHeader>
                  <TableRow className="border-stripe-border hover:bg-transparent">
                    <TableHead className="text-espresso">SKU</TableHead>
                    <TableHead className="text-espresso">Item</TableHead>
                    <TableHead className="text-espresso">Qty</TableHead>
                    <TableHead className="text-espresso">Unit</TableHead>
                    <TableHead className="text-espresso">Branch</TableHead>
                    <TableHead className="w-10" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lines.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="py-8 text-center text-sm text-cocoa"
                      >
                        No lines yet - add rows or use Ask Mr.Bill to parse a
                        restock note.
                      </TableCell>
                    </TableRow>
                  ) : (
                    lines.map((line, idx) => (
                      <TableRow key={idx} className="border-stripe-border">
                        <TableCell>
                          <Input
                            value={line.sku}
                            onChange={(e) =>
                              updateLine(idx, { sku: e.target.value })
                            }
                            className="h-8 font-mono text-xs border-stripe-border bg-cream"
                            placeholder="OAT-1L"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            value={line.name}
                            onChange={(e) =>
                              updateLine(idx, { name: e.target.value })
                            }
                            className="h-8 border-stripe-border bg-cream"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min={1}
                            value={line.qty}
                            onChange={(e) =>
                              updateLine(idx, {
                                qty: Number(e.target.value) || 1,
                              })
                            }
                            className="h-8 w-20 border-stripe-border bg-cream"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            value={line.unit}
                            onChange={(e) =>
                              updateLine(idx, { unit: e.target.value })
                            }
                            className="h-8 w-24 border-stripe-border bg-cream"
                          />
                        </TableCell>
                        <TableCell>
                          <Select
                            value={line.branchId}
                            onValueChange={(v) =>
                              updateLine(idx, { branchId: v as BranchId })
                            }
                          >
                            <SelectTrigger className="h-8 border-stripe-border bg-cream">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {BRANCHES.map((b) => (
                                <SelectItem key={b.id} value={b.id}>
                                  {b.code}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Button
                            type="button"
                            size="icon-sm"
                            variant="ghost"
                            onClick={() => removeLine(idx)}
                            aria-label="Remove line"
                          >
                            <Trash2 className="size-4 text-cocoa" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          <div className="w-full min-w-0 border-t border-stripe-border pt-4">
            <DiscoveredSuppliersPanel
              lineItems={lines.filter((l) => l.sku && l.name)}
              selectedIds={selectedSupplierIds}
              onSelectedIdsChange={(ids) => {
                setSelectedSupplierIds(ids);
                setAgentSession({
                  ...sessionWithForm(),
                  selectedRfqSupplierIds: ids,
                });
              }}
              discovered={discovered}
              onDiscoveredChange={(rows) => {
                setDiscovered(rows);
                setAgentSession({
                  ...sessionWithForm(),
                  discoveredSuppliers: rows,
                });
              }}
              disabled={Boolean(agentSession.rfqId)}
            />
          </div>

          <div className="flex flex-wrap gap-2 border-t border-stripe-border pt-4">
            <Button
              type="button"
              variant="outline"
              className="border-stripe-border"
              disabled={
                lines.filter((l) => l.sku && l.name).length === 0 ||
                loading ||
                Boolean(agentSession.rfqId)
              }
              onClick={() => void handleFindSuppliersViaAgent()}
            >
              Find suppliers (agent)
            </Button>
            <Button
              type="button"
              className="bg-primary text-primary-foreground"
              disabled={!canSendRfq || loading}
              data-tour="send-rfq"
              onClick={() => void handleSendRfqs()}
            >
              {loading ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : (
                <Send className="mr-2 size-4" />
              )}
              Send RFQs
            </Button>
            {quotesReady && requestStatus !== "approved" && (
              <Button
                type="button"
                variant="outline"
                className="border-sage text-sage hover:bg-sage/10"
                disabled={loading}
                onClick={() => void handleGenerateRecommendation()}
              >
                <Wand2 className="mr-2 size-4" />
                Generate recommendation
              </Button>
            )}
            {agentSession.rfqId && (
              <Link
                href={`/app/orders/${agentSession.requestId}`}
                className={cn(buttonVariants({ variant: "outline" }), "border-stripe-border")}
              >
                View order desk
              </Link>
            )}
          </div>
        </div>

        <AskMrBillPanel
          draft={nlDraft}
          onDraftChange={setNlDraft}
          onParse={() => void handleParse()}
          onRunDemoScript={handleRunDemoScript}
          loading={loading}
          lastAssistantNote={assistantNote}
          agentMode={agentMode}
          llmNotice={llmNotice}
          apiError={apiError}
        />
      </div>
    </div>
  );
}
