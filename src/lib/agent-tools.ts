import {
  DEMO_REQUEST_ID,
  MOCK_QUOTES,
  MOCK_RFQ_ID,
  type LineItem,
  type Quote,
  supplierName,
} from "./mock-data";

export interface SendRfqInput {
  requestId: string;
  supplierIds: string[];
  lineItems: LineItem[];
  deliveryBranch: string;
  neededBy: string;
}

export interface SendRfqOutput {
  rfqId: string;
  messages: { supplierId: string; body: string }[];
  sentAt: string;
}

export interface ParseQuoteReplyInput {
  rfqId: string;
  supplierId: string;
  rawText: string;
}

export interface ParsedQuoteLine {
  sku: string;
  qty: number;
  unitPrice: number;
  currency: "EGP";
  moq?: number;
  leadDays: number;
}

export interface ParseQuoteReplyOutput {
  quoteId: string;
  lines: ParsedQuoteLine[];
  validUntil: string;
}

export interface CompareQuotesInput {
  requestId: string;
  quoteIds: string[];
}

export interface ComparisonCell {
  supplierId: string;
  unitPrice: number;
  leadDays: number;
  moq?: number;
  isBest?: boolean;
}

export interface ComparisonRow {
  sku: string;
  name: string;
  cells: ComparisonCell[];
}

export interface CompareQuotesOutput {
  comparisonId: string;
  matrix: ComparisonRow[];
  warnings: string[];
  metrics: Record<string, { bestSupplierId: string; bestUnitCost: number }>;
}

export interface RecommendInput {
  requestId: string;
  comparisonId: string;
  constraints?: { maxSuppliers?: number; preferLocal?: boolean };
}

export interface Allocation {
  sku: string;
  supplierId: string;
  qty: number;
  rationale: string;
}

export interface RecommendOutput {
  recommendationId: string;
  allocations: Allocation[];
  summary: string;
  confidence: number;
  savingsEgp?: number;
}

export interface UpdateInventoryInput {
  requestId: string;
  recommendationId: string;
  approvedBy: string;
  allocations?: Allocation[];
}

export interface InventoryDelta {
  branchId: string;
  sku: string;
  delta: number;
  newQty: number;
}

export interface UpdateInventoryOutput {
  inventoryDeltas: InventoryDelta[];
  auditLogId: string;
}

function findQuote(supplierId: string): Quote | undefined {
  return MOCK_QUOTES.find((q) => q.supplierId === supplierId);
}

export function sendRfq(input: SendRfqInput): SendRfqOutput {
  const sentAt = new Date().toISOString();
  const linesText = input.lineItems
    .map((l) => `• ${l.name} × ${l.qty} ${l.unit} (${l.branchId})`)
    .join("\n");

  const messages = input.supplierIds.map((supplierId) => ({
    supplierId,
    body: `Hi ${supplierName(supplierId)},\n\nRFQ ${MOCK_RFQ_ID} from Maison Layla.\nNeeded by: ${input.neededBy}\nPrimary delivery: ${input.deliveryBranch}\n\n${linesText}\n\nPlease reply with unit pricing, MOQ, and lead time.\n\n— Mr.Bill (on behalf of Layla)`,
  }));

  return {
    rfqId: MOCK_RFQ_ID,
    messages,
    sentAt,
  };
}

export function parseQuoteReply(
  input: ParseQuoteReplyInput,
): ParseQuoteReplyOutput {
  const quote = findQuote(input.supplierId);
  if (!quote) {
    throw new Error(`No mock quote for supplier ${input.supplierId}`);
  }

  return {
    quoteId: quote.id,
    lines: quote.lines.map((l) => ({
      sku: l.sku,
      qty: l.qty,
      unitPrice: l.unitPrice,
      currency: l.currency,
      moq: l.moq,
      leadDays: l.leadDays,
    })),
    validUntil: quote.validUntil,
  };
}

export function compareQuotes(input: CompareQuotesInput): CompareQuotesOutput {
  const quotes = MOCK_QUOTES.filter((q) => input.quoteIds.includes(q.id));
  const skus = new Set<string>();
  quotes.forEach((q) => q.lines.forEach((l) => skus.add(l.sku)));

  const warnings: string[] = [];
  const metrics: Record<string, { bestSupplierId: string; bestUnitCost: number }> =
    {};

  const matrix: ComparisonRow[] = [];

  for (const sku of skus) {
    const name =
      quotes.find((q) => q.lines.some((l) => l.sku === sku))?.lines.find(
        (l) => l.sku === sku,
      )?.name ?? sku;

    const cells: ComparisonCell[] = quotes.map((q) => {
      const line = q.lines.find((l) => l.sku === sku);
      if (!line) {
        warnings.push(`${supplierName(q.supplierId)} missing line for ${sku}`);
        return {
          supplierId: q.supplierId,
          unitPrice: Infinity,
          leadDays: 99,
        };
      }
      if (line.moq && line.qty < line.moq) {
        warnings.push(
          `${supplierName(q.supplierId)}: ${sku} below MOQ ${line.moq}`,
        );
      }
      return {
        supplierId: q.supplierId,
        unitPrice: line.unitPrice,
        leadDays: line.leadDays,
        moq: line.moq,
      };
    });

    const finite = cells.filter((c) => Number.isFinite(c.unitPrice));
    const best = finite.reduce((a, b) =>
      a.unitPrice <= b.unitPrice ? a : b,
    );
    metrics[sku] = {
      bestSupplierId: best.supplierId,
      bestUnitCost: best.unitPrice,
    };

    matrix.push({
      sku,
      name,
      cells: cells.map((c) => ({
        ...c,
        isBest: c.supplierId === best.supplierId && Number.isFinite(c.unitPrice),
      })),
    });
  }

  return {
    comparisonId: `CMP-${input.requestId}`,
    matrix,
    warnings,
    metrics,
  };
}

