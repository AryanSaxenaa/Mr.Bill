import Image from "next/image";
import Link from "next/link";

export function LandingCta() {
  return (
    <section className="bg-gray-50 py-12 md:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="relative overflow-hidden rounded-2xl text-center shadow-xl before:pointer-events-none before:absolute before:inset-0 before:-z-10 before:rounded-2xl before:bg-gray-900">
          <div
            className="absolute bottom-0 left-1/2 -z-10 -translate-x-1/2 translate-y-1/2"
            aria-hidden
          >
            <div className="h-56 w-[480px] rounded-full border-[20px] border-indigo-accent blur-3xl" />
          </div>
          <div
            className="pointer-events-none absolute top-0 left-1/2 -z-10 -translate-x-1/2 transform"
            aria-hidden
          >
            <Image
              className="max-w-none"
              src="/assets/landing/stripes-dark.svg"
              width={768}
              height={432}
              alt=""
            />
          </div>
          <div className="px-4 py-12 md:px-12 md:py-20">
            <h2 className="mb-6 border-y text-3xl font-bold text-gray-200 [border-image:linear-gradient(to_right,transparent,--theme(--color-slate-700/.7),transparent)1] md:mb-12 md:text-4xl">
              Run your next Friday restock on the desk
            </h2>
            <p className="mx-auto mb-8 max-w-lg text-gray-400">
              Start with demo data on{" "}
              <span className="text-gray-300">/app/orders</span> — wire SerpAPI,
              AgentMail, and OpenRouter when you are ready.
            </p>
            <div className="mx-auto max-w-xs sm:flex sm:max-w-none sm:justify-center">
              <Link
                className="group mb-4 inline-flex w-full items-center justify-center rounded-lg px-4 py-[11px] text-sm font-medium whitespace-nowrap shadow-lg transition-all bg-linear-to-t from-indigo-accent to-indigo-accent/85 bg-[length:100%_100%] bg-[bottom] text-white hover:bg-[length:100%_150%] sm:mb-0 sm:w-auto"
                href="/app/orders/new"
              >
                <span className="relative inline-flex items-center">
                  Create order
                  <span className="ml-1 tracking-normal text-indigo-200 transition-transform group-hover:translate-x-0.5">
                    →
                  </span>
                </span>
              </Link>
              <Link
                className="mb-4 inline-flex w-full items-center justify-center rounded-lg px-4 py-[11px] text-sm font-medium whitespace-nowrap shadow-lg transition-all bg-white text-gray-800 hover:bg-gray-50 sm:mb-0 sm:ml-4 sm:w-auto"
                href="/app/dashboard"
              >
                Open dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
