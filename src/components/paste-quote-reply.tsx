"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MOCK_QUOTE_REPLIES, SUPPLIERS, supplierName } from "@/lib/mock-data";
import { useAppState } from "@/lib/app-state";
import type { AgentSession, AgentUiHints } from "@/lib/agent-session";
import { Loader2 } from "lucide-react";

interface ParseQuoteResponse {
  assistantMessage: string;
  session: AgentSession;
  ui: AgentUiHints;
  error?: string;
}

export function PasteQuoteReply() {
  const {
    agentSession,
    setAgentSession,
    setRequestStatus,
    inventory,
  } = useAppState();
  const [supplierId, setSupplierId] = useState("cairo-dairy");
  const [rawText, setRawText] = useState(
    MOCK_QUOTE_REPLIES["cairo-dairy"] ?? "",
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const canParse = Boolean(agentSession.rfqId) || agentSession.quoteIds.length > 0;

  const handleParse = async () => {
    if (!rawText.trim() || loading) return;
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: "Parse pasted supplier reply",
          parseQuote: { supplierId, rawText: rawText.trim() },
          session: agentSession,
          inventory: inventory.map((r) => ({
            branchId: r.branchId,
            sku: r.sku,
            qty: r.qty,
          })),
        }),
      });
      const data = (await res.json()) as ParseQuoteResponse & { error?: string };
      if (!res.ok) {
        setError(data.error ?? `Parse failed (${res.status})`);
        return;
      }
      setAgentSession(data.session);
      if (data.session.comparisonId) {
        setRequestStatus("quotes_parsed");
      } else if (data.session.rfqId) {
        setRequestStatus("rfq_sent");
      }
      setSuccess(data.assistantMessage);
    } catch {
      setError("Could not reach the agent API.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="card-shadow border-stripe-border bg-linen">
      <CardHeader>
        <CardTitle className="font-display text-lg text-espresso">
          Paste supplier reply
        </CardTitle>
        <p className="text-sm text-cocoa">
          Drop an email or WhatsApp quote - Mr.Bill runs{" "}
          <span className="font-mono text-xs">parse_quote_reply</span> and
          refreshes comparison when both quotes are in.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {!canParse && (
          <p className="rounded-lg border border-stripe-border bg-cream px-3 py-2 text-sm text-cocoa">
            Send an RFQ from{" "}
            <span className="font-medium text-espresso">New request</span> first
            so replies link to your RFQ id.
          </p>
        )}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Select
            value={supplierId}
            onValueChange={(v) => {
              if (!v) return;
              setSupplierId(v);
              setRawText(MOCK_QUOTE_REPLIES[v] ?? "");
            }}
          >
            <SelectTrigger className="w-full border-stripe-border bg-cream sm:w-56">
              <SelectValue placeholder="Supplier" />
            </SelectTrigger>
            <SelectContent>
              {SUPPLIERS.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            type="button"
            className="bg-primary text-primary-foreground"
            disabled={loading || !rawText.trim() || !canParse}
            onClick={() => void handleParse()}
          >
            {loading ? (
              <Loader2 className="mr-1 size-4 animate-spin" />
            ) : null}
            Parse reply
          </Button>
        </div>
        <Textarea
          value={rawText}
          onChange={(e) => setRawText(e.target.value)}
          className="min-h-[140px] border-stripe-border bg-cream font-mono text-xs"
          placeholder="Paste supplier pricing reply…"
          disabled={loading}
        />
        {error && (
          <p className="text-sm text-terracotta" role="alert">
            {error}
          </p>
        )}
        {success && (
          <p className="text-sm text-sage">{success}</p>
        )}
        <p className="text-xs text-cocoa">
          Tip: sample text for {supplierName(supplierId)} is pre-filled for the
          judge demo - edit or paste your own.
        </p>
      </CardContent>
    </Card>
  );
}
