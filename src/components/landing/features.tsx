import Image from "next/image";

const FEATURES = [
  {
    title: "SerpAPI discovery",
    body:
      "Surface wholesalers near each branch and merge them with catalog suppliers before the RFQ goes out.",
    iconPath:
      "M2 4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V4Zm2-4a4 4 0 0 0-4 4v8a4 4 0 0 0 4 4h8a4 4 0 0 0 4-4V4a4 4 0 0 0-4-4H4Zm1 10a1 1 0 1 0 0 2h6a1 1 0 1 0 0-2H5Z",
  },
  {
    title: "AgentMail RFQ",
    body:
      "Structured outbound with line items and need-by dates — replies attach to the same order ID on the desk.",
    iconPath:
      "M14.29 2.614a1 1 0 0 0-1.58-1.228L6.407 9.492l-3.199-3.2a1 1 0 1 0-1.414 1.415l4 4a1 1 0 0 0 1.496-.093l7-9ZM1 14a1 1 0 1 0 0 2h14a1 1 0 1 0 0-2H1Z",
  },
  {
    title: "Quote compare",
    body:
      "Landed cost matrix in EGP with delivery days, split recommendations, and inventory sync after approval.",
    iconPath:
      "M8 0a1 1 0 0 1 1 1v14a1 1 0 1 1-2 0V1a1 1 0 0 1 1-1Zm6 3a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h1a1 1 0 1 1 0 2h-1a3 3 0 0 1-3-3V4a3 3 0 0 1 3-3h1a1 1 0 1 1 0 2h-1ZM1 1a1 1 0 0 0 0 2h1a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H1a1 1 0 1 0 0 2h1a3 3 0 0 0 3-3V4a3 3 0 0 0-3-3H1Z",
  },
  {
    title: "Ask Mr.Bill",
    body:
      "Parse restock notes into line items, draft RFQs, and explain recommendations — demo or OpenRouter live.",
    iconPath:
      "M10.284.33a1 1 0 1 0-.574 1.917 6.049 6.049 0 0 1 2.417 1.395A1 1 0 0 0 13.5 2.188 8.034 8.034 0 0 0 10.284.33ZM6.288 2.248A1 1 0 0 0 5.718.33 8.036 8.036 0 0 0 2.5 2.187a1 1 0 0 0 1.372 1.455 6.036 6.036 0 0 1 2.415-1.395ZM1.42 5.401a1 1 0 0 1 .742 1.204 6.025 6.025 0 0 0 0 2.79 1 1 0 0 1-1.946.462 8.026 8.026 0 0 1 0-3.714A1 1 0 0 1 1.421 5.4Zm2.452 6.957A1 1 0 0 0 2.5 13.812a8.036 8.036 0 0 0 3.216 1.857 1 1 0 0 0 .574-1.916 6.044 6.044 0 0 1-2.417-1.395Zm9.668.04a1 1 0 0 1-.041 1.414 8.033 8.033 0 0 1-3.217 1.857 1 1 0 1 1-.571-1.917 6.035 6.035 0 0 0 2.415-1.395 1 1 0 0 1 1.414.042Zm2.242-6.255a1 1 0 1 0-1.946.462 6.03 6.03 0 0 1 0 2.79 1 1 0 1 0 1.946.462 8.022 8.022 0 0 0 0-3.714Z",
  },
  {
    title: "Branch inventory",
    body:
      "Approved splits update per-branch stock with an audit trail your GM can replay before month-end.",
    iconPath:
      "M8 0a1 1 0 0 1 1 1v14a1 1 0 1 1-2 0V1a1 1 0 0 1 1-1Zm6 3a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h1a1 1 0 1 1 0 2h-1a3 3 0 0 1-3-3V4a3 3 0 0 1 3-3h1a1 1 0 1 1 0 2h-1ZM1 1a1 1 0 0 0 0 2h1a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H1a1 1 0 1 0 0 2h1a3 3 0 0 0 3-3V4a3 3 0 0 0-3-3H1Z",
  },
  {
    title: "Demo-ready",
    body:
      "Keyless demo mode mirrors the live agent tool pipeline — swap in API keys when you are production-ready.",
    iconPath:
      "M9 1a1 1 0 1 0-2 0v6a1 1 0 0 0 2 0V1ZM4.572 3.08a1 1 0 0 0-1.144-1.64A7.987 7.987 0 0 0 0 8a8 8 0 0 0 16 0c0-2.72-1.36-5.117-3.428-6.56a1 1 0 1 0-1.144 1.64A5.987 5.987 0 0 1 14 8 6 6 0 1 1 2 8a5.987 5.987 0 0 1 2.572-4.92Z",
  },
] as const;

