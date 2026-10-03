import Image from "next/image";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowRight, Sparkles } from "lucide-react";

function QuoteDeskMock() {
  return (
    <div
      className="w-full max-w-lg rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md lg:ml-auto"
      aria-hidden
    >
      <div className="mb-3 flex items-center justify-between border-b border-white/10 pb-3">
        <div>
          <p className="font-mono text-xs text-white/60">ORD-2026-0142</p>
          <p className="text-sm font-semibold text-white">Quote desk</p>
        </div>
        <span className="rounded-full border border-cyan-accent/40 bg-cyan-accent/10 px-2 py-0.5 text-xs font-medium text-cyan-accent">
          Quotes in
        </span>
      </div>
      <div className="overflow-hidden rounded-lg border border-white/10 text-xs">
        <div className="grid grid-cols-3 gap-px bg-white/10 font-medium text-white/90">
          <div className="bg-white/5 p-2">Line</div>
          <div className="bg-white/5 p-2">Cairo Dairy</div>
          <div className="bg-white/5 p-2">Bean &amp; Barrel</div>
        </div>
        {[
          ["Oat milk 1L", "42.50", "44.00"],
          ["Cup 8oz", "1,180", "1,240"],
          ["Espresso 1kg", "890", "820"],
        ].map(([name, a, b]) => (
          <div key={name} className="grid grid-cols-3 gap-px bg-white/10 text-white/70">
            <div className="bg-white/5 p-2 font-medium text-white">{name}</div>
            <div
              className={cn(
                "bg-white/5 p-2",
                name === "Oat milk 1L" && "bg-indigo-accent/20 text-white",
              )}
            >
              EGP {a}
            </div>
            <div
              className={cn(
                "bg-white/5 p-2",
                name === "Espresso 1kg" && "bg-indigo-accent/20 text-white",
              )}
            >
              EGP {b}
            </div>
          </div>
        ))}
        <div className="grid grid-cols-3 gap-px bg-white/10 font-mono text-white">
          <div className="bg-white/5 p-2 text-xs">Landed</div>
          <div className="bg-white/5 p-2 text-xs">EGP 4,760</div>
          <div className="bg-white/5 p-2 text-xs">EGP 4,832</div>
        </div>
      </div>
      <p className="mt-3 text-xs text-white/55">
        Primary Cairo Dairy · Reserve Bean &amp; Barrel on espresso lines
      </p>
    </div>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-surface">
      <section className="hero-dark relative overflow-hidden text-white">
        <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
          <div className="flex items-center gap-2">
            <Image
              src="/assets/icons/coffee-bean.svg"
              alt=""
              width={28}
              height={28}
              className="brightness-0 invert opacity-90"
            />
            <span className="text-xl font-semibold tracking-tight">Mr.Bill</span>
            <span className="hidden text-sm text-white/50 sm:inline">
              · Maison Layla
            </span>
          </div>
          <Link
            href="/app/orders"
            className={cn(
              buttonVariants({ variant: "outline" }),
              "border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white",
            )}
          >
            Open order desk
          </Link>
        </header>

        <main className="relative z-10 mx-auto grid max-w-6xl gap-12 px-6 pb-24 pt-4 lg:grid-cols-2 lg:items-center lg:pt-12">
          <div className="page-enter space-y-6">
            <p className="inline-flex items-center gap-1.5 text-sm font-medium text-cyan-accent">
              <Sparkles className="size-4" strokeWidth={1.75} />
              Open-source F&amp;B procurement
            </p>
            <h1 className="text-4xl font-bold leading-[1.1] tracking-tight md:text-5xl lg:text-[3.25rem]">
              Procurement on autopilot{" "}
              <span className="text-gradient-brand">for your cafés</span>
            </h1>
            <p className="max-w-lg text-lg text-white/70">
              Mr.Bill is an order desk with an agent attached — structured intake,
              RFQ to suppliers, landed-cost comparison, approval, and inventory
              sync. Built for multi-branch operators, not chat-first demos.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Link
                href="/app/orders/new"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "bg-white text-navy hover:bg-white/90",
                )}
              >
                Create order
                <ArrowRight className="ml-1 size-4" />
              </Link>
              <Link
                href="/app/orders"
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "border-white/25 bg-transparent text-white hover:bg-white/10",
                )}
              >
                View pipeline
              </Link>
            </div>
          </div>

          <div className="page-enter">
            <QuoteDeskMock />
          </div>
        </main>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="grid gap-10 lg:grid-cols-3">
          {[
            {
              title: "Orders pipeline",
              body:
                "Draft → RFQ → quotes → recommend → approve — every step on the desk.",
            },
            {
              title: "Landed cost in EGP",
              body:
                "MOQ, delivery days, and supplier splits in one comparison matrix.",
            },
            {
              title: "Ask Mr.Bill",
              body:
                "Side panel agent with explicit RFQ tools — same data, no black box.",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="card-shadow rounded-xl border border-stripe-border bg-linen p-6"
            >
              <h2 className="text-lg font-semibold text-navy">{item.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-cocoa">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-stripe-border py-10 text-center text-sm text-cocoa">
        <p>
          MIT licensed ·{" "}
          <Link
            href="https://github.com/AryanSaxenaa/Mr.Bill"
            className="font-medium text-indigo-accent underline-offset-2 hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            Open source on GitHub
          </Link>{" "}
          · Agent loop + demo mode · OpenRouter ready
        </p>
      </footer>
    </div>
  );
}
