export type BranchId = "zamalek" | "maadi" | "new-cairo";

export interface Branch {
  id: BranchId;
  name: string;
  code: string;
}

export interface Supplier {
  id: string;
  name: string;
  local: boolean;
  contact: string;
  /** AgentMail RFQ destination when MRBILL_RFQ_TO_EMAIL is unset */
  rfqEmail: string;
}

export interface LineItem {
  sku: string;
  name: string;
  qty: number;
  unit: string;
  branchId: BranchId;
}

export interface InventoryRow {
  branchId: BranchId;
  sku: string;
  name: string;
  qty: number;
  unit: string;
  parLevel: number;
}

export type OrderStage =
  | "draft"
  | "rfq_sent"
  | "quotes_in"
  | "recommended"
  | "approved";

export interface OrderRecord {
  id: string;
  title: string;
  branchId: BranchId;
  neededBy: string;
  createdAt: string;
  stage: OrderStage;
  lineItemCount: number;
  primarySupplierId?: string;
  fallbackSupplierId?: string;
  rfqId?: string;
}

export interface RequestRecord {
  id: string;
  status: OrderStage;
  lineItems: LineItem[];
  neededBy: string;
  createdAt: string;
}

export const BRANCHES: Branch[] = [
  { id: "zamalek", name: "Zamalek", code: "ZMK" },
  { id: "maadi", name: "Maadi", code: "MAD" },
  { id: "new-cairo", name: "New Cairo", code: "NCR" },
];

export const SUPPLIERS: Supplier[] = [
  {
    id: "cairo-dairy",
    name: "Cairo Dairy Co.",
    local: true,
    contact: "orders@cairodairy.example",
    rfqEmail: "procurement-demo+cairo-dairy@agentmail.to",
  },
  {
    id: "bean-barrel",
    name: "Bean & Barrel",
    local: true,
    contact: "wholesale@beanbarrel.example",
    rfqEmail: "procurement-demo+bean-barrel@agentmail.to",
  },
  {
    id: "nile-disposables",
    name: "Nile Disposables",
    local: true,
    contact: "sales@niledisp.example",
    rfqEmail: "procurement-demo+nile-disposables@agentmail.to",
  },
];

export const DEMO_INTAKE_TEXT =
  "Maadi is low on oat milk and cups before Friday; Zamalek needs 2kg espresso blend.";

export const PARSED_LINE_ITEMS: LineItem[] = [
  {
    sku: "OAT-1L",
    name: "Oat milk 1L",
    qty: 48,
    unit: "carton",
    branchId: "maadi",
  },
  {
    sku: "CUP-8OZ",
    name: "Cup 8oz (per 1000)",
    qty: 4,
    unit: "case",
    branchId: "maadi",
  },
  {
    sku: "ESP-1KG",
    name: "Espresso blend 1kg",
    qty: 2,
    unit: "bag",
    branchId: "zamalek",
  },
];

export const INITIAL_INVENTORY: InventoryRow[] = [
  {
    branchId: "maadi",
    sku: "OAT-1L",
    name: "Oat milk 1L",
    qty: 12,
    unit: "carton",
    parLevel: 36,
  },
  {
    branchId: "maadi",
    sku: "CUP-8OZ",
    name: "Cup 8oz (per 1000)",
    qty: 1,
    unit: "case",
    parLevel: 3,
  },
  {
    branchId: "zamalek",
    sku: "ESP-1KG",
    name: "Espresso blend 1kg",
    qty: 1,
    unit: "bag",
    parLevel: 4,
  },
  {
    branchId: "zamalek",
    sku: "OAT-1L",
    name: "Oat milk 1L",
    qty: 28,
    unit: "carton",
    parLevel: 30,
  },
  {
    branchId: "new-cairo",
    sku: "OAT-1L",
    name: "Oat milk 1L",
    qty: 22,
    unit: "carton",
    parLevel: 30,
  },
  {
    branchId: "new-cairo",
    sku: "CUP-8OZ",
    name: "Cup 8oz (per 1000)",
    qty: 2,
    unit: "case",
    parLevel: 3,
  },
];

export interface QuoteLine {
  sku: string;
  name: string;
  qty: number;
  unit: string;
  unitPrice: number;
  currency: "EGP";
  moq?: number;
  leadDays: number;
}

export interface Quote {
  id: string;
  rfqId: string;
  supplierId: string;
  validUntil: string;
  lines: QuoteLine[];
}

export const MOCK_RFQ_ID = "RFQ-2026-0042";
export const DEMO_REQUEST_ID = "ORD-2026-0142";
export const ACTIVE_ORDER_ID = DEMO_REQUEST_ID;
export const CATALOG_RFQ_SUPPLIER_IDS = ["cairo-dairy", "bean-barrel"] as const;

export function generateRfqId(): string {
  const rand =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID().replace(/-/g, "").slice(0, 8).toUpperCase()
      : Math.random().toString(36).slice(2, 10).toUpperCase();
  return `RFQ-${Date.now()}-${rand}`;
}

