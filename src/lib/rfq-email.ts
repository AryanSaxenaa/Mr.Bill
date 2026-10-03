import { sendRfqEmail, hasAgentMailConfig } from "./agentmail";
import { SUPPLIERS, supplierName } from "./mock-data";
import {
  resolveSupplierDisplayName,
  type DiscoveredSupplier,
} from "./serpapi";

export function resolveRfqRecipient(supplierId: string): string {
  const override = process.env.MRBILL_RFQ_TO_EMAIL?.trim();
  if (override) return override;

  const supplier = SUPPLIERS.find((s) => s.id === supplierId);
  if (supplier?.rfqEmail) return supplier.rfqEmail;
  if (supplier?.contact) return supplier.contact;

  const inbox = process.env.AGENTMAIL_INBOX_ID?.trim();
  const slug = supplierId.replace(/[^a-z0-9]+/gi, "-").slice(0, 32) || "web";
  if (inbox?.includes("@")) {
    const [local, domain] = inbox.split("@");
    if (local && domain) return `${local}+${slug}@${domain}`;
  }
  return `procurement-demo+${slug}@agentmail.to`;
}

export function buildRfqSubject(
  supplierId: string,
  rfqId: string,
  requestId: string,
  discovered: DiscoveredSupplier[] = [],
): string {
  const name = resolveSupplierDisplayName(supplierId, discovered);
  return `[Supplier: ${name}] RFQ ${rfqId} · ${requestId} - Maison Layla`;
}

export interface RfqEmailDelivery {
  supplierId: string;
  to: string;
  subject: string;
  messageId: string;
  inboxId: string;
  from: string;
  mode: "agentmail" | "simulated";
  error?: string;
  threadId?: string;
}

export type RfqDeliveryMode = "agentmail" | "simulated" | "mixed";

export function summarizeRfqDeliveries(
  deliveries: RfqEmailDelivery[] | undefined,
): {
  deliveryMode: RfqDeliveryMode;
  mailFallback: boolean;
} {
  const dels = deliveries ?? [];
  const live = dels.filter((d) => d.mode === "agentmail").length;
  const simulated = dels.filter((d) => d.mode === "simulated").length;
  let deliveryMode: RfqDeliveryMode = "simulated";
  if (dels.length > 0 && live === dels.length) deliveryMode = "agentmail";
  else if (live > 0 && simulated > 0) deliveryMode = "mixed";
  const mailFallback = hasAgentMailConfig() && simulated > 0;
  return { deliveryMode, mailFallback };
}

function describeMailError(err: unknown): { name: string; message: string } {
  const name =
    err && typeof err === "object" && "name" in err
      ? String((err as { name: unknown }).name)
      : "Error";
  const message = err instanceof Error ? err.message : String(err);
  return { name, message };
}

export function isAgentMailSendError(err: unknown): boolean {
  const { name, message } = describeMailError(err);
  return (
    name === "IdempotencyKeyConflictError" ||
    name === "ConflictError" ||
    name === "AgentMailError" ||
    /idempotency/i.test(message) ||
    /agentmail/i.test(name)
  );
}

export async function deliverRfqEmail(params: {
  supplierId: string;
  rfqId: string;
  requestId: string;
  text: string;
  discoveredSuppliers?: DiscoveredSupplier[];
}): Promise<RfqEmailDelivery> {
  const to = resolveRfqRecipient(params.supplierId);
  const subject = buildRfqSubject(
    params.supplierId,
    params.rfqId,
    params.requestId,
    params.discoveredSuppliers ?? [],
  );

  const simulated = (): RfqEmailDelivery => ({
    supplierId: params.supplierId,
    to,
    subject,
    messageId: `sim-${params.rfqId}-${params.supplierId}`,
    inboxId: "simulated",
    from: "procurement@mrbill.local",
    mode: "simulated",
  });

  if (!hasAgentMailConfig()) {
    return simulated();
  }

  try {
    const sent = await sendRfqEmail({
      to,
      subject,
      text: params.text,
      idempotencyKey: `rfq-${params.rfqId}-${params.supplierId}`,
    });

    return {
      supplierId: params.supplierId,
      to,
      subject,
      messageId: sent.messageId,
      inboxId: sent.inboxId,
      from: sent.from,
      mode: "agentmail",
      threadId: sent.threadId,
    };
  } catch (err) {
    const { name, message } = describeMailError(err);
    console.error(
      "Quote inbox send failed:",
      name,
      message,
      isAgentMailSendError(err) ? "(idempotency or mail conflict)" : "",
    );
    return {
      ...simulated(),
      error: `${name}: ${message}`,
    };
  }
}

export { supplierName };
