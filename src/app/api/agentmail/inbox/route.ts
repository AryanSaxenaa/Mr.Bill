import { NextResponse } from "next/server";
import { ensureInbox, hasAgentMailConfig, listInboundMessages } from "@/lib/agentmail";
import {
  listStoredInbound,
  mergeWebhookAndListed,
  type StoredInboundMessage,
} from "@/lib/agentmail-inbound";
import {
  authorizeInboxRequest,
  unauthorizedInboxResponse,
} from "@/lib/inbox-auth";

function mapRemote(
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

export async function GET(req: Request) {
  if (!authorizeInboxRequest(req)) {
    return unauthorizedInboxResponse();
  }

  if (!hasAgentMailConfig()) {
    return NextResponse.json({
      agentMailEnabled: false,
      messages: listStoredInbound(),
    });
  }

  try {
    const inboxId = await ensureInbox();
    const { messages: remote } = await listInboundMessages(25);
    const listed = remote
      .map((m) => mapRemote(m, inboxId))
      .filter((m): m is StoredInboundMessage => m !== null);
    const messages = mergeWebhookAndListed(listed);

    return NextResponse.json({
      agentMailEnabled: true,
      inboxId,
      from: inboxId,
      messages,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to list inbox";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
