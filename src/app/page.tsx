import Image from "next/image";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";

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
          href="/app/dashboard"
          className={cn(
            buttonVariants({ variant: "outline" }),
            "border-oat bg-linen",
          )}
        >
          Open app
        </Link>
      </header>

      <main className="relative z-10 mx-auto grid max-w-6xl gap-12 px-6 pb-20 pt-8 lg:grid-cols-2 lg:items-center lg:pt-16">
        <div className="page-enter space-y-6">
          <p className="text-sm font-medium uppercase tracking-wide text-sage">
            Agents at Work · Open-source F&B procurement
          </p>
          <h1 className="font-display text-4xl font-bold leading-tight text-espresso md:text-[2.25rem] lg:text-5xl">
            Procurement on autopilot for F&B.
          </h1>
          <p className="max-w-lg text-lg text-cocoa">
            Layla runs three specialty cafés across Cairo. Mr.Bill is an
            open-source agent loop — intake, RFQ, compare, decide, update
            records — without freight rails or payment complexity.
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
              <span>Chat intake → confirm line items per branch</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 size-2 rounded-full bg-terracotta" />
              <span>Compare landed unit costs in EGP with MOQ flags</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 size-2 rounded-full bg-sage" />
              <span>Approve a split recommendation → inventory ledger</span>
            </li>
          </ul>
          <div className="flex flex-wrap gap-3 pt-2">
            <Link
              href="/app/request"
              className={cn(
                buttonVariants(),
                "bg-espresso text-linen hover:bg-espresso/90",
              )}
            >
              Start demo request
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

        <div className="hidden page-enter lg:block">
          <Image
            src="/assets/hero-procurement.svg"
            alt="Mr.Bill procurement workflow illustration"
            width={480}
            height={360}
            className="card-shadow w-full max-w-md rounded-2xl lg:ml-auto"
            priority
          />
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
          · Built for hospitality operators
        </p>
      </footer>
    </div>
  );
}
