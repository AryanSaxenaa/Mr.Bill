import { NextResponse } from "next/server";
import { storeInboundFromWebhook } from "@/lib/agentmail-inbound";

export async function POST(req: Request) {
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
