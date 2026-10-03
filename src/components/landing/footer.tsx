import Image from "next/image";
import Link from "next/link";
import { GITHUB_URL } from "./constants";

export function LandingFooter() {
  return (
    <footer className="bg-gray-50">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div
          className="grid gap-10 py-8 sm:grid-cols-12 md:py-12 border-t [border-image:linear-gradient(to_right,transparent,var(--color-slate-200),transparent)1]"
        >
          <div className="space-y-2 sm:col-span-12 lg:col-span-4">
            <div className="flex items-center gap-2">
              <Image
                src="/assets/icons/coffee-bean.svg"
                alt=""
                width={28}
                height={28}
                className="size-7"
              />
              <span className="text-lg font-semibold text-gray-900">Mr.Bill</span>
            </div>
            <p className="max-w-xs text-sm text-gray-600">
              Open-source procurement for food &amp; beverage SMEs. MIT License.
            </p>
          </div>

          <div className="space-y-2 sm:col-span-6 md:col-span-3 lg:col-span-2">
            <h3 className="text-sm font-medium text-gray-900">Product</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  className="text-gray-600 transition hover:text-gray-900"
                  href="/app/orders"
                >
                  Orders
                </Link>
              </li>
              <li>
                <Link
                  className="text-gray-600 transition hover:text-gray-900"
                  href="/app/quotes"
                >
                  Quote desk
                </Link>
              </li>
              <li>
                <Link
                  className="text-gray-600 transition hover:text-gray-900"
                  href="/app/inventory"
                >
                  Inventory
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-2 sm:col-span-6 md:col-span-3 lg:col-span-2">
            <h3 className="text-sm font-medium text-gray-900">Project</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  className="text-gray-600 transition hover:text-gray-900"
                  href={GITHUB_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  GitHub
                </Link>
              </li>
              <li>
                <Link
                  className="text-gray-600 transition hover:text-gray-900"
                  href="/app/orders/new"
                >
                  New order
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-2 sm:col-span-6 md:col-span-3 lg:col-span-2">
            <h3 className="text-sm font-medium text-gray-900">Credits</h3>
            <p className="text-sm text-gray-600">
              Landing adapted from{" "}
              <a
                className="text-indigo-accent hover:underline"
                href="https://github.com/cruip/tailwind-landing-page-template"
                target="_blank"
                rel="noopener noreferrer"
              >
                Cruip Simple Light
              </a>{" "}
              (free template).
            </p>
          </div>
        </div>
      </div>

      <div className="relative -mt-16 h-60 w-full overflow-hidden" aria-hidden>
        <div
          className="pointer-events-none absolute left-1/2 -z-10 -translate-x-1/2 text-center text-[min(22vw,348px)] font-bold leading-none before:bg-linear-to-b before:from-gray-200 before:to-gray-100/30 before:to-80% before:bg-clip-text before:text-transparent before:content-['Mr.Bill'] after:absolute after:inset-0 after:bg-gray-300/70 after:bg-clip-text after:text-transparent after:mix-blend-darken after:content-['Mr.Bill'] after:[text-shadow:0_1px_0_white]"
        />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-2/3">
          <div className="h-56 w-56 rounded-full border-[20px] border-indigo-accent/80 blur-[80px]" />
        </div>
      </div>
    </footer>
  );
}
