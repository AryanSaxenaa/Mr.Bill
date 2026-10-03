const STATS = [
  {
    label: "Hours saved per restock",
    value: "6+",
    detail: "vs. manual RFQ threads and spreadsheet compare",
  },
  {
    label: "Suppliers compared",
    value: "4",
    detail: "Side-by-side landed cost in EGP",
  },
  {
    label: "Branches on one desk",
    value: "3",
    detail: "Zamalek · Maadi · New Cairo",
  },
  {
    label: "Typical RFQ turnaround",
    value: "<24h",
    detail: "Structured email RFQ with tracked replies",
  },
] as const;

export function LandingStats() {
  return (
    <section className="border-y border-stripe-border bg-white">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid gap-8 py-12 sm:grid-cols-2 lg:grid-cols-4 md:py-16">
          {STATS.map((stat) => (
            <div key={stat.label} className="text-center sm:text-left">
              <p className="text-3xl font-bold tracking-tight text-[#0A2540] md:text-4xl">
                {stat.value}
              </p>
              <p className="mt-1 text-sm font-medium text-slate-900">
                {stat.label}
              </p>
              <p className="mt-1 text-sm text-slate-600">{stat.detail}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
