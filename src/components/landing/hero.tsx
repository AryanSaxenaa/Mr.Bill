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

export function LandingHero() {
  return (
    <section className="relative bg-gray-50">
      <PageIllustration />
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="pb-12 pt-32 md:pb-20 md:pt-40">
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
              <p className="mt-3 text-sm text-gray-600">
                Trusted by multi-branch F&amp;B operators in Cairo
              </p>
            </div>
            <h1
              className="mb-6 border-y text-5xl font-bold text-gray-900 [border-image:linear-gradient(to_right,transparent,--theme(--color-slate-300/.8),transparent)1] md:text-6xl"
            >
              The procurement desk your{" "}
              <br className="max-lg:hidden" />
              cafés already need
            </h1>
            <div className="mx-auto max-w-3xl">
              <p className="mb-8 text-lg text-gray-700">
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
                    className="inline-flex w-full items-center justify-center rounded-lg px-4 py-[11px] text-sm font-medium whitespace-nowrap shadow-lg transition-all bg-white text-gray-800 hover:bg-gray-50 sm:ml-4 sm:w-auto"
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

          <div className="mx-auto max-w-3xl">
            <div className="relative aspect-video rounded-2xl bg-gray-900 px-5 py-3 shadow-xl before:pointer-events-none before:absolute before:-inset-5 before:border-y before:[border-image:linear-gradient(to_right,transparent,--theme(--color-slate-300/.8),transparent)1] after:absolute after:-inset-5 after:-z-10 after:border-x after:[border-image:linear-gradient(to_bottom,transparent,--theme(--color-slate-300/.8),transparent)1]">
              <div className="relative mb-8 flex items-center justify-between before:block before:h-[9px] before:w-[41px] before:bg-[length:16px_9px] before:[background-image:radial-gradient(circle_at_4.5px_4.5px,var(--color-gray-600)_4.5px,transparent_0)] after:w-[41px]">
                <span className="text-[13px] font-medium text-white">
                  mr.bill · ORD-2026-0142
                </span>
              </div>
              <div className="font-mono text-sm text-gray-500 [&_span]:opacity-0">
                <span className="animate-[code-1_10s_infinite] text-gray-200">
                  rfq.send
                </span>{" "}
                <span className="animate-[code-2_10s_infinite]">
                  --branch=Maadi --lines=12
                </span>
                <br />
                <span className="animate-[code-3_10s_infinite]">
                  suppliers: Cairo Dairy, Bean &amp; Barrel
                </span>{" "}
                <span className="animate-[code-4_10s_infinite] text-emerald-400">
                  2 quotes received.
                </span>
                <br />
                <br />
                <span className="animate-[code-5_10s_infinite] text-gray-200">
                  compare.landed_cost
                </span>
                <br />
                <span className="animate-[code-6_10s_infinite] text-cyan-300">
                  Recommend split · EGP 4,760 total.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
