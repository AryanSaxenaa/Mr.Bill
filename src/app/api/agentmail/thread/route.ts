import { NextResponse } from "next/server";
import { hasAgentMailConfig, listInboundMessages } from "@/lib/agentmail";
import {
  listStoredInbound,
  mergeWebhookAndListed,
  type StoredInboundMessage,
} from "@/lib/agentmail-inbound";

interface ThreadBody {
  rfqId?: string;
  requestId?: string;
}

interface RemoteInboxMessage {
  messageId?: string;
  inboxId?: string;
  subject?: string;
  from?: string | string[];
  from_?: string | string[];
  preview?: string;
  text?: string;
  extractedText?: string;
  timestamp?: string | Date;
  createdAt?: string | Date;
}

function fromList(raw: string | string[] | undefined): string {
  if (Array.isArray(raw)) return raw[0] ?? "unknown";
  return raw ?? "unknown";
}

function mapRemote(
  msg: RemoteInboxMessage,
  inboxId: string,
): StoredInboundMessage | null {
  const messageId = msg.messageId;
  if (!messageId) return null;
  const text = msg.extractedText ?? msg.text ?? msg.preview ?? "";
  return {
    messageId,
    inboxId: msg.inboxId ?? inboxId,
    subject: msg.subject ?? "",
    from: fromList(msg.from ?? msg.from_),
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

function matchesSession(
  message: StoredInboundMessage,
  rfqId: string,
  requestId?: string,
): boolean {
  const hay =
    `${message.subject} ${message.preview} ${message.text} ${message.from}`.toLowerCase();
  if (rfqId && hay.includes(rfqId.toLowerCase())) return true;
  if (requestId && hay.includes(requestId.toLowerCase())) return true;
  return false;
}

export async function POST(req: Request) {
  let body: ThreadBody;
  try {
    body = (await req.json()) as ThreadBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const rfqId = body.rfqId?.trim();
  if (!rfqId) {
    return NextResponse.json({ error: "rfqId is required" }, { status: 400 });
  }

  const requestId = body.requestId?.trim();

  if (!hasAgentMailConfig()) {
    const inbound = listStoredInbound().filter((m) =>
      matchesSession(m, rfqId, requestId),
    );
    return NextResponse.json({
      agentMailEnabled: false,
      inbound,
    });
  }

  try {
    const { inboxId, messages: remote } = await listInboundMessages(25);
    const listed: StoredInboundMessage[] = remote
      .map((msg) => mapRemote(msg as RemoteInboxMessage, inboxId))
      .filter((m): m is StoredInboundMessage => m !== null);

    const merged = mergeWebhookAndListed(listed);
    const inbound = merged.filter((m) => matchesSession(m, rfqId, requestId));

    return NextResponse.json({
      agentMailEnabled: true,
      from: inboxId,
      inbound,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not load quote inbox";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
