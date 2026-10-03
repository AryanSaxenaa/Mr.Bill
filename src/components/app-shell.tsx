"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  MessageSquarePlus,
  Table2,
  Package,
  Coffee,
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
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/app/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/app/request", label: "New request", icon: MessageSquarePlus },
  { href: "/app/quotes", label: "Quotes", icon: Table2 },
  { href: "/app/inventory", label: "Inventory", icon: Package },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { branchFilter, setBranchFilter } = useAppState();

  return (
    <div className="flex min-h-screen bg-cream">
      <aside className="hidden w-60 shrink-0 border-r border-oat bg-linen md:flex md:flex-col">
        <div className="flex items-center gap-2 border-b border-oat px-5 py-5">
          <Coffee className="size-6 text-espresso" strokeWidth={1.75} />
          <div>
            <p className="font-display text-lg font-semibold text-espresso">
              Mr.Bill
            </p>
            <p className="text-xs text-cocoa">Maison Layla</p>
          </div>
        </div>
        <nav className="flex flex-1 flex-col gap-1 p-3">
          {NAV.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-150",
                  active
                    ? "bg-espresso text-linen"
                    : "text-cocoa hover:bg-oat/60 hover:text-espresso",
                )}
              >
                <item.icon className="size-4 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-oat bg-linen/80 px-4 py-3 backdrop-blur-sm md:px-8">
          <div className="flex items-center gap-2 md:hidden">
            <Coffee className="size-5 text-espresso" />
            <span className="font-display font-semibold text-espresso">
              Mr.Bill
            </span>
          </div>
          <p className="text-sm text-cocoa">
            Procurement on autopilot for your cafés
          </p>
          <div className="flex items-center gap-2">
            <span className="text-xs text-cocoa">Branch</span>
            <Select
              value={branchFilter}
              onValueChange={(v) =>
                setBranchFilter(v as BranchId | "all")
              }
            >
              <SelectTrigger className="w-[160px] border-oat bg-cream">
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

        <main className="page-enter flex-1 p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
