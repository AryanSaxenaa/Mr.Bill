import {
  ORDER_STAGE_LABELS,
  PIPELINE_STAGES,
  stageIndex,
  type OrderStage,
} from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

export function OrderPipelineStepper({ current }: { current: OrderStage }) {
  const activeIdx = stageIndex(current);

  return (
    <ol className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-0">
      {PIPELINE_STAGES.map((stage, idx) => {
        const done = idx < activeIdx;
        const active = idx === activeIdx;
        return (
          <li
            key={stage}
            className={cn(
              "flex flex-1 items-center gap-2 sm:flex-col sm:gap-1 sm:text-center",
            )}
          >
            <div className="flex items-center gap-2 sm:flex-col">
              <span
                className={cn(
                  "flex size-8 shrink-0 items-center justify-center rounded-full border text-xs font-semibold",
                  done && "border-sage bg-sage text-linen",
                  active && !done && "border-espresso bg-espresso text-linen",
                  !done && !active && "border-oat bg-linen text-cocoa",
                )}
              >
                {done ? <Check className="size-4" /> : idx + 1}
              </span>
              <span
                className={cn(
                  "text-xs font-medium sm:max-w-[5.5rem]",
                  active ? "text-espresso" : "text-cocoa",
                )}
              >
                {ORDER_STAGE_LABELS[stage]}
              </span>
            </div>
            {idx < PIPELINE_STAGES.length - 1 && (
              <div
                className={cn(
                  "hidden h-px flex-1 bg-oat sm:block",
                  done && "bg-sage/60",
                )}
                aria-hidden
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
