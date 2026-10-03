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

const STEP_MS = 4200;

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

export function LandingHowItWorks() {
  const sectionRef = useRef<HTMLElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [progressWidth, setProgressWidth] = useState(0);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) setInView(true);
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!inView) return;

    const pctForStep = (index: number) =>
      ((index + 1) / STEPS.length) * 100;

    setActiveIndex(0);
    setProgressWidth(0);
    const startTimer = window.setTimeout(() => {
      setProgressWidth(pctForStep(0));
    }, 50);

    const tick = window.setInterval(() => {
      setActiveIndex((current) => {
        const next = (current + 1) % STEPS.length;
        const bar = progressRef.current;
        if (next === 0 && bar) {
          bar.classList.add("transition-none");
          setProgressWidth(0);
          window.requestAnimationFrame(() => {
            bar.classList.remove("transition-none");
            setProgressWidth(pctForStep(0));
          });
        } else {
          setProgressWidth(pctForStep(next));
        }
        return next;
      });
    }, STEP_MS);

    return () => {
      window.clearTimeout(startTimer);
      window.clearInterval(tick);
    };
  }, [inView]);

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
          <div
            className="absolute left-0 right-0 top-[2.75rem] hidden h-0.5 bg-stripe-border md:block"
            aria-hidden
          />
          <div
            ref={progressRef}
            className={cn(
              "absolute left-0 top-[2.75rem] hidden h-0.5 origin-left bg-gradient-to-r from-indigo-accent to-cyan-accent md:block",
              "transition-[width] ease-linear motion-safe:duration-[4200ms]",
            )}
            style={{ width: `${progressWidth}%` }}
            aria-hidden
          />

          <ol className="grid gap-8 sm:grid-cols-2 md:grid-cols-5 md:gap-4">
            {STEPS.map((step, index) => {
              const Icon = step.icon;
              const isActive = index === activeIndex;
              const isPast = index < activeIndex;
              return (
                <li
                  key={step.title}
                  className={cn(
                    "relative flex flex-col items-center text-center transition-all duration-700 motion-reduce:transition-none",
                    inView
                      ? "translate-y-0 opacity-100"
                      : "translate-y-4 opacity-0",
                  )}
                  style={{
                    transitionDelay: inView ? `${index * 90}ms` : "0ms",
                  }}
                >
                  <div
                    className={cn(
                      "relative z-10 flex size-14 items-center justify-center rounded-2xl border bg-linen card-shadow transition-all duration-700 motion-reduce:transition-none",
                      isActive &&
                        "scale-110 border-indigo-accent bg-white text-indigo-accent shadow-lg shadow-indigo-accent/15 ring-2 ring-indigo-accent/25",
                      !isActive &&
                        isPast &&
                        "border-sage/50 bg-sage/5 text-sage",
                      !isActive &&
                        !isPast &&
                        "border-stripe-border text-cocoa/70",
                    )}
                  >
                    <Icon className="size-6" strokeWidth={1.75} aria-hidden />
                  </div>
                  <p
                    className={cn(
                      "mt-4 font-display text-sm font-semibold md:text-[15px]",
                      isActive ? "text-navy" : "text-cocoa/80",
                    )}
                  >
                    <span className="mr-1.5 font-mono text-xs text-cocoa">
                      {index + 1}
                    </span>
                    {step.title}
                  </p>
                  <p
                    className={cn(
                      "mt-2 max-w-[240px] text-sm leading-relaxed transition-all duration-700 motion-reduce:transition-none",
                      isActive
                        ? "text-cocoa opacity-100"
                        : "text-cocoa/60 opacity-80 max-md:hidden",
                    )}
                  >
                    {step.body}
                  </p>
                </li>
              );
            })}
          </ol>

          <div
            className="mt-8 rounded-2xl border border-stripe-border bg-linen px-5 py-4 text-center md:hidden"
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
