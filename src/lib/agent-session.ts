import type { LineItem } from "./mock-data";
import type { RecommendOutput } from "./agent-tools";

export interface AgentSession {
  requestId: string;
  lineItems: LineItem[];
  neededBy: string;
  deliveryBranch: string;
  rfqId?: string;
  rfqMessages?: { supplierId: string; body: string }[];
  quoteIds: string[];
  comparisonId?: string;
  recommendation?: RecommendOutput;
  status:
    | "intake"
    | "awaiting_confirm"
    | "rfq_sent"
    | "quotes_ready"
    | "recommended"
    | "approved";
}

export const DEFAULT_SESSION: AgentSession = {
  requestId: "REQ-MAISON-018",
  lineItems: [],
  neededBy: "Friday",
  deliveryBranch: "Maadi",
  quoteIds: [],
  status: "intake",
};

export interface AgentUiHints {
  showLineItemsConfirm: boolean;
  showCompareTable: boolean;
  showApproveButton: boolean;
}

export function uiHintsFromSession(session: AgentSession): AgentUiHints {
  return {
    showLineItemsConfirm:
      session.lineItems.length > 0 &&
      !session.rfqId &&
      session.status === "awaiting_confirm",
    showCompareTable:
      session.quoteIds.length >= 2 &&
      Boolean(session.comparisonId) &&
      session.status !== "intake",
    showApproveButton:
      Boolean(session.recommendation) && session.status === "recommended",
  };
}