function quoteUnitPrice(supplierId: string, sku: string): number {
  const quote = MOCK_QUOTES.find((q) => q.supplierId === supplierId);
  const line = quote?.lines.find((l) => l.sku === sku);
  return line?.unitPrice ?? 0;
}

export function recommend(
  input: RecommendInput,
  comparison?: CompareQuotesOutput,
  lineItems?: LineItem[],
): RecommendOutput {
  const items = lineItems ?? [];
  const comp =
    comparison ??
    compareQuotes({
      requestId: input.requestId,
      quoteIds: MOCK_QUOTES.map((q) => q.id),
    });

  const allocations: Allocation[] = items.map((item) => {
    const best = comp.metrics[item.sku];
    const supplierId = best?.bestSupplierId ?? "cairo-dairy";
    const price = best?.bestUnitCost ?? quoteUnitPrice(supplierId, item.sku);
    return {
      sku: item.sku,
      supplierId,
      qty: item.qty,
      rationale: `Best unit cost EGP ${price} from ${supplierName(supplierId)}.`,
    };
  });

  if (allocations.length === 0) {
    allocations.push(
      {
        sku: "OAT-1L",
        supplierId: "cairo-dairy",
        qty: 48,
        rationale:
          "Lowest landed cost (EGP 42.50/carton) with next-day delivery.",
      },
      {
        sku: "CUP-8OZ",
        supplierId: "cairo-dairy",
        qty: 4,
        rationale: "MOQ bundle with dairy order; beats Nile on unit cost.",
      },
      {
        sku: "ESP-1KG",
        supplierId: "bean-barrel",
        qty: 2,
        rationale: "2-day lead to Zamalek; EGP 820/kg vs 890 from Cairo Dairy.",
      },
    );
  }

  const primarySupplier = allocations[0]?.supplierId ?? "cairo-dairy";
  const splitCost = allocations.reduce(
    (sum, a) => sum + a.qty * quoteUnitPrice(a.supplierId, a.sku),
    0,
  );
  const singleSupplierCost = allocations.reduce(
    (sum, a) => sum + a.qty * quoteUnitPrice(primarySupplier, a.sku),
    0,
  );
  const savingsEgp = Math.max(0, Math.round(singleSupplierCost - splitCost));

  const fallbackSupplier =
    primarySupplier === "cairo-dairy" ? "bean-barrel" : "cairo-dairy";

  const summary = `Split order: ${allocations
    .map(
      (a) =>
        `${a.sku} from ${supplierName(a.supplierId)} (${a.qty} units)`,
    )
    .join("; ")}. Saves ~EGP ${savingsEgp} vs ordering everything from ${supplierName(primarySupplier)}. Fallback if ${supplierName(primarySupplier)} declines: re-run with ${supplierName(fallbackSupplier)} on espresso/cups lines.`;

  return {
    recommendationId: `REC-${input.requestId}-01`,
    allocations,
    summary,
    confidence: 0.92,
    savingsEgp,
  };
}

export function updateInventory(
  input: UpdateInventoryInput,
  current: { branchId: string; sku: string; qty: number }[],
  lineItems?: LineItem[],
): UpdateInventoryOutput {
  const branchBySku = new Map(
    (lineItems ?? []).map((l) => [l.sku, l.branchId]),
  );

  const deltas: { branchId: string; sku: string; delta: number }[] =
    input.allocations && input.allocations.length > 0
      ? input.allocations.map((a) => ({
          branchId: branchBySku.get(a.sku) ?? "maadi",
          sku: a.sku,
          delta: a.qty,
        }))
      : [
          { branchId: "maadi", sku: "OAT-1L", delta: 48 },
          { branchId: "maadi", sku: "CUP-8OZ", delta: 4 },
          { branchId: "zamalek", sku: "ESP-1KG", delta: 2 },
        ];

  const inventoryDeltas: InventoryDelta[] = deltas.map((d) => {
    const row = current.find(
      (r) => r.branchId === d.branchId && r.sku === d.sku,
    );
    const prev = row?.qty ?? 0;
    return {
      branchId: d.branchId,
      sku: d.sku,
      delta: d.delta,
      newQty: prev + d.delta,
    };
  });

  return {
    inventoryDeltas,
    auditLogId: `AUD-${input.recommendationId}-LAYLA`,
  };
}

export const ACTIVE_REQUEST_ID = DEMO_REQUEST_ID;
