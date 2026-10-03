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
      "Describe a Friday restock in plain language — Maadi oat milk, Zamalek cups — and Mr.Bill turns it into branch line items.",
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
      "Structured RFQs go out from your quote inbox; supplier replies attach to the same order ID — no WhatsApp screenshot hunt.",
    icon: Mail,
  },
  {
    title: "Compare & recommend",
    body:
      "Landed cost in EGP, delivery days, and split recommendations — the matrix your GM actually signs off on.",
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
  const [inView, setInView] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) setInView(true);
      },
      { threshold: 0.15 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!inView) return;
    const timer = window.setInterval(() => {
      setActiveIndex((i) => (i + 1) % STEPS.length);
    }, 4500);
    return () => window.clearInterval(timer);
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
            Built for Maison Layla-style operators — three Cairo branches, one
            desk instead of spreadsheet chaos and supplier group threads.
          </p>
        </div>

        <div className="relative mt-12 md:mt-16">
          <div
            className="absolute left-0 right-0 top-[2.75rem] hidden h-0.5 bg-stripe-border md:block"
            aria-hidden
          />
          <div
            className="absolute left-0 top-[2.75rem] hidden h-0.5 origin-left bg-gradient-to-r from-indigo-accent to-cyan-accent transition-transform duration-[4500ms] ease-linear md:block"
            style={{
              width: `${((activeIndex + 1) / STEPS.length) * 100}%`,
            }}
            aria-hidden
          />

          <ol className="grid gap-6 md:grid-cols-5 md:gap-4">
            {STEPS.map((step, index) => {
              const Icon = step.icon;
              const isActive = index === activeIndex;
              const isPast = index < activeIndex;
              return (
                <li
                  key={step.title}
                  className={cn(
                    "relative flex flex-col items-center text-center transition-all duration-500",
                    inView
                      ? "translate-y-0 opacity-100"
                      : "translate-y-4 opacity-0",
                  )}
                  style={{
                    transitionDelay: inView ? `${index * 80}ms` : "0ms",
                  }}
                >
                  <div
                    className={cn(
                      "relative z-10 flex size-14 items-center justify-center rounded-2xl border bg-linen card-shadow transition-all duration-500",
                      isActive
                        ? "border-indigo-accent/40 scale-105 text-indigo-accent shadow-indigo-accent/10"
                        : isPast
                          ? "border-sage/40 text-sage"
                          : "border-stripe-border text-cocoa",
                    )}
                  >
                    <Icon className="size-6" strokeWidth={1.75} aria-hidden />
                    {isActive && (
                      <span
                        className="absolute -inset-1 rounded-2xl border border-indigo-accent/20 animate-pulse"
                        aria-hidden
                      />
                    )}
                  </div>
                  <p className="mt-4 font-display text-sm font-semibold text-navy md:text-[15px]">
                    <span className="mr-1.5 font-mono text-xs text-cocoa">
                      {index + 1}
                    </span>
                    {step.title}
                  </p>
                  <p
                    className={cn(
                      "mt-2 max-w-[220px] text-sm leading-relaxed text-cocoa transition-opacity duration-500",
                      isActive ? "opacity-100" : "opacity-70",
                    )}
                  >
                    {step.body}
                  </p>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
