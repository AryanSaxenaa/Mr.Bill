import { ORDER_STAGE_LABELS, type OrderStage } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const STAGE_STYLE: Record<OrderStage, string> = {
  draft: "border-oat bg-cream text-cocoa",
  rfq_sent: "border-terracotta/30 bg-terracotta/10 text-terracotta",
  quotes_in: "border-sage/40 bg-sage/10 text-sage",
  recommended: "border-espresso/20 bg-espresso/5 text-espresso",
  approved: "border-sage/50 bg-sage/15 text-sage",
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
