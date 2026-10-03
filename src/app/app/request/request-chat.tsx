"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CompareTable } from "@/components/compare-table";
import {
  DEMO_INTAKE_TEXT,
  MOCK_QUOTE_REPLIES,
  PARSED_LINE_ITEMS,
  branchName,
  supplierName,
} from "@/lib/mock-data";
import {
  sendRfq,
  parseQuoteReply,
  recommend,
  updateInventory,
  ACTIVE_REQUEST_ID,
} from "@/lib/agent-tools";
import { useAppState } from "@/lib/app-state";
import { Check, Send } from "lucide-react";

type MessageRole = "user" | "assistant";

interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  rich?: "confirm" | "compare" | "recommend";
}

export function RequestChat() {
  const searchParams = useSearchParams();
  const { setRequestStatus, applyInventoryApproval, inventory, requestStatus } =
    useAppState();
  const [input, setInput] = useState(DEMO_INTAKE_TEXT);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Here’s what I heard — describe what each branch needs and I’ll structure it before we RFQ suppliers.",
    },
  ]);
  const [step, setStep] = useState<
    "intake" | "confirm" | "rfq" | "parse" | "compare" | "done"
  >("intake");

  const append = useCallback((msg: Omit<ChatMessage, "id">) => {
    setMessages((prev) => [...prev, { ...msg, id: `m-${prev.length}` }]);
  }, []);

  const handleApprove = useCallback(() => {
    const rec = recommend({
      requestId: ACTIVE_REQUEST_ID,
      comparisonId: `CMP-${ACTIVE_REQUEST_ID}`,
    });
    const result = updateInventory(
      {
        requestId: ACTIVE_REQUEST_ID,
        recommendationId: rec.recommendationId,
        approvedBy: "Layla",
      },
      inventory.map((r) => ({
        branchId: r.branchId,
        sku: r.sku,
        qty: r.qty,
      })),
    );
    applyInventoryApproval("Layla");
    append({
      role: "assistant",
      content: `Approved. Updated ${result.inventoryDeltas.length} inventory rows. Audit ${result.auditLogId}.`,
    });
    setStep("done");
  }, [append, applyInventoryApproval, inventory]);

  const handleSendIntake = () => {
    if (!input.trim()) return;
    append({ role: "user", content: input.trim() });
    append({
      role: "assistant",
      content:
        "Got it. I split this by branch — confirm before I contact Cairo Dairy Co. and Bean & Barrel.",
      rich: "confirm",
    });
    setStep("confirm");
    setRequestStatus("confirmed");
    setInput("");
  };

  const handleConfirm = () => {
    const rfq = sendRfq({
      requestId: ACTIVE_REQUEST_ID,
      supplierIds: ["cairo-dairy", "bean-barrel"],
      lineItems: PARSED_LINE_ITEMS,
      deliveryBranch: "Maadi",
      neededBy: "Friday",
    });
    append({
      role: "assistant",
      content: `RFQ ${rfq.rfqId} drafted and sent (simulated) to ${rfq.messages
        .map((m) => supplierName(m.supplierId))
        .join(" and ")}. Status: Sent.`,
    });
    setStep("rfq");
    setRequestStatus("rfq_sent");
  };

  const handleParseQuotes = () => {
    for (const supplierId of ["cairo-dairy", "bean-barrel"] as const) {
      const parsed = parseQuoteReply({
        rfqId: "RFQ-2026-0042",
        supplierId,
        rawText: MOCK_QUOTE_REPLIES[supplierId],
      });
      append({
        role: "assistant",
        content: `Parsed reply from ${supplierName(supplierId)} → ${parsed.quoteId} (${parsed.lines.length} lines, valid until ${parsed.validUntil}).`,
      });
    }
    append({
      role: "assistant",
      content:
        "Side-by-side comparison — best landed unit cost highlighted in sage.",
      rich: "compare",
    });
    const rec = recommend({
      requestId: ACTIVE_REQUEST_ID,
      comparisonId: `CMP-${ACTIVE_REQUEST_ID}`,
    });
    append({
      role: "assistant",
      content: rec.summary,
      rich: "recommend",
    });
    setStep("compare");
    setRequestStatus("quotes_parsed");
  };

  useEffect(() => {
    if (searchParams.get("step") === "approve" && step === "compare") {
      handleApprove();
    }
  }, [searchParams, step, handleApprove]);

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <div>
        <h1 className="font-display text-3xl font-semibold text-espresso">
          New request
        </h1>
        <p className="mt-1 font-mono text-sm text-cocoa">{ACTIVE_REQUEST_ID}</p>
      </div>

      <div className="flex min-h-[480px] flex-col rounded-xl border border-oat bg-linen card-shadow">
        <ScrollArea className="flex-1 p-4 md:p-6">
          <div className="space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  "max-w-[92%] rounded-xl px-4 py-3 text-sm",
                  msg.role === "user"
                    ? "ml-auto bg-terracotta/15 text-espresso"
                    : "border-l-4 border-sage bg-cream text-cocoa",
                )}
              >
                <p className="whitespace-pre-wrap">{msg.content}</p>

                {msg.rich === "confirm" && (
                  <div className="mt-4 space-y-2 rounded-lg border border-oat bg-linen p-3">
                    <p className="text-xs font-medium uppercase text-cocoa">
                      Line items
                    </p>
                    <ul className="space-y-1 text-espresso">
                      {PARSED_LINE_ITEMS.map((l) => (
                        <li key={`${l.branchId}-${l.sku}`}>
                          {l.name} × {l.qty} {l.unit} ·{" "}
                          {branchName(l.branchId)}
                        </li>
                      ))}
                    </ul>
                    {step === "confirm" && (
                      <Button
                        size="sm"
                        className="mt-2 bg-espresso text-linen"
                        onClick={handleConfirm}
                      >
                        <Check className="mr-1 size-4" />
                        Confirm &amp; send RFQ
                      </Button>
                    )}
                  </div>
                )}

                {msg.rich === "compare" && (
                  <div className="mt-4">
                    <CompareTable />
                  </div>
                )}

                {msg.rich === "recommend" && step !== "done" && (
                  <Button
                    size="sm"
                    className="mt-3 bg-terracotta text-linen hover:bg-terracotta/90"
                    onClick={handleApprove}
                  >
                    Approve recommendation
                  </Button>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="border-t border-oat p-4">
          {step === "intake" && (
            <div className="flex flex-col gap-3 sm:flex-row">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="min-h-[80px] border-oat bg-cream"
                placeholder="Describe branch restock needs…"
              />
              <Button
                className="shrink-0 bg-espresso text-linen"
                onClick={handleSendIntake}
              >
                <Send className="mr-1 size-4" />
                Send
              </Button>
            </div>
          )}
          {step === "rfq" && (
            <Button
              className="w-full bg-espresso text-linen sm:w-auto"
              onClick={handleParseQuotes}
            >
              Paste supplier replies (demo)
            </Button>
          )}
          {step === "done" && (
            <div className="flex flex-wrap gap-2">
              <Link
                href="/app/inventory"
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "border-oat",
                )}
              >
                View inventory
              </Link>
              <Link
                href="/app/quotes"
                className={cn(buttonVariants(), "bg-sage text-linen")}
              >
                Quotes tab
              </Link>
            </div>
          )}
          {requestStatus === "approved" && step !== "done" && (
            <p className="text-sm text-sage">This request is already approved.</p>
          )}
        </div>
      </div>
    </div>
  );
}
