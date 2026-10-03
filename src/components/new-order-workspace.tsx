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
import { ACTIVE_REQUEST_ID } from "@/lib/agent-tools";
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
    };
  }, [agentSession, lines, neededBy, branchId]);

  const handlers = useMemo(
    () => ({
      setAgentSession,
      setRequestStatus,
      applyInventoryDeltas,
    }),
    [setAgentSession, setRequestStatus, applyInventoryDeltas],
  );

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

  const handleSendRfqs = async () => {
    const session = sessionWithForm();
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
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <p className="text-sm font-medium text-sage">New order</p>
        <h1 className="font-display text-3xl font-semibold text-espresso">
          Structured intake
        </h1>
        <p className="mt-1 font-mono text-sm text-cocoa">
          {agentSession.requestId || ACTIVE_REQUEST_ID}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6 rounded-xl border border-oat bg-linen p-4 card-shadow md:p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-xs font-medium uppercase text-cocoa">
                Primary branch
              </label>
              <Select
                value={branchId}
                onValueChange={(v) => setBranchId(v as BranchId)}
              >
                <SelectTrigger className="border-oat bg-cream">
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
                className="border-oat bg-cream"
              />
            </div>
          </div>

          <div>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-display text-lg font-semibold text-espresso">
                Line items
              </h2>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="border-oat"
                onClick={() => setLines((prev) => [...prev, emptyLine(branchId)])}
              >
                <Plus className="mr-1 size-4" />
                Add row
              </Button>
            </div>

            <div className="overflow-x-auto rounded-lg border border-oat">
              <Table>
                <TableHeader>
                  <TableRow className="border-oat hover:bg-transparent">
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
                        No lines yet — add rows or use Ask Mr.Bill to parse a
                        restock note.
                      </TableCell>
                    </TableRow>
                  ) : (
                    lines.map((line, idx) => (
                      <TableRow key={idx} className="border-oat">
                        <TableCell>
                          <Input
                            value={line.sku}
                            onChange={(e) =>
                              updateLine(idx, { sku: e.target.value })
                            }
                            className="h-8 font-mono text-xs border-oat bg-cream"
                            placeholder="OAT-1L"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            value={line.name}
                            onChange={(e) =>
                              updateLine(idx, { name: e.target.value })
                            }
                            className="h-8 border-oat bg-cream"
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
                            className="h-8 w-20 border-oat bg-cream"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            value={line.unit}
                            onChange={(e) =>
                              updateLine(idx, { unit: e.target.value })
                            }
                            className="h-8 w-24 border-oat bg-cream"
                          />
                        </TableCell>
                        <TableCell>
                          <Select
                            value={line.branchId}
                            onValueChange={(v) =>
                              updateLine(idx, { branchId: v as BranchId })
                            }
                          >
                            <SelectTrigger className="h-8 border-oat bg-cream">
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

          <div className="flex flex-wrap gap-2 border-t border-oat pt-4">
            <Button
              type="button"
              className="bg-espresso text-linen"
              disabled={!canSendRfq || loading}
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
                className={cn(buttonVariants({ variant: "outline" }), "border-oat")}
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
