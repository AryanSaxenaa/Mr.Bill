import { sendRfqEmail, hasAgentMailConfig } from "./agentmail";
import { SUPPLIERS, supplierName } from "./mock-data";

export function resolveRfqRecipient(supplierId: string): string {
  const override = process.env.MRBILL_RFQ_TO_EMAIL?.trim();
  if (override) return override;

  const supplier = SUPPLIERS.find((s) => s.id === supplierId);
  return supplier?.rfqEmail ?? supplier?.contact ?? `${supplierId}@example.com`;
}

export function buildRfqSubject(
  supplierId: string,
  rfqId: string,
  requestId: string,
): string {
  const name = supplierName(supplierId);
  const override = process.env.MRBILL_RFQ_TO_EMAIL?.trim();
  const prefix = override ? `[Supplier: ${name}] ` : "";
  return `${prefix}RFQ ${rfqId} · ${requestId} - Maison Layla`;
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
}): Promise<RfqEmailDelivery> {
  const to = resolveRfqRecipient(params.supplierId);
  const subject = buildRfqSubject(
    params.supplierId,
    params.rfqId,
    params.requestId,
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
