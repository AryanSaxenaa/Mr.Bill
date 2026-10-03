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
    <section className="border-y border-stripe-border bg-linen">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid gap-8 py-12 sm:grid-cols-2 lg:grid-cols-4 md:py-16">
          {STATS.map((stat) => (
            <div key={stat.label} className="text-center sm:text-left">
              <p className="font-display text-3xl font-semibold tracking-tight text-navy md:text-4xl">
                {stat.value}
              </p>
              <p className="mt-1 text-sm font-medium text-navy">
                {stat.label}
              </p>
              <p className="mt-1 text-sm text-cocoa">{stat.detail}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
