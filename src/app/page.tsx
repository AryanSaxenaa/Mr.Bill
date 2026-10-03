import Image from "next/image";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  ArrowRight,
  BarChart3,
  GitBranch,
  Mail,
  Search,
  Sparkles,
  CheckCircle2,
} from "lucide-react";

const GITHUB_URL = "https://github.com/AryanSaxenaa/Mr.Bill";

function OrderDeskMock() {
  return (
    <div
      className="relative w-full max-w-xl rounded-2xl border border-stripe-border bg-linen p-1 shadow-[0_24px_48px_-12px_rgba(10,37,64,0.35)] lg:ml-auto"
      aria-hidden
    >
      <div className="rounded-xl bg-surface p-4">
        <div className="mb-3 flex items-center justify-between gap-2 border-b border-stripe-border pb-3">
          <div>
            <p className="font-mono text-[11px] text-cocoa">ORD-2026-0142 · Maadi</p>
            <p className="text-base font-semibold text-navy">Order desk</p>
          </div>
          <span className="rounded-full border border-cyan-accent/30 bg-cyan-accent/10 px-2.5 py-0.5 text-xs font-medium text-cyan-accent">
            Quotes in
          </span>
        </div>
        <div className="overflow-hidden rounded-lg border border-stripe-border bg-linen text-xs">
          <div className="grid grid-cols-[minmax(0,1.1fr)_repeat(2,minmax(0,1fr))] border-b border-stripe-border bg-surface font-medium text-navy">
            <div className="p-2.5">Line</div>
            <div className="border-l border-stripe-border p-2.5">Cairo Dairy</div>
            <div className="border-l border-stripe-border p-2.5">Bean &amp; Barrel</div>
          </div>
          {(
            [
              { name: "Oat milk 1L", a: "42.50", b: "44.00", bestA: true, bestB: false },
              { name: "Cup 8oz", a: "1,180", b: "1,240", bestA: false, bestB: false },
              { name: "Espresso 1kg", a: "890", b: "820", bestA: false, bestB: true },
            ] as const
          ).map(({ name, a, b, bestA, bestB }) => (
            <div
              key={name}
              className="grid grid-cols-[minmax(0,1.1fr)_repeat(2,minmax(0,1fr))] border-b border-stripe-border last:border-0 text-cocoa"
            >
              <div className="p-2.5 font-medium text-navy">{name}</div>
              <div
                className={cn(
                  "border-l border-stripe-border p-2.5",
                  bestA && "bg-indigo-accent/10 font-medium text-navy",
                )}
              >
                EGP {a}
              </div>
              <div
                className={cn(
                  "border-l border-stripe-border p-2.5",
                  bestB && "bg-indigo-accent/10 font-medium text-navy",
                )}
              >
                EGP {b}
              </div>
            </div>
          ))}
          <div className="grid grid-cols-[minmax(0,1.1fr)_repeat(2,minmax(0,1fr))] bg-surface font-mono text-[11px] text-navy">
            <div className="p-2.5 font-semibold">Landed total</div>
            <div className="border-l border-stripe-border p-2.5">EGP 4,760</div>
            <div className="border-l border-stripe-border p-2.5">EGP 4,832</div>
          </div>
        </div>
        <p className="mt-3 flex items-center gap-1.5 text-xs text-cocoa">
          <CheckCircle2 className="size-3.5 text-sage" aria-hidden />
          Primary Cairo Dairy · Reserve Bean &amp; Barrel on espresso
        </p>
      </div>
    </div>
  );
}

const FEATURES = [
  {
    title: "SerpAPI discovery",
    body:
      "Surface real wholesalers and distributors near each branch — merged with your catalog suppliers before RFQ.",
    icon: Search,
    accent: "from-indigo-accent/15 to-cyan-accent/10",
  },
  {
    title: "AgentMail RFQ",
    body:
      "Structured outbound RFQs with line items, MOQ hints, and need-by dates — tracked on the order desk, not lost in inbox threads.",
    icon: Mail,
    accent: "from-cyan-accent/15 to-sage/10",
  },
  {
    title: "Quote compare",
    body:
      "Landed cost matrix in EGP with delivery days, split recommendations, and one-click approval into inventory.",
    icon: BarChart3,
    accent: "from-sage/15 to-indigo-accent/10",
  },
] as const;

