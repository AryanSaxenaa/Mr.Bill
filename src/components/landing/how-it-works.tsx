"use client";

import { useEffect, useRef, useState } from "react";
import {
  MessageSquare,
  Search,
  Mail,
  Scale,
  PackageCheck,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS: {
  title: string;
  body: string;
  icon: LucideIcon;
}[] = [
  {
    title: "Chat / intake",
    body:
      "Describe a Friday restock in plain language (Maadi oat milk, Zamalek cups). Mr.Bill turns it into branch line items.",
    icon: MessageSquare,
  },
  {
    title: "Discover vendors",
    body:
      "Live supplier search shortlists wholesalers near each branch, merged with your trusted catalog before you RFQ.",
    icon: Search,
  },
  {
    title: "Email for quotes",
    body:
      "Structured RFQs go out from your quote inbox. Supplier replies attach to the same order ID, no WhatsApp screenshot hunt.",
    icon: Mail,
  },
  {
    title: "Compare & recommend",
    body:
      "Landed cost in EGP, delivery days, and split recommendations: the matrix your GM actually signs off on.",
    icon: Scale,
  },
  {
    title: "Approve & sync inventory",
    body:
      "One approval updates Maadi, Zamalek, and New Cairo stock with an audit trail finance can replay.",
    icon: PackageCheck,
  },
];

/** 0–1 scroll progress through the section (drives step + bar). */
function scrollProgressThroughSection(section: HTMLElement): number {
  const rect = section.getBoundingClientRect();
  const vh = window.innerHeight;
  const start = vh * 0.72;
  const end = vh * 0.28;
  const span = rect.height + (start - end);
  if (span <= 0) return 0;
  const traveled = start - rect.top;
  return Math.min(1, Math.max(0, traveled / span));
}

export function LandingHowItWorks() {
  const sectionRef = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [progressWidth, setProgressWidth] = useState(0);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const applyScroll = () => {
      const progress = scrollProgressThroughSection(section);
      const n = STEPS.length;
      const scaled = progress * n;
      const idx = Math.min(n - 1, Math.floor(scaled));
      const segment = scaled - idx;

      setActiveIndex(idx);
      setProgressWidth(((idx + segment) / n) * 100);

      if (progress > 0.02) setInView(true);
    };

    applyScroll();
    window.addEventListener("scroll", applyScroll, { passive: true });
    window.addEventListener("resize", applyScroll, { passive: true });

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setInView(true);
          applyScroll();
        }
      },
      { threshold: 0, rootMargin: "0px 0px -5% 0px" },
    );
    observer.observe(section);

    return () => {
      window.removeEventListener("scroll", applyScroll);
      window.removeEventListener("resize", applyScroll);
      observer.disconnect();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="how-it-works"
      className="scroll-mt-20 border-t border-stripe-border bg-surface py-12 md:py-20"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-medium uppercase tracking-wide text-indigo-accent">
            How it works
          </p>
          <h2 className="font-display mt-2 text-3xl font-semibold text-navy md:text-4xl">
            From café chat to stocked shelves
          </h2>
          <p className="mt-4 text-lg text-cocoa">
            Built for Maison Layla-style operators: three Cairo branches, one
            desk instead of spreadsheet chaos and supplier group threads.
          </p>
        </div>

        <div className="relative mt-12 md:mt-16">
          {/* Track sits behind icons (z-0), centered on icon row */}
          <div
            className="pointer-events-none absolute inset-x-4 top-7 z-0 hidden h-0.5 md:block"
            aria-hidden
          >
            <div className="relative h-full w-full rounded-full bg-stripe-border">
              <div
                className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-indigo-accent to-cyan-accent will-change-[width]"
                style={{ width: `${progressWidth}%` }}
              />
            </div>
          </div>

          <ol className="relative z-10 grid gap-8 sm:grid-cols-2 md:grid-cols-5 md:gap-4">
            {STEPS.map((step, index) => {
              const Icon = step.icon;
              const isActive = index === activeIndex;
              const isPast = index < activeIndex;
              return (
                <li
                  key={step.title}
                  className={cn(
                    "relative flex flex-col items-center text-center transition-all duration-500 motion-reduce:transition-none",
                    inView
                      ? "translate-y-0 opacity-100"
                      : "translate-y-3 opacity-0",
                  )}
                  style={{
                    transitionDelay: inView ? `${index * 60}ms` : "0ms",
                  }}
                >
                  <div
                    className={cn(
                      "relative z-10 box-border flex size-14 shrink-0 items-center justify-center rounded-2xl border-2 bg-white shadow-sm transition-all duration-300 motion-reduce:transition-none",
                      isActive &&
                        "scale-105 border-indigo-accent text-indigo-accent shadow-md shadow-indigo-accent/20",
                      !isActive &&
                        isPast &&
                        "border-sage text-sage",
                      !isActive &&
                        !isPast &&
                        "border-stripe-border text-cocoa/60",
                    )}
                  >
                    <Icon className="size-6" strokeWidth={1.75} aria-hidden />
                  </div>
                  <p
                    className={cn(
                      "mt-4 font-display text-sm font-semibold md:text-[15px]",
                      isActive ? "text-navy" : "text-cocoa/75",
                    )}
                  >
                    <span className="mr-1.5 font-mono text-xs text-cocoa">
                      {index + 1}
                    </span>
                    {step.title}
                  </p>
                  <p
                    className={cn(
                      "mt-2 max-w-[240px] text-sm leading-relaxed transition-opacity duration-300",
                      isActive
                        ? "text-cocoa opacity-100"
                        : "text-cocoa/55 opacity-90 max-md:hidden",
                    )}
                  >
                    {step.body}
                  </p>
                </li>
              );
            })}
          </ol>

          <div
            className="relative z-10 mt-8 rounded-2xl border border-stripe-border bg-linen px-5 py-4 text-center md:hidden"
            aria-live="polite"
          >
            <p className="font-display text-sm font-semibold text-navy">
              Step {activeIndex + 1}: {STEPS[activeIndex]?.title}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-cocoa">
              {STEPS[activeIndex]?.body}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
