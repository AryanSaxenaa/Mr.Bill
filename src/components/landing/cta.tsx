import Link from "next/link";

export function LandingCta() {
  return (
    <section className="bg-gray-50 py-12 md:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="rounded-2xl bg-[#0A2540] px-6 py-12 text-center shadow-xl md:px-12 md:py-16">
          <h2 className="text-3xl font-bold text-white md:text-4xl">
            Start a restock order in minutes
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-slate-300">
            Open the order desk with demo data, run a full RFQ-to-approve flow,
            and see landed cost in EGP before your next Friday delivery window.
          </p>
          <div className="mx-auto mt-8 max-w-xs sm:flex sm:max-w-none sm:justify-center sm:gap-4">
            <Link
              className="group mb-4 inline-flex w-full items-center justify-center rounded-lg bg-white px-4 py-3 text-sm font-semibold text-[#0A2540] shadow-sm transition hover:bg-slate-100 sm:mb-0 sm:w-auto"
              href="/app/orders/new"
            >
              <span className="inline-flex items-center">
                Create order
                <span className="ml-1 transition-transform group-hover:translate-x-0.5">
                  →
                </span>
              </span>
            </Link>
            <Link
              className="inline-flex w-full items-center justify-center rounded-lg border border-white/30 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10 sm:w-auto"
              href="/app/orders"
            >
              Open order desk
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
