import type { RequestFlowStatus } from "./app-state";
import type { AgentSession } from "./agent-session";
import type { OrderStage } from "./mock-data";

export function sessionToOrderStage(
  requestStatus: RequestFlowStatus,
  session: AgentSession,
): OrderStage {
  if (requestStatus === "approved" || session.status === "approved") {
    return "approved";
  }
  if (session.status === "recommended" || session.recommendation) {
    return "recommended";
  }
  if (
    session.status === "quotes_ready" ||
    requestStatus === "quotes_parsed" ||
    (session.quoteIds.length >= 2 && session.comparisonId)
  ) {
    return "quotes_in";
  }
  if (session.status === "rfq_sent" || requestStatus === "rfq_sent" || session.rfqId) {
    return "rfq_sent";
  }
  return "draft";
}
