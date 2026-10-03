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
  branchName,
  type LineItem,
} from "@/lib/mock-data";
import { ACTIVE_REQUEST_ID } from "@/lib/agent-tools";
import { useAppState } from "@/lib/app-state";
import {
  DEFAULT_SESSION,
  type AgentSession,
  type AgentUiHints,
} from "@/lib/agent-session";
import type { InventoryDelta } from "@/lib/agent-tools";
import { Check, Loader2, Play, Send } from "lucide-react";

type MessageRole = "user" | "assistant";

interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  rich?: "confirm" | "compare" | "recommend";
}

interface AgentApiSuccess {
  assistantMessage: string;
  session: AgentSession;
  toolTrace?: { name: string; summary: string }[];
  inventoryDeltas?: InventoryDelta[];
  ui: AgentUiHints;
  mode?: "demo" | "live";
  error?: string;
  code?: string;
}

export function RequestChat() {
  const searchParams = useSearchParams();
  const {
    setRequestStatus,
    applyInventoryDeltas,
    inventory,
    requestStatus,
    agentSession,
    setAgentSession,
  } = useAppState();
  const [input, setInput] = useState(DEMO_INTAKE_TEXT);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Describe what each branch needs — I’ll structure line items and confirm before we RFQ Cairo suppliers.",
    },
  ]);
  const [ui, setUi] = useState<AgentUiHints>({
    showLineItemsConfirm: false,
    showCompareTable: false,
    showApproveButton: false,
  });
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [agentMode, setAgentMode] = useState<"demo" | "live" | null>(null);
  const [step, setStep] = useState<"active" | "done">(
    requestStatus === "approved" ? "done" : "active",
  );

  useEffect(() => {
    void fetch("/api/agent/config")
      .then((r) => r.json())
      .then((data: { liveAgent: boolean }) => {
        setAgentMode(data.liveAgent ? "live" : "demo");
      })
      .catch(() => setAgentMode("demo"));
  }, []);

  useEffect(() => {
    if (agentSession.lineItems.length > 0 || agentSession.rfqId) {
      setUi({
        showLineItemsConfirm:
          agentSession.lineItems.length > 0 &&
          !agentSession.rfqId &&
          agentSession.status === "awaiting_confirm",
        showCompareTable:
          agentSession.quoteIds.length >= 2 &&
          Boolean(agentSession.comparisonId),
        showApproveButton:
          Boolean(agentSession.recommendation) &&
          agentSession.status === "recommended",
      });
    }
  }, [agentSession]);

  const append = useCallback((msg: Omit<ChatMessage, "id">) => {
    setMessages((prev) => [...prev, { ...msg, id: `m-${prev.length}-${Date.now()}` }]);
  }, []);

  const inventorySnapshot = useCallback(
    () =>
      inventory.map((r) => ({
        branchId: r.branchId,
        sku: r.sku,
        qty: r.qty,
      })),
    [inventory],
  );

  const applyAgentResponse = useCallback(
    (data: AgentApiSuccess) => {
      setAgentSession(data.session);
      setUi(data.ui);
      if (data.mode) {
        setAgentMode(data.mode);
      }

      if (data.session.status === "rfq_sent" || data.session.rfqId) {
        setRequestStatus("rfq_sent");
      }
      if (data.session.status === "quotes_ready" || data.session.comparisonId) {
        setRequestStatus("quotes_parsed");
      }
      if (data.session.status === "awaiting_confirm") {
        setRequestStatus("confirmed");
      }

      const richCompare =
        data.ui.showCompareTable || Boolean(data.session.comparisonId);
      const richRecommend = Boolean(data.session.recommendation);

      append({
        role: "assistant",
        content: data.assistantMessage,
        rich: richRecommend
          ? "recommend"
          : richCompare
            ? "compare"
            : data.ui.showLineItemsConfirm
              ? "confirm"
              : undefined,
      });

      if (data.inventoryDeltas?.length) {
        applyInventoryDeltas(data.inventoryDeltas, "Layla");
        setStep("done");
        setRequestStatus("approved");
      }
    },
    [append, applyInventoryDeltas, setAgentSession, setRequestStatus],
  );

  const callAgent = useCallback(
    async (payload: {
      message?: string;
      confirmAction?: "send_rfq" | "approve";
    }) => {
      setLoading(true);
      setApiError(null);
      const history = messages
        .filter((m) => m.id !== "welcome")
        .map((m) => ({ role: m.role, content: m.content }));

      try {
        const res = await fetch("/api/agent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: payload.message ?? "",
            confirmAction: payload.confirmAction,
            history,
            session: agentSession,
            inventory: inventorySnapshot(),
          }),
        });

        const data = (await res.json()) as AgentApiSuccess & {
          error?: string;
          code?: string;
        };

        if (!res.ok) {
          setApiError(data.error ?? `Agent error (${res.status})`);
          return;
        }

        applyAgentResponse(data);
      } catch {
        setApiError("Could not reach the agent API. Is the dev server running?");
      } finally {
        setLoading(false);
      }
    },
    [
      agentSession,
      applyAgentResponse,
      inventorySnapshot,
      messages,
    ],
  );

  const handleSendIntake = () => {
    if (!input.trim() || loading) return;
    append({ role: "user", content: input.trim() });
    const text = input.trim();
    setInput("");
    void callAgent({ message: text });
  };

  const handleConfirm = () => {
    void callAgent({ message: "Confirm — send RFQs to suppliers.", confirmAction: "send_rfq" });
  };

  const handleApprove = useCallback(() => {
    void callAgent({ message: "Approve the recommendation.", confirmAction: "approve" });
  }, [callAgent]);

  const runDemoScript = useCallback(async () => {
    if (loading) return;
    setMessages([
      {
        id: "welcome",
        role: "assistant",
        content:
          "Describe what each branch needs — I’ll structure line items and confirm before we RFQ Cairo suppliers.",
      },
    ]);
    setAgentSession({ ...DEFAULT_SESSION });
    setStep("active");
    setRequestStatus("idle");

    append({ role: "user", content: DEMO_INTAKE_TEXT });
    setLoading(true);
    setApiError(null);
    try {
      const intakeRes = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: DEMO_INTAKE_TEXT,
          history: [],
          session: DEFAULT_SESSION,
          inventory: inventorySnapshot(),
        }),
      });
      const intakeData = (await intakeRes.json()) as AgentApiSuccess;
      if (!intakeRes.ok) {
        setApiError(intakeData.error ?? "Demo script failed at intake");
        return;
      }
      applyAgentResponse(intakeData);

      const confirmRes = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: "Confirm — send RFQs to suppliers.",
          confirmAction: "send_rfq",
          history: [
            { role: "user", content: DEMO_INTAKE_TEXT },
            { role: "assistant", content: intakeData.assistantMessage },
          ],
          session: intakeData.session,
          inventory: inventorySnapshot(),
        }),
      });
      const confirmData = (await confirmRes.json()) as AgentApiSuccess;
      if (!confirmRes.ok) {
        setApiError(confirmData.error ?? "Demo script failed at RFQ");
        return;
      }
      applyAgentResponse(confirmData);
    } catch {
      setApiError("Could not run demo script.");
    } finally {
      setLoading(false);
    }
  }, [
    append,
    applyAgentResponse,
    inventorySnapshot,
    loading,
    setAgentSession,
    setRequestStatus,
  ]);

  useEffect(() => {
    if (searchParams.get("step") === "approve" && ui.showApproveButton) {
      handleApprove();
    }
  }, [searchParams, ui.showApproveButton, handleApprove]);

  const lineItems: LineItem[] =
    agentSession.lineItems.length > 0 ? agentSession.lineItems : [];

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <div>
        <h1 className="font-display text-3xl font-semibold text-espresso">
          New request
        </h1>
        <p className="mt-1 font-mono text-sm text-cocoa">
          {agentSession.requestId || ACTIVE_REQUEST_ID}
        </p>
      </div>

      {agentMode === "demo" && (
        <div className="flex flex-col gap-3 rounded-lg border border-sage/40 bg-sage/10 px-4 py-3 text-sm text-espresso sm:flex-row sm:items-center sm:justify-between">
          <p>
            <span className="font-medium">Demo mode</span> — no OpenAI key
            detected. The scripted Layla flow uses the same tool path as the
            judge script; add <code className="font-mono text-xs">OPENAI_API_KEY</code>{" "}
            for a live LLM loop.
          </p>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="shrink-0 border-sage bg-linen"
            onClick={() => void runDemoScript()}
            disabled={loading}
          >
            <Play className="mr-1 size-4" />
            Run demo script
          </Button>
        </div>
      )}

      {apiError && (
        <div
          className="rounded-lg border border-terracotta/40 bg-terracotta/10 px-4 py-3 text-sm text-espresso"
          role="alert"
        >
          {apiError}
        </div>
      )}

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

                {msg.rich === "confirm" && lineItems.length > 0 && (
                  <div className="mt-4 space-y-2 rounded-lg border border-oat bg-linen p-3">
                    <p className="text-xs font-medium uppercase text-cocoa">
                      Line items
                    </p>
                    <ul className="space-y-1 text-espresso">
                      {lineItems.map((l) => (
                        <li key={`${l.branchId}-${l.sku}`}>
                          {l.name} × {l.qty} {l.unit} ·{" "}
                          {branchName(l.branchId)}
                        </li>
                      ))}
                    </ul>
                    {ui.showLineItemsConfirm && step === "active" && (
                      <Button
                        size="sm"
                        className="mt-2 bg-espresso text-linen"
                        onClick={handleConfirm}
                        disabled={loading}
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

                {msg.rich === "recommend" &&
                  ui.showApproveButton &&
                  step !== "done" && (
                    <Button
                      size="sm"
                      className="mt-3 bg-terracotta text-linen hover:bg-terracotta/90"
                      onClick={handleApprove}
                      disabled={loading}
                    >
                      Approve recommendation
                    </Button>
                  )}
              </div>
            ))}
            {loading && (
              <div className="flex items-center gap-2 text-sm text-cocoa">
                <Loader2 className="size-4 animate-spin" />
                Mr.Bill is thinking…
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="border-t border-oat p-4">
          {step === "active" && (
            <div className="flex flex-col gap-3 sm:flex-row">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="min-h-[80px] border-oat bg-cream"
                placeholder="Describe branch restock needs…"
                disabled={loading}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                    handleSendIntake();
                  }
                }}
              />
              <Button
                className="shrink-0 bg-espresso text-linen"
                onClick={handleSendIntake}
                disabled={loading || !input.trim()}
              >
                <Send className="mr-1 size-4" />
                Send
              </Button>
            </div>
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
