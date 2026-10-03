import Image from "next/image";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";

function QuoteDeskMock() {
  return (
    <div
      className="card-shadow w-full max-w-lg rounded-2xl border border-oat bg-linen p-4 lg:ml-auto"
      aria-hidden
    >
      <div className="mb-3 flex items-center justify-between border-b border-oat pb-3">
        <div>
          <p className="font-mono text-xs text-cocoa">ORD-2026-0142</p>
          <p className="font-display text-sm font-semibold text-espresso">
            Quote desk
          </p>
        </div>
        <span className="rounded-full border border-sage/40 bg-sage/10 px-2 py-0.5 text-xs font-medium text-sage">
          Quotes in
        </span>
      </div>
      <div className="overflow-hidden rounded-lg border border-oat text-xs">
        <div className="grid grid-cols-3 gap-px bg-oat font-medium text-espresso">
          <div className="bg-cream p-2">Line</div>
          <div className="bg-cream p-2">Cairo Dairy</div>
          <div className="bg-cream p-2">Bean &amp; Barrel</div>
        </div>
        {[
          ["Oat milk 1L", "42.50", "44.00"],
          ["Cup 8oz", "1,180", "1,240"],
          ["Espresso 1kg", "890", "820"],
        ].map(([name, a, b]) => (
          <div key={name} className="grid grid-cols-3 gap-px bg-oat text-cocoa">
            <div className="bg-linen p-2 font-medium text-espresso">{name}</div>
            <div
              className={cn(
                "bg-linen p-2",
                name === "Oat milk 1L" && "bg-sage/12 text-espresso",
              )}
            >
              EGP {a}
            </div>
            <div
              className={cn(
                "bg-linen p-2",
                name === "Espresso 1kg" && "bg-sage/12 text-espresso",
              )}
            >
              EGP {b}
            </div>
          </div>
        ))}
        <div className="grid grid-cols-3 gap-px bg-oat font-mono text-espresso">
          <div className="bg-cream p-2 text-xs">Landed</div>
          <div className="bg-cream p-2 text-xs">EGP 4,760</div>
          <div className="bg-cream p-2 text-xs">EGP 4,832</div>
        </div>
      </div>
      <p className="mt-3 text-xs text-cocoa">
        Primary Cairo Dairy · Reserve Bean &amp; Barrel on espresso lines
      </p>
    </div>
  );
}

export default function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-cream">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: "url(/assets/pattern-dots.svg)",
          backgroundSize: "40px 40px",
        }}
      />
      <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2">
          <Image
            src="/assets/icons/coffee-bean.svg"
            alt=""
            width={28}
            height={28}
          />
          <span className="font-display text-xl font-semibold text-espresso">
            Mr.Bill
          </span>
        </div>
        <Link
          href="/app/orders"
          className={cn(
            buttonVariants({ variant: "outline" }),
            "border-oat bg-linen",
          )}
        >
          Open order desk
        </Link>
      </header>

      <main className="relative z-10 mx-auto grid max-w-6xl gap-12 px-6 pb-20 pt-8 lg:grid-cols-2 lg:items-center lg:pt-16">
        <div className="page-enter space-y-6">
          <p className="text-sm font-medium uppercase tracking-wide text-sage">
            Open-source F&amp;B procurement
          </p>
          <h1 className="font-display text-4xl font-bold leading-tight text-espresso md:text-[2.25rem] lg:text-5xl">
            Procurement on autopilot for your cafés.
          </h1>
          <p className="max-w-lg text-lg text-cocoa">
            Mr.Bill is an order desk with an agent attached — structured intake,
            RFQ to suppliers, landed-cost comparison, approval, and inventory
            sync. Built for multi-branch F&amp;B operators, not chat-first demos.
          </p>
          <ul className="space-y-2 text-cocoa">
            <li className="flex items-start gap-2">
              <Image
                src="/assets/icons/supply-crate.svg"
                alt=""
                width={20}
                height={20}
                className="mt-0.5"
              />
              <span>Orders pipeline: draft → RFQ → quotes → recommend → approve</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 size-2 rounded-full bg-terracotta" />
              <span>Quote desk with MOQ, delivery days, and landed totals in EGP</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 size-2 rounded-full bg-sage" />
              <span>Ask Mr.Bill side panel — same tools, explicit RFQ actions</span>
            </li>
          </ul>
          <div className="flex flex-wrap gap-3 pt-2">
            <Link
              href="/app/orders/new"
              className={cn(
                buttonVariants(),
                "bg-espresso text-linen hover:bg-espresso/90",
              )}
            >
              Create order
              <ArrowRight className="ml-1 size-4" />
            </Link>
            <Link
              href="https://github.com/AryanSaxenaa/Mr.Bill"
              className={cn(buttonVariants({ variant: "outline" }), "border-oat")}
              target="_blank"
              rel="noopener noreferrer"
            >
              View on GitHub
            </Link>
          </div>
        </div>

        <div className="page-enter">
          <QuoteDeskMock />
        </div>
      </main>

      <footer className="relative z-10 border-t border-oat py-8 text-center text-sm text-cocoa">
        <p>
          MIT licensed ·{" "}
          <Link
            href="https://github.com/AryanSaxenaa/Mr.Bill"
            className="text-terracotta underline"
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
