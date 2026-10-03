import { executeAgentTool } from "./agent-executor";
import type { AgentSession } from "./agent-session";
import { listInboundMessages, hasAgentMailConfig } from "./agentmail";
import {
  listStoredInbound,
  mergeWebhookAndListed,
  parseInboundForRfq,
  type StoredInboundMessage,
} from "./agentmail-inbound";

function mapListedMessage(
  msg: {
    messageId?: string;
    inboxId?: string;
    subject?: string;
    from?: string | string[];
    from_?: string[];
    preview?: string;
    text?: string;
    extractedText?: string;
    timestamp?: string | Date;
    createdAt?: string | Date;
  },
  inboxId: string,
): StoredInboundMessage | null {
  const messageId = msg.messageId;
  if (!messageId) return null;
  const fromRaw = msg.from ?? msg.from_;
  const fromList = Array.isArray(fromRaw)
    ? fromRaw
    : fromRaw
      ? [fromRaw]
      : [];
  const text = msg.extractedText ?? msg.text ?? msg.preview ?? "";
  return {
    messageId,
    inboxId: msg.inboxId ?? inboxId,
    subject: msg.subject ?? "",
    from: fromList[0] ?? "unknown",
    preview: msg.preview ?? text.slice(0, 200),
    text,
    receivedAt:
      (msg.timestamp instanceof Date
        ? msg.timestamp.toISOString()
        : msg.timestamp) ??
      (msg.createdAt instanceof Date
        ? msg.createdAt.toISOString()
        : msg.createdAt) ??
      new Date().toISOString(),
  };
}

export async function syncSupplierReplies(
  session: AgentSession,
  inventory: { branchId: string; sku: string; qty: number }[],
): Promise<{
  session: AgentSession;
  messages: StoredInboundMessage[];
  toolTrace: { name: string; summary: string }[];
  inboxId?: string;
  agentMailEnabled: boolean;
}> {
  const toolTrace: { name: string; summary: string }[] = [];
  let next = { ...session, quoteIds: [...session.quoteIds] };

  if (!hasAgentMailConfig()) {
    return {
      session: next,
      messages: listStoredInbound(),
      toolTrace,
      agentMailEnabled: false,
    };
  }

  const { inboxId, messages: remote } = await listInboundMessages(25);
  const listed = remote
    .map((m) => mapListedMessage(m, inboxId))
    .filter((m): m is StoredInboundMessage => m !== null);
  const merged = mergeWebhookAndListed(listed);

  const inboundOnly = merged.filter((m) => {
    const labels = (m as { labels?: string[] }).labels;
    return !labels?.includes("sent");
  });

  const toProcess =
    inboundOnly.length > 0
      ? inboundOnly
      : merged.filter((m) => !m.from.includes(inboxId));

  const fallbackRfqId = next.rfqId ?? next.requestId;

  for (const message of toProcess) {
    const parsedResult = parseInboundForRfq(message, fallbackRfqId);
    if (!parsedResult || parsedResult.alreadyProcessed) continue;

    const { session: s1, result } = await executeAgentTool(
      "parse_quote_reply",
      {
        rfq_id: fallbackRfqId,
        supplier_id: parsedResult.supplierId,
        raw_text: message.text,
      },
      next,
      inventory,
    );
    next = s1;
    toolTrace.push({ name: result.name, summary: result.summary });
  }

  if (next.quoteIds.length >= 2 && !next.comparisonId) {
    const { session: s2, result: cmp } = await executeAgentTool(
      "compare_quotes",
      {
        request_id: next.requestId,
        quote_ids: next.quoteIds,
      },
      next,
      inventory,
    );
    next = s2;
    toolTrace.push({ name: cmp.name, summary: cmp.summary });

    const { session: s3, result: rec } = await executeAgentTool(
      "recommend",
      {
        request_id: next.requestId,
        comparison_id: next.comparisonId,
      },
      next,
      inventory,
    );
    next = s3;
    toolTrace.push({ name: rec.name, summary: rec.summary });
  }

  return {
    session: next,
    messages: merged,
    toolTrace,
    inboxId,
    agentMailEnabled: true,
  };
}
