import { ORDER_STAGE_LABELS, type OrderStage } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const STAGE_STYLE: Record<OrderStage, string> = {
  draft: "border-stripe-border bg-surface text-cocoa",
  rfq_sent: "border-indigo-accent/30 bg-indigo-accent/10 text-indigo-accent",
  quotes_in: "border-cyan-accent/40 bg-cyan-accent/10 text-navy",
  recommended: "border-navy/15 bg-navy/5 text-navy",
  approved: "border-sage/40 bg-sage/10 text-sage",
};

export function OrderStatusPill({
  stage,
  className,
}: {
  stage: OrderStage;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        STAGE_STYLE[stage],
        className,
      )}
    >
      {ORDER_STAGE_LABELS[stage]}
    </span>
  );
}
