"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ClipboardList,
  Menu,
  Package,
  PlusCircle,
  Table2,
  X,
} from "lucide-react";
import { BRANCHES, type BranchId } from "@/lib/mock-data";
import { useAppState } from "@/lib/app-state";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { TourLaunchButton } from "@/components/tour/tour-launch-button";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/app/orders", label: "Orders", icon: ClipboardList, tour: "nav-orders" },
  { href: "/app/orders/new", label: "New order", icon: PlusCircle, tour: "nav-new-order" },
  { href: "/app/quotes", label: "Quote desk", icon: Table2, tour: "nav-quotes" },
  { href: "/app/inventory", label: "Inventory", icon: Package, tour: "nav-inventory" },
];

const RESET_TOAST_KEY = "mrbill-reset-toast";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { branchFilter, setBranchFilter, resetDemoData } = useAppState();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem(RESET_TOAST_KEY) === "1") {
      sessionStorage.removeItem(RESET_TOAST_KEY);
      setToast("Demo data reset. Start a new Friday restock when you are ready.");
      const timer = window.setTimeout(() => setToast(null), 4500);
      return () => window.clearTimeout(timer);
    }
    return undefined;
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const isActive = (href: string) => {
    if (href === "/app/orders") {
      return (
        pathname === "/app/orders" ||
        (pathname.startsWith("/app/orders/") &&
          !pathname.startsWith("/app/orders/new"))
      );
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const handleReset = () => {
    sessionStorage.setItem(RESET_TOAST_KEY, "1");
    resetDemoData();
  };

  return (
    <div className="flex min-h-screen overflow-x-hidden bg-surface">
      <aside
        data-tour="sidebar"
        className="hidden w-60 shrink-0 border-r border-stripe-border bg-linen md:flex md:flex-col"
      >
        <Link
          href="/"
          className="flex items-center gap-2 border-b border-stripe-border px-5 py-5 transition hover:bg-surface/50"
        >
          <Image
            src="/assets/icons/coffee-bean.svg"
            alt=""
            width={28}
            height={28}
            className="size-7"
          />
          <div>
            <p className="text-lg font-semibold tracking-tight text-navy">
              Mr.Bill
            </p>
            <p className="text-xs text-cocoa">Order desk · Maison Layla</p>
          </div>
        </Link>
        <nav className="flex flex-1 flex-col gap-0.5 p-3">
          {NAV.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                data-tour={item.tour}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-150",
                  active
                    ? "bg-indigo-accent/10 text-indigo-accent"
                    : "text-cocoa hover:bg-surface hover:text-navy",
                )}
              >
                <item.icon
                  className="size-4 shrink-0"
                  strokeWidth={active ? 2.25 : 1.75}
                />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-stripe-border bg-linen/90 px-4 py-3 backdrop-blur-sm md:px-8">
          <div className="flex items-center gap-2 md:hidden">
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              className="border-stripe-border"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              onClick={() => setMobileOpen((open) => !open)}
            >
              {mobileOpen ? (
                <X className="size-4" />
              ) : (
                <Menu className="size-4" />
              )}
            </Button>
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/assets/icons/coffee-bean.svg"
                alt=""
                width={24}
                height={24}
                className="size-6"
              />
              <span className="font-semibold text-navy">Mr.Bill</span>
            </Link>
          </div>
          <p className="hidden text-sm text-cocoa sm:block">
            Maison Layla · chat to vendor to quote - no spreadsheet chaos
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <TourLaunchButton className="h-8 px-3 text-[0.8rem]" />
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="border-stripe-border bg-surface text-cocoa"
              data-tour="reset-demo"
              onClick={handleReset}
            >
              Reset demo data
            </Button>
            <span className="text-xs text-cocoa">Branch</span>
            <Select
              value={branchFilter}
              onValueChange={(v) =>
                setBranchFilter(v as BranchId | "all")
              }
            >
              <SelectTrigger className="w-[160px] border-stripe-border bg-surface">
                <SelectValue placeholder="All branches" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All branches</SelectItem>
                {BRANCHES.map((b) => (
                  <SelectItem key={b.id} value={b.id}>
                    {b.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </header>

        {mobileOpen && (
          <nav className="border-b border-stripe-border bg-linen p-3 md:hidden">
            {NAV.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  data-tour={item.tour}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium",
                    active
                      ? "bg-indigo-accent/10 text-indigo-accent"
                      : "text-cocoa",
                  )}
                >
                  <item.icon className="size-4 shrink-0" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        )}

        {toast && (
          <div
            className="mx-4 mt-4 rounded-lg border border-sage/40 bg-sage/10 px-4 py-3 text-sm text-espresso md:mx-8"
            role="status"
          >
            {toast}
          </div>
        )}

        <main className="page-enter min-w-0 flex-1 overflow-x-hidden p-4 pb-24 md:p-8 md:pb-8">
          {children}
        </main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-stripe-border bg-linen md:hidden">
        <ul className="grid grid-cols-4">
          {NAV.map((item) => {
            const active = isActive(item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  data-tour={item.tour}
                  className={cn(
                    "flex flex-col items-center gap-1 px-1 py-2.5 text-[11px] font-medium",
                    active ? "text-indigo-accent" : "text-cocoa",
                  )}
                >
                  <item.icon
                    className="size-4"
                    strokeWidth={active ? 2.25 : 1.75}
                  />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
