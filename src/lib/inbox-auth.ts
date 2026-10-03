import { timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";

export const INBOX_KEY_HEADER = "x-mrbill-inbox-key";

export function getInboxSharedSecret(): string | undefined {
  const inbox = process.env.MRBILL_INBOX_SECRET?.trim();
  const webhook = process.env.AGENTMAIL_WEBHOOK_SECRET?.trim();
  return inbox || webhook || undefined;
}

function bearerToken(req: Request): string | null {
  const auth = req.headers.get("authorization")?.trim();
  if (!auth) return null;
  const match = /^Bearer\s+(.+)$/i.exec(auth);
  return match?.[1]?.trim() ?? null;
}

export function readProvidedInboxKey(req: Request): string | null {
  const header = req.headers.get(INBOX_KEY_HEADER)?.trim();
  if (header) return header;
  const alt = req.headers.get("x-webhook-secret")?.trim();
  if (alt) return alt;
  return bearerToken(req);
}

function secretsEqual(provided: string, expected: string): boolean {
  const left = Buffer.from(provided);
  const right = Buffer.from(expected);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

export function authorizeInboxRequest(req: Request): boolean {
  const secret = getInboxSharedSecret();
  if (!secret) return false;
  const provided = readProvidedInboxKey(req);
  if (!provided) return false;
  return secretsEqual(provided, secret);
}

export function unauthorizedInboxResponse(): NextResponse {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
