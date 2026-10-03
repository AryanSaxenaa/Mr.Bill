import { AgentMailClient } from "agentmail";

const INBOX_CLIENT_ID = "mrbill-procurement-v1";

let cachedClient: AgentMailClient | null = null;
let cachedInboxId: string | null = null;

export function hasAgentMailConfig(): boolean {
  return Boolean(process.env.AGENTMAIL_API_KEY?.trim());
}

export function getClient(): AgentMailClient | null {
  if (!hasAgentMailConfig()) return null;
  if (!cachedClient) {
    cachedClient = new AgentMailClient({
      apiKey: process.env.AGENTMAIL_API_KEY!,
    });
  }
  return cachedClient;
}

export async function ensureInbox(): Promise<string> {
  const envInbox = process.env.AGENTMAIL_INBOX_ID?.trim();
  if (envInbox) {
    cachedInboxId = envInbox;
    return envInbox;
  }
  if (cachedInboxId) return cachedInboxId;

  const client = getClient();
  if (!client) {
    throw new Error("AgentMail is not configured (missing AGENTMAIL_API_KEY)");
  }

  const inbox = await client.inboxes.create({
    clientId: INBOX_CLIENT_ID,
  });
  cachedInboxId = inbox.inboxId;
  return inbox.inboxId;
}

export interface SendRfqEmailInput {
  to: string;
  subject: string;
  text: string;
  html?: string;
  idempotencyKey: string;
}

export interface SendRfqEmailResult {
  messageId: string;
  inboxId: string;
  from: string;
  threadId?: string;
}

export async function sendRfqEmail(
  input: SendRfqEmailInput,
): Promise<SendRfqEmailResult> {
  const client = getClient();
  if (!client) {
    throw new Error("AgentMail is not configured");
  }

  const inboxId = await ensureInbox();
  const html =
    input.html ??
    `<pre style="font-family: sans-serif; white-space: pre-wrap;">${escapeHtml(
      input.text,
    )}</pre>`;

  const response = await client.inboxes.messages.send(
    inboxId,
    {
      to: [input.to],
      subject: input.subject,
      text: input.text,
      html,
    },
    { idempotencyKey: input.idempotencyKey },
  );

  const messageId = response.messageId ?? "unknown";
  const threadId =
    "threadId" in response && typeof response.threadId === "string"
      ? response.threadId
      : undefined;

  return {
    messageId,
    inboxId,
    from: inboxId,
    threadId,
  };
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export async function listInboundMessages(limit = 20) {
  const client = getClient();
  if (!client) {
    throw new Error("AgentMail is not configured");
  }
  const inboxId = await ensureInbox();
  const res = await client.inboxes.messages.list(inboxId, { limit });
  return {
    inboxId,
    messages: res.messages ?? [],
  };
}
