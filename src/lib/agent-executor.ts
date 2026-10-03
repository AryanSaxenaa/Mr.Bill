import {
  compareQuotes,
  findSuppliers,
  parseQuoteReply,
  recommend,
  sendRfq,
  updateInventory,
  type Allocation,
  type CompareQuotesOutput,
  type RecommendOutput,
  type UpdateInventoryOutput,
} from "./agent-tools";
import {
  DEMO_REQUEST_ID,
  MOCK_QUOTE_REPLIES,
  MOCK_QUOTES,
  type LineItem,
} from "./mock-data";
import type { AgentSession } from "./agent-session";
import { hasAgentMailConfig } from "./agentmail";
import { deliverRfqEmail } from "./rfq-email";

export type ToolName =
  | "find_suppliers"
  | "send_rfq"
  | "parse_quote_reply"
  | "compare_quotes"
  | "recommend"
  | "update_inventory";

export interface ToolCallResult {
  name: ToolName;
  input: Record<string, unknown>;
  output: unknown;
  summary: string;
}

function parseLineItems(raw: unknown): LineItem[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => {
      if (typeof item !== "object" || item === null) return null;
      const o = item as Record<string, unknown>;
      if (
        typeof o.sku !== "string" ||
        typeof o.name !== "string" ||
        typeof o.qty !== "number" ||
        typeof o.unit !== "string" ||
        typeof o.branchId !== "string"
      ) {
        return null;
      }
      return {
        sku: o.sku,
        name: o.name,
        qty: o.qty,
        unit: o.unit,
        branchId: o.branchId as LineItem["branchId"],
      };
    })
    .filter((x): x is LineItem => x !== null);
}

