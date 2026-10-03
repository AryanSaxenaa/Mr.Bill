import Image from "next/image";
import Link from "next/link";
import { GITHUB_URL } from "./constants";

const navLinkClass =
  "text-sm font-medium text-slate-700 transition hover:text-slate-900";

export function LandingNavbar() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <Image
            src="/assets/icons/coffee-bean.svg"
            alt=""
            width={28}
            height={28}
            className="size-7"
          />
          <span className="text-lg font-semibold tracking-tight text-slate-900">
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
          <Link
            href="/app/orders"
            className="inline-flex items-center justify-center rounded-lg bg-[#0A2540] px-3.5 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-[#0A2540]/90"
          >
            Open order desk
          </Link>
        </div>
      </div>
    </header>
  );
}
