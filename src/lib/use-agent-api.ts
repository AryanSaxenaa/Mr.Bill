"use client";

import { useCallback, useState } from "react";
import type { AgentSession, AgentUiHints } from "./agent-session";
import type { InventoryDelta } from "./agent-tools";
import type { RequestFlowStatus } from "./app-state";

export interface AgentApiSuccess {
  assistantMessage: string;
  session: AgentSession;
  toolTrace?: { name: string; summary: string }[];
  inventoryDeltas?: InventoryDelta[];
  ui: AgentUiHints;
  mode?: "demo" | "live";
  error?: string;
  code?: string;
  llmFallback?: boolean;
  llmFallbackReason?: string;
  llmRetriedFrom?: string;
  llmProvider?: string;
  mailFallback?: boolean;
  mailFallbackReason?: string;
  deliveryMode?: "agentmail" | "simulated" | "mixed";
}

interface InventorySnapshotRow {
  branchId: string;
  sku: string;
  qty: number;
}

export function useAgentApi() {
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [llmNotice, setLlmNotice] = useState<string | null>(null);
  const [agentMode, setAgentMode] = useState<"demo" | "live" | null>(null);

  const callAgent = useCallback(
    async (payload: {
      message?: string;
      confirmAction?: "send_rfq" | "approve";
      session: AgentSession;
      inventory: InventorySnapshotRow[];
      history?: { role: "user" | "assistant"; content: string }[];
    }): Promise<AgentApiSuccess | null> => {
      setLoading(true);
      setApiError(null);
      try {
        const res = await fetch("/api/agent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: payload.message ?? "",
            confirmAction: payload.confirmAction,
            history: payload.history ?? [],
            session: payload.session,
            inventory: payload.inventory,
          }),
        });

        const text = await res.text();
        let data: AgentApiSuccess;
        try {
          data = JSON.parse(text) as AgentApiSuccess;
        } catch {
          setApiError(
            res.status >= 500
              ? "The order desk hit a server error. Try Send RFQs again; simulated quotes still work if mail is down."
              : `Agent error (${res.status}).`,
          );
          return null;
        }

        if (!res.ok) {
          setApiError(data.error ?? `Agent error (${res.status})`);
          return null;
        }

        if (data.mode) {
          setAgentMode(data.mode);
        }

        if (data.mailFallback) {
          setLlmNotice(
            `mail-fallback:${data.mailFallbackReason ?? "quote inbox unavailable"}`,
          );
        } else if (data.llmFallback) {
          setLlmNotice(
            `demo-fallback:${data.llmFallbackReason ?? "LLM unavailable"}`,
          );
        } else if (
          data.llmRetriedFrom === "openrouter" &&
          data.llmProvider === "deepseek"
        ) {
          setLlmNotice("deepseek-retry:ok");
        } else {
          setLlmNotice(null);
        }

        return data;
      } catch {
        setApiError(
          "Could not reach the order desk. Check your connection and try again.",
        );
        return null;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const applyResponseSideEffects = useCallback(
    (
      data: AgentApiSuccess,
      handlers: {
        setAgentSession: (s: AgentSession) => void;
        setRequestStatus: (s: RequestFlowStatus) => void;
        applyInventoryDeltas?: (
          deltas: InventoryDelta[],
          approvedBy: string,
        ) => void;
      },
    ) => {
      handlers.setAgentSession(data.session);

      if (data.session.status === "rfq_sent" || data.session.rfqId) {
        handlers.setRequestStatus("rfq_sent");
      }
      if (data.session.status === "quotes_ready" || data.session.comparisonId) {
        handlers.setRequestStatus("quotes_parsed");
      }
      if (data.session.status === "awaiting_confirm") {
        handlers.setRequestStatus("confirmed");
      }

      if (data.inventoryDeltas?.length && handlers.applyInventoryDeltas) {
        handlers.applyInventoryDeltas(data.inventoryDeltas, "Layla");
        handlers.setRequestStatus("approved");
      }
    },
    [],
  );

  return {
    loading,
    apiError,
    llmNotice,
    agentMode,
    setAgentMode,
    callAgent,
    applyResponseSideEffects,
  };
}
