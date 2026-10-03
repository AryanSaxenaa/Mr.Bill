import { parseQuoteReply, type ParseQuoteReplyOutput } from "./agent-tools";
import { SUPPLIERS, supplierName } from "./mock-data";

export interface StoredInboundMessage {
  messageId: string;
  inboxId: string;
  subject: string;
  from: string;
  preview: string;
  text: string;
  receivedAt: string;
  supplierId?: string;
  rfqId?: string;
}

const inboundById = new Map<string, StoredInboundMessage>();
const processedMessageIds = new Set<string>();

export function storeInboundFromWebhook(payload: {
  message?: {
    message_id?: string;
    messageId?: string;
    inbox_id?: string;
    inboxId?: string;
    subject?: string;
    from_?: string[];
    from?: string[];
    preview?: string;
    text?: string;
    timestamp?: string;
    created_at?: string;
  };
}): StoredInboundMessage | null {
  const msg = payload.message;
  if (!msg) return null;

  const messageId = msg.message_id ?? msg.messageId;
  const inboxId = msg.inbox_id ?? msg.inboxId;
  if (!messageId || !inboxId) return null;

  const fromList = msg.from_ ?? msg.from ?? [];
  const from = fromList[0] ?? "unknown";
  const subject = msg.subject ?? "";
  const text = msg.text ?? msg.preview ?? "";
  const receivedAt =
    msg.timestamp ?? msg.created_at ?? new Date().toISOString();

  const supplierId = inferSupplierIdFromSubject(subject);
  const rfqId = inferRfqIdFromSubject(subject);

  const stored: StoredInboundMessage = {
    messageId,
    inboxId,
    subject,
    from,
    preview: msg.preview ?? text.slice(0, 200),
    text,
    receivedAt,
    supplierId: supplierId ?? inferSupplierIdFromSubject(subject),
    rfqId: rfqId ?? inferRfqIdFromSubject(subject),
  };

  inboundById.set(messageId, stored);
  return stored;
}

export function listStoredInbound(limit = 30): StoredInboundMessage[] {
  return [...inboundById.values()]
    .sort((a, b) => b.receivedAt.localeCompare(a.receivedAt))
    .slice(0, limit);
}

export function inferSupplierIdFromSubject(subject: string): string | undefined {
  const match = subject.match(/\[Supplier:\s*([^\]]+)\]/i);
  if (!match) return undefined;
  const label = match[1].trim().toLowerCase();
  const found = SUPPLIERS.find(
    (s) =>
      s.name.toLowerCase() === label ||
      s.id.toLowerCase() === label.replace(/\s+/g, "-"),
  );
  return found?.id;
}

export function inferRfqIdFromSubject(subject: string): string | undefined {
  const match = subject.match(/RFQ[-\s]([A-Z0-9-]+)/i);
  return match ? `RFQ-${match[1].replace(/^RFQ-/i, "")}` : undefined;
}

export interface SyncParseResult {
  messageId: string;
  supplierId: string;
  parsed: ParseQuoteReplyOutput;
  alreadyProcessed: boolean;
}

export function parseInboundForRfq(
  message: StoredInboundMessage,
  fallbackRfqId: string,
): SyncParseResult | null {
  const supplierId =
    message.supplierId ??
    inferSupplierIdFromSubject(message.subject) ??
    "cairo-dairy";
  const rfqId = message.rfqId ?? inferRfqIdFromSubject(message.subject) ?? fallbackRfqId;
  const rawText = message.text.trim();
  if (!rawText) return null;

  const alreadyProcessed = processedMessageIds.has(message.messageId);
  if (!alreadyProcessed) {
    processedMessageIds.add(message.messageId);
  }

  try {
    const parsed = parseQuoteReply({
      rfqId,
      supplierId,
      rawText,
    });
    return { messageId: message.messageId, supplierId, parsed, alreadyProcessed };
  } catch {
    return null;
  }
}

export function mergeWebhookAndListed(
  listed: StoredInboundMessage[],
): StoredInboundMessage[] {
  for (const m of listed) {
    if (!inboundById.has(m.messageId)) {
      inboundById.set(m.messageId, m);
    }
  }
  return listStoredInbound();
}
