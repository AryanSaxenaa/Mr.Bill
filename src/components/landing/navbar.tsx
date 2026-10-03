import Image from "next/image";
import Link from "next/link";
import { GITHUB_URL } from "./constants";

export function LandingNavbar() {
  return (
    <header className="fixed top-2 z-30 w-full md:top-6">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="relative flex h-14 items-center justify-between gap-3 rounded-2xl bg-white/90 px-3 shadow-lg shadow-black/[0.03] backdrop-blur-xs before:pointer-events-none before:absolute before:inset-0 before:rounded-[inherit] before:border before:border-transparent before:[background:linear-gradient(var(--color-gray-100),var(--color-gray-200))_border-box] before:[mask-composite:exclude_!important] before:[mask:linear-gradient(white_0_0)_padding-box,_linear-gradient(white_0_0)]">
          <Link href="/" className="flex flex-1 items-center gap-2">
            <Image
              src="/assets/icons/coffee-bean.svg"
              alt=""
              width={28}
              height={28}
              className="size-7"
            />
            <span className="text-lg font-semibold tracking-tight text-gray-900">
              Mr.Bill
            </span>
          </Link>
          <ul className="flex flex-1 items-center justify-end gap-3">
            <li className="hidden sm:block">
              <Link
                href={GITHUB_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-gray-600 transition hover:text-gray-900"
              >
                GitHub
              </Link>
            </li>
            <li>
              <Link
                href="/app/orders"
                className="inline-flex items-center justify-center rounded-lg px-3 py-[5px] text-sm font-medium whitespace-nowrap shadow-sm transition-all bg-gray-800 text-gray-100 hover:bg-gray-900"
              >
                Open order desk
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </header>
  );
}