export function LandingFeatures() {
  return (
    <section className="relative before:absolute before:inset-0 before:-z-20 before:bg-gray-900">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="py-12 md:py-20">
          <div className="mx-auto max-w-3xl pb-16 text-center md:pb-20">
            <h2 className="text-3xl font-bold text-gray-200 md:text-4xl">
              One desk for discovery, RFQ, compare, and approve
            </h2>
            <p className="mt-4 text-gray-400">
              Built for Maison Layla-style operators — not another chat widget lost
              in Slack threads.
            </p>
          </div>

          <div className="pb-16 md:pb-20">
            <div className="text-center">
              <div className="relative inline-flex rounded-full before:absolute before:inset-0 before:-z-10 before:scale-[.85] before:animate-[pulse_4s_cubic-bezier(.4,0,.6,1)_infinite] before:bg-linear-to-b before:from-indigo-900 before:to-sky-700/50 before:blur-3xl after:absolute after:inset-0 after:rounded-[inherit] after:[background:radial-gradient(closest-side,var(--color-indigo-accent),transparent)]">
                <Image
                  className="rounded-full bg-gray-900"
                  src="/assets/landing/planet.png"
                  width={400}
                  height={400}
                  alt=""
                />
                <div className="pointer-events-none" aria-hidden>
                  <Image
                    className="absolute -top-20 -right-64 z-10 max-w-none"
                    src="/assets/landing/planet-overlay.svg"
                    width={789}
                    height={755}
                    alt=""
                  />
                  <Image
                    className="absolute top-16 -left-28 z-10 animate-[float_4s_ease-in-out_infinite_both] opacity-80"
                    src="/assets/landing/planet-tag-01.png"
                    width={253}
                    height={56}
                    alt=""
                  />
                  <Image
                    className="absolute top-7 left-56 z-10 animate-[float_4s_ease-in-out_infinite_1s_both] opacity-30"
                    src="/assets/landing/planet-tag-02.png"
                    width={241}
                    height={56}
                    alt=""
                  />
                  <Image
                    className="absolute bottom-24 -left-20 z-10 animate-[float_4s_ease-in-out_infinite_2s_both] opacity-25"
                    src="/assets/landing/planet-tag-03.png"
                    width={243}
                    height={56}
                    alt=""
                  />
                  <Image
                    className="absolute bottom-32 left-64 z-10 animate-[float_4s_ease-in-out_infinite_3s_both] opacity-80"
                    src="/assets/landing/planet-tag-04.png"
                    width={251}
                    height={56}
                    alt=""
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="grid overflow-hidden sm:grid-cols-2 lg:grid-cols-3 *:relative *:p-6 *:before:absolute *:before:bg-gray-800 *:before:[block-size:100vh] *:before:[inline-size:1px] *:before:[inset-block-start:0] *:before:[inset-inline-start:-1px] *:after:absolute *:after:bg-gray-800 *:after:[block-size:1px] *:after:[inline-size:100vw] *:after:[inset-block-start:-1px] *:after:[inset-inline-start:0] md:*:p-10">
            {FEATURES.map((item) => (
              <article key={item.title}>
                <h3 className="mb-2 flex items-center space-x-2 font-medium text-gray-200">
                  <svg
                    className="fill-indigo-accent"
                    xmlns="http://www.w3.org/2000/svg"
                    width={16}
                    height={16}
                    viewBox="0 0 16 16"
                    aria-hidden
                  >
                    <path d={item.iconPath} />
                  </svg>
                  <span>{item.title}</span>
                </h3>
                <p className="text-[15px] text-gray-400">{item.body}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
