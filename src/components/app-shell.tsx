"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ClipboardList,
  Table2,
  Package,
  Coffee,
  PlusCircle,
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
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/app/orders", label: "Orders", icon: ClipboardList },
  { href: "/app/orders/new", label: "New order", icon: PlusCircle },
  { href: "/app/quotes", label: "Quote desk", icon: Table2 },
  { href: "/app/inventory", label: "Inventory", icon: Package },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { branchFilter, setBranchFilter, resetDemoData } = useAppState();

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

  return (
    <div className="flex min-h-screen overflow-x-hidden bg-surface">
      <aside className="hidden w-60 shrink-0 border-r border-stripe-border bg-linen md:flex md:flex-col">
        <div className="flex items-center gap-2 border-b border-stripe-border px-5 py-5">
          <Coffee className="size-6 text-indigo-accent" strokeWidth={1.75} />
          <div>
            <p className="text-lg font-semibold tracking-tight text-navy">
              Mr.Bill
            </p>
            <p className="text-xs text-cocoa">Order desk · Maison Layla</p>
          </div>
        </div>
        <nav className="flex flex-1 flex-col gap-0.5 p-3">
          {NAV.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
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
            <Coffee className="size-5 text-indigo-accent" strokeWidth={1.75} />
            <span className="font-semibold text-navy">Mr.Bill</span>
          </div>
          <p className="text-sm text-cocoa">
            Maison Layla · chat to vendor to quote — no spreadsheet chaos
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="border-stripe-border bg-surface text-cocoa"
              onClick={resetDemoData}
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

        <main className="page-enter min-w-0 flex-1 overflow-x-hidden p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