export async function executeAgentTool(
  name: ToolName,
  args: Record<string, unknown>,
  session: AgentSession,
  inventorySnapshot: { branchId: string; sku: string; qty: number }[],
): Promise<{ session: AgentSession; result: ToolCallResult }> {
  const next: AgentSession = {
    ...session,
    quoteIds: [...session.quoteIds],
    selectedRfqSupplierIds: session.selectedRfqSupplierIds ?? [
      "cairo-dairy",
      "bean-barrel",
    ],
    discoveredSuppliers: session.discoveredSuppliers ?? [],
  };

  switch (name) {
    case "find_suppliers": {
      const query =
        typeof args.query === "string" ? args.query.trim() : undefined;
      const location =
        typeof args.location === "string" ? args.location : "Cairo, Egypt";
      const category =
        typeof args.category === "string" ? args.category : undefined;
      const lineItems =
        parseLineItems(args.line_items).length > 0
          ? parseLineItems(args.line_items)
          : next.lineItems;

      const output = await findSuppliers({
        query,
        location,
        category,
        lineItems,
      });

      next.discoveredSuppliers = output.results;
      if (next.selectedRfqSupplierIds.length === 0 && output.results.length > 0) {
        const catalogDefaults = output.results
          .filter((r) => r.source === "mock" && (r.id === "cairo-dairy" || r.id === "bean-barrel"))
          .map((r) => r.id);
        next.selectedRfqSupplierIds =
          catalogDefaults.length > 0
            ? catalogDefaults
            : output.results.slice(0, 2).map((r) => r.id);
      }

      const note = output.message ? ` ${output.message}` : "";
      return {
        session: next,
        result: {
          name,
          input: args,
          output,
          summary: `Found ${output.results.length} supplier candidates for “${output.query}”.${note}`,
        },
      };
    }

    case "send_rfq": {
      const supplierIds = Array.isArray(args.supplier_ids)
        ? args.supplier_ids.filter((x): x is string => typeof x === "string")
        : next.selectedRfqSupplierIds.length > 0
          ? next.selectedRfqSupplierIds
          : ["cairo-dairy", "bean-barrel"];
      const lineItems =
        parseLineItems(args.line_items).length > 0
          ? parseLineItems(args.line_items)
          : next.lineItems;
      const deliveryBranch =
        typeof args.delivery_branch === "string"
          ? args.delivery_branch
          : next.deliveryBranch;
      const neededBy =
        typeof args.needed_by === "string" ? args.needed_by : next.neededBy;
      const requestId =
        typeof args.request_id === "string" ? args.request_id : next.requestId;

      next.lineItems = lineItems;
      next.deliveryBranch = deliveryBranch;
      next.neededBy = neededBy;
      next.requestId = requestId;

      const output = sendRfq({
        requestId,
        supplierIds,
        lineItems,
        deliveryBranch,
        neededBy,
        discoveredSuppliers: next.discoveredSuppliers,
      });

      const agentMailEnabled = hasAgentMailConfig();
      const emailDeliveries = [];
      for (const msg of output.messages) {
        const delivery = await deliverRfqEmail({
          supplierId: msg.supplierId,
          rfqId: output.rfqId,
          requestId,
          text: msg.body,
        });
        emailDeliveries.push(delivery);
      }

      output.emailDeliveries = emailDeliveries;
      output.agentMailEnabled = agentMailEnabled;

      next.rfqId = output.rfqId;
      next.rfqMessages = output.messages;
      next.rfqEmailDeliveries = emailDeliveries;
      next.selectedRfqSupplierIds = supplierIds;
      next.status = "rfq_sent";

      const autoParsed: ToolCallResult[] = [];
      if (!agentMailEnabled) {
        for (const supplierId of supplierIds) {
          if (!MOCK_QUOTE_REPLIES[supplierId]) {
            continue;
          }
          const raw =
            MOCK_QUOTE_REPLIES[supplierId] ??
            `Mock quote from ${supplierId} (auto-generated for demo).`;
          const parsed = parseQuoteReply({
            rfqId: output.rfqId,
            supplierId,
            rawText: raw,
          });
          if (!next.quoteIds.includes(parsed.quoteId)) {
            next.quoteIds.push(parsed.quoteId);
          }
          autoParsed.push({
            name: "parse_quote_reply",
            input: { supplier_id: supplierId, auto: true },
            output: parsed,
            summary: `Auto-parsed mock reply from ${supplierId} → ${parsed.quoteId}`,
          });
        }
        next.status = "quotes_ready";
      }

      const deliveryNote = agentMailEnabled
        ? `Quote inbox sent to ${emailDeliveries.map((d) => d.to).join(", ")}. Sync supplier replies when quotes arrive.`
        : `Mock supplier replies parsed.`;

      return {
        session: next,
        result: {
          name,
          input: args,
          output: { ...output, autoParsed },
          summary: `RFQ ${output.rfqId} sent to ${supplierIds.join(", ")}. ${deliveryNote}`,
        },
      };
    }

    case "parse_quote_reply": {
      const rfqId =
        typeof args.rfq_id === "string"
          ? args.rfq_id
          : (next.rfqId ?? "RFQ-2026-0042");
      const supplierId =
        typeof args.supplier_id === "string" ? args.supplier_id : "cairo-dairy";
      let rawText =
        typeof args.raw_text === "string" ? args.raw_text.trim() : "";
      if (!rawText || rawText.toUpperCase() === "AUTO") {
        rawText = MOCK_QUOTE_REPLIES[supplierId] ?? rawText;
      }

      const output = parseQuoteReply({ rfqId, supplierId, rawText });
      if (!next.quoteIds.includes(output.quoteId)) {
        next.quoteIds.push(output.quoteId);
      }
      if (next.quoteIds.length >= 2) {
        next.status = "quotes_ready";
      }

      return {
        session: next,
        result: {
          name,
          input: args,
          output,
          summary: `Parsed quote ${output.quoteId} (${output.lines.length} lines).`,
        },
      };
    }

    case "compare_quotes": {
      const requestId =
        typeof args.request_id === "string" ? args.request_id : next.requestId;
      const quoteIds = Array.isArray(args.quote_ids)
        ? args.quote_ids.filter((x): x is string => typeof x === "string")
        : next.quoteIds.length > 0
          ? next.quoteIds
          : MOCK_QUOTES.map((q) => q.id);

      const output = compareQuotes({ requestId, quoteIds });
      next.comparisonId = output.comparisonId;
      next.quoteIds = quoteIds;

      return {
        session: next,
        result: {
          name,
          input: args,
          output,
          summary: `Comparison ${output.comparisonId}: ${output.matrix.length} SKUs, ${output.warnings.length} warnings.`,
        },
      };
    }

    case "recommend": {
      const requestId =
        typeof args.request_id === "string" ? args.request_id : next.requestId;
      const comparisonId =
        typeof args.comparison_id === "string"
          ? args.comparison_id
          : (next.comparisonId ?? `CMP-${requestId}`);

      let comparison: CompareQuotesOutput | undefined;
      if (next.quoteIds.length >= 2) {
        comparison = compareQuotes({
          requestId,
          quoteIds: next.quoteIds,
        });
        next.comparisonId = comparison.comparisonId;
      }

      const output = recommend(
        {
          requestId,
          comparisonId,
          constraints:
            typeof args.constraints === "object" && args.constraints !== null
              ? (args.constraints as {
                  maxSuppliers?: number;
                  preferLocal?: boolean;
                })
              : undefined,
        },
        comparison,
        next.lineItems,
      );
      next.recommendation = output;
      next.status = "recommended";

      return {
        session: next,
        result: {
          name,
          input: args,
          output,
          summary: output.summary,
        },
      };
    }

    case "update_inventory": {
      const requestId =
        typeof args.request_id === "string" ? args.request_id : next.requestId;
      const recommendationId =
        typeof args.recommendation_id === "string"
          ? args.recommendation_id
          : (next.recommendation?.recommendationId ?? `REC-${requestId}-01`);
      const approvedBy =
        typeof args.approved_by === "string" ? args.approved_by : "Layla";

      const allocations = next.recommendation?.allocations;

      const output = updateInventory(
        {
          requestId,
          recommendationId,
          approvedBy,
          allocations,
        },
        inventorySnapshot,
        next.lineItems,
      );
      next.status = "approved";

      return {
        session: next,
        result: {
          name,
          input: args,
          output,
          summary: `Inventory updated (${output.inventoryDeltas.length} rows). Audit ${output.auditLogId}.`,
        },
      };
    }

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

export function setLineItemsFromIntake(
  session: AgentSession,
  lineItems: LineItem[],
): AgentSession {
  return {
    ...session,
    lineItems,
    status: "awaiting_confirm",
  };
}

export function mergeIntakeLineItems(
  session: AgentSession,
  items: LineItem[],
): AgentSession {
  if (items.length === 0) return session;
  return setLineItemsFromIntake(session, items);
}

export { DEMO_REQUEST_ID };
