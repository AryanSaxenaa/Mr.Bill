import Link from "next/link";

export function LandingCta() {
  return (
    <section className="bg-surface py-12 md:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="rounded-2xl border border-navy/20 bg-navy px-6 py-12 text-center card-shadow md:px-12 md:py-16">
          <h2 className="font-display text-3xl font-semibold text-white md:text-4xl">
            Friday restock without the spreadsheet
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-white/80">
            Run the full chat → supplier → quote → approve flow for Maison Layla’s
            branches - landed cost in EGP before your next delivery window.
          </p>
          <div className="mx-auto mt-8 max-w-xs sm:flex sm:max-w-none sm:justify-center sm:gap-4">
            <Link
              className="group mb-4 inline-flex w-full items-center justify-center rounded-lg bg-linen px-4 py-3 text-sm font-semibold text-navy shadow-sm transition hover:bg-surface sm:mb-0 sm:w-auto"
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
