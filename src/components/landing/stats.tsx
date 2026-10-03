const STATS = [
  { label: "Branches on one desk", value: "3+", detail: "Zamalek · Maadi · New Cairo" },
  { label: "RFQ turnaround", value: "<24h", detail: "AgentMail + paste-parse fallback" },
  { label: "Landed compare", value: "EGP", detail: "MOQ, delivery, split PO" },
  { label: "Open source", value: "MIT", detail: "SerpAPI · AgentMail · OpenRouter" },
] as const;

export function LandingStats() {
  return (
    <section className="border-y border-gray-200/80 bg-white">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid gap-8 py-12 sm:grid-cols-2 lg:grid-cols-4 md:py-16">
          {STATS.map((stat) => (
            <div key={stat.label} className="text-center sm:text-left">
              <p className="text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">
                {stat.value}
              </p>
              <p className="mt-1 text-sm font-medium text-gray-900">{stat.label}</p>
              <p className="mt-1 text-sm text-gray-500">{stat.detail}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