const STEPS = [
  {
    step: "01",
    title: "Intake the restock",
    body: "Paste a branch note or add SKUs — Mr.Bill structures lines per café.",
  },
  {
    step: "02",
    title: "Discover suppliers",
    body: "SerpAPI plus catalog picks who gets the RFQ for this basket.",
  },
  {
    step: "03",
    title: "Collect quotes",
    body: "AgentMail sends RFQs; replies attach to the same order ID.",
  },
  {
    step: "04",
    title: "Compare & approve",
    body: "Landed totals, splits, and inventory sync — auditable on the desk.",
  },
] as const;

const LOGO_STRIP = [
  "Maison Layla",
  "Cairo Dairy",
  "Bean & Barrel",
  "SerpAPI",
  "AgentMail",
  "OpenRouter",
] as const;

export default function LandingPage() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-surface">
      <section className="hero-dark relative overflow-hidden text-white">
        <Image
          src="/assets/gradient-mesh.svg"
          alt=""
          width={1200}
          height={800}
          className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-90"
          priority
        />
        <Image
          src="/assets/grid-lines.svg"
          alt=""
          width={1200}
          height={800}
          className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-40 mix-blend-soft-light"
          priority
        />

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
              · F&amp;B procurement
            </span>
          </div>
          <nav className="flex items-center gap-2">
            <Link
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden text-sm text-white/70 hover:text-white sm:inline"
            >
              GitHub
            </Link>
            <Link
              href="/app/orders"
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white",
              )}
            >
              Open app
            </Link>
          </nav>
        </header>

        <main className="relative z-10 mx-auto grid max-w-6xl gap-12 px-6 pb-16 pt-4 lg:grid-cols-2 lg:items-center lg:gap-16 lg:pb-24 lg:pt-8">
          <div className="page-enter space-y-6">
            <p className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-sm font-medium text-cyan-accent">
              <Sparkles className="size-4" strokeWidth={1.75} />
              Open-source order desk + agent
            </p>
            <h1 className="text-4xl font-bold leading-[1.08] tracking-tight md:text-5xl lg:text-[3.35rem]">
              Run procurement like a{" "}
              <span className="text-gradient-brand">modern ops team</span>
            </h1>
            <p className="max-w-lg text-lg leading-relaxed text-white/72">
              Mr.Bill is the F&amp;B procurement stack your multi-branch operator
              actually needs — structured intake, supplier discovery, RFQ, landed-cost
              compare, and inventory sync. Built for desks, not chat demos.
            </p>
            <div className="flex flex-wrap gap-3 pt-1">
              <Link
                href="/app/orders/new"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "bg-white text-navy hover:bg-white/90",
                )}
              >
                Open app
                <ArrowRight className="ml-1 size-4" />
              </Link>
              <Link
                href={GITHUB_URL}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "border-white/25 bg-transparent text-white hover:bg-white/10",
                )}
              >
                <GitBranch className="mr-1.5 size-4" />
                GitHub
              </Link>
            </div>
            <p className="text-sm text-white/50">
              MIT licensed · Demo mode + OpenRouter-ready agent tools
            </p>
          </div>

          <div className="page-enter min-w-0">
            <OrderDeskMock />
          </div>
        </main>
      </section>

      <section className="border-b border-stripe-border bg-linen py-8">
        <div className="mx-auto max-w-6xl px-6">
          <p className="mb-4 text-center text-xs font-medium uppercase tracking-widest text-cocoa">
            Built for operators integrating
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-3">
            {LOGO_STRIP.map((name) => (
              <span
                key={name}
                className="text-sm font-semibold text-navy/70"
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-navy">
            Three tools, one desk
          </h2>
          <p className="mt-3 text-cocoa">
            Discovery, outbound RFQ, and quote math — wired to the same order ID
            your team already tracks.
          </p>
        </div>
        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {FEATURES.map((item) => (
            <div
              key={item.title}
              className="card-shadow group relative overflow-hidden rounded-2xl border border-stripe-border bg-linen p-6"
            >
              <div
                className={cn(
                  "mb-4 inline-flex rounded-xl bg-gradient-to-br p-3",
                  item.accent,
                )}
              >
                <item.icon className="size-6 text-indigo-accent" strokeWidth={1.75} />
              </div>
              <h3 className="text-lg font-semibold text-navy">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-cocoa">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-stripe-border bg-linen/60 py-20">
        <div className="mx-auto grid max-w-6xl gap-12 px-6 lg:grid-cols-2 lg:items-center">
          <div>
            <h2 className="text-3xl font-semibold tracking-tight text-navy">
              How it works
            </h2>
            <p className="mt-3 text-cocoa">
              From a Friday restock note to approved PO splits — four steps on the
              same pipeline your GM can audit.
            </p>
            <ol className="mt-8 space-y-6">
              {STEPS.map((item) => (
                <li key={item.step} className="flex gap-4">
                  <span className="font-mono text-sm font-semibold text-indigo-accent">
                    {item.step}
                  </span>
                  <div>
                    <p className="font-medium text-navy">{item.title}</p>
                    <p className="mt-1 text-sm text-cocoa">{item.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Image
              src="/assets/undraw-delivery-truck.svg"
              alt=""
              width={320}
              height={240}
              className="mx-auto w-full max-w-xs"
            />
            <Image
              src="/assets/undraw-inbox-rfq.svg"
              alt=""
              width={320}
              height={240}
              className="mx-auto w-full max-w-xs sm:mt-8"
            />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="card-shadow relative overflow-hidden rounded-3xl border border-stripe-border bg-gradient-to-br from-navy to-[#0d3358] px-8 py-12 text-center text-white md:px-16">
          <Image
            src="/assets/undraw-analytics.svg"
            alt=""
            width={200}
            height={160}
            className="pointer-events-none absolute -right-4 -bottom-4 hidden opacity-20 md:block"
          />
          <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
            Ready to run your next restock on the desk?
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-white/70">
            Start with demo data — swap in SerpAPI, AgentMail, and OpenRouter when
            you are ready for production.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/app/dashboard"
              className={cn(
                buttonVariants({ size: "lg" }),
                "bg-white text-navy hover:bg-white/90",
              )}
            >
              Open app
            </Link>
            <Link
              href="/app/orders/new"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "border-white/30 text-white hover:bg-white/10",
              )}
            >
              Create order
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-stripe-border bg-linen">
        <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-12 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-lg font-semibold text-navy">Mr.Bill</p>
            <p className="mt-1 max-w-xs text-sm text-cocoa">
              Open-source procurement for food &amp; beverage SMEs.
            </p>
          </div>
          <div className="flex flex-wrap gap-x-10 gap-y-4 text-sm">
            <div className="space-y-2">
              <p className="font-medium text-navy">Product</p>
              <ul className="space-y-1 text-cocoa">
                <li>
                  <Link href="/app/orders" className="hover:text-indigo-accent">
                    Orders
                  </Link>
                </li>
                <li>
                  <Link href="/app/quotes" className="hover:text-indigo-accent">
                    Quote desk
                  </Link>
                </li>
                <li>
                  <Link href="/app/inventory" className="hover:text-indigo-accent">
                    Inventory
                  </Link>
                </li>
              </ul>
            </div>
            <div className="space-y-2">
              <p className="font-medium text-navy">Project</p>
              <ul className="space-y-1 text-cocoa">
                <li>
                  <Link
                    href={GITHUB_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-indigo-accent"
                  >
                    GitHub
                  </Link>
                </li>
                <li>
                  <Link href="/app/orders/new" className="hover:text-indigo-accent">
                    New order
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <p className="border-t border-stripe-border py-6 text-center text-xs text-cocoa">
          Illustrations from unDraw (MIT) via undraw-svg · Mr.Bill MIT License
        </p>
      </footer>
    </div>
  );
}
