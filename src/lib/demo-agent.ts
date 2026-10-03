import { executeAgentTool } from "./agent-executor";
import {
  DEFAULT_SESSION,
  uiHintsFromSession,
  type AgentSession,
  type AgentUiHints,
} from "./agent-session";
import type { InventoryDelta } from "./agent-tools";
import { PARSED_LINE_ITEMS, branchName } from "./mock-data";

interface ChatTurn {
  role: "user" | "assistant";
  content: string;
}

export interface DemoAgentRequest {
  message: string;
  history?: ChatTurn[];
  session?: AgentSession;
  inventory?: { branchId: string; sku: string; qty: number }[];
  confirmAction?: "send_rfq" | "approve";
}

export interface DemoAgentResponse {
  assistantMessage: string;
  session: AgentSession;
  toolTrace: { name: string; summary: string }[];
  inventoryDeltas?: InventoryDelta[];
  ui: AgentUiHints;
  mode: "demo";
}

function intakeHeuristic(message: string, session: AgentSession): AgentSession {
  const lower = message.toLowerCase();
  if (
    lower.includes("oat") ||
    lower.includes("maadi") ||
    lower.includes("espresso") ||
    lower.includes("cup") ||
    lower.includes("zamalek")
  ) {
    return {
      ...session,
      lineItems: PARSED_LINE_ITEMS,
      status: "awaiting_confirm",
      neededBy: lower.includes("friday") ? "Friday" : session.neededBy,
      deliveryBranch: lower.includes("maadi") ? "Maadi" : session.deliveryBranch,
    };
  }
  return session;
}

function formatLineItemsConfirm(session: AgentSession): string {
  const lines = session.lineItems
    .map(
      (l) =>
        `• ${l.name} × ${l.qty} ${l.unit} · ${branchName(l.branchId)}`,
    )
    .join("\n");
  return `Here’s what I heard for ${session.requestId} (needed by ${session.neededBy}, delivery focus ${session.deliveryBranch}):\n\n${lines}\n\nConfirm when this looks right — I’ll RFQ Cairo Dairy Co. and Bean & Barrel with mock replies for the demo.`;
}

function runConfirmPipeline(
  session: AgentSession,
  inventory: { branchId: string; sku: string; qty: number }[],
): DemoAgentResponse {
  const toolTrace: { name: string; summary: string }[] = [];
  let next = {
    ...session,
    lineItems:
      session.lineItems.length > 0 ? session.lineItems : PARSED_LINE_ITEMS,
  };

  const { session: s1, result } = executeAgentTool(
    "send_rfq",
    {
      request_id: next.requestId,
      supplier_ids: ["cairo-dairy", "bean-barrel"],
      line_items: next.lineItems,
      delivery_branch: next.deliveryBranch,
      needed_by: next.neededBy,
    },
    next,
    inventory,
  );
  next = s1;
  toolTrace.push({ name: result.name, summary: result.summary });

  const { session: s2, result: cmp } = executeAgentTool(
    "compare_quotes",
    {
      request_id: next.requestId,
      quote_ids: next.quoteIds,
    },
    next,
    inventory,
  );
  next = s2;
  toolTrace.push({ name: cmp.name, summary: cmp.summary });

  const { session: s3, result: rec } = executeAgentTool(
    "recommend",
    {
      request_id: next.requestId,
      comparison_id: next.comparisonId,
    },
    next,
    inventory,
  );
  next = s3;
  toolTrace.push({ name: rec.name, summary: rec.summary });

  return {
    assistantMessage: `${rec.summary}\n\nSide-by-side comparison is ready below.`,
    session: next,
    toolTrace,
    ui: uiHintsFromSession(next),
    mode: "demo",
  };
}

export function runDemoAgent(body: DemoAgentRequest): DemoAgentResponse {
  const inventory = body.inventory ?? [];
  const toolTrace: { name: string; summary: string }[] = [];
  let session: AgentSession = body.session ?? { ...DEFAULT_SESSION };

  if (body.confirmAction === "send_rfq") {
    return runConfirmPipeline(session, inventory);
  }

  if (body.confirmAction === "approve") {
    const { session: s1, result } = executeAgentTool(
      "update_inventory",
      {
        request_id: session.requestId,
        recommendation_id: session.recommendation?.recommendationId,
        approved_by: "Layla",
      },
      session,
      inventory,
    );
    const out = result.output as { inventoryDeltas: InventoryDelta[] };

    return {
      assistantMessage: result.summary,
      session: s1,
      toolTrace: [{ name: result.name, summary: result.summary }],
      inventoryDeltas: out.inventoryDeltas,
      ui: uiHintsFromSession(s1),
      mode: "demo",
    };
  }

  const message = body.message?.trim() ?? "";
  session = intakeHeuristic(message, session);

  if (session.lineItems.length > 0 && session.status === "awaiting_confirm") {
    return {
      assistantMessage: formatLineItemsConfirm(session),
      session,
      toolTrace,
      ui: uiHintsFromSession(session),
      mode: "demo",
    };
  }

  return {
    assistantMessage:
      "Tell me which branch needs what — for example oat milk in Maadi and espresso in Zamalek — and I’ll structure line items before RFQ.",
    session,
    toolTrace,
    ui: uiHintsFromSession(session),
    mode: "demo",
  };
}
