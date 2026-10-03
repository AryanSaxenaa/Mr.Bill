"use client";

import { useTour } from "@/components/tour/tour-provider";
import { cn } from "@/lib/utils";

export function TourLaunchButton({
  className,
  variant = "light",
}: {
  className?: string;
  variant?: "light" | "dark";
}) {
  const { status, startTour, tourActive } = useTour();
  const replay = status !== "pending";
  const label = replay ? "Replay tour" : "Take a tour";

  return (
    <button
      type="button"
      data-tour="replay"
      disabled={tourActive}
      onClick={() => void startTour({ replay })}
      className={cn(
        "inline-flex items-center justify-center rounded-lg px-3 py-1.5 text-sm font-medium transition",
        variant === "dark"
          ? "border border-white/30 text-white hover:bg-white/10"
          : "border border-stripe-border bg-linen text-cocoa hover:bg-surface hover:text-navy",
        tourActive && "cursor-default opacity-60",
        className,
      )}
    >
      {label}
    </button>
  );
}
