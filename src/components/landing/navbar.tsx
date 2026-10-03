import Image from "next/image";
import Link from "next/link";
import { TourLaunchButton } from "@/components/tour/tour-launch-button";
import { GITHUB_URL } from "./constants";

const navLinkClass =
  "text-sm font-medium text-cocoa transition hover:text-navy";

export function LandingNavbar() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-stripe-border bg-linen/95 shadow-sm backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <Image
            src="/assets/icons/coffee-bean.svg"
            alt=""
            width={28}
            height={28}
            className="size-7"
          />
          <span className="font-display text-lg font-semibold tracking-tight text-navy">
            Mr.Bill
          </span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex" aria-label="Main">
          <Link href="#product" className={navLinkClass}>
            Product
          </Link>
          <Link href="#how-it-works" className={navLinkClass}>
            How it works
          </Link>
          <Link
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={navLinkClass}
          >
            GitHub
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={`${navLinkClass} md:hidden`}
          >
            GitHub
          </Link>
          <TourLaunchButton />
          <Link
            href="/app/orders"
            data-tour="open-desk"
            className="inline-flex items-center justify-center rounded-lg bg-navy px-3.5 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-navy/90"
          >
            Open order desk
          </Link>
        </div>
      </div>
    </header>
  );
}
