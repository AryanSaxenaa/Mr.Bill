import { NextResponse } from "next/server";
import { storeInboundFromWebhook } from "@/lib/agentmail-inbound";
import {
  authorizeInboxRequest,
  unauthorizedInboxResponse,
} from "@/lib/inbox-auth";

export async function POST(req: Request) {
  if (!authorizeInboxRequest(req)) {
    return unauthorizedInboxResponse();
  }

  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const stored = storeInboundFromWebhook(
    payload as { message?: Record<string, unknown> },
  );

  return NextResponse.json({
    ok: true,
    stored: Boolean(stored),
    messageId: stored?.messageId,
  });
}
