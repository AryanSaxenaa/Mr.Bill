"use client";

import {
  createContext,
  useCallback,
  useContext,
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

interface AppStateValue {
  branchFilter: BranchId | "all";
  setBranchFilter: (b: BranchId | "all") => void;
  inventory: InventoryRow[];
  audit: AuditEntry[];
  requestStatus: "idle" | "confirmed" | "rfq_sent" | "quotes_parsed" | "approved";
  setRequestStatus: (s: AppStateValue["requestStatus"]) => void;
  applyInventoryApproval: (approvedBy: string) => void;
}

const AppStateContext = createContext<AppStateValue | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [branchFilter, setBranchFilter] = useState<BranchId | "all">("all");
  const [inventory, setInventory] = useState<InventoryRow[]>(INITIAL_INVENTORY);
  const [audit, setAudit] = useState<AuditEntry[]>(INITIAL_AUDIT);
  const [requestStatus, setRequestStatus] =
    useState<AppStateValue["requestStatus"]>("idle");

  const applyInventoryApproval = useCallback((approvedBy: string) => {
    setInventory((prev) =>
      prev.map((row) => {
        if (row.branchId === "maadi" && row.sku === "OAT-1L") {
          return { ...row, qty: row.qty + 48 };
        }
        if (row.branchId === "maadi" && row.sku === "CUP-8OZ") {
          return { ...row, qty: row.qty + 4 };
        }
        if (row.branchId === "zamalek" && row.sku === "ESP-1KG") {
          return { ...row, qty: row.qty + 2 };
        }
        return row;
      }),
    );
    setAudit((prev) => [
      ...prev,
      {
        id: `aud-${prev.length}`,
        at: new Date().toISOString(),
        message:
          "Approved split order — Maadi oat milk + cups, Zamalek espresso blend updated.",
        approvedBy,
      },
    ]);
    setRequestStatus("approved");
  }, []);

  const value = useMemo(
    () => ({
      branchFilter,
      setBranchFilter,
      inventory,
      audit,
      requestStatus,
      setRequestStatus,
      applyInventoryApproval,
    }),
    [
      branchFilter,
      inventory,
      audit,
      requestStatus,
      applyInventoryApproval,
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
