"use client";

import { useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAppState } from "@/lib/app-state";
import { resolveSupplierDisplayName } from "@/lib/serpapi";
import type { StoredInboundMessage } from "@/lib/agentmail-inbound";
import { FileText, Loader2, RefreshCw } from "lucide-react";

export function RfqMailPanel() {
  const {
    agentSession,
    setAgentSession,
    setRequestStatus,
    inventory,
  } = useAppState();
  const [syncLoading, setSyncLoading] = useState(false);
  const [inboundLoading, setInboundLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inbound, setInbound] = useState<StoredInboundMessage[]>([]);

  const rfqId = agentSession.rfqId;
  const deliveries = agentSession.rfqEmailDeliveries ?? [];
  const messages = agentSession.rfqMessages ?? [];
  const discovered = agentSession.discoveredSuppliers ?? [];

  const loadInbound = useCallback(async () => {
    if (!rfqId) return;
    setInboundLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/agentmail/thread", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rfqId,
          requestId: agentSession.requestId,
        }),
      });
      const data = (await res.json()) as {
        error?: string;
        inbound?: StoredInboundMessage[];
      };
      if (!res.ok) {
        setError(data.error ?? "Could not load replies");
        return;
      }
      setInbound(data.inbound ?? []);
    } catch {
      setError("Could not load quote-inbox replies");
    } finally {
      setInboundLoading(false);
    }
  }, [agentSession.requestId, rfqId]);

  useEffect(() => {
    void loadInbound();
  }, [loadInbound]);

  const handleSync = useCallback(async () => {
    setSyncLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/agentmail/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session: agentSession,
          inventory: inventory.map((r) => ({
            branchId: r.branchId,
            sku: r.sku,
            qty: r.qty,
          })),
        }),
      });
      const data = (await res.json()) as {
        error?: string;
        session?: typeof agentSession;
      };
      if (!res.ok) {
        setError(data.error ?? "Sync failed");
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
      await loadInbound();
    } catch {
      setError("Could not reach sync API");
    } finally {
      setSyncLoading(false);
    }
  }, [agentSession, inventory, loadInbound, setAgentSession, setRequestStatus]);

  if (!rfqId || (messages.length === 0 && deliveries.length === 0)) {
    return null;
  }

  const liveCount = deliveries.filter((d) => d.mode === "agentmail").length;

  return (
    <Card className="border-stripe-border bg-linen card-shadow">
      <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3">
        <div>
          <CardTitle className="flex items-center gap-2 font-display text-lg text-espresso">
            <FileText className="size-5 text-sage" />
            Quote inbox
          </CardTitle>
          <p className="text-sm text-cocoa">
            {liveCount > 0
              ? `${liveCount} live RFQ${liveCount === 1 ? "" : "s"} sent. Message ids and bodies below.`
              : "Simulated RFQs for this environment. Live send runs when the quote inbox is connected."}
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          className="border-stripe-border"
          disabled={syncLoading || inboundLoading}
          onClick={() => void handleSync()}
        >
          {syncLoading || inboundLoading ? (
            <Loader2 className="mr-2 size-4 animate-spin" />
          ) : (
            <RefreshCw className="mr-2 size-4" />
          )}
          Sync supplier replies
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <p className="text-sm text-terracotta" role="alert">
            {error}
          </p>
        )}

        <div className="space-y-3">
          <p className="text-xs font-medium uppercase tracking-wide text-cocoa">
            Outbound
          </p>
          {(messages.length > 0 ? messages : deliveries.map((d) => ({
            supplierId: d.supplierId,
            body: "",
          }))).map((msg) => {
            const delivery = deliveries.find(
              (d) => d.supplierId === msg.supplierId,
            );
            const live = delivery?.mode === "agentmail";
            return (
              <div
                key={msg.supplierId}
                className="rounded-lg border border-stripe-border bg-cream"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stripe-border px-3 py-2">
                  <p className="text-sm font-medium text-espresso">
                    {resolveSupplierDisplayName(msg.supplierId, discovered)}
                  </p>
                  <span
                    className={
                      live
                        ? "rounded-full bg-sage/15 px-2 py-0.5 text-[11px] font-medium text-sage"
                        : "rounded-full bg-oat px-2 py-0.5 text-[11px] font-medium text-cocoa"
                    }
                  >
                    {live ? "Sent" : "Simulated"}
                  </span>
                </div>
                <dl className="grid gap-1 border-b border-stripe-border px-3 py-2 text-xs text-cocoa sm:grid-cols-[7rem_1fr]">
                  <dt>To</dt>
                  <dd className="font-mono text-espresso">
                    {delivery?.to ? (
                      <a
                        href={`mailto:${delivery.to}`}
                        className="text-indigo-accent underline-offset-2 hover:underline"
                      >
                        {delivery.to}
                      </a>
                    ) : (
                      "-"
                    )}
                  </dd>
                  <dt>Subject</dt>
                  <dd className="text-espresso">{delivery?.subject ?? "RFQ"}</dd>
                  <dt>Message id</dt>
                  <dd className="break-all font-mono text-espresso">
                    {delivery?.messageId ?? "-"}
                  </dd>
                  {delivery?.from ? (
                    <>
                      <dt>From</dt>
                      <dd className="font-mono">{delivery.from}</dd>
                    </>
                  ) : null}
                </dl>
                {msg.body ? (
                  <pre className="max-h-48 overflow-auto whitespace-pre-wrap p-3 font-mono text-xs leading-relaxed text-cocoa">
                    {msg.body}
                  </pre>
                ) : null}
              </div>
            );
          })}
        </div>

        <div className="space-y-3">
          <p className="text-xs font-medium uppercase tracking-wide text-cocoa">
            Inbound replies
          </p>
          {inbound.length === 0 ? (
            <p className="text-sm text-cocoa">
              No replies matched this RFQ yet. Sync after suppliers respond, or
              paste a reply on the quote desk.
            </p>
          ) : (
            inbound.map((msg) => (
              <div
                key={msg.messageId}
                className="rounded-lg border border-stripe-border bg-cream px-3 py-2"
              >
                <p className="text-sm font-medium text-espresso">{msg.subject}</p>
                <p className="font-mono text-xs text-cocoa">
                  {msg.from} · {msg.receivedAt}
                </p>
                <p className="mt-2 whitespace-pre-wrap text-sm text-cocoa">
                  {msg.text || msg.preview}
                </p>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