export const DEMO_ORDERS: OrderRecord[] = [
  {
    id: "ORD-2026-0138",
    title: "Weekly dairy & cups - Maadi",
    branchId: "maadi",
    neededBy: "2026-09-28",
    createdAt: "2026-09-24T10:00:00Z",
    stage: "approved",
    lineItemCount: 2,
    primarySupplierId: "cairo-dairy",
    fallbackSupplierId: "bean-barrel",
    rfqId: "RFQ-2026-0039",
  },
  {
    id: "ORD-2026-0140",
    title: "Espresso restock - Zamalek",
    branchId: "zamalek",
    neededBy: "2026-10-01",
    createdAt: "2026-09-29T14:30:00Z",
    stage: "approved",
    lineItemCount: 1,
    primarySupplierId: "bean-barrel",
    rfqId: "RFQ-2026-0040",
  },
  {
    id: "ORD-2026-0141",
    title: "Disposables top-up - New Cairo",
    branchId: "new-cairo",
    neededBy: "2026-10-05",
    createdAt: "2026-10-01T09:15:00Z",
    stage: "quotes_in",
    lineItemCount: 2,
    primarySupplierId: "nile-disposables",
    rfqId: "RFQ-2026-0041",
  },
];

export const ORDER_STAGE_LABELS: Record<OrderStage, string> = {
  draft: "Draft",
  rfq_sent: "RFQ sent",
  quotes_in: "Quotes in",
  recommended: "Recommended",
  approved: "Approved",
};

export const PIPELINE_STAGES: OrderStage[] = [
  "draft",
  "rfq_sent",
  "quotes_in",
  "recommended",
  "approved",
];

export function stageIndex(stage: OrderStage): number {
  return PIPELINE_STAGES.indexOf(stage);
}

export const MOCK_QUOTES: Quote[] = [
  {
    id: "Q-CDC-01",
    rfqId: MOCK_RFQ_ID,
    supplierId: "cairo-dairy",
    validUntil: "2026-10-10",
    lines: [
      {
        sku: "OAT-1L",
        name: "Oat milk 1L",
        qty: 48,
        unit: "carton",
        unitPrice: 42.5,
        currency: "EGP",
        moq: 24,
        leadDays: 1,
      },
      {
        sku: "CUP-8OZ",
        name: "Cup 8oz (per 1000)",
        qty: 4,
        unit: "case",
        unitPrice: 1180,
        currency: "EGP",
        moq: 2,
        leadDays: 2,
      },
      {
        sku: "ESP-1KG",
        name: "Espresso blend 1kg",
        qty: 2,
        unit: "bag",
        unitPrice: 890,
        currency: "EGP",
        leadDays: 4,
      },
    ],
  },
  {
    id: "Q-BB-01",
    rfqId: MOCK_RFQ_ID,
    supplierId: "bean-barrel",
    validUntil: "2026-10-09",
    lines: [
      {
        sku: "OAT-1L",
        name: "Oat milk 1L",
        qty: 48,
        unit: "carton",
        unitPrice: 44.0,
        currency: "EGP",
        leadDays: 2,
      },
      {
        sku: "CUP-8OZ",
        name: "Cup 8oz (per 1000)",
        qty: 4,
        unit: "case",
        unitPrice: 1240,
        currency: "EGP",
        leadDays: 3,
      },
      {
        sku: "ESP-1KG",
        name: "Espresso blend 1kg",
        qty: 2,
        unit: "bag",
        unitPrice: 820,
        currency: "EGP",
        leadDays: 2,
      },
    ],
  },
];

export const MOCK_QUOTE_REPLIES: Record<string, string> = {
  "cairo-dairy": `Thanks Layla - Cairo Dairy Co.
Oat milk 1L: EGP 42.50/carton (MOQ 24), delivery tomorrow.
Cups 8oz case of 1000: EGP 1,180 (MOQ 2 cases), 2 days.
Espresso blend 1kg: EGP 890/bag, 4 days lead.
Valid until Oct 10.`,
  "bean-barrel": `Bean & Barrel wholesale reply:
Oat 1L @ 44 EGP/carton, 2-day delivery.
Cups 8oz @ 1,240 EGP/case, 3 days.
House espresso 1kg @ 820 EGP, 2-day - we can ship to Zamalek Friday AM.
Quote valid to Oct 9.`,
};

export interface AuditEntry {
  id: string;
  at: string;
  message: string;
  approvedBy?: string;
}

export const INITIAL_AUDIT: AuditEntry[] = [
  {
    id: "aud-0",
    at: "2026-10-01T09:00:00Z",
    message: "Inventory snapshot loaded for Maison Layla (3 branches).",
  },
];

export function branchName(id: BranchId): string {
  return BRANCHES.find((b) => b.id === id)?.name ?? id;
}

export function supplierName(id: string): string {
  return SUPPLIERS.find((s) => s.id === id)?.name ?? id;
}
