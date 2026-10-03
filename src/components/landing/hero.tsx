import Image from "next/image";
import Link from "next/link";
import { PageIllustration } from "./page-illustration";
import { GITHUB_URL } from "./constants";

const TEAM_AVATARS = [
  "avatar-01.jpg",
  "avatar-02.jpg",
  "avatar-03.jpg",
  "avatar-04.jpg",
  "avatar-05.jpg",
  "avatar-06.jpg",
] as const;

function QuoteDeskMock() {
  const suppliers = ["Cairo Dairy", "Bean & Barrel"];
  const rows = [
    { item: "Whole milk 1L", prices: ["EGP 42", "EGP 39"], best: 1 },
    { item: "Espresso beans 1kg", prices: ["EGP 680", "EGP 695"], best: 0 },
    { item: "Oat milk 1L", prices: ["EGP 58", "EGP 55"], best: 1 },
  ];

  return (
    <div className="overflow-hidden rounded-xl border border-stripe-border bg-linen shadow-xl ring-1 ring-black/5">
      <div className="flex items-center gap-2 border-b border-stripe-border bg-white px-4 py-2.5">
        <div className="flex gap-1.5" aria-hidden>
          <span className="size-2.5 rounded-full bg-red-400/90" />
          <span className="size-2.5 rounded-full bg-amber-400/90" />
          <span className="size-2.5 rounded-full bg-emerald-400/90" />
        </div>
        <div className="mx-auto max-w-md flex-1 truncate rounded-md bg-surface px-3 py-1 text-center text-xs text-slate-600">
          mrbill.app · Quote desk · ORD-2026-0142
        </div>
      </div>

      <div className="border-b border-stripe-border bg-white px-4 py-3 sm:px-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-sage">
              Quote desk
            </p>
            <p className="font-display text-lg font-semibold text-[#0A2540]">
              Maadi branch · Friday restock
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-sage/15 px-2.5 py-0.5 text-xs font-medium text-sage">
              2 quotes in
            </span>
            <span className="rounded-full bg-indigo-accent/10 px-2.5 py-0.5 text-xs font-medium text-indigo-accent">
              Compare ready
            </span>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto px-2 pb-3 pt-2 sm:px-4">
        <table className="w-full min-w-[320px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-stripe-border text-xs font-medium text-slate-600">
              <th className="py-2 pr-3 font-medium">Line item</th>
              {suppliers.map((name) => (
                <th key={name} className="px-2 py-2 text-right font-medium">
                  {name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="text-cocoa">
            {rows.map((row) => (
              <tr key={row.item} className="border-b border-stripe-border/80">
                <td className="py-2.5 pr-3 font-medium text-[#0A2540]">
                  {row.item}
                </td>
                {row.prices.map((price, i) => (
                  <td
                    key={i}
                    className={`px-2 py-2.5 text-right tabular-nums ${
                      row.best === i
                        ? "font-semibold text-sage"
                        : "text-slate-600"
                    }`}
                  >
                    {price}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td className="pt-3 text-xs text-slate-600">Landed total</td>
              <td className="px-2 pt-3 text-right text-xs text-slate-600">
                EGP 4,820
              </td>
              <td className="px-2 pt-3 text-right text-xs font-semibold text-sage">
                EGP 4,760
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

export function LandingHero() {
  return (
    <section className="relative bg-gray-50">
      <PageIllustration />
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="pb-12 pt-28 md:pb-20 md:pt-36">
          <div className="pb-12 text-center md:pb-16">
            <div
              className="mb-6 border-y [border-image:linear-gradient(to_right,transparent,--theme(--color-slate-300/.8),transparent)1]"
            >
              <div className="-mx-0.5 flex justify-center -space-x-3">
                {TEAM_AVATARS.map((file) => (
                  <Image
                    key={file}
                    className="box-content rounded-full border-2 border-gray-50"
                    src={`/assets/landing/${file}`}
                    width={32}
                    height={32}
                    alt=""
                  />
                ))}
              </div>
              <p className="mt-3 text-sm text-slate-600">
                Trusted by multi-branch F&amp;B operators in Cairo
              </p>
            </div>
            <h1
              className="mb-6 border-y text-5xl font-bold text-[#0A2540] [border-image:linear-gradient(to_right,transparent,--theme(--color-slate-300/.8),transparent)1] md:text-6xl"
            >
              The procurement desk your{" "}
              <br className="max-lg:hidden" />
              cafés already need
            </h1>
            <div className="mx-auto max-w-3xl">
              <p className="mb-8 text-lg text-slate-600">
                Mr.Bill turns restock notes into structured RFQs, collects supplier
                quotes in EGP, compares landed cost, and syncs inventory — one
                order ID from intake to approval.
              </p>
              <div className="relative before:absolute before:inset-0 before:border-y before:[border-image:linear-gradient(to_right,transparent,--theme(--color-slate-300/.8),transparent)1]">
                <div className="mx-auto max-w-xs sm:flex sm:max-w-none sm:justify-center">
                  <Link
                    className="group mb-4 inline-flex w-full items-center justify-center rounded-lg px-4 py-[11px] text-sm font-medium whitespace-nowrap shadow-lg transition-all bg-linear-to-t from-indigo-accent to-indigo-accent/85 bg-[length:100%_100%] bg-[bottom] text-white hover:bg-[length:100%_150%] sm:mb-0 sm:w-auto"
                    href="/app/orders"
                  >
                    <span className="relative inline-flex items-center">
                      Open order desk
                      <span className="ml-1 tracking-normal text-indigo-200 transition-transform group-hover:translate-x-0.5">
                        →
                      </span>
                    </span>
                  </Link>
                  <Link
                    className="inline-flex w-full items-center justify-center rounded-lg px-4 py-[11px] text-sm font-medium whitespace-nowrap shadow-lg transition-all bg-white text-[#0A2540] hover:bg-gray-50 sm:ml-4 sm:w-auto"
                    href={GITHUB_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View on GitHub
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="mx-auto max-w-4xl">
            <QuoteDeskMock />
          </div>
        </div>
      </div>
    </section>
  );
}
