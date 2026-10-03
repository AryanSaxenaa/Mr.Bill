"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  INITIAL_AUDIT,
  INITIAL_INVENTORY,
  type AuditEntry,
  type BranchId,
  type InventoryRow,
} from "./mock-data";
import type { InventoryDelta } from "./agent-tools";

const INVENTORY_KEY = "mrbill-inventory-v1";
const AUDIT_KEY = "mrbill-audit-v1";

interface AppStateValue {
  branchFilter: BranchId | "all";
  setBranchFilter: (b: BranchId | "all") => void;
  inventory: InventoryRow[];
  audit: AuditEntry[];
  requestStatus: "idle" | "confirmed" | "rfq_sent" | "quotes_parsed" | "approved";
  setRequestStatus: (s: AppStateValue["requestStatus"]) => void;
  applyInventoryApproval: (approvedBy: string) => void;
  applyInventoryDeltas: (deltas: InventoryDelta[], approvedBy: string) => void;
}

const AppStateContext = createContext<AppStateValue | null>(null);

function loadJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [branchFilter, setBranchFilter] = useState<BranchId | "all">("all");
  const [inventory, setInventory] = useState<InventoryRow[]>(INITIAL_INVENTORY);
  const [audit, setAudit] = useState<AuditEntry[]>(INITIAL_AUDIT);
  const [requestStatus, setRequestStatus] =
    useState<AppStateValue["requestStatus"]>("idle");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setInventory(loadJson(INVENTORY_KEY, INITIAL_INVENTORY));
    setAudit(loadJson(AUDIT_KEY, INITIAL_AUDIT));
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(INVENTORY_KEY, JSON.stringify(inventory));
  }, [inventory, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(AUDIT_KEY, JSON.stringify(audit));
  }, [audit, hydrated]);

  const applyInventoryDeltas = useCallback(
    (deltas: InventoryDelta[], approvedBy: string) => {
      setInventory((prev) =>
        prev.map((row) => {
          const delta = deltas.find(
            (d) => d.branchId === row.branchId && d.sku === row.sku,
          );
          if (!delta) return row;
          return { ...row, qty: delta.newQty };
        }),
      );
      setAudit((prev) => [
        ...prev,
        {
          id: `aud-${prev.length}`,
          at: new Date().toISOString(),
          message: `Inventory updated from approved order (${deltas.length} rows).`,
          approvedBy,
        },
      ]);
      setRequestStatus("approved");
    },
    [],
  );

  const applyInventoryApproval = useCallback(
    (approvedBy: string) => {
      applyInventoryDeltas(
        [
          {
            branchId: "maadi",
            sku: "OAT-1L",
            delta: 48,
            newQty: 0,
          },
          {
            branchId: "maadi",
            sku: "CUP-8OZ",
            delta: 4,
            newQty: 0,
          },
          {
            branchId: "zamalek",
            sku: "ESP-1KG",
            delta: 2,
            newQty: 0,
          },
        ].map((d) => {
          const row = inventory.find(
            (r) => r.branchId === d.branchId && r.sku === d.sku,
          );
          const prev = row?.qty ?? 0;
          return { ...d, newQty: prev + d.delta };
        }),
        approvedBy,
      );
    },
    [applyInventoryDeltas, inventory],
  );

  const value = useMemo(
    () => ({
      branchFilter,
      setBranchFilter,
      inventory,
      audit,
      requestStatus,
      setRequestStatus,
      applyInventoryApproval,
      applyInventoryDeltas,
    }),
    [
      branchFilter,
      inventory,
      audit,
      requestStatus,
      applyInventoryApproval,
      applyInventoryDeltas,
    ],
  );

  return (
    <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>
  );
}

export function useAppState(): AppStateValue {
  const ctx = useContext(AppStateContext);
  if (!ctx) {
    throw new Error("useAppState must be used within AppStateProvider");
  }
  return ctx;
}
